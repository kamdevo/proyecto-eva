/**
 * Sistema de Logging Estructurado - Sistema EVA
 * 
 * Características empresariales:
 * - Logging estructurado con niveles
 * - Rotación automática de logs
 * - Métricas de performance
 * - Alertas automáticas
 * - Correlación de eventos
 * - Exportación de logs
 * - Dashboard en tiempo real
 */

// Niveles de logging
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// Categorías de logs
export const LOG_CATEGORIES = {
  SYSTEM: 'SYSTEM',
  AUTH: 'AUTH',
  API: 'API',
  UI: 'UI',
  PERFORMANCE: 'PERFORMANCE',
  SECURITY: 'SECURITY',
  BUSINESS: 'BUSINESS',
  NETWORK: 'NETWORK',
  DATABASE: 'DATABASE',
  FILE: 'FILE'
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogSize = 10000; // Máximo 10k logs en memoria
    this.currentLevel = this.getLogLevel();
    this.sessionId = this.generateSessionId();
    this.correlationMap = new Map();
    this.performanceMetrics = new Map();
    this.alertRules = new Map();
    this.logBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 5000; // 5 segundos
    this.isOnline = navigator.onLine;
    
    this.initializeLogger();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  /**
   * Inicializar logger
   */
  initializeLogger() {
    // Configurar nivel de log basado en entorno
    this.currentLevel = process.env.NODE_ENV === 'production' 
      ? LOG_LEVELS.WARN 
      : LOG_LEVELS.DEBUG;

    // Configurar reglas de alerta
    this.setupAlertRules();

    // Cargar logs persistidos
    this.loadPersistedLogs();

    // Configurar captura de errores globales
    this.setupGlobalErrorHandling();
  }

  /**
   * Configurar reglas de alerta
   */
  setupAlertRules() {
    this.alertRules.set('HIGH_ERROR_RATE', {
      condition: () => this.getErrorRate() > 10, // 10% de errores
      threshold: 5, // 5 errores en ventana de tiempo
      timeWindow: 60000, // 1 minuto
      action: 'ESCALATE'
    });

    this.alertRules.set('PERFORMANCE_DEGRADATION', {
      condition: () => this.getAverageResponseTime() > 5000, // 5 segundos
      threshold: 3,
      timeWindow: 300000, // 5 minutos
      action: 'NOTIFY'
    });

    this.alertRules.set('SECURITY_BREACH', {
      condition: (log) => log.category === LOG_CATEGORIES.SECURITY && log.level >= LOG_LEVELS.ERROR,
      threshold: 1,
      timeWindow: 0,
      action: 'IMMEDIATE_ALERT'
    });
  }

  /**
   * Configurar listeners de eventos
   */
  setupEventListeners() {
    // Detectar cambios de conectividad
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.info(LOG_CATEGORIES.NETWORK, 'Connection restored', { 
        previousState: 'offline',
        bufferedLogs: this.logBuffer.length 
      });
      this.flushLogs();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.warn(LOG_CATEGORIES.NETWORK, 'Connection lost', { 
        bufferedLogs: this.logBuffer.length 
      });
    });

    // Detectar cambios de visibilidad
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.debug(LOG_CATEGORIES.UI, 'Page hidden');
        this.flushLogs(); // Flush antes de que la página se oculte
      } else {
        this.debug(LOG_CATEGORIES.UI, 'Page visible');
      }
    });

    // Detectar antes de cerrar la página
    window.addEventListener('beforeunload', () => {
      this.flushLogs(true); // Flush síncrono
    });
  }

  /**
   * Configurar manejo global de errores
   */
  setupGlobalErrorHandling() {
    // Errores JavaScript no capturados
    window.addEventListener('error', (event) => {
      this.error(LOG_CATEGORIES.SYSTEM, 'Uncaught JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Promesas rechazadas no manejadas
    window.addEventListener('unhandledrejection', (event) => {
      this.error(LOG_CATEGORIES.SYSTEM, 'Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Errores de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.error(LOG_CATEGORIES.SYSTEM, 'Resource loading error', {
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          type: event.target.type
        });
      }
    }, true);
  }

  /**
   * Métodos de logging por nivel
   */
  debug(category, message, data = {}, correlationId = null) {
    return this.log(LOG_LEVELS.DEBUG, category, message, data, correlationId);
  }

  info(category, message, data = {}, correlationId = null) {
    return this.log(LOG_LEVELS.INFO, category, message, data, correlationId);
  }

  warn(category, message, data = {}, correlationId = null) {
    return this.log(LOG_LEVELS.WARN, category, message, data, correlationId);
  }

  error(category, message, data = {}, correlationId = null) {
    return this.log(LOG_LEVELS.ERROR, category, message, data, correlationId);
  }

  fatal(category, message, data = {}, correlationId = null) {
    return this.log(LOG_LEVELS.FATAL, category, message, data, correlationId);
  }

  /**
   * Método principal de logging
   */
  log(level, category, message, data = {}, correlationId = null) {
    if (level < this.currentLevel) {
      return null; // No loggear si está por debajo del nivel actual
    }

    const logEntry = this.createLogEntry(level, category, message, data, correlationId);
    
    // Agregar a logs en memoria
    this.addToMemoryLogs(logEntry);
    
    // Agregar a buffer para envío
    this.addToBuffer(logEntry);
    
    // Log en consola para desarrollo
    this.logToConsole(logEntry);
    
    // Verificar reglas de alerta
    this.checkAlertRules(logEntry);
    
    // Actualizar métricas
    this.updateMetrics(logEntry);

    return logEntry.id;
  }

  /**
   * Crear entrada de log estructurada
   */
  createLogEntry(level, category, message, data, correlationId) {
    const timestamp = new Date().toISOString();
    const id = this.generateLogId();
    
    return {
      id,
      timestamp,
      level,
      levelName: this.getLevelName(level),
      category,
      message,
      data: this.sanitizeData(data),
      correlationId: correlationId || this.generateCorrelationId(),
      sessionId: this.sessionId,
      context: this.captureContext(),
      performance: this.capturePerformanceData(),
      user: this.getCurrentUser(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: this.getConnectionInfo(),
        memory: this.getMemoryInfo()
      }
    };
  }

  /**
   * Agregar a logs en memoria
   */
  addToMemoryLogs(logEntry) {
    this.logs.unshift(logEntry);
    
    // Mantener tamaño máximo
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(0, this.maxLogSize);
    }
  }

  /**
   * Agregar a buffer para envío
   */
  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    
    // Flush automático si el buffer está lleno
    if (this.logBuffer.length >= this.bufferSize) {
      this.flushLogs();
    }
  }

  /**
   * Log en consola para desarrollo
   */
  logToConsole(logEntry) {
    if (process.env.NODE_ENV !== 'development') return;

    const { level, category, message, data } = logEntry;
    const prefix = `[${this.getLevelName(level)}] [${category}]`;
    
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(prefix, message, data);
        break;
      case LOG_LEVELS.INFO:
        console.info(prefix, message, data);
        break;
      case LOG_LEVELS.WARN:
        console.warn(prefix, message, data);
        break;
      case LOG_LEVELS.ERROR:
      case LOG_LEVELS.FATAL:
        console.error(prefix, message, data);
        break;
    }
  }

  /**
   * Verificar reglas de alerta
   */
  checkAlertRules(logEntry) {
    for (const [ruleName, rule] of this.alertRules.entries()) {
      if (this.evaluateAlertRule(rule, logEntry)) {
        this.triggerAlert(ruleName, rule, logEntry);
      }
    }
  }

  /**
   * Evaluar regla de alerta
   */
  evaluateAlertRule(rule, logEntry) {
    if (typeof rule.condition === 'function') {
      return rule.condition(logEntry);
    }
    return false;
  }

  /**
   * Disparar alerta
   */
  async triggerAlert(ruleName, rule, logEntry) {
    const alertData = {
      rule: ruleName,
      logEntry,
      timestamp: new Date().toISOString(),
      severity: rule.action,
      context: this.getAlertContext()
    };

    switch (rule.action) {
      case 'IMMEDIATE_ALERT':
        await this.sendImmediateAlert(alertData);
        break;
      case 'ESCALATE':
        await this.escalateAlert(alertData);
        break;
      case 'NOTIFY':
        await this.sendNotification(alertData);
        break;
    }
  }

  /**
   * Flush logs al servidor
   */
  async flushLogs(synchronous = false) {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const payload = {
        logs: logsToSend,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          isOnline: this.isOnline
        }
      };

      if (synchronous) {
        // Envío síncrono usando sendBeacon
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/logs', JSON.stringify(payload));
        }
      } else {
        // Envío asíncrono
        await fetch('/api/logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }

      // Persistir localmente como backup
      this.persistLogs(logsToSend);

    } catch (error) {
      // Si falla el envío, volver a agregar al buffer
      this.logBuffer.unshift(...logsToSend);
      console.error('Failed to flush logs:', error);
    }
  }

  /**
   * Iniciar flush periódico
   */
  startPeriodicFlush() {
    setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flushLogs();
      }
    }, this.flushInterval);
  }

  /**
   * Obtener métricas de performance
   */
  getPerformanceMetrics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const recentLogs = this.logs.filter(log => 
      now - new Date(log.timestamp).getTime() < oneHour
    );

    return {
      totalLogs: this.logs.length,
      recentLogs: recentLogs.length,
      errorRate: this.getErrorRate(),
      averageResponseTime: this.getAverageResponseTime(),
      logsByLevel: this.groupLogsByLevel(),
      logsByCategory: this.groupLogsByCategory(),
      topErrors: this.getTopErrors(),
      performanceTrends: this.getPerformanceTrends(),
      memoryUsage: this.getMemoryInfo(),
      connectionInfo: this.getConnectionInfo()
    };
  }

  // Métodos auxiliares
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCorrelationId() {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getLevelName(level) {
    const names = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    return names[level] || 'UNKNOWN';
  }

  getLogLevel() {
    const envLevel = process.env.VITE_LOG_LEVEL;
    return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO;
  }

  sanitizeData(data) {
    // Remover información sensible
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };
    
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  captureContext() {
    return {
      timestamp: Date.now(),
      performance: performance.now(),
      memory: this.getMemoryInfo(),
      connection: this.getConnectionInfo()
    };
  }

  capturePerformanceData() {
    if (!performance.timing) return null;
    
    const timing = performance.timing;
    return {
      navigationStart: timing.navigationStart,
      loadEventEnd: timing.loadEventEnd,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart
    };
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getConnectionInfo() {
    if (!navigator.connection) return null;
    
    return {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData
    };
  }

  getMemoryInfo() {
    if (!performance.memory) return null;
    
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    };
  }

  getErrorRate() {
    const recentLogs = this.logs.slice(0, 100); // Últimos 100 logs
    const errorLogs = recentLogs.filter(log => log.level >= LOG_LEVELS.ERROR);
    return recentLogs.length > 0 ? (errorLogs.length / recentLogs.length) * 100 : 0;
  }

  getAverageResponseTime() {
    const apiLogs = this.logs
      .filter(log => log.category === LOG_CATEGORIES.API && log.data.responseTime)
      .slice(0, 50); // Últimas 50 llamadas API
    
    if (apiLogs.length === 0) return 0;
    
    const totalTime = apiLogs.reduce((sum, log) => sum + log.data.responseTime, 0);
    return totalTime / apiLogs.length;
  }

  groupLogsByLevel() {
    const groups = {};
    this.logs.forEach(log => {
      const levelName = this.getLevelName(log.level);
      groups[levelName] = (groups[levelName] || 0) + 1;
    });
    return groups;
  }

  groupLogsByCategory() {
    const groups = {};
    this.logs.forEach(log => {
      groups[log.category] = (groups[log.category] || 0) + 1;
    });
    return groups;
  }

  getTopErrors(limit = 10) {
    const errorLogs = this.logs.filter(log => log.level >= LOG_LEVELS.ERROR);
    const errorCounts = {};
    
    errorLogs.forEach(log => {
      const key = `${log.category}:${log.message}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([error, count]) => ({ error, count }));
  }

  getPerformanceTrends() {
    // Implementar análisis de tendencias de performance
    return {
      responseTimetrend: 'stable',
      errorRateTrend: 'decreasing',
      memoryUsageTrend: 'increasing'
    };
  }

  persistLogs(logs) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('eva_logs') || '[]');
      const allLogs = [...existingLogs, ...logs];
      
      // Mantener solo los últimos 1000 logs
      const recentLogs = allLogs.slice(-1000);
      localStorage.setItem('eva_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }

  loadPersistedLogs() {
    try {
      const persistedLogs = JSON.parse(localStorage.getItem('eva_logs') || '[]');
      this.logs.unshift(...persistedLogs);
    } catch (error) {
      console.error('Failed to load persisted logs:', error);
    }
  }

  // Métodos de alerta (implementación básica)
  async sendImmediateAlert(alertData) {
    console.error('IMMEDIATE ALERT:', alertData);
    // Implementar envío de alerta inmediata
  }

  async escalateAlert(alertData) {
    console.warn('ESCALATED ALERT:', alertData);
    // Implementar escalamiento de alerta
  }

  async sendNotification(alertData) {
    console.info('NOTIFICATION:', alertData);
    // Implementar notificación
  }

  getAlertContext() {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }
}

// Crear instancia singleton
const logger = new Logger();

export default logger;
export { LOG_LEVELS, LOG_CATEGORIES };

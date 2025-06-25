/**
 * Circuit Breaker Pattern - Sistema EVA
 * 
 * Implementa el patrón Circuit Breaker para mejorar la resilencia
 * del sistema ante fallos de servicios externos.
 * 
 * Estados:
 * - CLOSED: Funcionamiento normal
 * - OPEN: Servicio bloqueado por fallos
 * - HALF_OPEN: Probando si el servicio se recuperó
 */

import logger, { LOG_CATEGORIES } from './logger.js';

// Estados del Circuit Breaker
export const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

// Configuración por defecto
const DEFAULT_CONFIG = {
  failureThreshold: 5,        // Número de fallos para abrir el circuito
  successThreshold: 3,        // Número de éxitos para cerrar el circuito
  timeout: 60000,            // Tiempo en estado OPEN (1 minuto)
  monitoringPeriod: 10000,   // Período de monitoreo (10 segundos)
  expectedErrors: [          // Errores que no cuentan como fallos
    'ValidationError',
    'AuthenticationError'
  ]
};

class CircuitBreaker {
  constructor(name, config = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Estado del circuito
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    
    // Métricas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      averageResponseTime: 0,
      lastExecutionTime: null
    };
    
    // Historial de ejecuciones
    this.executionHistory = [];
    this.maxHistorySize = 100;
    
    // Callbacks
    this.onStateChange = null;
    this.onFailure = null;
    this.onSuccess = null;
    
    this.initializeMonitoring();
  }

  /**
   * Ejecutar función con Circuit Breaker
   */
  async execute(fn, ...args) {
    const startTime = Date.now();
    
    // Verificar si el circuito permite la ejecución
    if (!this.canExecute()) {
      this.recordRejection();
      throw new CircuitBreakerError(
        `Circuit breaker is ${this.state} for ${this.name}`,
        'CIRCUIT_BREAKER_OPEN'
      );
    }

    try {
      // Ejecutar función
      const result = await fn(...args);
      
      // Registrar éxito
      this.recordSuccess(Date.now() - startTime);
      
      return result;
      
    } catch (error) {
      // Registrar fallo
      this.recordFailure(error, Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Verificar si el circuito puede ejecutar
   */
  canExecute() {
    switch (this.state) {
      case CIRCUIT_STATES.CLOSED:
        return true;
        
      case CIRCUIT_STATES.OPEN:
        // Verificar si es tiempo de intentar recuperación
        if (this.shouldAttemptReset()) {
          this.moveToHalfOpen();
          return true;
        }
        return false;
        
      case CIRCUIT_STATES.HALF_OPEN:
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Registrar ejecución exitosa
   */
  recordSuccess(responseTime) {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.metrics.lastExecutionTime = Date.now();
    this.updateAverageResponseTime(responseTime);
    
    this.lastSuccessTime = Date.now();
    
    // Manejar según estado actual
    switch (this.state) {
      case CIRCUIT_STATES.HALF_OPEN:
        this.successCount++;
        if (this.successCount >= this.config.successThreshold) {
          this.moveToClosed();
        }
        break;
        
      case CIRCUIT_STATES.CLOSED:
        // Reset failure count en éxito
        this.failureCount = 0;
        break;
    }
    
    this.addToHistory('SUCCESS', responseTime);
    
    if (this.onSuccess) {
      this.onSuccess(this.getMetrics());
    }
    
    logger.debug(LOG_CATEGORIES.SYSTEM, `Circuit breaker success: ${this.name}`, {
      state: this.state,
      responseTime,
      successCount: this.successCount
    });
  }

  /**
   * Registrar fallo de ejecución
   */
  recordFailure(error, responseTime) {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.lastExecutionTime = Date.now();
    this.updateAverageResponseTime(responseTime);
    
    // Verificar si es un error esperado
    if (this.isExpectedError(error)) {
      this.addToHistory('EXPECTED_ERROR', responseTime, error.message);
      return;
    }
    
    this.lastFailureTime = Date.now();
    this.failureCount++;
    
    // Manejar según estado actual
    switch (this.state) {
      case CIRCUIT_STATES.CLOSED:
        if (this.failureCount >= this.config.failureThreshold) {
          this.moveToOpen();
        }
        break;
        
      case CIRCUIT_STATES.HALF_OPEN:
        this.moveToOpen();
        break;
    }
    
    this.addToHistory('FAILURE', responseTime, error.message);
    
    if (this.onFailure) {
      this.onFailure(error, this.getMetrics());
    }
    
    logger.warn(LOG_CATEGORIES.SYSTEM, `Circuit breaker failure: ${this.name}`, {
      state: this.state,
      error: error.message,
      failureCount: this.failureCount,
      responseTime
    });
  }

  /**
   * Registrar rechazo por circuito abierto
   */
  recordRejection() {
    this.metrics.rejectedRequests++;
    this.addToHistory('REJECTED', 0, 'Circuit breaker open');
    
    logger.warn(LOG_CATEGORIES.SYSTEM, `Circuit breaker rejection: ${this.name}`, {
      state: this.state,
      rejectedRequests: this.metrics.rejectedRequests
    });
  }

  /**
   * Mover a estado CLOSED
   */
  moveToClosed() {
    const previousState = this.state;
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    
    this.notifyStateChange(previousState, CIRCUIT_STATES.CLOSED);
    
    logger.info(LOG_CATEGORIES.SYSTEM, `Circuit breaker closed: ${this.name}`, {
      previousState,
      currentState: this.state
    });
  }

  /**
   * Mover a estado OPEN
   */
  moveToOpen() {
    const previousState = this.state;
    this.state = CIRCUIT_STATES.OPEN;
    this.successCount = 0;
    
    this.notifyStateChange(previousState, CIRCUIT_STATES.OPEN);
    
    logger.error(LOG_CATEGORIES.SYSTEM, `Circuit breaker opened: ${this.name}`, {
      previousState,
      currentState: this.state,
      failureCount: this.failureCount,
      threshold: this.config.failureThreshold
    });
  }

  /**
   * Mover a estado HALF_OPEN
   */
  moveToHalfOpen() {
    const previousState = this.state;
    this.state = CIRCUIT_STATES.HALF_OPEN;
    this.successCount = 0;
    
    this.notifyStateChange(previousState, CIRCUIT_STATES.HALF_OPEN);
    
    logger.info(LOG_CATEGORIES.SYSTEM, `Circuit breaker half-open: ${this.name}`, {
      previousState,
      currentState: this.state
    });
  }

  /**
   * Verificar si debe intentar reset
   */
  shouldAttemptReset() {
    if (!this.lastFailureTime) return false;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= this.config.timeout;
  }

  /**
   * Verificar si es un error esperado
   */
  isExpectedError(error) {
    return this.config.expectedErrors.some(expectedError => 
      error.name === expectedError || 
      error.constructor.name === expectedError ||
      error.message.includes(expectedError)
    );
  }

  /**
   * Actualizar tiempo promedio de respuesta
   */
  updateAverageResponseTime(responseTime) {
    const totalRequests = this.metrics.totalRequests;
    const currentAverage = this.metrics.averageResponseTime;
    
    this.metrics.averageResponseTime = 
      ((currentAverage * (totalRequests - 1)) + responseTime) / totalRequests;
  }

  /**
   * Agregar al historial
   */
  addToHistory(type, responseTime, details = null) {
    const entry = {
      timestamp: Date.now(),
      type,
      responseTime,
      details,
      state: this.state
    };
    
    this.executionHistory.unshift(entry);
    
    // Mantener tamaño máximo
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Notificar cambio de estado
   */
  notifyStateChange(previousState, newState) {
    if (this.onStateChange) {
      this.onStateChange(previousState, newState, this.getMetrics());
    }
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics() {
    const now = Date.now();
    const recentHistory = this.executionHistory.filter(
      entry => now - entry.timestamp < this.config.monitoringPeriod
    );
    
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      metrics: { ...this.metrics },
      recentActivity: {
        total: recentHistory.length,
        successes: recentHistory.filter(e => e.type === 'SUCCESS').length,
        failures: recentHistory.filter(e => e.type === 'FAILURE').length,
        rejections: recentHistory.filter(e => e.type === 'REJECTED').length
      },
      config: { ...this.config }
    };
  }

  /**
   * Obtener estado de salud
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const successRate = metrics.metrics.totalRequests > 0 
      ? (metrics.metrics.successfulRequests / metrics.metrics.totalRequests) * 100 
      : 100;
    
    let status = 'HEALTHY';
    if (this.state === CIRCUIT_STATES.OPEN) {
      status = 'UNHEALTHY';
    } else if (this.state === CIRCUIT_STATES.HALF_OPEN || successRate < 90) {
      status = 'DEGRADED';
    }
    
    return {
      status,
      state: this.state,
      successRate: successRate.toFixed(2),
      averageResponseTime: metrics.metrics.averageResponseTime.toFixed(2),
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * Resetear métricas
   */
  reset() {
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      averageResponseTime: 0,
      lastExecutionTime: null
    };
    
    this.executionHistory = [];
    
    logger.info(LOG_CATEGORIES.SYSTEM, `Circuit breaker reset: ${this.name}`);
  }

  /**
   * Inicializar monitoreo
   */
  initializeMonitoring() {
    // Monitoreo periódico para limpieza y métricas
    setInterval(() => {
      this.cleanupHistory();
      this.logPeriodicMetrics();
    }, this.config.monitoringPeriod);
  }

  /**
   * Limpiar historial antiguo
   */
  cleanupHistory() {
    const cutoffTime = Date.now() - (this.config.monitoringPeriod * 10); // 10 períodos
    this.executionHistory = this.executionHistory.filter(
      entry => entry.timestamp > cutoffTime
    );
  }

  /**
   * Log de métricas periódicas
   */
  logPeriodicMetrics() {
    if (this.metrics.totalRequests > 0) {
      logger.debug(LOG_CATEGORIES.PERFORMANCE, `Circuit breaker metrics: ${this.name}`, 
        this.getMetrics()
      );
    }
  }
}

/**
 * Error personalizado para Circuit Breaker
 */
class CircuitBreakerError extends Error {
  constructor(message, code = 'CIRCUIT_BREAKER_ERROR') {
    super(message);
    this.name = 'CircuitBreakerError';
    this.code = code;
  }
}

/**
 * Manager para múltiples Circuit Breakers
 */
class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
  }

  /**
   * Crear o obtener Circuit Breaker
   */
  getBreaker(name, config = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config));
    }
    return this.breakers.get(name);
  }

  /**
   * Obtener métricas de todos los breakers
   */
  getAllMetrics() {
    const metrics = {};
    for (const [name, breaker] of this.breakers.entries()) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }

  /**
   * Obtener estado de salud de todos los breakers
   */
  getHealthStatus() {
    const status = {};
    for (const [name, breaker] of this.breakers.entries()) {
      status[name] = breaker.getHealthStatus();
    }
    return status;
  }

  /**
   * Resetear todos los breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// Instancia singleton del manager
const circuitBreakerManager = new CircuitBreakerManager();

export default circuitBreakerManager;
export { CircuitBreaker, CircuitBreakerError, CIRCUIT_STATES };

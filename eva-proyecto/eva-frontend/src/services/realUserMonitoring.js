/**
 * Real User Monitoring (RUM) - Sistema EVA
 * 
 * Características:
 * - Monitoreo de performance en tiempo real
 * - Core Web Vitals tracking
 * - User experience metrics
 * - Network performance monitoring
 * - Error tracking y crash reporting
 * - Session recording y heatmaps
 * - Alertas automáticas
 */

import logger, { LOG_CATEGORIES } from '../utils/logger.js';
import websocketManager from './websocketManager.js';

// Tipos de métricas
export const METRIC_TYPES = {
  PERFORMANCE: 'performance',
  USER_INTERACTION: 'user_interaction',
  NETWORK: 'network',
  ERROR: 'error',
  BUSINESS: 'business',
  VITALS: 'vitals'
};

// Umbrales de alertas
export const ALERT_THRESHOLDS = {
  LCP: 2500,        // Largest Contentful Paint
  FID: 100,         // First Input Delay
  CLS: 0.1,         // Cumulative Layout Shift
  TTFB: 600,        // Time to First Byte
  ERROR_RATE: 1,    // Porcentaje de errores
  RESPONSE_TIME: 200 // Tiempo de respuesta API
};

class RealUserMonitoring {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    this.isActive = true;
    
    // Métricas acumuladas
    this.metrics = {
      performance: [],
      interactions: [],
      errors: [],
      vitals: {},
      network: [],
      business: []
    };
    
    // Observers
    this.performanceObserver = null;
    this.intersectionObserver = null;
    this.mutationObserver = null;
    
    // Configuración
    this.config = {
      sampleRate: 1.0,              // 100% sampling por defecto
      batchSize: 50,                // Enviar métricas en lotes
      flushInterval: 30000,         // Flush cada 30 segundos
      enableHeatmaps: true,
      enableSessionRecording: false, // Por privacidad
      enableCrashReporting: true,
      endpoint: '/api/rum/metrics'
    };
    
    // Buffer de métricas
    this.metricsBuffer = [];
    this.lastFlush = Date.now();

    this.initializeRUM();
  }

  /**
   * Inicializar RUM
   */
  initializeRUM() {
    if (!this.shouldSample()) {
      logger.debug(LOG_CATEGORIES.PERFORMANCE, 'RUM sampling skipped');
      return;
    }

    logger.info(LOG_CATEGORIES.PERFORMANCE, 'Initializing Real User Monitoring', {
      sessionId: this.sessionId,
      userId: this.userId
    });

    // Configurar observers
    this.setupPerformanceObserver();
    this.setupIntersectionObserver();
    this.setupMutationObserver();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Iniciar monitoreo de Core Web Vitals
    this.startVitalsMonitoring();
    
    // Configurar flush periódico
    this.startPeriodicFlush();
    
    // Monitorear errores globales
    this.setupErrorMonitoring();
    
    // Monitorear performance de red
    this.setupNetworkMonitoring();
    
    // Capturar métricas iniciales
    this.captureInitialMetrics();
  }

  /**
   * Configurar Performance Observer
   */
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.processPerformanceEntry(entry);
      });
    });

    try {
      this.performanceObserver.observe({
        entryTypes: ['navigation', 'resource', 'measure', 'paint']
      });
    } catch (error) {
      logger.error(LOG_CATEGORIES.PERFORMANCE, 'Failed to setup PerformanceObserver', {
        error: error.message
      });
    }
  }

  /**
   * Procesar entrada de performance
   */
  processPerformanceEntry(entry) {
    const metric = {
      type: METRIC_TYPES.PERFORMANCE,
      entryType: entry.entryType,
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    // Agregar datos específicos según tipo
    switch (entry.entryType) {
      case 'navigation':
        metric.data = this.extractNavigationData(entry);
        break;
      case 'resource':
        metric.data = this.extractResourceData(entry);
        break;
      case 'paint':
        metric.data = this.extractPaintData(entry);
        break;
      case 'measure':
        metric.data = this.extractMeasureData(entry);
        break;
    }

    this.addMetric(metric);
    this.checkAlertThresholds(metric);
  }

  /**
   * Extraer datos de navegación
   */
  extractNavigationData(entry) {
    return {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      firstByte: entry.responseStart - entry.requestStart,
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnect: entry.connectEnd - entry.connectStart,
      sslHandshake: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      redirect: entry.redirectEnd - entry.redirectStart,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize
    };
  }

  /**
   * Extraer datos de recursos
   */
  extractResourceData(entry) {
    return {
      initiatorType: entry.initiatorType,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      responseTime: entry.responseEnd - entry.responseStart,
      fromCache: entry.transferSize === 0 && entry.decodedBodySize > 0,
      protocol: entry.nextHopProtocol,
      redirectTime: entry.redirectEnd - entry.redirectStart
    };
  }

  /**
   * Monitorear Core Web Vitals
   */
  startVitalsMonitoring() {
    // LCP (Largest Contentful Paint)
    this.observeLCP();
    
    // FID (First Input Delay)
    this.observeFID();
    
    // CLS (Cumulative Layout Shift)
    this.observeCLS();
    
    // TTFB (Time to First Byte)
    this.observeTTFB();
  }

  /**
   * Observar LCP
   */
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      const metric = {
        type: METRIC_TYPES.VITALS,
        name: 'LCP',
        value: lastEntry.startTime,
        rating: this.getRating('LCP', lastEntry.startTime),
        element: lastEntry.element?.tagName || 'unknown',
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId
      };
      
      this.metrics.vitals.lcp = metric;
      this.addMetric(metric);
      this.checkVitalAlert('LCP', lastEntry.startTime);
      
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  }

  /**
   * Observar FID
   */
  observeFID() {
    if (!('PerformanceObserver' in window)) return;

    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const fidValue = entry.processingStart - entry.startTime;
        
        const metric = {
          type: METRIC_TYPES.VITALS,
          name: 'FID',
          value: fidValue,
          rating: this.getRating('FID', fidValue),
          eventType: entry.name,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId
        };
        
        this.metrics.vitals.fid = metric;
        this.addMetric(metric);
        this.checkVitalAlert('FID', fidValue);
      });
    }).observe({ entryTypes: ['first-input'] });
  }

  /**
   * Observar CLS
   */
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];

    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            
            const metric = {
              type: METRIC_TYPES.VITALS,
              name: 'CLS',
              value: clsValue,
              rating: this.getRating('CLS', clsValue),
              entries: sessionEntries.length,
              timestamp: Date.now(),
              sessionId: this.sessionId,
              userId: this.userId
            };
            
            this.metrics.vitals.cls = metric;
            this.addMetric(metric);
            this.checkVitalAlert('CLS', clsValue);
          }
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Configurar monitoreo de interacciones
   */
  setupEventListeners() {
    // Clicks
    document.addEventListener('click', (event) => {
      this.trackInteraction('click', event);
    });

    // Scroll
    let scrollTimeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction('scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX
        });
      }, 100);
    });

    // Resize
    window.addEventListener('resize', () => {
      this.trackInteraction('resize', {
        width: window.innerWidth,
        height: window.innerHeight
      });
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.trackInteraction('visibility', {
        hidden: document.hidden
      });
    });

    // Page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics(true);
    });
  }

  /**
   * Trackear interacción del usuario
   */
  trackInteraction(type, data) {
    const metric = {
      type: METRIC_TYPES.USER_INTERACTION,
      interactionType: type,
      data: this.sanitizeInteractionData(data),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.addMetric(metric);
  }

  /**
   * Sanitizar datos de interacción
   */
  sanitizeInteractionData(data) {
    if (data instanceof Event) {
      return {
        type: data.type,
        target: data.target?.tagName || 'unknown',
        targetId: data.target?.id || null,
        targetClass: data.target?.className || null,
        clientX: data.clientX || null,
        clientY: data.clientY || null
      };
    }
    
    return data;
  }

  /**
   * Configurar monitoreo de errores
   */
  setupErrorMonitoring() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'promise_rejection',
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Resource errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError({
          type: 'resource',
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          message: 'Resource failed to load'
        });
      }
    }, true);
  }

  /**
   * Trackear error
   */
  trackError(errorData) {
    const metric = {
      type: METRIC_TYPES.ERROR,
      error: errorData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.addMetric(metric);
    this.checkErrorRateAlert();
  }

  /**
   * Configurar monitoreo de red
   */
  setupNetworkMonitoring() {
    // Monitorear connection info
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const trackConnection = () => {
        const metric = {
          type: METRIC_TYPES.NETWORK,
          connectionType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userId: this.userId
        };
        
        this.addMetric(metric);
      };

      // Track initial state
      trackConnection();
      
      // Track changes
      connection.addEventListener('change', trackConnection);
    }

    // Monitorear online/offline
    window.addEventListener('online', () => {
      this.trackNetworkEvent('online');
    });

    window.addEventListener('offline', () => {
      this.trackNetworkEvent('offline');
    });
  }

  /**
   * Trackear evento de red
   */
  trackNetworkEvent(eventType) {
    const metric = {
      type: METRIC_TYPES.NETWORK,
      event: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.addMetric(metric);
  }

  /**
   * Capturar métricas iniciales
   */
  captureInitialMetrics() {
    const metric = {
      type: METRIC_TYPES.PERFORMANCE,
      name: 'session_start',
      data: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
        url: window.location.href
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.addMetric(metric);
  }

  /**
   * Agregar métrica al buffer
   */
  addMetric(metric) {
    this.metricsBuffer.push(metric);
    
    // Flush si el buffer está lleno
    if (this.metricsBuffer.length >= this.config.batchSize) {
      this.flushMetrics();
    }
  }

  /**
   * Flush periódico de métricas
   */
  startPeriodicFlush() {
    setInterval(() => {
      if (this.metricsBuffer.length > 0) {
        this.flushMetrics();
      }
    }, this.config.flushInterval);
  }

  /**
   * Enviar métricas al servidor
   */
  async flushMetrics(synchronous = false) {
    if (this.metricsBuffer.length === 0) return;

    const metricsToSend = [...this.metricsBuffer];
    this.metricsBuffer = [];
    this.lastFlush = Date.now();

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      metrics: metricsToSend,
      timestamp: Date.now(),
      flushReason: synchronous ? 'beforeunload' : 'periodic'
    };

    try {
      if (synchronous && navigator.sendBeacon) {
        // Envío síncrono para beforeunload
        navigator.sendBeacon(this.config.endpoint, JSON.stringify(payload));
      } else {
        // Envío asíncrono normal
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      logger.debug(LOG_CATEGORIES.PERFORMANCE, 'RUM metrics flushed', {
        count: metricsToSend.length,
        synchronous
      });

    } catch (error) {
      // Volver a agregar métricas al buffer si falla
      this.metricsBuffer.unshift(...metricsToSend);
      
      logger.error(LOG_CATEGORIES.PERFORMANCE, 'Failed to flush RUM metrics', {
        error: error.message,
        count: metricsToSend.length
      });
    }
  }

  /**
   * Verificar umbrales de alerta
   */
  checkAlertThresholds(metric) {
    // Implementar lógica de alertas específica
    if (metric.type === METRIC_TYPES.PERFORMANCE && metric.entryType === 'navigation') {
      const ttfb = metric.data.firstByte;
      if (ttfb > ALERT_THRESHOLDS.TTFB) {
        this.sendAlert('TTFB_HIGH', { value: ttfb, threshold: ALERT_THRESHOLDS.TTFB });
      }
    }
  }

  /**
   * Verificar alertas de Core Web Vitals
   */
  checkVitalAlert(vitalName, value) {
    const threshold = ALERT_THRESHOLDS[vitalName];
    if (threshold && value > threshold) {
      this.sendAlert(`${vitalName}_POOR`, { value, threshold });
    }
  }

  /**
   * Verificar alerta de tasa de errores
   */
  checkErrorRateAlert() {
    const errorMetrics = this.metricsBuffer.filter(m => m.type === METRIC_TYPES.ERROR);
    const totalMetrics = this.metricsBuffer.length;
    
    if (totalMetrics > 10) { // Solo verificar si hay suficientes métricas
      const errorRate = (errorMetrics.length / totalMetrics) * 100;
      
      if (errorRate > ALERT_THRESHOLDS.ERROR_RATE) {
        this.sendAlert('ERROR_RATE_HIGH', { 
          errorRate: errorRate.toFixed(2), 
          threshold: ALERT_THRESHOLDS.ERROR_RATE 
        });
      }
    }
  }

  /**
   * Enviar alerta
   */
  sendAlert(alertType, data) {
    const alert = {
      type: 'RUM_ALERT',
      alertType,
      data,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href
    };

    // Enviar vía WebSocket si está disponible
    if (websocketManager.state === 'CONNECTED') {
      websocketManager.send(alert, { type: 'alert' });
    }

    logger.warn(LOG_CATEGORIES.PERFORMANCE, 'RUM alert triggered', alert);
  }

  /**
   * Obtener rating para Core Web Vitals
   */
  getRating(vital, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[vital];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Métodos auxiliares
  shouldSample() {
    return Math.random() < this.config.sampleRate;
  }

  generateSessionId() {
    return `rum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Obtener métricas actuales
   */
  getCurrentMetrics() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      vitals: this.metrics.vitals,
      bufferedMetrics: this.metricsBuffer.length,
      lastFlush: this.lastFlush,
      isActive: this.isActive
    };
  }

  /**
   * Detener monitoreo
   */
  stop() {
    this.isActive = false;
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Flush final
    this.flushMetrics(true);
    
    logger.info(LOG_CATEGORIES.PERFORMANCE, 'RUM monitoring stopped');
  }
}

// Instancia singleton
const realUserMonitoring = new RealUserMonitoring();

export default realUserMonitoring;
export { METRIC_TYPES, ALERT_THRESHOLDS };

/**
 * Cliente HTTP configurado para el sistema EVA
 * Maneja autenticación, interceptores, reintentos y manejo de errores
 */

import axios from 'axios';
import { API_CONFIG, SANCTUM_CONFIG, DEV_CONFIG } from '../config/api.js';
import circuitBreakerManager from '../utils/circuitBreaker.js';
import smartCache from '../utils/smartCache.js';
import logger, { LOG_CATEGORIES } from '../utils/logger.js';
import connectionPool from './connectionPool.js';
import realUserMonitoring, { METRIC_TYPES } from './realUserMonitoring.js';

// Crear instancia de Axios
const httpClient = axios.create({
  baseURL: API_CONFIG.API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  withCredentials: true, // Importante para Sanctum
});

// Estado de autenticación
let isRefreshing = false;
let failedQueue = [];

// Función para procesar cola de peticiones fallidas
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor de peticiones con Pool de Conexiones, Circuit Breaker y Cache
httpClient.interceptors.request.use(
  async (config) => {
    const startTime = performance.now();

    // Generar clave de cache
    const cacheKey = generateCacheKey(config);
    config.metadata = {
      cacheKey,
      startTime,
      correlationId: generateCorrelationId(),
      requestId: generateRequestId()
    };

    // Trackear request en RUM
    realUserMonitoring.trackInteraction('api_request', {
      url: config.url,
      method: config.method,
      correlationId: config.metadata.correlationId
    });

    // Verificar cache para peticiones GET
    if (config.method?.toLowerCase() === 'get' && !config.skipCache) {
      try {
        const cachedResponse = await smartCache.get(cacheKey);
        if (cachedResponse) {
          logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Cache hit for request', {
            url: config.url,
            cacheKey,
            correlationId: config.metadata.correlationId
          });

          // Simular respuesta desde cache
          return Promise.reject({
            isFromCache: true,
            data: cachedResponse,
            config
          });
        }
      } catch (cacheError) {
        logger.warn(LOG_CATEGORIES.PERFORMANCE, 'Cache read error', {
          error: cacheError.message,
          cacheKey
        });
      }
    }

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar CSRF token si existe
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Agregar headers de correlación y monitoreo
    config.headers['X-Correlation-ID'] = config.metadata.correlationId;
    config.headers['X-Request-ID'] = generateRequestId();
    config.headers['X-Client-Version'] = process.env.VITE_APP_VERSION || '1.0.0';
    config.headers['X-Request-Start'] = startTime.toString();

    // Log de peticiones
    logger.debug(LOG_CATEGORIES.API, 'HTTP Request initiated', {
      method: config.method?.toUpperCase(),
      url: config.url,
      correlationId: config.metadata.correlationId,
      cacheKey: config.metadata.cacheKey,
      hasAuth: !!token
    });

    return config;
  },
  (error) => {
    logger.error(LOG_CATEGORIES.API, 'Request interceptor error', {
      error: error.message,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Interceptor de respuestas con Circuit Breaker y Cache
httpClient.interceptors.response.use(
  async (response) => {
    const endTime = performance.now();
    const config = response.config;
    const responseTime = endTime - (config.metadata?.startTime || endTime);

    // Obtener Circuit Breaker para este endpoint
    const breakerKey = getCircuitBreakerKey(config);
    const circuitBreaker = circuitBreakerManager.getBreaker(breakerKey, {
      failureThreshold: 5,
      timeout: 60000,
      expectedErrors: ['ValidationError', 'AuthenticationError']
    });

    // Registrar éxito en Circuit Breaker
    await circuitBreaker.execute(async () => {
      return response;
    });

    // Guardar en cache si es una petición GET exitosa
    if (config.method?.toLowerCase() === 'get' &&
      response.status >= 200 &&
      response.status < 300 &&
      !config.skipCache) {

      try {
        const cacheKey = config.metadata?.cacheKey;
        if (cacheKey) {
          const ttl = getCacheTTL(config.url);
          await smartCache.set(cacheKey, response.data, { ttl });

          logger.debug(LOG_CATEGORIES.PERFORMANCE, 'Response cached', {
            url: config.url,
            cacheKey,
            ttl,
            responseTime
          });
        }
      } catch (cacheError) {
        logger.warn(LOG_CATEGORIES.PERFORMANCE, 'Cache write error', {
          error: cacheError.message,
          url: config.url
        });
      }
    }

    // Agregar headers de performance
    response.headers['x-response-time'] = `${responseTime.toFixed(2)}ms`;
    response.headers['x-correlation-id'] = config.metadata?.correlationId;

    // Log de respuesta exitosa
    logger.info(LOG_CATEGORIES.API, 'HTTP Response received', {
      status: response.status,
      url: config.url,
      method: config.method?.toUpperCase(),
      responseTime: responseTime.toFixed(2),
      correlationId: config.metadata?.correlationId,
      cached: false
    });

    return response;
  },
  async (error) => {
    // Manejar respuestas desde cache
    if (error.isFromCache) {
      const mockResponse = {
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {
          'x-from-cache': 'true',
          'x-correlation-id': error.config.metadata?.correlationId
        },
        config: error.config
      };

      logger.info(LOG_CATEGORIES.API, 'Response served from cache', {
        url: error.config.url,
        correlationId: error.config.metadata?.correlationId
      });

      return mockResponse;
    }

    const originalRequest = error.config;
    const endTime = performance.now();
    const responseTime = endTime - (originalRequest?.metadata?.startTime || endTime);

    // Registrar fallo en Circuit Breaker
    if (originalRequest) {
      const breakerKey = getCircuitBreakerKey(originalRequest);
      const circuitBreaker = circuitBreakerManager.getBreaker(breakerKey);

      try {
        await circuitBreaker.execute(async () => {
          throw error; // Esto registrará el fallo
        });
      } catch (breakerError) {
        // El Circuit Breaker ya registró el fallo
      }
    }

    // Log detallado del error
    logger.error(LOG_CATEGORIES.API, 'HTTP Request failed', {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      message: error.message,
      responseTime: responseTime.toFixed(2),
      correlationId: originalRequest?.metadata?.correlationId,
      data: error.response?.data,
      stack: error.stack
    });

    // Manejo de error 401 (No autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando el token, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return httpClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await httpClient.post('/auth/refresh', {
            refresh_token: refreshToken
          });

          const { token } = response.data.data;
          localStorage.setItem('auth_token', token);

          // Actualizar header de autorización
          httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          processQueue(null, token);
          return httpClient(originalRequest);
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Limpiar tokens y redirigir al login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');

        // Emitir evento de logout
        window.dispatchEvent(new CustomEvent('auth:logout'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejo de error 419 (CSRF Token Mismatch)
    if (error.response?.status === 419) {
      try {
        await refreshCsrfToken();
        return httpClient(originalRequest);
      } catch (csrfError) {
        console.error('Error refreshing CSRF token:', csrfError);
      }
    }

    // Manejo de errores de red
    if (!error.response) {
      const networkError = new Error('Error de conexión. Verifique su conexión a internet.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

// Función para obtener CSRF token
const getCsrfToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  return token || localStorage.getItem('csrf_token');
};

// Función para refrescar CSRF token
const refreshCsrfToken = async () => {
  try {
    await axios.get(SANCTUM_CONFIG.CSRF_COOKIE_URL, {
      withCredentials: true,
    });

    // El token CSRF se establece automáticamente en las cookies
    return true;
  } catch (error) {
    console.error('Error refreshing CSRF token:', error);
    throw error;
  }
};

// Función para configurar autenticación
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('auth_token');
    delete httpClient.defaults.headers.common['Authorization'];
  }
};

// Función para limpiar autenticación
export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  delete httpClient.defaults.headers.common['Authorization'];
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

// Función para obtener datos del usuario
export const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

// Función para reintentar peticiones con backoff exponencial
export const retryRequest = async (requestFn, maxRetries = API_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // No reintentar errores 4xx (excepto 429 - Too Many Requests)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      // Calcular delay con backoff exponencial
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Función para cancelar peticiones
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Función para verificar si un error es de cancelación
export const isCancel = (error) => {
  return axios.isCancel(error);
};

// Funciones auxiliares para Circuit Breaker y Cache

/**
 * Generar clave de cache para una petición
 */
function generateCacheKey(config) {
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  const method = config.method?.toLowerCase() || 'get';

  // Solo cachear peticiones GET
  if (method !== 'get') return null;

  return `http_cache:${method}:${url}:${btoa(params)}`;
}

/**
 * Generar ID de correlación
 */
function generateCorrelationId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generar ID de petición
 */
function generateRequestId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtener clave de Circuit Breaker para un endpoint
 */
function getCircuitBreakerKey(config) {
  const url = new URL(config.url, config.baseURL || API_CONFIG.API_URL);
  const pathname = url.pathname;

  // Agrupar por patrón de endpoint
  const patterns = [
    { pattern: /\/api\/equipos/, key: 'equipos' },
    { pattern: /\/api\/mantenimiento/, key: 'mantenimiento' },
    { pattern: /\/api\/calibracion/, key: 'calibracion' },
    { pattern: /\/api\/contingencias/, key: 'contingencias' },
    { pattern: /\/api\/usuarios/, key: 'usuarios' },
    { pattern: /\/api\/auth/, key: 'auth' },
    { pattern: /\/api\/export/, key: 'export' },
    { pattern: /\/api\/files/, key: 'files' }
  ];

  for (const { pattern, key } of patterns) {
    if (pattern.test(pathname)) {
      return key;
    }
  }

  return 'default';
}

/**
 * Obtener TTL de cache según la URL
 */
function getCacheTTL(url) {
  // TTL específico por tipo de endpoint
  const ttlMap = {
    '/api/equipos': 5 * 60 * 1000,        // 5 minutos
    '/api/mantenimiento': 2 * 60 * 1000,  // 2 minutos
    '/api/calibracion': 5 * 60 * 1000,    // 5 minutos
    '/api/contingencias': 1 * 60 * 1000,  // 1 minuto (más dinámico)
    '/api/usuarios': 10 * 60 * 1000,      // 10 minutos
    '/api/servicios': 30 * 60 * 1000,     // 30 minutos (más estático)
    '/api/areas': 30 * 60 * 1000,         // 30 minutos
    '/api/dashboard': 1 * 60 * 1000,      // 1 minuto
  };

  for (const [pattern, ttl] of Object.entries(ttlMap)) {
    if (url.includes(pattern)) {
      return ttl;
    }
  }

  return 5 * 60 * 1000; // 5 minutos por defecto
}

/**
 * Función mejorada para reintentar peticiones con Circuit Breaker
 */
export const retryRequestWithCircuitBreaker = async (requestFn, options = {}) => {
  const {
    maxRetries = API_CONFIG.RETRY_ATTEMPTS,
    baseDelay = API_CONFIG.RETRY_DELAY,
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // No reintentar errores 4xx (excepto 429)
      if (error.response?.status >= 400 &&
        error.response?.status < 500 &&
        error.response?.status !== 429) {
        throw error;
      }

      // No reintentar si Circuit Breaker está abierto
      if (error.code === 'CIRCUIT_BREAKER_OPEN') {
        throw error;
      }

      // Calcular delay con backoff exponencial y jitter
      let delay = baseDelay * Math.pow(backoffFactor, attempt);
      if (jitter) {
        delay += Math.random() * 1000; // Agregar hasta 1 segundo de jitter
      }
      delay = Math.min(delay, maxDelay);

      if (attempt < maxRetries - 1) {
        logger.warn(LOG_CATEGORIES.API, 'Request retry scheduled', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: error.message
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Función para invalidar cache por patrón
 */
export const invalidateCache = async (pattern) => {
  try {
    // Esta función debería implementarse en smartCache
    logger.info(LOG_CATEGORIES.PERFORMANCE, 'Cache invalidation requested', { pattern });

    // Por ahora, limpiar todo el cache
    await smartCache.clear();

    return true;
  } catch (error) {
    logger.error(LOG_CATEGORIES.PERFORMANCE, 'Cache invalidation failed', {
      pattern,
      error: error.message
    });
    return false;
  }
};

/**
 * Función para obtener métricas de HTTP
 */
export const getHttpMetrics = () => {
  return {
    cache: smartCache.getMetrics(),
    circuitBreakers: circuitBreakerManager.getAllMetrics(),
    health: circuitBreakerManager.getHealthStatus()
  };
};

/**
 * Ejecutar request usando pool de conexiones empresarial
 */
export const executeWithConnectionPool = async (requestConfig, options = {}) => {
  const {
    usePool = true,
    timeout = 10000,
    priority = 'normal'
  } = options;

  if (!usePool) {
    return await httpClient(requestConfig);
  }

  return await connectionPool.executeRequest(async (connection) => {
    // Configurar request con endpoint de la conexión
    const config = {
      ...requestConfig,
      baseURL: connection.endpoint,
      timeout,
      metadata: {
        ...requestConfig.metadata,
        connectionId: connection.id,
        priority
      }
    };

    // Ejecutar request con axios
    const response = await httpClient(config);

    // Trackear métricas de performance
    const responseTime = performance.now() - (config.metadata?.startTime || 0);
    realUserMonitoring.addMetric({
      type: METRIC_TYPES.NETWORK,
      name: 'api_response',
      data: {
        url: config.url,
        method: config.method,
        status: response.status,
        responseTime,
        connectionId: connection.id,
        fromCache: response.headers['x-from-cache'] === 'true'
      },
      timestamp: Date.now()
    });

    return response;
  }, options);
};

/**
 * Función para requests de alta prioridad
 */
export const executeHighPriorityRequest = async (requestConfig, options = {}) => {
  return await executeWithConnectionPool(requestConfig, {
    ...options,
    priority: 'critical',
    timeout: 5000,
    maxRetries: 5
  });
};

/**
 * Función para requests en lote
 */
export const executeBatchRequests = async (requests, options = {}) => {
  const {
    batchSize = 5,
    delayBetweenBatches = 100
  } = options;

  const results = [];

  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);

    const batchPromises = batch.map(request =>
      executeWithConnectionPool(request, options).catch(error => ({ error }))
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Delay entre lotes para no sobrecargar
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
};

// Inicializar CSRF token al cargar
if (typeof window !== 'undefined') {
  refreshCsrfToken().catch(console.error);
}

export default httpClient;

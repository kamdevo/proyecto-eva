/**
 * Sistema de Pool de Conexiones Empresarial - EVA
 * 
 * Características:
 * - Pool de conexiones con balanceador de carga
 * - Múltiples endpoints con failover automático
 * - Health checks cada 30 segundos
 * - Reconexión automática con backoff exponencial
 * - Routing inteligente basado en latencia
 * - Heartbeat/keepalive para detectar conexiones perdidas
 */

import logger, { LOG_CATEGORIES } from '../utils/logger.js';
import smartCache from '../utils/smartCache.js';

// Estados de conexión
export const CONNECTION_STATES = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  UNHEALTHY: 'UNHEALTHY',
  OFFLINE: 'OFFLINE'
};

// Estrategias de balanceeo
export const LOAD_BALANCE_STRATEGIES = {
  ROUND_ROBIN: 'ROUND_ROBIN',
  LEAST_CONNECTIONS: 'LEAST_CONNECTIONS',
  FASTEST_RESPONSE: 'FASTEST_RESPONSE',
  WEIGHTED: 'WEIGHTED'
};

class ConnectionPool {
  constructor(config = {}) {
    this.config = {
      // Endpoints múltiples con prioridades
      endpoints: [
        { 
          url: 'http://localhost:8000', 
          priority: 1, 
          weight: 100,
          maxConnections: 10,
          timeout: 5000
        },
        { 
          url: 'http://localhost:8001', 
          priority: 2, 
          weight: 80,
          maxConnections: 8,
          timeout: 5000
        },
        { 
          url: 'http://localhost:8002', 
          priority: 3, 
          weight: 60,
          maxConnections: 6,
          timeout: 5000
        }
      ],
      
      // Configuración del pool
      maxPoolSize: 20,
      minPoolSize: 5,
      connectionTimeout: 5000,
      idleTimeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      
      // Health checks
      healthCheckInterval: 30000,
      healthCheckTimeout: 3000,
      healthCheckPath: '/api/health',
      
      // Balanceador
      strategy: LOAD_BALANCE_STRATEGIES.FASTEST_RESPONSE,
      
      // Heartbeat
      heartbeatInterval: 10000,
      heartbeatTimeout: 2000,
      
      ...config
    };

    // Estado del pool
    this.connections = new Map();
    this.endpointStats = new Map();
    this.activeConnections = 0;
    this.roundRobinIndex = 0;
    
    // Métricas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      connectionErrors: 0,
      failovers: 0,
      lastHealthCheck: null
    };

    this.initializePool();
  }

  /**
   * Inicializar pool de conexiones
   */
  async initializePool() {
    logger.info(LOG_CATEGORIES.NETWORK, 'Initializing connection pool', {
      endpoints: this.config.endpoints.length,
      maxPoolSize: this.config.maxPoolSize,
      strategy: this.config.strategy
    });

    // Inicializar estadísticas de endpoints
    for (const endpoint of this.config.endpoints) {
      this.endpointStats.set(endpoint.url, {
        state: CONNECTION_STATES.OFFLINE,
        responseTime: Infinity,
        successRate: 0,
        activeConnections: 0,
        totalRequests: 0,
        successfulRequests: 0,
        lastHealthCheck: null,
        consecutiveFailures: 0,
        weight: endpoint.weight
      });
    }

    // Crear conexiones iniciales
    await this.createInitialConnections();
    
    // Iniciar health checks
    this.startHealthChecks();
    
    // Iniciar heartbeat
    this.startHeartbeat();
    
    // Configurar limpieza automática
    this.startConnectionCleanup();

    logger.info(LOG_CATEGORIES.NETWORK, 'Connection pool initialized successfully');
  }

  /**
   * Crear conexiones iniciales
   */
  async createInitialConnections() {
    const promises = [];
    
    for (const endpoint of this.config.endpoints) {
      // Crear conexiones mínimas por endpoint
      const connectionsPerEndpoint = Math.ceil(this.config.minPoolSize / this.config.endpoints.length);
      
      for (let i = 0; i < connectionsPerEndpoint; i++) {
        promises.push(this.createConnection(endpoint));
      }
    }

    try {
      await Promise.allSettled(promises);
      logger.info(LOG_CATEGORIES.NETWORK, 'Initial connections created', {
        totalConnections: this.activeConnections
      });
    } catch (error) {
      logger.error(LOG_CATEGORIES.NETWORK, 'Failed to create initial connections', {
        error: error.message
      });
    }
  }

  /**
   * Crear nueva conexión
   */
  async createConnection(endpoint) {
    const connectionId = this.generateConnectionId();
    
    try {
      const connection = {
        id: connectionId,
        endpoint: endpoint.url,
        state: CONNECTION_STATES.OFFLINE,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        requestCount: 0,
        isIdle: true,
        abortController: new AbortController()
      };

      // Probar conectividad
      const isHealthy = await this.testConnection(endpoint, connection.abortController.signal);
      
      if (isHealthy) {
        connection.state = CONNECTION_STATES.HEALTHY;
        this.connections.set(connectionId, connection);
        this.activeConnections++;
        
        // Actualizar estadísticas del endpoint
        const stats = this.endpointStats.get(endpoint.url);
        stats.activeConnections++;
        stats.state = CONNECTION_STATES.HEALTHY;
        
        logger.debug(LOG_CATEGORIES.NETWORK, 'Connection created successfully', {
          connectionId,
          endpoint: endpoint.url
        });
        
        return connection;
      } else {
        throw new Error('Connection health check failed');
      }
    } catch (error) {
      logger.error(LOG_CATEGORIES.NETWORK, 'Failed to create connection', {
        connectionId,
        endpoint: endpoint.url,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtener conexión óptima según estrategia
   */
  async getConnection() {
    let connection = null;
    
    switch (this.config.strategy) {
      case LOAD_BALANCE_STRATEGIES.ROUND_ROBIN:
        connection = this.getRoundRobinConnection();
        break;
        
      case LOAD_BALANCE_STRATEGIES.LEAST_CONNECTIONS:
        connection = this.getLeastConnectionsConnection();
        break;
        
      case LOAD_BALANCE_STRATEGIES.FASTEST_RESPONSE:
        connection = this.getFastestResponseConnection();
        break;
        
      case LOAD_BALANCE_STRATEGIES.WEIGHTED:
        connection = this.getWeightedConnection();
        break;
        
      default:
        connection = this.getFastestResponseConnection();
    }

    if (!connection) {
      // Intentar crear nueva conexión si el pool no está lleno
      if (this.activeConnections < this.config.maxPoolSize) {
        connection = await this.createConnectionFromHealthyEndpoint();
      }
      
      if (!connection) {
        throw new Error('No healthy connections available');
      }
    }

    // Marcar conexión como en uso
    connection.isIdle = false;
    connection.lastUsed = Date.now();
    connection.requestCount++;

    return connection;
  }

  /**
   * Estrategia Round Robin
   */
  getRoundRobinConnection() {
    const healthyConnections = Array.from(this.connections.values())
      .filter(conn => conn.state === CONNECTION_STATES.HEALTHY && conn.isIdle);
    
    if (healthyConnections.length === 0) return null;
    
    const connection = healthyConnections[this.roundRobinIndex % healthyConnections.length];
    this.roundRobinIndex++;
    
    return connection;
  }

  /**
   * Estrategia Least Connections
   */
  getLeastConnectionsConnection() {
    const endpointConnections = new Map();
    
    // Contar conexiones activas por endpoint
    for (const connection of this.connections.values()) {
      if (connection.state === CONNECTION_STATES.HEALTHY) {
        const count = endpointConnections.get(connection.endpoint) || 0;
        endpointConnections.set(connection.endpoint, count + (connection.isIdle ? 0 : 1));
      }
    }
    
    // Encontrar endpoint con menos conexiones activas
    let minConnections = Infinity;
    let selectedEndpoint = null;
    
    for (const [endpoint, activeCount] of endpointConnections.entries()) {
      if (activeCount < minConnections) {
        minConnections = activeCount;
        selectedEndpoint = endpoint;
      }
    }
    
    if (!selectedEndpoint) return null;
    
    // Obtener conexión idle de ese endpoint
    return Array.from(this.connections.values())
      .find(conn => 
        conn.endpoint === selectedEndpoint && 
        conn.state === CONNECTION_STATES.HEALTHY && 
        conn.isIdle
      );
  }

  /**
   * Estrategia Fastest Response
   */
  getFastestResponseConnection() {
    let fastestEndpoint = null;
    let fastestTime = Infinity;
    
    // Encontrar endpoint más rápido
    for (const [endpoint, stats] of this.endpointStats.entries()) {
      if (stats.state === CONNECTION_STATES.HEALTHY && stats.responseTime < fastestTime) {
        fastestTime = stats.responseTime;
        fastestEndpoint = endpoint;
      }
    }
    
    if (!fastestEndpoint) return null;
    
    // Obtener conexión idle del endpoint más rápido
    return Array.from(this.connections.values())
      .find(conn => 
        conn.endpoint === fastestEndpoint && 
        conn.state === CONNECTION_STATES.HEALTHY && 
        conn.isIdle
      );
  }

  /**
   * Estrategia Weighted
   */
  getWeightedConnection() {
    const weightedEndpoints = [];
    
    // Crear array ponderado
    for (const [endpoint, stats] of this.endpointStats.entries()) {
      if (stats.state === CONNECTION_STATES.HEALTHY) {
        for (let i = 0; i < stats.weight; i++) {
          weightedEndpoints.push(endpoint);
        }
      }
    }
    
    if (weightedEndpoints.length === 0) return null;
    
    // Seleccionar endpoint aleatoriamente basado en peso
    const selectedEndpoint = weightedEndpoints[Math.floor(Math.random() * weightedEndpoints.length)];
    
    // Obtener conexión idle del endpoint seleccionado
    return Array.from(this.connections.values())
      .find(conn => 
        conn.endpoint === selectedEndpoint && 
        conn.state === CONNECTION_STATES.HEALTHY && 
        conn.isIdle
      );
  }

  /**
   * Liberar conexión después del uso
   */
  releaseConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.isIdle = true;
      connection.lastUsed = Date.now();
      
      logger.debug(LOG_CATEGORIES.NETWORK, 'Connection released', {
        connectionId,
        endpoint: connection.endpoint
      });
    }
  }

  /**
   * Ejecutar request con pool de conexiones
   */
  async executeRequest(requestFn, options = {}) {
    const startTime = performance.now();
    let connection = null;
    let lastError = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        connection = await this.getConnection();
        
        // Ejecutar request
        const result = await requestFn(connection);
        
        // Actualizar métricas de éxito
        this.updateSuccessMetrics(connection, performance.now() - startTime);
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (connection) {
          // Marcar conexión como problemática
          await this.handleConnectionError(connection, error);
        }
        
        // Esperar antes del siguiente intento
        if (attempt < this.config.maxRetries - 1) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } finally {
        if (connection) {
          this.releaseConnection(connection.id);
        }
      }
    }
    
    // Actualizar métricas de fallo
    this.updateFailureMetrics(lastError);
    throw lastError;
  }

  /**
   * Probar conectividad de un endpoint
   */
  async testConnection(endpoint, signal) {
    try {
      const response = await fetch(`${endpoint.url}${this.config.healthCheckPath}`, {
        method: 'GET',
        signal,
        timeout: this.config.healthCheckTimeout
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Health checks automáticos
   */
  startHealthChecks() {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Realizar health checks en todos los endpoints
   */
  async performHealthChecks() {
    const promises = this.config.endpoints.map(endpoint => 
      this.checkEndpointHealth(endpoint)
    );
    
    await Promise.allSettled(promises);
    
    this.metrics.lastHealthCheck = Date.now();
    
    logger.debug(LOG_CATEGORIES.NETWORK, 'Health checks completed', {
      healthyEndpoints: Array.from(this.endpointStats.values())
        .filter(stats => stats.state === CONNECTION_STATES.HEALTHY).length,
      totalEndpoints: this.config.endpoints.length
    });
  }

  /**
   * Verificar salud de un endpoint específico
   */
  async checkEndpointHealth(endpoint) {
    const startTime = performance.now();
    const stats = this.endpointStats.get(endpoint.url);
    
    try {
      const isHealthy = await this.testConnection(endpoint);
      const responseTime = performance.now() - startTime;
      
      if (isHealthy) {
        stats.state = CONNECTION_STATES.HEALTHY;
        stats.responseTime = responseTime;
        stats.consecutiveFailures = 0;
        stats.lastHealthCheck = Date.now();
        
        // Crear conexiones adicionales si es necesario
        if (stats.activeConnections < endpoint.maxConnections) {
          await this.createConnection(endpoint);
        }
        
      } else {
        stats.consecutiveFailures++;
        
        if (stats.consecutiveFailures >= 3) {
          stats.state = CONNECTION_STATES.UNHEALTHY;
          await this.removeUnhealthyConnections(endpoint.url);
        } else {
          stats.state = CONNECTION_STATES.DEGRADED;
        }
      }
      
    } catch (error) {
      stats.state = CONNECTION_STATES.OFFLINE;
      stats.consecutiveFailures++;
      
      logger.error(LOG_CATEGORIES.NETWORK, 'Health check failed', {
        endpoint: endpoint.url,
        error: error.message
      });
    }
  }

  // Métodos auxiliares
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async createConnectionFromHealthyEndpoint() {
    const healthyEndpoints = this.config.endpoints.filter(endpoint => {
      const stats = this.endpointStats.get(endpoint.url);
      return stats.state === CONNECTION_STATES.HEALTHY;
    });
    
    if (healthyEndpoints.length === 0) return null;
    
    // Seleccionar endpoint con menos conexiones
    const selectedEndpoint = healthyEndpoints.reduce((min, endpoint) => {
      const minStats = this.endpointStats.get(min.url);
      const endpointStats = this.endpointStats.get(endpoint.url);
      return endpointStats.activeConnections < minStats.activeConnections ? endpoint : min;
    });
    
    return await this.createConnection(selectedEndpoint);
  }

  async handleConnectionError(connection, error) {
    connection.state = CONNECTION_STATES.UNHEALTHY;
    
    const stats = this.endpointStats.get(connection.endpoint);
    stats.consecutiveFailures++;
    
    if (stats.consecutiveFailures >= 3) {
      stats.state = CONNECTION_STATES.UNHEALTHY;
    }
    
    logger.warn(LOG_CATEGORIES.NETWORK, 'Connection error handled', {
      connectionId: connection.id,
      endpoint: connection.endpoint,
      error: error.message
    });
  }

  async removeUnhealthyConnections(endpoint) {
    const connectionsToRemove = Array.from(this.connections.entries())
      .filter(([id, conn]) => conn.endpoint === endpoint)
      .map(([id]) => id);
    
    for (const connectionId of connectionsToRemove) {
      this.connections.delete(connectionId);
      this.activeConnections--;
    }
    
    const stats = this.endpointStats.get(endpoint);
    stats.activeConnections = 0;
    
    logger.warn(LOG_CATEGORIES.NETWORK, 'Removed unhealthy connections', {
      endpoint,
      removedCount: connectionsToRemove.length
    });
  }

  updateSuccessMetrics(connection, responseTime) {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    
    // Actualizar tiempo promedio de respuesta
    const currentAvg = this.metrics.averageResponseTime;
    const totalRequests = this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      ((currentAvg * (totalRequests - 1)) + responseTime) / totalRequests;
    
    // Actualizar estadísticas del endpoint
    const stats = this.endpointStats.get(connection.endpoint);
    stats.totalRequests++;
    stats.successfulRequests++;
    stats.successRate = (stats.successfulRequests / stats.totalRequests) * 100;
    stats.responseTime = responseTime;
  }

  updateFailureMetrics(error) {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.connectionErrors++;
    
    logger.error(LOG_CATEGORIES.NETWORK, 'Request failed', {
      error: error.message,
      totalFailures: this.metrics.failedRequests
    });
  }

  startHeartbeat() {
    setInterval(async () => {
      await this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  async sendHeartbeat() {
    const promises = Array.from(this.connections.values())
      .filter(conn => conn.state === CONNECTION_STATES.HEALTHY)
      .map(conn => this.pingConnection(conn));
    
    await Promise.allSettled(promises);
  }

  async pingConnection(connection) {
    try {
      const response = await fetch(`${connection.endpoint}/api/ping`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(this.config.heartbeatTimeout)
      });
      
      if (!response.ok) {
        throw new Error(`Ping failed: ${response.status}`);
      }
      
    } catch (error) {
      await this.handleConnectionError(connection, error);
    }
  }

  startConnectionCleanup() {
    setInterval(() => {
      this.cleanupIdleConnections();
    }, 60000); // Cada minuto
  }

  cleanupIdleConnections() {
    const now = Date.now();
    const connectionsToRemove = [];
    
    for (const [id, connection] of this.connections.entries()) {
      const idleTime = now - connection.lastUsed;
      
      if (connection.isIdle && idleTime > this.config.idleTimeout) {
        connectionsToRemove.push(id);
      }
    }
    
    for (const id of connectionsToRemove) {
      const connection = this.connections.get(id);
      connection.abortController.abort();
      this.connections.delete(id);
      this.activeConnections--;
      
      const stats = this.endpointStats.get(connection.endpoint);
      stats.activeConnections--;
    }
    
    if (connectionsToRemove.length > 0) {
      logger.debug(LOG_CATEGORIES.NETWORK, 'Cleaned up idle connections', {
        removedCount: connectionsToRemove.length,
        activeConnections: this.activeConnections
      });
    }
  }

  /**
   * Obtener métricas del pool
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeConnections: this.activeConnections,
      endpointStats: Object.fromEntries(this.endpointStats),
      poolUtilization: (this.activeConnections / this.config.maxPoolSize) * 100,
      healthyEndpoints: Array.from(this.endpointStats.values())
        .filter(stats => stats.state === CONNECTION_STATES.HEALTHY).length
    };
  }

  /**
   * Obtener estado de salud del pool
   */
  getHealthStatus() {
    const healthyEndpoints = Array.from(this.endpointStats.values())
      .filter(stats => stats.state === CONNECTION_STATES.HEALTHY).length;
    
    const totalEndpoints = this.config.endpoints.length;
    const healthPercentage = (healthyEndpoints / totalEndpoints) * 100;
    
    let status = 'HEALTHY';
    if (healthPercentage < 100) status = 'DEGRADED';
    if (healthPercentage < 50) status = 'UNHEALTHY';
    if (healthPercentage === 0) status = 'OFFLINE';
    
    return {
      status,
      healthyEndpoints,
      totalEndpoints,
      healthPercentage: healthPercentage.toFixed(2),
      activeConnections: this.activeConnections,
      averageResponseTime: this.metrics.averageResponseTime.toFixed(2),
      successRate: this.metrics.totalRequests > 0 
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2)
        : '0.00'
    };
  }
}

// Instancia singleton del pool de conexiones
const connectionPool = new ConnectionPool();

export default connectionPool;
export { ConnectionPool, CONNECTION_STATES, LOAD_BALANCE_STRATEGIES };

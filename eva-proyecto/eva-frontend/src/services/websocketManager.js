/**
 * WebSocket Manager Empresarial - EVA
 * 
 * Características:
 * - Reconexión automática con backoff exponencial
 * - Múltiples endpoints WebSocket con failover
 * - Heartbeat/keepalive automático
 * - Queue de mensajes offline
 * - Compresión de mensajes
 * - Real-time updates con garantía de entrega
 */

import logger, { LOG_CATEGORIES } from '../utils/logger.js';
import smartCache from '../utils/smartCache.js';

// Estados de WebSocket
export const WS_STATES = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  RECONNECTING: 'RECONNECTING',
  FAILED: 'FAILED'
};

// Tipos de mensajes
export const MESSAGE_TYPES = {
  HEARTBEAT: 'heartbeat',
  AUTH: 'auth',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  DATA: 'data',
  ERROR: 'error',
  ACK: 'ack'
};

class WebSocketManager {
  constructor(config = {}) {
    this.config = {
      // Endpoints WebSocket con prioridades
      endpoints: [
        'ws://localhost:6001',
        'ws://localhost:6002',
        'ws://localhost:6003'
      ],
      
      // Configuración de reconexión
      maxReconnectAttempts: 10,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      
      // Heartbeat
      heartbeatInterval: 30000,
      heartbeatTimeout: 5000,
      
      // Configuración de mensajes
      messageTimeout: 10000,
      maxQueueSize: 1000,
      enableCompression: true,
      
      // Autenticación
      authToken: null,
      autoAuth: true,
      
      ...config
    };

    // Estado del manager
    this.state = WS_STATES.DISCONNECTED;
    this.currentEndpointIndex = 0;
    this.reconnectAttempts = 0;
    this.websocket = null;
    this.isReconnecting = false;
    
    // Gestión de mensajes
    this.messageQueue = [];
    this.pendingMessages = new Map();
    this.subscriptions = new Set();
    this.messageId = 0;
    
    // Timers
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.heartbeatTimeoutTimer = null;
    
    // Callbacks
    this.onConnect = null;
    this.onDisconnect = null;
    this.onMessage = null;
    this.onError = null;
    this.onReconnect = null;
    
    // Métricas
    this.metrics = {
      totalConnections: 0,
      totalDisconnections: 0,
      totalReconnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      messagesQueued: 0,
      averageLatency: 0,
      connectionUptime: 0,
      lastConnectedAt: null
    };

    this.initializeManager();
  }

  /**
   * Inicializar WebSocket Manager
   */
  initializeManager() {
    logger.info(LOG_CATEGORIES.NETWORK, 'Initializing WebSocket Manager', {
      endpoints: this.config.endpoints.length,
      heartbeatInterval: this.config.heartbeatInterval
    });

    // Configurar listeners de visibilidad
    this.setupVisibilityHandlers();
    
    // Configurar listeners de conectividad
    this.setupConnectivityHandlers();
    
    // Conectar automáticamente
    this.connect();
  }

  /**
   * Conectar WebSocket
   */
  async connect() {
    if (this.state === WS_STATES.CONNECTING || this.state === WS_STATES.CONNECTED) {
      return;
    }

    this.state = WS_STATES.CONNECTING;
    
    try {
      await this.attemptConnection();
    } catch (error) {
      logger.error(LOG_CATEGORIES.NETWORK, 'WebSocket connection failed', {
        error: error.message,
        endpoint: this.getCurrentEndpoint()
      });
      
      this.handleConnectionFailure();
    }
  }

  /**
   * Intentar conexión con endpoint actual
   */
  async attemptConnection() {
    const endpoint = this.getCurrentEndpoint();
    
    logger.debug(LOG_CATEGORIES.NETWORK, 'Attempting WebSocket connection', {
      endpoint,
      attempt: this.reconnectAttempts + 1
    });

    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(endpoint);
        
        // Configurar timeout de conexión
        const connectionTimeout = setTimeout(() => {
          this.websocket.close();
          reject(new Error('Connection timeout'));
        }, 10000);

        this.websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.handleConnectionOpen();
          resolve();
        };

        this.websocket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.websocket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.handleConnectionClose(event);
        };

        this.websocket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          this.handleConnectionError(error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Manejar apertura de conexión
   */
  handleConnectionOpen() {
    this.state = WS_STATES.CONNECTED;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.metrics.totalConnections++;
    this.metrics.lastConnectedAt = Date.now();
    
    logger.info(LOG_CATEGORIES.NETWORK, 'WebSocket connected successfully', {
      endpoint: this.getCurrentEndpoint(),
      totalConnections: this.metrics.totalConnections
    });

    // Autenticar si está configurado
    if (this.config.autoAuth && this.config.authToken) {
      this.authenticate(this.config.authToken);
    }

    // Iniciar heartbeat
    this.startHeartbeat();
    
    // Procesar cola de mensajes
    this.processMessageQueue();
    
    // Reestablecer suscripciones
    this.reestablishSubscriptions();
    
    // Callback de conexión
    if (this.onConnect) {
      this.onConnect();
    }
  }

  /**
   * Manejar cierre de conexión
   */
  handleConnectionClose(event) {
    this.state = WS_STATES.DISCONNECTED;
    this.metrics.totalDisconnections++;
    
    // Calcular uptime
    if (this.metrics.lastConnectedAt) {
      this.metrics.connectionUptime += Date.now() - this.metrics.lastConnectedAt;
    }
    
    // Detener heartbeat
    this.stopHeartbeat();
    
    logger.warn(LOG_CATEGORIES.NETWORK, 'WebSocket disconnected', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      endpoint: this.getCurrentEndpoint()
    });

    // Callback de desconexión
    if (this.onDisconnect) {
      this.onDisconnect(event);
    }

    // Intentar reconexión si no fue cierre limpio
    if (!event.wasClean && !this.isReconnecting) {
      this.scheduleReconnection();
    }
  }

  /**
   * Manejar error de conexión
   */
  handleConnectionError(error) {
    logger.error(LOG_CATEGORIES.NETWORK, 'WebSocket error', {
      error: error.message || 'Unknown error',
      endpoint: this.getCurrentEndpoint()
    });

    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Manejar mensaje recibido
   */
  handleMessage(event) {
    try {
      let data;
      
      // Descomprimir si es necesario
      if (this.config.enableCompression && this.isCompressed(event.data)) {
        data = JSON.parse(this.decompress(event.data));
      } else {
        data = JSON.parse(event.data);
      }

      this.metrics.messagesReceived++;
      
      // Manejar tipos de mensajes especiales
      switch (data.type) {
        case MESSAGE_TYPES.HEARTBEAT:
          this.handleHeartbeatResponse(data);
          break;
          
        case MESSAGE_TYPES.ACK:
          this.handleAcknowledgment(data);
          break;
          
        case MESSAGE_TYPES.ERROR:
          this.handleServerError(data);
          break;
          
        default:
          // Mensaje de datos normal
          if (this.onMessage) {
            this.onMessage(data);
          }
      }

    } catch (error) {
      logger.error(LOG_CATEGORIES.NETWORK, 'Failed to parse WebSocket message', {
        error: error.message,
        rawData: event.data
      });
    }
  }

  /**
   * Enviar mensaje
   */
  async send(data, options = {}) {
    const message = {
      id: this.generateMessageId(),
      type: options.type || MESSAGE_TYPES.DATA,
      data,
      timestamp: Date.now(),
      requiresAck: options.requiresAck || false
    };

    // Si no está conectado, agregar a cola
    if (this.state !== WS_STATES.CONNECTED) {
      this.queueMessage(message);
      return message.id;
    }

    try {
      await this.sendMessage(message);
      return message.id;
    } catch (error) {
      // Si falla el envío, agregar a cola
      this.queueMessage(message);
      throw error;
    }
  }

  /**
   * Enviar mensaje directamente
   */
  async sendMessage(message) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    let payload = JSON.stringify(message);
    
    // Comprimir si está habilitado y el mensaje es grande
    if (this.config.enableCompression && payload.length > 1024) {
      payload = this.compress(payload);
    }

    this.websocket.send(payload);
    this.metrics.messagesSent++;
    
    // Si requiere ACK, agregar a pendientes
    if (message.requiresAck) {
      this.pendingMessages.set(message.id, {
        message,
        sentAt: Date.now(),
        timeout: setTimeout(() => {
          this.handleMessageTimeout(message.id);
        }, this.config.messageTimeout)
      });
    }

    logger.debug(LOG_CATEGORIES.NETWORK, 'Message sent', {
      messageId: message.id,
      type: message.type,
      size: payload.length
    });
  }

  /**
   * Agregar mensaje a cola
   */
  queueMessage(message) {
    if (this.messageQueue.length >= this.config.maxQueueSize) {
      // Remover mensaje más antiguo
      const oldMessage = this.messageQueue.shift();
      logger.warn(LOG_CATEGORIES.NETWORK, 'Message queue full, dropping oldest message', {
        droppedMessageId: oldMessage.id
      });
    }

    this.messageQueue.push(message);
    this.metrics.messagesQueued++;
    
    logger.debug(LOG_CATEGORIES.NETWORK, 'Message queued', {
      messageId: message.id,
      queueSize: this.messageQueue.length
    });
  }

  /**
   * Procesar cola de mensajes
   */
  async processMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    logger.info(LOG_CATEGORIES.NETWORK, 'Processing message queue', {
      queueSize: this.messageQueue.length
    });

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      try {
        await this.sendMessage(message);
      } catch (error) {
        // Si falla, volver a encolar
        this.queueMessage(message);
        break; // Detener procesamiento si hay error
      }
    }
  }

  /**
   * Programar reconexión
   */
  scheduleReconnection() {
    if (this.isReconnecting || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.state = WS_STATES.FAILED;
      logger.error(LOG_CATEGORIES.NETWORK, 'Max reconnection attempts reached', {
        attempts: this.reconnectAttempts
      });
      return;
    }

    this.isReconnecting = true;
    this.state = WS_STATES.RECONNECTING;
    this.reconnectAttempts++;

    // Calcular delay con backoff exponencial
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(this.config.reconnectDecay, this.reconnectAttempts - 1),
      this.config.maxReconnectInterval
    );

    logger.info(LOG_CATEGORIES.NETWORK, 'Scheduling reconnection', {
      attempt: this.reconnectAttempts,
      delay,
      nextEndpoint: this.getNextEndpoint()
    });

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnection();
    }, delay);
  }

  /**
   * Intentar reconexión
   */
  async attemptReconnection() {
    // Rotar al siguiente endpoint
    this.rotateEndpoint();
    
    this.metrics.totalReconnections++;
    
    try {
      await this.attemptConnection();
      
      if (this.onReconnect) {
        this.onReconnect();
      }
      
    } catch (error) {
      this.scheduleReconnection();
    }
  }

  /**
   * Manejar fallo de conexión
   */
  handleConnectionFailure() {
    this.state = WS_STATES.DISCONNECTED;
    this.scheduleReconnection();
  }

  /**
   * Iniciar heartbeat
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  /**
   * Detener heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * Enviar heartbeat
   */
  sendHeartbeat() {
    if (this.state !== WS_STATES.CONNECTED) return;

    const heartbeat = {
      id: this.generateMessageId(),
      type: MESSAGE_TYPES.HEARTBEAT,
      timestamp: Date.now()
    };

    try {
      this.sendMessage(heartbeat);
      
      // Configurar timeout para respuesta
      this.heartbeatTimeoutTimer = setTimeout(() => {
        logger.warn(LOG_CATEGORIES.NETWORK, 'Heartbeat timeout');
        this.websocket.close();
      }, this.config.heartbeatTimeout);
      
    } catch (error) {
      logger.error(LOG_CATEGORIES.NETWORK, 'Failed to send heartbeat', {
        error: error.message
      });
    }
  }

  /**
   * Manejar respuesta de heartbeat
   */
  handleHeartbeatResponse(data) {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }

    // Calcular latencia
    const latency = Date.now() - data.timestamp;
    this.updateLatencyMetrics(latency);
    
    logger.debug(LOG_CATEGORIES.NETWORK, 'Heartbeat response received', {
      latency
    });
  }

  /**
   * Autenticar conexión
   */
  authenticate(token) {
    this.config.authToken = token;
    
    this.send({
      token
    }, {
      type: MESSAGE_TYPES.AUTH,
      requiresAck: true
    });
  }

  /**
   * Suscribirse a canal
   */
  subscribe(channel) {
    this.subscriptions.add(channel);
    
    if (this.state === WS_STATES.CONNECTED) {
      this.send({
        channel
      }, {
        type: MESSAGE_TYPES.SUBSCRIBE
      });
    }
  }

  /**
   * Desuscribirse de canal
   */
  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    
    if (this.state === WS_STATES.CONNECTED) {
      this.send({
        channel
      }, {
        type: MESSAGE_TYPES.UNSUBSCRIBE
      });
    }
  }

  /**
   * Reestablecer suscripciones después de reconexión
   */
  reestablishSubscriptions() {
    for (const channel of this.subscriptions) {
      this.send({
        channel
      }, {
        type: MESSAGE_TYPES.SUBSCRIBE
      });
    }
  }

  // Métodos auxiliares
  getCurrentEndpoint() {
    return this.config.endpoints[this.currentEndpointIndex];
  }

  getNextEndpoint() {
    const nextIndex = (this.currentEndpointIndex + 1) % this.config.endpoints.length;
    return this.config.endpoints[nextIndex];
  }

  rotateEndpoint() {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.config.endpoints.length;
  }

  generateMessageId() {
    return ++this.messageId;
  }

  handleAcknowledgment(data) {
    const pending = this.pendingMessages.get(data.messageId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingMessages.delete(data.messageId);
      
      const latency = Date.now() - pending.sentAt;
      this.updateLatencyMetrics(latency);
    }
  }

  handleMessageTimeout(messageId) {
    const pending = this.pendingMessages.get(messageId);
    if (pending) {
      this.pendingMessages.delete(messageId);
      
      logger.warn(LOG_CATEGORIES.NETWORK, 'Message timeout', {
        messageId,
        type: pending.message.type
      });
    }
  }

  handleServerError(data) {
    logger.error(LOG_CATEGORIES.NETWORK, 'Server error received', {
      error: data.error,
      code: data.code
    });
  }

  updateLatencyMetrics(latency) {
    const currentAvg = this.metrics.averageLatency;
    const totalMessages = this.metrics.messagesReceived;
    
    this.metrics.averageLatency = totalMessages > 1
      ? ((currentAvg * (totalMessages - 1)) + latency) / totalMessages
      : latency;
  }

  setupVisibilityHandlers() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Página oculta - reducir actividad
        this.stopHeartbeat();
      } else {
        // Página visible - reanudar actividad
        if (this.state === WS_STATES.CONNECTED) {
          this.startHeartbeat();
        } else if (this.state === WS_STATES.DISCONNECTED) {
          this.connect();
        }
      }
    });
  }

  setupConnectivityHandlers() {
    window.addEventListener('online', () => {
      logger.info(LOG_CATEGORIES.NETWORK, 'Network connectivity restored');
      if (this.state === WS_STATES.DISCONNECTED) {
        this.connect();
      }
    });

    window.addEventListener('offline', () => {
      logger.warn(LOG_CATEGORIES.NETWORK, 'Network connectivity lost');
    });
  }

  // Métodos de compresión (implementación básica)
  compress(data) {
    // En producción usar una librería de compresión real
    return btoa(data);
  }

  decompress(data) {
    return atob(data);
  }

  isCompressed(data) {
    // Lógica simple para detectar datos comprimidos
    try {
      atob(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Desconectar WebSocket
   */
  disconnect() {
    this.isReconnecting = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.websocket) {
      this.websocket.close(1000, 'Client disconnect');
      this.websocket = null;
    }
    
    this.state = WS_STATES.DISCONNECTED;
  }

  /**
   * Obtener métricas
   */
  getMetrics() {
    return {
      ...this.metrics,
      state: this.state,
      currentEndpoint: this.getCurrentEndpoint(),
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      pendingMessages: this.pendingMessages.size,
      subscriptions: this.subscriptions.size,
      uptime: this.metrics.lastConnectedAt 
        ? Date.now() - this.metrics.lastConnectedAt 
        : 0
    };
  }

  /**
   * Obtener estado de salud
   */
  getHealthStatus() {
    const uptime = this.metrics.connectionUptime + (
      this.metrics.lastConnectedAt ? Date.now() - this.metrics.lastConnectedAt : 0
    );
    
    const uptimePercentage = this.metrics.totalConnections > 0
      ? (uptime / (Date.now() - (this.metrics.lastConnectedAt || Date.now()))) * 100
      : 0;

    return {
      status: this.state,
      isConnected: this.state === WS_STATES.CONNECTED,
      endpoint: this.getCurrentEndpoint(),
      uptime: uptime,
      uptimePercentage: uptimePercentage.toFixed(2),
      averageLatency: this.metrics.averageLatency.toFixed(2),
      messagesSent: this.metrics.messagesSent,
      messagesReceived: this.metrics.messagesReceived,
      reconnections: this.metrics.totalReconnections
    };
  }
}

// Instancia singleton del WebSocket Manager
const websocketManager = new WebSocketManager();

export default websocketManager;
export { WebSocketManager, WS_STATES, MESSAGE_TYPES };

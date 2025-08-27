/**
 * ========================================
 * SERVICIO WEBSOCKET - SISTEMA EVA
 * ========================================
 *
 * Servicio para conexiones WebSocket en tiempo real
 * Maneja notificaciones, actualizaciones de tickets y eventos del sistema
 */

import { API_CONFIG } from '../config/api.js';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 segundos
    this.listeners = new Map();
    this.isConnecting = false;
    this.isAuthenticated = false;
  }

  /**
   * Conectar al WebSocket
   */
  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket ya está conectado');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('WebSocket ya se está conectando');
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Construir URL del WebSocket
        const wsUrl = API_CONFIG.WS_URL || 'ws://localhost:8000/ws';
        const fullUrl = `${wsUrl}?token=${token}`;

        console.log('Conectando a WebSocket:', wsUrl);
        
        this.socket = new WebSocket(fullUrl);

        this.socket.onopen = (event) => {
          console.log('WebSocket conectado exitosamente');
          this.isConnecting = false;
          this.isAuthenticated = true;
          this.reconnectAttempts = 0;
          
          // Enviar ping inicial
          this.sendPing();
          
          // Configurar ping periódico
          this.setupPingInterval();
          
          resolve(event);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket desconectado:', event.code, event.reason);
          this.isConnecting = false;
          this.isAuthenticated = false;
          
          // Intentar reconectar si no fue un cierre intencional
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(token);
          }
        };

        this.socket.onerror = (error) => {
          console.error('Error en WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        console.error('Error al crear WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Desconectar WebSocket
   */
  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Desconexión intencional');
      this.socket = null;
    }

    this.isAuthenticated = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Programar reconexión
   */
  scheduleReconnect(token) {
    this.reconnectAttempts++;
    console.log(`Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect(token).catch(error => {
        console.error('Error en reconexión:', error);
      });
    }, this.reconnectInterval);
  }

  /**
   * Configurar ping periódico
   */
  setupPingInterval() {
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // Ping cada 30 segundos
  }

  /**
   * Enviar ping
   */
  sendPing() {
    if (this.isConnected()) {
      this.send({
        type: 'ping',
        timestamp: Date.now()
      });
    }
  }

  /**
   * Manejar mensajes recibidos
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('Mensaje WebSocket recibido:', data);

      // Manejar diferentes tipos de mensajes
      switch (data.type) {
        case 'pong':
          // Respuesta al ping
          break;
          
        case 'ticket_created':
          this.emit('ticketCreated', data.payload);
          break;
          
        case 'ticket_updated':
          this.emit('ticketUpdated', data.payload);
          break;
          
        case 'ticket_assigned':
          this.emit('ticketAssigned', data.payload);
          break;
          
        case 'ticket_resolved':
          this.emit('ticketResolved', data.payload);
          break;
          
        case 'ticket_closed':
          this.emit('ticketClosed', data.payload);
          break;
          
        case 'notification':
          this.emit('notification', data.payload);
          break;
          
        case 'system_alert':
          this.emit('systemAlert', data.payload);
          break;
          
        default:
          console.log('Tipo de mensaje no reconocido:', data.type);
          this.emit('message', data);
      }
    } catch (error) {
      console.error('Error al procesar mensaje WebSocket:', error);
    }
  }

  /**
   * Enviar mensaje
   */
  send(data) {
    if (this.isConnected()) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket no está conectado. No se puede enviar mensaje:', data);
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN && this.isAuthenticated;
  }

  /**
   * Suscribirse a eventos
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Desuscribirse de eventos
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en callback de evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * Suscribirse a actualizaciones de tickets
   */
  subscribeToTicketUpdates(callback) {
    this.on('ticketCreated', callback);
    this.on('ticketUpdated', callback);
    this.on('ticketAssigned', callback);
    this.on('ticketResolved', callback);
    this.on('ticketClosed', callback);
  }

  /**
   * Desuscribirse de actualizaciones de tickets
   */
  unsubscribeFromTicketUpdates(callback) {
    this.off('ticketCreated', callback);
    this.off('ticketUpdated', callback);
    this.off('ticketAssigned', callback);
    this.off('ticketResolved', callback);
    this.off('ticketClosed', callback);
  }

  /**
   * Suscribirse a notificaciones
   */
  subscribeToNotifications(callback) {
    this.on('notification', callback);
    this.on('systemAlert', callback);
  }

  /**
   * Desuscribirse de notificaciones
   */
  unsubscribeFromNotifications(callback) {
    this.off('notification', callback);
    this.off('systemAlert', callback);
  }

  /**
   * Enviar evento de ticket visto
   */
  markTicketAsViewed(ticketId) {
    this.send({
      type: 'ticket_viewed',
      payload: { ticket_id: ticketId }
    });
  }

  /**
   * Unirse a sala de ticket específico
   */
  joinTicketRoom(ticketId) {
    this.send({
      type: 'join_ticket_room',
      payload: { ticket_id: ticketId }
    });
  }

  /**
   * Salir de sala de ticket específico
   */
  leaveTicketRoom(ticketId) {
    this.send({
      type: 'leave_ticket_room',
      payload: { ticket_id: ticketId }
    });
  }

  /**
   * Obtener estado de la conexión
   */
  getConnectionState() {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return this.isAuthenticated ? 'connected' : 'authenticating';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Instancia única del servicio
const websocketService = new WebSocketService();

export default websocketService;

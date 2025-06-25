/**
 * Sistema de Notificaciones Avanzado - Sistema EVA
 * 
 * Características:
 * - Notificaciones toast mejoradas
 * - Notificaciones push del navegador
 * - Notificaciones por email
 * - WebSockets para tiempo real
 * - Preferencias de usuario
 * - Cola de notificaciones
 * - Persistencia offline
 */

import { toast } from 'react-toastify';
import logger, { LOG_CATEGORIES } from '../utils/logger.js';

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SYSTEM: 'system',
  BUSINESS: 'business',
  SECURITY: 'security'
};

// Canales de notificación
export const NOTIFICATION_CHANNELS = {
  TOAST: 'toast',
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  WEBSOCKET: 'websocket',
  IN_APP: 'in_app'
};

// Prioridades
export const NOTIFICATION_PRIORITIES = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4,
  CRITICAL: 5
};

class NotificationService {
  constructor() {
    this.preferences = this.loadPreferences();
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.websocket = null;
    this.pushSubscription = null;
    this.notificationHistory = [];
    this.maxHistorySize = 1000;
    
    this.initializeService();
  }

  /**
   * Inicializar servicio de notificaciones
   */
  async initializeService() {
    // Configurar listeners de conectividad
    this.setupConnectivityListeners();
    
    // Inicializar notificaciones push
    await this.initializePushNotifications();
    
    // Conectar WebSocket
    this.connectWebSocket();
    
    // Procesar cola offline
    this.processOfflineQueue();
    
    logger.info(LOG_CATEGORIES.SYSTEM, 'Notification service initialized', {
      pushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
      websocketEnabled: !!this.websocket,
      preferences: this.preferences
    });
  }

  /**
   * Enviar notificación
   */
  async notify(message, options = {}) {
    const notification = this.createNotification(message, options);
    
    try {
      // Verificar preferencias del usuario
      if (!this.shouldSendNotification(notification)) {
        logger.debug(LOG_CATEGORIES.UI, 'Notification blocked by preferences', {
          type: notification.type,
          priority: notification.priority
        });
        return false;
      }

      // Agregar al historial
      this.addToHistory(notification);

      // Enviar por canales configurados
      const results = await this.sendToChannels(notification);
      
      // Log del resultado
      logger.info(LOG_CATEGORIES.UI, 'Notification sent', {
        id: notification.id,
        type: notification.type,
        channels: notification.channels,
        results
      });

      return true;

    } catch (error) {
      logger.error(LOG_CATEGORIES.UI, 'Notification send failed', {
        error: error.message,
        notification: notification.id
      });
      
      // Agregar a cola para reintento si está offline
      if (!this.isOnline) {
        this.addToQueue(notification);
      }
      
      return false;
    }
  }

  /**
   * Métodos de conveniencia por tipo
   */
  success(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.SUCCESS,
      priority: NOTIFICATION_PRIORITIES.NORMAL
    });
  }

  error(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.ERROR,
      priority: NOTIFICATION_PRIORITIES.HIGH
    });
  }

  warning(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.WARNING,
      priority: NOTIFICATION_PRIORITIES.NORMAL
    });
  }

  info(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.INFO,
      priority: NOTIFICATION_PRIORITIES.LOW
    });
  }

  system(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.SYSTEM,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      channels: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.IN_APP]
    });
  }

  business(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.BUSINESS,
      priority: NOTIFICATION_PRIORITIES.NORMAL
    });
  }

  security(message, options = {}) {
    return this.notify(message, { 
      ...options, 
      type: NOTIFICATION_TYPES.SECURITY,
      priority: NOTIFICATION_PRIORITIES.CRITICAL,
      channels: [
        NOTIFICATION_CHANNELS.TOAST, 
        NOTIFICATION_CHANNELS.PUSH, 
        NOTIFICATION_CHANNELS.EMAIL,
        NOTIFICATION_CHANNELS.IN_APP
      ]
    });
  }

  /**
   * Crear objeto de notificación
   */
  createNotification(message, options) {
    const defaultChannels = this.getDefaultChannels(options.type);
    
    return {
      id: this.generateNotificationId(),
      message,
      type: options.type || NOTIFICATION_TYPES.INFO,
      priority: options.priority || NOTIFICATION_PRIORITIES.NORMAL,
      channels: options.channels || defaultChannels,
      title: options.title,
      icon: options.icon,
      image: options.image,
      actions: options.actions || [],
      data: options.data || {},
      persistent: options.persistent || false,
      autoClose: options.autoClose !== false,
      duration: options.duration || this.getDurationByPriority(options.priority),
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      correlationId: options.correlationId,
      category: options.category,
      tags: options.tags || []
    };
  }

  /**
   * Enviar a canales configurados
   */
  async sendToChannels(notification) {
    const results = {};
    
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case NOTIFICATION_CHANNELS.TOAST:
            results[channel] = await this.sendToast(notification);
            break;
            
          case NOTIFICATION_CHANNELS.PUSH:
            results[channel] = await this.sendPush(notification);
            break;
            
          case NOTIFICATION_CHANNELS.EMAIL:
            results[channel] = await this.sendEmail(notification);
            break;
            
          case NOTIFICATION_CHANNELS.SMS:
            results[channel] = await this.sendSMS(notification);
            break;
            
          case NOTIFICATION_CHANNELS.WEBSOCKET:
            results[channel] = await this.sendWebSocket(notification);
            break;
            
          case NOTIFICATION_CHANNELS.IN_APP:
            results[channel] = await this.sendInApp(notification);
            break;
            
          default:
            results[channel] = { success: false, error: 'Unknown channel' };
        }
      } catch (error) {
        results[channel] = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Enviar notificación toast
   */
  async sendToast(notification) {
    try {
      const toastOptions = {
        position: this.preferences.toast.position || 'top-right',
        autoClose: notification.autoClose ? notification.duration : false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: notification.id,
        className: `notification-${notification.type}`,
        bodyClassName: 'notification-body',
        progressClassName: 'notification-progress'
      };

      // Agregar acciones si existen
      if (notification.actions.length > 0) {
        toastOptions.onClick = () => this.handleNotificationAction(notification);
      }

      // Enviar según tipo
      switch (notification.type) {
        case NOTIFICATION_TYPES.SUCCESS:
          toast.success(notification.message, toastOptions);
          break;
        case NOTIFICATION_TYPES.ERROR:
          toast.error(notification.message, toastOptions);
          break;
        case NOTIFICATION_TYPES.WARNING:
          toast.warning(notification.message, toastOptions);
          break;
        default:
          toast.info(notification.message, toastOptions);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación push
   */
  async sendPush(notification) {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { success: false, error: 'Push notifications not supported' };
      }

      if (!this.pushSubscription) {
        return { success: false, error: 'No push subscription' };
      }

      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(notification.title || notification.message, {
        body: notification.message,
        icon: notification.icon || '/icons/notification-icon.png',
        image: notification.image,
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        data: {
          ...notification.data,
          id: notification.id,
          timestamp: notification.timestamp
        },
        actions: notification.actions.map(action => ({
          action: action.id,
          title: action.title,
          icon: action.icon
        })),
        requireInteraction: notification.priority >= NOTIFICATION_PRIORITIES.HIGH,
        silent: notification.priority === NOTIFICATION_PRIORITIES.LOW,
        vibrate: notification.priority >= NOTIFICATION_PRIORITIES.HIGH ? [200, 100, 200] : undefined
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación por email
   */
  async sendEmail(notification) {
    try {
      const emailData = {
        to: this.getCurrentUserEmail(),
        subject: notification.title || `Notificación EVA: ${notification.type}`,
        body: this.formatEmailBody(notification),
        priority: notification.priority >= NOTIFICATION_PRIORITIES.HIGH ? 'high' : 'normal',
        category: notification.category,
        tags: notification.tags
      };

      // Enviar al backend
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(`Email send failed: ${response.status}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación por SMS
   */
  async sendSMS(notification) {
    try {
      const smsData = {
        to: this.getCurrentUserPhone(),
        message: `EVA: ${notification.message}`,
        priority: notification.priority >= NOTIFICATION_PRIORITIES.HIGH ? 'high' : 'normal'
      };

      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(smsData)
      });

      if (response.ok) {
        return { success: true };
      } else {
        throw new Error(`SMS send failed: ${response.status}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar por WebSocket
   */
  async sendWebSocket(notification) {
    try {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        return { success: false, error: 'WebSocket not connected' };
      }

      this.websocket.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación in-app
   */
  async sendInApp(notification) {
    try {
      // Emitir evento personalizado para componentes React
      window.dispatchEvent(new CustomEvent('eva:notification', {
        detail: notification
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Inicializar notificaciones push
   */
  async initializePushNotifications() {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        logger.warn(LOG_CATEGORIES.SYSTEM, 'Push notifications not supported');
        return false;
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Solicitar permisos
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Suscribirse a push notifications
        this.pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            process.env.VITE_VAPID_PUBLIC_KEY || ''
          )
        });

        // Enviar suscripción al servidor
        await this.sendSubscriptionToServer(this.pushSubscription);
        
        logger.info(LOG_CATEGORIES.SYSTEM, 'Push notifications initialized');
        return true;
      } else {
        logger.warn(LOG_CATEGORIES.SYSTEM, 'Push notification permission denied');
        return false;
      }
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Push notification initialization failed', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Conectar WebSocket
   */
  connectWebSocket() {
    try {
      const wsUrl = process.env.VITE_WEBSOCKET_URL || 'ws://localhost:6001';
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        logger.info(LOG_CATEGORIES.SYSTEM, 'WebSocket connected');
        
        // Autenticar
        this.websocket.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('auth_token')
        }));
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          logger.error(LOG_CATEGORIES.SYSTEM, 'WebSocket message parse error', {
            error: error.message
          });
        }
      };

      this.websocket.onclose = () => {
        logger.warn(LOG_CATEGORIES.SYSTEM, 'WebSocket disconnected');
        
        // Reconectar después de 5 segundos
        setTimeout(() => {
          this.connectWebSocket();
        }, 5000);
      };

      this.websocket.onerror = (error) => {
        logger.error(LOG_CATEGORIES.SYSTEM, 'WebSocket error', { error });
      };

    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'WebSocket connection failed', {
        error: error.message
      });
    }
  }

  // Métodos auxiliares
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDefaultChannels(type) {
    const channelMap = {
      [NOTIFICATION_TYPES.SUCCESS]: [NOTIFICATION_CHANNELS.TOAST],
      [NOTIFICATION_TYPES.ERROR]: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.IN_APP],
      [NOTIFICATION_TYPES.WARNING]: [NOTIFICATION_CHANNELS.TOAST],
      [NOTIFICATION_TYPES.INFO]: [NOTIFICATION_CHANNELS.TOAST],
      [NOTIFICATION_TYPES.SYSTEM]: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.PUSH],
      [NOTIFICATION_TYPES.BUSINESS]: [NOTIFICATION_CHANNELS.TOAST, NOTIFICATION_CHANNELS.IN_APP],
      [NOTIFICATION_TYPES.SECURITY]: [
        NOTIFICATION_CHANNELS.TOAST, 
        NOTIFICATION_CHANNELS.PUSH, 
        NOTIFICATION_CHANNELS.EMAIL
      ]
    };

    return channelMap[type] || [NOTIFICATION_CHANNELS.TOAST];
  }

  getDurationByPriority(priority) {
    const durationMap = {
      [NOTIFICATION_PRIORITIES.LOW]: 3000,
      [NOTIFICATION_PRIORITIES.NORMAL]: 5000,
      [NOTIFICATION_PRIORITIES.HIGH]: 8000,
      [NOTIFICATION_PRIORITIES.URGENT]: 10000,
      [NOTIFICATION_PRIORITIES.CRITICAL]: false // No auto-close
    };

    return durationMap[priority] || 5000;
  }

  shouldSendNotification(notification) {
    // Verificar preferencias globales
    if (!this.preferences.enabled) return false;
    
    // Verificar preferencias por tipo
    const typePrefs = this.preferences.types[notification.type];
    if (typePrefs && !typePrefs.enabled) return false;
    
    // Verificar preferencias por canal
    return notification.channels.some(channel => {
      const channelPrefs = this.preferences.channels[channel];
      return channelPrefs && channelPrefs.enabled;
    });
  }

  addToHistory(notification) {
    this.notificationHistory.unshift(notification);
    
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory = this.notificationHistory.slice(0, this.maxHistorySize);
    }
    
    this.saveHistory();
  }

  addToQueue(notification) {
    this.queue.push(notification);
    this.saveQueue();
  }

  processOfflineQueue() {
    if (this.isOnline && this.queue.length > 0) {
      const queueToProcess = [...this.queue];
      this.queue = [];
      
      queueToProcess.forEach(notification => {
        this.notify(notification.message, notification);
      });
      
      this.saveQueue();
    }
  }

  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      this.connectWebSocket();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('eva_notification_preferences');
      return saved ? JSON.parse(saved) : this.getDefaultPreferences();
    } catch {
      return this.getDefaultPreferences();
    }
  }

  getDefaultPreferences() {
    return {
      enabled: true,
      types: {
        [NOTIFICATION_TYPES.SUCCESS]: { enabled: true },
        [NOTIFICATION_TYPES.ERROR]: { enabled: true },
        [NOTIFICATION_TYPES.WARNING]: { enabled: true },
        [NOTIFICATION_TYPES.INFO]: { enabled: true },
        [NOTIFICATION_TYPES.SYSTEM]: { enabled: true },
        [NOTIFICATION_TYPES.BUSINESS]: { enabled: true },
        [NOTIFICATION_TYPES.SECURITY]: { enabled: true }
      },
      channels: {
        [NOTIFICATION_CHANNELS.TOAST]: { enabled: true },
        [NOTIFICATION_CHANNELS.PUSH]: { enabled: true },
        [NOTIFICATION_CHANNELS.EMAIL]: { enabled: false },
        [NOTIFICATION_CHANNELS.SMS]: { enabled: false },
        [NOTIFICATION_CHANNELS.IN_APP]: { enabled: true }
      },
      toast: {
        position: 'top-right'
      }
    };
  }

  savePreferences() {
    localStorage.setItem('eva_notification_preferences', JSON.stringify(this.preferences));
  }

  saveHistory() {
    try {
      localStorage.setItem('eva_notification_history', JSON.stringify(this.notificationHistory));
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Failed to save notification history', {
        error: error.message
      });
    }
  }

  saveQueue() {
    try {
      localStorage.setItem('eva_notification_queue', JSON.stringify(this.queue));
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Failed to save notification queue', {
        error: error.message
      });
    }
  }

  getCurrentUserId() {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.id || null;
    } catch {
      return null;
    }
  }

  getCurrentUserEmail() {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.email || null;
    } catch {
      return null;
    }
  }

  getCurrentUserPhone() {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      return userData.phone || null;
    } catch {
      return null;
    }
  }

  formatEmailBody(notification) {
    return `
      <h2>Notificación del Sistema EVA</h2>
      <p><strong>Tipo:</strong> ${notification.type}</p>
      <p><strong>Prioridad:</strong> ${notification.priority}</p>
      <p><strong>Mensaje:</strong> ${notification.message}</p>
      <p><strong>Fecha:</strong> ${new Date(notification.timestamp).toLocaleString()}</p>
      ${notification.data ? `<p><strong>Datos adicionales:</strong> ${JSON.stringify(notification.data, null, 2)}</p>` : ''}
      <p><em>Este es un mensaje automático del Sistema EVA.</em></p>
    `;
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      logger.error(LOG_CATEGORIES.SYSTEM, 'Failed to send push subscription', {
        error: error.message
      });
    }
  }

  handleWebSocketMessage(data) {
    if (data.type === 'notification') {
      this.notify(data.message, data.options);
    }
  }

  handleNotificationAction(notification) {
    // Implementar manejo de acciones de notificación
    logger.info(LOG_CATEGORIES.UI, 'Notification action triggered', {
      notificationId: notification.id
    });
  }

  /**
   * API pública para gestión de preferencias
   */
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    
    logger.info(LOG_CATEGORIES.SYSTEM, 'Notification preferences updated', {
      preferences: this.preferences
    });
  }

  getPreferences() {
    return { ...this.preferences };
  }

  getHistory(limit = 50) {
    return this.notificationHistory.slice(0, limit);
  }

  clearHistory() {
    this.notificationHistory = [];
    this.saveHistory();
  }

  getMetrics() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentNotifications = this.notificationHistory.filter(n => 
      now - new Date(n.timestamp).getTime() < oneHour
    );

    const dailyNotifications = this.notificationHistory.filter(n => 
      now - new Date(n.timestamp).getTime() < oneDay
    );

    return {
      total: this.notificationHistory.length,
      lastHour: recentNotifications.length,
      lastDay: dailyNotifications.length,
      queueSize: this.queue.length,
      byType: this.groupByType(),
      byChannel: this.groupByChannel(),
      preferences: this.preferences
    };
  }

  groupByType() {
    const groups = {};
    this.notificationHistory.forEach(n => {
      groups[n.type] = (groups[n.type] || 0) + 1;
    });
    return groups;
  }

  groupByChannel() {
    const groups = {};
    this.notificationHistory.forEach(n => {
      n.channels.forEach(channel => {
        groups[channel] = (groups[channel] || 0) + 1;
      });
    });
    return groups;
  }
}

// Crear instancia singleton
const notificationService = new NotificationService();

export default notificationService;
export { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_CHANNELS, 
  NOTIFICATION_PRIORITIES 
};

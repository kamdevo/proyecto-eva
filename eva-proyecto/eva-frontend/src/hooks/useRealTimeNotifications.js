/**
 * ========================================
 * HOOK PARA NOTIFICACIONES EN TIEMPO REAL
 * ========================================
 *
 * Hook personalizado para manejar notificaciones en tiempo real
 * Integra WebSocket, notificaciones del navegador y estado global
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';
import { useToast } from '../contexts/ToastContext';

export const useRealTimeNotifications = (options = {}) => {
  const {
    enableBrowserNotifications = true,
    enableToastNotifications = true,
    autoConnect = true,
    ticketUpdatesEnabled = true,
    systemAlertsEnabled = true,
  } = options;

  // Estados
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastTicketUpdate, setLastTicketUpdate] = useState(null);

  // Referencias
  const { showToast } = useToast();
  const notificationPermission = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  /**
   * Solicitar permisos de notificación del navegador
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!enableBrowserNotifications || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      notificationPermission.current = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      notificationPermission.current = permission;
      return permission === 'granted';
    }

    return false;
  }, [enableBrowserNotifications]);

  /**
   * Mostrar notificación del navegador
   */
  const showBrowserNotification = useCallback((title, options = {}) => {
    if (notificationPermission.current === 'granted' && enableBrowserNotifications) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Auto cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  }, [enableBrowserNotifications]);

  /**
   * Agregar nueva notificación
   */
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    return newNotification;
  }, []);

  /**
   * Marcar notificación como leída
   */
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * Marcar todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  /**
   * Limpiar notificaciones
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Manejar actualizaciones de tickets
   */
  const handleTicketUpdate = useCallback((data) => {
    if (!ticketUpdatesEnabled) return;

    setLastTicketUpdate({
      type: data.type,
      ticket: data.ticket,
      timestamp: new Date(),
    });

    // Crear notificación
    let title = '';
    let message = '';
    let type = 'info';

    switch (data.type) {
      case 'ticketCreated':
        title = 'Nuevo Ticket Creado';
        message = `Ticket #${data.ticket.numero_ticket}: ${data.ticket.titulo}`;
        type = 'info';
        break;
      case 'ticketAssigned':
        title = 'Ticket Asignado';
        message = `Te han asignado el ticket #${data.ticket.numero_ticket}`;
        type = 'info';
        break;
      case 'ticketUpdated':
        title = 'Ticket Actualizado';
        message = `El ticket #${data.ticket.numero_ticket} ha sido actualizado`;
        type = 'info';
        break;
      case 'ticketResolved':
        title = 'Ticket Resuelto';
        message = `El ticket #${data.ticket.numero_ticket} ha sido resuelto`;
        type = 'success';
        break;
      case 'ticketClosed':
        title = 'Ticket Cerrado';
        message = `El ticket #${data.ticket.numero_ticket} ha sido cerrado`;
        type = 'success';
        break;
      default:
        title = 'Actualización de Ticket';
        message = `Cambios en el ticket #${data.ticket.numero_ticket}`;
    }

    // Agregar notificación interna
    const notification = addNotification({
      title,
      message,
      type,
      category: 'ticket',
      data: data.ticket,
    });

    // Mostrar toast si está habilitado
    if (enableToastNotifications) {
      showToast(message, type);
    }

    // Mostrar notificación del navegador
    showBrowserNotification(title, {
      body: message,
      tag: `ticket-${data.ticket.id}`,
    });

  }, [ticketUpdatesEnabled, addNotification, enableToastNotifications, showToast, showBrowserNotification]);

  /**
   * Manejar notificaciones del sistema
   */
  const handleSystemNotification = useCallback((data) => {
    if (!systemAlertsEnabled) return;

    const notification = addNotification({
      title: data.title || 'Notificación del Sistema',
      message: data.message,
      type: data.type || 'info',
      category: 'system',
      data: data.data,
    });

    // Mostrar toast para alertas importantes
    if (data.type === 'error' || data.type === 'warning') {
      if (enableToastNotifications) {
        showToast(data.message, data.type);
      }
    }

    // Mostrar notificación del navegador para alertas críticas
    if (data.type === 'error') {
      showBrowserNotification(data.title || 'Alerta del Sistema', {
        body: data.message,
        tag: 'system-alert',
      });
    }

  }, [systemAlertsEnabled, addNotification, enableToastNotifications, showToast, showBrowserNotification]);

  /**
   * Conectar a WebSocket
   */
  const connect = useCallback(async (token) => {
    try {
      setConnectionState('connecting');
      await websocketService.connect(token);
      setIsConnected(true);
      setConnectionState('connected');
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setIsConnected(false);
      setConnectionState('error');
      
      if (enableToastNotifications) {
        showToast('Error de conexión en tiempo real', 'error');
      }
    }
  }, [enableToastNotifications, showToast]);

  /**
   * Desconectar WebSocket
   */
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  /**
   * Configurar listeners de WebSocket
   */
  useEffect(() => {
    if (ticketUpdatesEnabled) {
      websocketService.subscribeToTicketUpdates(handleTicketUpdate);
    }

    if (systemAlertsEnabled) {
      websocketService.subscribeToNotifications(handleSystemNotification);
    }

    // Cleanup
    return () => {
      if (ticketUpdatesEnabled) {
        websocketService.unsubscribeFromTicketUpdates(handleTicketUpdate);
      }
      if (systemAlertsEnabled) {
        websocketService.unsubscribeFromNotifications(handleSystemNotification);
      }
    };
  }, [ticketUpdatesEnabled, systemAlertsEnabled, handleTicketUpdate, handleSystemNotification]);

  /**
   * Monitorear estado de conexión
   */
  useEffect(() => {
    const checkConnectionState = () => {
      const state = websocketService.getConnectionState();
      setConnectionState(state);
      setIsConnected(state === 'connected');
    };

    const interval = setInterval(checkConnectionState, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Solicitar permisos al montar
   */
  useEffect(() => {
    if (enableBrowserNotifications) {
      requestNotificationPermission();
    }
  }, [enableBrowserNotifications, requestNotificationPermission]);

  /**
   * Auto conectar si está habilitado
   */
  useEffect(() => {
    if (autoConnect) {
      // Obtener token del localStorage o context
      const token = localStorage.getItem('auth_token');
      if (token) {
        connect(token);
      }
    }

    // Cleanup al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    // Estado de conexión
    isConnected,
    connectionState,
    
    // Notificaciones
    notifications,
    unreadCount,
    lastTicketUpdate,
    
    // Acciones de notificaciones
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    
    // Acciones de conexión
    connect,
    disconnect,
    
    // Utilidades
    requestNotificationPermission,
    showBrowserNotification,
  };
};

export default useRealTimeNotifications;

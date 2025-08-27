/**
 * ========================================
 * CONTEXTO DE TIEMPO REAL
 * ========================================
 *
 * Contexto global para manejar conexiones WebSocket y notificaciones
 * en tiempo real en toda la aplicación
 */

import { createContext, useContext, useEffect, useState } from 'react';
import useRealTimeNotifications from '../hooks/useRealTimeNotifications';
import websocketService from '../services/websocketService';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime debe ser usado dentro de RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Hook de notificaciones en tiempo real
  const realTimeNotifications = useRealTimeNotifications({
    enableBrowserNotifications: true,
    enableToastNotifications: true,
    autoConnect: false, // Conectaremos manualmente
    ticketUpdatesEnabled: true,
    systemAlertsEnabled: true,
  });

  /**
   * Inicializar conexión en tiempo real
   */
  const initializeRealTime = async (user, token) => {
    try {
      setCurrentUser(user);
      
      // Conectar WebSocket
      await realTimeNotifications.connect(token);
      
      // Solicitar permisos de notificación
      await realTimeNotifications.requestNotificationPermission();
      
      setIsInitialized(true);
      console.log('Tiempo real inicializado correctamente');
      
    } catch (error) {
      console.error('Error inicializando tiempo real:', error);
      setIsInitialized(false);
    }
  };

  /**
   * Desconectar tiempo real
   */
  const disconnectRealTime = () => {
    realTimeNotifications.disconnect();
    setIsInitialized(false);
    setCurrentUser(null);
    console.log('Tiempo real desconectado');
  };

  /**
   * Unirse a sala de ticket específico
   */
  const joinTicketRoom = (ticketId) => {
    if (realTimeNotifications.isConnected) {
      websocketService.joinTicketRoom(ticketId);
    }
  };

  /**
   * Salir de sala de ticket específico
   */
  const leaveTicketRoom = (ticketId) => {
    if (realTimeNotifications.isConnected) {
      websocketService.leaveTicketRoom(ticketId);
    }
  };

  /**
   * Marcar ticket como visto
   */
  const markTicketAsViewed = (ticketId) => {
    if (realTimeNotifications.isConnected) {
      websocketService.markTicketAsViewed(ticketId);
    }
  };

  /**
   * Enviar notificación personalizada
   */
  const sendCustomNotification = (title, message, type = 'info') => {
    realTimeNotifications.addNotification({
      title,
      message,
      type,
      category: 'custom',
    });
  };

  /**
   * Obtener estadísticas de conexión
   */
  const getConnectionStats = () => {
    return {
      isConnected: realTimeNotifications.isConnected,
      connectionState: realTimeNotifications.connectionState,
      unreadCount: realTimeNotifications.unreadCount,
      totalNotifications: realTimeNotifications.notifications.length,
      isInitialized,
      currentUser,
    };
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (isInitialized) {
        disconnectRealTime();
      }
    };
  }, [isInitialized]);

  const value = {
    // Estado
    isInitialized,
    currentUser,
    ...realTimeNotifications,
    
    // Acciones de conexión
    initializeRealTime,
    disconnectRealTime,
    
    // Acciones de tickets
    joinTicketRoom,
    leaveTicketRoom,
    markTicketAsViewed,
    
    // Utilidades
    sendCustomNotification,
    getConnectionStats,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeContext;

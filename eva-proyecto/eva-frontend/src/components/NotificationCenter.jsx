/**
 * ========================================
 * CENTRO DE NOTIFICACIONES
 * ========================================
 *
 * Componente para mostrar y gestionar notificaciones en tiempo real
 * Incluye dropdown, badges y gestión de estado
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useRealTimeNotifications from "../hooks/useRealTimeNotifications";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Wifi,
  WifiOff,
  Circle,
  Ticket,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function NotificationCenter() {
  const {
    isConnected,
    connectionState,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useRealTimeNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  /**
   * Obtener icono según el tipo de notificación
   */
  const getNotificationIcon = (type, category) => {
    if (category === 'ticket') {
      return <Ticket className="h-4 w-4 text-blue-500" />;
    }

    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  /**
   * Obtener color del badge según el tipo
   */
  const getBadgeColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  /**
   * Formatear tiempo relativo
   */
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  /**
   * Manejar click en notificación
   */
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Aquí puedes agregar lógica para navegar a la página del ticket
    if (notification.category === 'ticket' && notification.data) {
      console.log('Navegar a ticket:', notification.data.id);
      // router.push(`/tickets/${notification.data.id}`);
    }
  };

  /**
   * Obtener icono de estado de conexión
   */
  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />;
      case 'connecting':
        return <Wifi className="h-3 w-3 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="h-3 w-3 text-red-500" />;
    }
  };

  /**
   * Obtener texto de estado de conexión
   */
  const getConnectionText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2"
          ref={dropdownRef}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          
          {/* Badge de notificaciones no leídas */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Indicador de conexión */}
          <div className="absolute -bottom-1 -right-1">
            {getConnectionIcon()}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
        sideOffset={5}
      >
        {/* Header */}
        <DropdownMenuHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Notificaciones</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                {getConnectionIcon()}
                {getConnectionText()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="h-8 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuHeader>

        <DropdownMenuSeparator />

        {/* Lista de notificaciones */}
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="w-full p-3 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type, notification.category)}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium truncate ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Badge de tipo */}
                      <div className="mt-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getBadgeColor(notification.type)}`}
                        >
                          {notification.category === 'ticket' ? 'Ticket' : 'Sistema'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  setIsOpen(false);
                  // Navegar a página de notificaciones completa
                  console.log('Ver todas las notificaciones');
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

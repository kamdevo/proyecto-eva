/**
 * ========================================
 * LISTA VIRTUALIZADA DE TICKETS
 * ========================================
 *
 * Componente optimizado para mostrar grandes listas de tickets
 * Usa virtualización para mejorar el rendimiento
 */

import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import useVirtualPagination from '../hooks/useVirtualPagination';
import { useInfiniteScroll } from '../hooks/useDebounce';
import {
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';

// Componente de ticket individual memoizado
const TicketItem = memo(({ 
  ticket, 
  onSelect, 
  isSelected = false,
  style = {},
}) => {
  const handleClick = useCallback(() => {
    onSelect?.(ticket);
  }, [ticket, onSelect]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto':
        return 'bg-red-100 text-red-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'resuelto':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'abierto':
        return <AlertCircle className="h-4 w-4" />;
      case 'en_proceso':
        return <Clock className="h-4 w-4" />;
      case 'resuelto':
      case 'cerrado':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div style={style} className="px-4 py-2">
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-gray-500">
                  {ticket.numero_ticket}
                </span>
                <Badge 
                  variant="outline" 
                  className={getPriorityColor(ticket.prioridad)}
                >
                  {ticket.prioridad?.toUpperCase()}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(ticket.estado)} flex items-center gap-1`}
                >
                  {getStatusIcon(ticket.estado)}
                  {ticket.estado?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1 truncate">
                {ticket.titulo}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {ticket.descripcion}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{ticket.usuario_creador || 'Sin asignar'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(ticket.fecha_creacion)}</span>
                </div>
                {ticket.categoria && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{ticket.categoria.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Indicador de selección */}
            <div className="flex items-center ml-4">
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TicketItem.displayName = 'TicketItem';

// Componente principal de lista virtualizada
const VirtualizedTicketList = ({
  tickets = [],
  onTicketSelect,
  selectedTicketId = null,
  onLoadMore = null,
  hasMore = false,
  isLoading = false,
  itemHeight = 120,
  containerHeight = 600,
  className = '',
}) => {
  // Hook de virtualización
  const {
    visibleItems,
    containerProps,
    scrollProps,
    virtualProps,
    itemsContainerProps,
    getStats,
  } = useVirtualPagination({
    totalItems: tickets.length,
    itemHeight,
    containerHeight,
    overscan: 3,
    onLoadMore: hasMore ? onLoadMore : null,
    threshold: 0.8,
  });

  // Hook de scroll infinito para el sentinel
  const {
    sentinelRef,
    isLoading: isLoadingMore,
  } = useInfiniteScroll({
    loadMore: onLoadMore,
    hasMore,
    threshold: 0.9,
  });

  // Memoizar elementos visibles
  const visibleTicketItems = useMemo(() => {
    return visibleItems.map(({ index, offsetY, isVisible }) => {
      const ticket = tickets[index];
      if (!ticket) return null;

      return (
        <TicketItem
          key={ticket.id || index}
          ticket={ticket}
          onSelect={onTicketSelect}
          isSelected={selectedTicketId === ticket.id}
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
            height: itemHeight,
            opacity: isVisible ? 1 : 0.5,
          }}
        />
      );
    }).filter(Boolean);
  }, [visibleItems, tickets, onTicketSelect, selectedTicketId, itemHeight]);

  // Estadísticas de rendimiento (solo en desarrollo)
  const stats = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      return getStats();
    }
    return null;
  }, [getStats, tickets.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Estadísticas de desarrollo */}
      {stats && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Total: {stats.totalItems}</div>
          <div>Renderizados: {stats.renderedItems}</div>
          <div>Eficiencia: {stats.memoryUsage.efficiency.toFixed(1)}%</div>
        </div>
      )}

      {/* Contenedor principal */}
      <div {...containerProps} className="border rounded-lg overflow-hidden">
        <div {...scrollProps}>
          <div {...virtualProps}>
            <div {...itemsContainerProps}>
              {visibleTicketItems}
            </div>
            
            {/* Sentinel para scroll infinito */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center p-4"
                style={{
                  position: 'absolute',
                  top: tickets.length * itemHeight,
                  left: 0,
                  right: 0,
                  height: 60,
                }}
              >
                {(isLoading || isLoadingMore) && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Cargando más tickets...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estado vacío */}
      {tickets.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No se encontraron tickets</p>
          </div>
        </div>
      )}

      {/* Estado de carga inicial */}
      {tickets.length === 0 && isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Cargando tickets...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(VirtualizedTicketList);

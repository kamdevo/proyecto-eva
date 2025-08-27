/**
 * ========================================
 * HOOK PERSONALIZADO PARA TICKETS
 * ========================================
 *
 * Hook reutilizable para gestión de tickets
 * Incluye estado, carga de datos, filtros y operaciones CRUD
 */

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import useRealTimeNotifications from './useRealTimeNotifications';

export const useTickets = (initialParams = {}) => {
  // Estados principales
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    estado: 'todos',
    prioridad: 'todos',
    categoria: 'todos',
    ...initialParams
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const { showToast } = useToast();
  const { lastTicketUpdate } = useRealTimeNotifications({
    ticketUpdatesEnabled: true,
    enableToastNotifications: false, // Evitar duplicar toasts
  });

  /**
   * Manejar actualizaciones en tiempo real
   */
  useEffect(() => {
    if (lastTicketUpdate) {
      // Recargar tickets cuando hay actualizaciones en tiempo real
      loadTickets();
    }
  }, [lastTicketUpdate]);

  /**
   * Cargar tickets desde la API
   */
  const loadTickets = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search || undefined,
        estado: filters.estado !== 'todos' ? filters.estado : undefined,
        prioridad: filters.prioridad !== 'todos' ? filters.prioridad : undefined,
        categoria: filters.categoria !== 'todos' ? filters.categoria : undefined,
        ...params
      };

      // Filtrar parámetros undefined
      Object.keys(queryParams).forEach(key => 
        queryParams[key] === undefined && delete queryParams[key]
      );

      const response = await apiService.ticketsApi.getList(queryParams);
      
      if (response.success) {
        setTickets(response.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.meta?.last_page || 1,
          totalItems: response.meta?.total || 0
        }));
      } else {
        throw new Error(response.message || 'Error al cargar tickets');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError(error.message);
      showToast('Error al cargar tickets: ' + error.message, 'error');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, showToast]);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset a primera página
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  /**
   * Recargar tickets
   */
  const refresh = useCallback(() => {
    loadTickets();
  }, [loadTickets]);

  /**
   * Buscar tickets
   */
  const search = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  /**
   * Filtrar por estado
   */
  const filterByStatus = useCallback((status) => {
    updateFilters({ estado: status });
  }, [updateFilters]);

  /**
   * Filtrar por prioridad
   */
  const filterByPriority = useCallback((priority) => {
    updateFilters({ prioridad: priority });
  }, [updateFilters]);

  /**
   * Filtrar por categoría
   */
  const filterByCategory = useCallback((category) => {
    updateFilters({ categoria: category });
  }, [updateFilters]);

  /**
   * Crear nuevo ticket
   */
  const createTicket = useCallback(async (ticketData) => {
    try {
      setLoading(true);
      const response = await apiService.ticketsApi.create(ticketData);
      
      if (response.success) {
        showToast('Ticket creado exitosamente', 'success');
        await refresh(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast('Error al crear ticket: ' + error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refresh, showToast]);

  /**
   * Actualizar ticket
   */
  const updateTicket = useCallback(async (id, ticketData) => {
    try {
      setLoading(true);
      const response = await apiService.ticketsApi.update(id, ticketData);
      
      if (response.success) {
        showToast('Ticket actualizado exitosamente', 'success');
        await refresh(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      showToast('Error al actualizar ticket: ' + error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refresh, showToast]);

  /**
   * Eliminar ticket
   */
  const deleteTicket = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await apiService.ticketsApi.delete(id);
      
      if (response.success) {
        showToast('Ticket eliminado exitosamente', 'success');
        await refresh(); // Recargar lista
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      showToast('Error al eliminar ticket: ' + error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refresh, showToast]);

  /**
   * Asignar ticket
   */
  const assignTicket = useCallback(async (id, userId) => {
    try {
      const response = await apiService.ticketsApi.assign(id, userId);
      
      if (response.success) {
        showToast('Ticket asignado exitosamente', 'success');
        await refresh();
        return response.data;
      } else {
        throw new Error(response.message || 'Error al asignar ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      showToast('Error al asignar ticket: ' + error.message, 'error');
      throw error;
    }
  }, [refresh, showToast]);

  /**
   * Resolver ticket
   */
  const resolveTicket = useCallback(async (id, resolutionData) => {
    try {
      const response = await apiService.ticketsApi.resolve(id, resolutionData);
      
      if (response.success) {
        showToast('Ticket resuelto exitosamente', 'success');
        await refresh();
        return response.data;
      } else {
        throw new Error(response.message || 'Error al resolver ticket');
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
      showToast('Error al resolver ticket: ' + error.message, 'error');
      throw error;
    }
  }, [refresh, showToast]);

  /**
   * Cerrar ticket
   */
  const closeTicket = useCallback(async (id, closureData) => {
    try {
      const response = await apiService.ticketsApi.close(id, closureData);
      
      if (response.success) {
        showToast('Ticket cerrado exitosamente', 'success');
        await refresh();
        return response.data;
      } else {
        throw new Error(response.message || 'Error al cerrar ticket');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      showToast('Error al cerrar ticket: ' + error.message, 'error');
      throw error;
    }
  }, [refresh, showToast]);

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    // Estados
    tickets,
    loading,
    error,
    filters,
    pagination,
    
    // Acciones de filtrado y navegación
    updateFilters,
    changePage,
    refresh,
    search,
    filterByStatus,
    filterByPriority,
    filterByCategory,
    
    // Operaciones CRUD
    createTicket,
    updateTicket,
    deleteTicket,
    
    // Operaciones específicas
    assignTicket,
    resolveTicket,
    closeTicket,
    
    // Utilidades
    loadTickets
  };
};

export default useTickets;

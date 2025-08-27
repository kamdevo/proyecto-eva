/**
 * ========================================
 * PRUEBAS UNITARIAS - USE TICKETS HOOK
 * ========================================
 *
 * Pruebas para el hook personalizado useTickets
 * Incluye testing de estados, efectos y funciones
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTickets } from '../../hooks/useTickets';

// Mock del servicio de tickets
const mockTicketService = {
  getTickets: vi.fn(),
  createTicket: vi.fn(),
  updateTicket: vi.fn(),
  deleteTicket: vi.fn(),
  assignTicket: vi.fn(),
  resolveTicket: vi.fn(),
  closeTicket: vi.fn(),
  getTicketsByStatus: vi.fn(),
  getOpenTickets: vi.fn(),
  getMyTickets: vi.fn(),
  getClosedTickets: vi.fn(),
  searchTickets: vi.fn(),
  getGeneralStats: vi.fn(),
  getStatsByCategory: vi.fn(),
  getTicketComments: vi.fn(),
  addComment: vi.fn(),
  getTicketHistory: vi.fn(),
  getConfig: vi.fn(),
  exportTickets: vi.fn(),
};

// Mock del contexto de toast
const mockShowToast = vi.fn();

// Mock de las dependencias
vi.mock('../../services/apiService', () => ({
  default: {
    ticketsApi: mockTicketService,
  },
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock('./useRealTimeNotifications', () => ({
  default: () => ({
    lastTicketUpdate: null,
  }),
}));

describe('useTickets Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Estado inicial', () => {
    it('debería tener el estado inicial correcto', () => {
      const { result } = renderHook(() => useTickets());

      expect(result.current.tickets).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      expect(result.current.filters).toEqual({
        search: '',
        estado: 'todos',
        prioridad: 'todos',
        categoria: 'todos',
      });
      expect(result.current.pagination).toEqual({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      });
    });

    it('debería aceptar parámetros iniciales', () => {
      const initialParams = {
        estado: 'abierto',
        prioridad: 'alta',
      };

      const { result } = renderHook(() => useTickets(initialParams));

      expect(result.current.filters.estado).toBe('abierto');
      expect(result.current.filters.prioridad).toBe('alta');
    });
  });

  describe('Carga de tickets', () => {
    it('debería cargar tickets exitosamente', async () => {
      const mockTickets = [
        { id: 1, titulo: 'Ticket 1', estado: 'abierto' },
        { id: 2, titulo: 'Ticket 2', estado: 'cerrado' },
      ];

      const mockResponse = {
        success: true,
        data: mockTickets,
        meta: {
          last_page: 2,
          total: 15,
        },
      };

      mockTicketService.getTickets.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.pagination.totalPages).toBe(2);
      expect(result.current.pagination.totalItems).toBe(15);
      expect(result.current.error).toBe(null);
    });

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Error al cargar tickets';
      mockTicketService.getTickets.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.tickets).toEqual([]);
      expect(mockShowToast).toHaveBeenCalledWith(
        'Error al cargar tickets: ' + errorMessage,
        'error'
      );
    });
  });

  describe('Filtros', () => {
    it('debería actualizar filtros correctamente', async () => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ estado: 'abierto' });
      });

      expect(result.current.filters.estado).toBe('abierto');
      expect(result.current.pagination.currentPage).toBe(1); // Debe resetear a página 1
    });

    it('debería buscar tickets', async () => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.search('problema conexión');
      });

      expect(result.current.filters.search).toBe('problema conexión');
    });

    it('debería filtrar por estado', async () => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByStatus('cerrado');
      });

      expect(result.current.filters.estado).toBe('cerrado');
    });

    it('debería filtrar por prioridad', async () => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.filterByPriority('urgente');
      });

      expect(result.current.filters.prioridad).toBe('urgente');
    });
  });

  describe('Paginación', () => {
    it('debería cambiar página correctamente', async () => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.changePage(3);
      });

      expect(result.current.pagination.currentPage).toBe(3);
    });
  });

  describe('Operaciones CRUD', () => {
    beforeEach(() => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });
    });

    it('debería crear un ticket exitosamente', async () => {
      const newTicketData = {
        titulo: 'Nuevo ticket',
        descripcion: 'Descripción del ticket',
        categoria: 'soporte_tecnico',
        prioridad: 'media',
      };

      const createdTicket = {
        id: 1,
        ...newTicketData,
        estado: 'abierto',
      };

      mockTicketService.createTicket.mockResolvedValue({
        success: true,
        data: createdTicket,
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let createdResult;
      await act(async () => {
        createdResult = await result.current.createTicket(newTicketData);
      });

      expect(mockTicketService.createTicket).toHaveBeenCalledWith(newTicketData);
      expect(createdResult).toEqual(createdTicket);
      expect(mockShowToast).toHaveBeenCalledWith('Ticket creado exitosamente', 'success');
    });

    it('debería manejar errores al crear ticket', async () => {
      const newTicketData = {
        titulo: '',
        descripcion: 'Descripción',
      };

      const errorMessage = 'El título es requerido';
      mockTicketService.createTicket.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.createTicket(newTicketData)).rejects.toThrow(errorMessage);
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'Error al crear ticket: ' + errorMessage,
        'error'
      );
    });

    it('debería actualizar un ticket exitosamente', async () => {
      const ticketId = 1;
      const updateData = {
        titulo: 'Título actualizado',
      };

      const updatedTicket = {
        id: ticketId,
        titulo: 'Título actualizado',
        estado: 'abierto',
      };

      mockTicketService.updateTicket.mockResolvedValue({
        success: true,
        data: updatedTicket,
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateTicket(ticketId, updateData);
      });

      expect(mockTicketService.updateTicket).toHaveBeenCalledWith(ticketId, updateData);
      expect(updateResult).toEqual(updatedTicket);
      expect(mockShowToast).toHaveBeenCalledWith('Ticket actualizado exitosamente', 'success');
    });

    it('debería eliminar un ticket exitosamente', async () => {
      const ticketId = 1;

      mockTicketService.deleteTicket.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let deleteResult;
      await act(async () => {
        deleteResult = await result.current.deleteTicket(ticketId);
      });

      expect(mockTicketService.deleteTicket).toHaveBeenCalledWith(ticketId);
      expect(deleteResult).toBe(true);
      expect(mockShowToast).toHaveBeenCalledWith('Ticket eliminado exitosamente', 'success');
    });
  });

  describe('Operaciones específicas', () => {
    beforeEach(() => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });
    });

    it('debería asignar un ticket', async () => {
      const ticketId = 1;
      const userId = 2;

      mockTicketService.assignTicket.mockResolvedValue({
        success: true,
        data: { id: ticketId, usuario_asignado: userId },
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.assignTicket(ticketId, userId);
      });

      expect(mockTicketService.assignTicket).toHaveBeenCalledWith(ticketId, userId);
      expect(mockShowToast).toHaveBeenCalledWith('Ticket asignado exitosamente', 'success');
    });

    it('debería resolver un ticket', async () => {
      const ticketId = 1;
      const resolutionData = {
        solucion: 'Problema resuelto',
      };

      mockTicketService.resolveTicket.mockResolvedValue({
        success: true,
        data: { id: ticketId, estado: 'resuelto' },
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.resolveTicket(ticketId, resolutionData);
      });

      expect(mockTicketService.resolveTicket).toHaveBeenCalledWith(ticketId, resolutionData);
      expect(mockShowToast).toHaveBeenCalledWith('Ticket resuelto exitosamente', 'success');
    });

    it('debería cerrar un ticket', async () => {
      const ticketId = 1;
      const closureData = {
        comentarios_cierre: 'Ticket cerrado',
        satisfaccion: 5,
      };

      mockTicketService.closeTicket.mockResolvedValue({
        success: true,
        data: { id: ticketId, estado: 'cerrado' },
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.closeTicket(ticketId, closureData);
      });

      expect(mockTicketService.closeTicket).toHaveBeenCalledWith(ticketId, closureData);
      expect(mockShowToast).toHaveBeenCalledWith('Ticket cerrado exitosamente', 'success');
    });
  });

  describe('Función refresh', () => {
    it('debería recargar los tickets', async () => {
      mockTicketService.getTickets.mockResolvedValue({
        success: true,
        data: [],
        meta: {},
      });

      const { result } = renderHook(() => useTickets());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Limpiar las llamadas anteriores
      mockTicketService.getTickets.mockClear();

      act(() => {
        result.current.refresh();
      });

      expect(mockTicketService.getTickets).toHaveBeenCalled();
    });
  });
});

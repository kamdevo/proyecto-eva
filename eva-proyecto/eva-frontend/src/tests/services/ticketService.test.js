/**
 * ========================================
 * PRUEBAS UNITARIAS - TICKET SERVICE
 * ========================================
 *
 * Pruebas completas para el servicio de tickets
 * Incluye mocking de HTTP client y validación de respuestas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ticketService from '../../services/ticketService';
import httpClient from '../../services/httpClient';

// Mock del httpClient
vi.mock('../../services/httpClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock de la configuración API
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    TICKETS: {
      LIST: '/tickets',
      SHOW: (id) => `/tickets/${id}`,
      CREATE: '/tickets',
      UPDATE: (id) => `/tickets/${id}`,
      DELETE: (id) => `/tickets/${id}`,
      ASSIGN: (id) => `/tickets/${id}/asignar`,
      RESOLVE: (id) => `/tickets/${id}/resolver`,
      CLOSE: (id) => `/tickets/${id}/cerrar`,
      REOPEN: (id) => `/tickets/${id}/reabrir`,
      CHANGE_CATEGORY: (id) => `/tickets/${id}/cambiar-categoria`,
      CHANGE_PRIORITY: (id) => `/tickets/${id}/cambiar-prioridad`,
      FILTER_BY_STATUS: (status) => `/tickets/filtrar/estado/${status}`,
      OPEN: '/tickets/abiertos',
      MY_TICKETS: '/tickets/mis-tickets',
      STATS_GENERAL: '/tickets/estadisticas/general',
      STATS_BY_CATEGORY: '/tickets/estadisticas/por-categoria',
      COMMENTS: (id) => `/tickets/${id}/comentarios`,
      ADD_COMMENT: (id) => `/tickets/${id}/comentarios`,
      HISTORY: (id) => `/tickets/${id}/historial`,
      CONFIG: '/tickets/configuracion',
      EXPORT: '/tickets/export',
    },
  },
  buildUrlWithParams: vi.fn((url, params) => {
    if (!params || Object.keys(params).length === 0) return url;
    const searchParams = new URLSearchParams(params);
    return `${url}?${searchParams.toString()}`;
  }),
}));

describe('TicketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTickets', () => {
    it('debería obtener lista de tickets exitosamente', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, titulo: 'Ticket 1', estado: 'abierto' },
            { id: 2, titulo: 'Ticket 2', estado: 'cerrado' },
          ],
          meta: {
            total: 2,
            last_page: 1,
            current_page: 1,
          },
          message: 'Tickets obtenidos exitosamente',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ticketService.getTickets();

      expect(httpClient.get).toHaveBeenCalledWith('/tickets');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data.data);
      expect(result.meta).toEqual(mockResponse.data.meta);
    });

    it('debería manejar parámetros de consulta', async () => {
      const mockResponse = {
        data: {
          data: [],
          meta: { total: 0 },
          message: 'Sin resultados',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const params = { estado: 'abierto', page: 2 };
      await ticketService.getTickets(params);

      expect(httpClient.get).toHaveBeenCalledWith('/tickets?estado=abierto&page=2');
    });

    it('debería manejar errores de red', async () => {
      const errorMessage = 'Error de conexión';
      httpClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(ticketService.getTickets()).rejects.toThrow(errorMessage);
    });
  });

  describe('getTicketById', () => {
    it('debería obtener un ticket por ID', async () => {
      const ticketId = 1;
      const mockTicket = {
        id: ticketId,
        titulo: 'Ticket de prueba',
        descripcion: 'Descripción del ticket',
        estado: 'abierto',
      };

      const mockResponse = {
        data: {
          data: mockTicket,
          message: 'Ticket obtenido exitosamente',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ticketService.getTicketById(ticketId);

      expect(httpClient.get).toHaveBeenCalledWith(`/tickets/${ticketId}`);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTicket);
    });

    it('debería manejar ticket no encontrado', async () => {
      const ticketId = 999;
      const errorResponse = {
        response: {
          data: {
            message: 'Ticket no encontrado',
          },
        },
      };

      httpClient.get.mockRejectedValue(errorResponse);

      await expect(ticketService.getTicketById(ticketId)).rejects.toThrow('Ticket no encontrado');
    });
  });

  describe('createTicket', () => {
    it('debería crear un ticket exitosamente', async () => {
      const ticketData = {
        titulo: 'Nuevo ticket',
        descripcion: 'Descripción del nuevo ticket',
        categoria: 'soporte_tecnico',
        prioridad: 'media',
      };

      const mockCreatedTicket = {
        id: 1,
        ...ticketData,
        estado: 'abierto',
        fecha_creacion: '2024-01-01',
      };

      const mockResponse = {
        data: {
          data: mockCreatedTicket,
          message: 'Ticket creado exitosamente',
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await ticketService.createTicket(ticketData);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/tickets',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedTicket);
    });

    it('debería manejar archivo adjunto', async () => {
      const file = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
      const ticketData = {
        titulo: 'Ticket con archivo',
        descripcion: 'Ticket con archivo adjunto',
        categoria: 'soporte_tecnico',
        prioridad: 'alta',
        archivo_adjunto: file,
      };

      const mockResponse = {
        data: {
          data: { id: 1, ...ticketData },
          message: 'Ticket creado con archivo',
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      await ticketService.createTicket(ticketData);

      const formDataCall = httpClient.post.mock.calls[0][1];
      expect(formDataCall).toBeInstanceOf(FormData);
    });

    it('debería manejar errores de validación', async () => {
      const invalidTicketData = {
        titulo: '', // Título vacío
        descripcion: 'Descripción válida',
      };

      const errorResponse = {
        response: {
          data: {
            message: 'El título es requerido',
          },
        },
      };

      httpClient.post.mockRejectedValue(errorResponse);

      await expect(ticketService.createTicket(invalidTicketData)).rejects.toThrow('El título es requerido');
    });
  });

  describe('updateTicket', () => {
    it('debería actualizar un ticket exitosamente', async () => {
      const ticketId = 1;
      const updateData = {
        titulo: 'Título actualizado',
        descripcion: 'Descripción actualizada',
      };

      const mockUpdatedTicket = {
        id: ticketId,
        ...updateData,
        estado: 'abierto',
      };

      const mockResponse = {
        data: {
          data: mockUpdatedTicket,
          message: 'Ticket actualizado exitosamente',
        },
      };

      httpClient.put.mockResolvedValue(mockResponse);

      const result = await ticketService.updateTicket(ticketId, updateData);

      expect(httpClient.put).toHaveBeenCalledWith(`/tickets/${ticketId}`, updateData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedTicket);
    });
  });

  describe('deleteTicket', () => {
    it('debería eliminar un ticket exitosamente', async () => {
      const ticketId = 1;
      const mockResponse = {
        data: {
          message: 'Ticket eliminado exitosamente',
        },
      };

      httpClient.delete.mockResolvedValue(mockResponse);

      const result = await ticketService.deleteTicket(ticketId);

      expect(httpClient.delete).toHaveBeenCalledWith(`/tickets/${ticketId}`);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Ticket eliminado exitosamente');
    });
  });

  describe('assignTicket', () => {
    it('debería asignar un ticket a un usuario', async () => {
      const ticketId = 1;
      const userId = 2;
      const mockResponse = {
        data: {
          data: { id: ticketId, usuario_asignado: userId },
          message: 'Ticket asignado exitosamente',
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await ticketService.assignTicket(ticketId, userId);

      expect(httpClient.post).toHaveBeenCalledWith(`/tickets/${ticketId}/asignar`, {
        usuario_asignado: userId,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('resolveTicket', () => {
    it('debería resolver un ticket', async () => {
      const ticketId = 1;
      const resolutionData = {
        solucion: 'Problema resuelto',
        comentarios_cierre: 'Todo funcionando correctamente',
      };

      const mockResponse = {
        data: {
          data: { id: ticketId, estado: 'resuelto', ...resolutionData },
          message: 'Ticket resuelto exitosamente',
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await ticketService.resolveTicket(ticketId, resolutionData);

      expect(httpClient.post).toHaveBeenCalledWith(`/tickets/${ticketId}/resolver`, resolutionData);
      expect(result.success).toBe(true);
    });
  });

  describe('closeTicket', () => {
    it('debería cerrar un ticket', async () => {
      const ticketId = 1;
      const closureData = {
        comentarios_cierre: 'Ticket cerrado por el usuario',
        satisfaccion: 5,
      };

      const mockResponse = {
        data: {
          data: { id: ticketId, estado: 'cerrado', ...closureData },
          message: 'Ticket cerrado exitosamente',
        },
      };

      httpClient.post.mockResolvedValue(mockResponse);

      const result = await ticketService.closeTicket(ticketId, closureData);

      expect(httpClient.post).toHaveBeenCalledWith(`/tickets/${ticketId}/cerrar`, closureData);
      expect(result.success).toBe(true);
    });
  });

  describe('getMyTickets', () => {
    it('debería obtener tickets del usuario actual', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, titulo: 'Mi ticket 1', usuario_asignado: 1 },
            { id: 2, titulo: 'Mi ticket 2', usuario_asignado: 1 },
          ],
          meta: { total: 2 },
          message: 'Mis tickets obtenidos',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ticketService.getMyTickets();

      expect(httpClient.get).toHaveBeenCalledWith('/tickets/mis-tickets');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getGeneralStats', () => {
    it('debería obtener estadísticas generales', async () => {
      const mockStats = {
        total_tickets: 100,
        tickets_abiertos: 25,
        tickets_cerrados: 75,
        tiempo_promedio_resolucion: 4.5,
      };

      const mockResponse = {
        data: {
          data: mockStats,
          message: 'Estadísticas obtenidas',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ticketService.getGeneralStats();

      expect(httpClient.get).toHaveBeenCalledWith('/tickets/estadisticas/general');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
    });
  });

  describe('searchTickets', () => {
    it('debería buscar tickets por término', async () => {
      const searchTerm = 'problema conexión';
      const mockResponse = {
        data: {
          data: [
            { id: 1, titulo: 'Problema de conexión WiFi' },
            { id: 2, titulo: 'Conexión lenta' },
          ],
          meta: { total: 2 },
          message: 'Resultados de búsqueda',
        },
      };

      httpClient.get.mockResolvedValue(mockResponse);

      const result = await ticketService.searchTickets(searchTerm);

      expect(httpClient.get).toHaveBeenCalledWith(`/tickets?search=${encodeURIComponent(searchTerm)}`);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });
});

/**
 * ========================================
 * SERVICIO DE TICKETS - SISTEMA EVA
 * ========================================
 *
 * Servicio especializado para gestión completa de tickets
 * Incluye operaciones CRUD, filtros, estadísticas y notificaciones
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';
import cacheService from './cacheService.js';

class TicketService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.TICKETS.BASE;
  }

  /**
   * ========================================
   * OPERACIONES CRUD BÁSICAS
   * ========================================
   */

  /**
   * Obtener lista de tickets con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de tickets
   */
  async getTickets(params = {}) {
    try {
      // Generar clave de caché
      const cacheKey = cacheService.generateKey('tickets:list', params);

      // Intentar obtener del caché
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const url = buildUrlWithParams(API_ENDPOINTS.TICKETS.LIST, params);

      const result = await retryRequest(async () => {
        const response = await httpClient.get(url);
        return {
          success: true,
          data: response.data.data,
          meta: response.data.meta,
          message: response.data.message
        };
      });

      // Guardar en caché
      const ttl = cacheService.getTTLForType('tickets');
      cacheService.set(cacheKey, result, ttl);

      return result;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tickets');
    }
  }

  /**
   * Obtener ticket por ID
   * @param {number} id - ID del ticket
   * @returns {Promise} Datos del ticket
   */
  async getTicketById(id) {
    try {
      // Generar clave de caché
      const cacheKey = cacheService.generateKey('tickets:detail', { id });

      // Intentar obtener del caché
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await httpClient.get(API_ENDPOINTS.TICKETS.SHOW(id));
      const result = {
        success: true,
        data: response.data.data,
        message: response.data.message
      };

      // Guardar en caché
      const ttl = cacheService.getTTLForType('tickets');
      cacheService.set(cacheKey, result, ttl);

      return result;
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener ticket');
    }
  }

  /**
   * Crear nuevo ticket
   * @param {Object} ticketData - Datos del ticket
   * @returns {Promise} Ticket creado
   */
  async createTicket(ticketData) {
    try {
      const formData = new FormData();
      
      // Agregar campos básicos
      Object.keys(ticketData).forEach(key => {
        if (key !== 'archivo_adjunto' && ticketData[key] !== null && ticketData[key] !== undefined) {
          formData.append(key, ticketData[key]);
        }
      });

      // Agregar archivo si existe
      if (ticketData.archivo_adjunto) {
        formData.append('archivo_adjunto', ticketData.archivo_adjunto);
      }

      const response = await httpClient.post(API_ENDPOINTS.TICKETS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = {
        success: true,
        data: response.data.data,
        message: response.data.message
      };

      // Invalidar caché de listas de tickets
      cacheService.invalidatePattern('tickets:list:.*');
      cacheService.invalidatePattern('tickets:stats:.*');

      return result;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error(error.response?.data?.message || 'Error al crear ticket');
    }
  }

  /**
   * Actualizar ticket
   * @param {number} id - ID del ticket
   * @param {Object} ticketData - Datos actualizados
   * @returns {Promise} Ticket actualizado
   */
  async updateTicket(id, ticketData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.TICKETS.UPDATE(id), ticketData);
      const result = {
        success: true,
        data: response.data.data,
        message: response.data.message
      };

      // Invalidar caché relacionado
      cacheService.delete(cacheService.generateKey('tickets:detail', { id }));
      cacheService.invalidatePattern('tickets:list:.*');
      cacheService.invalidatePattern('tickets:stats:.*');

      return result;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar ticket');
    }
  }

  /**
   * Eliminar ticket
   * @param {number} id - ID del ticket
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteTicket(id) {
    try {
      const response = await httpClient.delete(API_ENDPOINTS.TICKETS.DELETE(id));
      const result = {
        success: true,
        message: response.data.message
      };

      // Invalidar caché relacionado
      cacheService.delete(cacheService.generateKey('tickets:detail', { id }));
      cacheService.invalidatePattern('tickets:list:.*');
      cacheService.invalidatePattern('tickets:stats:.*');

      return result;
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al eliminar ticket');
    }
  }

  /**
   * ========================================
   * OPERACIONES ESPECÍFICAS DE GESTIÓN
   * ========================================
   */

  /**
   * Asignar ticket a un usuario
   * @param {number} id - ID del ticket
   * @param {number} userId - ID del usuario asignado
   * @returns {Promise} Ticket asignado
   */
  async assignTicket(id, userId) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.ASSIGN(id), {
        usuario_asignado: userId
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error assigning ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al asignar ticket');
    }
  }

  /**
   * Resolver ticket
   * @param {number} id - ID del ticket
   * @param {Object} resolutionData - Datos de resolución
   * @returns {Promise} Ticket resuelto
   */
  async resolveTicket(id, resolutionData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.RESOLVE(id), resolutionData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error resolving ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al resolver ticket');
    }
  }

  /**
   * Cerrar ticket
   * @param {number} id - ID del ticket
   * @param {Object} closureData - Datos de cierre
   * @returns {Promise} Ticket cerrado
   */
  async closeTicket(id, closureData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.CLOSE(id), closureData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error closing ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al cerrar ticket');
    }
  }

  /**
   * Reabrir ticket
   * @param {number} id - ID del ticket
   * @param {string} reason - Razón para reabrir
   * @returns {Promise} Ticket reabierto
   */
  async reopenTicket(id, reason) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.REOPEN(id), {
        razon_reapertura: reason
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error reopening ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al reabrir ticket');
    }
  }

  /**
   * Cambiar categoría del ticket
   * @param {number} id - ID del ticket
   * @param {string} category - Nueva categoría
   * @returns {Promise} Ticket actualizado
   */
  async changeCategory(id, category) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.CHANGE_CATEGORY(id), {
        categoria: category
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error changing category for ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al cambiar categoría');
    }
  }

  /**
   * Cambiar prioridad del ticket
   * @param {number} id - ID del ticket
   * @param {string} priority - Nueva prioridad
   * @returns {Promise} Ticket actualizado
   */
  async changePriority(id, priority) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.CHANGE_PRIORITY(id), {
        prioridad: priority
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error changing priority for ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al cambiar prioridad');
    }
  }

  /**
   * ========================================
   * FILTROS Y BÚSQUEDAS
   * ========================================
   */

  /**
   * Obtener tickets por estado
   * @param {string} status - Estado del ticket
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise} Lista de tickets filtrados
   */
  async getTicketsByStatus(status, params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.TICKETS.FILTER_BY_STATUS(status), params);
      const response = await httpClient.get(url);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching tickets by status ${status}:`, error);
      throw new Error(error.response?.data?.message || 'Error al filtrar tickets por estado');
    }
  }

  /**
   * Obtener tickets abiertos
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de tickets abiertos
   */
  async getOpenTickets(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.TICKETS.OPEN, params);
      const response = await httpClient.get(url);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching open tickets:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tickets abiertos');
    }
  }

  /**
   * Obtener mis tickets asignados
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de tickets asignados al usuario actual
   */
  async getMyTickets(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.TICKETS.MY_TICKETS, params);
      const response = await httpClient.get(url);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mis tickets');
    }
  }

  /**
   * Obtener tickets cerrados
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de tickets cerrados
   */
  async getClosedTickets(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.TICKETS.LIST, { ...params, estado: 'cerrado' });
      const response = await httpClient.get(url);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching closed tickets:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tickets cerrados');
    }
  }

  /**
   * Actualizar ticket
   * @param {string|number} id - ID del ticket
   * @param {Object} ticketData - Datos actualizados
   * @returns {Promise} Ticket actualizado
   */
  async updateTicket(id, ticketData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.put(`${this.baseUrl}/${id}`, ticketData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Ticket actualizado exitosamente'
        };
      });

      // Limpiar caché relacionado
      cacheService.clearPattern('tickets:');
      cacheService.remove(`ticket:${id}`);

      return result;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el ticket');
    }
  }

  /**
   * Eliminar ticket
   * @param {string|number} id - ID del ticket
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteTicket(id) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.delete(`${this.baseUrl}/${id}`);
        return {
          success: true,
          message: response.data.message || 'Ticket eliminado exitosamente'
        };
      });

      // Limpiar caché
      cacheService.clearPattern('tickets:');
      cacheService.remove(`ticket:${id}`);

      return result;
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el ticket');
    }
  }

  /**
   * Cambiar estado de ticket
   * @param {string|number} id - ID del ticket
   * @param {string} estado - Nuevo estado
   * @param {string} observaciones - Observaciones del cambio
   * @returns {Promise} Ticket actualizado
   */
  async changeTicketStatus(id, estado, observaciones = '') {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.patch(`${this.baseUrl}/${id}/status`, {
          estado,
          observaciones,
          fecha_cambio: new Date().toISOString()
        });
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || `Estado cambiado a ${estado} exitosamente`
        };
      });

      // Limpiar caché
      cacheService.clearPattern('tickets:');
      cacheService.remove(`ticket:${id}`);

      return result;
    } catch (error) {
      console.error(`Error changing ticket ${id} status:`, error);
      throw new Error(error.response?.data?.message || 'Error al cambiar el estado del ticket');
    }
  }

  /**
   * Asignar técnico a ticket
   * @param {string|number} ticketId - ID del ticket
   * @param {string|number} tecnicoId - ID del técnico
   * @returns {Promise} Ticket actualizado
   */
  async assignTechnician(ticketId, tecnicoId) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.patch(`${this.baseUrl}/${ticketId}/assign`, {
          tecnico_id: tecnicoId,
          fecha_asignacion: new Date().toISOString()
        });
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Técnico asignado exitosamente'
        };
      });

      // Limpiar caché
      cacheService.clearPattern('tickets:');
      cacheService.remove(`ticket:${ticketId}`);

      return result;
    } catch (error) {
      console.error(`Error assigning technician to ticket ${ticketId}:`, error);
      throw new Error(error.response?.data?.message || 'Error al asignar técnico');
    }
  }

  /**
   * ========================================
   * ESTADÍSTICAS Y REPORTES
   * ========================================
   */

  /**
   * Obtener estadísticas generales de tickets
   * @returns {Promise} Estadísticas generales
   */
  async getGeneralStats() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.TICKETS.STATS_GENERAL);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching general stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  /**
   * Obtener estadísticas por categoría
   * @returns {Promise} Estadísticas por categoría
   */
  async getStatsByCategory() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.TICKETS.STATS_BY_CATEGORY);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching stats by category:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas por categoría');
    }
  }

  /**
   * ========================================
   * COMENTARIOS Y SEGUIMIENTO
   * ========================================
   */

  /**
   * Obtener comentarios de un ticket
   * @param {number} id - ID del ticket
   * @returns {Promise} Lista de comentarios
   */
  async getTicketComments(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.TICKETS.COMMENTS(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching comments for ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener comentarios');
    }
  }

  /**
   * Agregar comentario a un ticket
   * @param {number} id - ID del ticket
   * @param {string} comment - Comentario a agregar
   * @returns {Promise} Comentario agregado
   */
  async addComment(id, comment) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.ADD_COMMENT(id), {
        comentario: comment
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error adding comment to ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al agregar comentario');
    }
  }

  /**
   * Obtener historial de un ticket
   * @param {number} id - ID del ticket
   * @returns {Promise} Historial del ticket
   */
  async getTicketHistory(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.TICKETS.HISTORY(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error fetching history for ticket ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener historial');
    }
  }

  /**
   * ========================================
   * UTILIDADES Y HELPERS
   * ========================================
   */

  /**
   * Obtener configuración de tickets
   * @returns {Promise} Configuración del sistema
   */
  async getConfig() {
    try {
      const response = await httpClient.get(API_ENDPOINTS.TICKETS.CONFIG);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching ticket config:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener configuración');
    }
  }

  /**
   * Exportar tickets
   * @param {Object} params - Parámetros de exportación
   * @returns {Promise} Archivo de exportación
   */
  async exportTickets(params = {}) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.TICKETS.EXPORT, params, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data,
        message: 'Exportación completada'
      };
    } catch (error) {
      console.error('Error exporting tickets:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar tickets');
    }
  }

  /**
   * Buscar tickets con término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise} Resultados de búsqueda
   */
  async searchTickets(searchTerm, params = {}) {
    try {
      const searchParams = { ...params, search: searchTerm };
      const url = buildUrlWithParams(API_ENDPOINTS.TICKETS.LIST, searchParams);
      const response = await httpClient.get(url);
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error searching tickets:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar tickets');
    }
  }

  /**
   * Subir archivos adjuntos a un ticket
   * @param {string|number} ticketId - ID del ticket
   * @param {FileList|Array} files - Archivos a subir
   * @returns {Promise} Archivos subidos
   */
  async uploadFiles(ticketId, files) {
    try {
      const formData = new FormData();

      // Agregar archivos al FormData
      Array.from(files).forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      formData.append('ticket_id', ticketId);

      const result = await retryRequest(async () => {
        const response = await httpClient.post(
          `${this.baseUrl}/${ticketId}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Archivos subidos exitosamente'
        };
      });

      return result;
    } catch (error) {
      console.error(`Error uploading files to ticket ${ticketId}:`, error);
      throw new Error(error.response?.data?.message || 'Error al subir archivos');
    }
  }

  /**
   * Obtener estadísticas de tickets
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise} Estadísticas
   */
  async getTicketStats(params = {}) {
    try {
      const cacheKey = cacheService.generateKey('tickets:stats', params);
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const url = buildUrlWithParams(`${this.baseUrl}/stats`, params);

      const result = await retryRequest(async () => {
        const response = await httpClient.get(url);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Estadísticas obtenidas exitosamente'
        };
      });

      // Cachear por 5 minutos
      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);

      // Retornar estadísticas de fallback
      return {
        success: true,
        data: {
          total: 0,
          abiertos: 0,
          en_proceso: 0,
          cerrados: 0,
          por_prioridad: { alta: 0, media: 0, baja: 0 },
          por_tipo: { licensed: 0, industrial: 0, infrastructure: 0 }
        },
        message: 'Estadísticas de ejemplo - Sin conexión al servidor'
      };
    }
  }
}

// Instancia única del servicio
const ticketService = new TicketService();

export default ticketService;

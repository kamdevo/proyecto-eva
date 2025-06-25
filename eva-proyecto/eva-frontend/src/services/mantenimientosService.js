/**
 * Servicio para gestión de mantenimientos
 * Maneja todas las operaciones CRUD y funcionalidades específicas de mantenimientos
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';

class MantenimientosService {
  /**
   * Obtener lista de mantenimientos con filtros y paginación
   */
  async getMantenimientos(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.MANTENIMIENTOS.LIST, params);
      
      return await retryRequest(async () => {
        const response = await httpClient.get(url);
        return {
          success: true,
          data: response.data.data,
          meta: response.data.meta,
          message: response.data.message
        };
      });
    } catch (error) {
      console.error('Error getting mantenimientos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mantenimientos');
    }
  }

  /**
   * Obtener un mantenimiento específico por ID
   */
  async getMantenimiento(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.MANTENIMIENTOS.SHOW(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mantenimiento');
    }
  }

  /**
   * Crear nuevo mantenimiento
   */
  async createMantenimiento(mantenimientoData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.MANTENIMIENTOS.CREATE, mantenimientoData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Mantenimiento creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al crear mantenimiento');
    }
  }

  /**
   * Actualizar mantenimiento existente
   */
  async updateMantenimiento(id, mantenimientoData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.MANTENIMIENTOS.UPDATE(id), mantenimientoData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Mantenimiento actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar mantenimiento');
    }
  }

  /**
   * Eliminar mantenimiento
   */
  async deleteMantenimiento(id) {
    try {
      const response = await httpClient.delete(API_ENDPOINTS.MANTENIMIENTOS.DELETE(id));
      return {
        success: true,
        message: response.data.message || 'Mantenimiento eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar mantenimiento');
    }
  }

  /**
   * Programar mantenimiento
   */
  async scheduleMantenimiento(scheduleData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.MANTENIMIENTOS.SCHEDULE, scheduleData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Mantenimiento programado exitosamente'
      };
    } catch (error) {
      console.error('Error scheduling mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al programar mantenimiento');
    }
  }

  /**
   * Completar mantenimiento
   */
  async completeMantenimiento(id, completionData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.MANTENIMIENTOS.COMPLETE(id), completionData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Mantenimiento completado exitosamente'
      };
    } catch (error) {
      console.error('Error completing mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al completar mantenimiento');
    }
  }

  /**
   * Cancelar mantenimiento
   */
  async cancelMantenimiento(id, reason) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.MANTENIMIENTOS.CANCEL(id), { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Mantenimiento cancelado exitosamente'
      };
    } catch (error) {
      console.error('Error canceling mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al cancelar mantenimiento');
    }
  }

  /**
   * Obtener mantenimientos pendientes
   */
  async getPendingMantenimientos(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.MANTENIMIENTOS.PENDING, params);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting pending mantenimientos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mantenimientos pendientes');
    }
  }

  /**
   * Obtener mantenimientos vencidos
   */
  async getOverdueMantenimientos(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.MANTENIMIENTOS.OVERDUE, params);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting overdue mantenimientos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mantenimientos vencidos');
    }
  }

  /**
   * Obtener calendario de mantenimientos
   */
  async getMantenimientosCalendar(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.MANTENIMIENTOS.CALENDAR, params);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting mantenimientos calendar:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener calendario');
    }
  }

  /**
   * Exportar mantenimientos
   */
  async exportMantenimientos(format = 'excel', filters = {}) {
    try {
      const params = {
        format,
        ...filters
      };

      const response = await httpClient.get(
        buildUrlWithParams(API_ENDPOINTS.MANTENIMIENTOS.EXPORT, params),
        {
          responseType: 'blob'
        }
      );

      // Crear URL para descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `mantenimientos_export.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      return {
        success: true,
        url,
        filename,
        message: 'Exportación completada exitosamente'
      };
    } catch (error) {
      console.error('Error exporting mantenimientos:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar mantenimientos');
    }
  }

  /**
   * Obtener estadísticas de mantenimientos
   */
  async getMantenimientosStats(filters = {}) {
    try {
      const url = buildUrlWithParams('/mantenimiento/stats', filters);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting mantenimientos stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  /**
   * Obtener mantenimientos por equipo
   */
  async getMantenimientosByEquipo(equipoId, params = {}) {
    try {
      const url = buildUrlWithParams(`/equipos/${equipoId}/mantenimientos`, params);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting mantenimientos by equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mantenimientos del equipo');
    }
  }

  /**
   * Generar plan de mantenimiento automático
   */
  async generateMaintenancePlan(equipoId, planData) {
    try {
      const response = await httpClient.post(`/equipos/${equipoId}/generate-plan`, planData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Plan de mantenimiento generado exitosamente'
      };
    } catch (error) {
      console.error('Error generating maintenance plan:', error);
      throw new Error(error.response?.data?.message || 'Error al generar plan de mantenimiento');
    }
  }

  /**
   * Subir evidencias de mantenimiento
   */
  async uploadMaintenanceEvidence(mantenimientoId, files, metadata = {}) {
    try {
      const formData = new FormData();
      
      // Agregar archivos
      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      } else {
        formData.append('file', files);
      }
      
      // Agregar metadata
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await httpClient.post(
        `/mantenimiento/${mantenimientoId}/evidence`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Evidencias subidas exitosamente'
      };
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw new Error(error.response?.data?.message || 'Error al subir evidencias');
    }
  }
}

// Crear instancia singleton
const mantenimientosService = new MantenimientosService();

export default mantenimientosService;

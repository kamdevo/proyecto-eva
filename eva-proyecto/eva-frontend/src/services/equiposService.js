/**
 * Servicio para gestión de equipos
 * Maneja todas las operaciones CRUD y funcionalidades específicas de equipos
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';

class EquiposService {
  /**
   * Obtener lista de equipos con filtros y paginación
   */
  async getEquipos(params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.EQUIPOS.LIST, params);
      
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
      console.error('Error getting equipos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener equipos');
    }
  }

  /**
   * Obtener un equipo específico por ID
   */
  async getEquipo(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.EQUIPOS.SHOW(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener equipo');
    }
  }

  /**
   * Crear nuevo equipo
   */
  async createEquipo(equipoData) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.EQUIPOS.CREATE, equipoData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Equipo creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al crear equipo');
    }
  }

  /**
   * Actualizar equipo existente
   */
  async updateEquipo(id, equipoData) {
    try {
      const response = await httpClient.put(API_ENDPOINTS.EQUIPOS.UPDATE(id), equipoData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Equipo actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar equipo');
    }
  }

  /**
   * Eliminar equipo
   */
  async deleteEquipo(id) {
    try {
      const response = await httpClient.delete(API_ENDPOINTS.EQUIPOS.DELETE(id));
      return {
        success: true,
        message: response.data.message || 'Equipo eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error deleting equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar equipo');
    }
  }

  /**
   * Buscar equipos
   */
  async searchEquipos(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      
      const url = buildUrlWithParams(API_ENDPOINTS.EQUIPOS.SEARCH, params);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error searching equipos:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar equipos');
    }
  }

  /**
   * Duplicar equipo
   */
  async duplicateEquipo(id) {
    try {
      const response = await httpClient.post(API_ENDPOINTS.EQUIPOS.DUPLICATE(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Equipo duplicado exitosamente'
      };
    } catch (error) {
      console.error('Error duplicating equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al duplicar equipo');
    }
  }

  /**
   * Obtener historial de un equipo
   */
  async getEquipoHistory(id, params = {}) {
    try {
      const url = buildUrlWithParams(API_ENDPOINTS.EQUIPOS.HISTORY(id), params);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting equipo history:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener historial');
    }
  }

  /**
   * Obtener archivos de un equipo
   */
  async getEquipoFiles(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.EQUIPOS.FILES(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting equipo files:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener archivos');
    }
  }

  /**
   * Subir archivo para un equipo
   */
  async uploadEquipoFile(id, file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Agregar metadata
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await httpClient.post(
        API_ENDPOINTS.EQUIPOS.FILES(id),
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
        message: response.data.message || 'Archivo subido exitosamente'
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Error al subir archivo');
    }
  }

  /**
   * Obtener especificaciones de un equipo
   */
  async getEquipoSpecifications(id) {
    try {
      const response = await httpClient.get(API_ENDPOINTS.EQUIPOS.SPECIFICATIONS(id));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting specifications:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener especificaciones');
    }
  }

  /**
   * Actualizar especificaciones de un equipo
   */
  async updateEquipoSpecifications(id, specifications) {
    try {
      const response = await httpClient.put(
        API_ENDPOINTS.EQUIPOS.SPECIFICATIONS(id),
        { specifications }
      );
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Especificaciones actualizadas exitosamente'
      };
    } catch (error) {
      console.error('Error updating specifications:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar especificaciones');
    }
  }

  /**
   * Exportar equipos
   */
  async exportEquipos(format = 'excel', filters = {}) {
    try {
      const params = {
        format,
        ...filters
      };

      const response = await httpClient.get(
        buildUrlWithParams(API_ENDPOINTS.EQUIPOS.EXPORT, params),
        {
          responseType: 'blob'
        }
      );

      // Crear URL para descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = `equipos_export.${format}`;
      
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
      console.error('Error exporting equipos:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar equipos');
    }
  }

  /**
   * Importar equipos desde archivo
   */
  async importEquipos(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Agregar opciones de importación
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await httpClient.post(
        API_ENDPOINTS.EQUIPOS.IMPORT,
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
        message: response.data.message || 'Importación completada exitosamente'
      };
    } catch (error) {
      console.error('Error importing equipos:', error);
      throw new Error(error.response?.data?.message || 'Error al importar equipos');
    }
  }

  /**
   * Obtener estadísticas de equipos
   */
  async getEquiposStats(filters = {}) {
    try {
      const url = buildUrlWithParams('/equipos/stats', filters);
      const response = await httpClient.get(url);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting equipos stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
}

// Crear instancia singleton
const equiposService = new EquiposService();

export default equiposService;

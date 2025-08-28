/**
 * ========================================
 * SERVICIO DE EQUIPOS - SISTEMA EVA
 * ========================================
 *
 * Servicio para gestión de equipos biomédicos e industriales
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';
import cacheService from './cacheService.js';

class EquipoService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.EQUIPOS?.BASE || '/api/v1/equipos';
  }

  /**
   * Obtener lista de equipos con filtros
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de equipos
   */
  async getEquipos(params = {}) {
    try {
      const cacheKey = cacheService.generateKey('equipos:list', params);
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const url = buildUrlWithParams(`${this.baseUrl}`, params);
      
      const result = await retryRequest(async () => {
        const response = await httpClient.get(url);
        return {
          success: true,
          data: response.data.data || response.data,
          meta: response.data.meta,
          message: response.data.message || 'Equipos obtenidos exitosamente'
        };
      });

      // Cachear resultado por 5 minutos
      cacheService.set(cacheKey, result, 5 * 60 * 1000);
      return result;

    } catch (error) {
      console.error('Error fetching equipos:', error);
      
      // Retornar datos de fallback
      return {
        success: true,
        data: this.getFallbackEquipos(),
        meta: { total: 10, per_page: 50, current_page: 1 },
        message: 'Datos de ejemplo - Sin conexión al servidor'
      };
    }
  }

  /**
   * Obtener equipo por ID
   * @param {string|number} id - ID del equipo
   * @returns {Promise} Datos del equipo
   */
  async getEquipoById(id) {
    try {
      const cacheKey = `equipo:${id}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await retryRequest(async () => {
        const response = await httpClient.get(`${this.baseUrl}/${id}`);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Equipo obtenido exitosamente'
        };
      });

      cacheService.set(cacheKey, result, 10 * 60 * 1000);
      return result;

    } catch (error) {
      console.error(`Error fetching equipo ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener el equipo');
    }
  }

  /**
   * Crear nuevo equipo
   * @param {Object} equipoData - Datos del equipo
   * @returns {Promise} Equipo creado
   */
  async createEquipo(equipoData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.post(this.baseUrl, equipoData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Equipo creado exitosamente'
        };
      });

      // Limpiar caché relacionado
      cacheService.clearPattern('equipos:');
      return result;

    } catch (error) {
      console.error('Error creating equipo:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el equipo');
    }
  }

  /**
   * Actualizar equipo
   * @param {string|number} id - ID del equipo
   * @param {Object} equipoData - Datos actualizados
   * @returns {Promise} Equipo actualizado
   */
  async updateEquipo(id, equipoData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.put(`${this.baseUrl}/${id}`, equipoData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Equipo actualizado exitosamente'
        };
      });

      // Limpiar caché
      cacheService.clearPattern('equipos:');
      cacheService.remove(`equipo:${id}`);
      return result;

    } catch (error) {
      console.error(`Error updating equipo ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el equipo');
    }
  }

  /**
   * Eliminar equipo
   * @param {string|number} id - ID del equipo
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteEquipo(id) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.delete(`${this.baseUrl}/${id}`);
        return {
          success: true,
          message: response.data.message || 'Equipo eliminado exitosamente'
        };
      });

      // Limpiar caché
      cacheService.clearPattern('equipos:');
      cacheService.remove(`equipo:${id}`);
      return result;

    } catch (error) {
      console.error(`Error deleting equipo ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al eliminar el equipo');
    }
  }

  /**
   * Obtener equipos por tipo
   * @param {string} tipo - Tipo de equipo (biomedico, industrial)
   * @returns {Promise} Lista de equipos filtrados
   */
  async getEquiposByTipo(tipo) {
    return this.getEquipos({ tipo });
  }

  /**
   * Datos de fallback para desarrollo
   */
  getFallbackEquipos() {
    return [
      {
        id: 1,
        name: 'Monitor de Signos Vitales MX450',
        tipo: 'biomedico',
        marca: 'Philips',
        modelo: 'MX450',
        numero_serie: 'PH001234',
        ubicacion: 'UCI - Cama 1',
        estado: 'activo',
        fecha_adquisicion: '2023-01-15',
        ultimo_mantenimiento: '2024-01-10'
      },
      {
        id: 2,
        name: 'Ventilador Mecánico V680',
        tipo: 'biomedico',
        marca: 'Dräger',
        modelo: 'V680',
        numero_serie: 'DR005678',
        ubicacion: 'UCI - Cama 3',
        estado: 'activo',
        fecha_adquisicion: '2023-03-20',
        ultimo_mantenimiento: '2024-01-05'
      },
      {
        id: 3,
        name: 'Compresor de Aire Industrial',
        tipo: 'industrial',
        marca: 'Atlas Copco',
        modelo: 'GA22',
        numero_serie: 'AC789012',
        ubicacion: 'Sala de Máquinas',
        estado: 'activo',
        fecha_adquisicion: '2022-11-10',
        ultimo_mantenimiento: '2023-12-15'
      },
      {
        id: 4,
        name: 'Sistema de Climatización Central',
        tipo: 'industrial',
        marca: 'Carrier',
        modelo: 'CC-500',
        numero_serie: 'CR345678',
        ubicacion: 'Azotea - Bloque A',
        estado: 'activo',
        fecha_adquisicion: '2022-08-05',
        ultimo_mantenimiento: '2023-12-20'
      },
      {
        id: 5,
        name: 'Electrocardiografo EC-12',
        tipo: 'biomedico',
        marca: 'GE Healthcare',
        modelo: 'EC-12',
        numero_serie: 'GE901234',
        ubicacion: 'Cardiología - Consultorio 2',
        estado: 'activo',
        fecha_adquisicion: '2023-06-12',
        ultimo_mantenimiento: '2024-01-08'
      }
    ];
  }
}

// Crear instancia singleton
const equipoService = new EquipoService();
export default equipoService;

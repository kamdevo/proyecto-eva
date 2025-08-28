/**
 * ========================================
 * SERVICIO DE TÉCNICOS - SISTEMA EVA
 * ========================================
 *
 * Servicio para gestión de técnicos especializados
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';
import cacheService from './cacheService.js';

class TecnicoService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.USUARIOS?.TECNICOS || '/api/v1/usuarios/tecnicos';
  }

  /**
   * Obtener lista de técnicos
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de técnicos
   */
  async getTecnicos(params = {}) {
    try {
      const cacheKey = cacheService.generateKey('tecnicos:list', params);
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const url = buildUrlWithParams(this.baseUrl, params);
      
      const result = await retryRequest(async () => {
        const response = await httpClient.get(url);
        return {
          success: true,
          data: response.data.data || response.data,
          meta: response.data.meta,
          message: response.data.message || 'Técnicos obtenidos exitosamente'
        };
      });

      // Cachear por 10 minutos
      cacheService.set(cacheKey, result, 10 * 60 * 1000);
      return result;

    } catch (error) {
      console.error('Error fetching tecnicos:', error);
      
      return {
        success: true,
        data: this.getFallbackTecnicos(),
        meta: { total: 8, per_page: 50, current_page: 1 },
        message: 'Datos de ejemplo - Sin conexión al servidor'
      };
    }
  }

  /**
   * Obtener técnico por ID
   * @param {string|number} id - ID del técnico
   * @returns {Promise} Datos del técnico
   */
  async getTecnicoById(id) {
    try {
      const cacheKey = `tecnico:${id}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await retryRequest(async () => {
        const response = await httpClient.get(`${this.baseUrl}/${id}`);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Técnico obtenido exitosamente'
        };
      });

      cacheService.set(cacheKey, result, 15 * 60 * 1000);
      return result;

    } catch (error) {
      console.error(`Error fetching tecnico ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener el técnico');
    }
  }

  /**
   * Obtener técnicos por especialidad
   * @param {string} especialidad - Especialidad (Biomédico, Industrial, etc.)
   * @returns {Promise} Lista de técnicos filtrados
   */
  async getTecnicosByEspecialidad(especialidad) {
    return this.getTecnicos({ especialidad });
  }

  /**
   * Obtener técnicos disponibles
   * @param {string} fecha - Fecha para verificar disponibilidad
   * @param {string} hora - Hora para verificar disponibilidad
   * @returns {Promise} Lista de técnicos disponibles
   */
  async getTecnicosDisponibles(fecha, hora) {
    return this.getTecnicos({ 
      disponible: true, 
      fecha, 
      hora 
    });
  }

  /**
   * Crear nuevo técnico
   * @param {Object} tecnicoData - Datos del técnico
   * @returns {Promise} Técnico creado
   */
  async createTecnico(tecnicoData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.post(this.baseUrl, tecnicoData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Técnico creado exitosamente'
        };
      });

      cacheService.clearPattern('tecnicos:');
      return result;

    } catch (error) {
      console.error('Error creating tecnico:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el técnico');
    }
  }

  /**
   * Actualizar técnico
   * @param {string|number} id - ID del técnico
   * @param {Object} tecnicoData - Datos actualizados
   * @returns {Promise} Técnico actualizado
   */
  async updateTecnico(id, tecnicoData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.put(`${this.baseUrl}/${id}`, tecnicoData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Técnico actualizado exitosamente'
        };
      });

      cacheService.clearPattern('tecnicos:');
      cacheService.remove(`tecnico:${id}`);
      return result;

    } catch (error) {
      console.error(`Error updating tecnico ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el técnico');
    }
  }

  /**
   * Datos de fallback para desarrollo
   */
  getFallbackTecnicos() {
    return [
      {
        id: 1,
        name: 'Carlos Rodríguez',
        especialidad: 'Biomédico',
        email: 'carlos.rodriguez@eva.com',
        telefono: '+57 300 123 4567',
        cedula: '12345678',
        estado: 'activo',
        disponible: true,
        experiencia_anos: 8,
        certificaciones: ['Mantenimiento Preventivo', 'Equipos de UCI'],
        turno: 'mañana'
      },
      {
        id: 2,
        name: 'Ana María González',
        especialidad: 'Biomédico',
        email: 'ana.gonzalez@eva.com',
        telefono: '+57 301 234 5678',
        cedula: '23456789',
        estado: 'activo',
        disponible: true,
        experiencia_anos: 6,
        certificaciones: ['Imagenología', 'Equipos de Laboratorio'],
        turno: 'tarde'
      },
      {
        id: 3,
        name: 'Miguel Ángel Torres',
        especialidad: 'Industrial',
        email: 'miguel.torres@eva.com',
        telefono: '+57 302 345 6789',
        cedula: '34567890',
        estado: 'activo',
        disponible: true,
        experiencia_anos: 12,
        certificaciones: ['HVAC', 'Sistemas Eléctricos', 'Calderas'],
        turno: 'mañana'
      },
      {
        id: 4,
        name: 'Laura Patricia Vega',
        especialidad: 'Biomédico',
        email: 'laura.vega@eva.com',
        telefono: '+57 303 456 7890',
        cedula: '45678901',
        estado: 'activo',
        disponible: false,
        experiencia_anos: 4,
        certificaciones: ['Equipos de Quirófano', 'Anestesia'],
        turno: 'noche'
      },
      {
        id: 5,
        name: 'Roberto Silva',
        especialidad: 'Industrial',
        email: 'roberto.silva@eva.com',
        telefono: '+57 304 567 8901',
        cedula: '56789012',
        estado: 'activo',
        disponible: true,
        experiencia_anos: 15,
        certificaciones: ['Plomería Industrial', 'Sistemas de Vapor'],
        turno: 'mañana'
      },
      {
        id: 6,
        name: 'Diana Carolina Ruiz',
        especialidad: 'Biomédico',
        email: 'diana.ruiz@eva.com',
        telefono: '+57 305 678 9012',
        cedula: '67890123',
        estado: 'activo',
        disponible: true,
        experiencia_anos: 7,
        certificaciones: ['Cardiología', 'Monitoreo Fetal'],
        turno: 'tarde'
      }
    ];
  }
}

// Crear instancia singleton
const tecnicoService = new TecnicoService();
export default tecnicoService;

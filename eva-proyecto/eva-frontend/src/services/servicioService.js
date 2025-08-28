/**
 * ========================================
 * SERVICIO DE SERVICIOS - SISTEMA EVA
 * ========================================
 *
 * Servicio para gestión de servicios y categorías del hospital
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';
import cacheService from './cacheService.js';

class ServicioService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.SERVICIOS?.BASE || '/api/v1/servicios';
  }

  /**
   * Obtener lista de servicios
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de servicios
   */
  async getServicios(params = {}) {
    try {
      const cacheKey = cacheService.generateKey('servicios:list', params);
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
          message: response.data.message || 'Servicios obtenidos exitosamente'
        };
      });

      // Cachear por 15 minutos (los servicios cambian poco)
      cacheService.set(cacheKey, result, 15 * 60 * 1000);
      return result;

    } catch (error) {
      console.error('Error fetching servicios:', error);
      
      return {
        success: true,
        data: this.getFallbackServicios(),
        meta: { total: 15, per_page: 50, current_page: 1 },
        message: 'Datos de ejemplo - Sin conexión al servidor'
      };
    }
  }

  /**
   * Obtener servicio por ID
   * @param {string|number} id - ID del servicio
   * @returns {Promise} Datos del servicio
   */
  async getServicioById(id) {
    try {
      const cacheKey = `servicio:${id}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const result = await retryRequest(async () => {
        const response = await httpClient.get(`${this.baseUrl}/${id}`);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Servicio obtenido exitosamente'
        };
      });

      cacheService.set(cacheKey, result, 20 * 60 * 1000);
      return result;

    } catch (error) {
      console.error(`Error fetching servicio ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener el servicio');
    }
  }

  /**
   * Obtener servicios por categoría
   * @param {string} categoria - Categoría del servicio
   * @returns {Promise} Lista de servicios filtrados
   */
  async getServiciosByCategoria(categoria) {
    return this.getServicios({ categoria });
  }

  /**
   * Crear nuevo servicio
   * @param {Object} servicioData - Datos del servicio
   * @returns {Promise} Servicio creado
   */
  async createServicio(servicioData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.post(this.baseUrl, servicioData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Servicio creado exitosamente'
        };
      });

      cacheService.clearPattern('servicios:');
      return result;

    } catch (error) {
      console.error('Error creating servicio:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el servicio');
    }
  }

  /**
   * Actualizar servicio
   * @param {string|number} id - ID del servicio
   * @param {Object} servicioData - Datos actualizados
   * @returns {Promise} Servicio actualizado
   */
  async updateServicio(id, servicioData) {
    try {
      const result = await retryRequest(async () => {
        const response = await httpClient.put(`${this.baseUrl}/${id}`, servicioData);
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Servicio actualizado exitosamente'
        };
      });

      cacheService.clearPattern('servicios:');
      cacheService.remove(`servicio:${id}`);
      return result;

    } catch (error) {
      console.error(`Error updating servicio ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el servicio');
    }
  }

  /**
   * Datos de fallback para desarrollo
   */
  getFallbackServicios() {
    return [
      {
        id: 1,
        nombre: 'Unidad de Cuidados Intensivos (UCI)',
        categoria: 'Críticos',
        codigo: 'UCI-001',
        descripcion: 'Atención médica intensiva para pacientes críticos',
        ubicacion: 'Piso 3 - Ala Norte',
        responsable: 'Dr. María Fernández',
        estado: 'activo',
        capacidad: 20
      },
      {
        id: 2,
        nombre: 'Urgencias',
        categoria: 'Emergencias',
        codigo: 'URG-001',
        descripcion: 'Atención médica de emergencia 24/7',
        ubicacion: 'Piso 1 - Entrada Principal',
        responsable: 'Dr. Carlos Mendoza',
        estado: 'activo',
        capacidad: 15
      },
      {
        id: 3,
        nombre: 'Quirófanos',
        categoria: 'Quirúrgicos',
        codigo: 'QUI-001',
        descripcion: 'Salas de cirugía especializadas',
        ubicacion: 'Piso 2 - Bloque Quirúrgico',
        responsable: 'Dr. Ana Rodríguez',
        estado: 'activo',
        capacidad: 8
      },
      {
        id: 4,
        nombre: 'Laboratorio Clínico',
        categoria: 'Diagnóstico',
        codigo: 'LAB-001',
        descripcion: 'Análisis clínicos y pruebas diagnósticas',
        ubicacion: 'Piso 1 - Ala Este',
        responsable: 'Dra. Patricia López',
        estado: 'activo',
        capacidad: 50
      },
      {
        id: 5,
        nombre: 'Imagenología',
        categoria: 'Diagnóstico',
        codigo: 'IMG-001',
        descripcion: 'Rayos X, TAC, Resonancia Magnética',
        ubicacion: 'Piso 1 - Ala Oeste',
        responsable: 'Dr. Roberto Silva',
        estado: 'activo',
        capacidad: 30
      },
      {
        id: 6,
        nombre: 'Cardiología',
        categoria: 'Especialidades',
        codigo: 'CAR-001',
        descripcion: 'Consulta y procedimientos cardiológicos',
        ubicacion: 'Piso 2 - Consultorios',
        responsable: 'Dr. Miguel Torres',
        estado: 'activo',
        capacidad: 12
      },
      {
        id: 7,
        nombre: 'Hospitalización General',
        categoria: 'Hospitalización',
        codigo: 'HOS-001',
        descripcion: 'Camas de hospitalización general',
        ubicacion: 'Pisos 4-6',
        responsable: 'Dra. Laura Vega',
        estado: 'activo',
        capacidad: 120
      },
      {
        id: 8,
        nombre: 'Pediatría',
        categoria: 'Especialidades',
        codigo: 'PED-001',
        descripcion: 'Atención médica pediátrica',
        ubicacion: 'Piso 3 - Ala Sur',
        responsable: 'Dra. Diana Ruiz',
        estado: 'activo',
        capacidad: 25
      },
      {
        id: 9,
        nombre: 'Farmacia',
        categoria: 'Apoyo',
        codigo: 'FAR-001',
        descripcion: 'Dispensación de medicamentos',
        ubicacion: 'Piso 1 - Central',
        responsable: 'Q.F. Sandra Morales',
        estado: 'activo',
        capacidad: 10
      },
      {
        id: 10,
        nombre: 'Mantenimiento Biomédico',
        categoria: 'Técnico',
        codigo: 'MBM-001',
        descripcion: 'Mantenimiento de equipos médicos',
        ubicacion: 'Sótano - Taller',
        responsable: 'Ing. Carlos Rodríguez',
        estado: 'activo',
        capacidad: 5
      }
    ];
  }
}

// Crear instancia singleton
const servicioService = new ServicioService();
export default servicioService;

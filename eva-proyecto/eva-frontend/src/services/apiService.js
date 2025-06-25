/**
 * Servicio genérico para todas las APIs del sistema EVA
 * Proporciona métodos CRUD estándar y funcionalidades comunes
 */

import httpClient, { retryRequest } from './httpClient.js';
import { API_ENDPOINTS, buildUrlWithParams } from '../config/api.js';

// Importar servicios específicos
import equiposService from './equiposService.js';
import mantenimientosService from './mantenimientosService.js';
import authService from './authService.js';

class ApiService {
  constructor() {
    // Servicios específicos
    this.equipos = equiposService;
    this.mantenimientos = mantenimientosService;
    this.auth = authService;
  }

  /**
   * Método genérico para obtener lista de recursos
   */
  async getList(endpoint, params = {}) {
    try {
      const url = buildUrlWithParams(endpoint, params);
      
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
      console.error(`Error getting list from ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener datos');
    }
  }

  /**
   * Método genérico para obtener un recurso específico
   */
  async getById(endpoint, id) {
    try {
      const response = await httpClient.get(`${endpoint}/${id}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error getting resource ${id} from ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Error al obtener recurso');
    }
  }

  /**
   * Método genérico para crear un recurso
   */
  async create(endpoint, data) {
    try {
      const response = await httpClient.post(endpoint, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Recurso creado exitosamente'
      };
    } catch (error) {
      console.error(`Error creating resource in ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Error al crear recurso');
    }
  }

  /**
   * Método genérico para actualizar un recurso
   */
  async update(endpoint, id, data) {
    try {
      const response = await httpClient.put(`${endpoint}/${id}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Recurso actualizado exitosamente'
      };
    } catch (error) {
      console.error(`Error updating resource ${id} in ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Error al actualizar recurso');
    }
  }

  /**
   * Método genérico para eliminar un recurso
   */
  async delete(endpoint, id) {
    try {
      const response = await httpClient.delete(`${endpoint}/${id}`);
      return {
        success: true,
        message: response.data.message || 'Recurso eliminado exitosamente'
      };
    } catch (error) {
      console.error(`Error deleting resource ${id} from ${endpoint}:`, error);
      throw new Error(error.response?.data?.message || 'Error al eliminar recurso');
    }
  }

  /**
   * Servicios específicos para Calibraciones
   */
  calibraciones = {
    getList: (params = {}) => this.getList(API_ENDPOINTS.CALIBRACIONES.LIST, params),
    getById: (id) => this.getById(API_ENDPOINTS.CALIBRACIONES.BASE, id),
    create: (data) => this.create(API_ENDPOINTS.CALIBRACIONES.CREATE, data),
    update: (id, data) => this.update(API_ENDPOINTS.CALIBRACIONES.BASE, id, data),
    delete: (id) => this.delete(API_ENDPOINTS.CALIBRACIONES.BASE, id),
    
    schedule: async (scheduleData) => {
      try {
        const response = await httpClient.post(API_ENDPOINTS.CALIBRACIONES.SCHEDULE, scheduleData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Calibración programada exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al programar calibración');
      }
    },

    complete: async (id, completionData) => {
      try {
        const response = await httpClient.post(API_ENDPOINTS.CALIBRACIONES.COMPLETE(id), completionData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Calibración completada exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al completar calibración');
      }
    },

    getPending: (params = {}) => this.getList(API_ENDPOINTS.CALIBRACIONES.PENDING, params),
    getExpired: (params = {}) => this.getList(API_ENDPOINTS.CALIBRACIONES.EXPIRED, params),
    getCertificates: (params = {}) => this.getList(API_ENDPOINTS.CALIBRACIONES.CERTIFICATES, params),
  };

  /**
   * Servicios específicos para Contingencias
   */
  contingencias = {
    getList: (params = {}) => this.getList(API_ENDPOINTS.CONTINGENCIAS.LIST, params),
    getById: (id) => this.getById(API_ENDPOINTS.CONTINGENCIAS.BASE, id),
    create: (data) => this.create(API_ENDPOINTS.CONTINGENCIAS.CREATE, data),
    update: (id, data) => this.update(API_ENDPOINTS.CONTINGENCIAS.BASE, id, data),
    delete: (id) => this.delete(API_ENDPOINTS.CONTINGENCIAS.BASE, id),
    
    close: async (id, closeData) => {
      try {
        const response = await httpClient.post(API_ENDPOINTS.CONTINGENCIAS.CLOSE(id), closeData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Contingencia cerrada exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al cerrar contingencia');
      }
    },

    escalate: async (id, escalateData) => {
      try {
        const response = await httpClient.post(API_ENDPOINTS.CONTINGENCIAS.ESCALATE(id), escalateData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Contingencia escalada exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al escalar contingencia');
      }
    },

    getActive: (params = {}) => this.getList(API_ENDPOINTS.CONTINGENCIAS.ACTIVE, params),
    getCritical: (params = {}) => this.getList(API_ENDPOINTS.CONTINGENCIAS.CRITICAL, params),
  };

  /**
   * Servicios específicos para Usuarios
   */
  usuarios = {
    getList: (params = {}) => this.getList(API_ENDPOINTS.USUARIOS.LIST, params),
    getById: (id) => this.getById(API_ENDPOINTS.USUARIOS.BASE, id),
    create: (data) => this.create(API_ENDPOINTS.USUARIOS.CREATE, data),
    update: (id, data) => this.update(API_ENDPOINTS.USUARIOS.BASE, id, data),
    delete: (id) => this.delete(API_ENDPOINTS.USUARIOS.BASE, id),
    
    getProfile: async () => {
      try {
        const response = await httpClient.get(API_ENDPOINTS.USUARIOS.PROFILE);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener perfil');
      }
    },

    updateProfile: async (profileData) => {
      try {
        const response = await httpClient.put(API_ENDPOINTS.USUARIOS.PROFILE, profileData);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Perfil actualizado exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
      }
    },

    getPermissions: (id) => this.getById(API_ENDPOINTS.USUARIOS.PERMISSIONS(id)),
    getRoles: () => this.getList(API_ENDPOINTS.USUARIOS.ROLES),
  };

  /**
   * Servicios específicos para Servicios
   */
  servicios = {
    getList: (params = {}) => this.getList(API_ENDPOINTS.SERVICIOS.LIST, params),
    getById: (id) => this.getById(API_ENDPOINTS.SERVICIOS.BASE, id),
    create: (data) => this.create(API_ENDPOINTS.SERVICIOS.CREATE, data),
    update: (id, data) => this.update(API_ENDPOINTS.SERVICIOS.BASE, id, data),
    delete: (id) => this.delete(API_ENDPOINTS.SERVICIOS.BASE, id),
    
    getEquipos: (id, params = {}) => this.getList(API_ENDPOINTS.SERVICIOS.EQUIPOS(id), params),
  };

  /**
   * Servicios específicos para Áreas
   */
  areas = {
    getList: (params = {}) => this.getList(API_ENDPOINTS.AREAS.LIST, params),
    getById: (id) => this.getById(API_ENDPOINTS.AREAS.BASE, id),
    create: (data) => this.create(API_ENDPOINTS.AREAS.CREATE, data),
    update: (id, data) => this.update(API_ENDPOINTS.AREAS.BASE, id, data),
    delete: (id) => this.delete(API_ENDPOINTS.AREAS.BASE, id),
    
    getEquipos: (id, params = {}) => this.getList(API_ENDPOINTS.AREAS.EQUIPOS(id), params),
  };

  /**
   * Servicios para Dashboard
   */
  dashboard = {
    getStats: (params = {}) => this.getList(API_ENDPOINTS.DASHBOARD.STATS, params),
    getCharts: (params = {}) => this.getList(API_ENDPOINTS.DASHBOARD.CHARTS, params),
    getAlerts: (params = {}) => this.getList(API_ENDPOINTS.DASHBOARD.ALERTS, params),
    getRecentActivity: (params = {}) => this.getList(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY, params),
  };

  /**
   * Servicios para Archivos
   */
  files = {
    upload: async (file, metadata = {}) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(metadata).forEach(key => {
          formData.append(key, metadata[key]);
        });

        const response = await httpClient.post(API_ENDPOINTS.FILES.UPLOAD, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Archivo subido exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al subir archivo');
      }
    },

    download: async (id) => {
      try {
        const response = await httpClient.get(API_ENDPOINTS.FILES.DOWNLOAD(id), {
          responseType: 'blob'
        });

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        
        return {
          success: true,
          url,
          blob,
          message: 'Archivo descargado exitosamente'
        };
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al descargar archivo');
      }
    },

    delete: (id) => this.delete(API_ENDPOINTS.FILES.BASE, id),
    getList: (params = {}) => this.getList(API_ENDPOINTS.FILES.LIST, params),
  };

  /**
   * Servicios para Notificaciones
   */
  notifications = {
    getList: (params = {}) => this.getList(API_ENDPOINTS.NOTIFICATIONS.LIST, params),
    markAsRead: (id) => httpClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
    markAllAsRead: () => httpClient.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
    delete: (id) => this.delete(API_ENDPOINTS.NOTIFICATIONS.LIST, id),
    getSettings: () => this.getList(API_ENDPOINTS.NOTIFICATIONS.SETTINGS),
    updateSettings: (settings) => httpClient.put(API_ENDPOINTS.NOTIFICATIONS.SETTINGS, settings),
  };
}

// Crear instancia singleton
const apiService = new ApiService();

export default apiService;

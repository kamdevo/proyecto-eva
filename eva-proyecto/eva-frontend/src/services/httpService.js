/**
 * ========================================
 * SERVICIO HTTP - SISTEMA EVA
 * ========================================
 * 
 * Configuración centralizada de Axios para todas las peticiones
 * al backend Laravel con autenticación Sanctum
 */

import axios from 'axios';
import { API_CONFIG, AUTH_ENDPOINTS } from '../config/api.js';

// Crear instancia de Axios
const httpService = axios.create({
  baseURL: API_CONFIG.API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  withCredentials: true, // Importante para Sanctum
});

// Variable para almacenar el token de autenticación
let authToken = localStorage.getItem('eva_auth_token');

// Interceptor de peticiones (request)
httpService.interceptors.request.use(
  (config) => {
    // Agregar token de autorización si existe
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Agregar timestamp para evitar cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    console.log(`🚀 [HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ [HTTP] Error en petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas (response)
httpService.interceptors.response.use(
  (response) => {
    console.log(`✅ [HTTP] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      headers: response.headers
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(`❌ [HTTP] ${error.response?.status || 'Network Error'} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      error: error.response?.data,
      status: error.response?.status
    });

    // Manejar errores de autenticación (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refrescar el token
        await refreshToken();
        
        // Reintentar la petición original
        if (authToken) {
          originalRequest.headers.Authorization = `Bearer ${authToken}`;
          return httpService(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, redirigir al login
        handleAuthenticationError();
        return Promise.reject(refreshError);
      }
    }

    // Manejar errores de servidor (5xx)
    if (error.response?.status >= 500) {
      showErrorNotification('Error del servidor. Por favor, intente más tarde.');
    }

    // Manejar errores de validación (422)
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      console.warn('⚠️ [HTTP] Errores de validación:', validationErrors);
    }

    return Promise.reject(error);
  }
);

// Función para establecer el token de autenticación
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('eva_auth_token', token);
    httpService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('eva_auth_token');
    delete httpService.defaults.headers.common['Authorization'];
  }
};

// Función para obtener el token actual
export const getAuthToken = () => authToken;

// Función para refrescar el token
const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${API_CONFIG.API_URL}${AUTH_ENDPOINTS.REFRESH}`,
      {},
      { withCredentials: true }
    );
    
    const newToken = response.data.token;
    setAuthToken(newToken);
    return newToken;
  } catch (error) {
    console.error('❌ [AUTH] Error al refrescar token:', error);
    throw error;
  }
};

// Función para manejar errores de autenticación
const handleAuthenticationError = () => {
  setAuthToken(null);
  
  // Redirigir al login si no estamos ya ahí
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Función para mostrar notificaciones de error (implementar según UI library)
const showErrorNotification = (message) => {
  // Implementar según la librería de notificaciones que uses
  console.error('🔔 [NOTIFICATION]', message);
  // Ejemplo: toast.error(message);
};

// Función para obtener el CSRF token de Sanctum
export const getCsrfToken = async () => {
  try {
    await axios.get(`${API_CONFIG.BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
    console.log('✅ [CSRF] Token obtenido correctamente');
  } catch (error) {
    console.error('❌ [CSRF] Error al obtener token:', error);
    throw error;
  }
};

// Función para inicializar la autenticación
export const initializeAuth = async () => {
  try {
    // Obtener CSRF token
    await getCsrfToken();
    
    // Verificar si hay token almacenado
    const storedToken = localStorage.getItem('eva_auth_token');
    if (storedToken) {
      setAuthToken(storedToken);
      
      // Verificar que el token sigue siendo válido
      try {
        await httpService.get(AUTH_ENDPOINTS.USER);
        console.log('✅ [AUTH] Token válido, usuario autenticado');
      } catch (error) {
        console.warn('⚠️ [AUTH] Token inválido, limpiando autenticación');
        setAuthToken(null);
      }
    }
  } catch (error) {
    console.error('❌ [AUTH] Error al inicializar autenticación:', error);
  }
};

// Exportar la instancia configurada
export default httpService;

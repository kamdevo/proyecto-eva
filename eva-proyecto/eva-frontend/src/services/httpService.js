/**
 * ========================================
 * SERVICIO HTTP - SISTEMA EVA
 * ========================================
 *
 * Configuración centralizada de Axios para todas las peticiones
 * al backend Laravel con autenticación Sanctum
 */

import axios from "axios";
import { API_CONFIG, AUTH_ENDPOINTS } from "../config/api";

// Crear instancia de Axios
const httpService = axios.create({
  baseURL: API_CONFIG.API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  withCredentials: true, // Importante para Sanctum
});

// Variable para almacenar el token de autenticación
let authToken = null;

// Mutex para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((cb) => cb(null, error));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

// Inicializar token desde localStorage al cargar el módulo
const initializeTokenFromStorage = () => {
  const storedToken = localStorage.getItem("eva_auth_token");
  if (storedToken) {
    authToken = storedToken;
    httpService.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${storedToken}`;
  }
};

// Llamar la inicialización inmediatamente
initializeTokenFromStorage();

// Interceptor de peticiones (request)
httpService.interceptors.request.use(
  (config) => {
    // Log de la petición
    console.log(`🌐 [HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      withCredentials: config.withCredentials
    });

    // Agregar token de autorización si existe
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Agregar timestamp para evitar cache
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    return config;
  },
  (error) => {
    console.error("❌ [HTTP] Error en petición:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas (response)
httpService.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      `❌ [HTTP] ${
        error.response?.status || "Network Error"
      } ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
      {
        error: error.response?.data,
        status: error.response?.status,
      }
    );

    // Manejar errores de autenticación (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si ya hay un refresh en curso, encolar esta petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token, err) => {
            if (err || !token) {
              return reject(err || new Error("Token refresh failed"));
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(httpService(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const newToken = await refreshToken();
        isRefreshing = false;

        // Notificar a las peticiones encoladas
        onTokenRefreshed(newToken);

        // Reintentar la petición original
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return httpService(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        // Notificar fallo a peticiones encoladas
        onRefreshFailed(refreshError);
        // Si falla el refresh, redirigir al login
        handleAuthenticationError();
        return Promise.reject(refreshError);
      }
    }

    // Manejar errores de servidor (5xx)
    if (error.response?.status >= 500) {
      // No mostrar toast automático para endpoints de tickets (manejan sus propias notificaciones)
      const isTicketEndpoint = error.config?.url?.includes('/crear-ticket') || 
                              error.config?.url?.includes('/tickets/') ||
                              error.config?.url?.includes('/notifications/');
      
      if (!isTicketEndpoint) {
        showErrorNotification(
          "Error del servidor. Por favor, intente más tarde."
        );
      }
    }

    // Manejar errores de validación (422)
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      console.warn("⚠️ [HTTP] Errores de validación:", validationErrors);
    }

    return Promise.reject(error);
  }
);

// Función para establecer el token de autenticación
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem("eva_auth_token", token);
    httpService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("eva_auth_token");
    delete httpService.defaults.headers.common["Authorization"];
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
    console.error("❌ [AUTH] Error al refrescar token:", error);
    throw error;
  }
};

// Función para manejar errores de autenticación
const handleAuthenticationError = () => {
  setAuthToken(null);
  localStorage.removeItem("eva_user");

  // Emitir evento para que AuthContext maneje la redirección via React
  window.dispatchEvent(new CustomEvent("auth:logout"));
};

// Función para mostrar notificaciones de error usando nuestro sistema de toasts
const showErrorNotification = (message) => {
  
  // Usar nuestro sistema de toasts si está disponible
  try {
    if (typeof window !== 'undefined' && window.showErrorToast) {
      window.showErrorToast(message);
    }
  } catch (error) {
    // Fallback si no está disponible
    console.error("Toast no disponible:", error);
  }
};

// Función para obtener el CSRF token de Sanctum
export const getCsrfToken = async () => {
  try {
    await axios.get(`${API_CONFIG.BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("❌ [CSRF] Error al obtener token:", error);
    throw error;
  }
};

// Función para inicializar la autenticación
export const initializeAuth = async () => {
  try {

    // Obtener CSRF token
    await getCsrfToken();

    // Verificar si hay token almacenado
    const storedToken = localStorage.getItem("eva_auth_token");
    if (storedToken) {
      setAuthToken(storedToken);

      // Verificar que el token sigue siendo válido
      try {
        const response = await httpService.get(AUTH_ENDPOINTS.USER);
        return { success: true, user: response.data };
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          console.warn(
            "⚠️ [AUTH] Token inválido (401), limpiando autenticación"
          );
          setAuthToken(null);
          return { success: false, error: "Token expirado o inválido" };
        } else if (status === 500) {
          console.error(
            "💥 [AUTH] Error 500 del servidor - posible token corrupto:",
            message
          );
          // Para error 500 que podría ser token corrupto, limpiamos también
          setAuthToken(null);
          return {
            success: false,
            error: "Token corrupto, por favor inicie sesión nuevamente",
          };
        } else {
          // Para otros errores (network, etc.), mantener el token y intentar más tarde
          console.warn(
            `⚠️ [AUTH] Error del servidor (${
              status || "Network"
            }), manteniendo token para reintentar`
          );
          return {
            success: false,
            error: "Error temporal del servidor",
            keepToken: true,
          };
        }
      }
    } else {
      return { success: false, error: "No hay token" };
    }
  } catch (error) {
    console.error("❌ [AUTH] Error al inicializar autenticación:", error);
    return { success: false, error: error.message };
  }
};

// ====================================
// FUNCIONES ESPECÍFICAS DE EQUIPOS
// ====================================

/**
 * Eliminar un equipo por ID
 * @param {string|number} equipmentId - ID del equipo a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
export const deleteEquipment = async (equipmentId) => {
  try {
    console.log(`🗑️ [EQUIPMENT] Eliminando equipo ID: ${equipmentId}`);

    const response = await httpService.delete(`/v1/equipos/${equipmentId}`);

    console.log("✅ [EQUIPMENT] Equipo eliminado exitosamente:", response.data);

    return {
      success: true,
      message: response.data.message || "Equipo eliminado exitosamente",
      data: response.data,
    };
  } catch (error) {
    console.error("❌ [EQUIPMENT] Error al eliminar equipo:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Error desconocido al eliminar equipo";

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

// Exportar la instancia configurada
export default httpService;

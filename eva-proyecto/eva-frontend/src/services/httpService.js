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

// Inicializar token desde localStorage al cargar el módulo
const initializeTokenFromStorage = () => {
  const storedToken = localStorage.getItem("eva_auth_token");
  if (storedToken) {
    authToken = storedToken;
    httpService.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${storedToken}`;
    console.log("🔄 [HTTP] Token restaurado desde localStorage");
  }
};

// Llamar la inicialización inmediatamente
initializeTokenFromStorage();

// Interceptor de peticiones (request)
httpService.interceptors.request.use(
  (config) => {
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

    console.log(`🚀 [HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      params: config.params,
      data: config.data,
    });

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
    console.log(
      `✅ [HTTP] ${response.status} ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        data: response.data,
        headers: response.headers,
      }
    );

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
      showErrorNotification(
        "Error del servidor. Por favor, intente más tarde."
      );
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
    console.log("✅ [HTTP] Token establecido y persistido");
  } else {
    localStorage.removeItem("eva_auth_token");
    delete httpService.defaults.headers.common["Authorization"];
    console.log("🧹 [HTTP] Token eliminado y headers limpiados");
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

  // Redirigir al login si no estamos ya ahí
  if (
    window.location.pathname !== "/" &&
    window.location.pathname !== "/login"
  ) {
    window.location.href = "/";
  }
};

// Función para mostrar notificaciones de error (implementar según UI library)
const showErrorNotification = (message) => {
  // Implementar según la librería de notificaciones que uses
  console.error("🔔 [NOTIFICATION]", message);
  // Ejemplo: toast.error(message);
};

// Función para obtener el CSRF token de Sanctum
export const getCsrfToken = async () => {
  try {
    await axios.get(`${API_CONFIG.BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    console.log("✅ [CSRF] Token obtenido correctamente");
  } catch (error) {
    console.error("❌ [CSRF] Error al obtener token:", error);
    throw error;
  }
};

// Función para inicializar la autenticación
export const initializeAuth = async () => {
  try {
    console.log("🔄 [AUTH] Inicializando autenticación...");

    // Obtener CSRF token
    await getCsrfToken();

    // Verificar si hay token almacenado
    const storedToken = localStorage.getItem("eva_auth_token");
    if (storedToken) {
      console.log("🔍 [AUTH] Token encontrado, validando...");
      setAuthToken(storedToken);

      // Verificar que el token sigue siendo válido
      try {
        const response = await httpService.get(AUTH_ENDPOINTS.USER);
        console.log(
          "✅ [AUTH] Token válido, usuario autenticado:",
          response.data
        );
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
      console.log("ℹ️ [AUTH] No hay token almacenado");
      return { success: false, error: "No hay token" };
    }
  } catch (error) {
    console.error("❌ [AUTH] Error al inicializar autenticación:", error);
    return { success: false, error: error.message };
  }
};

// Exportar la instancia configurada
export default httpService;

import axios from "axios";
import { API_CONFIG } from "./api";

// Usar la misma configuración centralizada que httpService
// Así ambas instancias de Axios apuntan siempre al mismo backend
const API_BASE_URL = API_CONFIG.API_URL;

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 30000,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {

    // CORRECCIÓN: Obtener token del localStorage en la ubicación correcta
    // Primero intentar con el token directo (eva_auth_token)
    let token = localStorage.getItem("eva_auth_token");
    
    // Si no existe, intentar con el formato de usuario
    if (!token) {
      const user = localStorage.getItem("usuario");
      if (user) {
        try {
          const userData = JSON.parse(user);
          token = userData.token;
        } catch (error) {
          console.warn("⚠️ Error parsing user data from localStorage:", error);
        }
      }
    }
    
    // Agregar token si existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Manejo de errores de autenticación - evitar redirección automática para ciertas rutas
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isProtectedRoute = url.includes("/equipos/") || 
                              url.includes("/bajas") || 
                              url.includes("/v1/bajas") ||
                              url.includes("/usuarios/") ||
                              url.includes("/permissions");
      
      // Solo redirigir si NO es una ruta protegida y NO estamos en login
      if (!isProtectedRoute && !window.location.pathname.includes("/login")) {
        localStorage.removeItem("usuario");
        window.location.href = "/login";
      } else {
        console.warn("🔒 401 error on protected route - not redirecting:", url);
      }
    }

    // Manejo de errores de servidor
    if (error.response?.status >= 500) {
      // Server error
    }

    return Promise.reject(error);
  }
);

export default api;

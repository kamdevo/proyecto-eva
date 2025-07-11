import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

console.log('🔧 API Base URL:', API_BASE_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to:`, config.url);
    
    // Obtener token del localStorage
    const user = localStorage.getItem('usuario');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
          console.log('🔑 Token added to request');
        }
      } catch (error) {
        console.warn('⚠️ Error parsing user data from localStorage:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Successful response from:`, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Manejo de errores de autenticación deshabilitado para equipos biomédicos
    // Solo redirigir si es un error 401 y NO es una ruta de equipos
    if (error.response?.status === 401 && !error.config?.url?.includes('/equipos/')) {
      console.warn('🚪 Unauthorized - redirecting to login');
      localStorage.removeItem('usuario');
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Manejo de errores de servidor
    if (error.response?.status >= 500) {
      console.error('🔥 Server error detected');
    }

    return Promise.reject(error);
  }
);

export default api;

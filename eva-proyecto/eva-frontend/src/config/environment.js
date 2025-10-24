/**
 * Configuración de entorno para Sistema EVA
 * Maneja URLs dinámicas para Docker y desarrollo local
 */

// Función para detectar si estamos en Docker
const isDockerEnvironment = () => {
  return window.APP_CONFIG !== undefined || process.env.NODE_ENV === 'production';
};

// Función para obtener la IP del host desde el config dinámico
const getHostIP = () => {
  if (window.APP_CONFIG?.HOST_IP) {
    return window.APP_CONFIG.HOST_IP;
  }
  
  // Fallback para desarrollo local
  return 'localhost';
};

// Configuración base de URLs
const createConfig = () => {
  const hostIP = getHostIP();
  const isDocker = isDockerEnvironment();
  
  // URLs base según el entorno
  const baseURLs = {
    development: {
      API_BASE_URL: import.meta.env.VITE_API_URL || `http://${hostIP}:8001/api`,
      BACKEND_BASE_URL: import.meta.env.VITE_API_BASE_URL || `http://${hostIP}:8001`,
      FRONTEND_BASE_URL: `http://${hostIP}:5173`,
      WS_BASE_URL: `ws://${hostIP}:8001`
    },
    production: {
      API_Base_URL: window.APP_CONFIG?.API_URL || `http://${hostIP}:8001/api`,
      BACKEND_BASE_URL: window.APP_CONFIG?.BACKEND_URL || `http://${hostIP}:8001`,
      FRONTEND_BASE_URL: window.APP_CONFIG?.FRONTEND_URL || `http://${hostIP}:5173`,
      WS_BASE_URL: window.APP_CONFIG?.WS_URL || `ws://${hostIP}:8001`
    }
  };
  
  const environment = isDocker ? 'production' : 'development';
  const urls = baseURLs[environment];
  
  return {
    // Información del entorno
    ENVIRONMENT: environment,
    IS_DOCKER: isDocker,
    HOST_IP: hostIP,
    
    // URLs principales
    API_BASE_URL: urls.API_BASE_URL,
    BACKEND_BASE_URL: urls.BACKEND_BASE_URL,
    FRONTEND_BASE_URL: urls.FRONTEND_BASE_URL,
    WS_BASE_URL: urls.WS_BASE_URL,
    
    // URLs específicas de la aplicación
    STORAGE_URL: `${urls.BACKEND_BASE_URL}/storage`,
    UPLOADS_URL: `${urls.BACKEND_BASE_URL}/storage/uploads`,
    DOCUMENTS_URL: `${urls.BACKEND_BASE_URL}/storage/correctivos_generales`,
    IMAGES_URL: `${urls.BACKEND_BASE_URL}/storage/equipos`,
    
    // Endpoints de API más usados
    API_ENDPOINTS: {
      // Autenticación
      LOGIN: `${urls.API_BASE_URL}/v1/login`,
      LOGOUT: `${urls.API_BASE_URL}/v1/logout`,
      USER: `${urls.API_BASE_URL}/v1/user`,
      PERMISSIONS: `${urls.API_BASE_URL}/v1/user/permissions`,
      
      // Equipos
      EQUIPOS: `${urls.API_BASE_URL}/v1/equipos`,
      EQUIPOS_SEARCH: `${urls.API_BASE_URL}/v1/equipos/search`,
      EQUIPOS_IMAGES: `${urls.API_BASE_URL}/v1/equipos/images`,
      
      // Tickets
      MIS_TICKETS: `${urls.API_BASE_URL}/v1/mis-tickets`,
      GESTION_TICKETS: `${urls.API_BASE_URL}/v1/gestion-tickets`,
      CORRECTIVOS: `${urls.API_BASE_URL}/v1/correctivos`,
      PREVENTIVOS: `${urls.API_BASE_URL}/v1/preventivos`,
      
      // Módulos y permisos
      MODULOS: `${urls.API_BASE_URL}/v1/modulos`,
      ROLES: `${urls.API_BASE_URL}/v1/roles`,
      
      // Catálogos
      SEDES: `${urls.API_BASE_URL}/v1/sedes`,
      SERVICIOS: `${urls.API_BASE_URL}/v1/servicios`,
      AREAS: `${urls.API_BASE_URL}/v1/areas`,
      EMPRESAS: `${urls.API_BASE_URL}/v1/empresas`,
      
      // Notificaciones
      NOTIFICATIONS: `${urls.API_BASE_URL}/v1/notifications`,
      EMAIL_TEST: `${urls.API_BASE_URL}/v1/notifications/test-email`,
      
      // Health check
      HEALTH: `${urls.API_BASE_URL}/health`
    },
    
    // Configuración de características
    FEATURES: window.APP_CONFIG?.FEATURES || {
      REACT_EMAIL: true,
      PDF_GENERATION: true,
      DIGITAL_SIGNATURES: true,
      REAL_TIME_NOTIFICATIONS: true,
      EQUIPMENT_SEARCH: true,
      ADVANCED_PERMISSIONS: true,
      DYNAMIC_SIDEBAR: true,
      LEGACY_RESOURCE_BLOCKING: true
    },
    
    // Información de la aplicación
    APP: {
      NAME: window.APP_CONFIG?.APP_NAME || import.meta.env.VITE_APP_NAME || 'EVA - Sistema de Gestión',
      VERSION: window.APP_CONFIG?.VERSION || '1.0.0',
      BUILD_TIME: window.APP_CONFIG?.BUILD_TIME || new Date().toISOString()
    }
  };
};

// Configuración global
export const ENV_CONFIG = createConfig();

// Función para obtener URLs dinámicamente (útil para componentes)
export const getApiUrl = (endpoint = '') => {
  return `${ENV_CONFIG.API_BASE_URL}${endpoint}`;
};

export const getBackendUrl = (path = '') => {
  return `${ENV_CONFIG.BACKEND_BASE_URL}${path}`;
};

export const getStorageUrl = (file = '') => {
  return `${ENV_CONFIG.STORAGE_URL}/${file}`;
};

// Función para debug (solo desarrollo)
export const debugConfig = () => {
  if (ENV_CONFIG.ENVIRONMENT === 'development') {
    console.group('🔧 EVA Environment Configuration');
    console.log('Environment:', ENV_CONFIG.ENVIRONMENT);
    console.log('Is Docker:', ENV_CONFIG.IS_DOCKER);
    console.log('Host IP:', ENV_CONFIG.HOST_IP);
    console.log('API Base URL:', ENV_CONFIG.API_BASE_URL);
    console.log('Backend Base URL:', ENV_CONFIG.BACKEND_BASE_URL);
    console.log('Features:', ENV_CONFIG.FEATURES);
    console.groupEnd();
  }
};

// Ejecutar debug automáticamente en desarrollo
if (typeof window !== 'undefined' && ENV_CONFIG.ENVIRONMENT === 'development') {
  debugConfig();
}

// Export default para compatibilidad
export default ENV_CONFIG;

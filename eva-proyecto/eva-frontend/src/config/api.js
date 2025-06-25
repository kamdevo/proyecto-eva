/**
 * Configuración de la API para el sistema EVA
 * Centraliza todas las URLs y configuraciones de la API
 */

// Configuración base de la API
export const API_CONFIG = {
  // URLs base
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  
  // Configuración de timeouts
  TIMEOUT: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(import.meta.env.VITE_RETRY_DELAY) || 1000,
  
  // Configuración de paginación
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 15,
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  
  // Configuración de archivos
  MAX_FILE_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'
  ],
};

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: import.meta.env.VITE_AUTH_LOGIN_URL || '/auth/login',
  LOGOUT: import.meta.env.VITE_AUTH_LOGOUT_URL || '/auth/logout',
  REGISTER: import.meta.env.VITE_AUTH_REGISTER_URL || '/auth/register',
  USER: import.meta.env.VITE_AUTH_USER_URL || '/auth/user',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
};

// Endpoints principales del sistema EVA
export const API_ENDPOINTS = {
  // Equipos
  EQUIPOS: {
    BASE: import.meta.env.VITE_EQUIPOS_URL || '/equipos',
    LIST: '/equipos',
    CREATE: '/equipos',
    SHOW: (id) => `/equipos/${id}`,
    UPDATE: (id) => `/equipos/${id}`,
    DELETE: (id) => `/equipos/${id}`,
    SEARCH: '/equipos/search',
    EXPORT: '/equipos/export',
    IMPORT: '/equipos/import',
    DUPLICATE: (id) => `/equipos/${id}/duplicate`,
    HISTORY: (id) => `/equipos/${id}/history`,
    FILES: (id) => `/equipos/${id}/files`,
    SPECIFICATIONS: (id) => `/equipos/${id}/specifications`,
  },
  
  // Mantenimientos
  MANTENIMIENTOS: {
    BASE: import.meta.env.VITE_MANTENIMIENTO_URL || '/mantenimiento',
    LIST: '/mantenimiento',
    CREATE: '/mantenimiento',
    SHOW: (id) => `/mantenimiento/${id}`,
    UPDATE: (id) => `/mantenimiento/${id}`,
    DELETE: (id) => `/mantenimiento/${id}`,
    SCHEDULE: '/mantenimiento/schedule',
    COMPLETE: (id) => `/mantenimiento/${id}/complete`,
    CANCEL: (id) => `/mantenimiento/${id}/cancel`,
    EXPORT: '/mantenimiento/export',
    CALENDAR: '/mantenimiento/calendar',
    PENDING: '/mantenimiento/pending',
    OVERDUE: '/mantenimiento/overdue',
  },
  
  // Calibraciones
  CALIBRACIONES: {
    BASE: import.meta.env.VITE_CALIBRACION_URL || '/calibracion',
    LIST: '/calibracion',
    CREATE: '/calibracion',
    SHOW: (id) => `/calibracion/${id}`,
    UPDATE: (id) => `/calibracion/${id}`,
    DELETE: (id) => `/calibracion/${id}`,
    SCHEDULE: '/calibracion/schedule',
    COMPLETE: (id) => `/calibracion/${id}/complete`,
    EXPORT: '/calibracion/export',
    CERTIFICATES: '/calibracion/certificates',
    PENDING: '/calibracion/pending',
    EXPIRED: '/calibracion/expired',
  },
  
  // Contingencias
  CONTINGENCIAS: {
    BASE: import.meta.env.VITE_CONTINGENCIAS_URL || '/contingencias',
    LIST: '/contingencias',
    CREATE: '/contingencias',
    SHOW: (id) => `/contingencias/${id}`,
    UPDATE: (id) => `/contingencias/${id}`,
    DELETE: (id) => `/contingencias/${id}`,
    CLOSE: (id) => `/contingencias/${id}/close`,
    ESCALATE: (id) => `/contingencias/${id}/escalate`,
    EXPORT: '/contingencias/export',
    ACTIVE: '/contingencias/active',
    CRITICAL: '/contingencias/critical',
  },
  
  // Usuarios
  USUARIOS: {
    BASE: '/usuarios',
    LIST: '/usuarios',
    CREATE: '/usuarios',
    SHOW: (id) => `/usuarios/${id}`,
    UPDATE: (id) => `/usuarios/${id}`,
    DELETE: (id) => `/usuarios/${id}`,
    PROFILE: '/usuarios/profile',
    PERMISSIONS: (id) => `/usuarios/${id}/permissions`,
    ROLES: '/usuarios/roles',
  },
  
  // Servicios
  SERVICIOS: {
    BASE: '/servicios',
    LIST: '/servicios',
    CREATE: '/servicios',
    SHOW: (id) => `/servicios/${id}`,
    UPDATE: (id) => `/servicios/${id}`,
    DELETE: (id) => `/servicios/${id}`,
    EQUIPOS: (id) => `/servicios/${id}/equipos`,
  },
  
  // Áreas
  AREAS: {
    BASE: '/areas',
    LIST: '/areas',
    CREATE: '/areas',
    SHOW: (id) => `/areas/${id}`,
    UPDATE: (id) => `/areas/${id}`,
    DELETE: (id) => `/areas/${id}`,
    EQUIPOS: (id) => `/areas/${id}/equipos`,
  },
  
  // Dashboard
  DASHBOARD: {
    BASE: import.meta.env.VITE_DASHBOARD_URL || '/dashboard',
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts',
    ALERTS: '/dashboard/alerts',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    EXPORT: '/dashboard/export',
  },
  
  // Archivos
  FILES: {
    BASE: import.meta.env.VITE_ARCHIVOS_URL || '/archivos',
    UPLOAD: '/files/upload',
    DOWNLOAD: (id) => `/files/${id}/download`,
    DELETE: (id) => `/files/${id}`,
    LIST: '/files',
  },
  
  // Exportación
  EXPORT: {
    EQUIPOS: import.meta.env.VITE_EXPORT_EQUIPOS_URL || '/export/equipos',
    MANTENIMIENTO: import.meta.env.VITE_EXPORT_MANTENIMIENTO_URL || '/export/mantenimiento',
    DASHBOARD: import.meta.env.VITE_EXPORT_DASHBOARD_URL || '/export/dashboard',
    CALIBRACIONES: '/export/calibraciones',
    CONTINGENCIAS: '/export/contingencias',
    REPORTS: '/export/reports',
  },
  
  // Notificaciones
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
  },
};

// Función para construir URL completa
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.API_URL.replace(/\/$/, ''); // Remover slash final
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Función para construir URL con parámetros de consulta
export const buildUrlWithParams = (endpoint, params = {}) => {
  const url = new URL(buildApiUrl(endpoint));
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Configuración de Sanctum para CSRF
export const SANCTUM_CONFIG = {
  STATEFUL_DOMAINS: import.meta.env.VITE_SANCTUM_STATEFUL_DOMAINS?.split(',') || ['localhost'],
  SESSION_DOMAIN: import.meta.env.VITE_SESSION_DOMAIN || 'localhost',
  CSRF_COOKIE_URL: `${API_CONFIG.BASE_URL}/sanctum/csrf-cookie`,
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  DEBUG: import.meta.env.VITE_APP_DEBUG === 'true',
  LOG_REQUESTS: import.meta.env.VITE_APP_DEBUG === 'true',
  MOCK_DELAY: 1000, // Delay para simular latencia en desarrollo
};

export default {
  API_CONFIG,
  AUTH_ENDPOINTS,
  API_ENDPOINTS,
  buildApiUrl,
  buildUrlWithParams,
  SANCTUM_CONFIG,
  DEV_CONFIG,
};

// Template de configuración para EVA Frontend
// Este archivo será procesado por entrypoint.sh para generar config.js

window.APP_CONFIG = {
  API_URL: 'HOST_IP_PLACEHOLDER:8001/api',
  APP_NAME: 'EVA - Sistema de Gestión',
  HOST_IP: 'HOST_IP_PLACEHOLDER',
  BACKEND_URL: 'http://HOST_IP_PLACEHOLDER:8001',
  FRONTEND_URL: 'http://HOST_IP_PLACEHOLDER:5173',
  WS_URL: 'ws://HOST_IP_PLACEHOLDER:8001',
  ENVIRONMENT: 'production',
  VERSION: '1.0.0',
  BUILD_TIME: 'BUILD_TIME_PLACEHOLDER',
  FEATURES: {
    REACT_EMAIL: true,
    PDF_GENERATION: true,
    DIGITAL_SIGNATURES: true,
    REAL_TIME_NOTIFICATIONS: true,
    EQUIPMENT_SEARCH: true,
    ADVANCED_PERMISSIONS: true,
    DYNAMIC_SIDEBAR: true,
    LEGACY_RESOURCE_BLOCKING: true
  },
  PORTS: {
    BACKEND: 8001,
    FRONTEND: 5173,
    MYSQL: 3306,
    REDIS: 6379
  },
  CORS: {
    ALLOWED_ORIGINS: [
      'http://HOST_IP_PLACEHOLDER:5173',
      'http://HOST_IP_PLACEHOLDER:8001',
      'http://localhost:5173',
      'http://localhost:8001'
    ]
  }
};

// Legacy support - para compatibilidad con código existente
if (typeof window !== 'undefined') {
  window.VITE_API_URL = window.APP_CONFIG.API_URL;
  window.VITE_APP_NAME = window.APP_CONFIG.APP_NAME;
}

console.log('🔧 EVA Frontend Config template loaded');

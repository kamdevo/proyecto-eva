/**
 * ========================================
 * UTILIDADES DE MANTENIMIENTO - SISTEMA EVA
 * ========================================
 *
 * Funciones de utilidad para mantenimiento y debugging
 */

/**
 * Limpiar todos los datos de caché del localStorage
 */
export const clearAllCache = () => {
  try {
    // Obtener todas las claves del localStorage
    const keys = Object.keys(localStorage);
    
    // Filtrar claves relacionadas con caché
    const cacheKeys = keys.filter(key => 
      key.startsWith('cache_') || 
      key.startsWith('eva_cache_') ||
      key.includes('tickets') ||
      key.includes('equipos') ||
      key.includes('tecnicos') ||
      key.includes('servicios')
    );
    
    // Eliminar claves de caché
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cache cleared: ${cacheKeys.length} items removed`);
    return {
      success: true,
      itemsRemoved: cacheKeys.length,
      keys: cacheKeys
    };
  } catch (error) {
    console.error('Error clearing cache:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener información del estado del caché
 */
export const getCacheInfo = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => 
      key.startsWith('cache_') || 
      key.startsWith('eva_cache_')
    );
    
    const cacheInfo = cacheKeys.map(key => {
      const data = localStorage.getItem(key);
      let parsedData;
      let size = 0;
      let expiry = null;
      
      try {
        parsedData = JSON.parse(data);
        size = new Blob([data]).size;
        expiry = parsedData.expiry || null;
      } catch (e) {
        size = data ? data.length : 0;
      }
      
      return {
        key,
        size,
        expiry,
        expired: expiry ? new Date(expiry) < new Date() : false
      };
    });
    
    const totalSize = cacheInfo.reduce((acc, item) => acc + item.size, 0);
    const expiredItems = cacheInfo.filter(item => item.expired).length;
    
    return {
      totalItems: cacheInfo.length,
      totalSize,
      expiredItems,
      items: cacheInfo
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return {
      totalItems: 0,
      totalSize: 0,
      expiredItems: 0,
      items: [],
      error: error.message
    };
  }
};

/**
 * Limpiar solo elementos de caché expirados
 */
export const clearExpiredCache = () => {
  try {
    const cacheInfo = getCacheInfo();
    const expiredKeys = cacheInfo.items
      .filter(item => item.expired)
      .map(item => item.key);
    
    expiredKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Expired cache cleared: ${expiredKeys.length} items removed`);
    return {
      success: true,
      itemsRemoved: expiredKeys.length,
      keys: expiredKeys
    };
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generar reporte de estado del sistema
 */
export const generateSystemReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },
    storage: {
      localStorage: {
        available: typeof Storage !== 'undefined',
        used: 0,
        total: 0
      },
      sessionStorage: {
        available: typeof sessionStorage !== 'undefined',
        used: 0
      }
    },
    cache: getCacheInfo(),
    performance: {
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      timing: performance.timing ? {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      } : null
    }
  };
  
  // Calcular uso de localStorage
  try {
    let localStorageSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageSize += localStorage[key].length + key.length;
      }
    }
    report.storage.localStorage.used = localStorageSize;
    
    // Estimar límite de localStorage (generalmente 5-10MB)
    report.storage.localStorage.total = 5 * 1024 * 1024; // 5MB estimado
  } catch (error) {
    report.storage.localStorage.error = error.message;
  }
  
  // Calcular uso de sessionStorage
  try {
    let sessionStorageSize = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        sessionStorageSize += sessionStorage[key].length + key.length;
      }
    }
    report.storage.sessionStorage.used = sessionStorageSize;
  } catch (error) {
    report.storage.sessionStorage.error = error.message;
  }
  
  return report;
};

/**
 * Formatear bytes a formato legible
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Validar estructura de datos
 */
export const validateDataStructure = (data, expectedStructure) => {
  const errors = [];
  const warnings = [];
  
  const validateObject = (obj, structure, path = '') => {
    Object.keys(structure).forEach(key => {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (structure[key].required && !(key in obj)) {
        errors.push(`Missing required field: ${fullPath}`);
        return;
      }
      
      if (key in obj) {
        const expectedType = structure[key].type;
        const actualType = typeof obj[key];
        
        if (expectedType && actualType !== expectedType) {
          if (expectedType === 'array' && !Array.isArray(obj[key])) {
            errors.push(`Type mismatch at ${fullPath}: expected array, got ${actualType}`);
          } else if (expectedType !== 'array' && actualType !== expectedType) {
            errors.push(`Type mismatch at ${fullPath}: expected ${expectedType}, got ${actualType}`);
          }
        }
        
        // Validación recursiva para objetos
        if (structure[key].properties && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          validateObject(obj[key], structure[key].properties, fullPath);
        }
        
        // Validación para arrays
        if (structure[key].items && Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            if (typeof item === 'object') {
              validateObject(item, structure[key].items, `${fullPath}[${index}]`);
            }
          });
        }
      }
    });
  };
  
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      validateObject(item, expectedStructure, `[${index}]`);
    });
  } else {
    validateObject(data, expectedStructure);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Debugging helper - log con timestamp y contexto
 */
export const debugLog = (message, data = null, level = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = `[EVA-${level.toUpperCase()}] ${timestamp}:`;
  
  switch (level) {
    case 'error':
      console.error(prefix, message, data);
      break;
    case 'warn':
      console.warn(prefix, message, data);
      break;
    case 'debug':
      console.debug(prefix, message, data);
      break;
    default:
      console.log(prefix, message, data);
  }
};

/**
 * Exportar datos para debugging
 */
export const exportDebugData = () => {
  const debugData = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
    cacheInfo: getCacheInfo(),
    systemReport: null
  };
  
  // Generar reporte del sistema de forma asíncrona
  generateSystemReport().then(report => {
    debugData.systemReport = report;
  });
  
  return debugData;
};

// Exponer utilidades globalmente en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.EVA_MAINTENANCE = {
    clearAllCache,
    getCacheInfo,
    clearExpiredCache,
    generateSystemReport,
    formatBytes,
    validateDataStructure,
    debugLog,
    exportDebugData
  };
}

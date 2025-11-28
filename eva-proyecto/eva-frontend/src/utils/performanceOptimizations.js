/**
 * 🚀 Utilidades de Optimización de Rendimiento - Sistema EVA
 * 
 * Funciones y utilidades para mejorar el rendimiento de la aplicación
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Hook personalizado para prevenir renders innecesarios con useCallback memoizado
 * @param {Function} callback - Función a memoizar
 * @param {Array} dependencies - Dependencias
 */
export const useOptimizedCallback = (callback, dependencies = []) => {
  return useCallback(callback, dependencies);
};

/**
 * Hook para memoizar valores costosos de calcular
 * @param {Function} factory - Función que genera el valor
 * @param {Array} dependencies - Dependencias
 */
export const useOptimizedMemo = (factory, dependencies = []) => {
  return useMemo(factory, dependencies);
};

/**
 * Hook para detectar si un componente está visible en el viewport
 * Útil para lazy loading de imágenes o contenido
 */
export const useIntersectionObserver = (options = {}) => {
  const targetRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

/**
 * Función para memoizar resultados de funciones costosas
 * @param {Function} fn - Función a memoizar
 * @returns {Function} Función memoizada
 */
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limitar tamaño del cache (últimos 100 resultados)
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

/**
 * Debounce function - Retrasa la ejecución hasta que pasen X ms sin llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounceada
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - Limita ejecución a una vez cada X ms
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Tiempo mínimo entre ejecuciones en ms
 * @returns {Function} Función throttleada
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load de imágenes con placeholder
 * @param {string} src - URL de la imagen
 * @param {string} placeholder - URL del placeholder
 * @returns {Object} Estado de carga de imagen
 */
export const useLazyImage = (src, placeholder = '/placeholder.png') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
    };
    
    img.onerror = () => {
      setLoading(false);
    };
  }, [src]);

  return { imageSrc, loading };
};

/**
 * Optimiza arrays grandes dividiendo el procesamiento
 * @param {Array} array - Array a procesar
 * @param {Function} processor - Función de procesamiento
 * @param {number} chunkSize - Tamaño de cada chunk
 * @returns {Promise} Promesa con resultado procesado
 */
export const processInChunks = async (array, processor, chunkSize = 100) => {
  const results = [];
  
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    // Dar tiempo al navegador para otras tareas
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

/**
 * Compara objetos profundamente (para React.memo)
 * @param {Object} obj1 
 * @param {Object} obj2 
 * @returns {boolean}
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || obj1 === null ||
      typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
};

/**
 * HOC para memoizar componentes con comparación personalizada
 * @param {Component} Component 
 * @param {Function} areEqual - Función de comparación personalizada
 * @returns {Component} Componente memoizado
 */
export const withMemo = (Component, areEqual = deepEqual) => {
  return React.memo(Component, areEqual);
};

/**
 * Genera un ID único para optimizar keys en listas
 */
let idCounter = 0;
export const generateOptimizedKey = (prefix = 'item') => {
  return `${prefix}-${++idCounter}-${Date.now()}`;
};

/**
 * Cache simple en memoria con TTL
 */
export class MemoryCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutos por defecto
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Verificar si expiró
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.get(key);
    return item !== null;
  }
}

// Instancia global del cache
export const globalCache = new MemoryCache();

/**
 * Hook para usar el cache global
 */
export const useCache = (key, fetcher, options = {}) => {
  const { ttl = 5 * 60 * 1000 } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Intentar obtener del cache
        const cached = globalCache.get(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Si no está en cache, hacer fetch
        setLoading(true);
        const result = await fetcher();
        globalCache.set(key, result);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key]);

  return { data, loading, error };
};

export default {
  useOptimizedCallback,
  useOptimizedMemo,
  useIntersectionObserver,
  memoize,
  debounce,
  throttle,
  useLazyImage,
  processInChunks,
  deepEqual,
  withMemo,
  generateOptimizedKey,
  MemoryCache,
  globalCache,
  useCache,
};

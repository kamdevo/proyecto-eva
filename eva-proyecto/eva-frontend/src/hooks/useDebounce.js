/**
 * ========================================
 * HOOKS DE OPTIMIZACIÓN DE RENDIMIENTO
 * ========================================
 *
 * Hooks para debounce, throttle y optimización de búsquedas
 * Mejoran el rendimiento reduciendo llamadas innecesarias a la API
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook useDebounce
 * Retrasa la actualización de un valor hasta que haya pasado un tiempo sin cambios
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook useThrottle
 * Limita la frecuencia de ejecución de una función
 */
export const useThrottle = (value, limit = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Hook useDebouncedCallback
 * Crea una función debounced que se ejecuta después de un retraso
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Función para cancelar el debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Función para ejecutar inmediatamente
  const flush = useCallback((...args) => {
    cancel();
    callback(...args);
  }, [callback, cancel]);

  return [debouncedCallback, cancel, flush];
};

/**
 * Hook useThrottledCallback
 * Crea una función throttled que se ejecuta máximo una vez por período
 */
export const useThrottledCallback = (callback, limit = 300, deps = []) => {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRan.current >= limit) {
      callback(...args);
      lastRan.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRan.current = Date.now();
      }, limit - (now - lastRan.current));
    }
  }, [callback, limit, ...deps]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

/**
 * Hook useSearchOptimization
 * Optimiza búsquedas con debounce, caché y cancelación de requests
 */
export const useSearchOptimization = ({
  searchFunction,
  delay = 300,
  minLength = 2,
  cacheSize = 50,
} = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // Función de búsqueda optimizada
  const performSearch = useCallback(async (term) => {
    if (!term || term.length < minLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Verificar caché
    if (cacheRef.current.has(term)) {
      setResults(cacheRef.current.get(term));
      setIsSearching(false);
      return;
    }

    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await searchFunction(term, {
        signal: abortControllerRef.current.signal,
      });

      // Verificar si la búsqueda no fue cancelada
      if (!abortControllerRef.current.signal.aborted) {
        setResults(searchResults);
        
        // Guardar en caché
        if (cacheRef.current.size >= cacheSize) {
          // Eliminar el elemento más antiguo
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(term, searchResults);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setResults([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [searchFunction, minLength, cacheSize]);

  // Ejecutar búsqueda cuando cambie el término debounced
  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función para limpiar caché
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Función para búsqueda inmediata
  const searchImmediate = useCallback((term) => {
    setSearchTerm(term);
    performSearch(term);
  }, [performSearch]);

  // Función para cancelar búsqueda actual
  const cancelSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSearching(false);
  }, []);

  // Estadísticas de caché
  const cacheStats = useMemo(() => ({
    size: cacheRef.current.size,
    maxSize: cacheSize,
    hitRate: cacheRef.current.size > 0 ? 
      (cacheRef.current.size / (cacheRef.current.size + 1)) * 100 : 0,
  }), [cacheSize, debouncedSearchTerm]); // Trigger recalc on search

  return {
    // Estado
    searchTerm,
    results,
    isSearching,
    error,
    
    // Acciones
    setSearchTerm,
    searchImmediate,
    cancelSearch,
    clearCache,
    
    // Utilidades
    cacheStats,
    
    // Configuración
    minLength,
    delay,
  };
};

/**
 * Hook useInfiniteScroll
 * Optimiza la carga de datos con scroll infinito
 */
export const useInfiniteScroll = ({
  loadMore,
  hasMore = true,
  threshold = 0.8,
  rootMargin = '100px',
} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Función throttled para cargar más datos
  const throttledLoadMore = useThrottledCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      await loadMore();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, 300, [loadMore, isLoading, hasMore]);

  // Configurar Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          throttledLoadMore();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [throttledLoadMore, hasMore, threshold, rootMargin]);

  return {
    // Estados
    isLoading,
    error,
    
    // Ref para el elemento sentinel
    sentinelRef,
    
    // Función manual para cargar más
    loadMore: throttledLoadMore,
  };
};

// Exportar hooks individuales
export default useDebounce;

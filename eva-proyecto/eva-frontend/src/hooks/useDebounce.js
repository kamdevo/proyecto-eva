import { useState, useEffect } from 'react';

/**
 * Hook useDebounce - Optimiza búsquedas y previene renders innecesarios
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos (default: 500ms)
 * @returns {any} Valor debounceado
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Esta búsqueda solo se ejecuta después de 500ms sin cambios
 *   if (debouncedSearch) {
 *     searchAPI(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer timeout para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook useThrottle - Limita la frecuencia de ejecución
 * 
 * @param {any} value - Valor a throttle
 * @param {number} limit - Tiempo mínimo entre actualizaciones en ms (default: 300ms)
 * @returns {any} Valor throttleado
 */
export function useThrottle(value, limit = 300) {
  const [throttledValue, setThrottledValue] = useState(value);
  const [lastRan, setLastRan] = useState(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
        setLastRan(Date.now());
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
}

export default useDebounce;

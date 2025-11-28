import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

// Use the centralized API configuration with correct v1 path
const API_BASE_URL = (API_CONFIG.API_URL || 'http://127.0.0.1:8001/api') + '/v1';

/**
 * Hook personalizado para interactuar con el servicio SECOP
 * Maneja consultas, búsquedas y estadísticas de procesos de contratación pública
 */
export const useSecopService = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  /**
   * Realizar consulta de procesos SECOP con filtros
   */
  const searchProcesses = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros de consulta
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          params.append(key, value.toString().trim());
        }
      });

      const response = await fetch(`${API_BASE_URL}/secop/consultar?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📦 [SECOP] Datos recibidos del backend:', data);
      console.log('📦 [SECOP] data.success:', data.success);
      console.log('📦 [SECOP] data.data:', data.data);
      console.log('📦 [SECOP] Array length:', data.data?.length);

      if (data.success) {
        // Normalizar datos para asegurar compatibilidad
        const normalizedData = (data.data || []).map(process => ({
          ...process,
          // Asegurar que valor sea número
          valor: typeof process.valor === 'string' ? parseFloat(process.valor) || 0 : (process.valor || 0),
          // Normalizar fecha
          fecha_firma: process.fecha_firma ? process.fecha_firma.split('T')[0] : null,
          // Asegurar que los strings estén decodificados
          objeto: process.objeto || '',
          entidad: process.entidad || '',
          proveedor: process.proveedor || '',
          estado: process.estado || 'Sin estado'
        }));
        
        console.log('✨ [SECOP] Datos normalizados:', normalizedData);
        setProcesses(normalizedData);
        console.log('✅ [SECOP] Procesos obtenidos:', normalizedData.length);
      } else {
        throw new Error(data.message || 'Error al consultar SECOP');
      }

    } catch (err) {
      console.error('❌ [SECOP] Error en consulta:', err);
      setError(err.message);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar procesos por término de búsqueda
   */
  const quickSearch = useCallback(async (searchTerm, limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: searchTerm,
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE_URL}/secop/buscar?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📦 [SECOP BÚSQUEDA] Datos recibidos del backend:', data);
      console.log('📦 [SECOP BÚSQUEDA] data.success:', data.success);
      console.log('📦 [SECOP BÚSQUEDA] data.data:', data.data);
      console.log('📦 [SECOP BÚSQUEDA] Array length:', data.data?.length);

      if (data.success) {
        // Normalizar datos para asegurar compatibilidad
        const normalizedData = (data.data || []).map(process => ({
          ...process,
          // Asegurar que valor sea número
          valor: typeof process.valor === 'string' ? parseFloat(process.valor) || 0 : (process.valor || 0),
          // Normalizar fecha
          fecha_firma: process.fecha_firma ? process.fecha_firma.split('T')[0] : null,
          // Asegurar que los strings estén decodificados
          objeto: process.objeto || '',
          entidad: process.entidad || '',
          proveedor: process.proveedor || '',
          estado: process.estado || 'Sin estado'
        }));
        
        console.log('✨ [SECOP BÚSQUEDA] Datos normalizados:', normalizedData);
        setProcesses(normalizedData);
        console.log('🔍 [SECOP] Búsqueda completada:', normalizedData.length, 'resultados');
      } else {
        throw new Error(data.message || 'Error en búsqueda SECOP');
      }

    } catch (err) {
      console.error('❌ [SECOP] Error en búsqueda:', err);
      setError(err.message);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener proceso específico por UID
   */
  const getProcessByUid = useCallback(async (uid) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/secop/proceso/${uid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('📄 [SECOP] Proceso obtenido:', data.data?.uid);
        return data.data;
      } else {
        throw new Error(data.message || 'Proceso no encontrado');
      }

    } catch (err) {
      console.error('❌ [SECOP] Error obteniendo proceso:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas de SECOP
   */
  const getStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/secop/estadisticas`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
        console.log('📊 [SECOP] Estadísticas obtenidas');
      } else {
        console.warn('⚠️ [SECOP] Error obteniendo estadísticas:', data.message);
      }

    } catch (err) {
      console.error('❌ [SECOP] Error obteniendo estadísticas:', err);
      // No establecer error para estadísticas ya que no es crítico
    }
  }, []);

  /**
   * Limpiar caché de SECOP (requiere autenticación)
   */
  const clearCache = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token de autenticación requerido');
      }

      const response = await fetch(`${API_BASE_URL}/secop/limpiar-cache`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('🧹 [SECOP] Caché limpiado exitosamente');
        return true;
      } else {
        throw new Error(data.message || 'Error limpiando caché');
      }

    } catch (err) {
      console.error('❌ [SECOP] Error limpiando caché:', err);
      return false;
    }
  }, []);

  /**
   * Limpiar estado local
   */
  const clearState = useCallback(() => {
    setProcesses([]);
    setError(null);
    setStatistics(null);
    console.log('🧹 [SECOP] Estado local limpiado');
  }, []);

  /**
   * Filtrar procesos por criterios locales
   */
  const filterProcesses = useCallback((criteria) => {
    if (!processes || processes.length === 0) return [];

    return processes.filter(process => {
      // Filtro por entidad
      if (criteria.entidad && !process.entidad?.toLowerCase().includes(criteria.entidad.toLowerCase())) {
        return false;
      }

      // Filtro por valor mínimo
      if (criteria.valor_minimo && process.valor < parseFloat(criteria.valor_minimo)) {
        return false;
      }

      // Filtro por estado
      if (criteria.estado && process.estado !== criteria.estado) {
        return false;
      }

      // Filtro por rango de fechas
      if (criteria.fecha_inicio && process.fecha_firma < criteria.fecha_inicio) {
        return false;
      }

      if (criteria.fecha_fin && process.fecha_firma > criteria.fecha_fin) {
        return false;
      }

      return true;
    });
  }, [processes]);

  /**
   * Obtener resumen de procesos actuales
   */
  const getProcessesSummary = useCallback(() => {
    if (!processes || processes.length === 0) {
      return {
        total: 0,
        totalValue: 0,
        avgValue: 0,
        statusCounts: {}
      };
    }

    const totalValue = processes.reduce((sum, process) => sum + (process.valor || 0), 0);
    const statusCounts = processes.reduce((counts, process) => {
      const status = process.estado || 'Sin estado';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    return {
      total: processes.length,
      totalValue,
      avgValue: totalValue / processes.length,
      statusCounts
    };
  }, [processes]);

  return {
    // Estado
    processes,
    loading,
    error,
    statistics,

    // Acciones principales
    searchProcesses,
    quickSearch,
    getProcessByUid,
    getStatistics,
    clearCache,

    // Utilidades
    clearState,
    filterProcesses,
    getProcessesSummary,

    // Estado computado
    hasProcesses: processes && processes.length > 0,
    isEmpty: !processes || processes.length === 0,
    hasError: !!error,
  };
};

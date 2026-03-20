import { useState, useEffect, useCallback } from 'react';
import api from '../config/apiClient';

const API_BASE_URL = '/v1';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener lista de roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${API_BASE_URL}/roles`);
      const data = response.data;
      
      if (data.success) {
        setRoles(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener roles');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message);
      
      // Fallback a datos básicos en caso de error
      setRoles([
        { id: 1, nombre: 'Administrador' },
        { id: 2, nombre: 'Técnico' },
        { id: 3, nombre: 'Supervisor' },
        { id: 4, nombre: 'Usuario normal' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    refresh: fetchRoles
  };
};

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmpresas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${API_BASE_URL}/empresas`);
      const data = response.data;
      
      if (data.success) {
        setEmpresas(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener empresas');
      }
    } catch (err) {
      console.error('Error fetching empresas:', err);
      setError(err.message);
      
      // Fallback a datos básicos
      setEmpresas([
        { id: 1, name: 'Hospital Universitario del Valle' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  return {
    empresas,
    loading,
    error,
    fetchEmpresas,
    refresh: fetchEmpresas
  };
};

export const useSedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSedes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`${API_BASE_URL}/sedes?per_page=100`);
      const data = response.data;
      
      if (data.success) {
        // Handle both paginated (data.data.data) and non-paginated (data.data) responses
        const sedesResult = data.data;
        if (sedesResult && Array.isArray(sedesResult.data)) {
          setSedes(sedesResult.data);
        } else if (Array.isArray(sedesResult)) {
          setSedes(sedesResult);
        } else {
          setSedes([]);
        }
      } else {
        throw new Error(data.message || 'Error al obtener sedes');
      }
    } catch (err) {
      console.error('Error fetching sedes:', err);
      setError(err.message);
      
      // Fallback a datos básicos
      setSedes([
        { id: 1, name: 'Sede Principal' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSedes();
  }, [fetchSedes]);

  return {
    sedes,
    loading,
    error,
    fetchSedes,
    refresh: fetchSedes
  };
};

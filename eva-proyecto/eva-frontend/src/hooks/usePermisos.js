import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8001/api/v1';

export const usePermisos = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener módulos del sistema
  const fetchModulos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/modulos`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setModulos(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener módulos');
      }
    } catch (err) {
      console.error('Error fetching modulos:', err);
      setError(err.message);
      
      // Fallback a módulos básicos
      setModulos([
        { id: 1, name: 'equipos' },
        { id: 2, name: 'usuarios' },
        { id: 3, name: 'servicios' },
        { id: 4, name: 'equipos industriales' },
        { id: 15, name: 'tickets propios' },
        { id: 16, name: 'tickets activos' },
        { id: 17, name: 'tickets cerrados' },
        { id: 11, name: 'reportes' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener permisos de un usuario específico
  const fetchUserPermissions = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/acciones`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener permisos del usuario');
      }
    } catch (err) {
      console.error('Error fetching user permissions:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar permiso específico
  const updatePermission = useCallback(async (accionId, permissionType, value) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/acciones/${accionId}/toggle`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permission_type: permissionType,
          value: value
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar permiso');
      }
    } catch (err) {
      console.error('Error updating permission:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear permisos por defecto para un usuario
  const createDefaultPermissions = useCallback(async (userId, rolId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/create-default-permissions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rol_id: rolId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear permisos por defecto');
      }
    } catch (err) {
      console.error('Error creating default permissions:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Restablecer permisos de un módulo
  const resetModulePermissions = useCallback(async (moduloId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/modulos/${moduloId}/reset-permissions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al restablecer permisos del módulo');
      }
    } catch (err) {
      console.error('Error resetting module permissions:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de módulos
  const fetchModuleStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/modulos/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas de módulos');
      }
    } catch (err) {
      console.error('Error fetching module stats:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar módulos al montar el componente
  useEffect(() => {
    fetchModulos();
  }, [fetchModulos]);

  return {
    modulos,
    loading,
    error,
    fetchModulos,
    fetchUserPermissions,
    updatePermission,
    createDefaultPermissions,
    resetModulePermissions,
    fetchModuleStats,
    refresh: fetchModulos
  };
};

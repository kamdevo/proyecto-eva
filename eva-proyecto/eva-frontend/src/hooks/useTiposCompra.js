import { useState, useEffect, useCallback } from 'react';

import { API_CONFIG } from '../config/api.js';

const API_BASE_URL = API_CONFIG.API_URL + '/v1';

export const useTiposCompra = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTipos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/tipos-compra`, {
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
        setTipos(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener tipos de compra');
      }
    } catch (err) {
      console.error('Error fetching tipos compra:', err);
      setError(err.message);
      
      // Fallback a datos básicos
      setTipos([
        { id: 1, nombre: 'Orden de Compra' },
        { id: 2, nombre: 'Contrato' },
        { id: 3, nombre: 'Cruce de Cuentas' },
        { id: 4, nombre: 'Comodato' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  return {
    tipos,
    loading,
    error,
    fetchTipos,
    refresh: fetchTipos
  };
};

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProveedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/contacto`, {
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
        setProveedores(data.data || []);
      } else {
        throw new Error(data.message || 'Error al obtener proveedores');
      }
    } catch (err) {
      console.error('Error fetching proveedores:', err);
      setError(err.message);
      
      // Fallback a datos básicos
      setProveedores([
        { id: 1, nombre: 'Proveedor Ejemplo 1', empresa: 'Empresa 1' },
        { id: 2, nombre: 'Proveedor Ejemplo 2', empresa: 'Empresa 2' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  return {
    proveedores,
    loading,
    error,
    fetchProveedores,
    refresh: fetchProveedores
  };
};

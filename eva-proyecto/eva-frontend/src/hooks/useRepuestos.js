import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.2.146:8001/api';

export const useRepuestos = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepuestos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/v1/repuestos-catalogo`, {
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
        // Transform data to match SearchableSelect format {id, label}
        const transformedData = (data.data || []).map(repuesto => ({
          id: repuesto.id,
          label: `${repuesto.name}${repuesto.code ? ` (${repuesto.code})` : ''}`,
          name: repuesto.name,
          code: repuesto.code,
          precio: repuesto.precio
        }));
        
        setRepuestos(transformedData);
      } else {
        throw new Error(data.message || 'Error al obtener repuestos');
      }
    } catch (err) {
      console.error('Error fetching repuestos:', err);
      setError(err.message);
      
      // Fallback to empty array on error
      setRepuestos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepuestos();
  }, [fetchRepuestos]);

  return {
    repuestos,
    loading,
    error,
    refetch: fetchRepuestos
  };
};

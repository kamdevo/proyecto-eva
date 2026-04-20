import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";

/**
 * Hook para gestionar guías rápidas
 */
export const useGuiasRapidas = () => {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cobertura, setCobertura] = useState({
    porcentaje: 0,
    cumplenCriterios: 0,
    cumplenConGuia: 0,
  });

  const fetchGuias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.API_URL}/v1/guiarapida?per_page=9999`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Debug: Ver estructura completa de la respuesta
      console.log('🔍 [DEBUG] Respuesta completa del backend:', data);
      console.log('🔍 [DEBUG] data.data:', data.data);
      console.log('🔍 [DEBUG] data.cobertura (nivel raíz):', data.cobertura);

      if (data.success) {
        // Backend devuelve data.data.data (array de guías)
        const guiasArray = data.data?.data || data.data || [];
        setGuias(Array.isArray(guiasArray) ? guiasArray : []);
        
        // Calcular cobertura - ESTÁ EN EL NIVEL RAÍZ, no dentro de data.data
        if (data.cobertura) {
          const coberturaData = {
            porcentaje: parseFloat(data.cobertura.porcentaje || 0).toFixed(2),
            cumplenCriterios: data.cobertura.cumplenCriterios || 0,
            cumplenConGuia: data.cobertura.cumplenConGuia || 0,
          };
          console.log('✅ [DEBUG] Cobertura procesada:', coberturaData);
          setCobertura(coberturaData);
        }
      } else {
        throw new Error(data.message || "Error al obtener guías rápidas");
      }
    } catch (err) {
      console.error("Error fetching guías rápidas:", err);
      setError(err.message);
      setGuias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear guía
  const createGuia = useCallback(async (guiaData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(guiaData).forEach((key) => {
        if (guiaData[key] !== null && guiaData[key] !== undefined) {
          formData.append(key, guiaData[key]);
        }
      });

      const response = await fetch(`${API_CONFIG.API_URL}/v1/guiarapida`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchGuias(); // Recargar lista
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || "Error al crear guía");
      }
    } catch (err) {
      console.error("Error creating guía:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchGuias]);

  // Actualizar guía
  const updateGuia = useCallback(async (id, guiaData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.keys(guiaData).forEach((key) => {
        if (guiaData[key] !== null && guiaData[key] !== undefined) {
          formData.append(key, guiaData[key]);
        }
      });

      const response = await fetch(`${API_CONFIG.API_URL}/v1/guiarapida/${id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchGuias(); // Recargar lista
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || "Error al actualizar guía");
      }
    } catch (err) {
      console.error("Error updating guía:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchGuias]);

  // Eliminar guía
  const deleteGuia = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.API_URL}/v1/guiarapida/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchGuias(); // Recargar lista
        return { success: true };
      } else {
        throw new Error(data.message || "Error al eliminar guía");
      }
    } catch (err) {
      console.error("Error deleting guía:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchGuias]);

  // Toggle estado
  const toggleEstado = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/v1/guiarapida/${id}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchGuias(); // Recargar lista
        return { success: true };
      } else {
        throw new Error(data.message || "Error al cambiar estado");
      }
    } catch (err) {
      console.error("Error toggling estado:", err);
      return { success: false, error: err.message };
    }
  }, [fetchGuias]);

  // Initial load
  useEffect(() => {
    fetchGuias();
  }, [fetchGuias]);

  return {
    guias,
    loading,
    error,
    cobertura,
    createGuia,
    updateGuia,
    deleteGuia,
    toggleEstado,
    refresh: fetchGuias,
    hasData: guias.length > 0,
    isEmpty: !loading && guias.length === 0,
    hasError: !!error,
  };
};

/**
 * Hook para indicadores por grupo
 */
export const useIndicadorPorGrupo = () => {
  const [indicadores, setIndicadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIndicadores = useCallback(async (filtro = "") => {
    setLoading(true);
    setError(null);

    try {
      const url = filtro
        ? `${API_CONFIG.API_URL}/v1/guiarapida/indicador?nombre=${encodeURIComponent(filtro)}`
        : `${API_CONFIG.API_URL}/v1/guiarapida/indicador`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setIndicadores(data.data || []);
      } else {
        throw new Error(data.message || "Error al obtener indicadores");
      }
    } catch (err) {
      console.error("Error fetching indicadores:", err);
      setError(err.message);
      setIndicadores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicadores();
  }, [fetchIndicadores]);

  return {
    indicadores,
    loading,
    error,
    refresh: fetchIndicadores,
    hasData: indicadores.length > 0,
    isEmpty: !loading && indicadores.length === 0,
  };
};

/**
 * Hook para detalle por grupo
 */
export const useDetallePorGrupo = (nombreEquipo = null) => {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetalles = useCallback(async (nombre = nombreEquipo) => {
    setLoading(true);
    setError(null);

    try {
      const url = nombre
        ? `${API_CONFIG.API_URL}/v1/guiarapida/detalle?nombre=${encodeURIComponent(nombre)}`
        : `${API_CONFIG.API_URL}/v1/guiarapida/detalle`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setDetalles(data.data || []);
      } else {
        throw new Error(data.message || "Error al obtener detalles");
      }
    } catch (err) {
      console.error("Error fetching detalles:", err);
      setError(err.message);
      setDetalles([]);
    } finally {
      setLoading(false);
    }
  }, [nombreEquipo]);

  useEffect(() => {
    fetchDetalles();
  }, [fetchDetalles]);

  return {
    detalles,
    loading,
    error,
    refresh: fetchDetalles,
    fetchByNombre: fetchDetalles,
    hasData: detalles.length > 0,
    isEmpty: !loading && detalles.length === 0,
  };
};

/**
 * Hook para riesgos incluidos y estados excluidos
 */
export const useInclusionesExclusiones = () => {
  const [riesgosIncluidos, setRiesgosIncluidos] = useState([]);
  const [estadosExcluidos, setEstadosExcluidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch riesgos incluidos
      const riesgosResponse = await fetch(
        `${API_CONFIG.API_URL}/v1/riesgoincluidoguia`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Fetch estados excluidos
      const estadosResponse = await fetch(
        `${API_CONFIG.API_URL}/v1/estadoexcluidoguia`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!riesgosResponse.ok || !estadosResponse.ok) {
        throw new Error("Error al obtener datos de inclusiones/exclusiones");
      }

      const riesgosData = await riesgosResponse.json();
      const estadosData = await estadosResponse.json();

      if (riesgosData.success) {
        setRiesgosIncluidos(riesgosData.data || []);
      }

      if (estadosData.success) {
        setEstadosExcluidos(estadosData.data || []);
      }
    } catch (err) {
      console.error("Error fetching inclusiones/exclusiones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    riesgosIncluidos,
    estadosExcluidos,
    loading,
    error,
    refresh: fetchData,
  };
};

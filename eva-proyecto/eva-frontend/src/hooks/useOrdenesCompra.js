import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://127.0.0.1:8001/api/v1";

export const useOrdenesCompra = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [secopData, setSecopData] = useState(null);

  // Obtener lista de órdenes de compra
  const fetchOrdenes = useCallback(
    async (page = 1, perPage = 10, search = "") => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          per_page: perPage.toString(),
          ...(search && { search }),
        });

        const response = await fetch(
          `${API_BASE_URL}/ordenes-compra?${params}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setOrdenes(data.data.data || []);
          setPagination({
            current_page: data.data.current_page || 1,
            per_page: data.data.per_page || 10,
            total: data.data.total || 0,
            last_page: data.data.last_page || 1,
          });
        } else {
          throw new Error(data.message || "Error al obtener órdenes de compra");
        }
      } catch (err) {
        console.error("Error fetching ordenes:", err);
        setError(err.message);
        setOrdenes([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Crear orden de compra
  const createOrden = useCallback(
    async (ordenData) => {
      try {
        setLoading(true);
        setError(null);

        console.log('📤 [CREATE ORDER] Enviando datos:', ordenData);

        // Si ya es FormData, usarlo directamente; si no, crear uno nuevo
        let formData;
        if (ordenData instanceof FormData) {
          formData = ordenData;
          console.log('📦 [CREATE ORDER] FormData recibido directamente');
        } else {
          formData = new FormData();
          Object.keys(ordenData).forEach((key) => {
            if (ordenData[key] !== null && ordenData[key] !== undefined && ordenData[key] !== '') {
              formData.append(key, ordenData[key]);
            }
          });
        }

        const response = await fetch(`${API_BASE_URL}/ordenes-compra`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            // No incluir Content-Type para FormData
          },
          body: formData,
        });

        console.log('📥 [CREATE ORDER] Respuesta status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          // Refrescar la lista después de crear
          await fetchOrdenes(pagination.current_page, pagination.per_page);
          return data.data;
        } else {
          throw new Error(data.message || "Error al crear orden de compra");
        }
      } catch (err) {
        console.error("Error creating orden:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, fetchOrdenes]
  );

  // Actualizar orden de compra
  const updateOrden = useCallback(
    async (id, ordenData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ordenData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          // Refrescar la lista después de actualizar
          await fetchOrdenes(pagination.current_page, pagination.per_page);
          return data.data;
        } else {
          throw new Error(
            data.message || "Error al actualizar orden de compra"
          );
        }
      } catch (err) {
        console.error("Error updating orden:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, fetchOrdenes]
  );

  // Eliminar orden de compra
  const deleteOrden = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          // Refrescar la lista después de eliminar
          await fetchOrdenes(pagination.current_page, pagination.per_page);
          return true;
        } else {
          throw new Error(data.message || "Error al eliminar orden de compra");
        }
      } catch (err) {
        console.error("Error deleting orden:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, fetchOrdenes]
  );

  // Consultar SECOP
  const consultarSECOP = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/secop/consultar`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Error al consultar SECOP");
      }
    } catch (err) {
      console.error("Error consulting SECOP:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar a Excel
  const exportToExcel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/ordenes-compra/export/excel`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Crear blob y descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `ordenes_compra_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (err) {
      console.error("Error exporting to Excel:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar página
  const changePage = useCallback(
    (page) => {
      fetchOrdenes(page, pagination.per_page);
    },
    [fetchOrdenes, pagination.per_page]
  );

  // Cambiar tamaño de página
  const changePageSize = useCallback(
    (perPage) => {
      fetchOrdenes(1, perPage);
    },
    [fetchOrdenes]
  );

  // Buscar órdenes (simple)
  const searchOrdenes = useCallback(
    (searchTerm) => {
      fetchOrdenes(1, pagination.per_page, searchTerm);
    },
    [fetchOrdenes, pagination.per_page]
  );

  // Búsqueda avanzada de órdenes
  const searchOrdenesAvanzada = useCallback(
    async (searchParams) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        // Agregar parámetros de búsqueda
        Object.keys(searchParams).forEach((key) => {
          if (searchParams[key]) {
            params.append(key, searchParams[key]);
          }
        });

        const response = await fetch(
          `${API_BASE_URL}/ordenes-compra/search?${params}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          return data.data || [];
        } else {
          throw new Error(data.message || "Error en búsqueda avanzada");
        }
      } catch (err) {
        console.error("Error in advanced search:", err);
        setError(err.message);

        // Fallback: usar búsqueda simple si hay un término de código
        if (searchParams.codigo) {
          const results = await fetchOrdenes(1, 50, searchParams.codigo);
          return ordenes.filter(
            (orden) =>
              orden.orden &&
              orden.orden
                .toLowerCase()
                .includes(searchParams.codigo.toLowerCase())
          );
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOrdenes, ordenes]
  );

  // Cargar órdenes al montar el componente
  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  // Obtener orden específica
  const getOrden = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/ordenes-compra/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || "Error al obtener orden de compra");
      }
    } catch (err) {
      console.error("Error getting orden:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ordenes,
    loading,
    error,
    pagination,
    secopData,
    fetchOrdenes,
    createOrden,
    updateOrden,
    deleteOrden,
    getOrden,
    consultarSECOP,
    exportToExcel,
    changePage,
    changePageSize,
    searchOrdenes,
    searchOrdenesAvanzada,
    refresh: () => fetchOrdenes(pagination.current_page, pagination.per_page),
  };
};

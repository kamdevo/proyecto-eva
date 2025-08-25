import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://127.0.0.1:8001/api/v1";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  // Obtener lista de usuarios
  const fetchUsuarios = useCallback(
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
          `${API_BASE_URL}/usuarios-public?${params}`,
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
          setUsuarios(data.data.data || []);
          setPagination({
            current_page: data.data.current_page || 1,
            per_page: data.data.per_page || 10,
            total: data.data.total || 0,
            last_page: data.data.last_page || 1,
          });
        } else {
          throw new Error(data.message || "Error al obtener usuarios");
        }
      } catch (err) {
        console.error("Error fetching usuarios:", err);
        setError(err.message);
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Crear usuario
  const createUsuario = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/usuarios`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data.success) {
          // Refrescar la lista después de crear
          await fetchUsuarios(pagination.current_page, pagination.per_page);
          return data.data;
        } else {
          throw new Error(data.message || "Error al crear usuario");
        }
      } catch (err) {
        console.error("Error creating usuario:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, fetchUsuarios]
  );

  // Actualizar usuario
  const updateUsuario = useCallback(
    async (id, userData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
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
          await fetchUsuarios(pagination.current_page, pagination.per_page);
          return data.data;
        } else {
          throw new Error(data.message || "Error al actualizar usuario");
        }
      } catch (err) {
        console.error("Error updating usuario:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, fetchUsuarios]
  );

  // Eliminar usuario (eliminación lógica)
  const deleteUsuario = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
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
          await fetchUsuarios(pagination.current_page, pagination.per_page);
          return true;
        } else {
          throw new Error(data.message || "Error al eliminar usuario");
        }
      } catch (err) {
        console.error("Error deleting usuario:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, fetchUsuarios]
  );

  // Obtener usuario específico
  const getUsuario = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
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
        throw new Error(data.message || "Error al obtener usuario");
      }
    } catch (err) {
      console.error("Error fetching usuario:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar página
  const changePage = useCallback(
    (page) => {
      fetchUsuarios(page, pagination.per_page);
    },
    [fetchUsuarios, pagination.per_page]
  );

  // Cambiar tamaño de página
  const changePageSize = useCallback(
    (perPage) => {
      fetchUsuarios(1, perPage);
    },
    [fetchUsuarios]
  );

  // Buscar usuarios
  const searchUsuarios = useCallback(
    (searchTerm) => {
      fetchUsuarios(1, pagination.per_page, searchTerm);
    },
    [fetchUsuarios, pagination.per_page]
  );

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return {
    usuarios,
    loading,
    error,
    pagination,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuario,
    changePage,
    changePageSize,
    searchUsuarios,
    refresh: () => fetchUsuarios(pagination.current_page, pagination.per_page),
  };
};

import { useState, useEffect, useCallback } from "react";
import medicalDevicesService from "../services/medicalDevicesService";

/**
 * Hook personalizado para gestión de equipos médicos
 * Maneja estado, carga de datos y operaciones CRUD
 */
export const useMedicalDevices = () => {
  // Estados principales
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  // Estados para filtros y opciones
  const [filterOptions, setFilterOptions] = useState({
    servicios: [],
    areas: [],
    sedes: [],
    estados: [],
    clasificaciones: [],
    riesgos: [],
    propietarios: [],
  });

  const [filters, setFilters] = useState({
    search: "",
    servicio_id: "",
    area_id: "",
    sede_id: "",
    estado_id: "",
    clasificacion_id: "",
    riesgo_id: "",
    propietario_id: "",
    page: 1,
    per_page: 15,
    sort_by: "name",
    sort_order: "asc",
  });

  // Estados para estadísticas
  const [stats, setStats] = useState({
    total_equipos: 0,
    operativos: 0,
    en_mantenimiento: 0,
    fuera_servicio: 0,
    mantenimientos_mes: 0,
    calibraciones_mes: 0,
    por_clasificacion: [],
    por_riesgo: [],
  });

  /**
   * Cargar equipos médicos con filtros actuales
   */
  const loadDevices = useCallback(
    async (customFilters = null) => {
      setLoading(true);
      setError(null);

      try {
        const currentFilters = customFilters || filters;
        const response = await medicalDevicesService.getAllMedicalDevices(
          currentFilters
        );

        // Manejar diferentes estructuras de respuesta del backend
        if (response && response.success !== false) {
          const data = response.data || response;

          setDevices(data.data || data || []);
          setPagination({
            current_page: data.current_page || currentFilters.page || 1,
            per_page: data.per_page || currentFilters.per_page || 15,
            total: data.total || 0,
            last_page: data.last_page || 1,
          });
        } else {
          throw new Error(response?.message || "Error al cargar equipos");
        }
      } catch (err) {
        // Manejar errores específicos - Sin redirección para equipos biomédicos
        if (err.response?.status === 401) {
          setError(
            "Las rutas de equipos biomédicos están configuradas como públicas. Continuando..."
          );
          console.warn(
            "401 en equipos biomédicos - continuando sin autenticación"
          );
        } else if (err.response?.status === 403) {
          setError("No tienes permisos para acceder a esta información.");
        } else if (err.response?.status === 404) {
          setError("Servicio no disponible. Contacta al administrador.");
        } else {
          setError(err.message || "Error al cargar equipos médicos");
        }
        console.error("Error loading devices:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  /**
   * Cargar opciones para filtros
   */
  const loadFilterOptions = useCallback(async () => {
    try {
      const response = await medicalDevicesService.getFilterOptions();
      if (response.status === "success") {
        setFilterOptions(response.data);
      }
    } catch (err) {
      console.error("Error loading filter options:", err);
    }
  }, []);

  /**
   * Cargar estadísticas de equipos médicos
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await medicalDevicesService.getGeneralStats();
      if (response.status === "success") {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  /**
   * Actualizar filtros y recargar datos
   */
  const updateFilters = useCallback(
    (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);
    },
    [filters]
  );

  /**
   * Cambiar página
   */
  const changePage = useCallback(
    (page) => {
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);
    },
    [filters]
  );

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: "",
      servicio_id: "",
      area_id: "",
      sede_id: "",
      estado_id: "",
      clasificacion_id: "",
      riesgo_id: "",
      propietario_id: "",
      page: 1,
      per_page: 15,
      sort_by: "name",
      sort_order: "asc",
    };
    setFilters(clearedFilters);
  }, []);

  /**
   * Buscar equipos por término
   */
  const searchDevices = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await medicalDevicesService.searchDevices(searchTerm);
      if (response.status === "success") {
        setDevices(response.data || []);
      }
    } catch (err) {
      setError(err.message || "Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un equipo específico por ID
   */
  const getDeviceById = useCallback(async (id) => {
    try {
      const response = await medicalDevicesService.getMedicalDeviceById(id);
      return response.status === "success" ? response.data : null;
    } catch (err) {
      console.error("Error getting device by ID:", err);
      return null;
    }
  }, []);

  /**
   * Crear nuevo equipo
   */
  const createDevice = useCallback(
    async (deviceData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalDevicesService.createMedicalDevice(
          deviceData
        );
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          await loadStats(); // Actualizar estadísticas
          return response;
        }
        throw new Error(response.message || "Error al crear equipo");
      } catch (err) {
        setError(err.message || "Error al crear equipo");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDevices, loadStats]
  );

  /**
   * Actualizar equipo existente
   */
  const updateDevice = useCallback(
    async (id, deviceData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalDevicesService.updateMedicalDevice(
          id,
          deviceData
        );
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          return response;
        }
        throw new Error(response.message || "Error al actualizar equipo");
      } catch (err) {
        setError(err.message || "Error al actualizar equipo");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDevices]
  );

  /**
   * Eliminar equipo
   */
  const deleteDevice = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalDevicesService.deleteMedicalDevice(id);
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          await loadStats(); // Actualizar estadísticas
          return response;
        }
        throw new Error(response.message || "Error al eliminar equipo");
      } catch (err) {
        setError(err.message || "Error al eliminar equipo");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDevices, loadStats]
  );

  /**
   * Cambiar estado de un equipo
   */
  const toggleDeviceStatus = useCallback(
    async (id, newStatusId) => {
      try {
        const response = await medicalDevicesService.toggleStatus(
          id,
          newStatusId
        );
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          await loadStats(); // Actualizar estadísticas
          return response;
        }
        throw new Error(response.message || "Error al cambiar estado");
      } catch (err) {
        setError(err.message || "Error al cambiar estado");
        throw err;
      }
    },
    [loadDevices, loadStats]
  );

  /**
   * Obtener historial de mantenimientos
   */
  const getMaintenanceHistory = useCallback(async (id) => {
    try {
      const response = await medicalDevicesService.getMaintenanceHistory(id);
      return response.status === "success" ? response.data : [];
    } catch (err) {
      console.error("Error getting maintenance history:", err);
      return [];
    }
  }, []);

  /**
   * Obtener historial de calibraciones
   */
  const getCalibrationHistory = useCallback(async (id) => {
    try {
      const response = await medicalDevicesService.getCalibrationHistory(id);
      return response.status === "success" ? response.data : [];
    } catch (err) {
      console.error("Error getting calibration history:", err);
      return [];
    }
  }, []);

  /**
   * Obtener documentos del equipo
   */
  const getDeviceDocuments = useCallback(async (id) => {
    try {
      const response = await medicalDevicesService.getDeviceDocuments(id);
      return response.status === "success" ? response.data : [];
    } catch (err) {
      console.error("Error getting device documents:", err);
      return [];
    }
  }, []);

  /**
   * Subir documento
   */
  const uploadDocument = useCallback(async (id, formData) => {
    try {
      const response = await medicalDevicesService.uploadDocument(id, formData);
      return response;
    } catch (err) {
      console.error("Error uploading document:", err);
      throw err;
    }
  }, []);

  /**
   * Actualización masiva de equipos
   */
  const bulkUpdate = useCallback(
    async (deviceIds, updateData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalDevicesService.bulkUpdate(
          deviceIds,
          updateData
        );
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          await loadStats(); // Actualizar estadísticas
          return response;
        }
        throw new Error(response.message || "Error en actualización masiva");
      } catch (err) {
        setError(err.message || "Error en actualización masiva");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDevices, loadStats]
  );

  /**
   * Eliminación masiva de equipos
   */
  const bulkDelete = useCallback(
    async (deviceIds) => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalDevicesService.bulkDelete(deviceIds);
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          await loadStats(); // Actualizar estadísticas
          return response;
        }
        throw new Error(response.message || "Error en eliminación masiva");
      } catch (err) {
        setError(err.message || "Error en eliminación masiva");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDevices, loadStats]
  );

  /**
   * Importar equipos desde archivo
   */
  const importDevices = useCallback(
    async (formData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await medicalDevicesService.importDevices(formData);
        if (response.status === "success") {
          await loadDevices(); // Recargar lista
          await loadStats(); // Actualizar estadísticas
          return response;
        }
        throw new Error(response.message || "Error en importación");
      } catch (err) {
        setError(err.message || "Error en importación");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadDevices, loadStats]
  );

  // Efectos para cargar datos iniciales
  useEffect(() => {
    loadFilterOptions();
    loadStats();
  }, [loadFilterOptions, loadStats]);

  useEffect(() => {
    loadDevices();
  }, [filters, loadDevices]);

  // Retornar todo lo necesario para el componente
  return {
    // Datos
    devices,
    loading,
    error,
    pagination,
    filterOptions,
    filters,
    stats,

    // Funciones de manipulación de datos
    updateFilters,
    changePage,
    clearFilters,
    searchDevices,
    getDeviceById,
    createDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceStatus,

    // Funciones específicas
    getMaintenanceHistory,
    getCalibrationHistory,
    getDeviceDocuments,
    uploadDocument,
    bulkUpdate,
    bulkDelete,
    importDevices,

    // Funciones de recarga
    refreshDevices: loadDevices,
    refreshStats: loadStats,
    refreshFilterOptions: loadFilterOptions,
  };
};

export default useMedicalDevices;

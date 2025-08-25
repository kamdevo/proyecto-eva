import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";

/**
 * Hook personalizado para gestión de equipos industriales
 * Maneja estado, carga de datos y operaciones CRUD
 */
export const useIndustrialDevices = () => {
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
    // Filtros específicos
    filtro_code: "",
    filtro_name: "",
    filtro_serial: "",
    filtro_marca: "",
    filtro_modelo: "",
    filtro_zona: "",
    servicio_id_auxiliar: "",
    area_id_auxiliar: "",
    filtro_estadoequipo_id: "",
    filtro_estadom: "",
    filtro_cbiomedica_id: "",
    filtro_criesgo_id: "",
    filtro_propietario_id: "",
    filtro_sede_id: "",
    filtro_fecha_inicio: "",
    filtro_fecha_fin: "",
    filtro_fecha_instalacion_inicio: "",
    filtro_fecha_instalacion_fin: "",
    filtro_fecha_fabricacion_inicio: "",
    filtro_fecha_fabricacion_fin: "",
    filtro_fecha_recepcion_inicio: "",
    filtro_fecha_recepcion_fin: "",
    filtro_fecha_acta_inicio: "",
    filtro_fecha_acta_fin: "",
    filtro_fecha_inicio_operacion_inicio: "",
    filtro_fecha_inicio_operacion_fin: "",
    filtro_valor_inicial: "",
    filtro_valor_final: "",
    filtro_vida_util_inicial: "",
    filtro_vida_util_final: "",
    filtro_frecuencia_inicial: "",
    filtro_frecuencia_final: "",
    filtro_orden_compra: "",
    filtro_tipo_compra: "",
    filtro_numero_invima: "",
    filtro_estado_invima: "",
    filtro_fecha_vencimiento_invima_inicio: "",
    filtro_fecha_vencimiento_invima_fin: "",
    filtro_registro_sanitario: "",
    filtro_tiene_imagen: "",
    filtro_tiene_archivo: "",
    filtro_tiene_archivo_invima: "",
    filtro_tiene_manual: "",
    filtro_tiene_plano: "",
    filtro_tiene_observaciones: "",
    filtro_tiene_mantenimientos: "",
    filtro_tiene_calibraciones: "",
    filtro_tiene_correctivos: "",
    filtro_tiene_ordenes: "",
    filtro_tiene_archivos_adicionales: "",
    filtro_tiene_planes_mantenimiento: "",
    page: 1,
    per_page: 15,
    sort_by: "equipos.name",
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
   * Función para obtener equipos industriales con filtros aplicados
   */
  const fetchIndustrialDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      
      // Agregar filtros activos
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `${API_CONFIG.API_URL}/v1/equipos/industrial-devices-complete?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setDevices(data.data.data || []);
        setPagination({
          current_page: data.data.current_page || 1,
          per_page: data.data.per_page || 15,
          total: data.data.total || 0,
          last_page: data.data.last_page || 1,
        });
      } else {
        throw new Error(data.message || "Error al cargar equipos industriales");
      }
    } catch (err) {
      console.error("Error fetching industrial devices:", err);
      setError(err.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Función para obtener opciones de filtros
   */
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.API_URL}/v1/equipos/filter-options`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }, []);

  /**
   * Función para obtener estadísticas de equipos industriales
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.API_URL}/v1/equipos/estadisticas/industrial-devices`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching industrial devices stats:", err);
    }
  }, []);

  /**
   * Función para actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page to 1 when filters change (except when changing page)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  /**
   * Función para cambiar página
   */
  const changePage = useCallback((page) => {
    if (page < 1 || (pagination.last_page > 0 && page > pagination.last_page)) {
      return;
    }
    updateFilters({ page });
  }, [updateFilters, pagination.last_page]);

  /**
   * Función para cambiar tamaño de página
   */
  const changePageSize = useCallback((per_page) => {
    updateFilters({ per_page, page: 1 });
  }, [updateFilters]);

  /**
   * Función para buscar equipos
   */
  const search = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 });
  }, [updateFilters]);

  /**
   * Función para limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      servicio_id: "",
      area_id: "",
      sede_id: "",
      estado_id: "",
      clasificacion_id: "",
      riesgo_id: "",
      propietario_id: "",
      filtro_code: "",
      filtro_name: "",
      filtro_serial: "",
      filtro_marca: "",
      filtro_modelo: "",
      filtro_zona: "",
      servicio_id_auxiliar: "",
      area_id_auxiliar: "",
      filtro_estadoequipo_id: "",
      filtro_estadom: "",
      filtro_cbiomedica_id: "",
      filtro_criesgo_id: "",
      filtro_propietario_id: "",
      filtro_sede_id: "",
      filtro_fecha_inicio: "",
      filtro_fecha_fin: "",
      filtro_fecha_instalacion_inicio: "",
      filtro_fecha_instalacion_fin: "",
      filtro_fecha_fabricacion_inicio: "",
      filtro_fecha_fabricacion_fin: "",
      filtro_fecha_recepcion_inicio: "",
      filtro_fecha_recepcion_fin: "",
      filtro_fecha_acta_inicio: "",
      filtro_fecha_acta_fin: "",
      filtro_fecha_inicio_operacion_inicio: "",
      filtro_fecha_inicio_operacion_fin: "",
      filtro_valor_inicial: "",
      filtro_valor_final: "",
      filtro_vida_util_inicial: "",
      filtro_vida_util_final: "",
      filtro_frecuencia_inicial: "",
      filtro_frecuencia_final: "",
      filtro_orden_compra: "",
      filtro_tipo_compra: "",
      filtro_numero_invima: "",
      filtro_estado_invima: "",
      filtro_fecha_vencimiento_invima_inicio: "",
      filtro_fecha_vencimiento_invima_fin: "",
      filtro_registro_sanitario: "",
      filtro_tiene_imagen: "",
      filtro_tiene_archivo: "",
      filtro_tiene_archivo_invima: "",
      filtro_tiene_manual: "",
      filtro_tiene_plano: "",
      filtro_tiene_observaciones: "",
      filtro_tiene_mantenimientos: "",
      filtro_tiene_calibraciones: "",
      filtro_tiene_correctivos: "",
      filtro_tiene_ordenes: "",
      filtro_tiene_archivos_adicionales: "",
      filtro_tiene_planes_mantenimiento: "",
      page: 1,
      per_page: 15,
      sort_by: "equipos.name",
      sort_order: "asc",
    });
  }, []);

  /**
   * Función para refrescar datos
   */
  const refresh = useCallback(() => {
    fetchIndustrialDevices();
    fetchStats();
  }, [fetchIndustrialDevices, fetchStats]);

  // Efectos
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchIndustrialDevices();
  }, [fetchIndustrialDevices]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Valores calculados
  const hasError = !!error;
  const isEmpty = !loading && devices.length === 0;
  const currentPage = pagination.current_page;
  const totalPages = pagination.last_page;
  const totalItems = pagination.total;
  const showingFrom = totalItems > 0 ? (currentPage - 1) * pagination.per_page + 1 : 0;
  const showingTo = Math.min(currentPage * pagination.per_page, totalItems);

  return {
    // Data
    devices,
    pagination,
    filterOptions,
    filters,
    stats,

    // States
    loading,
    error,
    hasError,
    isEmpty,

    // Computed values
    currentPage,
    totalPages,
    totalItems,
    showingFrom,
    showingTo,

    // Actions
    updateFilters,
    changePage,
    changePageSize,
    search,
    clearFilters,
    refresh,
    fetchIndustrialDevices,
    fetchFilterOptions,
    fetchStats,
  };
};

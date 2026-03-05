import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";
import medicalDevicesService from "../services/medicalDevicesService";

/**
 * Hook genérico para gestión de equipos (biomédicos e industriales)
 * Maneja estado, carga de datos y operaciones CRUD
 */
export const useEquipment = (equipmentType = "biomedical") => {
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

  // Filtros base comunes
  const baseFilters = {
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
    page: 1,
    per_page: 15,
    sort_by: equipmentType === "industrial" ? "equipos.name" : "name",
    sort_order: "asc",
  };

  // Filtros específicos para equipos industriales
  const industrialFilters = {
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
    filtro_registro_sanitario_invima: "",
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
  };

  // Filtros específicos para equipos biomédicos
  const biomedicalFilters = {
    proveedor_mantenimiento: "",
    tipo_id: "",
    estado_id_cg: "",
    anio_plan: "",
    consulta_id: "",
  };

  // Combinar filtros según el tipo de equipo
  const [filters, setFilters] = useState(() => ({
    ...baseFilters,
    ...(equipmentType === "industrial" ? industrialFilters : biomedicalFilters),
  }));

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
   * Obtener configuración de endpoints según el tipo de equipo
   */
  const getEndpoints = () => {
    if (equipmentType === "industrial") {
      return {
        devices: `${API_CONFIG.API_URL}/v1/equipos/industrial-devices-complete`,
        stats: `${API_CONFIG.API_URL}/v1/equipos/estadisticas/industrial-devices`,
        filterOptions: `${API_CONFIG.API_URL}/v1/equipos/filter-options`,
      };
    } else {
      return {
        devices: null, // Usar servicio para biomédicos
        stats: null,   // Usar servicio para biomédicos
        filterOptions: null, // Usar servicio para biomédicos
      };
    }
  };

  /**
   * Cargar equipos con filtros aplicados
   */
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (equipmentType === "industrial") {
        // Usar API directa para equipos industriales
        const endpoints = getEndpoints();
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            queryParams.append(key, value);
          }
        });

        const response = await fetch(`${endpoints.devices}?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

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
      } else {
        // Usar servicio para equipos biomédicos
        const response = await medicalDevicesService.getAllMedicalDevices(filters);

        if (response && response.success !== false) {
          const data = response.data || response;
          setDevices(data.data || data || []);
          setPagination({
            current_page: data.current_page || filters.page || 1,
            per_page: data.per_page || filters.per_page || 15,
            total: data.total || 0,
            last_page: data.last_page || 1,
          });
        } else {
          throw new Error(response?.message || "Error al cargar equipos biomédicos");
        }
      }
    } catch (err) {
      console.error(`Error fetching ${equipmentType} devices:`, err);
      setError(err.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, [filters, equipmentType]);

  /**
   * Cargar opciones de filtros
   */
  const fetchFilterOptions = useCallback(async () => {
    try {
      if (equipmentType === "industrial") {
        const endpoints = getEndpoints();
        const response = await fetch(endpoints.filterOptions, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setFilterOptions(data.data);
        }
      } else {
        const response = await medicalDevicesService.getFilterOptions();
        if (response.status === "success") {
          setFilterOptions(response.data);
        }
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  }, [equipmentType]);

  /**
   * Cargar estadísticas
   */
  const fetchStats = useCallback(async () => {
    try {
      if (equipmentType === "industrial") {
        const endpoints = getEndpoints();
        const response = await fetch(endpoints.stats, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } else {
        const response = await medicalDevicesService.getGeneralStats();
        if (response.status === "success") {
          setStats(response.data);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, [equipmentType]);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((page) => {
    if (page < 1 || (pagination.last_page > 0 && page > pagination.last_page)) {
      return;
    }
    updateFilters({ page });
  }, [updateFilters, pagination.last_page]);

  /**
   * Cambiar tamaño de página
   */
  const changePageSize = useCallback((per_page) => {
    updateFilters({ per_page: parseInt(per_page), page: 1 });
  }, [updateFilters]);

  /**
   * Buscar equipos
   */
  const search = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 });
  }, [updateFilters]);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      ...baseFilters,
      ...(equipmentType === "industrial" ? industrialFilters : biomedicalFilters),
    });
  }, [equipmentType]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    fetchDevices();
    fetchStats();
  }, [fetchDevices, fetchStats]);

  // Efectos
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

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
    fetchDevices,
    fetchFilterOptions,
    fetchStats,

    // Equipment type
    equipmentType,
  };
};

import { useState, useEffect, useCallback, useRef } from "react";
import { API_CONFIG } from "../config/api";
import medicalDevicesService from "../services/medicalDevicesService";

// Cache global entre navegaciones (sobrevive re-mount del componente)
const equipmentCache = {
  biomedical: { devices: null, pagination: null, filterOptions: null, stats: null, timestamp: 0, filtersKey: "" },
  industrial: { devices: null, pagination: null, filterOptions: null, stats: null, timestamp: 0, filtersKey: "" },
};
const CACHE_TTL = 3 * 60 * 1000; // 3 minutos

function getCacheEntry(type) {
  return equipmentCache[type] || equipmentCache.biomedical;
}

function filtersToKey(filters) {
  return JSON.stringify(filters);
}

/**
 * Hook genérico para gestión de equipos (biomédicos e industriales)
 * Maneja estado, carga de datos y operaciones CRUD
 */
export const useEquipment = (equipmentType = "biomedical") => {
  // Ref para evitar fetches duplicados en StrictMode
  const fetchingRef = useRef(false);

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

        // LOG ROBUSTO para depuración de estructura
        console.log("[EVA DEBUG] Respuesta equipos biomédicos:", response);
        let equiposData = [];
        let paginacion = {};
        if (response && response.success !== false) {
          const data = response.data || response;
          // Intentar detectar la estructura correcta
          if (Array.isArray(data.data)) {
            equiposData = data.data;
            paginacion = data;
          } else if (data.data && Array.isArray(data.data.data)) {
            equiposData = data.data.data;
            paginacion = data.data;
          } else if (Array.isArray(data)) {
            equiposData = data;
            paginacion = {};
          } else {
            console.error("[EVA ERROR] Estructura inesperada en equipos biomédicos:", data);
          }
          setDevices(equiposData);
          setPagination({
            current_page: paginacion.current_page || filters.page || 1,
            per_page: paginacion.per_page || filters.per_page || 15,
            total: paginacion.total || 0,
            last_page: paginacion.last_page || 1,
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
   * Obtiene todos los IDs de equipos que coinciden con los filtros actuales (sin paginación)
   */
  const getFilteredIds = useCallback(async () => {
    try {
      if (equipmentType === "biomedical") {
        return await medicalDevicesService.getAllFilteredIds(filters);
      } else {
        // Para industriales, implementar similar si es necesario
        const endpoints = getEndpoints();
        const queryParams = new URLSearchParams({ ...filters, get_all_ids: "1" });
        const response = await fetch(`${endpoints.devices}?${queryParams}`);
        const data = await response.json();
        return data.success ? data.ids : [];
      }
    } catch (err) {
      console.error("Error getting filtered IDs:", err);
      return [];
    }
  }, [filters, equipmentType]);

  /**
   * Refrescar datos (invalida cache)
   */
  const refresh = useCallback(() => {
    const cache = getCacheEntry(equipmentType);
    cache.timestamp = 0;
    cache.filtersKey = "";
    fetchDevices();
    fetchStats();
  }, [fetchDevices, fetchStats, equipmentType]);

  // Carga inicial: usar cache si está fresco, sino cargar en paralelo
  useEffect(() => {
    const cache = getCacheEntry(equipmentType);
    const now = Date.now();
    const currentKey = filtersToKey(filters);
    const isCacheFresh = (now - cache.timestamp) < CACHE_TTL && cache.filtersKey === currentKey;

    if (isCacheFresh && cache.devices && cache.filterOptions) {
      // Restaurar desde cache instantáneamente
      setDevices(cache.devices);
      setPagination(cache.pagination || pagination);
      setFilterOptions(cache.filterOptions);
      if (cache.stats) setStats(cache.stats);
      return;
    }

    // Cargar filter options + stats en paralelo con devices
    if (!fetchingRef.current) {
      fetchingRef.current = true;
      Promise.all([
        fetchFilterOptions(),
        fetchStats(),
      ]).finally(() => {
        fetchingRef.current = false;
      });
    }
  }, [equipmentType]); // Solo en mount / cambio de tipo

  // Fetch devices cuando cambian filtros
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Guardar en cache después de cada fetch exitoso
  useEffect(() => {
    if (devices.length > 0 || pagination.total > 0) {
      const cache = getCacheEntry(equipmentType);
      cache.devices = devices;
      cache.pagination = pagination;
      cache.timestamp = Date.now();
      cache.filtersKey = filtersToKey(filters);
    }
  }, [devices, pagination, equipmentType, filters]);

  useEffect(() => {
    if (filterOptions.servicios?.length > 0 || filterOptions.sedes?.length > 0) {
      const cache = getCacheEntry(equipmentType);
      cache.filterOptions = filterOptions;
    }
  }, [filterOptions, equipmentType]);

  useEffect(() => {
    if (stats.total_equipos > 0) {
      const cache = getCacheEntry(equipmentType);
      cache.stats = stats;
    }
  }, [stats, equipmentType]);

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
    getFilteredIds,

    // Equipment type
    equipmentType,
  };
};

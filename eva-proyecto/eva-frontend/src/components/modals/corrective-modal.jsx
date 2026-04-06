import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Download,
  FileSpreadsheet,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import Pagination from "@/components/common/Pagination";

/**
 * Modal de Correctivos Generales - Versión Simplificada
 *
 * Funcionalidades principales:
 * - Lista completa de correctivos con integración a base de datos
 * - Búsqueda global en todos los campos
 * - Funcionalidad de exportación Excel/CSV
 * - Filtrado y ordenamiento avanzado
 * - Paginación con tamaños configurables
 * - Vista de detalles de correctivos
 * - Diseño responsivo y optimizado
 *
 * Integración con base de datos:
 * - correctivos_generales: Registros principales de correctivos
 * - equipos: Información y relaciones de equipos
 * - usuarios: Asignaciones y responsabilidades
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de visibilidad del modal
 * @param {function} props.onOpenChange - Función para cambiar el estado del modal
 */
export function CorrectiveModal({ open, onOpenChange, equipmentType = "biomedico" }) {
  // Agregar estilos CSS para sobrescribir limitaciones globales
  React.useEffect(() => {
    if (open) {
      const style = document.createElement("style");
      style.textContent = `
        [data-radix-dialog-content] {
          max-width: 95vw !important;
          width: 95vw !important;
        }
        .corrective-modal-wide [data-radix-dialog-content] {
          max-width: 95vw !important;
          width: 95vw !important;
        }
        .corrective-modal-detail [data-radix-dialog-content] {
          max-width: 90vw !important;
          width: 90vw !important;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, [open]);

  // State Management
  const [correctiveData, setCorrectiveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: "fecha_creacion",
    direction: "desc",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Paginación funcional
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedCorrective, setSelectedCorrective] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'view'

  /**
   * Load corrective data from API
   * Integrates with correctivos_generales table and related equipment/user data
   */
  const loadCorrectiveData = useCallback(
    async (
      page = 1,
      perPage = itemsPerPage,
      search = searchTerm,
      status = statusFilter,
      filters = {}
    ) => {
      setLoading(true);
      try {
        const params = {
          page: page,
          per_page: perPage,
          search: search || undefined,
          status: status !== "all" ? status : undefined,
          sort_by: sortConfig.key,
          sort_direction: sortConfig.direction,
        };

        // Add date filters
        if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
        if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;

        const response = await httpService.get("/v1/correctivos-generales", {
          params
        });

        // Extract correctivos and pagination from the nested structure
        let dataToSet = [];
        let paginationInfo = null;

        if (response.data && response.data.data) {
          if (response.data.data.correctivos) {
            dataToSet = response.data.data.correctivos;
            paginationInfo = response.data.data.pagination;
          } else if (Array.isArray(response.data.data)) {
            dataToSet = response.data.data;
          }
        } else if (response.data && response.data.correctivos) {
          dataToSet = response.data.correctivos;
          paginationInfo = response.data.pagination;
        } else if (response.data && Array.isArray(response.data)) {
          dataToSet = response.data;
        }

        // Set data and pagination info
        setCorrectiveData(Array.isArray(dataToSet) ? dataToSet : []);

        if (paginationInfo) {
          setTotalItems(paginationInfo.total || 0);
          setTotalPages(paginationInfo.last_page || 1);
          setCurrentPage(paginationInfo.current_page || 1);
        }

        // Success feedback
        toast.success("Correctivos cargados exitosamente");
      } catch (error) {
        console.error("❌ [CORRECTIVE] Error loading corrective data:", error);
        toast.error("Error al cargar los correctivos");

        // Fallback sample data for development/demo
        const sampleData = getSampleCorrectiveData();
        setCorrectiveData(Array.isArray(sampleData) ? sampleData : []);
        setTotalItems(sampleData.length);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, sortConfig]
  );

  // Handle date from filter change
  const handleDateFromFilter = (value) => {
    setDateFromFilter(value);
    applyFilters(value, dateToFilter);
  };

  // Handle date to filter change
  const handleDateToFilter = (value) => {
    setDateToFilter(value);
    applyFilters(dateFromFilter, value);
  };

  // Apply filters with date logic
  const applyFilters = (dateFrom = dateFromFilter, dateTo = dateToFilter) => {
    const filters = {};
    
    // Handle date range filters
    if (dateFrom) {
      filters.fecha_desde = dateFrom;
    }
    if (dateTo) {
      filters.fecha_hasta = dateTo;
    }
    
    // Reload data with filters
    loadCorrectiveData(1, itemsPerPage, searchTerm, statusFilter, filters);
    setCurrentPage(1);
  };

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadCorrectiveData(1, itemsPerPage, searchTerm, statusFilter);
    }
  }, [open, loadCorrectiveData]);

  // Reload data when search term or status filter changes
  useEffect(() => {
    if (open) {
      setCurrentPage(1); // Reset to first page
      loadCorrectiveData(1, itemsPerPage, searchTerm, statusFilter);
    }
  }, [searchTerm, statusFilter, open, loadCorrectiveData]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadCorrectiveData(newPage, itemsPerPage, searchTerm, statusFilter);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    loadCorrectiveData(1, newItemsPerPage, searchTerm, statusFilter);
  };

  /**
   * Sample corrective data structure matching Excel format
   * Based on CorrectivosEB.xls structure with all required fields
   */
  const getSampleCorrectiveData = () => [
    {
      id: 1,
      fuente: "Correctivos generales",
      responsable_mantenimiento: "Juan Pérez",
      equipo_id: 9774,
      fecha_creacion: "2024-06-18",
      codigo_orden: "COR0001",
      descripcion_orden: "Revisión general del equipo de ultrasonido",
      codificacion_cierre: "Sin Info de orden de trabajo",
      equipo: "Equipo de ultrasonido",
      codigo_equipo: "EMCO6582",
      marca: "RICHMAR",
      modelo: "Soundcareplus",
      serie: "SZ9240300187",
      estado_actual: "Activo",
      sede: "CARTAGO",
      servicio: "MEDICINA FISICA Y REHABILITACIÓN CARTAGO",
      area: "",
      archivo: "",
      fecha_avance: "",
      titulo_avance1: "",
      descripcion_avance: "",
      fecha_avance2: "",
      titulo_avance2: "",
      descripcion_avance2: "",
      fecha_avance3: "",
      titulo_avance3: "",
      descripcion_avance3: "",
      retro_cierre: "",
      descripcion_cierre: "",
      fecha_cierre: "",
      costo_equipo: 0,
      fecha_fin: "",
      repuesto_instalado: "",
      created_at: "2024-06-18 10:30:00",
      updated_at: "2024-06-18 10:30:00",
    },
    {
      id: 2,
      fuente: "Correctivos generales",
      responsable_mantenimiento: "María García",
      equipo_id: 9776,
      fecha_creacion: "2024-06-17",
      codigo_orden: "COR0002",
      descripcion_orden: "Calibración de termohigrómetro",
      codificacion_cierre: "Completado",
      equipo: "TERMOHIGROMETRO SIN SONDA",
      codigo_equipo: "THC-020",
      marca: "KTJ",
      modelo: "TA218D",
      serie: "",
      estado_actual: "Activo",
      sede: "CARTAGO",
      servicio: "CENTRAL DE ESTERILIZACIÓN CARTAGO",
      area: "",
      archivo: "",
      fecha_avance: "2024-06-17",
      titulo_avance1: "Inicio calibración",
      descripcion_avance: "Se inicia el proceso de calibración del equipo",
      fecha_avance2: "",
      titulo_avance2: "",
      descripcion_avance2: "",
      fecha_avance3: "",
      titulo_avance3: "",
      descripcion_avance3: "",
      retro_cierre: "Calibración exitosa",
      descripcion_cierre: "Equipo calibrado según especificaciones técnicas",
      fecha_cierre: "2024-06-17",
      costo_equipo: 0,
      fecha_fin: "2024-06-17",
      repuesto_instalado: "",
      created_at: "2024-06-17 09:15:00",
      updated_at: "2024-06-17 16:45:00",
    },
    {
      id: 3,
      fuente: "Correctivos generales",
      responsable_mantenimiento: "Carlos López",
      equipo_id: 9778,
      fecha_creacion: "2024-06-16",
      codigo_orden: "COR0003",
      descripcion_orden: "Mantenimiento preventivo flujómetro",
      codificacion_cierre: "En proceso",
      equipo: "FLUJÓMETRO",
      codigo_equipo: "FLUC-0086",
      marca: "AIR IMETAN",
      modelo: "FM0115",
      serie: "F10241",
      estado_actual: "Activo",
      sede: "CARTAGO",
      servicio: "URGENCIAS CARTAGO",
      area: "",
      archivo: "",
      fecha_avance: "2024-06-16",
      titulo_avance1: "Diagnóstico inicial",
      descripcion_avance: "Revisión del estado general del flujómetro",
      fecha_avance2: "2024-06-17",
      titulo_avance2: "Limpieza y ajustes",
      descripcion_avance2: "Limpieza interna y ajuste de válvulas",
      fecha_avance3: "",
      titulo_avance3: "",
      descripcion_avance3: "",
      retro_cierre: "",
      descripcion_cierre: "",
      fecha_cierre: "",
      costo_equipo: 0,
      fecha_fin: "",
      repuesto_instalado: "Válvula de control",
      created_at: "2024-06-16 14:20:00",
      updated_at: "2024-06-17 11:30:00",
    },
  ];

  /**
   * Advanced filtering and search functionality
   * Searches across all relevant fields including equipment and user data
   */
  const filteredAndSortedData = useMemo(() => {
    // Defensive check to ensure correctiveData is always an array
    let filtered = Array.isArray(correctiveData) ? correctiveData : [];

    // Global search across all fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filtering
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        switch (statusFilter) {
          case "active":
            return item.estado_actual === "Activo";
          case "completed":
            return item.fecha_cierre;
          case "in_progress":
            return !item.fecha_cierre && item.fecha_avance;
          case "pending":
            return !item.fecha_avance;
          default:
            return true;
        }
      });
    }

    // Sorting - now we're sure filtered is an array
    if (sortConfig.key && Array.isArray(filtered)) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (sortConfig.direction === "asc") {
          return aValue.toString().localeCompare(bValue.toString());
        } else {
          return bValue.toString().localeCompare(aValue.toString());
        }
      });
    }

    return filtered;
  }, [correctiveData, searchTerm, statusFilter, sortConfig]);

  /**
   * Los datos ya vienen paginados del backend, no necesitamos paginación local
   */
  const displayData = useMemo(() => {
    return Array.isArray(correctiveData) ? correctiveData : [];
  }, [correctiveData]);

  /**
   * Export functionality - TODOS los correctivos (sin filtros)
   */
  const handleExportAll = async (formatOrEvent = "excel") => {
    const toastId = 'export-all-correctivos';
    try {
      setLoading(true);

      // Si el primer parámetro es un evento (objeto), usar formato por defecto
      const format = typeof formatOrEvent === 'string' ? formatOrEvent : 'excel';

      toast.loading('Exportando todos los correctivos...', { id: toastId });

      // Llamada directa al endpoint para exportar TODOS los datos reales
      const response = await httpService.get(
        `/v1/correctivos-generales/export-${format}`,
        {
          responseType: "blob",
          timeout: 300000, // 5 minutos para exportaciones masivas
          headers: {
            Accept:
              format === "excel"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv",
          },
        }
      );

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `correctivos_TODOS_${
        new Date().toISOString().split("T")[0]
      }.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Todos los correctivos exportados exitosamente', { id: toastId });
    } catch (error) {
      console.error("❌ [EXPORT] Error exportando todos:", error);
      toast.error("Error al exportar todos los correctivos", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export functionality - Parada de Equipo Biomédico
   */
  const handleExportParadaEquipo = async () => {
    const equipmentTypeName = equipmentType === 'biomedico' ? 'Biomédico' : 'Industrial';
    const toastId = 'export-parada-equipo';
    
    try {
      setLoading(true);
      toast.loading(`Exportando Parada de Equipo ${equipmentTypeName}...`, { id: toastId });

      // Llamada al endpoint con parámetros formato=parada y tipo según equipmentType
      const response = await httpService.get(
        `/v1/correctivos-generales/export-excel?formato=parada&tipo=${equipmentType}`,
        {
          responseType: "blob",
          timeout: 300000, // 5 minutos para exportaciones grandes (Parada de Equipo)
          headers: {
            Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `Parada_Equipo_${equipmentTypeName}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`Parada de Equipo ${equipmentTypeName} exportada exitosamente`, { id: toastId });
    } catch (error) {
      console.error("❌ [EXPORT] Error exportando parada de equipo:", error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error("La exportación está tardando demasiado. Intenta más tarde.", { id: toastId });
      } else {
        toast.error("Error al exportar Parada de Equipo", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export functionality - SOLO correctivos filtrados/visibles
   */
  const handleExportFiltered = async (format = "excel") => {
    const toastId = 'export-filtered-correctivos';
    try {
      setLoading(true);
      toast.loading('Exportando correctivos filtrados...', { id: toastId });

      // Enviar solo los IDs para que el backend consulte los datos reales
      const exportData = displayData.map((item) => ({
        id: item.id,
      }));

      const response = await httpService.post(
        "/v1/correctivos-generales/export-custom",
        {
          data: exportData,
          format: format,
          filename: `correctivos_FILTRADOS_${
            new Date().toISOString().split("T")[0]
          }`,
        },
        {
          responseType: "blob",
          timeout: 300000,
          headers: {
            Accept:
              format === "excel"
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv",
          },
        }
      );

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `correctivos_FILTRADOS_${
        new Date().toISOString().split("T")[0]
      }.${format === "excel" ? "xlsx" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${exportData.length} correctivos filtrados exportados exitosamente`, { id: toastId });
    } catch (error) {
      console.error("❌ [EXPORT] Error exportando filtrados:", error);
      toast.error("Error al exportar correctivos filtrados", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sorting handler
   */
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (item) => {
    if (item.fecha_cierre) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Completado
        </Badge>
      );
    }
    if (item.fecha_avance) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          En Proceso
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        Pendiente
      </Badge>
    );
  };

  /**
   * Get priority badge based on equipment status and date
   */
  const getPriorityBadge = (item) => {
    const daysOld = Math.floor(
      (new Date() - new Date(item.fecha_creacion)) / (1000 * 60 * 60 * 24)
    );

    if (daysOld > 7 && !item.fecha_cierre) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">Alta</Badge>
      );
    }
    if (daysOld > 3 && !item.fecha_cierre) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          Media
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        Normal
      </Badge>
    );
  };

  /**
   * Load data on component mount
   */
  useEffect(() => {
    if (open) {
      loadCorrectiveData();
    }
  }, [open, loadCorrectiveData]);

  /**
   * Handle document viewing
   */
  const handleViewDocument = (fileName) => {
    if (!fileName) return;

    // Construct the URL for the document in Laravel storage
    // Use only the filename to avoid duplicate folder segments in the URL
    const documentUrl = `${import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001"}/storage/correctivos_generales/${fileName.split('/').pop()}`;

    // Open document in new window with print functionality
    const newWindow = window.open(documentUrl, "_blank");

    // Add print functionality when document loads
    newWindow.addEventListener("load", () => {
      // Auto-trigger print dialog after a short delay to ensure document is loaded
      setTimeout(() => {
        newWindow.print();
      }, 1000);
    });
  };

  // Render different views based on mode
  if (viewMode === "view" && selectedCorrective) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div className="corrective-modal-detail">
          <DialogContent
            className="!max-w-none w-[90vw] max-h-[95vh] overflow-y-auto"
            style={{ maxWidth: "90vw !important", width: "90vw !important" }}
          >
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Detalle del Correctivo
                </DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Volver
                </Button>
              </div>
              <Separator />
            </DialogHeader>

            <div className="space-y-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">
                      Información General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">
                        Código de Orden:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.codigo_orden}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Descripción:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.descripcion_orden}
                      </p>
                      {selectedCorrective.archivo && (
                        <div className="mt-3">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-blue-600 font-bold"
                            onClick={() => handleViewDocument(selectedCorrective.archivo)}
                          >
                            🔗 VER ARCHIVO DE DIAGNÓSTICO
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Responsable:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.responsable_mantenimiento}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Estado:</span>
                      <div className="mt-1">
                        {getStatusBadge(selectedCorrective)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">
                      Información del Equipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Equipo:</span>
                      <p className="text-gray-900">
                        {selectedCorrective.equipo}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Código:</span>
                      <p className="text-gray-900">
                        {selectedCorrective.codigo_equipo}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Marca/Modelo:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.marca} - {selectedCorrective.modelo}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Serie:</span>
                      <p className="text-gray-900">
                        {selectedCorrective.serie}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600">
                    Ubicación y Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-gray-600">Sede:</span>
                    <p className="text-gray-900">{selectedCorrective.sede}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Servicio:</span>
                    <p className="text-gray-900">
                      {selectedCorrective.servicio}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Área:</span>
                    <p className="text-gray-900">
                      {selectedCorrective.area || "No especificada"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {selectedCorrective.archivo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                      📄 Documento Adjunto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          📄
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedCorrective.archivo}
                          </p>
                          <p className="text-sm text-gray-500">
                            Documento del correctivo
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleViewDocument(selectedCorrective.archivo)
                        }
                        className="flex items-center gap-2"
                      >
                        👁️ Ver e Imprimir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedCorrective.avances && selectedCorrective.avances.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">
                      Avances del Trabajo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCorrective.avances.map((avance, idx) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {avance.titulo}
                          </span>
                          <span className="text-sm text-gray-500">
                            {avance.fecha}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {avance.descripcion}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedCorrective.fecha_cierre && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Cierre del Trabajo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">
                        Fecha de Cierre:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.fecha_cierre}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Retroalimentación:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.retro_cierre}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Descripción del Cierre:
                      </span>
                      <p className="text-gray-900">
                        {selectedCorrective.descripcion_cierre}
                      </p>
                    </div>
                    {selectedCorrective.repuesto_instalado && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Repuestos Instalados:
                        </span>
                        <p className="text-gray-900">
                          {selectedCorrective.repuesto_instalado}
                        </p>
                      </div>
                    )}
                    {selectedCorrective.costo_equipo > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">
                          Costo:
                        </span>
                        <p className="text-gray-900">
                          ${selectedCorrective.costo_equipo.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sección de Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-purple-600 flex items-center gap-2">
                    📄 Documentos Adjuntos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCorrective.archivo ? (
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          📄
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedCorrective.archivo}
                          </p>
                          <p className="text-sm text-gray-500">
                            Documento del correctivo
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleViewDocument(selectedCorrective.archivo)
                        }
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        👀 Ver e Imprimir
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        📄
                      </div>
                      <p>No hay documentos adjuntos para este correctivo</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end p-4 border-t gap-2">
              <Button variant="outline" onClick={() => setViewMode("list")}>
                Volver a la Lista
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </div>
      </Dialog>
    );
  }

  // Main list view
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="corrective-modal-wide">
        <DialogContent
          className="!max-w-none w-[95vw] max-h-[95vh] overflow-hidden flex flex-col"
          style={{ maxWidth: "95vw !important", width: "95vw !important" }}
        >
          <DialogHeader className="space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-blue-700 flex items-center gap-2">
                🔧 Correctivos Generales
              </DialogTitle>
              <div className="flex items-center gap-2">
                {/* Botón para exportar TODOS los correctivos */}
                <Button
                  onClick={handleExportAll}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                  title="Exportar todos los correctivos"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  📊 Exportar TODOS
                </Button>

                {/* Botón para exportar solo FILTRADOS */}
                <Button
                  onClick={() => handleExportFiltered("excel")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled={loading || displayData.length === 0}
                  title={`Exportar solo los ${displayData.length} correctivos filtrados/visibles`}
                >
                  <Download className="h-4 w-4" />
                  🔍 Exportar Filtrados ({displayData.length})
                </Button>

                {/* Botón de actualizar */}
                <Button
                  onClick={() =>
                    loadCorrectiveData(
                      currentPage,
                      itemsPerPage,
                      searchTerm,
                      statusFilter
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </Button>
              </div>
            </div>
            <Separator />
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-6 p-8">
            {/* Search and Filters */}
            <Card className="flex-shrink-0">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar en todos los campos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="completed">Completados</SelectItem>
                        <SelectItem value="in_progress">En Proceso</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      placeholder="Fecha desde"
                      value={dateFromFilter}
                      onChange={(e) => handleDateFromFilter(e.target.value)}
                      className="w-36"
                      title="Filtrar desde fecha específica"
                    />
                    <Input
                      type="date"
                      placeholder="Fecha hasta"
                      value={dateToFilter}
                      onChange={(e) => handleDateToFilter(e.target.value)}
                      className="w-36"
                      title="Filtrar hasta fecha específica"
                    />
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) =>
                        handleItemsPerPageChange(Number(value))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} de{" "}
                  {totalItems} entradas
                  {searchTerm || statusFilter !== "all" ? (
                    <span className="text-blue-600"> (filtrado)</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-0 h-full overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Cargando correctivos...</span>
                    </div>
                  </div>
                ) : displayData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">
                      No se encontraron correctivos
                    </p>
                    <p className="text-sm">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-auto">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                            <button
                              onClick={() => handleSort("fecha_creacion")}
                              className="flex items-center gap-1 hover:text-gray-900"
                            >
                              F. Creación
                              {sortConfig.key === "fecha_creacion" &&
                                (sortConfig.direction === "asc" ? (
                                  <SortAsc className="h-3 w-3" />
                                ) : (
                                  <SortDesc className="h-3 w-3" />
                                ))}
                            </button>
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[110px]">
                            <button
                              onClick={() => handleSort("codigo_orden")}
                              className="flex items-center gap-1 hover:text-gray-900"
                            >
                              Cód. Orden
                              {sortConfig.key === "codigo_orden" &&
                                (sortConfig.direction === "asc" ? (
                                  <SortAsc className="h-3 w-3" />
                                ) : (
                                  <SortDesc className="h-3 w-3" />
                                ))}
                            </button>
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                            Descripción
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[130px]">
                            Cód. Cierre
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                            Equipo
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                            Cód. Equipo
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Marca
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Modelo
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Serie
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                            Ubicación
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[90px]">
                            Archivo
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cód. Retro
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                            Desc. Cierre
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Fecha Cierre
                          </th>
                          <th className="border border-gray-200 px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayData.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-900 whitespace-nowrap">
                              {item.fecha_creacion}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs">
                              <div className="font-semibold text-blue-600">
                                {item.codigo_orden}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-700">
                              <div className="line-clamp-2" title={item.descripcion_orden}>
                                {item.descripcion_orden}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-700">
                              {item.codificacion_cierre}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs font-medium text-gray-900">
                              {item.equipo}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-600">
                              {item.codigo_equipo}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-900 font-medium">
                              {item.marca}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-700">
                              {item.modelo}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-600">
                              {item.serie}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs">
                              <div className="font-medium text-gray-900">{item.servicio}</div>
                              <div className="text-[10px] text-gray-500">{item.sede}</div>
                              {item.area && (
                                <div className="text-[10px] text-blue-500 italic">Área: {item.area}</div>
                              )}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-center">
                              {item.archivo ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewDocument(item.archivo)}
                                  className="h-7 px-2 text-blue-600 hover:bg-blue-50"
                                >
                                  🔗 PDF
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-[10px]">Sin doc</span>
                              )}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-blue-600 font-semibold">
                              {item.cierre_code || "---"}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-700">
                              <div className="line-clamp-1" title={item.cierre_name}>
                                {item.cierre_name || "---"}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                              {item.fecha_cierre || "Pendiente"}
                            </td>
                            <td className="border border-gray-200 px-3 py-3 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCorrective(item);
                                  setViewMode("view");
                                }}
                                className="h-8 w-8 p-0 border-blue-200 text-blue-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showInfo={true}
            />
          </div>

          <div className="flex justify-end p-8 border-t gap-4 flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}

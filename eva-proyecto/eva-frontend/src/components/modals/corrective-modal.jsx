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
export function CorrectiveModal({ open, onOpenChange }) {
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
        console.log("🔄 [CORRECTIVE] Cargando datos de correctivos...", {
          page,
          perPage,
          search,
          status,
          filters
        });

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

        console.log("✅ [CORRECTIVE] Datos cargados:", response.data);

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

        console.log(
          "🔍 [CORRECTIVE] Datos extraídos para mostrar:",
          dataToSet,
          "Total:",
          dataToSet.length,
          "Paginación:",
          paginationInfo
        );

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

    console.log(
      "🔍 [CORRECTIVE] Datos originales:",
      correctiveData,
      "Total:",
      filtered.length
    );

    // Global search across all fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (value) =>
            value && value.toString().toLowerCase().includes(searchLower)
        )
      );
      console.log("🔍 [CORRECTIVE] Después de búsqueda:", filtered.length);
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
      console.log(
        "🔍 [CORRECTIVE] Después de filtro de estado:",
        filtered.length
      );
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

    console.log("🔍 [CORRECTIVE] Datos finales filtrados:", filtered.length);
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
  const handleExportAll = async (format = "excel") => {
    try {
      setLoading(true);

      console.log("🔄 [EXPORT] Exportando TODOS los correctivos...");

      // Llamada directa al endpoint para exportar TODOS los datos reales
      const response = await httpService.get(
        `/v1/correctivos-generales/export-${format}`,
        {
          responseType: "blob",
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

      console.log("✅ [EXPORT] Exportación de TODOS completada");
      toast.success(
        `Exportación COMPLETA ${format.toUpperCase()} - Todos los correctivos descargados exitosamente`
      );
    } catch (error) {
      console.error("❌ [EXPORT] Error exportando todos:", error);
      toast.error("Error durante la exportación de todos los correctivos");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export functionality - SOLO correctivos filtrados/visibles
   */
  const handleExportFiltered = async (format = "excel") => {
    try {
      setLoading(true);

      console.log(
        "🔄 [EXPORT] Exportando correctivos FILTRADOS...",
        "Total filtrados:",
        displayData.length
      );

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

      console.log("✅ [EXPORT] Exportación de FILTRADOS completada");
      toast.success(
        `Exportación FILTRADA ${format.toUpperCase()} - ${
          exportData.length
        } correctivos descargados exitosamente`
      );
    } catch (error) {
      console.error("❌ [EXPORT] Error exportando filtrados:", error);
      toast.error("Error durante la exportación de correctivos filtrados");
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
    const documentUrl = `/storage/correctivos/${fileName}`;

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

              {(selectedCorrective.fecha_avance ||
                selectedCorrective.fecha_avance2 ||
                selectedCorrective.fecha_avance3) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">
                      Avances del Trabajo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCorrective.fecha_avance && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {selectedCorrective.titulo_avance1}
                          </span>
                          <span className="text-sm text-gray-500">
                            {selectedCorrective.fecha_avance}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {selectedCorrective.descripcion_avance}
                        </p>
                      </div>
                    )}
                    {selectedCorrective.fecha_avance2 && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {selectedCorrective.titulo_avance2}
                          </span>
                          <span className="text-sm text-gray-500">
                            {selectedCorrective.fecha_avance2}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {selectedCorrective.descripcion_avance2}
                        </p>
                      </div>
                    )}
                    {selectedCorrective.fecha_avance3 && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {selectedCorrective.titulo_avance3}
                          </span>
                          <span className="text-sm text-gray-500">
                            {selectedCorrective.fecha_avance3}
                          </span>
                        </div>
                        <p className="text-gray-700">
                          {selectedCorrective.descripcion_avance3}
                        </p>
                      </div>
                    )}
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
                  onClick={() => handleExportAll("excel")}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                  title="Exportar TODOS los correctivos reales de la base de datos"
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
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort("fecha_creacion")}
                              className="flex items-center gap-1 hover:text-gray-700"
                            >
                              Fecha
                              {sortConfig.key === "fecha_creacion" &&
                                (sortConfig.direction === "asc" ? (
                                  <SortAsc className="h-3 w-3" />
                                ) : (
                                  <SortDesc className="h-3 w-3" />
                                ))}
                            </button>
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <button
                              onClick={() => handleSort("codigo_orden")}
                              className="flex items-center gap-1 hover:text-gray-700"
                            >
                              Código
                              {sortConfig.key === "codigo_orden" &&
                                (sortConfig.direction === "asc" ? (
                                  <SortAsc className="h-3 w-3" />
                                ) : (
                                  <SortDesc className="h-3 w-3" />
                                ))}
                            </button>
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Equipo
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marca/Modelo
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prioridad
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sede
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responsable
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documentos
                          </th>
                          <th className="border border-gray-200 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                              {item.fecha_creacion}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <div className="font-medium text-blue-600">
                                {item.codigo_orden}
                              </div>
                              <div
                                className="text-xs text-gray-500 truncate max-w-48"
                                title={item.descripcion_orden}
                              >
                                {item.descripcion_orden}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">
                                {item.equipo}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.codigo_equipo}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              <div>{item.marca}</div>
                              <div className="text-xs text-gray-500">
                                {item.modelo}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              {getStatusBadge(item)}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              {getPriorityBadge(item)}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <div className="text-gray-900">{item.sede}</div>
                              <div
                                className="text-xs text-gray-500 truncate max-w-40"
                                title={item.servicio}
                              >
                                {item.servicio}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                              {item.responsable_mantenimiento || "No asignado"}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-center">
                              {item.archivo ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleViewDocument(item.archivo)
                                  }
                                  className="h-8 px-3 text-xs"
                                  title="Ver documento"
                                >
                                  📄 Ver
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  Sin documento
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCorrective(item);
                                    setViewMode("view");
                                  }}
                                  className="h-8 w-8 p-0"
                                  title="Ver detalles"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="flex-shrink-0">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {/* Page numbers with enhanced styling */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + i;
                          if (page <= totalPages) {
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={
                                  currentPage === page
                                    ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold border-blue-600 shadow-md"
                                    : "hover:bg-blue-50 hover:border-blue-300"
                                }
                              >
                                {page}
                              </Button>
                            );
                          }
                          return null;
                        }
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

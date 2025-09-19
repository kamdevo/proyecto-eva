import { useState } from "react";
import { useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Paperclip,
  FileText,
  Trash2,
  Filter,
  Plus,
  Merge,
  FileSpreadsheet,
  Files,
  Link,
  X,
} from "lucide-react";
import { useEquipment } from "@/hooks/useEquipment";
import { useAuth } from "@/hooks/useAuth.jsx";
import PermissionWrapper from "./PermissionWrapper";
import { MainActionButtons } from "./equipment/MainActionButtons";
import { StatsActionButtons } from "./equipment/StatsActionButtons";
import { EquipmentPagination } from "./equipment/EquipmentPagination";
import { RowActionButtons } from "./equipment/RowActionButtons";
import { useEquipmentSearch } from "@/contexts/EquipmentSearchContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import httpService from "@/services/httpService";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterModal } from "@/components/modals/filter-modal";
import { AddEquipmentModal } from "@/components/modals/add-equipment-modal";
import { CleanNamesModal } from "@/components/modals/clean-names-modal";
import { MergeModal } from "@/components/modals/merge-modal";
import PreventiveModal from "@/components/modals/preventive-modal";
import { CalibrationModal } from "@/components/modals/calibration-modal";
import { CorrectiveModal } from "@/components/modals/corrective-modal";
import { MonthModal } from "@/components/modals/month-modal";
import { DocumentListModal } from "@/components/modals/document-list-modal";
import { DocumentUploadModal } from "@/components/modals/document-upload-modal";
import { EditEquipmentModal } from "@/components/modals/edit-equipment-modal";
import { ViewEquipmentModal } from "@/components/modals/view-equipment-modal";
import CopyEquipmentModal from "@/components/modals/copy-equipment-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import AddObservacionModal from "@/components/modals/add-observacion-modal";
import DarBajaEquipoModal from "@/components/modals/dar-baja-equipo-modal";
import notFoundImg from "../assets/Img/imagenes/not-found.jpg";
import EquipmentImage from "./ui/equipment-image";
import { EquipmentImageHover } from "./ui/equipment-image-hover";
import { EquipmentIdBadge } from "./ui/equipment-id-badge";

// Helper function to safely render nested object properties
const safeRenderText = (value, fallback = "Sin información") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    // If it's an object with a nombre property, use that
    if (value.nombre) return value.nombre;
    // Otherwise return fallback to avoid rendering object
    return fallback;
  }
  return String(value);
};

export function MedicalDevicesView() {
  // Hook para manejar los datos de equipos médicos
  const {
    devices,
    loading,
    error,
    hasError,
    isEmpty,
    pagination,
    currentPage,
    totalPages,
    totalItems,
    showingFrom,
    showingTo,
    stats,
    filters,
    updateFilters,
    changePage,
    changePageSize,
    search,
    clearFilters,
    refresh,
  } = useEquipment("biomedical");

  // Global search context
  const { registerSearchCallback, setResultCount } = useEquipmentSearch();

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cleanNamesModalOpen, setCleanNamesModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [preventiveModalOpen, setPreventiveModalOpen] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [correctiveModalOpen, setCorrectiveModalOpen] = useState(false);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [documentListModalOpen, setDocumentListModalOpen] = useState(false);
  const [documentUploadModalOpen, setDocumentUploadModalOpen] = useState(false);
  const [editEquipmentModalOpen, setEditEquipmentModalOpen] = useState(false);
  const [viewEquipmentModalOpen, setViewEquipmentModalOpen] = useState(false);
  const [copyEquipmentModalOpen, setCopyEquipmentModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [addObservacionModalOpen, setAddObservacionModalOpen] = useState(false);
  const [darBajaEquipoModalOpen, setDarBajaEquipoModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentId, setEquipmentId] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Handlers
  const handlePageSizeChange = (newSize) => {
    changePageSize(parseInt(newSize));
  };

  // Handle export equipment counts
  const handleExportEquipmentCounts = async () => {
    try {
      const response = await httpService.get('/v1/export/equipment-counts', {
        responseType: 'blob',
        params: { type: 'biomedical' }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'CantidadesEquiposBiomedicos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting equipment counts:', err);
      // You could add a toast notification here
    }
  };

  // Handle opening maintenance documents - PREVENTIVO
  const handleOpenMaintenanceDocument = async (equipmentId) => {
    try {
      console.log('🔍 Buscando último mantenimiento PREVENTIVO para equipo ID:', equipmentId);
      
      // Casos específicos conocidos con archivos preventivos
      const equiposConocidos = {
        5119: 'SK00602904-PM.pdf', // BOMBA DE INFUSION
        // Agregar más equipos según se encuentren
      };
      
      if (equiposConocidos[equipmentId]) {
        console.log('🎯 Equipo conocido con archivo preventivo, abriendo directamente...');
        const knownFile = equiposConocidos[equipmentId];
        const fileUrl = `http://127.0.0.1:8001/storage/mantenimientos/${knownFile}`;
        console.log('🌐 Opening URL:', fileUrl);
        window.open(fileUrl, "_blank");
        return;
      }
      
      // Obtener token de autenticación si está disponible
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch maintenance data for the equipment - solo PREVENTIVOS
      const response = await fetch(
        `http://127.0.0.1:8001/api/v1/mantenimiento?equipo_id=${equipmentId}&tipo=preventivo&per_page=1&order_by=fecha_mantenimiento&order_direction=desc`,
        { headers }
      );

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.status === 401) {
        console.warn('🔒 No autorizado - intentando sin autenticación...');
        // Intentar con endpoint público si existe - solo PREVENTIVOS
        const publicResponse = await fetch(
          `http://127.0.0.1:8001/api/mantenimiento?equipo_id=${equipmentId}&tipo=preventivo&per_page=1`
        );
        
        if (!publicResponse.ok) {
          throw new Error('No se pudo acceder a los datos de mantenimiento. Verifique su sesión.');
        }
        
        const publicData = await publicResponse.json();
        console.log('📊 Public data received:', publicData);
        
        // Procesar respuesta pública...
        if (publicData && publicData.length > 0) {
          const maintenance = publicData[0];
          if (maintenance.file) {
            const fileUrl = `http://127.0.0.1:8001/storage/mantenimientos/${maintenance.file}`;
            window.open(fileUrl, "_blank");
            return;
          }
        }
        
        throw new Error('No se encontraron registros de mantenimiento');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Data received:', data);

      // Verificar diferentes estructuras de respuesta
      let maintenanceData = null;
      
      if (data.success && data.data) {
        if (Array.isArray(data.data.data)) {
          // Estructura paginada: data.data.data
          maintenanceData = data.data.data;
        } else if (Array.isArray(data.data)) {
          // Estructura simple: data.data
          maintenanceData = data.data;
        }
      } else if (Array.isArray(data)) {
        // Respuesta directa como array
        maintenanceData = data;
      }

      console.log('🔧 Maintenance data:', maintenanceData);

      if (maintenanceData && maintenanceData.length > 0) {
        const maintenance = maintenanceData[0];
        console.log('📄 Latest maintenance:', maintenance);

        if (maintenance.file) {
          // Construct the file URL - archivos preventivos están en mantenimientos
          const possibleUrls = [
            `http://127.0.0.1:8001/storage/mantenimientos/${maintenance.file}`,
            `http://127.0.0.1:8001/storage/correctivos_asociados/${maintenance.file}`,
            `http://127.0.0.1:8001/storage/correctivos_generales/${maintenance.file}`
          ];

          console.log('🌐 Trying URLs:', possibleUrls);
          
          // Intentar abrir la primera URL (mantenimientos preventivos)
          window.open(possibleUrls[0], "_blank");
          
        } else {
          console.warn('⚠️ No file found in preventive maintenance record');
          alert(
            "No hay documento de mantenimiento preventivo disponible para este equipo"
          );
        }
      } else {
        console.warn('⚠️ No preventive maintenance records found');
        alert("No se encontraron registros de mantenimiento preventivo para este equipo");
      }
    } catch (error) {
      console.error("❌ Error al abrir documento de mantenimiento preventivo:", error);
      alert(`Error al acceder al documento de mantenimiento preventivo: ${error.message}`);
    }
  };

  // Register search callback for global search
  useEffect(() => {
    registerSearchCallback((searchTerm) => {
      search(searchTerm);
    });
  }, [registerSearchCallback, search]);

  // Update result count when devices change
  useEffect(() => {
    setResultCount(devices.length);
  }, [devices, setResultCount]);

  // Sync local states with filters from hook
  useEffect(() => {
    setEquipmentId(filters.consulta_id || "");
    setDateFilter(filters.anio_plan || "");
  }, [filters]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.search && filters.search.trim()) count++;
    if (equipmentId.trim()) count++;
    if (dateFilter) count++;

    setActiveFiltersCount(count);
  }, [filters.search, equipmentId, dateFilter]);

  // Debug filters changes
  useEffect(() => {
    console.log("🔄 Filters changed:", filters);
    console.log("📊 Current devices count:", devices.length);
  }, [filters, devices]);

  // Estados para filtros avanzados
  const [appliedFilters, setAppliedFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Función para aplicar filtros desde el modal
  const handleFiltersApply = (newFilters) => {
    setAppliedFilters(newFilters);
    setActiveFiltersCount(Object.keys(newFilters).length);

    // Actualizar filtros en el hook
    updateFilters({
      ...filters,
      ...newFilters,
      page: 1, // Resetear a primera página
    });
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setAppliedFilters({});
    setActiveFiltersCount(0);
    clearFilters();
  };

  // Función para manejar la eliminación exitosa de un equipo
  const handleEquipmentDeleted = (equipmentId) => {
    console.log("🔄 Equipo eliminado, refrescando lista:", equipmentId);
    // Refrescar la lista de equipos después de eliminar
    refresh();
    // Limpiar el equipo seleccionado
    setSelectedEquipment(null);
  };

  // Use backend search instead of local filtering
  const filteredDevices = devices && devices.length > 0 ? devices : [];

  // Handle search with backend (removed duplicate)

  // Handle Equipment ID search
  const handleEquipmentIdSearch = () => {
    const trimmedId = equipmentId.trim();

    // Validación mejorada
    if (trimmedId) {
      // Verificar que sea solo números
      if (!/^\d+$/.test(trimmedId)) {
        alert("Por favor ingrese un ID válido (solo números enteros)");
        return;
      }

      // Verificar que sea un número positivo
      const numericId = parseInt(trimmedId, 10);
      if (numericId <= 0) {
        alert("Por favor ingrese un ID válido (número mayor a 0)");
        return;
      }
    }

    console.log("🔍 Frontend: Searching for equipment ID:", trimmedId);

    if (trimmedId) {
      // Limpiar otros filtros cuando se busca por ID específico
      updateFilters({
        consulta_id: trimmedId,
        search: "", // Limpiar búsqueda general
        page: 1, // Resetear a primera página
      });
      console.log("✅ Frontend: Filter updated with consulta_id:", trimmedId);
    } else {
      updateFilters({ consulta_id: "" });
      console.log("🧹 Frontend: Cleared consulta_id filter");
    }
  };

  const handleDateChange = (value) => {
    setDateFilter(value);
    updateFilters({ anio_plan: value });
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setEquipmentId("");
    setDateFilter("");
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-1 xs:p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
      {/* Medical Equipment Management Header */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
          Sistema de Gestión de Equipos Médicos
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm md:text-base">
          Control y seguimiento integral de equipamiento biomédico hospitalario
        </p>
      </div>

      {/* Action Buttons - Ultra Compact Side by Side */}
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
        {/* Main Action Buttons */}
        <PermissionWrapper module="equipos" action="leer">
          <MainActionButtons
            onFilterClick={() => setFilterModalOpen(true)}
            onAddClick={() => setAddModalOpen(true)}
            onCleanNamesClick={() => setCleanNamesModalOpen(true)}
            onExportClick={handleExportEquipmentCounts}
            onClearFiltersClick={handleClearAllFilters}
            activeFiltersCount={activeFiltersCount}
            showClearFilters={true}
            equipmentType="biomedical"
          />
        </PermissionWrapper>

        {/* Stats Buttons */}
        <PermissionWrapper module="equipos" action="leer">
          <StatsActionButtons
            onPreventiveClick={() => setPreventiveModalOpen(true)}
            onCalibrationClick={() => setCalibrationModalOpen(true)}
            onCorrectiveClick={() => setCorrectiveModalOpen(true)}
            onMonthClick={() => setMonthModalOpen(true)}
            equipmentType="biomedical"
          />
        </PermissionWrapper>
      </div>
      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Enhanced Filters Section */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100 p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-800">
                Panel de Control y Filtros
              </h2>
              <Badge
                variant="outline"
                className="bg-white/80 text-slate-700 border-slate-300 text-xs sm:text-sm w-fit"
              >
                Sistema Activo
              </Badge>
            </div>

            {/* Top Filter Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                  Sede Hospitalaria:
                </span>
                <Select defaultValue="TODOS">
                  <SelectTrigger className="w-28 sm:w-32 md:w-40 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todas las Sedes</SelectItem>
                    <SelectItem value="PRINCIPAL">Sede Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                  Consultar Equipo por ID:
                </span>
                <div className="flex gap-1 sm:gap-2 flex-1 min-w-0">
                  <Input
                    placeholder="Ingrese ID del equipo médico"
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleEquipmentIdSearch()
                    }
                    className="flex-1 min-w-0 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleEquipmentIdSearch}
                    className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 bg-white/80 hover:bg-white"
                    title="Buscar por ID"
                  >
                    <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-teal-600" />
                  </Button>
                  {equipmentId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEquipmentId("");
                        updateFilters({ consulta_id: "" });
                      }}
                      className="h-6 sm:h-7 md:h-8 px-1 text-slate-400 hover:text-slate-600"
                      title="Limpiar búsqueda por ID"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Período:
                </span>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-24 sm:w-28 md:w-32 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
                  placeholder="Fecha inicio"
                />
                {dateFilter && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDateFilter("");
                      updateFilters({ anio_plan: "" });
                    }}
                    className="h-6 sm:h-7 md:h-8 px-1 text-slate-400 hover:text-slate-600"
                    title="Limpiar filtro de fecha"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              {loading
                ? "Cargando equipos médicos..."
                : filters.consulta_id
                ? devices.length > 0
                  ? `✅ Equipo encontrado con ID: ${filters.consulta_id}`
                  : `❌ No se encontró equipo con ID: ${filters.consulta_id}`
                : `Mostrando ${devices.length} de ${
                    pagination.total || 0
                  } equipos médicos`}
              {activeFiltersCount > 0 && !filters.consulta_id && (
                <span className="ml-2 text-teal-600 font-medium">
                  ({activeFiltersCount} filtro
                  {activeFiltersCount !== 1 ? "s" : ""} activo
                  {activeFiltersCount !== 1 ? "s" : ""})
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  onClick={handleClearAllFilters}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpiar filtros
                </Button>
              )}
              <Badge
                variant="secondary"
                className="bg-teal-100 text-teal-800 text-xs w-fit"
              >
                Base de Datos Actualizada
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Pagination Top */}
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b bg-slate-50">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-slate-700">Mostrar</span>
            <Select defaultValue="2">
              <SelectTrigger className="w-12 sm:w-14 md:w-16 h-6 sm:h-7 md:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-slate-700">
              equipos por página
            </span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Anterior
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Siguiente
            </Button>
          </div>
        </div>

        {/* Enhanced Medical Equipment Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px] xs:min-w-[700px] sm:min-w-[800px] md:min-w-[900px]">
            <thead>
              <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <th className="text-left p-1 xs:p-2 sm:p-3 md:p-4 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-slate-800 border-r border-slate-200">
                  Equipo Médico
                </th>

                <th className="text-left p-1 xs:p-2 sm:p-3 md:p-4 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-slate-800 border-r border-slate-200">
                  Datos Técnicos
                </th>
                <th className="text-left p-1 xs:p-2 sm:p-3 md:p-4 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-slate-800 border-r border-slate-200">
                  Ubicación Hospitalaria
                </th>
                <th className="text-left p-1 xs:p-2 sm:p-3 md:p-4 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-slate-800 border-r border-slate-200">
                  Plan de ejecución
                </th>
                <th className="text-left p-1 xs:p-2 sm:p-3 md:p-4 text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-slate-800">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200">
                      <div className="space-y-2 sm:space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 rounded-lg" />
                      </div>
                    </td>
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </td>
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </td>
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </td>
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4">
                      <div className="flex flex-col gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <tr
                    key={device.id}
                    className="border-b"
                  >
                    {/* Equipment Column */}
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200 align-top">
                      <div className="space-y-2 sm:space-y-3">
                        {/* ID del equipo prominente */}
                        <div className="flex items-center justify-between mb-2">
                          <EquipmentIdBadge 
                            equipmentId={device.id}
                            variant="primary"
                            size="sm"
                            showCopyButton={true}
                          />
                        </div>

                        {/* Título del equipo */}
                        <div className="font-semibold text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base">
                          {safeRenderText(device.equipo?.name, "Sin nombre")}
                        </div>

                        {/* Imagen del equipo con efecto hover mejorado */}
                        <EquipmentImageHover
                          equipmentId={device.id}
                          equipmentData={device.equipo}
                          equipmentName={device.equipo?.name || "Equipo médico"}
                          className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44"
                          fallbackImage={notFoundImg}
                          showLoader={true}
                        />
                      </div>
                    </td>

                    {/* ID Column */}
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200 align-top">
                      <div className="text-[10px] xs:text-xs sm:text-sm">
                        <div className="flex items-center gap-1 mb-1 sm:mb-2">
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 text-[8px] xs:text-[9px] sm:text-xs"
                          >
                            {safeRenderText(device.equipo?.code, "Sin código")}
                          </Badge>
                          <Files
                            onClick={() => {
                              setCopyEquipmentModalOpen(true);
                            }}
                            size={20}
                            color="#CD410E"
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="text-[9px] xs:text-[10px] sm:text-xs text-slate-600">
                          <span className="font-medium">
                            Registro Sanitario:
                          </span>
                          <div className="text-[8px] xs:text-[9px] sm:text-xs bg-slate-100 px-1 xs:px-2 py-0.5 xs:py-1 rounded mt-0.5 xs:mt-1 border">
                            {safeRenderText(
                              device.data?.registroSanitario,
                              "Sin registro"
                            )}
                          </div>
                          <div className="mt-4 xs:mt-2">
                            <div>
                              <span className="font-medium text-slate-700">
                                Código:
                              </span>
                              <span className="font-medium text-slate-700">
                                {safeRenderText(
                                  device.equipo?.code,
                                  "SIN CÓDIGO"
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Marca:
                              </span>
                              <span className="font-medium text-slate-700">
                                {safeRenderText(
                                  device.equipo?.brand,
                                  "SIN MARCA"
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Serie:
                              </span>
                              <span className="font-medium text-slate-700">
                                {safeRenderText(
                                  device.equipo?.series,
                                  "SIN SERIE"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 xs:gap-2">
                              <span className="font-medium text-slate-700">
                                Archivos:
                              </span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[8px] xs:text-[9px] sm:text-xs border border-green-200">
                                {safeRenderText(device.data?.archivos, "0")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 xs:gap-2">
                              <span className="font-medium text-slate-700">
                                Planes Mant.:
                              </span>
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[8px] xs:text-[9px] sm:text-xs border border-blue-200">
                                {safeRenderText(
                                  device.data?.planesMantenimiento,
                                  "0"
                                )}
                              </Badge>
                            </div>

                            {/* Observation Section */}
                            <div className="mt-3 xs:mt-4 pt-2 xs:pt-3 border-t border-slate-200">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-[8px] xs:text-[9px] sm:text-xs cursor-pointer hover:bg-blue-100"
                                  onClick={() => {
                                    setSelectedEquipment(device);
                                    setAddObservacionModalOpen(true);
                                  }}
                                >
                                  Agregar Observación
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 w-5 xs:h-6 xs:w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => {
                                    setSelectedEquipment(device);
                                    setAddObservacionModalOpen(true);
                                  }}
                                  title="Agregar observación"
                                >
                                  <Plus className="w-3 h-3 xs:w-4 xs:h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location Column */}
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200 align-top">
                      <div className="text-[9px] xs:text-[10px] sm:text-xs space-y-1 xs:space-y-2 max-w-xs">
                        <div>
                          <span className="font-medium text-slate-700">
                            Servicio:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(
                              device.ubicacion?.servicio,
                              "Sin servicio"
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Área:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(device.ubicacion?.area, "Sin área")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Sede:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(device.ubicacion?.sede, "Sin sede")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Estado:
                          </span>
                          <span className="ml-1 text-slate-900">
                            <Badge
                              className={`text-[8px] xs:text-[9px] sm:text-xs ${
                                device.data?.status === "Operativo"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : device.data?.status === "Fuera de Servicio"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}
                            >
                              {safeRenderText(
                                device.data?.status,
                                "Sin estado"
                              )}
                            </Badge>
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Clasificación:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(
                              device.data?.clasificacion,
                              "Sin clasificación"
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Riesgo:
                          </span>
                          <span className="ml-1 text-slate-900">
                            <Badge
                              className={`text-[8px] xs:text-[9px] sm:text-xs ${
                                device.data?.riesgo &&
                                typeof device.data.riesgo === "string" &&
                                (device.data.riesgo.includes("Alto") ||
                                  device.data.riesgo.includes("III"))
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : device.data?.riesgo &&
                                    typeof device.data.riesgo === "string" &&
                                    (device.data.riesgo.includes("Medio") ||
                                      device.data.riesgo.includes("II"))
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                              }`}
                            >
                              {safeRenderText(
                                device.data?.riesgo,
                                "Sin clasificar"
                              )}
                            </Badge>
                          </span>
                        </div>
                        <div className="mt-2 xs:mt-3 pt-1 xs:pt-2 border-t border-slate-100">
                          <span className="font-medium text-slate-700">
                            Propietario:
                          </span>
                          <div className="text-[8px] xs:text-[9px] sm:text-xs text-slate-600 leading-tight bg-slate-50 p-1 xs:p-2 rounded border">
                            {safeRenderText(
                              device.propietario,
                              "Sin propietario"
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Execution Plan Column */}
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200 align-top">
                      <div className="text-[9px] xs:text-[10px] sm:text-xs space-y-1 xs:space-y-2 max-w-xs">
                        <div>
                          <span className="font-medium text-slate-700">
                            Último Mantenimiento:
                          </span>
                        </div>
                        <div className="text-slate-600 bg-green-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-green-200 flex justify-between items-center">
                          {device.mantenimiento?.ultimoMantenimiento
                            ? new Date(
                                device.mantenimiento.ultimoMantenimiento
                              ).toLocaleDateString()
                            : "Sin registros"}
                          <Link
                            size={15}
                            className="cursor-pointer hover:text-teal-600 transition-colors"
                            onClick={() =>
                              handleOpenMaintenanceDocument(device.id)
                            }
                            title="Abrir documento de mantenimiento"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Última Calibración:
                          </span>
                        </div>
                        <div className="text-slate-600 bg-blue-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-blue-200">
                          {device.mantenimiento?.ultimaCalibración
                            ? new Date(
                                device.mantenimiento.ultimaCalibración
                              ).toLocaleDateString()
                            : "Sin registros"}
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Último Correctivo:
                          </span>
                        </div>
                        <div className="text-slate-600 bg-amber-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-amber-200">
                          {device.mantenimiento?.ultimoCorrectivo
                            ? new Date(
                                device.mantenimiento.ultimoCorrectivo
                              ).toLocaleDateString()
                            : "Sin registros"}
                        </div>
                        <div className="mt-2 xs:mt-3 pt-1 xs:pt-2 border-t border-slate-100 space-y-1 xs:space-y-2">
                          <div>
                            <span className="font-medium text-teal-700">
                              Información de tickets
                            </span>
                          </div>
                          <div className="space-y-0.5 xs:space-y-1 text-slate-600 bg-teal-50 p-1 xs:p-2 rounded border border-teal-200">
                            <div>
                              <div className="font-medium text-slate-700">
                                Último inicio de ticket:
                              </div>
                              <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                {device.tickets?.fechaUltimoTicket
                                  ? new Date(
                                      device.tickets.fechaUltimoTicket
                                    ).toLocaleDateString()
                                  : "Sin registros"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-700">
                                Orden de Compra:
                              </div>
                              <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                {safeRenderText(
                                  device.compra?.orden,
                                  "Sin orden"
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-700">
                                Tipo de Compra:
                              </div>
                              <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                {safeRenderText(
                                  device.compra?.tipo,
                                  "Sin especificar"
                                )}
                              </div>
                            </div>
                            {device.observaciones?.ultima && (
                              <div>
                                <div className="font-medium text-slate-700">
                                  Última Observación:
                                </div>
                                <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                  {safeRenderText(
                                    device.observaciones.ultima,
                                    "Sin observaciones"
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 align-top">
                      <RowActionButtons
                        equipment={device}
                        onViewClick={(eq) => {
                          setSelectedEquipment(eq);
                          setViewEquipmentModalOpen(true);
                        }}
                        onEditClick={(eq) => {
                          setSelectedEquipment(eq);
                          setEditEquipmentModalOpen(true);
                        }}
                        onDocumentsClick={(eq) => {
                          setSelectedEquipment(eq);
                          setDocumentListModalOpen(true);
                        }}
                        onUploadClick={(eq) => {
                          setSelectedEquipment(eq);
                          setDocumentUploadModalOpen(true);
                        }}
                        onDeleteClick={(eq) => {
                          setSelectedEquipment(eq);
                          setDeleteConfirmModalOpen(true);
                        }}
                        onCopyClick={(eq) => {
                          setSelectedEquipment(eq);
                          setCopyEquipmentModalOpen(true);
                        }}
                        onDecommissionClick={(eq) => {
                          setSelectedEquipment(eq);
                          setDarBajaEquipoModalOpen(true);
                        }}
                        equipmentType="biomedical"
                        showCopyButton={false}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                // No data message
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    {error ? (
                      <div className="text-red-500">
                        <p>Error al cargar los equipos</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    ) : (
                      <div>
                        {filters.search && filters.search.trim() ? (
                          <>
                            <p>No se encontraron equipos</p>
                            <p className="text-sm">
                              No hay equipos que coincidan con "{filters.search}
                              "
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => search("")}
                              className="mt-2"
                            >
                              Limpiar búsqueda
                            </Button>
                          </>
                        ) : (
                          <>
                            <p>No hay equipos disponibles</p>
                            <p className="text-sm">
                              No se encontraron equipos médicos registrados
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Results Info Bottom */}
        <div className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-slate-600 border-t bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : filters.search && filters.search.trim() ? (
                `Mostrando ${devices.length} de ${
                  pagination.total || 0
                } equipos`
              ) : (
                `Total de equipos médicos registrados: ${
                  pagination.total || 0
                } equipos`
              )}
            </span>
            <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500">
              Última actualización: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Enhanced Pagination Bottom */}
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-slate-50">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-slate-700">Mostrar</span>
            <Select
              value={pagination.per_page.toString()}
              onValueChange={(value) => changePageSize(parseInt(value))}
            >
              <SelectTrigger className="w-12 sm:w-14 md:w-16 h-6 sm:h-7 md:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs sm:text-sm text-slate-700">
              equipos por página
            </span>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1 || loading}
            >
              Anterior
            </Button>

            {/* Page numbers */}
            {[...Array(Math.min(5, pagination.last_page))].map((_, index) => {
              const pageNumber = index + 1;
              const isCurrentPage = pageNumber === pagination.current_page;

              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  className={`h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm ${
                    isCurrentPage ? "bg-teal-600 hover:bg-teal-700" : ""
                  }`}
                  onClick={() => changePage(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </Button>
              );
            })}

            {pagination.last_page > 5 && (
              <>
                <span className="text-xs sm:text-sm text-slate-500 px-1">
                  ...
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                  onClick={() => changePage(pagination.last_page)}
                  disabled={loading}
                >
                  {pagination.last_page}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(pagination.current_page + 1)}
              disabled={
                pagination.current_page >= pagination.last_page || loading
              }
            >
              Siguiente
            </Button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600">
            <span>
              Página {pagination.current_page} de {pagination.last_page}
            </span>
            <span className="hidden sm:inline">
              ({(pagination.current_page - 1) * pagination.per_page + 1}-
              {Math.min(
                pagination.current_page * pagination.per_page,
                pagination.total
              )}{" "}
              de {pagination.total})
            </span>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <FilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        onFiltersApply={handleFiltersApply}
        onFiltersClear={handleClearFilters}
        currentFilters={appliedFilters}
      />
      <AddEquipmentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onEquipmentAdded={refresh}
      />
      <CleanNamesModal
        open={cleanNamesModalOpen}
        onOpenChange={setCleanNamesModalOpen}
      />
      <MergeModal open={mergeModalOpen} onOpenChange={setMergeModalOpen} />
      <PreventiveModal
        isOpen={preventiveModalOpen}
        onOpenChange={setPreventiveModalOpen}
      />
      <CopyEquipmentModal
        open={copyEquipmentModalOpen}
        onOpenChange={setCopyEquipmentModalOpen}
      />
      <CalibrationModal
        open={calibrationModalOpen}
        onOpenChange={setCalibrationModalOpen}
      />
      <CorrectiveModal
        open={correctiveModalOpen}
        onOpenChange={setCorrectiveModalOpen}
      />
      <MonthModal open={monthModalOpen} onOpenChange={setMonthModalOpen} />
      <DocumentListModal
        open={documentListModalOpen}
        onOpenChange={setDocumentListModalOpen}
        equipment={selectedEquipment}
        onUploadClick={() => {
          setDocumentListModalOpen(false);
          setDocumentUploadModalOpen(true);
        }}
      />
      <DocumentUploadModal
        open={documentUploadModalOpen}
        onOpenChange={setDocumentUploadModalOpen}
        equipment={selectedEquipment}
        onDocumentUploaded={() => {
          // Refresh the equipment data after uploading document
          refresh();
        }}
      />
      <EditEquipmentModal
        open={editEquipmentModalOpen}
        onOpenChange={setEditEquipmentModalOpen}
        equipment={selectedEquipment}
        onEquipmentUpdated={() => {
          // Refresh the equipment data after updating
          refresh();
        }}
      />
      <ViewEquipmentModal
        open={viewEquipmentModalOpen}
        onOpenChange={setViewEquipmentModalOpen}
        equipment={selectedEquipment}
      />
      <DeleteConfirmModal
        open={deleteConfirmModalOpen}
        onOpenChange={setDeleteConfirmModalOpen}
        equipment={selectedEquipment}
        onEquipmentDeleted={handleEquipmentDeleted}
      />
      <AddObservacionModal
        isOpen={addObservacionModalOpen}
        onClose={() => setAddObservacionModalOpen(false)}
        equipmentId={selectedEquipment?.id}
        equipmentName={selectedEquipment?.equipo?.name || "Equipo sin nombre"}
        onObservationAdded={() => {
          // Refresh the equipment data after adding observation
          refresh();
        }}
      />
      <DarBajaEquipoModal
        open={darBajaEquipoModalOpen}
        onOpenChange={setDarBajaEquipoModalOpen}
        equipo={selectedEquipment}
        onSuccess={() => {
          // Refresh the equipment data after decommissioning
          refresh();
        }}
      />
    </div>
  );
}

export default MedicalDevicesView;

import { useState, useEffect } from "react";
import { useEquipment } from "../hooks/useEquipment";
import { MainActionButtons } from "./equipment/MainActionButtons";
import { StatsActionButtons } from "./equipment/StatsActionButtons";
import { EquipmentPagination } from "./equipment/EquipmentPagination";
import { RowActionButtons } from "./equipment/RowActionButtons";
import { useEquipmentSearch } from "../contexts/EquipmentSearchContext";
import { API_CONFIG } from "../config/api";
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
import { Button } from "@/components/ui/button";
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
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { LifeModal } from "@/components/modals/life-modal";
import CopyEquipmentModal from "@/components/modals/copy-equipment-modal";
import notFoundImg from "../assets/Img/imagenes/not-found.jpg";

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

const equipmentData = [
  {
    id: "001",
    image: "/placeholder.svg?height=72&width=108",
    equipo: {
      name: "ACELERADOR LINEAL MÉDICO",
      code: "EAC0001",
      brand: "VARIAN MEDICAL SYSTEMS",
      model: "CLINAC iX",
      series: "12345",
    },
    data: {
      preventivos: "25",
      calibraciones: "5",
      status: "Operativo",
      registroSanitario: "INVIMA-2024-001",
    },
    ubicacion: {
      servicio: "RADIOTERAPIA ONCOLÓGICA",
      area: "UNIDAD DE RADIOTERAPIA",
      zona: "ÁREA DE HOSPITALIZACIÓN",
      sede: "SEDE PRINCIPAL",
      localizacion: "SALA DE RADIOTERAPIA A",
      hospital: "HOSPITAL UNIVERSITARIO DEL VALLE EVARISTO GARCÍA",
    },
    ejecucionPlan: {
      frecuencia: "Mantenimiento Preventivo Anual",
      ultimoMantenimiento: "2024-05-15",
      proximoMantenimiento: "2025-05-15",
    },
    ultimaAccion: {
      fechaCreacion: "2024-05-15 15:30:04",
      fechaCierre: "2024-05-15 16:45:30",
      tipo: "Mantenimiento Preventivo Programado",
    },
  },
  {
    id: "002",
    image: "/placeholder.svg?height=72&width=108",
    equipo: {
      name: "ACELERADOR LINEAL MÉDICO",
      code: "EAC0002",
      brand: "VARIAN MEDICAL SYSTEMS",
      model: "TRUE BEAM STx",
      series: "67890",
    },
    data: {
      preventivos: "30",
      calibraciones: "8",
      status: "Operativo",
      registroSanitario: "INVIMA-2024-002",
    },
    ubicacion: {
      servicio: "RADIOTERAPIA ONCOLÓGICA",
      area: "UNIDAD DE RADIOTERAPIA",
      zona: "ÁREA DE HOSPITALIZACIÓN",
      sede: "SEDE PRINCIPAL",
      localizacion: "SALA DE RADIOTERAPIA B",
      hospital: "HOSPITAL UNIVERSITARIO DEL VALLE EVARISTO GARCÍA",
    },
    ejecucionPlan: {
      frecuencia: "Mantenimiento Preventivo Semestral",
      ultimoMantenimiento: "2024-05-14",
      proximoMantenimiento: "2024-11-14",
    },
    ultimaAccion: {
      fechaCreacion: "2024-05-14 10:20:15",
      fechaCierre: "2024-05-14 11:35:45",
      tipo: "Calibración de Precisión",
    },
  },
];

function IndustrialDevicesView() {
  // Hook para gestión de equipos industriales
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
  } = useEquipment("industrial");

  // Global search context
  const { registerSearchCallback, setResultCount } = useEquipmentSearch();

  // Estados para modales
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cleanNamesModalOpen, setCleanNamesModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [preventiveModalOpen, setPreventiveModalOpen] = useState(false);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [correctiveModalOpen, setCorrectiveModalOpen] = useState(false);
  const [lifeModalOpen, setLifeModalOpen] = useState(false);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [documentListModalOpen, setDocumentListModalOpen] = useState(false);
  const [documentUploadModalOpen, setDocumentUploadModalOpen] = useState(false);
  const [editEquipmentModalOpen, setEditEquipmentModalOpen] = useState(false);
  const [viewEquipmentModalOpen, setViewEquipmentModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [copyEquipmentModalOpen, setCopyEquipmentModalOpen] = useState(false);

  // Estados para filtros avanzados
  const [equipmentId, setEquipmentId] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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

  // Handlers
  const handlePageSizeChange = (newSize) => {
    changePageSize(parseInt(newSize));
  };

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

  // Handle opening maintenance documents
  const handleOpenMaintenanceDocument = async (equipmentId) => {
    try {
      // Fetch maintenance data for the equipment
      const response = await fetch(
        `http://127.0.0.1:8001/api/v1/mantenimiento?equipo_id=${equipmentId}&limit=1&order=desc`
      );

      if (!response.ok) {
        throw new Error("Error al obtener datos de mantenimiento");
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        const maintenance = data.data[0];

        if (maintenance.file) {
          // Construct the file URL
          const fileUrl = `http://127.0.0.1:8001/storage/${maintenance.file}`;

          // Open in new tab
          window.open(fileUrl, "_blank");
        } else {
          alert(
            "No hay documento de mantenimiento disponible para este equipo"
          );
        }
      } else {
        alert("No se encontraron registros de mantenimiento para este equipo");
      }
    } catch (error) {
      console.error("Error al abrir documento de mantenimiento:", error);
      alert("Error al acceder al documento de mantenimiento");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      {/* Medical Equipment Management Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Sistema de Gestión de Equipos Industriales
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Control y seguimiento integral de equipamiento industrial hospitalario
        </p>
      </div>

      {/* Action Buttons - Ultra Compact Side by Side */}
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
        {/* Main Action Buttons */}
        <MainActionButtons
          onFilterClick={() => setFilterModalOpen(true)}
          onAddClick={() => setAddModalOpen(true)}
          onCleanNamesClick={() => setCleanNamesModalOpen(true)}
          onMergeClick={() => setMergeModalOpen(true)}
          onClearFiltersClick={handleClearAllFilters}
          activeFiltersCount={activeFiltersCount}
          showClearFilters={true}
          equipmentType="industrial"
        />

        {/* Stats Buttons */}
        <StatsActionButtons
          onPreventiveClick={() => setPreventiveModalOpen(true)}
          onCalibrationClick={() => setCalibrationModalOpen(true)}
          onCorrectiveClick={() => setCorrectiveModalOpen(true)}
          onMonthClick={() => setMonthModalOpen(true)}
          equipmentType="industrial"
        />
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
                    placeholder="Ingrese ID del equipo industrial"
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
                    title="Limpiar fecha"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="p-4 text-sm text-slate-600 bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <span>
              Mostrando registros de equipos médicos: 1 a 2 de un total de 2
              registros
            </span>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
              Base de Datos Actualizada
            </Badge>
          </div>
        </div>

        {/* Enhanced Pagination Top */}
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">Mostrar</span>
            <Select defaultValue="2">
              <SelectTrigger className="w-16 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-700">equipos por página</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
              Anterior
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-sm"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
              3
            </Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
              Siguiente
            </Button>
          </div>
        </div>

        {/* Enhanced Medical Equipment Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <th className="text-left p-4 text-sm font-semibold text-slate-800 border-r border-slate-200">
                  Equipo Médico
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-800 border-r border-slate-200">
                  Identificación
                </th>

                <th className="text-left p-4 text-sm font-semibold text-slate-800 border-r border-slate-200">
                  Ubicación Hospitalaria
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-800 border-r border-slate-200">
                  Plan de Mantenimiento
                </th>
                <th className="text-left p-4 text-sm font-semibold text-slate-800">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                      <span className="ml-2 text-slate-600">
                        Cargando equipos industriales...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : hasError ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-red-600">
                      <p>Error al cargar equipos: {error}</p>
                      <Button onClick={refresh} className="mt-2" size="sm">
                        Reintentar
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : isEmpty ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <div className="text-slate-500">
                      <p>No se encontraron equipos industriales</p>
                      <Button
                        onClick={clearFilters}
                        className="mt-2"
                        size="sm"
                        variant="outline"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((equipment) => (
                  <tr
                    key={equipment.id}
                    className="border-b hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Equipment Column */}
                    <td className="p-4 border-r border-slate-200 align-top">
                      <div className="space-y-2 sm:space-y-3">
                        {/* Título del equipo */}
                        <div className="font-semibold text-slate-900 text-sm mb-1">
                          {safeRenderText(equipment.equipo?.name, "Equipo sin nombre")}
                        </div>

                        {/* Imagen del equipo - responsive y grande */}
                        <div className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center border border-teal-200 overflow-hidden">
                          <img
                            src={
                              equipment.equipo?.image
                                ? `${API_CONFIG.BASE_URL}/api/storage/equipos/images/${equipment.equipo.image}`
                                : notFoundImg
                            }
                            alt={safeRenderText(equipment.equipo?.name, "Equipo industrial")}
                            className="w-full h-full object-cover hover:scale-105 transition-all duration-300 opacity-80"
                            onError={(e) => {
                              e.target.src = notFoundImg;
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* ID Column */}
                    <td className="p-4 border-r border-slate-200 align-top">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-2">
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200"
                          >
                            {safeRenderText(equipment.equipo?.code, "Sin código")}
                          </Badge>
                          <Files
                            onClick={() => setCopyEquipmentModalOpen(true)}
                            size={20}
                            color="#CD410E"
                            className="cursor-pointer"
                          />
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">
                            Registro Sanitario:
                          </span>
                          <div className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 border">
                            {safeRenderText(equipment.registro?.registro_sanitario_invima, "Sin registro")}
                          </div>
                        </div>
                        <div className="mt-4 xs:mt-2">
                          <div>
                            <span className="font-medium text-slate-700">
                              Código:
                            </span>
                            <span className="font-medium text-slate-700">
                              {safeRenderText(equipment.equipo?.code, "SIN CÓDIGO")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Marca:
                            </span>
                            <span className="font-medium text-slate-700">
                              {safeRenderText(equipment.equipo?.brand, "SIN MARCA")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Modelo:
                            </span>
                            <span className="font-medium text-slate-700">
                              {safeRenderText(equipment.equipo?.model, "SIN MODELO")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Serie:
                            </span>
                            <span className="font-medium text-slate-700">
                              {safeRenderText(equipment.equipo?.series, "SIN SERIE")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 xs:gap-2">
                            <span className="font-medium text-slate-700">
                              Servicio:
                            </span>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-[8px] xs:text-[9px] sm:text-xs border border-blue-200">
                              {safeRenderText(equipment.ubicacion?.servicios, "SIN SERVICIO")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 xs:gap-2">
                            <span className="font-medium text-slate-700">
                              Estado:
                            </span>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[8px] xs:text-[9px] sm:text-xs border border-green-200">
                              {safeRenderText(equipment.estado?.estadoequipo, "SIN ESTADO")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location Column */}
                    <td className="p-4 border-r border-slate-200 align-top">
                      <div className="text-xs space-y-2 max-w-xs">
                        <div>
                          <span className="font-medium text-slate-700">
                            Servicio:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(equipment.ubicacion?.servicios, "Sin servicio")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Área:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(equipment.ubicacion?.area, "Sin área")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Sede:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(equipment.ubicacion?.sede, "Sin sede")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Clasificación:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(equipment.estado?.clasificacion, "Sin clasificación")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Riesgo:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(equipment.estado?.riesgo, "Sin clasificar")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Estado del equipo:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {safeRenderText(equipment.estado?.estadoequipo, "SIN ESTADO")}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-slate-700">
                            Propietario:
                          </span>
                          <div className="text-slate-600 text-xs mt-1">
                            {safeRenderText(equipment.compra?.propietario, "Sin propietario")}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Maintenance Information Column */}
                    <td className="p-4 border-r border-slate-200 align-top">
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-medium text-slate-700">
                            Último Mantenimiento:
                          </span>
                          <div className="text-slate-600 mt-1">
                            {safeRenderText(equipment.informacion_adicional?.ultimo_mantenimiento, "Sin registro")}
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-700">
                            Última Calibración:
                          </span>
                          <div className="text-slate-600 mt-1">
                            {safeRenderText(equipment.informacion_adicional?.ultima_calibracion, "Sin registro")}
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-700">
                            Último Correctivo:
                          </span>
                          <div className="text-slate-600 mt-1">
                            {safeRenderText(equipment.informacion_adicional?.ultimo_correctivo, "Sin registro")}
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-700">
                            Último Ticket:
                          </span>
                          <div className="text-slate-600 mt-1">
                            {safeRenderText(equipment.informacion_adicional?.fecha_inicio_ultimo_ticket, "Sin registro")}
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-700">
                            Archivos:
                          </span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs border border-green-200 ml-1">
                            {safeRenderText(equipment.informacion_adicional?.cuenta_archivos, "0")}
                          </Badge>
                        </div>
                      </div>
                    </td>
                            Sede:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {equipment.sede || "Sin sede"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Clasificación:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {equipment.clasificacion || "Sin clasificación"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Riesgo:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {equipment.riesgo || "Sin clasificar"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Estado del equipo:
                          </span>
                          <span className="ml-1 text-slate-900">
                            {equipment.estadoequipo || "SIN ESTADO"}
                          </span>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <span className="font-medium text-slate-700">
                            Propietario:
                          </span>
                          <div className="text-xs text-slate-600 leading-tight bg-slate-50 p-2 rounded border">
                            {equipment.propietario || "Sin propietario"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Execution Plan Column */}
                    <td className="p-4 border-r border-slate-200 align-top">
                      <div className="text-[9px] xs:text-[10px] sm:text-xs space-y-1 xs:space-y-2 max-w-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-900 font-medium">
                            Mantenimiento Industrial
                          </span>
                          <span className="text-teal-500">🔄</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Último Mantenimiento:
                          </span>
                        </div>
                        <div className="text-slate-600 bg-green-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-green-200 flex justify-between items-center">
                          {equipment.ultimo_mantenimiento || "Sin registro"}
                          <Link
                            size={15}
                            className="cursor-pointer hover:text-teal-600 transition-colors"
                            onClick={() =>
                              handleOpenMaintenanceDocument(equipment.id)
                            }
                            title="Abrir documento de mantenimiento"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Última Calibración:
                          </span>
                        </div>
                        <div className="text-slate-600 bg-amber-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-amber-200">
                          {equipment.ultima_calibracion || "Sin registro"}
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
                                Último Correctivo:
                              </div>
                              <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                {equipment.ultimo_correctivo || "Sin registro"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-700">
                                Último Ticket:
                              </div>
                              <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                {equipment.fecha_inicio_ultimo_ticket ||
                                  "Sin registro"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-slate-700">
                                Archivos:
                              </div>
                              <div className="text-[8px] xs:text-[9px] sm:text-xs">
                                {equipment.cuenta_archivos || 0} documentos
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="p-1 xs:p-2 sm:p-3 md:p-4 align-top">
                      <RowActionButtons
                        equipment={equipment}
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
                        equipmentType="industrial"
                        showCopyButton={true}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        <EquipmentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          showingFrom={showingFrom}
          showingTo={showingTo}
          perPage={pagination.per_page}
          loading={loading}
          onPageChange={changePage}
          onPageSizeChange={handlePageSizeChange}
          equipmentType="industrial"
        />
      </Card>
      {/* Modals */}
      <FilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        equipmentType="industrial"
      />
      <AddEquipmentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        equipmentType="industrial"
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
      />
      <LifeModal open={lifeModalOpen} onOpenChange={setLifeModalOpen} />
      <EditEquipmentModal
        open={editEquipmentModalOpen}
        onOpenChange={setEditEquipmentModalOpen}
        equipment={selectedEquipment}
      />
      <ViewEquipmentModal
        open={viewEquipmentModalOpen}
        onOpenChange={setViewEquipmentModalOpen}
        equipment={selectedEquipment}
        equipmentType="industrial"
      />
      <DeleteConfirmModal
        open={deleteConfirmModalOpen}
        onOpenChange={setDeleteConfirmModalOpen}
        equipment={selectedEquipment}
        equipmentType="industrial"
      />

      <CopyEquipmentModal
        open={copyEquipmentModalOpen}
        onOpenChange={setCopyEquipmentModalOpen}
        equipment={selectedEquipment}
      />
    </div>
  );
}

export default IndustrialDevicesView;

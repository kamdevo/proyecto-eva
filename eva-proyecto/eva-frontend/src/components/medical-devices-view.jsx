import { useState } from "react";
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
import { useMedicalDevices } from "@/hooks/useMedicalDevices";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PreventiveModal } from "@/components/modals/preventive-modal";
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
import notFoundImg from "../assets/Img/imagenes/not-found.jpg";
import EquipmentImage from "./ui/equipment-image";

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
    pagination,
    filters,
    selectedDevices,
    selectAll,
    stats,
    criticalDevices,
    filterOptions,
    updateFilters,
    clearFilters,
    changePage,
    changePerPage,
    searchDevices,
    toggleDeviceSelection,
    toggleSelectAll,
    deleteDevice,
    toggleDeviceStatus,
    bulkUpdateDevices,
    bulkDeleteDevices,
    refreshDevices,
  } = useMedicalDevices();

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
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");

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

      {/* Global Search Input */}
      <div className="mb-3 sm:mb-4">
        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700 block">
            Consulta Global:
          </label>
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
            <Input
              type="text"
              placeholder="Buscar registros..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full h-8 sm:h-9 md:h-10 pl-7 sm:pl-9 pr-3 text-xs sm:text-sm bg-white border border-slate-200 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-200 transition-all duration-200 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons - Ultra Compact Side by Side */}
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
        {/* Main Action Buttons */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
          <CardContent className="p-0.5 sm:p-1">
            <div className="flex gap-0.5">
              <Button
                onClick={() => setFilterModalOpen(true)}
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0 relative ${
                  activeFiltersCount > 0 ? "bg-teal-600 hover:bg-teal-700" : ""
                }`}
              >
                <Filter className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Filtrar
                </span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[8px] bg-orange-500 text-white border-0 flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Clear Filters Button - only show when filters are active */}
              {activeFiltersCount > 0 && (
                <Button
                  onClick={handleClearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-red-600 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
                >
                  <X className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
                  <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                    Limpiar
                  </span>
                </Button>
              )}
              <Button
                onClick={() => setAddModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Registrar
                </span>
              </Button>
              <Button
                onClick={() => setCleanNamesModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <FileSpreadsheet className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Depurar
                </span>
              </Button>
              <Button
                onClick={() => setMergeModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <Merge className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 xs:mr-1 flex-shrink-0" />
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Consolidar
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Buttons */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
          <CardContent className="p-0.5 sm:p-1">
            <div className="flex gap-0.5">
              <Button
                onClick={() => setPreventiveModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <span className="mr-0.5 xs:mr-1 text-xs xs:text-sm sm:text-base">
                  🔧
                </span>
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Preventivos
                </span>
              </Button>
              <Button
                onClick={() => setCalibrationModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <span className="mr-0.5 xs:mr-1 text-xs xs:text-sm sm:text-base">
                  ⚖️
                </span>
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Calibraciones
                </span>
              </Button>
              <Button
                onClick={() => setCorrectiveModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <span className="mr-0.5 xs:mr-1 text-xs xs:text-sm sm:text-base">
                  🔧
                </span>
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Correctivos
                </span>
              </Button>
              <Button
                onClick={() => setMonthModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-[10px] xs:text-xs sm:text-sm h-6 xs:h-7 sm:h-8 md:h-9 px-1 xs:px-1.5 sm:px-2 md:px-3 flex-1 min-w-0"
              >
                <span className="mr-0.5 xs:mr-1 text-xs xs:text-sm sm:text-base">
                  📊
                </span>
                <span className="truncate text-[9px] xs:text-[10px] sm:text-xs md:text-sm">
                  Reportes
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
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
                  Limpiar Filtros:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 p-0 bg-white/80 hover:bg-white"
                >
                  <Filter className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-teal-600" />
                </Button>
              </div>

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
                  Consultar Equipo:
                </span>
                <div className="flex gap-1 sm:gap-2 flex-1 min-w-0">
                  <Input
                    placeholder="Ingrese código de equipo médico"
                    className="flex-1 min-w-0 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 sm:h-7 md:h-8 px-2 sm:px-3 bg-white/80 hover:bg-white"
                  >
                    <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-teal-600" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  Período:
                </span>
                <Input
                  type="date"
                  defaultValue="2024-06-18"
                  className="w-24 sm:w-28 md:w-32 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
                />
                <span className="text-slate-500 text-xs sm:text-sm">—</span>
                <Input
                  type="date"
                  defaultValue="2024-06-18"
                  className="w-24 sm:w-28 md:w-32 h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200 px-1 sm:px-2"
                />
              </div>
            </div>

            {/* Bottom Filter Grid */}
            <div className="border-t border-teal-100 pt-2 sm:pt-3 md:pt-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Servicio Clínico:
                  </label>
                  <Select>
                    <SelectTrigger className="h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200">
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radioterapia">
                        Radioterapia Oncológica
                      </SelectItem>
                      <SelectItem value="cardiologia">Cardiología</SelectItem>
                      <SelectItem value="neurologia">Neurología</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Área Hospitalaria:
                  </label>
                  <Select>
                    <SelectTrigger className="h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200">
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radioterapia">
                        Unidad de Radioterapia
                      </SelectItem>
                      <SelectItem value="uci">
                        Unidad de Cuidados Intensivos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Órdenes de Trabajo:
                  </label>
                  <Select>
                    <SelectTrigger className="h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200">
                      <SelectValue placeholder="Estado de órdenes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="proceso">En Proceso</SelectItem>
                      <SelectItem value="completado">Completadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Mantenimientos:
                  </label>
                  <Select>
                    <SelectTrigger className="h-6 sm:h-7 md:h-8 text-xs sm:text-sm bg-white/80 border-slate-200">
                      <SelectValue placeholder="Tipo de mantenimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="correctivo">Correctivo</SelectItem>
                      <SelectItem value="calibracion">Calibración</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Mostrando registros de equipos médicos: 1 a 2 de un total de 2
              registros
            </span>
            <Badge
              variant="secondary"
              className="bg-teal-100 text-teal-800 text-xs w-fit"
            >
              Base de Datos Actualizada
            </Badge>
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
              ) : devices && devices.length > 0 ? (
                devices
                  .filter(
                    (device) =>
                      device && typeof device === "object" && device.id
                  )
                  .map((device) => (
                    <tr
                      key={device.id}
                      className="border-b hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Equipment Column */}
                      <td className="p-1 xs:p-2 sm:p-3 md:p-4 border-r border-slate-200 align-top">
                        <div className="space-y-2 sm:space-y-3">
                          {/* Título del equipo */}
                          <div className="font-semibold text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base">
                            {safeRenderText(device.equipo?.name, "Sin nombre")}
                          </div>

                          {/* Imagen del equipo - responsive y grande con carga dinámica */}
                          <EquipmentImage
                            equipmentId={device.id}
                            equipmentData={device.equipo}
                            equipmentName={
                              device.equipo?.name || "Equipo médico"
                            }
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
                              {safeRenderText(
                                device.equipo?.code,
                                "Sin código"
                              )}
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
                              {safeRenderText(
                                device.ubicacion?.area,
                                "Sin área"
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">
                              Sede:
                            </span>
                            <span className="ml-1 text-slate-900">
                              {safeRenderText(
                                device.ubicacion?.sede,
                                "Sin sede"
                              )}
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
                                    : device.data?.status ===
                                      "Fuera de Servicio"
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
                            <Link size={15} />
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
                        <div className="flex flex-col gap-0.5 xs:gap-1">
                          <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                            title="Consultar Equipo"
                            onClick={() => {
                              setSelectedEquipment(device);
                              setViewEquipmentModalOpen(true);
                            }}
                          >
                            <Eye className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                            title="Editar Información"
                            onClick={() => {
                              setSelectedEquipment(device);
                              setEditEquipmentModalOpen(true);
                            }}
                          >
                            <Edit className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-purple-500 hover:bg-purple-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                            title="Documentos Técnicos"
                            onClick={() => {
                              setSelectedEquipment(device);
                              setDocumentListModalOpen(true);
                            }}
                          >
                            <Paperclip className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                            title="Cargar Documentos"
                            onClick={() => {
                              setSelectedEquipment(device);
                              setDocumentUploadModalOpen(true);
                            }}
                          >
                            <FileText className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                            title="Eliminar Registro"
                            onClick={() => {
                              setSelectedEquipment(device);
                              setDeleteConfirmModalOpen(true);
                            }}
                          >
                            <Trash2 className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
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
                        <p>No hay equipos disponibles</p>
                        <p className="text-sm">
                          No se encontraron equipos médicos registrados
                        </p>
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
              onValueChange={(value) => changePerPage(parseInt(value))}
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
      <AddEquipmentModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <CleanNamesModal
        open={cleanNamesModalOpen}
        onOpenChange={setCleanNamesModalOpen}
      />
      <MergeModal open={mergeModalOpen} onOpenChange={setMergeModalOpen} />
      <PreventiveModal
        open={preventiveModalOpen}
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
      />
      <EditEquipmentModal
        open={editEquipmentModalOpen}
        onOpenChange={setEditEquipmentModalOpen}
        equipment={selectedEquipment}
        onEquipmentUpdated={() => {
          // Refresh the equipment data after updating
          refreshDevices();
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
      />
      <AddObservacionModal
        isOpen={addObservacionModalOpen}
        onClose={() => setAddObservacionModalOpen(false)}
        equipmentId={selectedEquipment?.id}
        equipmentName={selectedEquipment?.equipo?.name || "Equipo sin nombre"}
        onObservationAdded={() => {
          // Refresh the equipment data after adding observation
          refreshDevices();
        }}
      />
    </div>
  );
}

export default MedicalDevicesView;

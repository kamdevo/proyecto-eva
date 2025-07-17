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
import { PreventiveModal } from "@/components/modals/preventive-modal";
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
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      {/* Medical Equipment Management Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Sistema de Gestión de Equipos Industriales
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
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
      <div className="flex gap-2 mb-6">
        {/* Main Action Buttons */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
          <CardContent className="p-1">
            <div className="flex gap-0.5">
              <Button
                onClick={() => setFilterModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <Filter className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Filtrar</span>
              </Button>
              <Button
                onClick={() => setAddModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Registrar</span>
              </Button>
              <Button
                onClick={() => setCleanNamesModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <FileSpreadsheet className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Depurar</span>
              </Button>
              <Button
                onClick={() => setMergeModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <Merge className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Consolidar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Buttons */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
          <CardContent className="p-1">
            <div className="flex gap-0.5">
              <Button
                onClick={() => setPreventiveModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <span className="mr-1 text-sm">🔧</span>
                <span className="truncate">Preventivos</span>
              </Button>
              <Button
                onClick={() => setCalibrationModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <span className="mr-1 text-sm">⚖️</span>
                <span className="truncate">Calibraciones</span>
              </Button>
              <Button
                onClick={() => setLifeModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <span className="mr-1 text-sm">🔧</span>
                <span className="truncate">Obsoletos por vida útil</span>
              </Button>
              <Button
                onClick={() => setMonthModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0"
              >
                <span className="mr-1 text-sm">📊</span>
                <span className="truncate">Correctivos</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Enhanced Filters Section */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Panel de Control y Filtros
              </h2>
              <Badge
                variant="outline"
                className="bg-white/80 text-slate-700 border-slate-300"
              >
                Sistema Activo
              </Badge>
            </div>

            {/* Top Filter Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Limpiar Filtros:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                >
                  <Filter className="w-4 h-4 text-teal-600" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Sede Hospitalaria:
                </span>
                <Select defaultValue="TODOS">
                  <SelectTrigger className="w-40 h-8 text-sm bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todas las Sedes</SelectItem>
                    <SelectItem value="PRINCIPAL">Sede Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Consultar Equipo:
                </span>
                <div className="flex gap-2 flex-1 min-w-0">
                  <Input
                    placeholder="Ingrese código de equipo médico"
                    className="flex-1 min-w-0 h-8 text-sm bg-white/80 border-slate-200"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 bg-white/80 hover:bg-white"
                  >
                    <Search className="w-4 h-4 text-teal-600" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Período:
                </span>
                <Input
                  type="date"
                  defaultValue="2024-06-18"
                  className="w-32 h-8 text-sm bg-white/80 border-slate-200"
                />
                <span className="text-slate-500">—</span>
                <Input
                  type="date"
                  defaultValue="2024-06-18"
                  className="w-32 h-8 text-sm bg-white/80 border-slate-200"
                />
              </div>
            </div>

            {/* Bottom Filter Grid */}
            <div className="border-t border-teal-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Servicio Clínico:
                  </label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm bg-white/80 border-slate-200">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Área Hospitalaria:
                  </label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm bg-white/80 border-slate-200">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Órdenes de Trabajo:
                  </label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm bg-white/80 border-slate-200">
                      <SelectValue placeholder="Estado de órdenes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="proceso">En Proceso</SelectItem>
                      <SelectItem value="completado">Completadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mantenimientos:
                  </label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm bg-white/80 border-slate-200">
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
              {equipmentData.map((equipment) => (
                <tr
                  key={equipment.id}
                  className="border-b hover:bg-slate-50/50 transition-colors"
                >
                  {/* Equipment Column */}
                  <td className="p-4 border-r border-slate-200 align-top">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Título del equipo */}
                      <div className="font-semibold text-slate-900 text-sm mb-1">
                        {equipment.equipo.name}
                      </div>

                      {/* Imagen del equipo - responsive y grande */}
                      <div className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-40 xl:h-44 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center border border-teal-200 overflow-hidden">
                        <img
                          src={notFoundImg}
                          alt={equipment.equipo.name}
                          className="w-full h-full object-cover hover:scale-105 transition-all duration-300 opacity-80"
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
                          {equipment.equipo.code}
                        </Badge>
                        <Files
                          onClick={setCopyEquipmentModalOpen}
                          size={20}
                          color="#CD410E"
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Registro Sanitario:</span>
                        <div className="text-xs bg-slate-100 px-2 py-1 rounded mt-1 border">
                          {equipment.data.registroSanitario}
                        </div>
                      </div>
                      <div className="mt-4 xs:mt-2">
                        <div>
                          <span className="font-medium text-slate-700">
                            Codigo:
                          </span>
                          <span className="font-medium text-slate-700">
                            {equipment.equipo.code || "SIN CODIGO"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Marca:
                          </span>
                          <span className="font-medium text-slate-700">
                            {equipment.equipo.brand || "SIN MARCA"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Modelo:
                          </span>
                          <span className="font-medium text-slate-700">
                            {equipment.equipo.model || "SIN MODELO"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">
                            Serie:
                          </span>
                          <span className="font-medium text-slate-700">
                            {equipment.equipo.series || "SIN SERIE"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 xs:gap-2">
                          <span className="font-medium text-slate-700">
                            Preventivos:
                          </span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[8px] xs:text-[9px] sm:text-xs border border-green-200">
                            {equipment.data.preventivos || "SIN PREVENTIVOS"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 xs:gap-2">
                          <span className="font-medium text-slate-700">
                            Calibraciones:
                          </span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[8px] xs:text-[9px] sm:text-xs border border-green-200">
                            {equipment.data.calibraciones ||
                              "SIN CALIBRACIONES"}
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
                          {equipment.ubicacion.servicio}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Área:
                        </span>
                        <span className="ml-1 text-slate-900">
                          {equipment.ubicacion.area}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Zona:
                        </span>
                        <span className="ml-1 text-slate-900">
                          {equipment.ubicacion.zona}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Sede:
                        </span>
                        <span className="ml-1 text-slate-900">
                          {equipment.ubicacion.sede}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Localización actual:
                        </span>
                        <span className="ml-1 text-slate-900">
                          {equipment.ubicacion.localizacion}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Estado del equipo:
                        </span>
                        <span className="ml-1 text-slate-900">
                          {equipment.ubicacion.estado || "SIN ESTADO  "}
                        </span>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <span className="font-medium text-slate-700">
                          Propietario:
                        </span>
                        <div className="text-xs text-slate-600 leading-tight bg-slate-50 p-2 rounded border">
                          {equipment.ubicacion.hospital}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Execution Plan Column */}
                  <td className="p-4 border-r border-slate-200 align-top">
                    <div className="text-[9px] xs:text-[10px] sm:text-xs space-y-1 xs:space-y-2 max-w-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-900 font-medium">
                          {equipment.ejecucionPlan.frecuencia}
                        </span>
                        <span className="text-teal-500">🔄</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Último Preventivo:
                        </span>
                      </div>
                      <div className="text-slate-600 bg-green-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-green-200 flex justify-between items-center">
                        {equipment.ejecucionPlan.ultimoMantenimiento}
                        <Link size={15} />
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Próximo Mantenimiento:
                        </span>
                      </div>
                      <div className="text-slate-600 bg-amber-50 p-1 xs:p-2 rounded text-[8px] xs:text-[9px] sm:text-xs border border-amber-200">
                        {equipment.ejecucionPlan.proximoMantenimiento}
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
                              Fecha de creación del ultimo ticket:
                            </div>
                            <div className="text-[8px] xs:text-[9px] sm:text-xs">
                              {equipment.ultimaAccion.tipo}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">
                              Fecha de ultimo cierre de tickets:
                            </div>
                            <div className="text-[8px] xs:text-[9px] sm:text-xs">
                              {equipment.ultimaAccion.fechaCreacion}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">
                              Fecha de Finalización:
                            </div>
                            <div className="text-[8px] xs:text-[9px] sm:text-xs">
                              {equipment.ultimaAccion.fechaCierre}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Options Column */}
                  <td className="p-4 align-top">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        className="bg-cyan-500 hover:bg-cyan-600 text-white h-8 w-8 p-0"
                        title="Consultar Equipo"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setViewEquipmentModalOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white h-8 w-8 p-0"
                        title="Editar Información"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setEditEquipmentModalOpen(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-500 hover:bg-purple-600 text-white h-8 w-8 p-0"
                        title="Documentos Técnicos"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setDocumentListModalOpen(true);
                        }}
                      >
                        <Paperclip className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white h-8 w-8 p-0"
                        title="Cargar Documentos"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setDocumentUploadModalOpen(true);
                        }}
                      >
                        <FileText className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 p-0"
                        title="Eliminar Registro"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setDeleteConfirmModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results Info Bottom */}
        <div className="p-4 text-sm text-slate-600 border-t bg-slate-50">
          <div className="flex items-center justify-between">
            <span>Total de equipos médicos registrados: 2 equipos</span>
            <span className="text-xs text-slate-500">
              Última actualización: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Enhanced Pagination Bottom */}
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50">
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
      </Card>
      {/* Modals */}
      <FilterModal open={filterModalOpen} onOpenChange={setFilterModalOpen} />
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
      />
      <DeleteConfirmModal
        open={deleteConfirmModalOpen}
        onOpenChange={setDeleteConfirmModalOpen}
        equipment={selectedEquipment}
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

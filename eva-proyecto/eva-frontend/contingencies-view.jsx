import { useState } from "react"
import {
  Search,
  Plus,
  Download,
  Filter,
  FileText,
  Calendar,
  AlertTriangle,
  Eye,
  Trash2,
  Menu,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AddContingencyModal } from "@/components/modals/add-contingency-modal"
import { DownloadAllPdfModal } from "@/components/modals/download-all-pdf-modal"
import { DownloadIndividualModal } from "@/components/modals/download-individual-modal"
import { DeleteContingencyModal } from "@/components/modals/delete-contingency-modal"

const contingenciesData = [
  {
    id: "001",
    descripcion:
      "Se requiere ecógrafo en contingencia para el servicio de Imágenes Diagnósticas debido a un daño presentado en el equipo de los ecógrafos del servicio",
    fecha: "2024-06-11",
    fechaCierre: "2024-06-19",
    archivo: "contingencia_001.pdf",
    usuarioReporta: "Karen Sofia Bustamante Villada (electromedicina@huv)",
    informacionEquipo: {
      nombre: "ECÓGRAFO DOPPLER",
      codigo: "EMCGauge",
      serie: "2024-06-11",
      marca: "SAMSUNG",
      modelo: "SONOACE R7",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "002",
    descripcion:
      "Se requiere contingencia en el servicio de sala de Imágenes Diagnósticas para ecógrafo de Doplex en contingencia, se necesita equipo de funcionamiento",
    fecha: "2024-04-19",
    fechaCierre: "2024-04-21",
    archivo: "contingencia_002.pdf",
    usuarioReporta: "Karen Sofia Bustamante Villada (electromedicina@huv)",
    informacionEquipo: {
      nombre: "ECÓGRAFO",
      codigo: "EMCGauge",
      serie: "2024-04-19",
      marca: "SAMSUNG",
      modelo: "SONOACE R7",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "003",
    descripcion: "Se requiere para cirugía FALLA incluyen un ecógrafo para el servicio de Emergencias",
    fecha: "2024-04-18",
    fechaCierre: "2024-04-18",
    archivo: "contingencia_003.pdf",
    usuarioReporta: "Karen Sofia Bustamante Villada (electromedicina@huv)",
    informacionEquipo: {
      nombre: "ECÓGRAFO",
      codigo: "EMCGauge",
      serie: "2024-04-18",
      marca: "SAMSUNG",
      modelo: "SONOACE R7",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
]

export function ContingenciesView() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [downloadAllPdfModalOpen, setDownloadAllPdfModalOpen] = useState(false)
  const [downloadIndividualModalOpen, setDownloadIndividualModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedContingency, setSelectedContingency] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleOpenPdf = (contingency) => {
    window.open(`/contingencies/${contingency.archivo}`, "_blank")
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      {/* Responsive Header */}
      <div className="mb-4 sm:mb-6">
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Contingencias</h1>
        <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
          Gestión y control de contingencias hospitalarias
        </p>
      </div>
      {/* Responsive Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
        <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
          <CardContent className="p-1">
            <div className="flex flex-col sm:flex-row gap-0.5">
              <Button
                onClick={() => setDownloadAllPdfModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center">
                <Download className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Descargar PDF</span>
              </Button>
              <Button
                onClick={() => setDownloadIndividualModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center">
                <Search className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Buscar/Excel</span>
              </Button>
              <Button
                onClick={() => setAddModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center">
                <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Agregar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Responsive Filters Section */}
        <div
          className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Panel de Control</h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-white/80 text-slate-700 border-slate-300 text-xs">
                  Sistema Activo
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden h-8 w-8 p-0"
                  onClick={() => setFiltersOpen(!filtersOpen)}>
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Collapsible Filters */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="sm:hidden">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mb-3 justify-between">
                  <span>Filtros</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <MobileFilters />
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <DesktopFilters />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div
          className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Mostrando: 1 a 3 de 3 registros</span>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-xs w-fit">
              Actualizada
            </Badge>
          </div>
        </div>

        {/* Responsive Pagination Top */}
        <div
          className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">registros por página</span>
            <span className="text-slate-700 sm:hidden">por página</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Ant
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Sig
            </Button>
          </div>
        </div>

        {/* Responsive Table/Cards */}
        <div className="block sm:hidden">
          {/* Mobile Card View */}
          <div className="space-y-3 p-3">
            {contingenciesData.map((contingency) => (
              <MobileContingencyCard
                key={contingency.id}
                contingency={contingency}
                onOpenPdf={handleOpenPdf}
                onDelete={(cont) => {
                  setSelectedContingency(cont)
                  setDeleteModalOpen(true)
                }} />
            ))}
          </div>
        </div>

        <div className="hidden sm:block">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] lg:min-w-[1200px]">
              <thead>
                <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Descripción
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Fecha
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    F. Cierre
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Archivo
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Usuario
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Equipo
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Estado
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Origen
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contingenciesData.map((contingency) => (
                  <DesktopContingencyRow
                    key={contingency.id}
                    contingency={contingency}
                    onOpenPdf={handleOpenPdf}
                    onDelete={(cont) => {
                      setSelectedContingency(cont)
                      setDeleteModalOpen(true)
                    }} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Info Bottom */}
        <div
          className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 border-t bg-slate-50">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Total: 62 registros</span>
            <span className="text-xs text-slate-500">Actualizado: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Responsive Pagination Bottom */}
        <div
          className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">registros por página</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Anterior
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
      {/* Modals */}
      <AddContingencyModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <DownloadAllPdfModal open={downloadAllPdfModalOpen} onOpenChange={setDownloadAllPdfModalOpen} />
      <DownloadIndividualModal
        open={downloadIndividualModalOpen}
        onOpenChange={setDownloadIndividualModalOpen} />
      <DeleteContingencyModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        contingency={selectedContingency} />
    </div>
  );
}

// Mobile Filters Component
function MobileFilters() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-white/80">
          <Filter className="w-3 h-3 text-teal-600" />
        </Button>
        <span className="text-xs font-medium text-slate-700">Limpiar</span>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Estado:</label>
        <Select defaultValue="TODOS">
          <SelectTrigger className="h-8 text-xs bg-white/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="ABIERTO">Abierto</SelectItem>
            <SelectItem value="CERRADO">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Buscar:</label>
        <div className="flex gap-2">
          <Input placeholder="Buscar..." className="flex-1 h-8 text-xs bg-white/80" />
          <Button size="sm" variant="outline" className="h-8 px-2 bg-white/80">
            <Search className="w-3 h-3 text-teal-600" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Desde:</label>
          <Input type="date" defaultValue="2024-04-01" className="h-8 text-xs bg-white/80" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Hasta:</label>
          <Input type="date" defaultValue="2024-06-18" className="h-8 text-xs bg-white/80" />
        </div>
      </div>
    </div>
  );
}

// Desktop Filters Component
function DesktopFilters() {
  return (
    <div className="space-y-4">
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Limpiar:</span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
            <Filter className="w-4 h-4 text-teal-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Estado:</span>
          <Select defaultValue="TODOS">
            <SelectTrigger className="w-28 lg:w-32 h-8 text-sm bg-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="ABIERTO">Abierto</SelectItem>
              <SelectItem value="CERRADO">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Buscar:</span>
          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              placeholder="Buscar contingencia..."
              className="flex-1 min-w-0 h-8 text-sm bg-white/80" />
            <Button size="sm" variant="outline" className="h-8 px-3 bg-white/80">
              <Search className="w-4 h-4 text-teal-600" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Período:</span>
          <Input
            type="date"
            defaultValue="2024-04-01"
            className="w-28 lg:w-32 h-8 text-sm bg-white/80" />
          <span className="text-slate-500">—</span>
          <Input
            type="date"
            defaultValue="2024-06-18"
            className="w-28 lg:w-32 h-8 text-sm bg-white/80" />
        </div>
      </div>
      <div className="border-t border-teal-100 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Usuario:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="karen">Karen Sofia</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Origen:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Origen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="biomedico">Biomédico</SelectItem>
                <SelectItem value="infraestructura">Infraestructura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Equipo:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ecografo">Ecógrafo</SelectItem>
                <SelectItem value="rayosx">Rayos X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Servicio:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imagenes">Imágenes</SelectItem>
                <SelectItem value="emergencias">Emergencias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Card Component
function MobileContingencyCard({ contingency, onOpenPdf, onDelete }) {
  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  #{contingency.id}
                </Badge>
                <Badge
                  className={
                    contingency.estado === "Cerrado"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                      : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
                  }>
                  {contingency.estado}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{contingency.descripcion}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white h-6 w-6 p-0"
                onClick={() => onOpenPdf(contingency)}>
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white h-6 w-6 p-0"
                onClick={() => onDelete(contingency)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-slate-700">Fecha:</span>
              <div className="text-slate-900">{new Date(contingency.fecha).toLocaleDateString("es-ES")}</div>
            </div>
            <div>
              <span className="font-medium text-slate-700">F. Cierre:</span>
              <div className="text-slate-900">{new Date(contingency.fechaCierre).toLocaleDateString("es-ES")}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium text-slate-700">Usuario:</span>
              <div className="text-slate-900 truncate">{contingency.usuarioReporta}</div>
            </div>
            <div>
              <span className="font-medium text-slate-700">Equipo:</span>
              <div className="text-slate-900">
                {contingency.informacionEquipo.nombre} - {contingency.informacionEquipo.marca}
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-700">Origen:</span>
              <div className="text-slate-900">{contingency.origenContingencia}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Desktop Row Component
function DesktopContingencyRow({ contingency, onOpenPdf, onDelete }) {
  return (
    <tr className="border-b hover:bg-slate-50/50 transition-colors">
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div
          className="text-xs lg:text-sm text-slate-700 leading-relaxed max-w-xs xl:max-w-sm line-clamp-3">
          {contingency.descripcion}
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          <div className="text-xs lg:text-sm font-medium text-slate-900">
            {new Date(contingency.fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
            })}
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-green-500" />
          <div className="text-xs lg:text-sm font-medium text-slate-900">
            {new Date(contingency.fechaCierre).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
            })}
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-red-600" />
          <div className="text-xs lg:text-sm text-slate-700">PDF</div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="text-xs lg:text-sm text-slate-700 max-w-xs truncate">{contingency.usuarioReporta}</div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="text-xs lg:text-sm space-y-1 max-w-xs">
          <div className="font-medium text-slate-900">{contingency.informacionEquipo.nombre}</div>
          <div className="text-slate-600">{contingency.informacionEquipo.marca}</div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <Badge
          className={
            contingency.estado === "Cerrado"
              ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
              : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
          }>
          {contingency.estado}
        </Badge>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-orange-500" />
          <span className="text-xs lg:text-sm text-slate-700">Biomédico</span>
        </div>
      </td>
      <td className="p-2 lg:p-3 align-top">
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-white h-6 lg:h-7 w-6 lg:w-7 p-0"
            onClick={() => onOpenPdf(contingency)}>
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white h-6 lg:h-7 w-6 lg:w-7 p-0"
            onClick={() => onDelete(contingency)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

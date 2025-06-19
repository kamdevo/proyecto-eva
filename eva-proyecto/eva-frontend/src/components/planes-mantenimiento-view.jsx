"use client"

import { useState } from "react"
import {
    Search,
    Edit,
    Download,
    HelpCircle,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
    Eye,
    Upload,
    ImageIcon,
    Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ObservacionesModal } from "@/components/modals/observaciones-modal"
import { ExportConsolidadoModal } from "@/components/modals/export-consolidado-modal"
import { ExportPlantillaModal } from "@/components/modals/export-plantilla-modal"
import { AgregarObservacionModal } from "@/components/modals/agregar-observacion-modal"
import { EditarObservacionesModal } from "@/components/modals/editar-observaciones-modal"
import { ConcluirObservacionModal } from "@/components/modals/concluir-observacion-modal"
import { VerDocumentacionModal } from "@/components/modals/ver-documentacion-modal"
import { EliminarEquipoModal } from "@/components/modals/eliminar-equipo-modal"

const equiposData = [
    {
        id: 1,
        equipo: "ACELERADOR LINEAL",
        codigo: "SIN CODIGO",
        serie: "927H30027",
        marca: "VARIAN MEDICAL SYSTEMS",
        modelo: "CLINAC IX",
        responsable: "J RESTREPO",
        rangoFecha1: "2022-06-01 | 2022-06-30",
        rangoFecha2: "2022-07-01 | 2022-07-31",
        rangoFecha3: "N/A",
        cantidadEjecutados: 4,
        cantidadProgramados: 2,
        cumplimientoGlobal: "Si cumple",
    },
    {
        id: 2,
        equipo: "AGITADOR",
        codigo: "EMC00884",
        serie: "3317MF00031",
        marca: "COLE PARMER",
        modelo: "51500-10",
        responsable: "INGENIEROS BIOMEDICOS",
        rangoFecha1: "2022-08-01 | 2022-08-31",
        rangoFecha2: "N/A",
        rangoFecha3: "N/A",
        cantidadEjecutados: 1,
        cantidadProgramados: 1,
        cumplimientoGlobal: "Si cumple",
    },
    {
        id: 3,
        equipo: "AGITADOR CON CALENTAMIENTO",
        codigo: "EMC01252",
        serie: "775969300561",
        marca: "TERMOLYNE",
        modelo: "77",
        responsable: "INGENIEROS BIOMEDICOS",
        rangoFecha1: "2022-09-01 | 2022-09-30",
        rangoFecha2: "N/A",
        rangoFecha3: "N/A",
        cantidadEjecutados: 1,
        cantidadProgramados: 1,
        cumplimientoGlobal: "Si cumple",
    },
    {
        id: 4,
        equipo: "AGITADOR DE MAZZINI",
        codigo: "EMC00847 - 206668",
        serie: "83113069",
        marca: "LAB ROTATOR",
        modelo: "DSR 2100V",
        responsable: "INGENIEROS BIOMEDICOS",
        rangoFecha1: "2022-08-01 | 2022-08-31",
        rangoFecha2: "N/A",
        rangoFecha3: "N/A",
        cantidadEjecutados: 1,
        cantidadProgramados: 1,
        cumplimientoGlobal: "Si cumple",
    },
    {
        id: 5,
        equipo: "AGITADOR DE MAZZINI",
        codigo: "K01358",
        serie: "206683",
        marca: "CHEM INDEX",
        modelo: "DSR 2100V",
        responsable: "INGENIEROS BIOMEDICOS",
        rangoFecha1: "2022-05-01 | 2022-05-31",
        rangoFecha2: "N/A",
        rangoFecha3: "N/A",
        cantidadEjecutados: 0,
        cantidadProgramados: 1,
        cumplimientoGlobal: "No cumple",
    },
]

export function PlanesMantenimientoView() {
    const [searchTerm, setSearchTerm] = useState("")
    const [entriesPerPage, setEntriesPerPage] = useState("5")
    const [selectedYear, setSelectedYear] = useState("")
    const [replaceInfo, setReplaceInfo] = useState("")
    const [dragActive, setDragActive] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [observacionesModalOpen, setObservacionesModalOpen] = useState(false)
    const [exportConsolidadoModalOpen, setExportConsolidadoModalOpen] = useState(false)
    const [exportPlantillaModalOpen, setExportPlantillaModalOpen] = useState(false)
    const [agregarObservacionModalOpen, setAgregarObservacionModalOpen] = useState(false)
    const [editarObservacionesModalOpen, setEditarObservacionesModalOpen] = useState(false)
    const [concluirObservacionModalOpen, setConcluirObservacionModalOpen] = useState(false)
    const [verDocumentacionModalOpen, setVerDocumentacionModalOpen] = useState(false)
    const [eliminarEquipoModalOpen, setEliminarEquipoModalOpen] = useState(false)
    const [selectedEquipo, setSelectedEquipo] = useState(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const files = Array.from(e.dataTransfer.files)
        setSelectedFiles((prev) => [...prev, ...files])
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles((prev) => [...prev, ...files])
    }

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const getFileIcon = (file) => {
        if (file.type.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-blue-600" />
        if (file.type.startsWith("video/")) return <Video className="w-4 h-4 text-purple-600" />
        return <Upload className="w-4 h-4 text-green-600" />
    }

    const handleAgregarObservacion = (equipo) => {
        setSelectedEquipo(equipo)
        setAgregarObservacionModalOpen(true)
    }

    const handleEditarObservaciones = (equipo) => {
        setSelectedEquipo(equipo)
        setEditarObservacionesModalOpen(true)
    }

    const handleConcluirObservacion = (equipo) => {
        setSelectedEquipo(equipo)
        setConcluirObservacionModalOpen(true)
    }

    const handleVerDocumentacion = (equipo) => {
        setSelectedEquipo(equipo)
        setVerDocumentacionModalOpen(true)
    }

    const handleEliminarEquipo = (equipo) => {
        setSelectedEquipo(equipo)
        setEliminarEquipoModalOpen(true)
    }

    const filteredEquipos = equiposData.filter(
        (equipo) =>
            equipo.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
            {/* Header Responsivo */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                            Plan de Mantenimiento Preventivo
                        </h1>
                        <p className="text-xs sm:text-sm lg:text-base text-slate-600">
                            Gestión integral de cronogramas y documentación
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Search className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar equipos..."
                            className="w-full sm:w-48 md:w-64 h-8 sm:h-9 text-xs sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Upload Section Responsivo */}
            <Card className="mb-4 sm:mb-6 shadow-lg">
                <CardHeader className="bg-blue-600 text-white p-3 sm:p-4 lg:p-6">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Ingresar Plan de Mantenimiento</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-medium">Año del cronograma</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
                                    <SelectValue placeholder="--------" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                    <SelectItem value="2022">2022</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-medium">¿Reemplazar información previa?</Label>
                            <Select value={replaceInfo} onValueChange={setReplaceInfo}>
                                <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
                                    <SelectValue placeholder="--------" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="si">Sí</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        <Label className="text-xs sm:text-sm font-medium">Archivos y Evidencias</Label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="text-slate-400 mb-3 sm:mb-4">
                                <Upload className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 mx-auto mb-2 sm:mb-3" />
                                <div className="text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Arrastra archivos aquí</div>
                                <div className="text-xs sm:text-sm">Documentos, fotos y videos de evidencia</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                            <Button variant="outline" className="w-full sm:flex-1 h-8 sm:h-9 text-xs sm:text-sm" asChild>
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    Seleccionar Archivos
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov,.avi"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </Button>
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                                📁 Explorar
                            </Button>
                        </div>

                        {/* Lista de archivos seleccionados */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">
                                    Archivos seleccionados ({selectedFiles.length})
                                </Label>
                                <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1 sm:space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white border border-slate-200 rounded-lg"
                                        >
                                            {getFileIcon(file)}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">{file.name}</div>
                                                <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50 w-6 h-6 sm:w-7 sm:h-7 p-0"
                                            >
                                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm">
                                Enviar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setObservacionesModalOpen(true)}
                                className="w-7 h-7 sm:w-8 sm:h-8 p-0 bg-slate-800 hover:bg-slate-700 border-slate-800"
                            >
                                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export Buttons Responsivos */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                <Button
                    onClick={() => setExportConsolidadoModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />📄 Exportar Consolidado
                </Button>
                <Button
                    onClick={() => setExportPlantillaModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
                >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />📄 Exportar Plantilla
                </Button>
            </div>

            {/* Table Section Responsivo */}
            <Card className="shadow-lg">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <CardTitle className="text-sm sm:text-base lg:text-lg">Cronograma de Mantenimiento</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-slate-600">Mostrar</span>
                            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                                <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs sm:text-sm text-slate-600">registros</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table - Optimizada para acciones */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-slate-500 text-white">
                                    <th className="text-left p-1.5 font-semibold min-w-[60px]">ID</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[120px]">Equipo</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[80px]">Código</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[80px]">Serie</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[100px]">Marca</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[80px]">Modelo</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[100px]">Responsable</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[120px]">Rango 1</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[120px]">Rango 2</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[120px]">Rango 3</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[80px]">Ejecutados</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[80px]">Programados</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[100px]">Cumplimiento</th>
                                    <th className="text-left p-1.5 font-semibold min-w-[140px]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipos.map((equipo) => (
                                    <tr key={equipo.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-1.5">
                                            <div className="flex items-center gap-1">
                                                <Edit className="w-3 h-3 text-blue-600 cursor-pointer" />
                                                <span className="font-medium text-xs">{equipo.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-1.5 font-medium text-xs max-w-[120px] truncate" title={equipo.equipo}>
                                            {equipo.equipo}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[80px] truncate" title={equipo.codigo}>
                                            {equipo.codigo}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[80px] truncate" title={equipo.serie}>
                                            {equipo.serie}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[100px] truncate" title={equipo.marca}>
                                            {equipo.marca}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[80px] truncate" title={equipo.modelo}>
                                            {equipo.modelo}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[100px] truncate" title={equipo.responsable}>
                                            {equipo.responsable}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[120px] truncate" title={equipo.rangoFecha1}>
                                            {equipo.rangoFecha1}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[120px] truncate" title={equipo.rangoFecha2}>
                                            {equipo.rangoFecha2}
                                        </td>
                                        <td className="p-1.5 text-slate-600 text-xs max-w-[120px] truncate" title={equipo.rangoFecha3}>
                                            {equipo.rangoFecha3}
                                        </td>
                                        <td className="p-1.5 text-center">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs px-1 py-0.5">
                                                {equipo.cantidadEjecutados}
                                            </Badge>
                                        </td>
                                        <td className="p-1.5 text-center">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs px-1 py-0.5">
                                                {equipo.cantidadProgramados}
                                            </Badge>
                                        </td>
                                        <td className="p-1.5">
                                            <div className="flex items-center gap-1">
                                                {equipo.cumplimientoGlobal === "Si cumple" ? (
                                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 text-red-600" />
                                                )}
                                                <span
                                                    className={`text-xs ${equipo.cumplimientoGlobal === "Si cumple" ? "text-green-700" : "text-red-700"
                                                        }`}
                                                >
                                                    {equipo.cumplimientoGlobal === "Si cumple" ? "Sí" : "No"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-1.5">
                                            <div className="flex items-center gap-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAgregarObservacion(equipo)}
                                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-6 h-6 p-0"
                                                    title="Agregar observación"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditarObservaciones(equipo)}
                                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 w-6 h-6 p-0"
                                                    title="Editar observaciones"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleConcluirObservacion(equipo)}
                                                    className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 w-6 h-6 p-0"
                                                    title="Concluir observación"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleVerDocumentacion(equipo)}
                                                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 w-6 h-6 p-0"
                                                    title="Ver documentación"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEliminarEquipo(equipo)}
                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 w-6 h-6 p-0"
                                                    title="Eliminar"
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

                    {/* Tablet Table - Columnas reducidas */}
                    <div className="hidden md:block xl:hidden overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-slate-500 text-white">
                                    <th className="text-left p-2 font-semibold">ID/Equipo</th>
                                    <th className="text-left p-2 font-semibold">Detalles</th>
                                    <th className="text-left p-2 font-semibold">Responsable</th>
                                    <th className="text-left p-2 font-semibold">Estado</th>
                                    <th className="text-left p-2 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEquipos.map((equipo) => (
                                    <tr key={equipo.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    <Edit className="w-3 h-3 text-blue-600" />
                                                    <span className="font-medium text-xs">#{equipo.id}</span>
                                                </div>
                                                <div
                                                    className="font-medium text-xs text-slate-900 max-w-[150px] truncate"
                                                    title={equipo.equipo}
                                                >
                                                    {equipo.equipo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div className="space-y-1 text-xs text-slate-600">
                                                <div className="max-w-[120px] truncate" title={equipo.codigo}>
                                                    Código: {equipo.codigo}
                                                </div>
                                                <div className="max-w-[120px] truncate" title={equipo.marca}>
                                                    Marca: {equipo.marca}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2 text-xs text-slate-600 max-w-[100px] truncate" title={equipo.responsable}>
                                            {equipo.responsable}
                                        </td>
                                        <td className="p-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1">
                                                    {equipo.cumplimientoGlobal === "Si cumple" ? (
                                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 text-red-600" />
                                                    )}
                                                    <span
                                                        className={`text-xs ${equipo.cumplimientoGlobal === "Si cumple" ? "text-green-700" : "text-red-700"}`}
                                                    >
                                                        {equipo.cumplimientoGlobal === "Si cumple" ? "Cumple" : "No cumple"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs px-1 py-0.5">
                                                        E: {equipo.cantidadEjecutados}
                                                    </Badge>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 text-xs px-1 py-0.5">
                                                        P: {equipo.cantidadProgramados}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-0.5">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAgregarObservacion(equipo)}
                                                    className="text-blue-600 hover:bg-blue-50 w-6 h-6 p-0"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditarObservaciones(equipo)}
                                                    className="text-green-600 hover:bg-green-50 w-6 h-6 p-0"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleVerDocumentacion(equipo)}
                                                    className="text-orange-600 hover:bg-orange-50 w-6 h-6 p-0"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEliminarEquipo(equipo)}
                                                    className="text-red-600 hover:bg-red-50 w-6 h-6 p-0"
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

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3 p-3">
                        {filteredEquipos.map((equipo) => (
                            <Card key={equipo.id} className="border border-slate-200">
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Edit className="w-3 h-3 text-blue-600" />
                                                <Badge variant="outline" className="text-xs px-1 py-0.5">
                                                    #{equipo.id}
                                                </Badge>
                                            </div>
                                            <h3 className="font-medium text-slate-900 text-sm leading-tight mb-1">{equipo.equipo}</h3>
                                            <p className="text-xs text-slate-600">
                                                {equipo.marca} - {equipo.modelo}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {equipo.cumplimientoGlobal === "Si cumple" ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        <div>
                                            <span className="font-medium text-slate-700">Código:</span>
                                            <div className="text-slate-900 truncate" title={equipo.codigo}>
                                                {equipo.codigo}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-700">Serie:</span>
                                            <div className="text-slate-900 truncate" title={equipo.serie}>
                                                {equipo.serie}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-700">Ejecutados:</span>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs px-1 py-0.5">
                                                {equipo.cantidadEjecutados}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-700">Programados:</span>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs px-1 py-0.5">
                                                {equipo.cantidadProgramados}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAgregarObservacion(equipo)}
                                                className="text-blue-600 hover:bg-blue-50 w-7 h-7 p-0"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditarObservaciones(equipo)}
                                                className="text-green-600 hover:bg-green-50 w-7 h-7 p-0"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleConcluirObservacion(equipo)}
                                                className="text-purple-600 hover:bg-purple-50 w-7 h-7 p-0"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleVerDocumentacion(equipo)}
                                                className="text-orange-600 hover:bg-orange-50 w-7 h-7 p-0"
                                            >
                                                <Eye className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEliminarEquipo(equipo)}
                                                className="text-red-600 hover:bg-red-50 w-7 h-7 p-0"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination Responsivo */}
                    <div className="p-3 sm:p-4 border-t bg-slate-50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="text-xs sm:text-sm text-slate-600">
                                Mostrando {Math.min(Number.parseInt(entriesPerPage), filteredEquipos.length)} de{" "}
                                {filteredEquipos.length} registros
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
                                    Anterior
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                                >
                                    1
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
                                    2
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modales */}
            <ObservacionesModal open={observacionesModalOpen} onOpenChange={setObservacionesModalOpen} />
            <ExportConsolidadoModal
                open={exportConsolidadoModalOpen}
                onOpenChange={setExportConsolidadoModalOpen}
                equipos={filteredEquipos}
            />
            <ExportPlantillaModal open={exportPlantillaModalOpen} onOpenChange={setExportPlantillaModalOpen} />
            <AgregarObservacionModal
                open={agregarObservacionModalOpen}
                onOpenChange={setAgregarObservacionModalOpen}
                equipo={selectedEquipo}
            />
            <EditarObservacionesModal
                open={editarObservacionesModalOpen}
                onOpenChange={setEditarObservacionesModalOpen}
                equipo={selectedEquipo}
            />
            <ConcluirObservacionModal
                open={concluirObservacionModalOpen}
                onOpenChange={setConcluirObservacionModalOpen}
                equipo={selectedEquipo}
            />
            <VerDocumentacionModal
                open={verDocumentacionModalOpen}
                onOpenChange={setVerDocumentacionModalOpen}
                equipo={selectedEquipo}
            />
            <EliminarEquipoModal
                open={eliminarEquipoModalOpen}
                onOpenChange={setEliminarEquipoModalOpen}
                equipo={selectedEquipo}
            />
        </div>
    )
}

"use client";

import { useState, useEffect } from "react";
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ObservacionesModal } from "@/components/modals/observaciones-modal";
import { ExportConsolidadoModal } from "@/components/modals/export-consolidado-modal";
// import { ExportPlantillaModal } from "@/components/modals/export-plantilla-modal"; // Modal removido - ahora descarga directa
import { AgregarObservacionModal } from "@/components/modals/agregar-observacion-modal";
import { EditarObservacionesModal } from "@/components/modals/editar-observaciones-modal";
import { ConcluirObservacionModal } from "@/components/modals/concluir-observacion-modal";
import { VerDocumentacionModal } from "@/components/modals/ver-documentacion-modal";
import { EliminarEquipoModal } from "@/components/modals/eliminar-equipo-modal";
import { HistorialCambiosModal } from "@/components/modals/historial-cambios-modal";
import { EditarPlanModal } from "@/components/modals/editar-plan-modal";
import { useMantenimientoData } from "@/hooks/useMantenimientoData";
import Pagination from "@/components/common/Pagination";

export function PlanesMantenimientoView() {
  // Hook para manejar datos de mantenimiento
  const {
    planesData,
    proveedoresData,
    equiposData,
    pagination,
    loading: dataLoading,
    error: dataError,
    loadPlanes,
    loadProveedores,
    loadEquipos,
    uploadExcel,
    downloadTemplate, // Agregada función para descarga directa de plantilla
    clearError: clearDataError
  } = useMantenimientoData();

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState("10");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // Año para filtrar tabla
  
  // Generar años dinámicamente para el selector de subir Excel: año actual - 2 hasta año actual + 3
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2;
    const endYear = currentYear + 3;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years;
  };
  
  const availableYears = generateYears();
  const currentYear = new Date().getFullYear().toString();
  
  // Generar años dinámicamente para el selector de filtrar tabla: de 2020 hasta año actual + 3
  const generateFilterYears = () => {
    const startYear = 2020;
    const endYear = parseInt(currentYear) + 3;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years.sort((a, b) => b - a); // De más reciente a más antiguo
  };
  const filterYears = generateFilterYears();
  
  const [uploadYear, setUploadYear] = useState(currentYear); // Año NUEVO para subir cronograma (dinámico)
  
  // Estados de ordenamiento
  const [sortField, setSortField] = useState('equipo_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [replaceInfo, setReplaceInfo] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [observacionesModalOpen, setObservacionesModalOpen] = useState(false);
  const [exportConsolidadoModalOpen, setExportConsolidadoModalOpen] =
    useState(false);
  // const [exportPlantillaModalOpen, setExportPlantillaModalOpen] = useState(false); // Removido - ahora descarga directa
  const [agregarObservacionModalOpen, setAgregarObservacionModalOpen] =
    useState(false);
  const [editarObservacionesModalOpen, setEditarObservacionesModalOpen] =
    useState(false);
  const [concluirObservacionModalOpen, setConcluirObservacionModalOpen] =
    useState(false);
  const [verDocumentacionModalOpen, setVerDocumentacionModalOpen] =
    useState(false);
  const [eliminarEquipoModalOpen, setEliminarEquipoModalOpen] = useState(false);
  const [historialCambiosModalOpen, setHistorialCambiosModalOpen] = useState(false);
  const [editarPlanModalOpen, setEditarPlanModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Estados de validación y errores
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      await loadPlanes({ 
        anio: selectedYear, 
        per_page: entriesPerPage,
        sort_by: sortField,
        sort_direction: sortDirection
      });
      await loadProveedores({ status: 1 });
      await loadEquipos();
    };
    
    loadInitialData();
  }, [selectedYear, entriesPerPage, sortField, sortDirection, loadPlanes, loadProveedores, loadEquipos]);

  // Función para limpiar mensajes después de un tiempo
  const clearMessages = () => {
    setTimeout(() => {
      setSuccessMessage("");
      setAlertMessage("");
    }, 5000);
  };

  // Función para validar archivos subidos
  const validateFiles = (files) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setErrors({ fileUpload: 'Solo se permiten archivos Excel (.xlsx, .xls) y CSV' });
        setAlertMessage('Error: Formato de archivo no válido');
        clearMessages();
        return false;
      }
      if (file.size > maxSize) {
        setErrors({ fileUpload: 'El archivo excede el tamaño máximo de 10MB' });
        setAlertMessage('Error: Archivo demasiado grande');
        clearMessages();
        return false;
      }
    }
    return true;
  };

  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para obtener icono de ordenamiento
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-white" />
      : <ArrowDown className="w-3 h-3 text-white" />;
  };

  // Los datos ya vienen ordenados del backend, no es necesario ordenar localmente
  const sortedPlanes = planesData;

  // Función para validar formularios (solo para subir Excel)
  const validateForm = (formData) => {
    const newErrors = {};
    
    if (!formData.year || formData.year === "") {
      newErrors.year = "El año es obligatorio";
    }
    
    if (!formData.replaceInfo || formData.replaceInfo === "") {
      newErrors.replaceInfo = "Debe especificar si reemplazar información";
    }
    
    // NO validar entriesPerPage - ese campo es solo para paginación de la tabla
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para procesar upload de Excel
  const handleExcelUpload = async () => {
    // Validar datos antes del upload
    const formData = {
      year: uploadYear,
      replaceInfo: replaceInfo,
      files: selectedFiles
    };
    
    if (!validateForm(formData)) {
      setAlertMessage('Por favor complete todos los campos requeridos');
      clearMessages();
      return;
    }
    
    if (selectedFiles.length === 0) {
      setErrors({ fileUpload: 'Debe seleccionar al menos un archivo' });
      setAlertMessage('Error: No se han seleccionado archivos');
      clearMessages();
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await uploadExcel(
        selectedFiles[0], 
        uploadYear, 
        replaceInfo === 'si'
      );
      
      if (result.success) {
        setSuccessMessage(result.message);
        setSelectedFiles([]);
        setErrors({});
        
        // Recargar datos del año seleccionado
        await loadPlanes({ anio: selectedYear, per_page: entriesPerPage });
        
      } else {
        setErrors({ submit: result.message });
        setAlertMessage('Error: ' + result.message);
      }
      
    } catch (error) {
      console.error('Excel upload error:', error);
      setErrors({ submit: 'Error de conexión al procesar archivo' });
      setAlertMessage('Error: No se pudo procesar el archivo');
    } finally {
      setIsLoading(false);
      clearMessages();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    
    if (validateFiles(files)) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setSuccessMessage('Archivos cargados exitosamente');
      setErrors({});
      clearMessages();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (validateFiles(files)) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setSuccessMessage('Archivos seleccionados exitosamente');
      setErrors({});
      clearMessages();
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="w-4 h-4 text-[#1d293d]" />;
    if (file.type.startsWith("video/"))
      return <Video className="w-4 h-4 text-purple-600" />;
    return <Upload className="w-4 h-4 text-green-600" />;
  };

  const handleAgregarObservacion = (equipo) => {
    setSelectedEquipo(equipo);
    setAgregarObservacionModalOpen(true);
  };

  const handleEditarObservaciones = (equipo) => {
    setSelectedEquipo(equipo);
    setEditarObservacionesModalOpen(true);
  };

  const handleConcluirObservacion = (equipo) => {
    setSelectedEquipo(equipo);
    setConcluirObservacionModalOpen(true);
  };

  const handleEditarPlan = (plan) => {
    setSelectedPlan(plan);
    setEditarPlanModalOpen(true);
  };

  const handlePlanEditSuccess = async () => {
    // Recargar datos después de editar
    await loadPlanes({ 
      anio: selectedYear, 
      per_page: entriesPerPage,
      sort_by: sortField,
      sort_direction: sortDirection
    });
    setSuccessMessage("Plan actualizado exitosamente");
    clearMessages();
  };

  const handleVerDocumentacion = (equipo) => {
    setSelectedEquipo(equipo);
    setVerDocumentacionModalOpen(true);
  };

  const handleVerHistorial = (plan) => {
    setSelectedPlanId(plan.id);
    setHistorialCambiosModalOpen(true);
  };

  const handleEliminarEquipo = (equipo) => {
    setSelectedEquipo(equipo);
    setEliminarEquipoModalOpen(true);
  };

  // Manejar cambios en filtros que requieren recarga de datos
  const handleYearChange = async (newYear) => {
    setSelectedYear(newYear);
    if (errors.year) {
      setErrors(prev => ({ ...prev, year: '' }));
    }
    // Recargar datos con nuevo año
    await loadPlanes({ anio: newYear, per_page: entriesPerPage, search: searchTerm });
  };

  const handleEntriesPerPageChange = async (newValue) => {
    setEntriesPerPage(newValue);
    if (errors.entriesPerPage) {
      setErrors(prev => ({ ...prev, entriesPerPage: '' }));
    }
    // Recargar datos con nueva paginación
    await loadPlanes({ anio: selectedYear, per_page: newValue, search: searchTerm });
  };

  const handleSearchChange = async (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    // Recargar datos con nuevo término de búsqueda
    await loadPlanes({ anio: selectedYear, per_page: entriesPerPage, search: newSearchTerm });
  };

  const handlePageChange = async (newPage) => {
    // Recargar datos con nueva página
    await loadPlanes({ anio: selectedYear, per_page: entriesPerPage, search: searchTerm, page: newPage });
  };

  // Manejar descarga directa de plantilla
  const handleDownloadTemplate = async () => {
    try {
      console.log("📄 Descargando plantilla de mantenimiento...");
      const result = await downloadTemplate();
      
      if (result.success) {
        console.log("✅ Plantilla descargada exitosamente");
      } else {
        console.error("❌ Error al descargar plantilla:", result.message);
      }
    } catch (error) {
      console.error("❌ Error durante descarga de plantilla:", error);
    }
  };

  // Datos filtrados localmente para búsqueda instantánea (usando nuevos campos)
  const filteredPlanes = planesData.filter(
    (plan) =>
      (plan.equipo_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.equipo_codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.responsable || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.equipo_serie || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.equipo_marca || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar estado de carga combinado
  const isLoadingData = dataLoading || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F4F6] to-[#1d293d]/5 p-2 sm:p-4 lg:p-6">
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
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mensajes de Estado */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{successMessage}</span>
        </div>
      )}

      {(alertMessage || dataError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          <span className="text-sm">{alertMessage || dataError}</span>
        </div>
      )}

      {isLoadingData && (
        <div className="mb-4 space-y-3">
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="h-6 bg-[#1d293d]/10 rounded w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Section Responsivo */}
      <Card className="mb-4 sm:mb-6 shadow-lg">
        <CardHeader className="bg-[#1d293d] text-white p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            Ingresar Plan de Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Año del cronograma
              </Label>
              <Select 
                value={uploadYear} 
                onValueChange={(value) => {
                  setUploadYear(value);
                  if (errors.year) {
                    setErrors(prev => ({ ...prev, year: '' }));
                  }
                }}
              >
                <SelectTrigger className={`h-8 sm:h-9 lg:h-10 text-xs sm:text-sm ${
                  errors.year ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}{year === currentYear ? ' (Actual)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.year && (
                <div className="text-red-500 text-xs flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.year}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                ¿Reemplazar información previa?
              </Label>
              <Select 
                value={replaceInfo} 
                onValueChange={(value) => {
                  setReplaceInfo(value);
                  // Limpiar error cuando se selecciona un valor
                  if (errors.replaceInfo) {
                    setErrors(prev => ({ ...prev, replaceInfo: '' }));
                  }
                }}
              >
                <SelectTrigger className={`h-8 sm:h-9 lg:h-10 text-xs sm:text-sm ${
                  errors.replaceInfo ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="--------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="si">Sí</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.replaceInfo && (
                <div className="text-red-500 text-xs flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.replaceInfo}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <Label className="text-xs sm:text-sm font-medium">
              Archivos y Evidencias
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-colors ${
                dragActive
                  ? "border-[#1d293d] bg-[#1d293d]/5"
                  : errors.fileUpload
                  ? "border-red-400 bg-red-50"
                  : "border-slate-300 bg-slate-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-slate-400 mb-3 sm:mb-4">
                <Upload className="w-6 sm:w-8 lg:w-10 h-6 sm:h-8 lg:h-10 mx-auto mb-2 sm:mb-3" />
                <div className="text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                  Arrastra archivos aquí
                </div>
                <div className="text-xs sm:text-sm">
                  Documentos Excel (.xlsx, .xls) y CSV (máx. 10MB por archivo)
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                className="w-full sm:flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                asChild
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  Seleccionar Archivos
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </Button>
              <Button 
                onClick={handleExcelUpload}
                disabled={isLoading || selectedFiles.length === 0 || !selectedYear || !replaceInfo}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
              >
                {isLoading ? 'Procesando...' : '📤 Subir Excel'}
              </Button>
              <Button className="w-full sm:w-auto bg-[#1d293d] hover:bg-[#2a3b52] text-white h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                📁 Explorar
              </Button>
            </div>
            
            {/* Error de validación de archivos */}
            {errors.fileUpload && (
              <div className="text-red-500 text-xs flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.fileUpload}
              </div>
            )}

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
                        <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
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
              {/* <Button
                variant="outline"
                size="sm"
                className="h-7 sm:h-8 text-xs sm:text-sm"
              >
                Enviar
              </Button> */}
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

      {/* Selector de Año (ORIGINAL) y Botones de Exportar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Selector de Año ORIGINAL para filtrar tabla */}
        <div className="flex items-center gap-2">
          <Label className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
            Año:
          </Label>
          <Select 
            value={selectedYear} 
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-24 sm:w-28 h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Botones de Exportar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => setExportConsolidadoModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            📄 Exportar Consolidado
          </Button>
          <Button
            onClick={handleDownloadTemplate}
            disabled={dataLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            📄 Exportar Plantilla
            {dataLoading && <span className="ml-1">...</span>}
          </Button>
        </div>
      </div>

      {/* Table Section Responsivo */}
      <Card className="shadow-lg">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="text-sm sm:text-base lg:text-lg">
              Cronograma de Mantenimiento
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-slate-600">Mostrar</span>
              <Select 
                value={entriesPerPage} 
                onValueChange={handleEntriesPerPageChange}
              >
                <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs sm:text-sm text-slate-600">
                registros
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table - Optimizada para acciones */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-500 text-white">
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    Acciones
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[80px]">
                    <button 
                      onClick={() => handleSort('equipo_id')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      ID Equipo
                      {getSortIcon('equipo_id')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[150px]">
                    <button 
                      onClick={() => handleSort('equipo_nombre')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      Equipo
                      {getSortIcon('equipo_nombre')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    <button 
                      onClick={() => handleSort('equipo_codigo')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      Código
                      {getSortIcon('equipo_codigo')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    <button 
                      onClick={() => handleSort('equipo_serie')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      Serie
                      {getSortIcon('equipo_serie')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    <button 
                      onClick={() => handleSort('equipo_marca')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      Marca
                      {getSortIcon('equipo_marca')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    <button 
                      onClick={() => handleSort('equipo_modelo')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      Modelo
                      {getSortIcon('equipo_modelo')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[120px]">
                    <button 
                      onClick={() => handleSort('responsable')}
                      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      Responsable
                      {getSortIcon('responsable')}
                    </button>
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[150px]">
                    Rango Programado 1
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[150px]">
                    Rango Programado 2
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[150px]">
                    Rango Programado 3
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    Ejecutados
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[100px]">
                    Programados
                  </th>
                  <th className="text-left p-1.5 font-semibold min-w-[120px]">
                    Cumplimiento Global
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlanes.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b hover:bg-slate-50 transition-colors"
                  >
                    {/* Columna 1: Acciones */}
                    <td className="p-1.5">
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarPlan(plan)}
                          className="text-[#1d293d] hover:text-[#2a3b52] hover:bg-[#1d293d]/5 w-6 h-6 p-0"
                          title="Editar plan"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {plan.cuenta_cambios > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerHistorial(plan)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 w-6 h-6 p-0"
                            title="Ver historial de cambios"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    
                    {/* Columna 2: ID Equipo */}
                    <td className="p-1.5 font-medium text-xs" title={`ID Equipo: ${plan.equipo_id}`}>
                      {plan.equipo_id}
                    </td>
                    
                    {/* Columna 3: Equipo */}
                    <td className="p-1.5 font-medium text-xs max-w-[150px] truncate" title={plan.equipo_nombre}>
                      {plan.equipo_nombre}
                    </td>
                    
                    {/* Columna 4: Código */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[100px] truncate" title={plan.equipo_codigo}>
                      {plan.equipo_codigo}
                    </td>
                    
                    {/* Columna 5: Serie */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[100px] truncate" title={plan.equipo_serie}>
                      {plan.equipo_serie}
                    </td>
                    
                    {/* Columna 6: Marca */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[100px] truncate" title={plan.equipo_marca}>
                      {plan.equipo_marca}
                    </td>
                    
                    {/* Columna 7: Modelo */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[100px] truncate" title={plan.equipo_modelo}>
                      {plan.equipo_modelo}
                    </td>
                    
                    {/* Columna 8: Responsable */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[120px] truncate" title={plan.responsable}>
                      {plan.responsable}
                    </td>
                    
                    {/* Columna 9: Rango Programado 1 */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[150px] truncate" title={plan.rango_programado_1}>
                      {plan.rango_programado_1}
                    </td>
                    
                    {/* Columna 10: Rango Programado 2 */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[150px] truncate" title={plan.rango_programado_2}>
                      {plan.rango_programado_2}
                    </td>
                    
                    {/* Columna 11: Rango Programado 3 */}
                    <td className="p-1.5 text-slate-600 text-xs max-w-[150px] truncate" title={plan.rango_programado_3}>
                      {plan.rango_programado_3}
                    </td>
                    
                    {/* Columna 12: Cantidad Ejecutados */}
                    <td className="p-1.5 text-center">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 text-xs px-2 py-0.5"
                      >
                        {plan.cantidad_ejecutados}
                      </Badge>
                    </td>
                    
                    {/* Columna 13: Cantidad Programados */}
                    <td className="p-1.5 text-center">
                      <Badge
                        variant="outline"
                        className="bg-[#1d293d]/5 text-[#1d293d] text-xs px-2 py-0.5"
                      >
                        {plan.cantidad_programados}
                      </Badge>
                    </td>
                    
                    {/* Columna 14: Cumplimiento Global */}
                    <td className="p-1.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${
                          plan.estado_cumplimiento === 'COMPLETO' 
                            ? 'bg-green-50 text-green-700' 
                            : plan.estado_cumplimiento === 'ALTO'
                            ? 'bg-[#1d293d]/5 text-[#1d293d]'
                            : plan.estado_cumplimiento === 'MEDIO'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {plan.cumplimiento_porcentaje}
                      </Badge>
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
                {filteredPlanes.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Edit className="w-3 h-3 text-[#1d293d]" />
                          <span className="font-medium text-xs">
                            #{plan.equipo_id}
                          </span>
                        </div>
                        <div
                          className="font-medium text-xs text-slate-900 max-w-[150px] truncate"
                          title={plan.equipo_nombre}
                        >
                          {plan.equipo_nombre}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="space-y-1 text-xs text-slate-600">
                        <div
                          className="max-w-[120px] truncate"
                          title={plan.equipo_codigo}
                        >
                          Código: {plan.equipo_codigo}
                        </div>
                        <div
                          className="max-w-[120px] truncate"
                          title={plan.equipo_marca}
                        >
                          Marca: {plan.equipo_marca}
                        </div>
                      </div>
                    </td>
                    <td
                      className="p-2 text-xs text-slate-600 max-w-[100px] truncate"
                      title={plan.responsable}
                    >
                      {plan.responsable}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${
                          plan.estado_cumplimiento === 'COMPLETO' 
                            ? 'bg-green-50 text-green-700' 
                            : plan.estado_cumplimiento === 'ALTO'
                            ? 'bg-[#1d293d]/5 text-[#1d293d]'
                            : plan.estado_cumplimiento === 'MEDIO'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {plan.cumplimiento_porcentaje}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarPlan(plan)}
                          className="text-[#1d293d] hover:bg-[#1d293d]/5 w-6 h-6 p-0"
                          title="Editar plan"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {plan.cuenta_cambios > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerHistorial(plan)}
                            className="text-green-600 hover:bg-green-50 w-6 h-6 p-0"
                            title="Ver historial de cambios"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 p-3">
            {filteredPlanes.map((plan) => (
              <Card key={plan.id} className="border border-slate-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Edit className="w-3 h-3 text-blue-600" />
                        <Badge
                          variant="outline"
                          className="text-xs px-1 py-0.5"
                        >
                          #{plan.equipo_id}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm leading-tight mb-1">
                        {plan.equipo_nombre}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Código: {plan.equipo_codigo}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${
                          plan.estado_cumplimiento === 'COMPLETO' 
                            ? 'bg-green-50 text-green-700' 
                            : plan.estado_cumplimiento === 'ALTO'
                            ? 'bg-[#1d293d]/5 text-[#1d293d]'
                            : plan.estado_cumplimiento === 'MEDIO'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {plan.cumplimiento_porcentaje}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="font-medium text-slate-700">Serie:</span>
                      <div className="text-slate-900 truncate" title={plan.equipo_serie}>
                        {plan.equipo_serie}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Marca:</span>
                      <div className="text-slate-900 truncate" title={plan.equipo_marca}>
                        {plan.equipo_marca}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Modelo:</span>
                      <div className="text-slate-900 truncate" title={plan.equipo_modelo}>
                        {plan.equipo_modelo}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Responsable:</span>
                      <div className="text-slate-900 truncate" title={plan.responsable}>
                        {plan.responsable}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Ejecutados:</span>
                      <div className="text-slate-900">{plan.cantidad_ejecutados}</div>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Programados:</span>
                      <div className="text-slate-900">{plan.cantidad_programados}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-slate-600">
                      Estado: {plan.estado_cumplimiento}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarPlan(plan)}
                        className="text-[#1d293d] hover:bg-[#1d293d]/5 w-7 h-7 p-0"
                        title="Editar plan"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {plan.cuenta_cambios > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerHistorial(plan)}
                          className="text-green-600 hover:bg-green-50 w-7 h-7 p-0"
                          title="Ver historial de cambios"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="p-3 sm:p-4 border-t bg-slate-50">
            <Pagination
              currentPage={pagination?.current_page || 1}
              totalPages={pagination?.last_page || 1}
              totalItems={pagination?.total || 0}
              itemsPerPage={pagination?.per_page || parseInt(entriesPerPage)}
              onPageChange={handlePageChange}
              showInfo={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <ObservacionesModal
        open={observacionesModalOpen}
        onOpenChange={setObservacionesModalOpen}
      />
      <ExportConsolidadoModal
        open={exportConsolidadoModalOpen}
        onOpenChange={setExportConsolidadoModalOpen}
        equipos={filteredPlanes}
      />
      {/* Modal de exportar plantilla removido - ahora es descarga directa */}
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
      <HistorialCambiosModal
        open={historialCambiosModalOpen}
        onOpenChange={setHistorialCambiosModalOpen}
        planId={selectedPlanId}
      />
      <EditarPlanModal
        open={editarPlanModalOpen}
        onOpenChange={setEditarPlanModalOpen}
        plan={selectedPlan}
        proveedores={proveedoresData}
        onSuccess={handlePlanEditSuccess}
      />
    </div>
  );
}

export default PlanesMantenimientoView;

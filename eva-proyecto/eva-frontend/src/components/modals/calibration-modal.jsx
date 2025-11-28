"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  FileText, 
  Download,
  Calendar,
  Filter,
  X,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import httpService from "@/services/httpService";
import { toast } from "sonner";

export function CalibrationModal({ open, onOpenChange, equipoId = null }) {
  const {  hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [calibraciones, setCalibraciones] = useState([]);
  const [filteredCalibraciones, setFilteredCalibraciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalRecords] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedCalibration, setSelectedCalibration] = useState(null);
  const [error, setError] = useState(null);
  const itemsPerPage = 15;

  // Form data for add/edit
  const [formData, setFormData] = useState({
    codigo: '',
    fecha_calibracion: '',
    fecha_programada: '',
    observaciones: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load calibrations data with server-side pagination
  const loadCalibraciones = useCallback(async (page = 1, search = '', filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        per_page: itemsPerPage,
        search,
        ...filters,
        ...(equipoId && { equipo_id: equipoId })
      };

      console.log('Loading calibrations with params:', params);
      console.log('🔍 Date filters being sent:', { 
        fecha_desde: params.fecha_desde, 
        fecha_hasta: params.fecha_hasta 
      });
      const response = await httpService.get('/v1/calibracion', { params });
      
      if (response.data && response.data.success) {
        const apiData = response.data.data;
        
        if (apiData && typeof apiData === 'object' && Array.isArray(apiData.data)) {
          // Paginated response structure from Laravel
          setCalibraciones(apiData.data);
          setFilteredCalibraciones(apiData.data); // Set filtered data same as main data for server-side pagination
          setTotalRecords(apiData.total || 0);
          setCurrentPage(apiData.current_page || 1);
          setTotalPages(apiData.last_page || 1);
        } else if (Array.isArray(apiData)) {
          // Direct array response (fallback)
          setCalibraciones(apiData);
          setFilteredCalibraciones(apiData);
          setTotalRecords(apiData.length);
          setCurrentPage(1);
          setTotalPages(Math.ceil(apiData.length / itemsPerPage));
        } else {
          console.warn('Unexpected API response structure:', apiData);
          setCalibraciones([]);
          setFilteredCalibraciones([]);
          setTotalRecords(0);
        }
      } else {
        console.warn('API response not successful:', response.data);
        setCalibraciones([]);
        setFilteredCalibraciones([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Error loading calibrations:', err);
      setError('Error al cargar las calibraciones: ' + err.message);
      setCalibraciones([]);
      setFilteredCalibraciones([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [equipoId, itemsPerPage]);

  // Apply filters with server-side pagination
  const applyFilters = useCallback(() => {
    const filters = {};
    
    // Build date filters for API
    if (dateFromFilter) {
      filters.fecha_desde = dateFromFilter;
    }
    if (dateToFilter) {
      filters.fecha_hasta = dateToFilter;
    }

    // Reload data with filters
    loadCalibraciones(1, searchTerm, filters);
    setCurrentPage(1);
  }, [searchTerm, dateFromFilter, dateToFilter, loadCalibraciones]);

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadCalibraciones(1, '');
    }
  }, [open, equipoId, loadCalibraciones]);

  // Apply filters when filter values change
  useEffect(() => {
    if (open) {
      applyFilters();
    }
  }, [searchTerm, dateFromFilter, dateToFilter, open, applyFilters]);

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle date from filter change
  const handleDateFromFilter = (value) => {
    setDateFromFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle date to filter change
  const handleDateToFilter = (value) => {
    setDateToFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Get current page data (server-side pagination)
  const getCurrentPageData = () => {
    return filteredCalibraciones; // Data is already paginated from server
  };

  // Handle page change with server reload
  const handlePageChange = (page) => {
    const filters = {};
    
    // Handle date filters
    if (dateFromFilter) {
      filters.fecha_desde = dateFromFilter;
    }
    if (dateToFilter) {
      filters.fecha_hasta = dateToFilter;
    }
    
    loadCalibraciones(page, searchTerm, filters);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else {
      setError('El archivo debe ser menor a 10MB');
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.fecha_calibracion) {
      setError('Código y fecha de calibración son requeridos');
      return;
    }

    const toastId = 'save-calibration';
    try {
      setLoading(true);
      setError(null);
      toast.loading(viewMode === 'edit' ? 'Actualizando calibración...' : 'Registrando calibración...', { id: toastId });

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      if (equipoId) {
        submitData.append('equipo_id', equipoId);
      }
      
      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      if (viewMode === 'edit' && selectedCalibration) {
        await httpService.put(`/v1/calibracion/${selectedCalibration.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Calibración actualizada exitosamente', { id: toastId });
      } else {
        await httpService.post('/v1/calibracion', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Calibración registrada exitosamente', { id: toastId });
      }

      // Reset form and reload data
      setFormData({
        codigo: '',
        fecha_calibracion: '',
        fecha_programada: '',
        observaciones: ''
      });
      setSelectedFile(null);
      setViewMode('list');
      loadCalibraciones(currentPage, searchTerm);
    } catch (err) {
      console.error('Error saving calibration:', err);
      setError('Error al guardar la calibración');
      toast.error('Error al guardar la calibración', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Handle document view
  const handleViewDocument = (fileName) => {
    if (!fileName) return;
    
    // Usar la URL del backend para acceder a los archivos
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001";
    const documentUrl = `${API_BASE_URL}/storage/calibraciones/${fileName}`;
    
    console.log('🔍 Abriendo documento:', documentUrl);
    
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      console.error('No se pudo abrir el documento.');
    }
  };

  // Export to Excel
  const handleExport = async () => {
    const toastId = 'export-calibraciones';
    try {
      setLoading(true);
      toast.loading('Exportando calibraciones...', { id: toastId });
      
      const response = await httpService.get('/v1/export/calibraciones', {
        responseType: 'blob',
        params: { ...(equipoId && { equipo_id: equipoId }) }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'CalibracionesEB.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Calibraciones exportadas exitosamente', { id: toastId });
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Error al exportar las calibraciones');
      toast.error('Error al exportar las calibraciones', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Render add/edit form
  const renderForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {viewMode === 'edit' ? 'Editar Calibración' : 'Agregar Calibración'}
        </h3>
        <Button variant="outline" onClick={() => setViewMode('list')}>
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="codigo">Código de Calibración *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={(e) => handleInputChange('codigo', e.target.value)}
              placeholder="Ej: CAL0001"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fecha_calibracion">Fecha de Ejecución *</Label>
            <Input
              id="fecha_calibracion"
              type="date"
              value={formData.fecha_calibracion}
              onChange={(e) => handleInputChange('fecha_calibracion', e.target.value)}
              min="2015-01-01"
              max={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fecha_programada">Fecha Programada</Label>
            <Input
              id="fecha_programada"
              type="date"
              value={formData.fecha_programada}
              onChange={(e) => handleInputChange('fecha_programada', e.target.value)}
              min="2015-01-01"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Observaciones adicionales"
            rows={3}
          />
        </div>

        {/* File upload */}
        <div>
          <Label>Archivo Asociado</Label>
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
              </p>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setViewMode('list')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : (viewMode === 'edit' ? 'Actualizar' : 'Guardar')}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[85vw] !max-w-none sm:!max-w-none md:!max-w-none lg:!max-w-none xl:!max-w-none max-h-[95vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 pb-3 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
              <Calendar className="h-6 w-6 text-blue-600" />
              ⚖️ Calibraciones
              {equipoId && <Badge variant="outline" className="ml-2">Equipo #{equipoId}</Badge>}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadCalibraciones(currentPage, searchTerm)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'list' && (
            <>
              <div className="px-6 py-4 pb-3 border-b bg-gray-50">
                {/* Search and Filters Row */}
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                  <div className="flex-1 min-w-64 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar calibraciones..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {hasPermission('calibraciones', 'crear') && (
                      <Button
                        onClick={() => setViewMode('add')}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    )}
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filtros:</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="date-from-filter" className="text-sm text-gray-600">Desde:</Label>
                    <Input
                      id="date-from-filter"
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => handleDateFromFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="date-to-filter" className="text-sm text-gray-600">Hasta:</Label>
                    <Input
                      id="date-to-filter"
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => handleDateToFilter(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    />
                  </div>

                  {(searchTerm || dateFromFilter || dateToFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setDateFromFilter('');
                        setDateToFilter('');
                        setCurrentPage(1);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6 py-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="bg-blue-600 text-white p-3 rounded mb-4">
                  <span className="font-medium">Listado de Calibraciones</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div>
                    Mostrando {filteredCalibraciones.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredCalibraciones.length)} de {filteredCalibraciones.length} registros
                    {filteredCalibraciones.length !== calibraciones.length && (
                      <span className="text-blue-600 ml-2">
                        (filtrado de {calibraciones.length} total)
                      </span>
                    )}
                  </div>
                  {(searchTerm || dateFromFilter || dateToFilter) && (
                    <div className="flex items-center gap-2 text-xs bg-blue-50 px-2 py-1 rounded">
                      <Filter className="h-3 w-3" />
                      <span>Filtros activos</span>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-gray-700 font-semibold">Fecha Calibración</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Código</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Equipo</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Marca</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Modelo</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Serie</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Ubicación</TableHead>
                        <TableHead className="text-gray-700 font-semibold">Archivo</TableHead>
                        <TableHead className="text-center text-gray-700 font-semibold">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan="9" className="text-center py-12">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                              <span className="text-gray-600">Cargando calibraciones...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredCalibraciones.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan="9" className="text-center py-12 text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <AlertCircle className="h-8 w-8 text-gray-400" />
                              <span className="font-medium">
                                {searchTerm || dateFromFilter || dateToFilter ? 
                                  'No se encontraron calibraciones que coincidan con los filtros aplicados' : 
                                  'No hay calibraciones registradas'
                                }
                              </span>
                              {(searchTerm || dateFromFilter || dateToFilter) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSearchTerm('');
                                    setDateFromFilter('');
                                    setDateToFilter('');
                                    setCurrentPage(1);
                                  }}
                                  className="mt-2"
                                >
                                  Limpiar filtros
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        getCurrentPageData().map((calibration, index) => (
                          <TableRow 
                            key={calibration.id} 
                            className={`hover:bg-blue-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <TableCell className="font-medium">
                              {calibration.fecha_calibracion ? (
                                <div className="flex flex-col">
                                  <span>{new Date(calibration.fecha_calibracion).toLocaleDateString('es-ES')}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(calibration.fecha_calibracion).toLocaleDateString('es-ES', { 
                                      weekday: 'short', 
                                      month: 'short' 
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-blue-700">
                              {calibration.description || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{calibration.equipo?.name || 'N/A'}</span>
                                <span className="text-xs text-gray-500">ID: {calibration.equipo_id || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{calibration.equipo?.marca || 'N/A'}</TableCell>
                            <TableCell>{calibration.equipo?.modelo || 'N/A'}</TableCell>
                            <TableCell className="font-mono text-sm">{calibration.equipo?.serial || 'N/A'}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                {calibration.equipo?.servicio?.name || 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {calibration.file ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                  Disponible
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                                  No disponible
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center gap-2">
                                {hasPermission('calibraciones', 'leer') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDocument(calibration.file)}
                                    className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Ver documento"
                                  >
                                    <FileText className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Página {currentPage} de {totalPages}</span>
                      <span className="text-gray-400">•</span>
                      <span>{filteredCalibraciones.length} registros total</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* First page */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage <= 1 || loading}
                        className="p-2"
                        title="Primera página"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Previous page */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="p-2"
                        title="Página anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Page numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        // Adjust start page if we're near the end
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        // Add ellipsis at the beginning if needed
                        if (startPage > 1) {
                          pages.push(
                            <Button
                              key={1}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(1)}
                              className="min-w-[2.5rem]"
                            >
                              1
                            </Button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis-start" className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                        }
                        
                        // Add visible page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <Button
                              key={i}
                              variant={currentPage === i ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(i)}
                              className={`min-w-[2.5rem] ${
                                currentPage === i 
                                  ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-md font-semibold" 
                                  : "hover:bg-blue-50 hover:border-blue-300"
                              }`}
                            >
                              {i}
                            </Button>
                          );
                        }
                        
                        // Add ellipsis at the end if needed
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis-end" className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <Button
                              key={totalPages}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(totalPages)}
                              className="min-w-[2.5rem]"
                            >
                              {totalPages}
                            </Button>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      {/* Next page */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="p-2"
                        title="Página siguiente"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      
                      {/* Last page */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage >= totalPages || loading}
                        className="p-2"
                        title="Última página"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {(viewMode === 'add' || viewMode === 'edit') && (
            <div className="flex-1 overflow-auto px-6 py-4">
              {renderForm()}
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useState, useEffect } from "react";
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
  Edit, 
  Trash2, 
  FileText, 
  Download,
  Calendar,
  Upload,
  X,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import httpService from "@/services/httpService";

export function CalibrationModal({ open, onOpenChange, equipoId = null }) {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [calibraciones, setCalibraciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit'
  const [selectedCalibration, setSelectedCalibration] = useState(null);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Form data for add/edit
  const [formData, setFormData] = useState({
    codigo: '',
    fecha_calibracion: '',
    fecha_programada: '',
    observaciones: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load calibrations data
  const loadCalibraciones = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        per_page: itemsPerPage,
        search,
        ...(equipoId && { equipo_id: equipoId })
      };

      console.log('Loading calibrations with params:', params);
      const response = await httpService.get('/v1/calibracion', { params });
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data.data);
      
      if (response.data && response.data.success) {
        // The API returns: {success: true, data: {data: [...], current_page: 1, ...}}
        const apiData = response.data.data;
        console.log('API data structure:', apiData);
        
        if (apiData && Array.isArray(apiData.data)) {
          // Paginated response structure
          setCalibraciones(apiData.data);
          setCurrentPage(apiData.current_page || 1);
          setTotalPages(apiData.last_page || 1);
          console.log('Set calibrations (paginated):', apiData.data.length, 'records');
        } else if (Array.isArray(apiData)) {
          // Direct array response
          setCalibraciones(apiData);
          setCurrentPage(1);
          setTotalPages(1);
          console.log('Set calibrations (direct array):', apiData.length, 'records');
        } else {
          // Fallback
          setCalibraciones([]);
          console.log('No valid data structure found, set empty array');
        }
      } else {
        setCalibraciones([]);
        console.log('No response data or success=false, set empty array');
      }
    } catch (err) {
      console.error('Error loading calibrations:', err);
      setError('Error al cargar las calibraciones: ' + err.message);
      setCalibraciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadCalibraciones(1, searchTerm);
    }
  }, [open, equipoId]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    loadCalibraciones(1, value);
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

    try {
      setLoading(true);
      setError(null);

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
      } else {
        await httpService.post('/v1/calibracion', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
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
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (calibration) => {
    setSelectedCalibration(calibration);
    setFormData({
      codigo: calibration.description || '',
      fecha_calibracion: calibration.fecha_calibracion || '',
      fecha_programada: calibration.fecha_programada || '',
      observaciones: calibration.observaciones || ''
    });
    setViewMode('edit');
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta calibración?')) {
      return;
    }

    try {
      setLoading(true);
      await httpService.delete(`/v1/calibracion/${id}`);
      loadCalibraciones(currentPage, searchTerm);
    } catch (err) {
      console.error('Error deleting calibration:', err);
      setError('Error al eliminar la calibración');
    } finally {
      setLoading(false);
    }
  };

  // Handle document view
  const handleViewDocument = (fileName) => {
    if (!fileName) return;
    
    const documentUrl = `/storage/calibraciones/${fileName}`;
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      console.error('No se pudo abrir el documento.');
    }
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await httpService.get('/v1/v1/export/calibraciones', {
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
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Error al exportar las calibraciones');
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
      <DialogContent className="w-[70vw] max-w-none max-h-[90vh] overflow-hidden flex flex-col">
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
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex-1 min-w-64 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar calibraciones..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {hasPermission('calibraciones', 'crear') && (
                      <Button
                        onClick={() => setViewMode('add')}
                        className="bg-green-600 hover:bg-green-700 text-white"
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
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
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

                <div className="text-sm text-gray-600 mb-4">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, calibraciones.length)} de {calibraciones.length} registros
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha Calibración</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Serie</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Archivo</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan="9" className="text-center py-8">
                            Cargando calibraciones...
                          </TableCell>
                        </TableRow>
                      ) : calibraciones.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan="9" className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No se encontraron calibraciones que coincidan con la búsqueda' : 'No hay calibraciones registradas'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        Array.isArray(calibraciones) && calibraciones.map((calibration, index) => (
                          <TableRow key={calibration.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell>
                              {calibration.fecha_calibracion ? new Date(calibration.fecha_calibracion).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell className="font-medium">
                              {calibration.description || 'N/A'}
                            </TableCell>
                            <TableCell>{calibration.equipo?.name || 'N/A'}</TableCell>
                            <TableCell>{calibration.equipo?.marca || 'N/A'}</TableCell>
                            <TableCell>{calibration.equipo?.modelo || 'N/A'}</TableCell>
                            <TableCell>{calibration.equipo?.serial || 'N/A'}</TableCell>
                            <TableCell>{calibration.equipo?.servicio?.name || 'N/A'}</TableCell>
                            <TableCell>
                              {calibration.file ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDocument(calibration.file)}
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-sm">Sin archivo</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                {hasPermission('calibraciones', 'editar') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(calibration)}
                                    className="p-2 hover:bg-yellow-50 rounded-full"
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4 text-yellow-600" />
                                  </Button>
                                )}
                                {hasPermission('calibraciones', 'eliminar') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(calibration.id)}
                                    className="p-2 hover:bg-red-50 rounded-full"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadCalibraciones(currentPage - 1, searchTerm)}
                      disabled={currentPage <= 1 || loading}
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => loadCalibraciones(page, searchTerm)}
                          className={currentPage === page ? "bg-blue-600 text-white" : ""}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadCalibraciones(currentPage + 1, searchTerm)}
                      disabled={currentPage >= totalPages || loading}
                    >
                      Siguiente
                    </Button>
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

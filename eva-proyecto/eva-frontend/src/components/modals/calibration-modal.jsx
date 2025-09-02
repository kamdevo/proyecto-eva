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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  FileText, 
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { httpClient } from "../../services/httpClient";

export function CalibrationModal({ open, onOpenChange, equipmentType = "biomedical" }) {
  const { hasPermission, canCreate, canEdit, canDelete } = useAuth();
  const [calibraciones, setCalibraciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    fecha_calibracion: '',
    fecha_programada: '',
    file: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const itemsPerPage = 10;

  // Cargar calibraciones
  const loadCalibraciones = async () => {
    if (!open) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = equipmentType === "industrial" ? 
        '/api/v1/v1/calibracion-ind' : '/api/v1/v1/calibracion';
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm
      });
      
      const response = await httpClient.get(`${endpoint}?${params}`);
      
      if (response.data && response.data.success) {
        setCalibraciones(response.data.data || []);
        setTotalPages(response.data.pagination?.last_page || 1);
        setTotalRecords(response.data.pagination?.total || 0);
      } else {
        throw new Error(response.data?.message || 'Error al cargar calibraciones');
      }
    } catch (err) {
      console.error('Error loading calibraciones:', err);
      setError(err.message || 'Error al cargar calibraciones');
      setCalibraciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    loadCalibraciones();
  }, [open, currentPage, searchTerm, equipmentType]);

  // Ver documento
  const handleViewDocument = (fileName) => {
    if (!fileName) return;
    
    const documentUrl = `/storage/calibraciones/${fileName}`;
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      setError('No se pudo abrir el documento.');
    }
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const endpoint = equipmentType === "industrial" ? 
        '/api/v1/export/calibraciones-ind' : '/api/v1/export/calibraciones';
      
      const response = await httpClient.get(endpoint, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CalibracionesEB_${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar calibraciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            ⚖️ Calibraciones {equipmentType === "industrial" ? "Industriales" : "Biomédicas"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Header con búsqueda y acciones */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Input
                placeholder="Buscar por código, equipo, marca..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-md"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              {canCreate('calibraciones') && (
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              )}
              
              <Button
                onClick={handleExportExcel}
                variant="outline"
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Consolidado
              </Button>
            </div>
          </div>

          {/* Información de registros */}
          <div className="text-sm text-gray-600">
            {loading ? (
              "Cargando..."
            ) : (
              `Mostrando ${((currentPage - 1) * itemsPerPage) + 1} a ${Math.min(currentPage * itemsPerPage, totalRecords)} de ${totalRecords} registros`
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Tabla */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Código Calibración</TableHead>
                  <TableHead>Fecha Ejecución</TableHead>
                  <TableHead>Nombre Equipo</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Serie</TableHead>
                  <TableHead>Código Equipo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="10" className="text-center py-8">
                      Cargando calibraciones...
                    </TableCell>
                  </TableRow>
                ) : calibraciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="10" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No se encontraron calibraciones que coincidan con la búsqueda' : 'No hay calibraciones registradas'}
                    </TableCell>
                  </TableRow>
                ) : (
                  calibraciones.map((calibracion, index) => (
                    <TableRow key={calibracion.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell className="font-medium">
                        {calibracion.description || calibracion.codigo || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.fecha_calibracion ? new Date(calibracion.fecha_calibracion).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.equipo?.name || calibracion.nombre_equipo || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.equipo?.marca || calibracion.marca || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.equipo?.modelo || calibracion.modelo || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.equipo?.serial || calibracion.serie || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.equipo?.code || calibracion.codigo_equipo || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.equipo?.servicio?.name || calibracion.ubicacion || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {calibracion.file ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(calibracion.file)}
                            className="text-blue-600 hover:bg-blue-50"
                            title="Ver documento"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {canEdit('calibraciones') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 hover:bg-yellow-50 rounded-full"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4 text-yellow-600" />
                            </Button>
                          )}
                          
                          {canDelete('calibraciones') && (
                            <Button
                              variant="ghost"
                              size="sm"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

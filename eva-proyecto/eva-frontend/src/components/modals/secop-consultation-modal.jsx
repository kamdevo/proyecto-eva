import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  X, 
  Loader2, 
  ExternalLink, 
  Calendar,
  Building,
  DollarSign,
  FileText,
  RefreshCw,
  Filter
} from "lucide-react";
import { useSecopService } from "../../hooks/useSecopService";

export function SecopConsultationModal({ 
  open, 
  onOpenChange, 
  onSelectProcess 
}) {
  const [searchForm, setSearchForm] = useState({
    search: '',
    entidad: '',
    objeto: '',
    fecha_inicio: '',
    fecha_fin: '',
    valor_minimo: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const {
    processes,
    loading,
    error,
    statistics,
    searchProcesses,
    getProcessByUid,
    getStatistics,
    clearCache
  } = useSecopService();

  // Cargar estadísticas al abrir el modal
  useEffect(() => {
    if (open) {
      getStatistics();
    }
  }, [open, getStatistics]);

  const handleInputChange = (field, value) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    const filters = Object.fromEntries(
      Object.entries(searchForm).filter(([_, value]) => value.trim() !== '')
    );
    
    await searchProcesses(filters);
  };

  const handleSelectProcess = (process) => {
    setSelectedProcess(process);
    if (onSelectProcess) {
      onSelectProcess(process);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'vigente':
      case 'en ejecución':
        return 'default';
      case 'terminado':
      case 'liquidado':
        return 'secondary';
      case 'suspendido':
      case 'terminado anticipadamente':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const resetForm = () => {
    setSearchForm({
      search: '',
      entidad: '',
      objeto: '',
      fecha_inicio: '',
      fecha_fin: '',
      valor_minimo: ''
    });
    setSelectedProcess(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Consulta SECOP - Procesos de Contratación Pública
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Estadísticas */}
          {statistics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Estadísticas SECOP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.total_procesos?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Total Procesos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {statistics.ultima_actualizacion || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Última Actualización</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {statistics.fuente || 'datos.gov.co'}
                    </div>
                    <div className="text-sm text-gray-600">Fuente</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario de búsqueda */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Búsqueda de Procesos
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Búsqueda general */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por entidad, objeto del contrato o número..."
                    value={searchForm.search}
                    onChange={(e) => handleInputChange('search', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Filtros avanzados */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="entidad">Entidad</Label>
                    <Input
                      id="entidad"
                      placeholder="Nombre de la entidad"
                      value={searchForm.entidad}
                      onChange={(e) => handleInputChange('entidad', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="objeto">Objeto del Contrato</Label>
                    <Input
                      id="objeto"
                      placeholder="Descripción del objeto"
                      value={searchForm.objeto}
                      onChange={(e) => handleInputChange('objeto', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor_minimo">Valor Mínimo</Label>
                    <Input
                      id="valor_minimo"
                      type="number"
                      placeholder="Valor mínimo en COP"
                      value={searchForm.valor_minimo}
                      onChange={(e) => handleInputChange('valor_minimo', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={searchForm.fecha_inicio}
                      onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_fin">Fecha Fin</Label>
                    <Input
                      id="fecha_fin"
                      type="date"
                      value={searchForm.fecha_fin}
                      onChange={(e) => handleInputChange('fecha_fin', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resultados */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="text-red-600 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p>Error al consultar SECOP: {error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {processes && processes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resultados ({processes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entidad</TableHead>
                        <TableHead>Objeto</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Fecha Firma</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processes.map((process, index) => (
                        <TableRow 
                          key={process.uid || index}
                          className={selectedProcess?.uid === process.uid ? 'bg-blue-50' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="max-w-48 truncate" title={process.entidad}>
                              {process.entidad || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-64 truncate" title={process.objeto}>
                              {process.objeto || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(process.valor)}</TableCell>
                          <TableCell>{formatDate(process.fecha_firma)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(process.estado)}>
                              {process.estado || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectProcess(process)}
                              >
                                Seleccionar
                              </Button>
                              {process.url_secop && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(process.url_secop, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proceso seleccionado */}
          {selectedProcess && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">
                  Proceso Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>UID:</strong> {selectedProcess.uid}
                  </div>
                  <div>
                    <strong>Número:</strong> {selectedProcess.numero_constancia}
                  </div>
                  <div>
                    <strong>Entidad:</strong> {selectedProcess.entidad}
                  </div>
                  <div>
                    <strong>Valor:</strong> {formatCurrency(selectedProcess.valor)}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Objeto:</strong> {selectedProcess.objeto}
                  </div>
                  {selectedProcess.url_secop && (
                    <div className="md:col-span-2">
                      <strong>URL SECOP:</strong> 
                      <a 
                        href={selectedProcess.url_secop} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        {selectedProcess.url_secop}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {processes?.length > 0 && `${processes.length} procesos encontrados`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            {selectedProcess && (
              <Button
                onClick={() => {
                  if (onSelectProcess) {
                    onSelectProcess(selectedProcess);
                  }
                  onOpenChange(false);
                }}
              >
                Usar Proceso Seleccionado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { Badge } from "@/components/ui/badge";
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
  Filter,
  Users,
  TrendingUp,
  Database,
  MapPin,
  Clock,
  CheckCircle
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
    limit: 25
  });

  const [selectedProcess, setSelectedProcess] = useState(null);

  const {
    processes,
    loading,
    error,
    statistics,
    searchProcesses,
    quickSearch,
    getStatistics
  } = useSecopService();

  useEffect(() => {
    if (open) {
      getStatistics();
    }
  }, [open, getStatistics]);

  const handleSearch = async () => {
    if (!searchForm.search.trim() && !searchForm.entidad.trim()) {
      return;
    }

    const filters = {
      ...searchForm,
      search: searchForm.search.trim(),
      entidad: searchForm.entidad.trim()
    };

    if (searchForm.search.trim()) {
      await quickSearch(searchForm.search, searchForm.limit);
    } else {
      await searchProcesses(filters);
    }
  };

  const clearFilters = () => {
    setSearchForm({
      search: '',
      entidad: '',
      objeto: '',
      limit: 25
    });
  };

  const handleSelectProcess = (process) => {
    setSelectedProcess(process);
  };

  const onClose = () => {
    setSelectedProcess(null);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (selectedProcess && onSelectProcess) {
      onSelectProcess(selectedProcess);
    }
    onClose();
  };

  const formatValue = (value) => {
    if (!value || value === 0) return 'Sin valor';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'en ejecución':
      case 'activo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cerrado':
      case 'terminado':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-none w-[80vw] max-h-none h-[80vh] p-0 overflow-auto"
        style={{ width: '80vw', maxWidth: 'none', height: '80vh', maxHeight: 'none' }}
      >
        <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
          {/* Header Mejorado */}
          <DialogHeader className="px-6 py-4 bg-white border-b border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className=" text-xl font-semibold text-gray-900">
                    Consulta SECOP
                  </DialogTitle>
                  <p className="text-blue-600 text-sm">
                    Sistema Electrónico de Contratación Pública
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-blue-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Contenido Principal con Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Panel de Estadísticas Colorido */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 text-sm font-medium">Estado del Servicio</p>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        {statistics.disponible ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-sm font-medium">Fuente de Datos</p>
                      <p className="text-lg font-bold text-green-900 mt-1">
                        datos.gov.co
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 text-sm font-medium">Procesos Consultados</p>
                      <p className="text-lg font-bold text-purple-900 mt-1">
                        {processes.length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel de Búsqueda Colorido */}
            <div className="bg-white rounded-lg border border-indigo-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Búsqueda General
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Buscar en SECOP..."
                      value={searchForm.search}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, search: e.target.value }))}
                      className="h-10 pl-10 border-gray-300 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Entidad
                  </Label>
                  <Input
                    placeholder="Nombre de la entidad"
                    value={searchForm.entidad}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, entidad: e.target.value }))}
                    className="h-10 border-gray-300 focus:border-green-400 focus:ring-green-400"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Número de Resultados
                  </Label>
                  <Select 
                    value={searchForm.limit.toString()} 
                    onValueChange={(value) => setSearchForm(prev => ({ ...prev, limit: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-10 border-gray-300 focus:border-purple-400 focus:ring-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 resultados</SelectItem>
                      <SelectItem value="25">25 resultados</SelectItem>
                      <SelectItem value="50">50 resultados</SelectItem>
                      <SelectItem value="100">100 resultados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Acciones
                  </Label>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSearch}
                      disabled={loading}
                      className="flex-1 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Search className="w-4 h-4 mr-1" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => getStatistics()}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Actualizar Estado
                </Button>
              </div>
            </div>

            {/* Resultados como Grid de Tarjetas */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Resultados de la Consulta</h3>
                  </div>
                  {processes.length > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1">
                      {processes.length} contratos encontrados
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                {error && (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium mb-1">Error en la consulta</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Consultando SECOP...</p>
                    <p className="text-gray-500 text-sm mt-1">Obteniendo datos del gobierno</p>
                  </div>
                )}

                {!loading && !error && processes.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">Sin resultados</p>
                    <p className="text-gray-500 text-sm">Ingresa términos de búsqueda para consultar contratos públicos</p>
                  </div>
                )}

                {!loading && !error && processes.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {processes.map((process, index) => (
                      <div 
                        key={process.id || index}
                        className={`relative p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                          selectedProcess && selectedProcess.id === process.id 
                            ? 'border-blue-500 bg-blue-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectProcess(process)}
                      >
                        {/* Indicador de selección */}
                        {selectedProcess && selectedProcess.id === process.id && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Header de la tarjeta */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={`text-xs px-2 py-1 ${getStatusColor(process.estado)}`}>
                              {process.estado || 'Sin estado'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              ID: {process.id || 'N/A'}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
                            {process.objeto || 'Sin descripción del objeto'}
                          </h4>
                        </div>

                        {/* Información de la entidad */}
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">Entidad</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {process.entidad || 'Sin entidad'}
                          </p>
                        </div>

                        {/* Información del proveedor */}
                        {process.proveedor && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium text-blue-700">Proveedor</span>
                            </div>
                            <p className="text-sm text-blue-900 font-medium">
                              {process.proveedor}
                            </p>
                          </div>
                        )}

                        {/* Información del valor */}
                        <div className="mb-3 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-green-700">Valor del Contrato</span>
                          </div>
                          <p className="text-sm font-bold text-green-900">
                            {formatValue(process.valor)}
                          </p>
                        </div>

                        {/* Fecha */}
                        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">Fecha:</span>
                          <span className="font-medium">{formatDate(process.fecha_firma)}</span>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProcess(process);
                            }}
                            className={`flex-1 h-8 text-xs ${
                              selectedProcess && selectedProcess.id === process.id
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            {selectedProcess && selectedProcess.id === process.id ? 'Seleccionado' : 'Seleccionar'}
                          </Button>
                          
                          {process.url_proceso && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(process.url_proceso, '_blank');
                              }}
                              className="h-8 px-3 border-gray-300 hover:bg-gray-50 text-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Mejorado */}
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-blue-200">
          <div className="flex-1">
            {selectedProcess && (
              <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    Proceso seleccionado:
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1 truncate max-w-md">
                  {selectedProcess.objeto || 'Sin descripción'}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Entidad: {selectedProcess.entidad || 'N/A'}</span>
                  <span>•</span>
                  <span>ID: {selectedProcess.id || 'N/A'}</span>
                  <span>•</span>
                  <span>Valor: {formatValue(selectedProcess.valor)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 ml-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={!selectedProcess || loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Selección
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

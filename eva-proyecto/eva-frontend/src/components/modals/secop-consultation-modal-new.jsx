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
  Filter,
  Users,
  TrendingUp,
  Database
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

  const {
    processes,
    loading,
    error,
    statistics,
    searchProcesses,
    quickSearch,
    getStatistics,
    clearCache
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
    if (onSelectProcess) {
      onSelectProcess(process);
    }
    onOpenChange(false);
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
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[98vh] h-[98vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
          {/* Header Mejorado */}
          <DialogHeader className="px-8 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    Consulta SECOP
                  </DialogTitle>
                  <p className="text-blue-100 text-sm font-medium mt-1">
                    Sistema Electrónico de Contratación Pública - Gobierno de Colombia
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 p-0 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Contenido Principal */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Panel de Estadísticas */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-600 text-sm font-medium">Estado del Servicio</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">
                          {statistics.disponible ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Database className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Fuente de Datos</p>
                        <p className="text-lg font-bold text-blue-700 mt-1">
                          datos.gov.co
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Procesos Consultados</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">
                          {processes.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Panel de Búsqueda Mejorado */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b border-slate-100">
                <CardTitle className="flex items-center gap-3 text-xl text-slate-800">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                
                {/* Búsqueda Principal */}
                <div className="space-y-3">
                  <Label htmlFor="search" className="text-sm font-semibold text-slate-700">
                    Búsqueda General
                  </Label>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        id="search"
                        placeholder="Buscar por entidad, objeto del contrato, proveedor..."
                        value={searchForm.search}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-12 h-12 text-base bg-white border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-lg shadow-sm"
                      />
                    </div>
                    <Button 
                      onClick={handleSearch}
                      disabled={loading || (!searchForm.search.trim() && !searchForm.entidad.trim())}
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-lg font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Filtros Específicos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      Entidad Específica
                    </Label>
                    <Input
                      placeholder="Ej: Hospital, Universidad, Gobernación..."
                      value={searchForm.entidad}
                      onChange={(e) => setSearchForm(prev => ({ ...prev, entidad: e.target.value }))}
                      className="h-11 bg-white border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      Límite de Resultados
                    </Label>
                    <Select
                      value={searchForm.limit.toString()}
                      onValueChange={(value) => setSearchForm(prev => ({ ...prev, limit: parseInt(value) }))}
                    >
                      <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-400 rounded-lg">
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

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      Acciones Rápidas
                    </Label>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                        className="flex-1 h-11 border-slate-200 hover:bg-slate-50 rounded-lg"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpiar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => getStatistics()}
                        className="flex-1 h-11 border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-lg"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Estado
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultados */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-lg border-b border-slate-100">
                <CardTitle className="flex items-center justify-between text-xl text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    Resultados de la Consulta
                  </div>
                  {processes.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                      {processes.length} contratos encontrados
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium mb-2">Error en la consulta</p>
                    <p className="text-slate-600 text-sm">{error}</p>
                  </div>
                )}

                {loading && (
                  <div className="p-16 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Consultando SECOP...</p>
                    <p className="text-slate-500 text-sm mt-1">Obteniendo datos del gobierno</p>
                  </div>
                )}

                {!loading && !error && processes.length === 0 && (
                  <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">Sin resultados</p>
                    <p className="text-slate-500 text-sm">Ingresa términos de búsqueda para consultar contratos públicos</p>
                  </div>
                )}

                {!loading && !error && processes.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-slate-200">
                          <TableHead className="font-semibold text-slate-700 p-4">Entidad</TableHead>
                          <TableHead className="font-semibold text-slate-700 p-4">Objeto del Contrato</TableHead>
                          <TableHead className="font-semibold text-slate-700 p-4">Proveedor</TableHead>
                          <TableHead className="font-semibold text-slate-700 p-4">Valor</TableHead>
                          <TableHead className="font-semibold text-slate-700 p-4">Estado</TableHead>
                          <TableHead className="font-semibold text-slate-700 p-4">Fecha</TableHead>
                          <TableHead className="font-semibold text-slate-700 p-4">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processes.map((process, index) => (
                          <TableRow 
                            key={process.id || index}
                            className="hover:bg-blue-50/50 transition-colors border-b border-slate-100"
                          >
                            <TableCell className="p-4">
                              <div className="space-y-1">
                                <p className="font-medium text-slate-900 text-sm leading-tight">
                                  {process.entidad || 'Sin entidad'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  ID: {process.id || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            
                            <TableCell className="p-4 max-w-md">
                              <p className="text-sm text-slate-800 leading-relaxed line-clamp-3">
                                {process.objeto || 'Sin descripción'}
                              </p>
                            </TableCell>
                            
                            <TableCell className="p-4">
                              <p className="font-medium text-slate-900 text-sm">
                                {process.proveedor || 'Sin proveedor'}
                              </p>
                            </TableCell>
                            
                            <TableCell className="p-4">
                              <p className="font-semibold text-emerald-700 text-sm">
                                {formatValue(process.valor)}
                              </p>
                            </TableCell>
                            
                            <TableCell className="p-4">
                              <Badge className={`text-xs px-2 py-1 ${getStatusColor(process.estado)}`}>
                                {process.estado || 'Sin estado'}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="p-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(process.fecha_firma)}
                              </div>
                            </TableCell>
                            
                            <TableCell className="p-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSelectProcess(process)}
                                  className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Seleccionar
                                </Button>
                                
                                {process.url_proceso && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(process.url_proceso, '_blank')}
                                    className="h-8 px-3 border-slate-200 hover:bg-slate-50 text-xs rounded-md"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Ver
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

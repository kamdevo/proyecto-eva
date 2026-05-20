import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useSecopService } from "../../hooks/useSecopService";

export function SecopConsultationModal({
  open,
  onOpenChange,
  onSelectProcess,
}) {
  const [query, setQuery] = useState('');
  const [entidad, setEntidad] = useState('');
  const [limit, setLimit] = useState('25');
  const [selectedProcess, setSelectedProcess] = useState(null);
  const searchInputRef = useRef(null);

  const {
    processes,
    loading,
    error,
    searchProcesses,
    quickSearch,
  } = useSecopService();

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setEntidad('');
      setLimit('25');
      setSelectedProcess(null);
    }
  }, [open]);

  const handleSearch = async () => {
    const q = query.trim();
    const e = entidad.trim();
    if (!q && !e) return;
    if (q) {
      await quickSearch(q, parseInt(limit));
    } else {
      await searchProcesses({ entidad: e, limit: parseInt(limit) });
    }
    setSelectedProcess(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleConfirm = () => {
    if (selectedProcess && onSelectProcess) {
      onSelectProcess(selectedProcess);
    }
    onOpenChange(false);
  };

  const formatValue = (value) => {
    if (!value || value === 0) return null;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const getStatusStyle = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'en ejecución':
      case 'activo':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cerrado':
      case 'terminado':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'cancelado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const hasResults = !loading && !error && processes.length > 0;
  const isEmpty = !loading && !error && processes.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[92vw] sm:w-[92vw] max-w-6xl sm:max-w-6xl h-[85vh] p-0 flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                  Consultar SECOP
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sistema Electrónico de Contratación Pública · datos.gov.co
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* SEARCH BAR */}
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar contrato, objeto, número de proceso…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 h-10 text-sm border-slate-300 focus-visible:ring-blue-500"
              />
            </div>
            <Input
              placeholder="Entidad (opcional)"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-10 text-sm border-slate-300 w-44 hidden sm:block focus-visible:ring-blue-500"
            />
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="h-10 w-24 text-sm border-slate-300 hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              disabled={loading || (!query.trim() && !entidad.trim())}
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Buscar</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2 mt-2 sm:hidden">
            <Input
              placeholder="Entidad (opcional)"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm border-slate-300 flex-1"
            />
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="h-9 w-20 text-sm border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(hasResults || query || entidad) && (
            <div className="flex items-center justify-between mt-3">
              {hasResults && (
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{processes.length}</span> contratos encontrados
                  {selectedProcess && (
                    <span className="ml-2 text-blue-600 font-medium">· 1 seleccionado</span>
                  )}
                </span>
              )}
              {(query || entidad) && (
                <button
                  onClick={() => { setQuery(''); setEntidad(''); setSelectedProcess(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 ml-auto"
                >
                  <X className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>
          )}
        </div>

        {/* RESULTS */}
        <div className="flex-1 overflow-y-auto bg-[#F1F4F6]">
          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <p className="text-sm text-slate-600 font-medium">Consultando SECOP…</p>
              <p className="text-xs text-slate-400">Obteniendo datos de datos.gov.co</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm font-medium text-red-600">Error en la consulta</p>
              <p className="text-xs text-slate-500 max-w-xs text-center">{error}</p>
              <Button size="sm" variant="outline" onClick={handleSearch} className="mt-1">
                <RefreshCw className="w-3 h-3 mr-1" /> Reintentar
              </Button>
            </div>
          )}

          {isEmpty && !query && !entidad && (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Search className="w-8 h-8 text-slate-300" />
              <p className="text-sm text-slate-500">Ingresa un término para consultar contratos públicos</p>
              <p className="text-xs text-slate-400">Presiona Enter o haz clic en Buscar</p>
            </div>
          )}

          {isEmpty && (query || entidad) && (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <FileText className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Sin resultados</p>
              <p className="text-xs text-slate-400">Prueba con otros términos o una entidad diferente</p>
            </div>
          )}

          {hasResults && (
            <ul className="p-4 space-y-2">
              {processes.map((process, index) => {
                const isSelected = selectedProcess?.id === process.id;
                const valor = formatValue(process.valor);
                const fecha = formatDate(process.fecha_firma);
                return (
                  <li
                    key={process.id || index}
                    onClick={() => setSelectedProcess(isSelected ? null : process)}
                    className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-1 ring-blue-200'
                        : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {process.estado && (
                            <Badge className={`text-xs px-2 py-0.5 border ${getStatusStyle(process.estado)}`}>
                              {process.estado}
                            </Badge>
                          )}
                          <span className="text-xs text-slate-400 font-mono">
                            #{process.id || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-2">
                          {process.objeto || 'Sin descripción del objeto'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{process.entidad || 'Sin entidad'}</span>
                          </span>
                          {fecha && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              {fecha}
                            </span>
                          )}
                          {valor && (
                            <span className="flex items-center gap-1 font-medium text-emerald-700">
                              <DollarSign className="w-3 h-3 flex-shrink-0" />
                              {valor}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                        )}
                        {process.url_proceso && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(process.url_proceso, '_blank', 'noopener,noreferrer');
                            }}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Ver en SECOP"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {selectedProcess ? (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                      {selectedProcess.objeto || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {selectedProcess.entidad || 'Sin entidad'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  {hasResults
                    ? 'Haz clic en un contrato para seleccionarlo'
                    : 'Ningún proceso seleccionado'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="px-4 text-slate-600"
              >
                Cancelar
              </Button>
              {onSelectProcess && (
                <Button
                  size="sm"
                  disabled={!selectedProcess}
                  onClick={handleConfirm}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-40"
                >
                  Usar proceso
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
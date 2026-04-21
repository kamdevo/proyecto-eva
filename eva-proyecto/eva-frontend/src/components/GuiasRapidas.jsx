"use client";
import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Link,
  File,
  ChevronDown,
  AlignJustify,
  Loader2,
  Plus,
  Download,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  useGuiasRapidas, 
  useIndicadorPorGrupo, 
  useDetallePorGrupo,
  useInclusionesExclusiones 
} from "@/hooks/useGuiasRapidas";
import { API_CONFIG } from "@/config/api";
import httpService from "@/services/httpService";
import EditGuiaModal from "@/components/modals/edit-guia-modal";
import AsociarEquipoGuiaModal from "@/components/modals/asociar-equipo-guia-modal";
import CreateGuiaModal from "@/components/modals/create-guia-modal";
import Pagination from "@/components/common/Pagination";

// Reusable skeleton rows for tables
function TableSkeletonRows({ columns = 5, rows = 6 }) {
  return (
    <div className="p-6 space-y-3">
      {/* Header row */}
      <div className="flex gap-4 pb-3 border-b border-slate-100">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex items-center gap-4 py-3">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={`r-${r}-c-${c}`} className="flex-1 flex items-center gap-3">
              {c === 0 ? (
                <>
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </>
              ) : (
                <Skeleton className="h-6 w-20 rounded-full" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function GuidesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [asociarModalOpen, setAsociarModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchIndicador, setSearchIndicador] = useState("");
  const [currentPageIndicador, setCurrentPageIndicador] = useState(1);
  const [itemsPerPageIndicador, setItemsPerPageIndicador] = useState(10);
  const [currentPageGuias, setCurrentPageGuias] = useState(1);
  const [itemsPerPageGuias, setItemsPerPageGuias] = useState(10);
  const [activeTab, setActiveTab] = useState("guias-rapidas");
  const [selectedEquipoNombre, setSelectedEquipoNombre] = useState(null);

  // Hooks para datos reales
  const { 
    guias, 
    loading: guiasLoading, 
    cobertura,
    createGuia,
    deleteGuia,
    toggleEstado,
    refresh: refreshGuias 
  } = useGuiasRapidas();

  // Debug: Ver qué valores tiene cobertura
  console.log('📊 [GuiasRapidas] Cobertura actual:', cobertura);

  const { 
    indicadores, 
    loading: indicadoresLoading,
    refresh: refreshIndicadores 
  } = useIndicadorPorGrupo();

  const { 
    detalles, 
    loading: detallesLoading,
    fetchByNombre 
  } = useDetallePorGrupo();

  const { 
    riesgosIncluidos, 
    estadosExcluidos,
    loading: inclusionesLoading 
  } = useInclusionesExclusiones();

  const handleEdit = (guide) => {
    setSelectedGuide(guide);
    setEditModalOpen(true);
  };

  const handleView = (guide) => {
    setSelectedGuide(guide);
    setAsociarModalOpen(true);
  };

  const handleDelete = (guide) => {
    setSelectedGuide(guide);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedGuide) {
      const result = await deleteGuia(selectedGuide.id);
      if (result.success) {
        toast.success("Guía eliminada exitosamente");
        setDeleteModalOpen(false);
        setSelectedGuide(null);
      } else {
        toast.error(result.error || "Error al eliminar la guía");
      }
    }
  };

  const handleToggleEstado = async (guia) => {
    const result = await toggleEstado(guia.id);
    if (result.success) {
      toast.success(`Guía ${guia.estado === 1 ? 'desactivada' : 'activada'} exitosamente`);
    } else {
      toast.error(result.error || "Error al cambiar el estado");
    }
  };

  // Filtrar indicadores por búsqueda
  const indicadoresFiltrados = searchIndicador
    ? indicadores.filter(ind => 
        ind.nombre.toLowerCase().includes(searchIndicador.toLowerCase())
      )
    : indicadores;

  // Paginación para indicadores
  const totalPagesIndicador = Math.ceil(indicadoresFiltrados.length / itemsPerPageIndicador);
  const startIndexIndicador = (currentPageIndicador - 1) * itemsPerPageIndicador;
  const endIndexIndicador = startIndexIndicador + itemsPerPageIndicador;
  const indicadoresPaginados = indicadoresFiltrados.slice(startIndexIndicador, endIndexIndicador);

  // Paginación para guías rápidas
  const totalPagesGuias = Math.ceil(guias.length / itemsPerPageGuias);
  const startIndexGuias = (currentPageGuias - 1) * itemsPerPageGuias;
  const endIndexGuias = startIndexGuias + itemsPerPageGuias;
  const guiasPaginadas = guias.slice(startIndexGuias, endIndexGuias);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPageIndicador(1);
  }, [searchIndicador]);

  // Reset a página 1 cuando cambie el total de guías (crear/eliminar)
  useEffect(() => {
    setCurrentPageGuias(1);
  }, [guias.length]);

  // Función para navegar a detalle por grupo con filtro
  const handleVerDetalle = (nombreEquipo) => {
    console.log('🔍 Navegando a detalle de:', nombreEquipo);
    setSelectedEquipoNombre(nombreEquipo);
    setActiveTab("detalle-grupo");
    // Cargar detalles filtrados por nombre
    if (fetchByNombre) {
      fetchByNombre(nombreEquipo);
    }
  };

  // Limpiar filtro al volver a indicador
  useEffect(() => {
    if (activeTab !== "detalle-grupo") {
      setSelectedEquipoNombre(null);
    }
  }, [activeTab]);

  // Funciones de exportación
  const handleExport = async (tipo) => {
    try {
      toast.info(`Generando reporte de ${tipo}...`);
      
      // Construir URL y parámetros
      const params = {};
      if (tipo === 'detalle' && selectedEquipoNombre) {
        params.nombre = selectedEquipoNombre;
      }
      
      // Usar httpService para descargar el archivo
      const response = await httpService.get(`/v1/guiarapida/export/${tipo}`, {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      // Obtener el blob del archivo
      const blob = response.data;
      
      // Crear URL temporal y descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Nombre del archivo según el tipo
      const fecha = new Date().toISOString().split('T')[0];
      const nombres = {
        'priorizados': `Equipos_Priorizados_${fecha}.xlsx`,
        'con-guia': `Equipos_Con_Guia_${fecha}.xlsx`,
        'sin-guia': `Equipos_Sin_Guia_${fecha}.xlsx`,
        'indicador': `Indicador_Por_Grupo_${fecha}.xlsx`,
        'detalle': selectedEquipoNombre 
          ? `Detalle_${selectedEquipoNombre.replace(/\s+/g, '_')}_${fecha}.xlsx`
          : `Detalle_Por_Grupo_${fecha}.xlsx`
      };
      
      link.download = nombres[tipo] || `Reporte_${fecha}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Reporte descargado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al generar el reporte');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F4F6]">
      {/* Header */}
      <header className="bg-[#F1F4F6] px-6 md:px-10 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Guías Rápidas</h1>
          <p className="text-slate-500 text-sm mt-1">Administra y curaduriá los manuales operativos de los equipos</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-8">
        {/* Export Buttons */}
        <section>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Exportar reportes</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport('priorizados')}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="h-4 w-4" /> Priorizados
            </button>
            <button
              onClick={() => handleExport('con-guia')}
              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="h-4 w-4" /> Con Guía
            </button>
            <button
              onClick={() => handleExport('sin-guia')}
              className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="h-4 w-4" /> Sin Guía
            </button>
            <button
              onClick={() => handleExport('indicador')}
              className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="h-4 w-4" /> Indicador por Grupo
            </button>
            <button
              onClick={() => handleExport('detalle')}
              className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Download className="h-4 w-4" /> Detalle por Grupo
            </button>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex items-center gap-1 bg-slate-100/80 p-1 h-auto rounded-xl w-auto focus:outline-none focus-visible:outline-none ring-0 focus:ring-0">
            <TabsTrigger
              value="guias-rapidas"
              className="px-4 py-2 rounded-lg bg-transparent text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold text-sm transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
            >
              Guías rápidas
            </TabsTrigger>
            <TabsTrigger
              value="indicador-grupo"
              className="px-4 py-2 rounded-lg bg-transparent text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold text-sm transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
            >
              Indicador por grupo
            </TabsTrigger>
            <TabsTrigger
              value="detalle-grupo"
              className="px-4 py-2 rounded-lg bg-transparent text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold text-sm transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
            >
              Detalle por grupo
            </TabsTrigger>
            <TabsTrigger
              value="inclusiones"
              className="px-4 py-2 rounded-lg bg-transparent text-slate-600 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-semibold text-sm transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
            >
              Inclusiones/Exclusiones
            </TabsTrigger>
          </TabsList>

          {/* Guías rápidas Tab */}
          <TabsContent value="guias-rapidas" className="space-y-6 mt-6">
            {/* Insights Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 flex flex-col justify-between h-36">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Cumplen criterios</span>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-900 leading-none">{cobertura.cumplenCriterios}</span>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <File className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-6 flex flex-col justify-between h-36">
                <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Cumplen criterios con guía</span>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-900 leading-none">{cobertura.cumplenConGuia}</span>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <File className="h-5 w-5" />
                  </div>
                </div>
              </div>
              <div className="bg-blue-600 rounded-3xl p-6 flex flex-col justify-between h-36 relative overflow-hidden">
                <span className="text-blue-100 font-bold text-xs uppercase tracking-widest">Cobertura</span>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-white leading-none">{cobertura.porcentaje}%</span>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <File className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600 font-medium">
                Mostrando {guias.length} guías rápidas registradas
              </p>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-colors h-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Guía Rápida
              </Button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl">
              {guiasLoading ? (
                <TableSkeletonRows columns={5} rows={itemsPerPageGuias} />
              ) : guias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-600">No hay guías rápidas registradas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest w-16">
                        #
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Nombre de la guía
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-28">
                        # Equipos
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-28">
                        Estado
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right w-40">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guiasPaginadas.map((guide, index) => (
                      <TableRow
                        key={guide.id}
                        className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="py-5 px-6 text-sm font-medium text-slate-500">
                          {String(startIndexGuias + index + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                              <File className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="block font-semibold text-slate-900 truncate">
                                {guide.name}
                              </span>
                              {guide.file && (
                                <a
                                  href={`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.56.1:8001'}/storage/guias/${guide.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-0.5"
                                >
                                  <Download className="h-3 w-3" /> Descargar archivo
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {guide.nro_equipos || 0} {(guide.nro_equipos || 0) === 1 ? 'Unit' : 'Equipos'}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <button
                            onClick={() => handleToggleEstado(guide)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                              guide.estado === 1
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {guide.estado === 1 ? 'Activo' : 'Inactivo'}
                          </button>
                        </TableCell>
                        <TableCell className="py-5 px-6">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(guide)}
                              title="Editar guía"
                              className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors active:scale-90"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleView(guide)}
                              title="Asociar equipos"
                              className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors active:scale-90"
                            >
                              <Link className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(guide)}
                              title="Eliminar guía"
                              className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors active:scale-90"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Paginación */}
            {!guiasLoading && guias.length > 0 && (
              <Pagination
                currentPage={currentPageGuias}
                totalPages={totalPagesGuias}
                totalItems={guias.length}
                itemsPerPage={itemsPerPageGuias}
                onPageChange={setCurrentPageGuias}
                loading={guiasLoading}
              />
            )}
          </TabsContent>

          {/* Indicador por grupo Tab */}
          <TabsContent value="indicador-grupo" className="space-y-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <Input
                placeholder="Buscar por nombre de equipo..."
                className="max-w-xs rounded-full bg-white border-slate-200 focus-visible:ring-blue-500"
                value={searchIndicador}
                onChange={(e) => setSearchIndicador(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto bg-white rounded-xl">
              {indicadoresLoading ? (
                <TableSkeletonRows columns={4} rows={itemsPerPageIndicador} />
              ) : indicadoresFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlignJustify className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">No se encontraron indicadores</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[300px]">
                        Nombre
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-36">
                        Cantidad cubierta
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-36">
                        Cantidad total
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-24">
                        %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicadoresPaginados.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                      >
                        <TableCell className="py-5 px-6 font-medium text-slate-900">
                          <div className="flex items-center justify-between gap-2">
                            <span>{item.nombre}</span>
                            <button
                              onClick={() => handleVerDetalle(item.nombre)}
                              className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
                              title={`Ver detalle de ${item.nombre}`}
                            >
                              <AlignJustify className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {item.cantidad_cubierta}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                            {item.cantidad_total}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.porcentaje === 100 ? "bg-emerald-50 text-emerald-700" :
                            item.porcentaje >= 75 ? "bg-blue-50 text-blue-700" :
                            item.porcentaje >= 50 ? "bg-amber-50 text-amber-700" :
                            "bg-red-50 text-red-700"
                          }`}>
                            {item.porcentaje}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {/* Paginación */}
            {!indicadoresLoading && indicadoresFiltrados.length > 0 && (
              <Pagination
                currentPage={currentPageIndicador}
                totalPages={totalPagesIndicador}
                totalItems={indicadoresFiltrados.length}
                itemsPerPage={itemsPerPageIndicador}
                onPageChange={setCurrentPageIndicador}
                loading={indicadoresLoading}
              />
            )}
          </TabsContent>

          {/* Detalle por grupo Tab */}
          <TabsContent value="detalle-grupo" className="space-y-6 mt-6">
            {/* Header con filtro y botón de exportación */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {selectedEquipoNombre && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-full flex-1">
                  <AlignJustify className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Mostrando detalles de: <span className="font-bold">{selectedEquipoNombre}</span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedEquipoNombre(null);
                      fetchByNombre(null);
                    }}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Ver todos
                  </button>
                </div>
              )}

              <Button
                onClick={() => handleExport('detalle')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 text-sm font-semibold h-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Detalle
              </Button>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl">
              {detallesLoading ? (
                <TableSkeletonRows columns={5} rows={6} />
              ) : detalles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    {selectedEquipoNombre 
                      ? `No hay detalles disponibles para "${selectedEquipoNombre}"`
                      : "No hay detalles disponibles"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-100 hover:bg-slate-50">
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Nombre
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Marca
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Modelo
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                        Cantidad Total
                      </TableHead>
                      <TableHead className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                        Cantidad con guía
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalles.map((item, index) => (
                      <TableRow key={index} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100">
                        <TableCell className="py-5 px-6 font-medium text-slate-900">
                          {item.nombre}
                        </TableCell>
                        <TableCell className="py-5 px-6 text-slate-600">{item.marca || 'N/A'}</TableCell>
                        <TableCell className="py-5 px-6 text-slate-600">{item.modelo || 'N/A'}</TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                            {item.cantidad_total}
                          </span>
                        </TableCell>
                        <TableCell className="py-5 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.cantidad_con_guia === item.cantidad_total
                              ? "bg-emerald-50 text-emerald-700"
                              : item.cantidad_con_guia > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}>
                            {item.cantidad_con_guia}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="text-sm text-slate-600">
              Mostrando {detalles.length} registro{detalles.length !== 1 ? 's' : ''} detallado{detalles.length !== 1 ? 's' : ''}
              {selectedEquipoNombre && ` de "${selectedEquipoNombre}"`}
            </div>
          </TabsContent>

          {/* Inclusiones/Exclusiones Tab */}
          <TabsContent value="inclusiones" className="space-y-6 mt-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                Configuración de Filtros para Cálculo de Cobertura
              </h3>
              <p className="text-sm text-slate-500">
                Estos criterios determinan qué equipos se consideran “priorizados” en el cálculo de cobertura de guías rápidas.
              </p>
            </div>

            {inclusionesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-full">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Riesgos Incluidos */}
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <span className="text-xl font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base tracking-tight">
                          Riesgos Incluidos
                        </h4>
                        <p className="text-xs text-slate-500">
                          Solo equipos con estos riesgos se consideran priorizados
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {riesgosIncluidos.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <File className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">No hay riesgos configurados</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {riesgosIncluidos.map((riesgo, index) => (
                          <div
                            key={riesgo.id}
                            className="flex items-center gap-3 p-3 bg-emerald-50/60 rounded-full hover:bg-emerald-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <span className="text-emerald-900 font-medium">
                              {riesgo.nombre || riesgo.name || 'Sin nombre'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        Total: {riesgosIncluidos.length} nivel{riesgosIncluidos.length !== 1 ? 'es' : ''} de riesgo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estados Excluidos */}
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                        <span className="text-xl font-bold">✕</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base tracking-tight">
                          Estados Excluidos
                        </h4>
                        <p className="text-xs text-slate-500">
                          Equipos en estos estados NO se cuentan en estadísticas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {estadosExcluidos.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <File className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">No hay estados excluidos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {estadosExcluidos.map((estado, index) => (
                          <div
                            key={estado.id}
                            className="flex items-center gap-3 p-3 bg-red-50/60 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <span className="text-red-900 font-medium">
                              {estado.nombre || estado.name || 'Sin nombre'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">
                        Total: {estadosExcluidos.length} estado{estadosExcluidos.length !== 1 ? 's' : ''} excluido{estadosExcluidos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">i</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-extrabold mb-3 text-lg tracking-tight">Criterios de Cálculo de Cobertura</h5>

                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold mb-2 text-blue-50">
                      Fórmula de Cálculo:
                    </p>
                    <div className="bg-white/15 rounded-lg p-3 font-mono text-sm text-white">
                      (Equipos priorizados con guía / Total equipos priorizados) × 100
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold mb-2 text-white">Equipos Priorizados incluyen:</p>
                      <ul className="space-y-1.5 ml-1">
                        <li className="flex items-start gap-2 text-sm text-blue-50">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span>Solo equipos <strong>biomédicos</strong> (tipo_id = 1)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-50">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span>Estados <strong>NO excluidos</strong> (tabla estados_excluidos_guias)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-50">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span><strong>Riesgos incluidos</strong> (tabla riesgos_incluidos_guias)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-50">
                          <span className="text-emerald-300 font-bold">✓</span>
                          <span>Equipos <strong>NO excluidos específicamente</strong> (tabla equipos_excluidos_guias)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-50">
                          <span className="text-red-300 font-bold">✕</span>
                          <span>Excluye <strong>sede 2 con propietario 25</strong></span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-blue-50 italic">
                        <strong>Nota:</strong> La sede se obtiene a través de la relación:
                        <code className="bg-white/15 px-2 py-0.5 rounded mx-1">equipos → servicios → sedes</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <div className="mt-8 py-4 text-center text-sm text-slate-500">
        <p>
          Versión 6 | Copyright © 2024 EVA gestiona la tecnología. Todos los
          derechos reservados.
        </p>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && selectedGuide && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              ¿Eliminar guía rápida?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              ¿Está seguro de eliminar la guía “{selectedGuide.name}”?
              {selectedGuide.nro_equipos > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ Esta guía tiene {selectedGuide.nro_equipos} equipos asociados y no podrá ser eliminada.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedGuide(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white rounded-full"
                onClick={handleConfirmDelete}
                disabled={selectedGuide.nro_equipos > 0}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Guía */}
      <CreateGuiaModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={createGuia}
        onSuccess={() => {
          refreshGuias();
        }}
      />

      {/* Modal de Editar Guía */}
      <EditGuiaModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedGuide(null);
        }}
        guia={selectedGuide}
        onSuccess={() => {
          refreshGuias();
          toast.success("Guía actualizada exitosamente");
        }}
      />

      {/* Modal de Asociar Equipos */}
      <AsociarEquipoGuiaModal
        isOpen={asociarModalOpen}
        onClose={() => {
          setAsociarModalOpen(false);
          setSelectedGuide(null);
        }}
        guia={selectedGuide}
        onSuccess={() => {
          refreshGuias();
          toast.success("Equipos asociados exitosamente");
        }}
      />
    </div>
  );
}

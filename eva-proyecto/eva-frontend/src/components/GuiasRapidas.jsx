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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-600 text-white px-4 md:px-6 py-6">
        <h1 className="text-2xl md:text-3xl font-bold">Guides</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        {/* Botones de Exportación - Fijos para todas las pestañas */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Exportar Reportes</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleExport('priorizados')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Priorizados
            </Button>
            <Button
              onClick={() => handleExport('con-guia')}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Con Guía
            </Button>
            <Button
              onClick={() => handleExport('sin-guia')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Sin Guía
            </Button>
            <Button
              onClick={() => handleExport('indicador')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Indicador por Grupo
            </Button>
            <Button
              onClick={() => handleExport('detalle')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Detalle por Grupo
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 mb-6">
            <TabsTrigger
              value="guias-rapidas"
              className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              Guías rápidas
            </TabsTrigger>
            <TabsTrigger
              value="indicador-grupo"
              className="text-xs md:text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Indicador por grupo
            </TabsTrigger>
            <TabsTrigger
              value="detalle-grupo"
              className="text-xs md:text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Detalle por grupo
            </TabsTrigger>
            <TabsTrigger
              value="inclusiones"
              className="text-xs md:text-sm data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
            >
              Inclusiones/Exclusiones
            </TabsTrigger>
          </TabsList>

          {/* Guías rápidas Tab */}
          <TabsContent value="guias-rapidas" className="space-y-6">
            <div>
              <div className="text-sm font-semibold text-gray-800 mb-3">
                Cobertura de Guías Rápidas: {cobertura.porcentaje}% - 
                Cumplen criterios: {cobertura.cumplenCriterios} - 
                Cumplen criterios con guía: {cobertura.cumplenConGuia}
              </div>

              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 text-base font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Guía Rápida
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <File className="h-3 w-3 mr-1" />
                  Cumplen criterios: {cobertura.cumplenCriterios}
                </Badge>
                <Badge className="bg-green-500 text-white px-3 py-1">
                  <File className="h-3 w-3 mr-1" />
                  Cumplen criterios con guía: {cobertura.cumplenConGuia}
                </Badge>
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  <File className="h-3 w-3 mr-1" />
                  Cobertura: {cobertura.porcentaje}%
                </Badge>
              </div>

              <p className="text-sm text-gray-600">
                Mostrando {guias.length} guías rápidas registradas
              </p>
            </div>

            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
              {guiasLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Cargando guías...</span>
                </div>
              ) : guias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <File className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">No hay guías rápidas registradas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="text-center font-semibold text-gray-700 w-12">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Nombre de la guía
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 w-24">
                        #Equipos
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 w-24">
                        Estado
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 w-32">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guiasPaginadas.map((guide, index) => (
                      <TableRow
                        key={guide.id}
                        className="hover:bg-gray-50 border-b"
                      >
                        <TableCell className="text-center font-medium">
                          {startIndexGuias + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-orange-500" />
                            <span className="font-medium text-gray-800">
                              {guide.name}
                            </span>
                            {guide.file && (
                              <a 
                                href={`${import.meta.env.VITE_API_BASE_URL || 'http://192.168.56.1:8001'}/storage/guias/${guide.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2"
                              >
                                <Download className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {guide.nro_equipos || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleToggleEstado(guide)}
                            className="flex items-center justify-center gap-1 mx-auto"
                          >
                            <span className={guide.estado === 1 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                              {guide.estado === 1 ? "✓" : "✗"}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {guide.estado === 1 ? "Activo" : "Inactivo"}
                            </span>
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white p-1 h-7 w-7"
                              onClick={() => handleEdit(guide)}
                              title="Editar guía"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white p-1 h-7 w-7"
                              onClick={() => handleView(guide)}
                              title="Asociar equipos"
                            >
                              <Link className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white p-1 h-7 w-7"
                              onClick={() => handleDelete(guide)}
                              title="Eliminar guía"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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
          <TabsContent value="indicador-grupo" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <Input 
                placeholder="Buscar por nombre de equipo..." 
                className="max-w-xs"
                value={searchIndicador}
                onChange={(e) => setSearchIndicador(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
              {indicadoresLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Cargando indicadores...</span>
                </div>
              ) : indicadoresFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlignJustify className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">No se encontraron indicadores</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-semibold text-gray-700 min-w-[300px]">
                        Nombre
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 w-32">
                        Cantidad cubierta
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 w-32">
                        Cantidad total
                      </TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 w-24">
                        %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicadoresPaginados.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 border-b"
                      >
                        <TableCell className="font-medium text-gray-800">
                          <div className="flex items-center justify-between gap-2">
                            <span>{item.nombre}</span>
                            <button
                              onClick={() => handleVerDetalle(item.nombre)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                              title={`Ver detalle de ${item.nombre}`}
                            >
                              <AlignJustify className="h-4 w-4 text-blue-500 cursor-pointer" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {item.cantidad_cubierta}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                            {item.cantidad_total}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            item.porcentaje === 100 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                            item.porcentaje >= 75 ? "bg-blue-100 text-blue-700 border-blue-200" :
                            item.porcentaje >= 50 ? "bg-amber-100 text-amber-700 border-amber-200" :
                            "bg-red-100 text-red-700 border-red-200"
                          }>
                            {item.porcentaje}%
                          </Badge>
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
          <TabsContent value="detalle-grupo" className="space-y-6">
            {/* Header con filtro y botón de exportación */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {selectedEquipoNombre && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex-1">
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
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Detalle
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
              {detallesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Cargando detalles...</span>
                </div>
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
                  <TableHeader className="bg-purple-50">
                    <TableRow>
                      <TableHead className="font-semibold text-purple-900">
                        Nombre
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900">
                        Marca
                      </TableHead>
                      <TableHead className="font-semibold text-purple-900">
                        Modelo
                      </TableHead>
                      <TableHead className="text-center font-semibold text-purple-900">
                        Cantidad Total
                      </TableHead>
                      <TableHead className="text-center font-semibold text-purple-900">
                        Cantidad con guía
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalles.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 border-b">
                        <TableCell className="font-medium text-gray-800">
                          {item.nombre}
                        </TableCell>
                        <TableCell className="text-gray-700">{item.marca || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700">{item.modelo || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                            {item.cantidad_total}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            item.cantidad_con_guia === item.cantidad_total 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : item.cantidad_con_guia > 0
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }>
                            {item.cantidad_con_guia}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {detalles.length} registro{detalles.length !== 1 ? 's' : ''} detallado{detalles.length !== 1 ? 's' : ''}
              {selectedEquipoNombre && ` de "${selectedEquipoNombre}"`}
            </div>
          </TabsContent>

          {/* Inclusiones/Exclusiones Tab */}
          <TabsContent value="inclusiones" className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ⚙️ Configuración de Filtros para Cálculo de Cobertura
              </h3>
              <p className="text-sm text-gray-600">
                Estos criterios determinan qué equipos se consideran "priorizados" en el cálculo de cobertura de guías rápidas.
              </p>
            </div>

            {inclusionesLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Cargando configuración...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Riesgos Incluidos */}
                <div className="bg-white rounded-lg border-2 border-emerald-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border-b-2 border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900 text-lg">
                          RIESGOS INCLUIDOS
                        </h4>
                        <p className="text-xs text-emerald-700">
                          Solo equipos con estos riesgos se consideran priorizados
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {riesgosIncluidos.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-gray-400 text-2xl">📋</span>
                        </div>
                        <p className="text-gray-500 text-sm">No hay riesgos configurados</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {riesgosIncluidos.map((riesgo, index) => (
                          <div 
                            key={riesgo.id} 
                            className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
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
                    
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <p className="text-xs text-emerald-700 font-medium">
                        📊 Total: {riesgosIncluidos.length} nivel{riesgosIncluidos.length !== 1 ? 'es' : ''} de riesgo
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estados Excluidos */}
                <div className="bg-white rounded-lg border-2 border-red-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b-2 border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">✕</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-900 text-lg">
                          ESTADOS EXCLUIDOS
                        </h4>
                        <p className="text-xs text-red-700">
                          Equipos en estos estados NO se cuentan en estadísticas
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {estadosExcluidos.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-gray-400 text-2xl">📋</span>
                        </div>
                        <p className="text-gray-500 text-sm">No hay estados excluidos</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {estadosExcluidos.map((estado, index) => (
                          <div 
                            key={estado.id} 
                            className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
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
                    
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="text-xs text-red-700 font-medium">
                        📊 Total: {estadosExcluidos.length} estado{estadosExcluidos.length !== 1 ? 's' : ''} excluido{estadosExcluidos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">ℹ️</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-blue-900 mb-3 text-lg">Criterios de Cálculo de Cobertura</h5>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                    <p className="text-sm text-blue-900 font-semibold mb-2">
                      📐 Fórmula de Cálculo:
                    </p>
                    <div className="bg-blue-100 rounded p-3 font-mono text-sm text-blue-900">
                      (Equipos priorizados con guía / Total equipos priorizados) × 100
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-blue-900 mb-2">✅ Equipos Priorizados incluyen:</p>
                      <ul className="space-y-1.5 ml-4">
                        <li className="flex items-start gap-2 text-sm text-blue-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Solo equipos <strong>biomédicos</strong> (tipo_id = 1)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Estados <strong>NO excluidos</strong> (tabla estados_excluidos_guias)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span><strong>Riesgos incluidos</strong> (tabla riesgos_incluidos_guias)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Equipos <strong>NO excluidos específicamente</strong> (tabla equipos_excluidos_guias)</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm text-blue-800">
                          <span className="text-red-600 font-bold">✕</span>
                          <span>Excluye <strong>sede 2 con propietario 25</strong></span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-800 italic">
                        💡 <strong>Nota:</strong> La sede se obtiene a través de la relación: 
                        <code className="bg-white px-2 py-0.5 rounded mx-1">equipos → servicios → sedes</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="mt-8 py-4 text-center text-sm text-gray-500 border-t bg-gray-50">
        <p>
          Versión 6 | Copyright © 2024 EVA gestiona la tecnología. Todos los
          derechos reservados.
        </p>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Eliminar guía rápida?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Está seguro de eliminar la guía "{selectedGuide.name}"?
              {selectedGuide.nro_equipos > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ Esta guía tiene {selectedGuide.nro_equipos} equipos asociados y no podrá ser eliminada.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedGuide(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
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

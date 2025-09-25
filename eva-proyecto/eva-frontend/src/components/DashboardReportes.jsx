import React, { useState, useEffect, useCallback } from "react";
import { CalendarIcon, Search, ChevronDown, ChevronLeft, ChevronRight, Download, Filter, X, Eye, FileText, Share2, Edit, Trash2, Plus, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function DashboardReportes() {
  // Estados de filtros
  const [filters, setFilters] = useState({
    closeDateStart: "2024-06-23",
    closeDateEnd: "2026-06-19",
    creationDateStart: "2024-06-23",
    creationDateEnd: "2026-06-19",
    year: "2024",
    theme: "fondo1",
    module: "todos",
    risk: "todos",
    search: "",
    pageSize: 10,
    currentPage: 1,
    sortBy: "nombre",
    sortDir: "asc",
    estado: null
  });

  // Estado para tabla seleccionada
  const [selectedTable, setSelectedTable] = useState("preventivos");
  
  // Estados adicionales
  const [cache, setCache] = useState(new Map());
  
  // Estados de modales
  const [modals, setModals] = useState({
    detailModal: { open: false, data: null },
    exportModal: { open: false, section: null },
    shareModal: { open: false },
    filtersModal: { open: false },
    editModal: { open: false, data: null, isNew: false },
    deleteModal: { open: false, data: null }
  });

  // Estado para formulario de edición
  const [editForm, setEditForm] = useState({
    modulo: '',
    registros: '',
    cantidad: '',
    estado: 'Activo',
    descripcion: '',
    fechaCreacion: '',
    responsable: ''
  });
  
  // Estados de datos
  const [data, setData] = useState({
    kpis: { totalEquipos: 9740, enPlan: 1241, comodato: 4211, sinPlan: 3584 },
    equipmentStates: [
      { estado: "Activo", numero: 412, color: "bg-green-500" },
      { estado: "Inactivo", numero: 234, color: "bg-red-500" },
      { estado: "Mantenimiento", numero: 156, color: "bg-yellow-500" }
    ],
    equipmentTable: { 
      items: [
        { modulo: "CARDIOLOGÍA-UREA", registros: 15, cantidad: 8 },
        { modulo: "LABORATORIO CLÍNICO", registros: 12, cantidad: 6 },
        { modulo: "RADIOLOGÍA", registros: 8, cantidad: 4 }
      ], 
      total: 3, 
      totalPages: 1 
    },
    preventiveData: [
      { año: "2023", cantidadProgramadas: 1250, cantidadEjecutadas: 1180, porcentajeEjecucion: 94.4 },
      { año: "2024", cantidadProgramadas: 1340, cantidadEjecutadas: 1205, porcentajeEjecucion: 89.9 }
    ],
    globalYearData: [
      { año: "2023", cantidadProgramadas: 1250, cantidadEjecutadas: 1180, porcentajeEjecucion: 94.4 },
      { año: "2024", cantidadProgramadas: 1340, cantidadEjecutadas: 1205, porcentajeEjecucion: 89.9 }
    ],
    globalMonthData: [
      { año: "2024", mes: "Enero", cantidadPreventivaProgramadas: 125, cantidadPreventivaEjecutadas: 118, porcentajeEjecucion: 94.4 },
      { año: "2024", mes: "Febrero", cantidadPreventivaProgramadas: 110, cantidadPreventivaEjecutadas: 102, porcentajeEjecucion: 92.7 }
    ]
  });

  // Estados de UI
  const [loading, setLoading] = useState({ kpis: false, table: false, charts: false });
  const [error, setError] = useState(null);

  // Handlers de filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, currentPage: 1 }));
  };

  const handleSearch = () => {
    console.log('Searching:', filters.search);
  };

  const handleApplyDateFilter = (type) => {
    const startDate = type === 'close' ? filters.closeDateStart : filters.creationDateStart;
    const endDate = type === 'close' ? filters.closeDateEnd : filters.creationDateEnd;
    
    if (new Date(startDate) > new Date(endDate)) {
      setError("La fecha inicial debe ser menor a la fecha final");
      return;
    }
    
    setError(null);
    console.log(`Filtro de ${type} aplicado: ${startDate} - ${endDate}`);
  };

  const handleSort = (column) => {
    const newDir = filters.sortBy === column && filters.sortDir === "asc" ? "desc" : "asc";
    setFilters(prev => ({ ...prev, sortBy: column, sortDir: newDir }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= data.equipmentTable.totalPages) {
      setFilters(prev => ({ ...prev, currentPage: page }));
    }
  };

  const handleStateClick = (estado) => {
    setFilters(prev => ({ ...prev, estado: estado, currentPage: 1 }));
    console.log(`Filtro aplicado por estado: ${estado}`);
  };

  const handleExport = (type, section = 'all') => {
    setModals(prev => ({ ...prev, exportModal: { open: true, section, type } }));
  };

  const handleDetailView = (item) => {
    setModals(prev => ({ ...prev, detailModal: { open: true, data: item } }));
  };

  const handleShare = () => {
    setModals(prev => ({ ...prev, shareModal: { open: true } }));
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: { ...prev[modalName], open: false } }));
  };

  const confirmExport = () => {
    const { section, type } = modals.exportModal;
    console.log(`Exportando ${section} en formato ${type}`);
    // Simular descarga
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${section}_${new Date().toISOString().split('T')[0]}.${type}`;
    link.click();
    closeModal('exportModal');
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?filters=${encodeURIComponent(JSON.stringify(filters))}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
    closeModal('shareModal');
  };

  // CRUD Operations
  const handleEdit = (item) => {
    setEditForm({
      modulo: item.modulo,
      registros: item.registros.toString(),
      cantidad: item.cantidad.toString(),
      estado: 'Activo',
      descripcion: `Módulo ${item.modulo}`,
      fechaCreacion: '2024-01-15',
      responsable: 'Admin'
    });
    setModals(prev => ({ ...prev, editModal: { open: true, data: item, isNew: false } }));
  };

  const handleAdd = () => {
    setEditForm({
      modulo: '',
      registros: '',
      cantidad: '',
      estado: 'Activo',
      descripcion: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
      responsable: 'Admin'
    });
    setModals(prev => ({ ...prev, editModal: { open: true, data: null, isNew: true } }));
  };

  const handleDelete = (item) => {
    setModals(prev => ({ ...prev, deleteModal: { open: true, data: item } }));
  };

  const confirmDelete = () => {
    const itemToDelete = modals.deleteModal.data;
    setData(prev => ({
      ...prev,
      equipmentTable: {
        ...prev.equipmentTable,
        items: prev.equipmentTable.items.filter(item => item.modulo !== itemToDelete.modulo),
        total: prev.equipmentTable.total - 1
      }
    }));
    closeModal('deleteModal');
    alert(`${itemToDelete.modulo} eliminado correctamente`);
  };

  const saveItem = () => {
    const { isNew } = modals.editModal;
    const newItem = {
      modulo: editForm.modulo,
      registros: parseInt(editForm.registros),
      cantidad: parseInt(editForm.cantidad),
      estado: editForm.estado,
      descripcion: editForm.descripcion,
      fechaCreacion: editForm.fechaCreacion,
      responsable: editForm.responsable
    };

    if (isNew) {
      setData(prev => ({
        ...prev,
        equipmentTable: {
          ...prev.equipmentTable,
          items: [...prev.equipmentTable.items, newItem],
          total: prev.equipmentTable.total + 1
        }
      }));
      alert('Nuevo módulo agregado correctamente');
    } else {
      setData(prev => ({
        ...prev,
        equipmentTable: {
          ...prev.equipmentTable,
          items: prev.equipmentTable.items.map(item => 
            item.modulo === modals.editModal.data.modulo ? newItem : item
          )
        }
      }));
      alert('Módulo actualizado correctamente');
    }
    closeModal('editModal');
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      closeDateStart: "2024-06-23",
      closeDateEnd: "2026-06-19",
      creationDateStart: "2024-06-23",
      creationDateEnd: "2026-06-19",
      year: "2024",
      theme: "fondo1",
      module: "todos",
      risk: "todos",
      search: "",
      pageSize: 10,
      currentPage: 1,
      sortBy: "nombre",
      sortDir: "asc",
      estado: null
    });
  };

  const onYearChange = (year) => {
    setFilters(prev => ({ ...prev, year, currentPage: 1 }));
    console.log(`Filtro de año aplicado: ${year}`);
  };

  const onEstadoClick = (estado) => {
    setFilters(prev => ({ ...prev, estado, currentPage: 1 }));
    console.log(`Filtro de estado aplicado: ${estado}`);
  };

  const renderSelectedTable = () => {
    switch (selectedTable) {
      case "preventivos":
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-slate-700">Seguimiento a Preventivos</h4>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel', 'preventivos')} className="h-6 px-2 text-xs">
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">Año</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">Prog.</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">Ejec.</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.preventiveData.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50 cursor-pointer" onClick={() => onYearChange(item.año)}>
                      <TableCell className="font-medium text-xs py-1">{item.año}</TableCell>
                      <TableCell className="text-xs py-1">{item.cantidadProgramadas}</TableCell>
                      <TableCell className="text-xs py-1">{item.cantidadEjecutadas}</TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-1">
                          <Progress value={item.porcentajeEjecucion} className="w-8 h-1" />
                          <Badge variant="secondary" className="text-xs px-1">
                            {item.porcentajeEjecucion}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "correctivos":
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-slate-700">Seguimiento a Correctivos</h4>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel', 'correctivos')} className="h-6 px-2 text-xs">
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {[
                { estado: "Abierto", cantidad: 85, color: "bg-red-500" },
                { estado: "En proceso", cantidad: 42, color: "bg-yellow-500" },
                { estado: "Cerrado", cantidad: 156, color: "bg-green-500" },
                { estado: "Cancelado", cantidad: 23, color: "bg-gray-500" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => onEstadoClick(item.estado)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                    <span className="text-xs font-medium text-slate-700">{item.estado}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.cantidad}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case "globales-ano":
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-slate-700">Resultados Globales por Año</h4>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel', 'globales-ano')} className="h-6 px-2 text-xs">
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">Año</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">Prog.</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">Ejec.</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700 py-1">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.globalYearData.map((item, index) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-xs py-1">{item.año}</TableCell>
                      <TableCell className="text-xs py-1">{item.cantidadProgramadas}</TableCell>
                      <TableCell className="text-xs py-1">{item.cantidadEjecutadas}</TableCell>
                      <TableCell className="py-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.porcentajeEjecucion}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "globales-mes":
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-slate-700">Resultados por Mes - {filters.year}</h4>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel', 'globales-mes')} className="h-6 px-2 text-xs">
                <Download className="h-3 w-3" />
              </Button>
            </div>
            {data.globalMonthData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-slate-700 py-1">Mes</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-1">Prog.</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-1">Ejec.</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-700 py-1">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.globalMonthData.map((item, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-xs py-1">{item.mes}</TableCell>
                        <TableCell className="text-xs py-1">{item.cantidadPreventivaProgramadas}</TableCell>
                        <TableCell className="text-xs py-1">{item.cantidadPreventivaEjecutadas}</TableCell>
                        <TableCell className="py-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.porcentajeEjecucion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-4">
                Seleccione un año específico para ver datos mensuales
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-xs text-slate-500">Seleccione una tabla para visualizar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Tablero de indicadores y control</h1>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Métricas principales con drill-down */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: "Total de equipos Registrados", value: data.kpis.totalEquipos, color: "cyan", change: "+5.2%" },
            { label: "Incluidos en plan preventivo", value: data.kpis.enPlan, color: "green", change: "+2.1%" },
            { label: "Total de equipos en comodato", value: data.kpis.comodato, color: "orange", change: "-1.3%" },
            { label: "Total no incluidos en el plan", value: data.kpis.sinPlan, color: "red", change: "+0.8%" }
          ].map((kpi, index) => (
            <Card 
              key={index} 
              className={`border-l-2 border-l-${kpi.color}-500 hover:shadow-sm transition-all duration-200 cursor-pointer`}
              onClick={() => handleFilterChange('kpiFilter', kpi.label)}
            >
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-xs font-medium text-${kpi.color}-700 mb-1 leading-tight`}>{kpi.label}</p>
                    <div className="flex items-center gap-1">
                      <p className={`text-lg font-bold text-${kpi.color}-900`}>
                        {kpi.value.toLocaleString()}
                      </p>
                      <Badge variant={kpi.change.startsWith('+') ? 'default' : 'destructive'} className="text-xs px-1 py-0 h-4">
                        {kpi.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`w-6 h-6 bg-${kpi.color}-500 rounded flex items-center justify-center ml-2`}>
                    <div className="w-3 h-3 border border-white rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Layout principal compacto */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Panel de filtros unificado */}
          <div className="xl:col-span-3">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-900">Panel de Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Estados */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Estados</label>
                  <div className="space-y-1">
                    {data.equipmentStates.slice(0, 3).map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => handleStateClick(item.estado)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                          <span className="text-xs font-medium text-slate-700">{item.estado}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {item.numero}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controles */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Controles</label>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Año</label>
                      <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Tema</label>
                      <Select value={filters.theme} onValueChange={(value) => handleFilterChange('theme', value)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fondo1">Claro</SelectItem>
                          <SelectItem value="fondo2">Oscuro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Filtros de fecha */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Filtros de Fecha</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Fecha Cierre</label>
                      <div className="grid grid-cols-2 gap-1">
                        <Input
                          type="date"
                          value={filters.closeDateStart}
                          onChange={(e) => handleFilterChange('closeDateStart', e.target.value)}
                          className="h-7 text-xs"
                        />
                        <Input
                          type="date"
                          value={filters.closeDateEnd}
                          onChange={(e) => handleFilterChange('closeDateEnd', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <Button 
                        size="sm"
                        className="w-full mt-1 h-6 text-xs bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleApplyDateFilter('close')}
                      >
                        Aplicar
                      </Button>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Fecha Creación</label>
                      <div className="grid grid-cols-2 gap-1">
                        <Input
                          type="date"
                          value={filters.creationDateStart}
                          onChange={(e) => handleFilterChange('creationDateStart', e.target.value)}
                          className="h-7 text-xs"
                        />
                        <Input
                          type="date"
                          value={filters.creationDateEnd}
                          onChange={(e) => handleFilterChange('creationDateEnd', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <Button 
                        size="sm"
                        className="w-full mt-1 h-6 text-xs bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleApplyDateFilter('creation')}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Clasificación de riesgo */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Riesgo</label>
                  <Select value={filters.risk} onValueChange={(value) => handleFilterChange('risk', value)}>
                    <SelectTrigger className="h-8 text-xs mb-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="medio-alto">Medio Alto</SelectItem>
                      <SelectItem value="medio">Medio</SelectItem>
                      <SelectItem value="bajo">Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-1">
                    {[
                      { nivel: "ALTO", cantidad: 234, color: "bg-red-500", value: "alto" },
                      { nivel: "M.ALTO", cantidad: 456, color: "bg-orange-500", value: "medio-alto" },
                      { nivel: "MEDIO", cantidad: 678, color: "bg-yellow-500", value: "medio" },
                      { nivel: "BAJO", cantidad: 890, color: "bg-green-500", value: "bajo" },
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-1 bg-slate-50 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => handleFilterChange('risk', item.value)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                          <span className="text-xs font-medium text-slate-700">{item.nivel}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {item.cantidad}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna central - Tabla interactiva */}
          <div className="xl:col-span-5">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Cantidad por equipos</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleAdd} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('excel', 'table')} className="gap-2">
                      <Download className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Buscar módulo..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pr-10"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSearch}
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                  </div>
                  <Select value={filters.module} onValueChange={(value) => handleFilterChange('module', value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los módulos</SelectItem>
                      <SelectItem value="CARDIOLOGÍA-UREA">Cardiología</SelectItem>
                      <SelectItem value="LABORATORIO CLÍNICO">Laboratorio</SelectItem>
                      <SelectItem value="RADIOLOGÍA">Radiología</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.pageSize.toString()} onValueChange={(value) => handleFilterChange('pageSize', parseInt(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead 
                          className="font-semibold text-slate-900 cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('modulo')}
                        >
                          Nombre {filters.sortBy === 'modulo' && (filters.sortDir === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-900 cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('registros')}
                        >
                          Registros {filters.sortBy === 'registros' && (filters.sortDir === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-900 cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('cantidad')}
                        >
                          Cantidad {filters.sortBy === 'cantidad' && (filters.sortDir === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-semibold text-slate-900 w-32">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.equipmentTable.items.map((item, index) => (
                        <TableRow key={index} className="hover:bg-slate-50 transition-colors duration-150">
                          <TableCell className="font-medium text-slate-900">{item.modulo}</TableCell>
                          <TableCell className="text-slate-600">{item.registros}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold">
                              {item.cantidad}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleDetailView(item)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Paginación compacta */}
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-slate-500">
                    {((filters.currentPage - 1) * filters.pageSize) + 1}-{Math.min(filters.currentPage * filters.pageSize, data.equipmentTable.total)} de {data.equipmentTable.total}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={filters.currentPage === 1}
                      onClick={() => handlePageChange(filters.currentPage - 1)}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex gap-1">
                      {[...Array(Math.min(3, data.equipmentTable.totalPages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={filters.currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-7 h-7 text-xs"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={filters.currentPage === data.equipmentTable.totalPages}
                      onClick={() => handlePageChange(filters.currentPage + 1)}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Selector de tablas */}
          <div className="xl:col-span-4">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-900">Tablas de Análisis</CardTitle>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="w-40 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventivos">Seguimiento Preventivos</SelectItem>
                      <SelectItem value="correctivos">Seguimiento Correctivos</SelectItem>
                      <SelectItem value="globales-ano">Resultados por Año</SelectItem>
                      <SelectItem value="globales-mes">Resultados por Mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mostrar filtros aplicados */}
                <div className="mb-3 p-2 bg-slate-50 rounded text-xs">
                  <div className="font-medium text-slate-700 mb-1">Filtros Aplicados:</div>
                  <div className="space-y-1 text-slate-600">
                    <div>Año: {filters.year}</div>
                    {filters.estado && <div>Estado: {filters.estado}</div>}
                    {filters.risk !== "todos" && <div>Riesgo: {filters.risk}</div>}
                    {filters.search && <div>Búsqueda: {filters.search}</div>}
                  </div>
                </div>

                {/* Contenido de tabla seleccionada */}
                {renderSelectedTable()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Modal de Detalle */}
        <Dialog open={modals.detailModal.open} onOpenChange={() => closeModal('detailModal')}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle Completo del Módulo</DialogTitle>
            </DialogHeader>
            {modals.detailModal.data && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Módulo</Label>
                    <p className="text-lg font-semibold">{modals.detailModal.data.modulo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Registros</Label>
                    <p className="text-lg">{modals.detailModal.data.registros}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Cantidad</Label>
                    <p className="text-lg">{modals.detailModal.data.cantidad}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Estado</Label>
                    <Badge variant="outline">Activo</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Fecha Creación</Label>
                    <p className="text-sm">15/01/2024</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Responsable</Label>
                    <p className="text-sm">Admin Sistema</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Descripción Completa</Label>
                  <p className="text-sm text-slate-600 mt-1 p-3 bg-slate-50 rounded">
                    El módulo {modals.detailModal.data.modulo} gestiona {modals.detailModal.data.registros} registros activos 
                    con una cantidad total de {modals.detailModal.data.cantidad} elementos. Este módulo es crítico para 
                    las operaciones diarias y requiere monitoreo constante.
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Estadísticas</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="p-3 bg-green-50 rounded">
                      <p className="text-xs text-green-600">Eficiencia</p>
                      <p className="text-lg font-bold text-green-700">94.2%</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-xs text-blue-600">Disponibilidad</p>
                      <p className="text-lg font-bold text-blue-700">99.8%</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleEdit(modals.detailModal.data)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button onClick={() => handleExport('pdf', modals.detailModal.data.modulo)}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Detalle
                  </Button>
                  <Button variant="outline" onClick={() => closeModal('detailModal')}>Cerrar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Edición/Agregar */}
        <Dialog open={modals.editModal.open} onOpenChange={() => closeModal('editModal')}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{modals.editModal.isNew ? 'Agregar Nuevo Módulo' : 'Editar Módulo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modulo">Nombre del Módulo *</Label>
                  <Input
                    id="modulo"
                    value={editForm.modulo}
                    onChange={(e) => handleFormChange('modulo', e.target.value)}
                    placeholder="Ej: CARDIOLOGÍA-UREA"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={editForm.estado} onValueChange={(value) => handleFormChange('estado', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                      <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registros">Número de Registros *</Label>
                  <Input
                    id="registros"
                    type="number"
                    value={editForm.registros}
                    onChange={(e) => handleFormChange('registros', e.target.value)}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label htmlFor="cantidad">Cantidad *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    value={editForm.cantidad}
                    onChange={(e) => handleFormChange('cantidad', e.target.value)}
                    placeholder="8"
                  />
                </div>
                <div>
                  <Label htmlFor="fechaCreacion">Fecha de Creación</Label>
                  <Input
                    id="fechaCreacion"
                    type="date"
                    value={editForm.fechaCreacion}
                    onChange={(e) => handleFormChange('fechaCreacion', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="responsable">Responsable</Label>
                  <Input
                    id="responsable"
                    value={editForm.responsable}
                    onChange={(e) => handleFormChange('responsable', e.target.value)}
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={editForm.descripcion}
                  onChange={(e) => handleFormChange('descripcion', e.target.value)}
                  placeholder="Descripción detallada del módulo..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={saveItem} disabled={!editForm.modulo || !editForm.registros || !editForm.cantidad}>
                  <Save className="h-4 w-4 mr-2" />
                  {modals.editModal.isNew ? 'Crear Módulo' : 'Guardar Cambios'}
                </Button>
                <Button variant="outline" onClick={() => closeModal('editModal')}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmación de Eliminación */}
        <AlertDialog open={modals.deleteModal.open} onOpenChange={() => closeModal('deleteModal')}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription>
                {modals.deleteModal.data && (
                  <div>
                    <p>¿Estás seguro de que deseas eliminar el módulo <strong>{modals.deleteModal.data.modulo}</strong>?</p>
                    <p className="mt-2">Esta acción no se puede deshacer y se perderán:</p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>{modals.deleteModal.data.registros} registros asociados</li>
                      <li>{modals.deleteModal.data.cantidad} elementos de cantidad</li>
                      <li>Todo el historial del módulo</li>
                    </ul>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Sí, Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Exportación Avanzada */}
        <Dialog open={modals.exportModal.open} onOpenChange={() => closeModal('exportModal')}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Exportar Datos - {modals.exportModal.section}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Formato de Exportación</Label>
                <Select defaultValue={modals.exportModal.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">📊 Excel (.xlsx) - Recomendado</SelectItem>
                    <SelectItem value="pdf">📄 PDF (.pdf) - Para reportes</SelectItem>
                    <SelectItem value="csv">📋 CSV (.csv) - Datos planos</SelectItem>
                    <SelectItem value="json">🔧 JSON (.json) - Para desarrolladores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Opciones de Exportación</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" id="includeFilters" />
                    <Label htmlFor="includeFilters" className="text-sm">Incluir filtros aplicados</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" id="includeStats" />
                    <Label htmlFor="includeStats" className="text-sm">Incluir estadísticas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" id="includeCharts" />
                    <Label htmlFor="includeCharts" className="text-sm">Incluir gráficos (solo PDF)</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Rango de Datos</Label>
                <Select defaultValue="current">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Página actual ({data.equipmentTable.items.length} registros)</SelectItem>
                    <SelectItem value="all">Todos los datos ({data.equipmentTable.total} registros)</SelectItem>
                    <SelectItem value="filtered">Solo datos filtrados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p className="font-medium text-blue-800">Vista previa:</p>
                <p className="text-blue-600">Se exportarán {data.equipmentTable.total} registros con {Object.keys(filters).filter(k => filters[k] && filters[k] !== 'todos').length} filtros aplicados.</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={confirmExport} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Archivo
                </Button>
                <Button variant="outline" onClick={() => closeModal('exportModal')}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Compartir Avanzado */}
        <Dialog open={modals.shareModal.open} onOpenChange={() => closeModal('shareModal')}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Compartir Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Enlace Directo</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    readOnly 
                    value={`${window.location.origin}${window.location.pathname}?year=${filters.year}&filters=${btoa(JSON.stringify(filters))}`}
                    className="flex-1 text-xs"
                  />
                  <Button onClick={copyShareLink}>
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Este enlace incluye todos los filtros actuales</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-700">Compartir por Email</Label>
                <div className="space-y-3 mt-2">
                  <Input placeholder="destinatario@empresa.com" type="email" />
                  <Input placeholder="Asunto del mensaje" />
                  <Textarea 
                    placeholder="Hola, te comparto este dashboard con los datos actualizados..." 
                    rows={3} 
                  />
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" id="attachPDF" />
                    <Label htmlFor="attachPDF" className="text-sm">Adjuntar reporte en PDF</Label>
                  </div>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Enviar Dashboard
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Opciones de Acceso</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Solo lectura</span>
                    <input type="radio" name="access" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Lectura y exportación</span>
                    <input type="radio" name="access" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-sm">Acceso completo</span>
                    <input type="radio" name="access" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm font-medium text-green-800">Dashboard listo para compartir</p>
                <p className="text-xs text-green-600 mt-1">
                  Filtros activos: Año {filters.year}, {Object.keys(filters).filter(k => filters[k] && filters[k] !== 'todos').length} filtros aplicados
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => closeModal('shareModal')} className="flex-1">Cerrar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
       </div>
    </div>
  );
}

export default DashboardReportes;
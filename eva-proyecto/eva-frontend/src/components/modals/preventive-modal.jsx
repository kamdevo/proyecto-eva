import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Clock, Search, Filter, Download, RefreshCw, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import httpService from '../../services/httpService';
import { useAuth } from '../../hooks/useAuth';
import Pagination from '../common/Pagination';

const PreventiveModal = ({ isOpen, onOpenChange, equipoId }) => {
  const [preventiveData, setPreventiveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState('fecha_programada');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [formData, setFormData] = useState({
    equipo_id: equipoId || '',
    tipo_mantenimiento: '',
    descripcion: '',
    fecha_programada: '',
    frecuencia_dias: '',
    responsable: '',
    estado: 'programado',
    observaciones: '',
    costo_estimado: '',
    repuestos_necesarios: ''
  });

  const { user, hasPermission } = useAuth();
  const itemsPerPage = 10;

  const loadPreventiveData = async (page = 1, search = '', status = 'all', sort = 'fecha_programada', order = 'desc') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString(),
        sort_by: sort,
        sort_order: order
      });

      if (search) params.append('search', search);
      if (status !== 'all') params.append('estado', status);
      if (equipoId) params.append('equipo_id', equipoId);

      const response = await httpService.get(`/v1/planes-mantenimientos?${params}`);
      
      console.log('🔍 API Response:', response);
      console.log('🔍 Response structure:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : 'no data'
      });
      
      if (response.data?.success && response.data?.data) {
        const dataArray = response.data.data.data || [];
        console.log('📊 Data array:', dataArray);
        console.log('📊 Data array length:', dataArray.length);
        console.log('📊 First record:', dataArray[0]);
        
        setPreventiveData(dataArray);
        setTotalPages(response.data.data.last_page || 1);
        setTotalRecords(response.data.data.total || 0);
        setCurrentPage(response.data.data.current_page || 1);
        
        console.log('✅ State updated - preventiveData length:', dataArray.length);
        console.log('✅ Total records:', response.data.data.total);
        console.log('✅ Current page:', response.data.data.current_page);
      } else {
        console.log('❌ Response not successful or no data:', response);
        toast.error('Error al cargar los mantenimientos preventivos');
      }
    } catch (error) {
      console.error('Error loading preventive data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const createPreventive = async () => {
    setLoading(true);
    try {
      const response = await httpService.post('/v1/planes-mantenimientos', formData);
      
      if (response.success) {
        toast.success('Mantenimiento preventivo creado exitosamente');
        setViewMode('list');
        resetForm();
        loadPreventiveData(currentPage, searchTerm, statusFilter, sortField, sortOrder);
      } else {
        toast.error(response.message || 'Error al crear el mantenimiento preventivo');
      }
    } catch (error) {
      console.error('Error creating preventive:', error);
      toast.error('Error al crear el mantenimiento preventivo');
    } finally {
      setLoading(false);
    }
  };

  const updatePreventive = async () => {
    setLoading(true);
    try {
      const response = await httpService.put(`/v1/planes-mantenimientos/${selectedRecord.id}`, formData);
      
      if (response.success) {
        toast.success('Mantenimiento preventivo actualizado exitosamente');
        setViewMode('list');
        resetForm();
        loadPreventiveData(currentPage, searchTerm, statusFilter, sortField, sortOrder);
      } else {
        toast.error(response.message || 'Error al actualizar el mantenimiento preventivo');
      }
    } catch (error) {
      console.error('Error updating preventive:', error);
      toast.error('Error al actualizar el mantenimiento preventivo');
    } finally {
      setLoading(false);
    }
  };

  const deletePreventive = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar este mantenimiento preventivo?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await httpService.delete(`/v1/planes-mantenimientos/${id}`);
      
      if (response.success) {
        toast.success('Mantenimiento preventivo eliminado exitosamente');
        loadPreventiveData(currentPage, searchTerm, statusFilter, sortField, sortOrder);
      } else {
        toast.error(response.message || 'Error al eliminar el mantenimiento preventivo');
      }
    } catch (error) {
      console.error('Error deleting preventive:', error);
      toast.error('Error al eliminar el mantenimiento preventivo');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('estado', statusFilter);
      if (equipoId) params.append('equipo_id', equipoId);

      const response = await httpService.get(`/v1/export/mantenimientos?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mantenimientos_preventivos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      equipo_id: equipoId || '',
      tipo_mantenimiento: '',
      descripcion: '',
      fecha_programada: '',
      frecuencia_dias: '',
      responsable: '',
      estado: 'programado',
      observaciones: '',
      costo_estimado: '',
      repuestos_necesarios: ''
    });
    setSelectedRecord(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    loadPreventiveData(1, value, statusFilter, sortField, sortOrder);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
    loadPreventiveData(1, searchTerm, value, sortField, sortOrder);
  };

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    loadPreventiveData(currentPage, searchTerm, statusFilter, field, newOrder);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPreventiveData(page, searchTerm, statusFilter, sortField, sortOrder);
  };

  const prepareEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      equipo_id: record.equipo_id || equipoId || '',
      tipo_mantenimiento: record.tipo_mantenimiento || '',
      descripcion: record.descripcion || '',
      fecha_programada: record.fecha_programada || '',
      frecuencia_dias: record.frecuencia_dias || '',
      responsable: record.responsable || '',
      estado: record.estado || 'programado',
      observaciones: record.observaciones || '',
      costo_estimado: record.costo_estimado || '',
      repuestos_necesarios: record.repuestos_necesarios || ''
    });
    setViewMode('edit');
  };

  const prepareDetail = (record) => {
    setSelectedRecord(record);
    setViewMode('detail');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      programado: { variant: 'secondary', label: 'Programado' },
      en_progreso: { variant: 'default', label: 'En Progreso' },
      completado: { variant: 'success', label: 'Completado' },
      cancelado: { variant: 'destructive', label: 'Cancelado' },
      reprogramado: { variant: 'warning', label: 'Reprogramado' }
    };
    
    const config = statusConfig[estado] || { variant: 'secondary', label: estado };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  useEffect(() => {
    if (isOpen) {
      loadPreventiveData();
    }
  }, [isOpen]);

  const renderListView = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar mantenimientos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="programado">Programado</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="reprogramado">Reprogramado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={exportData}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {hasPermission('mantenimientos', 'insertar') && (
            <Button
              size="sm"
              onClick={() => setViewMode('create')}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          )}
      </div>
    </div>

  <div className="flex-1 overflow-hidden px-8 py-6 pt-4">
    <div className="border rounded-lg overflow-hidden h-full flex flex-col shadow-sm">
      <div className="flex-1 overflow-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('id')}>
                <div className="flex items-center gap-2">
                  ID
                  {sortField === 'id' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="w-32 px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('equipo_id')}>
                <div className="flex items-center gap-2">
                  Equipo
                  {sortField === 'equipo_id' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="w-64 px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Meses Programados
              </th>
              <th className="w-40 px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('fecha_programada')}>
                <div className="flex items-center gap-2">
                  Fecha Programada
                  {sortField === 'fecha_programada' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="w-32 px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('estado')}>
                <div className="flex items-center gap-2">
                  Estado
                  {sortField === 'estado' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="w-40 px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : preventiveData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="h-8 w-8 text-gray-300" />
                    <p className="text-lg font-medium">No se encontraron mantenimientos preventivos</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              preventiveData.map((record) => {
                console.log('Rendering record:', record);
                return (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">#{record.id}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {record.equipo_id ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                        Equipo #{record.equipo_id}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5 max-w-full">
                      {[
                        { key: 'mes1', label: 'Ene' },
                        { key: 'mes2', label: 'Feb' },
                        { key: 'mes3', label: 'Mar' },
                        { key: 'mes4', label: 'Abr' },
                        { key: 'mes5', label: 'May' },
                        { key: 'mes6', label: 'Jun' },
                        { key: 'mes7', label: 'Jul' },
                        { key: 'mes8', label: 'Ago' },
                        { key: 'mes9', label: 'Sep' },
                        { key: 'mes10', label: 'Oct' },
                        { key: 'mes11', label: 'Nov' },
                        { key: 'mes12', label: 'Dic' }
                      ].filter(mes => record[mes.key] === 1).map(mes => (
                        <Badge key={mes.key} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 px-2 py-0.5 font-medium">
                          {mes.label}
                        </Badge>
                      ))}
                      {[
                        { key: 'mes1', label: 'Ene' },
                        { key: 'mes2', label: 'Feb' },
                        { key: 'mes3', label: 'Mar' },
                        { key: 'mes4', label: 'Abr' },
                        { key: 'mes5', label: 'May' },
                        { key: 'mes6', label: 'Jun' },
                        { key: 'mes7', label: 'Jul' },
                        { key: 'mes8', label: 'Ago' },
                        { key: 'mes9', label: 'Sep' },
                        { key: 'mes10', label: 'Oct' },
                        { key: 'mes11', label: 'Nov' },
                        { key: 'mes12', label: 'Dic' }
                      ].filter(mes => record[mes.key] === 1).length === 0 && (
                        <span className="text-gray-400 text-sm italic">Sin programar</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900">
                    {record.fecha_programada ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(record.fecha_programada).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin fecha</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge 
                      variant={getStatusVariant(record.estado)}
                      className="text-sm px-3 py-1.5 font-medium min-w-fit"
                    >
                      {getStatusLabel(record.estado)}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => prepareDetail(record)}
                        className="hover:bg-blue-50 hover:border-blue-300 px-3 py-2"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {hasPermission('mantenimientos', 'editar') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => prepareEdit(record)}
                          className="hover:bg-green-50 hover:border-green-300 px-3 py-2"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission('mantenimientos', 'eliminar') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePreventive(record.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 px-3 py-2"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRecords}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        loading={loading}
      />
</div>
);

  const getStatusVariant = (estado) => {
    const variants = {
      programado: 'secondary',
      en_progreso: 'default',
      completado: 'success',
      cancelado: 'destructive',
      reprogramado: 'warning'
    };
    return variants[estado] || 'secondary';
  };

  const getStatusLabel = (estado) => {
    const labels = {
      programado: 'Programado',
      en_progreso: 'En Progreso',
      completado: 'Completado',
      cancelado: 'Cancelado',
      reprogramado: 'Reprogramado'
    };
    return labels[estado] || estado;
  };

  const handleView = (record) => {
    prepareDetail(record);
  };

  const handleEdit = (record) => {
    prepareEdit(record);
  };

  const handleDelete = (id) => {
    deletePreventive(id);
  };

  const handleViewDocument = (fileName) => {
    if (!fileName) return;
    
    // Construct the URL for the document in Laravel storage
    const documentUrl = `/storage/mantenimientos/${fileName}`;
    
    // Open document in new window with print functionality
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      toast.error('No se pudo abrir el documento. Verifique que no esté bloqueando ventanas emergentes.');
    }
  };

  const renderForm = () => (
<div className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tipo de Mantenimiento *
      </label>
      <Input
        value={formData.tipo_mantenimiento}
        onChange={(e) => handleFormChange('tipo_mantenimiento', e.target.value)}
        placeholder="Ej: Calibración, Limpieza, Revisión..."
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Fecha Programada *
      </label>
      <Input
        type="date"
        value={formData.fecha_programada}
        onChange={(e) => handleFormChange('fecha_programada', e.target.value)}
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Frecuencia (días)
      </label>
      <Input
        type="number"
        value={formData.frecuencia_dias}
        onChange={(e) => handleFormChange('frecuencia_dias', e.target.value)}
        placeholder="Ej: 30, 90, 365..."
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Responsable
      </label>
      <Input
        value={formData.responsable}
        onChange={(e) => handleFormChange('responsable', e.target.value)}
        placeholder="Nombre del responsable"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Estado
      </label>
      <Select value={formData.estado} onValueChange={(value) => handleFormChange('estado', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="programado">Programado</SelectItem>
          <SelectItem value="en_progreso">En Progreso</SelectItem>
          <SelectItem value="completado">Completado</SelectItem>
          <SelectItem value="cancelado">Cancelado</SelectItem>
          <SelectItem value="reprogramado">Reprogramado</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Costo Estimado
      </label>
      <Input
        type="number"
        step="0.01"
        value={formData.costo_estimado}
        onChange={(e) => handleFormChange('costo_estimado', e.target.value)}
        placeholder="0.00"
      />
    </div>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Descripción *
    </label>
    <textarea
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="3"
      value={formData.descripcion}
      onChange={(e) => handleFormChange('descripcion', e.target.value)}
      placeholder="Descripción detallada del mantenimiento..."
      required
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Repuestos Necesarios
    </label>
    <textarea
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="2"
      value={formData.repuestos_necesarios}
      onChange={(e) => handleFormChange('repuestos_necesarios', e.target.value)}
      placeholder="Lista de repuestos o materiales necesarios..."
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Observaciones
    </label>
    <textarea
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="2"
      value={formData.observaciones}
      onChange={(e) => handleFormChange('observaciones', e.target.value)}
      placeholder="Observaciones adicionales..."
    />
  </div>
  <div className="flex justify-end gap-2 pt-4">
    <Button
      variant="outline"
      onClick={() => {
        setViewMode('list');
        resetForm();
      }}
      disabled={loading}
    >
      Cancelar
    </Button>
    <Button
      onClick={viewMode === 'create' ? createPreventive : updatePreventive}
      disabled={loading || !formData.tipo_mantenimiento || !formData.descripcion || !formData.fecha_programada}
    >
      {loading ? 'Guardando...' : (viewMode === 'create' ? 'Crear' : 'Actualizar')}
    </Button>
  </div>
</div>
  );

  const renderDetailView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Información General</h4>
          <p><strong>ID:</strong> #{selectedRecord?.id}</p>
          <p><strong>Equipo:</strong> {selectedRecord?.equipo_id ? `Equipo #${selectedRecord.equipo_id}` : 'N/A'}</p>
          <p><strong>Estado:</strong> {getStatusLabel(selectedRecord?.estado)}</p>
          <p><strong>Fecha Programada:</strong> {formatDate(selectedRecord?.fecha_programada)}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Detalles</h4>
          <p><strong>Tipo:</strong> {selectedRecord?.tipo_mantenimiento || 'N/A'}</p>
          <p><strong>Responsable:</strong> {selectedRecord?.responsable || 'N/A'}</p>
          <p><strong>Costo Estimado:</strong> {formatCurrency(selectedRecord?.costo_estimado)}</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Descripción</h4>
        <p className="text-gray-600">{selectedRecord?.descripcion || 'Sin descripción'}</p>
      </div>
      {selectedRecord?.observaciones && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Observaciones</h4>
          <p className="text-gray-600">{selectedRecord.observaciones}</p>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => setViewMode('list')}>
          Volver
        </Button>
        {hasPermission('mantenimientos', 'editar') && (
          <Button onClick={() => prepareEdit(selectedRecord)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-hidden p-0">
        <div className="px-6 py-4 pb-3 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                <Clock className="h-6 w-6 text-blue-600" />
                Mantenimientos Preventivos
                {equipoId && <Badge variant="outline" className="ml-2">Equipo #{equipoId}</Badge>}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPreventiveData(currentPage, searchTerm, statusFilter, sortField, sortOrder)}
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
                        placeholder="Buscar mantenimientos..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="programado">Programado</SelectItem>
                        <SelectItem value="en_progreso">En Progreso</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="reprogramado">Reprogramado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportData}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    {hasPermission('mantenimientos', 'insertar') && (
                      <Button
                        size="sm"
                        onClick={() => setViewMode('create')}
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {renderListView()}
            </>
          )}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <div className="px-8 py-6">
              <h3 className="text-lg font-medium mb-4">
                {viewMode === 'create' ? 'Crear Nuevo Mantenimiento Preventivo' : 'Editar Mantenimiento Preventivo'}
              </h3>
              {renderForm()}
            </div>
          )}
          {viewMode === 'detail' && (
            <div className="px-8 py-6">
              <h3 className="text-lg font-medium mb-4">Detalle del Mantenimiento Preventivo</h3>
              {renderDetailView()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreventiveModal;

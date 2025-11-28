import { useState, useEffect } from "react"
import {
  Plus,
  Download,
  FileText,
  Calendar,
  AlertTriangle,
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Pagination from "@/components/common/Pagination"
import { AddContingencyModal } from "@/components/modals/add-contingency-modal"
import { DeleteContingencyModal } from "@/components/modals/delete-contingency-modal"
import httpService from "@/services/httpService"


const contingenciesData = [
  {
    id: "001",
    descripcion:
      "Se requiere ecógrafo en contingencia para el servicio de Imágenes Diagnósticas debido a un daño presentado en el equipo de los ecógrafos del servicio",
    fecha: "2024-06-11",
    fechaCierre: "2024-06-19",
    archivo: "contingencia_001.pdf",
    usuarioReporta: "Karen Sofia Bustamante Villada (electromedicina@huv)",
    informacionEquipo: {
      nombre: "ECÓGRAFO DOPPLER",
      codigo: "EMCGauge",
      serie: "2024-06-11",
      marca: "SAMSUNG",
      modelo: "SONOACE R7",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "002",
    descripcion:
      "Se requiere contingencia en el servicio de sala de Imágenes Diagnósticas para ecógrafo de Doplex en contingencia, se necesita equipo de funcionamiento",
    fecha: "2024-04-19",
    fechaCierre: "2024-04-21",
    archivo: "contingencia_002.pdf",
    usuarioReporta: "Karen Sofia Bustamante Villada (electromedicina@huv)",
    informacionEquipo: {
      nombre: "ECÓGRAFO",
      codigo: "EMCGauge",
      serie: "2024-04-19",
      marca: "SAMSUNG",
      modelo: "SONOACE R7",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "003",
    descripcion: "Se requiere para cirugía FALLA incluyen un ecógrafo para el servicio de Emergencias",
    fecha: "2024-04-18",
    fechaCierre: "2024-04-18",
    archivo: "contingencia_003.pdf",
    usuarioReporta: "Karen Sofia Bustamante Villada (electromedicina@huv)",
    informacionEquipo: {
      nombre: "ECÓGRAFO",
      codigo: "EMCGauge",
      serie: "2024-04-18",
      marca: "SAMSUNG",
      modelo: "SONOACE R7",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "004",
    descripcion: "Ventilador mecánico presenta falla en el sistema de alarmas, requiere revisión técnica urgente",
    fecha: "2024-06-15",
    fechaCierre: null,
    archivo: "contingencia_004.pdf",
    usuarioReporta: "Juan Pérez García",
    informacionEquipo: {
      nombre: "VENTILADOR MECÁNICO",
      codigo: "VM001",
      serie: "VM2024-001",
      marca: "PHILIPS",
      modelo: "V60 PLUS",
    },
    estado: "Abierto",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "005",
    descripcion: "Monitor de signos vitales no registra correctamente la presión arterial en UCI",
    fecha: "2024-06-10",
    fechaCierre: "2024-06-12",
    archivo: "contingencia_005.pdf",
    usuarioReporta: "María Rodríguez López",
    informacionEquipo: {
      nombre: "MONITOR SIGNOS VITALES",
      codigo: "MSV002",
      serie: "MSV2024-002",
      marca: "GE HEALTHCARE",
      modelo: "CARESCAPE B650",
    },
    estado: "Cerrado",
    origenContingencia: "Equipo BIOMÉDICO",
  },
  {
    id: "006",
    descripcion: "Falla en el sistema de aire acondicionado del quirófano principal",
    fecha: "2024-06-08",
    fechaCierre: "2024-06-09",
    archivo: "contingencia_006.pdf",
    usuarioReporta: "Carlos Méndez Silva",
    informacionEquipo: {
      nombre: "SISTEMA HVAC",
      codigo: "HVAC001",
      serie: "HVAC2024-001",
      marca: "CARRIER",
      modelo: "30XA-1002",
    },
    estado: "Cerrado",
    origenContingencia: "Infraestructura",
  },
  {
    id: "007",
    descripcion: "Desfibrilador no carga correctamente, requiere cambio de batería",
    fecha: "2024-06-14",
    fechaCierre: null,
    archivo: "contingencia_007.pdf",
    usuarioReporta: "Ana Torres Ruiz",
    informacionEquipo: {
      nombre: "DESFIBRILADOR",
      codigo: "DEF001",
      serie: "DEF2024-001",
      marca: "ZOLL",
      modelo: "R SERIES PLUS",
    },
    estado: "En Proceso",
    origenContingencia: "Equipo BIOMÉDICO",
  },
]

export function ContingenciesView() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedContingency, setSelectedContingency] = useState(null)

  // Real data states
  const [contingencies, setContingencies] = useState([])

  // Estados de ordenamiento
  const [sortField, setSortField] = useState('fecha')
  const [sortDirection, setSortDirection] = useState('desc')
  
  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Función para obtener icono de ordenamiento
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-[#1d293d]" />
      : <ArrowDown className="w-4 h-4 text-[#1d293d]" />
  }

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)

  // Load contingencies from API
  const loadContingencies = async () => {
    try {
      setLoading(true)
      const response = await httpService.get('/v1/contingencias')
      if (response.data && response.data.success) {
        setContingencies(response.data.data)
      }
    } catch (error) {
      console.error('Error loading contingencies:', error)
      // Fallback to static data if API fails
      setContingencies(contingenciesData)
    } finally {
      setLoading(false)
    }
  }

  // Load contingencies on component mount
  useEffect(() => {
    loadContingencies()
  }, [])

  // Ordenar contingencias
  const sortedContingencies = [...contingencies].sort((a, b) => {
    let aValue = a[sortField]
    let bValue = b[sortField]
    
    // Manejo especial para campos anidados
    if (sortField === 'equipo' && a.informacionEquipo && b.informacionEquipo) {
      aValue = a.informacionEquipo.nombre
      bValue = b.informacionEquipo.nombre
    }
    
    // Convertir a minúsculas si es string
    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    
    // Manejar valores nulos
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Pagination logic
  const totalItems = sortedContingencies.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = sortedContingencies.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }

  const handleOpenPdf = (contingency) => {
    if (contingency.archivo) {
      // Construir URL del archivo
      const fileUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://192.168.2.146:8001'}/storage/contingencias/${contingency.archivo}`
      window.open(fileUrl, "_blank")
    }
  }

  const handleEdit = (contingency) => {
    setSelectedContingency(contingency)
    setEditModalOpen(true)
  }

  const handleDelete = async (contingency) => {
    try {
      setLoading(true)
      // Use httpService with POST method for delete
      const response = await httpService.post(`/v1/contingencias/${contingency.id}/delete`)
      
      if (response.data && response.data.success) {
        // Recargar datos después de eliminar
        await loadContingencies()
        setDeleteModalOpen(false)
        setSelectedContingency(null)
        alert('Contingencia eliminada exitosamente')
      }
    } catch (error) {
      console.error('Error deleting contingency:', error)
      alert('Error al eliminar la contingencia: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updatedData) => {
    try {
      setLoading(true)
      
      console.log('Updating contingency:', selectedContingency.id)
      console.log('Data type:', updatedData.constructor.name)
      
      // Log FormData contents
      if (updatedData instanceof FormData) {
        console.log('FormData contents:')
        for (let [key, value] of updatedData.entries()) {
          console.log(`  ${key}:`, value)
        }
      } else {
        console.log('Data:', updatedData)
      }
      
      // Use httpService with POST method for update
      const response = await httpService.post(`/v1/contingencias/${selectedContingency.id}/update`, updatedData)
      
      console.log('Update response:', response)
      
      if (response.data && response.data.success) {
        // Recargar datos después de actualizar
        await loadContingencies()
        setEditModalOpen(false)
        setSelectedContingency(null)
        alert('Contingencia actualizada exitosamente')
      } else {
        alert('Error: ' + (response.data?.message || 'Respuesta inesperada del servidor'))
      }
    } catch (error) {
      console.error('Error updating contingency:', error)
      
      let errorMessage = 'Error desconocido'
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión. Verifique que el servidor esté funcionando.'
      } else if (error.response) {
        errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`
      } else {
        errorMessage = error.message
      }
      
      alert('Error al actualizar la contingencia: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle export to Excel (using dedicated controller)
  const handleExportExcel = async () => {
    try {
      console.log('📊 Exportando contingencias a Excel...');
      
      const response = await httpService.get('/v1/export/contingencias', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contingencias_HUV_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Contingencias exportadas exitosamente');
    } catch (error) {
      console.error('❌ Error exportando contingencias:', error);
      alert('Error al exportar Excel: ' + (error.message || 'Error desconocido'));
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-[#1d293d]/5 p-2 sm:p-4 lg:p-6">
      {/* Responsive Header */}
      <div className="mb-4 sm:mb-6">
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Contingencias</h1>
        <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
          Gestión y control de contingencias hospitalarias
        </p>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Excel
        </Button>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#1d293d] hover:bg-[#2a3b52] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar Contingencia
        </Button>
      </div>
      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Results Info */}
        <div className="p-4 text-sm text-slate-600 bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Mostrando: {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} contingencias
            </span>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-xs w-fit">
              Actualizada
            </Badge>
          </div>
        </div>

        {/* Items per page selector */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 border-b bg-slate-50">
          <span className="text-xs sm:text-sm text-slate-700">Mostrar</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-16 h-7 sm:h-8 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs sm:text-sm text-slate-700">registros por página</span>
        </div>

        {/* Responsive Table/Cards */}
        <div className="block sm:hidden">
          {/* Mobile Card View */}
          <div className="space-y-3 p-3">
            {currentData.length > 0 ? (
              currentData.map((contingency) => (
                <MobileContingencyCard
                  key={contingency.id}
                  contingency={contingency}
                  onOpenPdf={handleOpenPdf}
                  onEdit={handleEdit}
                  onDelete={(cont) => {
                    setSelectedContingency(cont)
                    setDeleteModalOpen(true)
                  }} />
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No se encontraron contingencias con los filtros aplicados
              </div>
            )}
          </div>
        </div>

        <div className="hidden sm:block">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] lg:min-w-[1200px]">
                            <thead>
                <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('descripcion')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      Descripción
                      {getSortIcon('descripcion')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('fecha')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      Fecha
                      {getSortIcon('fecha')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('fechaCierre')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      F. Cierre
                      {getSortIcon('fechaCierre')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Archivo
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('usuarioReporta')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      Usuario
                      {getSortIcon('usuarioReporta')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('equipo')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      Equipo
                      {getSortIcon('equipo')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('estado')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      Estado
                      {getSortIcon('estado')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    <button 
                      onClick={() => handleSort('origenContingencia')}
                      className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                    >
                      Origen
                      {getSortIcon('origenContingencia')}
                    </button>
                  </th>
                  <th
                    className="text-left p-2 lg:p-3 text-xs lg:text-sm font-semibold text-slate-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((contingency) => (
                    <DesktopContingencyRow
                      key={contingency.id}
                      contingency={contingency}
                      onOpenPdf={handleOpenPdf}
                      onEdit={handleEdit}
                      onDelete={(cont) => {
                        setSelectedContingency(cont)
                        setDeleteModalOpen(true)
                      }} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-slate-500">
                      No se encontraron contingencias con los filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          loading={loading}
          showInfo={true}
        />
      </Card>
      {/* Modals */}
      <AddContingencyModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen}
        onSuccess={() => {
          loadContingencies(); // Recargar la lista después de crear
        }}
      />
      <EditContingencyModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        contingency={selectedContingency}
        onUpdate={handleUpdate}
      />
      <DeleteContingencyModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        contingency={selectedContingency}
        onConfirm={handleDelete}
      />
    </div>
  );
}


// Edit Contingency Modal Component
function EditContingencyModal({ open, onOpenChange, contingency, onUpdate }) {
  const [formData, setFormData] = useState({
    fecha: '',
    observacion: '',
    file: null
  })

  // Update form when contingency changes
  useEffect(() => {
    if (contingency) {
      setFormData({
        fecha: contingency.fecha || '',
        observacion: contingency.descripcion || '',
        file: null
      })
    }
  }, [contingency])

  const handleSubmit = () => {
    console.log('Update button clicked')
    console.log('Form data:', formData)
    
    // Validation
    if (!formData.fecha || !formData.observacion) {
      alert('Fecha y observación son requeridos')
      return
    }
    
    // Simple object instead of FormData for now
    const updateData = {
      fecha: formData.fecha,
      observacion: formData.observacion
    }
    
    console.log('Calling onUpdate with simple data:', updateData)
    onUpdate(updateData)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({ ...prev, file }))
  }

  if (!contingency) return null

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Editar Contingencia</h2>
        
        <form onSubmit={handleSubmit} method="post" action="#" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d293d] focus:border-[#1d293d]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observación <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.observacion}
              onChange={(e) => setFormData(prev => ({ ...prev, observacion: e.target.value }))}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d293d] focus:border-[#1d293d]"
              placeholder="Descripción detallada de la contingencia"
              required
            />
          </div>

          {/* File upload temporarily disabled 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo Asociado
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1d293d] focus:border-[#1d293d]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos permitidos: PDF, DOC, DOCX, JPG, PNG
            </p>
          </div>
          */}

          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#1d293d] hover:bg-[#2a3b52] text-white rounded-md"
            >
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Mobile Card Component
function MobileContingencyCard({ contingency, onOpenPdf, onEdit, onDelete }) {
  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  #{contingency.id}
                </Badge>
                <Badge
                  className={
                    contingency.estado === "Cerrado"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                      : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
                  }>
                  {contingency.estado}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{contingency.descripcion}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                className="bg-[#1d293d] hover:bg-[#2a3b52] text-white h-6 w-6 p-0"
                onClick={() => onEdit(contingency)}
                title="Editar contingencia">
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white h-6 w-6 p-0"
                onClick={() => onDelete(contingency)}
                title="Eliminar contingencia">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-slate-700">Fecha:</span>
              <div className="text-slate-900">{new Date(contingency.fecha).toLocaleDateString("es-ES")}</div>
            </div>
            <div>
              <span className="font-medium text-slate-700">F. Cierre:</span>
              <div className="text-slate-900">{new Date(contingency.fechaCierre).toLocaleDateString("es-ES")}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium text-slate-700">Usuario:</span>
              <div className="text-slate-900 truncate">{contingency.usuarioReporta}</div>
            </div>
            <div>
              <span className="font-medium text-slate-700">Equipo:</span>
              <div className="text-slate-900">
                {contingency.informacionEquipo.nombre} - {contingency.informacionEquipo.marca}
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-700">Origen:</span>
              <div className="text-slate-900">{contingency.origenContingencia}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Desktop Row Component
function DesktopContingencyRow({ contingency, onOpenPdf, onEdit, onDelete }) {
  return (
    <tr className="border-b hover:bg-slate-50/50 transition-colors">
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div
          className="text-xs lg:text-sm text-slate-700 leading-relaxed max-w-xs xl:max-w-sm line-clamp-3">
          {contingency.descripcion}
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          <div className="text-xs lg:text-sm font-medium text-slate-900">
            {new Date(contingency.fecha).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
            })}
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-green-500" />
          <div className="text-xs lg:text-sm font-medium text-slate-900">
            {new Date(contingency.fechaCierre).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
            })}
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div 
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors"
          onClick={() => onOpenPdf(contingency)}
          title="Click para ver archivo"
        >
          <FileText className="w-3 h-3 text-red-600" />
          <div className="text-xs lg:text-sm text-[#1d293d] hover:text-[#2a3b52] underline">
            {contingency.archivo || 'Ver PDF'}
          </div>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="text-xs lg:text-sm text-slate-700 max-w-xs truncate">{contingency.usuarioReporta}</div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="text-xs lg:text-sm space-y-1 max-w-xs">
          <div className="font-medium text-slate-900">{contingency.informacionEquipo.nombre}</div>
          <div className="text-slate-600">{contingency.informacionEquipo.marca}</div>
        </div>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <Badge
          className={
            contingency.estado === "Cerrado"
              ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
              : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
          }>
          {contingency.estado}
        </Badge>
      </td>
      <td className="p-2 lg:p-3 border-r border-slate-200 align-top">
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-orange-500" />
          <span className="text-xs lg:text-sm text-slate-700">Biomédico</span>
        </div>
      </td>
      <td className="p-2 lg:p-3 align-top">
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            className="bg-[#1d293d] hover:bg-[#2a3b52] text-white h-6 lg:h-7 w-6 lg:w-7 p-0"
            onClick={() => onEdit(contingency)}
            title="Editar contingencia">
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white h-6 lg:h-7 w-6 lg:w-7 p-0"
            onClick={() => onDelete(contingency)}
            title="Eliminar contingencia">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default ContingenciesView;
export { DesktopContingencyRow };

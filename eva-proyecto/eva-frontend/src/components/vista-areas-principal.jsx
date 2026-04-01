"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, Search, Settings, Loader2, Package, MapPin, Building, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

// Importar modales
import UIModalAgregarArea from "@/components/modals/ui-modal-agregar-area"
import UIModalEditarArea from "@/components/modals/ui-modal-editar-area"
import UIModalEliminarArea from "@/components/modals/ui-modal-eliminar-area"
import Pagination from "@/components/common/Pagination"
import { Skeleton } from "@/components/ui/skeleton";

export default function VistaAreasPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [areasData, setAreasData] = useState([])
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Cargar áreas desde la API
  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || window.APP_CONFIG?.API_BASE_URL + '/api' || 'http://192.168.2.146:8001/api'}/v1/areas`)
      const data = await response.json()
      
      if (data.success) {
        setAreasData(data.data || [])
        setServicios(data.servicios || []) // Guardar servicios del endpoint
      } else {
        toast.error('Error al cargar áreas')
      }
    } catch (error) {
      console.error('Error cargando áreas:', error)
      toast.error('Error al cargar áreas')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (area) => {
    setSelectedArea(area)
    setIsEditModalOpen(true)
  }

  const handleDelete = (area) => {
    setSelectedArea(area)
    setIsDeleteModalOpen(true)
  }

  // Filtrar datos
  let filteredData = areasData.filter((area) =>
    area.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.servicio_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.sede_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ordenar datos
  if (sortConfig.key) {
    filteredData = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key] || ''
      const bValue = b[sortConfig.key] || ''
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1);
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-3.5 h-3.5 text-blue-500" /> : 
      <ArrowDown className="w-3.5 h-3.5 text-blue-500" />
  }

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  if (loading && areasData.length === 0) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
        <Card className="mt-8">
          <div className="p-6">
            <Skeleton className="h-8 w-64" />
          </div>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-96" />
              <Skeleton className="h-10 w-24" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      
      {/* ── PAGE HEADER (White Editorial Style) ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-blue-600">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
              Gestión de Áreas
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg text-sm">
              Administración de las unidades espaciales y operativas distribuidas en las diferentes sedes y servicios del hospital.
            </p>
          </div>
        </div>

        {/* Summary Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-5 w-full md:w-64 transition-all hover:shadow-md">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <Package className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Áreas</p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Barra de Controles y Búsqueda */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Buscar por nombre, servicio o sede..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 h-12 rounded-2xl shadow-inner border border-slate-100/50">
              <span className="hidden sm:inline">Mostrar</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                <SelectTrigger className="w-16 border-none bg-transparent focus:ring-0 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-blue-100 transition-all font-bold flex-1 lg:flex-none justify-center"
            >
              <Plus className="w-5 h-5 font-bold" />
              <span className="whitespace-nowrap">Nueva Área</span>
            </Button>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-white/50">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Área {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort('servicio_nombre')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Servicio {getSortIcon('servicio_nombre')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">
                    <button onClick={() => handleSort('sede_nombre')} className="flex items-center justify-center gap-1.5 hover:text-blue-600 transition-colors w-full">
                      Sede {getSortIcon('sede_nombre')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">
                    <button onClick={() => handleSort('piso_nombre')} className="flex items-center justify-center gap-1.5 hover:text-blue-600 transition-colors w-full">
                      Piso {getSortIcon('piso_nombre')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <span className="text-slate-400 font-medium tracking-wide">Cargando áreas...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Building className="h-16 w-16 text-slate-100" />
                        <span className="text-slate-400 font-medium italic">No se encontraron resultados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map((area) => (
                    <tr key={area.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{area.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: #{area.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Settings className="w-3.5 h-3.5 text-slate-300" />
                           <span className="text-slate-600">{area.servicio_nombre || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100/50">
                           <MapPin className="w-3 h-3" />
                           {area.sede_nombre || 'N/A'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100/50">
                           {area.piso_nombre || 'N/A'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(area)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                            title="Editar área"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(area)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                            title="Eliminar área"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              showInfo={true}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      <UIModalAgregarArea 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        servicios={servicios}
        onSuccess={fetchAreas}
      />

      <UIModalEditarArea 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        area={selectedArea}
        servicios={servicios}
        onSuccess={fetchAreas}
      />

      <UIModalEliminarArea 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        area={selectedArea}
        onSuccess={fetchAreas}
      />
    </div>
  )
}

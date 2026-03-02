import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Eye, ExternalLink, BookOpen, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Pagination from "@/components/common/Pagination"
import { toast } from "sonner"
import { AddManualesModal } from "@/components/modals/add-manuales-modal"
import { EditManualesModal } from "@/components/modals/edit-manuales-modal"
import { DeleteManualesModal } from "@/components/modals/delete-manuales-modal"

// Los datos ahora vienen de la API real

export function ManualesView() {
    // Estados principales
    const [manuales, setManuales] = useState([])
    const [loading, setLoading] = useState(true)
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedManual, setSelectedManual] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    
    // Estados de ordenamiento
    const [sortField, setSortField] = useState('id')
    const [sortDirection, setSortDirection] = useState('asc')
    
    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [itemsPerPage] = useState(10)

    // Función para obtener manuales del API
    const fetchManuales = async () => {
        try {
            setLoading(true)
            
            const params = new URLSearchParams({
                page: currentPage.toString(),
                per_page: itemsPerPage.toString(),
            })
            
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim())
            }
            
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.56.1:8001/api'}/v1/manuales?${params}`)
            const data = await response.json()
            
            if (data.success) {
                setManuales(data.data.data || [])
                setCurrentPage(data.data.current_page || 1)
                setTotalPages(data.data.total_pages || 1)
                setTotalItems(data.data.total || 0)
            } else {
                toast.error('Error al cargar manuales')
                setManuales([])
            }
        } catch (error) {
            console.error('Error fetching manuales:', error)
            toast.error('Error al cargar manuales')
            setManuales([])
        } finally {
            setLoading(false)
        }
    }

    // Ordenar manuales localmente
    const sortedManuales = [...manuales].sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]
        
        // Convertir a string para comparación
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
    })

    // Efectos
    useEffect(() => {
        fetchManuales()
    }, [currentPage, searchTerm])

    // Función para manejar ordenamiento
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
        setCurrentPage(1)
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

    // Función para manejar búsqueda
    const handleSearch = (value) => {
        setSearchTerm(value)
        setCurrentPage(1) // Reset a primera página cuando se busca
    }

    // Función para cambiar página
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleEdit = (manual) => {
        setSelectedManual(manual)
        setEditModalOpen(true)
    }

    const handleDelete = (manual) => {
        setSelectedManual(manual)
        setDeleteModalOpen(true)
    }

    const handleViewUrl = (url) => {
        window.open(url, "_blank")
    }

    // Callback para refrescar datos después de operaciones CRUD
    const handleRefreshData = () => {
        fetchManuales()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1d293d]/5 via-indigo-50 to-purple-50">
            {/* Header Refinado */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mx-6 mt-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-[#1d293d]/10 rounded-lg">
                            <BookOpen className="w-6 h-6 text-[#1d293d]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Gestión de Manuales</h1>
                            <p className="text-slate-600">Administra los manuales de equipos del sistema</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-[#1d293d]/5 text-[#1d293d] border-[#1d293d]/30">
                        {totalItems} manuales registrados
                    </Badge>
                </div>
            </div>

            {/* Controles */}
            <div className="mx-6 mt-6">
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por descripción o URL..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 bg-slate-50 border-slate-200 focus:border-[#1d293d] focus:ring-[#1d293d]/20"
                                />
                            </div>
                            <Button
                                onClick={() => setAddModalOpen(true)}
                                className="bg-gradient-to-r from-[#1d293d] to-[#2a3b52] hover:from-[#2a3b52] hover:to-[#141d2b] text-white shadow-lg"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Manual
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla Mejorada */}
            <div className="mx-6 mt-6">
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d293d] mx-auto mb-4"></div>
                                    <p className="text-slate-600">Cargando manuales...</p>
                                </div>
                            </div>
                        ) : manuales.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No se encontraron manuales</h3>
                                <p className="text-slate-500 mb-4">
                                    {searchTerm ? 'No hay manuales que coincidan con tu búsqueda' : 'No hay manuales registrados en el sistema'}
                                </p>
                                {!searchTerm && (
                                    <Button onClick={() => setAddModalOpen(true)} variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear primer manual
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-slate-200">
                                            <th className="text-left p-4 font-semibold text-slate-700">
                                                <button 
                                                    onClick={() => handleSort('id')}
                                                    className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                                                >
                                                    ID
                                                    {getSortIcon('id')}
                                                </button>
                                            </th>
                                            <th className="text-left p-4 font-semibold text-slate-700">
                                                <button 
                                                    onClick={() => handleSort('descripcion')}
                                                    className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                                                >
                                                    Descripción
                                                    {getSortIcon('descripcion')}
                                                </button>
                                            </th>
                                            <th className="text-left p-4 font-semibold text-slate-700">
                                                <button 
                                                    onClick={() => handleSort('url')}
                                                    className="flex items-center gap-2 hover:text-[#1d293d] transition-colors"
                                                >
                                                    URL
                                                    {getSortIcon('url')}
                                                </button>
                                            </th>
                                            <th className="text-center p-4 font-semibold text-slate-700">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedManuales.map((manual) => (
                                            <tr key={manual.id} className="hover:bg-slate-50 transition-colors border-slate-100 border-b">
                                                <td className="p-4">
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-300">
                                                        #{manual.id}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-slate-700 font-medium">{manual.descripcion}</td>
                                                <td className="p-4 max-w-md">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-slate-600 truncate font-mono text-sm bg-slate-50 px-2 py-1 rounded">
                                                            {manual.url}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewUrl(manual.url)}
                                                            className="text-[#1d293d] hover:text-[#2a3b52] hover:bg-[#1d293d]/5 p-1"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(manual)}
                                                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(manual)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Cards Móviles */}
            {!loading && manuales.length > 0 && (
                <div className="lg:hidden mx-6 mt-6 space-y-4">
                    {manuales.map((manual) => (
                        <Card key={manual.id} className="shadow-sm border-slate-200">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <Badge variant="outline" className="text-xs mb-2 bg-slate-50 text-slate-600 border-slate-300">
                                            #{manual.id}
                                        </Badge>
                                        <h3 className="font-medium text-slate-900 mb-3">{manual.descripcion}</h3>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-slate-600 truncate font-mono text-xs bg-slate-50 px-2 py-1 rounded">
                                                {manual.url}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewUrl(manual.url)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleEdit(manual)}
                                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleDelete(manual)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Paginación Global */}
            {!loading && manuales.length > 0 && (
                <div className="flex justify-center mx-6 mt-6 mb-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        showInfo={true}
                    />
                </div>
            )}

            {/* Modals */}
            <AddManualesModal 
                open={addModalOpen} 
                onOpenChange={setAddModalOpen} 
                onSuccess={handleRefreshData}
            />
            <EditManualesModal 
                open={editModalOpen} 
                onOpenChange={setEditModalOpen} 
                manual={selectedManual}
                onSuccess={handleRefreshData}
            />
            <DeleteManualesModal 
                open={deleteModalOpen} 
                onOpenChange={setDeleteModalOpen} 
                manual={selectedManual}
                onSuccess={handleRefreshData}
            />
        </div>
    )
}

export default ManualesView;
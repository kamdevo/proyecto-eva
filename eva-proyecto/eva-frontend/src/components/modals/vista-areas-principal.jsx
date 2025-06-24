"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, Search, Settings, Menu } from "lucide-react"

// Importar modales
import UIModalAgregarArea from "./ui-modal-agregar-area"
import UIModalEditarArea from "./ui-modal-editar-area"
import UIModalEliminarArea from "./ui-modal-eliminar-area"

export default function VistaAreasPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Datos de ejemplo para áreas
  const areasData = [
    {
      id: 1,
      nombre: "500KVA",
      servicio: "ACONDICIONAMIENTO FISICO",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 2,
      nombre: "600KVA",
      servicio: "SUBESTACION",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 3,
      nombre: "ACELERADOR LINEAL",
      servicio: "RADIOTERAPIA",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 4,
      nombre: "ALMACEN",
      servicio: "LABORATORIO",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 5,
      nombre: "AMBULANCIA 642",
      servicio: "AMBULANCIA CARTAGO",
      sede: "CARTAGO",
      piso: "N/R",
    },
    {
      id: 6,
      nombre: "AMBULANCIA 643",
      servicio: "AMBULANCIA CARTAGO",
      sede: "CARTAGO",
      piso: "N/R",
    },
    {
      id: 7,
      nombre: "ANFITEATRO",
      servicio: "MORGUE",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 8,
      nombre: "ANGIOGRAFIA",
      servicio: "HEMODINAMIA",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 9,
      nombre: "AUDITORIOS",
      servicio: "COMUNICACIONES",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
    {
      id: 10,
      nombre: "BIENESTAR ESTUDIANTIL",
      servicio: "COORDINACION ACADEMICA",
      sede: "SEDE PRINCIPAL",
      piso: "PISO1",
    },
  ]

  const handleEdit = (area) => {
    setSelectedArea(area)
    setIsEditModalOpen(true)
  }

  const handleDelete = (area) => {
    setSelectedArea(area)
    setIsDeleteModalOpen(true)
  }

  const filteredData = areasData.filter(
    (area) =>
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.sede.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Responsivo */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo y título */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg">
                <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-semibold">Areas</h1>
                <p className="text-xs lg:text-sm text-slate-200">Gestión de áreas</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-semibold">Areas</h1>
              </div>
            </div>

            {/* Barra de búsqueda - Desktop */}
            <div className="hidden md:block relative max-w-md flex-1 mx-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar áreas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 w-full"
              />
            </div>

            {/* Botón menú móvil */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Barra de búsqueda móvil */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar áreas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <Card className="shadow-lg">
          <CardContent className="p-0">
            {/* Controles superiores */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2 w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Área</span>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-gray-600 w-full sm:w-auto">
                  <span className="whitespace-nowrap">Mostrar</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="w-full sm:w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="whitespace-nowrap">entradas</span>
                </div>
              </div>
            </div>

            {/* Tabla Responsiva */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-500">
                  <TableRow>
                    <TableHead className="font-semibold text-white min-w-[150px] px-2 lg:px-4">Nombre</TableHead>
                    <TableHead className="font-semibold text-white min-w-[180px] px-2 lg:px-4 hidden sm:table-cell">
                      Servicio
                    </TableHead>
                    <TableHead className="font-semibold text-white min-w-[120px] px-2 lg:px-4 hidden md:table-cell">
                      Sede
                    </TableHead>
                    <TableHead className="font-semibold text-white min-w-[80px] px-2 lg:px-4 hidden lg:table-cell">
                      Piso
                    </TableHead>
                    <TableHead className="font-semibold text-white text-center min-w-[100px] px-2 lg:px-4">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((area, index) => (
                    <TableRow
                      key={area.id}
                      className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <TableCell className="font-medium text-sm px-2 lg:px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{area.nombre}</span>
                          {/* Información adicional en móvil */}
                          <div className="sm:hidden text-xs text-gray-500 mt-1 space-y-1">
                            <div>Servicio: {area.servicio}</div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {area.sede}
                              </Badge>
                              <span>• {area.piso}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm px-2 lg:px-4 hidden sm:table-cell">
                        <div className="max-w-[200px] truncate" title={area.servicio}>
                          {area.servicio}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm px-2 lg:px-4 hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {area.sede}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm px-2 lg:px-4 hidden lg:table-cell">{area.piso}</TableCell>
                      <TableCell className="text-center px-2 lg:px-4">
                        <div className="flex justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleEdit(area)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            onClick={() => handleDelete(area)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Información de paginación */}
            <div className="p-4 lg:p-6 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 text-center lg:text-left">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} entradas
                  {searchTerm && ` (filtrado de ${areasData.length} entradas totales)`}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="text-xs lg:text-sm"
                  >
                    Anterior
                  </Button>

                  {/* Paginación adaptativa */}
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNumber = i + 1
                      const isCurrentPage = currentPage === pageNumber

                      return (
                        <Button
                          key={pageNumber}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          className={`w-8 h-8 p-0 text-xs ${isCurrentPage ? "bg-blue-500 text-white" : ""}`}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}

                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-400 px-1">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 text-xs"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="text-xs lg:text-sm"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <UIModalAgregarArea isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      <UIModalEditarArea isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} area={selectedArea} />

      <UIModalEliminarArea isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} area={selectedArea} />
    </div>
  )
}

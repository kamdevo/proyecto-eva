"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Eye, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cachedGet, invalidateConfigCache } from "@/services/configDataCache";

// Importar modales
import UIModalAgregarPropietario from "@/components/modals/ui-modal-agregar-propietario";
import UIModalEditarPropietario from "@/components/modals/ui-modal-editar-propietario";
import UIModalEliminarPropietario from "@/components/modals/ui-modal-eliminar-propietario";
import UIModalExaminarPropietario from "@/components/modals/ui-modal-examinar-propietario";
import Pagination from "@/components/common/Pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function VistaPropietariosPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExamineModalOpen, setIsExamineModalOpen] = useState(false);
  const [selectedPropietario, setSelectedPropietario] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de ordenamiento
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [propietariosData, setPropietariosData] = useState([]);
  
  // Función para manejar ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para obtener icono de ordenamiento
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 5,
    current_page: 1,
    last_page: 1
  });

  // Cargar propietarios desde la API
  const fetchPropietarios = async () => {
    setIsLoading(true);
    try {
      const result = await cachedGet('/v1/propietarios', {
        per_page: itemsPerPage,
        page: currentPage,
        search: searchTerm,
        sort_by: sortField,
        sort_direction: sortDirection
      });
      
      if (result.success) {
        setPropietariosData(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        throw new Error(result.message || 'Error al cargar propietarios');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al cargar propietarios");
      setPropietariosData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropietarios();
  }, [currentPage, itemsPerPage, sortField, sortDirection]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage === 1) {
        fetchPropietarios();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Datos de ejemplo (ya no se usan)
  const propietariosDataEjemplo = [
    {
      id: 1,
      nombre: "ABBOTT",
      logo: "/placeholder.svg?height=80&width=120",
      descripcion: "Empresa líder en dispositivos médicos y diagnósticos",
      telefono: "+1-847-937-6100",
      email: "contact@abbott.com",
      direccion: "100 Abbott Park Rd, Abbott Park, IL 60064, USA",
      sitioWeb: "www.abbott.com",
      tipoEmpresa: "Multinacional",
      fechaRegistro: "2020-01-15",
      equiposAsociados: 45,
    },
    {
      id: 2,
      nombre: "AJOVECO",
      logo: "/placeholder.svg?height=80&width=120",
      descripcion: "Especialistas en equipos médicos de alta tecnología",
      telefono: "+57-1-234-5678",
      email: "info@ajoveco.com",
      direccion: "Calle 123 #45-67, Bogotá, Colombia",
      sitioWeb: "www.ajoveco.com",
      tipoEmpresa: "Nacional",
      fechaRegistro: "2019-03-22",
      equiposAsociados: 32,
    },
    {
      id: 3,
      nombre: "ANNAR",
      logo: "/placeholder.svg?height=80&width=120",
      descripcion: "Innovación en tecnologías de salud digital",
      telefono: "+1-555-123-4567",
      email: "hello@annar.health",
      direccion: "456 Tech Valley Dr, San Francisco, CA 94105, USA",
      sitioWeb: "www.annar.health",
      tipoEmpresa: "Startup",
      fechaRegistro: "2021-07-10",
      equiposAsociados: 18,
    },
    {
      id: 4,
      nombre: "ARROW MEDICAL S.A.S",
      logo: "/placeholder.svg?height=80&width=120",
      descripcion: "Soluciones integrales para el sector salud",
      telefono: "+44-20-7123-4567",
      email: "contact@arrow-medical.com",
      direccion: "789 Medical District, London, UK",
      sitioWeb: "www.arrow-medical.com",
      tipoEmpresa: "Internacional",
      fechaRegistro: "2018-11-05",
      equiposAsociados: 67,
    },
    {
      id: 5,
      nombre: "MEDTECH INNOVATIONS",
      logo: "/placeholder.svg?height=80&width=120",
      descripcion: "Pioneros en dispositivos médicos inteligentes",
      telefono: "+49-30-123-4567",
      email: "info@medtech-innovations.de",
      direccion: "Berliner Str. 123, 10115 Berlin, Germany",
      sitioWeb: "www.medtech-innovations.de",
      tipoEmpresa: "Europea",
      fechaRegistro: "2020-09-18",
      equiposAsociados: 29,
    },
    {
      id: 6,
      nombre: "BIOSYSTEMS CORP",
      logo: "/placeholder.svg?height=80&width=120",
      descripcion: "Sistemas biológicos y equipos de laboratorio",
      telefono: "+81-3-1234-5678",
      email: "contact@biosystems.jp",
      direccion: "1-2-3 Shibuya, Tokyo 150-0002, Japan",
      sitioWeb: "www.biosystems.jp",
      tipoEmpresa: "Asiática",
      fechaRegistro: "2019-12-03",
      equiposAsociados: 41,
    },
  ];

  const handleRefresh = () => {
    invalidateConfigCache('/v1/propietarios');
    fetchPropietarios();
  };

  const handleEdit = (propietario) => {
    setSelectedPropietario(propietario);
    setIsEditModalOpen(true);
  };

  const handleDelete = (propietario) => {
    setSelectedPropietario(propietario);
    setIsDeleteModalOpen(true);
  };

  const handleExamine = (propietario) => {
    setSelectedPropietario(propietario);
    setIsExamineModalOpen(true);
  };

  const totalItems = pagination.total;
  const totalPages = pagination.last_page;
  const startIndex = pagination.from || 0;
  const endIndex = pagination.to || 0;
  const currentData = propietariosData;

  if (isLoading && propietariosData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-in fade-in duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left space-y-3">
            <Skeleton className="h-10 w-52 rounded-xl mx-auto lg:mx-0" />
            <Skeleton className="h-5 w-72 rounded-lg mx-auto lg:mx-0" />
          </div>

          {/* Search bar */}
          <div className="flex justify-center lg:justify-end">
            <Skeleton className="h-12 w-full lg:w-96 rounded-xl" />
          </div>

          {/* Add button */}
          <div className="flex justify-center">
            <Skeleton className="h-14 w-14 lg:h-16 lg:w-16 rounded-full" />
          </div>

          {/* Info bar */}
          <Card className="rounded-xl shadow-sm border-0 bg-white/70">
            <CardContent className="p-4 lg:p-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="rounded-xl shadow-lg border-0 overflow-hidden bg-white/80">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 p-4 flex gap-6">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-48 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              {/* Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 p-4 border-b border-gray-100 animate-pulse">
                  <Skeleton className="h-5 w-10 rounded" />
                  <Skeleton className="h-4 w-48 flex-1 rounded" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header responsivo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Propietarios
              </h1>
              <p className="text-base lg:text-lg text-gray-600">
                Gestión de propietarios y empresas
              </p>
            </div>

            {/* Barra de búsqueda responsiva */}
            <div className="w-full lg:w-96">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar propietarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 shadow-sm text-base"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botón agregar flotante mejorado */}
        <div className="flex justify-center mb-25">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-6 h-6 lg:w-7 lg:h-7 group-hover:rotate-90 transition-transform duration-300" />
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Agregar Propietario
            </div>
          </Button>
        </div>

        {/* Información de registros mejorada */}
        <Card className="mb-6 rounded-xl shadow-sm border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm lg:text-base text-gray-600 font-medium">
                Mostrando{" "}
                <span className="font-bold text-blue-600">
                  {startIndex + 1} - {Math.min(endIndex, totalItems)}
                </span>{" "}
                de <span className="font-bold text-blue-600">{totalItems}</span>{" "}
                registros
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm lg:text-base text-gray-600 font-medium whitespace-nowrap">
                  Mostrar
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-20 lg:w-24 rounded-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm lg:text-base text-gray-600 font-medium whitespace-nowrap">
                  por página
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla responsiva mejorada */}
        <Card className="mb-8 rounded-xl shadow-lg border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <TableHead className="text-center font-bold text-gray-700 py-4 px-6 text-base w-20">
                      <button 
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors mx-auto"
                      >
                        ID
                        {getSortIcon('id')}
                      </button>
                    </TableHead>
                    <TableHead className="text-left font-bold text-gray-700 py-4 px-6 text-base">
                      <button 
                        onClick={() => handleSort('nombre')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        Nombre del Propietario
                        {getSortIcon('nombre')}
                      </button>
                    </TableHead>
                    <TableHead className="text-center font-bold text-gray-700 py-4 px-6 text-base">
                      Logo
                    </TableHead>
                    <TableHead className="text-center font-bold text-gray-700 py-4 px-6 text-base w-40">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((propietario, index) => (
                    <motion.tr
                      key={propietario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-blue-50/70 border-b border-gray-100 transition-colors duration-200`}
                    >
                      <TableCell className="py-6 px-6 text-center">
                        <div className="font-semibold text-gray-700 text-base">
                          {propietario.id}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="font-semibold text-gray-900 text-base">
                          {propietario.nombre}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {propietario.equipos_count || 0} equipos asociados
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="flex justify-center">
                          <div className="w-28 h-20 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-200">
                            {propietario.logo ? (
                              <img
                                src={propietario.logo_url || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/equipos/images/${propietario.logo}`}
                                alt={`Logo ${propietario.nombre}`}
                                className="max-w-full max-h-full object-contain rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="text-gray-400 text-xs">Sin logo</div>';
                                }}
                              />
                            ) : (
                              <div className="text-gray-400 text-xs">Sin logo</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-6">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-full hover:bg-green-100 hover:text-green-700 transition-all duration-200 group"
                            onClick={() => handleExamine(propietario)}
                          >
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 group"
                            onClick={() => handleEdit(propietario)}
                          >
                            <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 p-0 rounded-full hover:bg-red-100 hover:text-red-700 transition-all duration-200 group"
                            onClick={() => handleDelete(propietario)}
                          >
                            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista de cards para móvil */}
            <div className="lg:hidden space-y-4 p-4">
              {currentData.map((propietario, index) => (
                <motion.div
                  key={propietario.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {propietario.logo ? (
                          <img
                            src={propietario.logo_url || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/equipos/images/${propietario.logo}`}
                            alt={`Logo ${propietario.nombre}`}
                            className="max-w-full max-h-full object-contain rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="text-gray-400 text-[10px]">Sin logo</div>';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-[10px]">Sin logo</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {propietario.nombre}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {propietario.equipos_count || 0} equipos
                        </p>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-green-100"
                          onClick={() => handleExamine(propietario)}
                        >
                          <Eye className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
                          onClick={() => handleEdit(propietario)}
                        >
                          <Edit className="h-3 w-3 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-red-100"
                          onClick={() => handleDelete(propietario)}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información de registros inferior */}
        <Card className="mb-6 rounded-xl shadow-sm border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm lg:text-base text-gray-600 font-medium">
                Mostrando{" "}
                <span className="font-bold text-blue-600">
                  {startIndex + 1} - {Math.min(endIndex, totalItems)}
                </span>{" "}
                de <span className="font-bold text-blue-600">{totalItems}</span>{" "}
                registros
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm lg:text-base text-gray-600 font-medium whitespace-nowrap">
                  Mostrar
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-20 lg:w-24 rounded-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm lg:text-base text-gray-600 font-medium whitespace-nowrap">
                  por página
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paginación */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showInfo={true}
        />
      </div>

      {/* Modales */}
      <UIModalAgregarPropietario
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          handleRefresh();
        }}
      />

      <UIModalEditarPropietario
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          handleRefresh();
        }}
        propietario={selectedPropietario}
      />

      <UIModalEliminarPropietario
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          handleRefresh();
        }}
        propietario={selectedPropietario}
      />

      <UIModalExaminarPropietario
        isOpen={isExamineModalOpen}
        onClose={() => setIsExamineModalOpen(false)}
        propietario={selectedPropietario}
      />
    </motion.div>
  );
}

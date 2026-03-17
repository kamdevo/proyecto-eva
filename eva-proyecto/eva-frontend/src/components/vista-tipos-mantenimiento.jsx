"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Trash2, Plus, Search, Settings, Wrench, Eye, ArrowUpDown, ArrowUp, ArrowDown, Clock, CheckCircle, XCircle } from "lucide-react";

// Importar componentes comunes
import Pagination from "@/components/common/Pagination";

export default function VistaTiposMantenimiento() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de ordenamiento
  const [sortField, setSortField] = useState('nombre');
  const [sortDirection, setSortDirection] = useState('asc');

  // Datos mock para Tipos de Mantenimiento
  const [mantenimientosData] = useState([
    {
      id: 1,
      nombre: "MANTENIMIENTO PREVENTIVO BIOMÉDICO",
      codigo: "MPB-001",
      descripcion: "Revisión periódica programada para equipos biomédicos según protocolo.",
      frecuencia: "Semestral",
      estado: "Activo",
      ultimaActualizacion: "2024-03-10"
    },
    {
      id: 2,
      nombre: "CALIBRACIÓN DE EQUIPOS",
      codigo: "CAL-002",
      descripcion: "Ajuste y verificación de precisión con patrones trazables.",
      frecuencia: "Anual",
      estado: "Activo",
      ultimaActualizacion: "2024-02-15"
    },
    {
      id: 3,
      nombre: "MANTENIMIENTO CORRECTIVO",
      codigo: "MC-003",
      descripcion: "Reparación de fallas reportadas por el usuario final.",
      frecuencia: "Bajo Demanda",
      estado: "Activo",
      ultimaActualizacion: "2024-03-15"
    },
    {
      id: 4,
      nombre: "REVISIÓN TÉCNICA PERICIAL",
      codigo: "RTP-004",
      descripcion: "Evaluación técnica para determinar obsolescencia o baja del equipo.",
      frecuencia: "Única",
      estado: "Activo",
      ultimaActualizacion: "2024-01-20"
    },
    {
      id: 5,
      nombre: "MANTENIMIENTO INFRAESTRUCTURA",
      codigo: "MI-005",
      descripcion: "Mantenimiento a redes eléctricas y gases medicinales asociados.",
      frecuencia: "Trimestral",
      estado: "Activo",
      ultimaActualizacion: "2024-03-05"
    },
    {
      id: 6,
      nombre: "VALUACIÓN DE TECNOLOGÍA",
      codigo: "VT-006",
      descripcion: "Verificación de cumplimiento de especificaciones técnicas de fábrica.",
      frecuencia: "Anual",
      estado: "Inactivo",
      ultimaActualizacion: "2023-12-10"
    }
  ]);

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

  // Aplicar búsqueda funcional
  const filteredData = mantenimientosData.filter(item => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(search) ||
      item.codigo?.toLowerCase().includes(search) ||
      item.descripcion?.toLowerCase().includes(search)
    );
  });

  // Ordenamiento
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Tipos de Mantenimiento</h1>
                <p className="text-sm text-slate-200">Configuración de categorías de servicio técnico</p>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <Card className="shadow-lg">
          <CardContent className="p-0">
            {/* Controles superiores */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    onClick={() => console.log("Agregar nuevo tipo")}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Tipo de Mantenimiento</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Mostrar</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>entradas</span>
                </div>
              </div>
              
              {/* Búsqueda móvil */}
              <div className="mt-4 md:hidden relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <button 
                        onClick={() => handleSort('codigo')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors py-2"
                      >
                        Código
                        {getSortIcon('codigo')}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      <button 
                        onClick={() => handleSort('nombre')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors py-2"
                      >
                        Tipo de Mantenimiento
                        {getSortIcon('nombre')}
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Descripción</TableHead>
                    <TableHead>
                      <button 
                        onClick={() => handleSort('frecuencia')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors py-2"
                      >
                        Frecuencia
                        {getSortIcon('frecuencia')}
                      </button>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-600">{item.codigo}</TableCell>
                        <TableCell className="font-semibold">{item.nombre}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-gray-600 max-w-[300px] truncate">
                          {item.descripcion}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm">{item.frecuencia}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`px-2 py-0.5 text-[10px] uppercase font-bold flex items-center gap-1 w-fit ${
                              item.estado === 'Activo' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                            {item.estado === 'Activo' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {item.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                              title="Visualizar"
                            >
                              <Eye className="h-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                              title="Editar"
                            >
                              <Edit className="h-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No se encontraron registros que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="p-4 border-t border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showInfo={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

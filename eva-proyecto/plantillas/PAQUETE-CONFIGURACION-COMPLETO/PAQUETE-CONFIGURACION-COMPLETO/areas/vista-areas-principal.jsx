"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Edit, Trash2, Plus, Search, Settings, Menu, Eye, MapPin } from "lucide-react";

// Importar modales
import UIModalAgregarArea from "./modals/ui-modal-agregar-area";
import UIModalEditarArea from "./modals/ui-modal-editar-area";
import UIModalEliminarArea from "./modals/ui-modal-eliminar-area";
import UIModalVerArea from "./modals/ui-modal-ver-area";

function VistaAreasPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Datos expandidos para áreas
  const areasData = [
    {
      id: 1,
      nombre: "500KVA",
      servicio: "ACONDICIONAMIENTO FISICO",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1",
      zona: "ZONA MOLANO1",
      responsable: "Ing. Carlos Molano",
      telefono: "318 555 0101",
      email: "carlos.molano@huv.gov.co",
      capacidad: "50 personas",
      estado: "ACTIVA"
    },
    {
      id: 2,
      nombre: "600KVA",
      servicio: "SUBESTACION ELECTRICA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1",
      zona: "ZONA CENTRAL",
      responsable: "Ing. María Suárez",
      telefono: "318 555 0102",
      email: "maria.suarez@huv.gov.co",
      capacidad: "N/A",
      estado: "ACTIVA"
    },
    {
      id: 3,
      nombre: "ACELERADOR LINEAL",
      servicio: "RADIOTERAPIA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 2",
      zona: "ZONA CRISTIAN",
      responsable: "Dr. Cristian Pérez",
      telefono: "318 555 0103",
      email: "cristian.perez@huv.gov.co",
      capacidad: "10 pacientes/día",
      estado: "ACTIVA"
    },
    {
      id: 4,
      nombre: "ALMACEN GENERAL",
      servicio: "LABORATORIO CLINICO",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1",
      zona: "ZONA CENTRAL",
      responsable: "Lic. Ana López",
      telefono: "318 555 0104",
      email: "ana.lopez@huv.gov.co",
      capacidad: "200 m²",
      estado: "ACTIVA"
    },
    {
      id: 5,
      nombre: "AMBULANCIA 642",
      servicio: "AMBULANCIA CARTAGO",
      sede: "HUV CARTAGO",
      piso: "N/A",
      zona: "ZONA SUR",
      responsable: "Paramédico Juan Díaz",
      telefono: "318 555 0105",
      email: "juan.diaz@huv.gov.co",
      capacidad: "2 pacientes",
      estado: "ACTIVA"
    },
    {
      id: 6,
      nombre: "AMBULANCIA 643",
      servicio: "AMBULANCIA CARTAGO",
      sede: "HUV CARTAGO",
      piso: "N/A",
      zona: "ZONA SUR",
      responsable: "Paramédico Luis García",
      telefono: "318 555 0106",
      email: "luis.garcia@huv.gov.co",
      capacidad: "2 pacientes",
      estado: "ACTIVA"
    },
    {
      id: 7,
      nombre: "ANFITEATRO",
      servicio: "MORGUE",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1",
      zona: "ZONA CENTRAL",
      responsable: "Dr. Roberto Morales",
      telefono: "318 555 0107",
      email: "roberto.morales@huv.gov.co",
      capacidad: "100 personas",
      estado: "ACTIVA"
    },
    {
      id: 8,
      nombre: "ANGIOGRAFIA",
      servicio: "HEMODINAMIA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 2",
      zona: "ZONA MOLANO1",
      responsable: "Dr. Fernando Ruiz",
      telefono: "318 555 0108",
      email: "fernando.ruiz@huv.gov.co",
      capacidad: "5 pacientes/día",
      estado: "ACTIVA"
    },
    {
      id: 9,
      nombre: "AUDITORIOS",
      servicio: "COMUNICACIONES",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 3",
      zona: "ZONA SALUD1",
      responsable: "Lic. Patricia Vega",
      telefono: "318 555 0109",
      email: "patricia.vega@huv.gov.co",
      capacidad: "300 personas",
      estado: "ACTIVA"
    },
    {
      id: 10,
      nombre: "BIENESTAR ESTUDIANTIL",
      servicio: "COORDINACION ACADEMICA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 2",
      zona: "ZONA NORTE",
      responsable: "Psic. Carmen Silva",
      telefono: "318 555 0110",
      email: "carmen.silva@huv.gov.co",
      capacidad: "30 estudiantes",
      estado: "ACTIVA"
    },
    {
      id: 11,
      nombre: "CONSULTORIOS EXTERNOS",
      servicio: "CONSULTA EXTERNA",
      sede: "HUV NORTE",
      piso: "PISO 1",
      zona: "ZONA NORTE",
      responsable: "Dr. Miguel Torres",
      telefono: "318 555 0111",
      email: "miguel.torres@huv.gov.co",
      capacidad: "20 consultorios",
      estado: "ACTIVA"
    },
    {
      id: 12,
      nombre: "QUIROFANO 1",
      servicio: "CIRUGIA GENERAL",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 3",
      zona: "ZONA CRISTIAN",
      responsable: "Dr. Andrés Ramírez",
      telefono: "318 555 0112",
      email: "andres.ramirez@huv.gov.co",
      capacidad: "1 cirugía",
      estado: "ACTIVA"
    },
    {
      id: 13,
      nombre: "UCI ADULTOS",
      servicio: "UNIDAD CUIDADOS INTENSIVOS",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 4",
      zona: "ZONA SALUD1",
      responsable: "Dr. Sandra Herrera",
      telefono: "318 555 0113",
      email: "sandra.herrera@huv.gov.co",
      capacidad: "20 camas",
      estado: "ACTIVA"
    },
    {
      id: 14,
      nombre: "FARMACIA CENTRAL",
      servicio: "FARMACIA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1",
      zona: "ZONA CENTRAL",
      responsable: "Q.F. Diana Rojas",
      telefono: "318 555 0114",
      email: "diana.rojas@huv.gov.co",
      capacidad: "500 m²",
      estado: "ACTIVA"
    },
    {
      id: 15,
      nombre: "RADIOLOGIA",
      servicio: "IMAGENOLOGIA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 2",
      zona: "ZONA MOLANO1",
      responsable: "Dr. Jorge Mendoza",
      telefono: "318 555 0115",
      email: "jorge.mendoza@huv.gov.co",
      capacidad: "50 estudios/día",
      estado: "ACTIVA"
    }
  ];

  const handleEdit = (area) => {
    setSelectedArea(area);
    setIsEditModalOpen(true);
  };

  const handleDelete = (area) => {
    setSelectedArea(area);
    setIsDeleteModalOpen(true);
  };

  const handleView = (area) => {
    setSelectedArea(area);
    setIsViewModalOpen(true);
  };

  const filteredData = areasData.filter(
    (area) =>
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "ACTIVA":
        return "bg-green-100 text-green-800";
      case "INACTIVA":
        return "bg-red-100 text-red-800";
      case "MANTENIMIENTO":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Responsivo */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-lg">
                <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-semibold">Áreas</h1>
                <p className="text-xs lg:text-sm text-slate-200">
                  Gestión de áreas hospitalarias
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-semibold">Áreas</h1>
              </div>
            </div>

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

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

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
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Área</span>
                </Button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-gray-600 w-full sm:w-auto">
                  <span className="whitespace-nowrap">Mostrar</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
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

            <div className="w-full">
              <Table className="w-full table-fixed">
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 w-[30%]">
                      Área
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[35%]">
                      Servicio y Ubicación
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[20%]">
                      Responsable
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[15%]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((area) => (
                    <TableRow key={area.id} className="hover:bg-gray-50">
                      <TableCell className="p-3 w-[30%]">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 text-sm leading-tight break-words whitespace-normal">
                            {area.nombre}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5">
                              {area.zona}
                            </Badge>
                            <Badge className={`${getEstadoColor(area.estado)} text-xs px-2 py-0.5`}>
                              {area.estado}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            Capacidad: {area.capacidad}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-3 w-[35%]">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-700 leading-tight break-words whitespace-normal font-medium">
                            {area.servicio}
                          </div>
                          <div className="text-xs text-gray-600 break-words whitespace-normal">
                            {area.sede}
                          </div>
                          <div className="flex items-center gap-1">
                            <Settings className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{area.piso}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center p-3 w-[20%]">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 break-words whitespace-normal">
                            {area.responsable}
                          </div>
                          <div className="text-xs text-gray-500 break-all">
                            {area.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {area.telefono}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center p-3 w-[15%]">
                        <div className="flex flex-col gap-1 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleView(area)}
                            title="Ver"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleEdit(area)}
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            onClick={() => handleDelete(area)}
                            title="Eliminar"
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

            <div className="p-4 lg:p-6 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 text-center lg:text-left">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)}{" "}
                  de {totalItems} entradas
                  {searchTerm &&
                    ` (filtrado de ${areasData.length} entradas totales)`}
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

                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNumber = i + 1;
                      const isCurrentPage = currentPage === pageNumber;

                      return (
                        <Button
                          key={pageNumber}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          className={`w-8 h-8 p-0 text-xs ${
                            isCurrentPage ? "bg-blue-500 text-white" : ""
                          }`}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
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
      <UIModalAgregarArea
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UIModalEditarArea
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        area={selectedArea}
      />

      <UIModalEliminarArea
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        area={selectedArea}
      />

      <UIModalVerArea
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        area={selectedArea}
      />
    </div>
  );
}

export default VistaAreasPrincipal;
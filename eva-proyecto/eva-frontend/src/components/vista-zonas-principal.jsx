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
import { Edit, Trash2, Plus, Search, MapPin, Menu, Eye, Building } from "lucide-react";

// Importar modales
import UIModalAgregarZona from "./modals/ui-modal-agregar-zona";
import UIModalEditarZona from "./modals/ui-modal-editar-zona";
import UIModalEliminarZona from "./modals/ui-modal-eliminar-zona";
import UIModalVerZona from "./modals/ui-modal-ver-zona";

function VistaZonasPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedZona, setSelectedZona] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Datos de zonas del hospital
  const zonasData = [
    {
      id: 1,
      nombre: "ZONA MOLANO1",
      codigo: "ZM01",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1-3",
      jefeZona: "Ing. Carlos Molano",
      telefono: "318 555 0101",
      email: "carlos.molano@huv.gov.co",
      areasAsociadas: 8,
      equiposAsociados: 245,
      descripcion: "Zona principal de servicios críticos y emergencias",
      estado: "ACTIVA"
    },
    {
      id: 2,
      nombre: "ZONA CRISTIAN",
      codigo: "ZC02",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 2-4",
      jefeZona: "Dr. Cristian Pérez",
      telefono: "318 555 0102",
      email: "cristian.perez@huv.gov.co",
      areasAsociadas: 6,
      equiposAsociados: 189,
      descripcion: "Zona de especialidades médicas y quirúrgicas",
      estado: "ACTIVA"
    },
    {
      id: 3,
      nombre: "ZONA SALUD1",
      codigo: "ZS03",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 3-5",
      jefeZona: "Dra. María Salud",
      telefono: "318 555 0103",
      email: "maria.salud@huv.gov.co",
      areasAsociadas: 7,
      equiposAsociados: 198,
      descripcion: "Zona de hospitalización y cuidados especializados",
      estado: "ACTIVA"
    },
    {
      id: 4,
      nombre: "ZONA NORTE",
      codigo: "ZN04",
      sede: "HUV NORTE",
      piso: "PISO 1-2",
      jefeZona: "Dr. Roberto Norte",
      telefono: "318 555 0104",
      email: "roberto.norte@huv.gov.co",
      areasAsociadas: 5,
      equiposAsociados: 156,
      descripcion: "Zona de consulta externa y servicios ambulatorios",
      estado: "ACTIVA"
    },
    {
      id: 5,
      nombre: "ZONA CENTRAL",
      codigo: "ZCE05",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 1-2",
      jefeZona: "Ing. Luis Central",
      telefono: "318 555 0105",
      email: "luis.central@huv.gov.co",
      areasAsociadas: 9,
      equiposAsociados: 278,
      descripcion: "Zona de servicios de apoyo y administrativos",
      estado: "ACTIVA"
    },
    {
      id: 6,
      nombre: "ZONA SUR",
      codigo: "ZS06",
      sede: "HUV CARTAGO",
      piso: "PISO 1",
      jefeZona: "Dra. Ana Sur",
      telefono: "318 555 0106",
      email: "ana.sur@huv.gov.co",
      areasAsociadas: 4,
      equiposAsociados: 98,
      descripcion: "Zona de servicios de emergencia y ambulatorios",
      estado: "ACTIVA"
    },
    {
      id: 7,
      nombre: "ZONA ADMINISTRATIVA",
      codigo: "ZA07",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "PISO 4-5",
      jefeZona: "Lic. Patricia Admin",
      telefono: "318 555 0107",
      email: "patricia.admin@huv.gov.co",
      areasAsociadas: 3,
      equiposAsociados: 45,
      descripcion: "Zona de oficinas administrativas y dirección",
      estado: "ACTIVA"
    },
    {
      id: 8,
      nombre: "ZONA MANTENIMIENTO",
      codigo: "ZM08",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      piso: "SOTANO-PISO 1",
      jefeZona: "Ing. Jorge Mantto",
      telefono: "318 555 0108",
      email: "jorge.mantto@huv.gov.co",
      areasAsociadas: 2,
      equiposAsociados: 67,
      descripcion: "Zona de mantenimiento y servicios técnicos",
      estado: "MANTENIMIENTO"
    }
  ];

  const handleEdit = (zona) => {
    setSelectedZona(zona);
    setIsEditModalOpen(true);
  };

  const handleDelete = (zona) => {
    setSelectedZona(zona);
    setIsDeleteModalOpen(true);
  };

  const handleView = (zona) => {
    setSelectedZona(zona);
    setIsViewModalOpen(true);
  };

  const filteredData = zonasData.filter(
    (zona) =>
      zona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zona.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zona.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zona.jefeZona.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-lg lg:text-xl font-semibold">Zonas</h1>
                <p className="text-xs lg:text-sm text-slate-200">
                  Gestión de zonas hospitalarias
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-semibold">Zonas</h1>
              </div>
            </div>

            <div className="hidden md:block relative max-w-md flex-1 mx-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar zonas..."
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
                  placeholder="Buscar zonas..."
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2 w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Zona</span>
                  </Button>
                </div>

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
                      Zona
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[35%]">
                      Ubicación y Sede
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[20%]">
                      Jefe de Zona
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[15%]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((zona) => (
                    <TableRow key={zona.id} className="hover:bg-gray-50">
                      <TableCell className="p-3 w-[30%]">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 text-sm leading-tight break-words whitespace-normal">
                            {zona.nombre}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5">
                              {zona.codigo}
                            </Badge>
                            <Badge className={`${getEstadoColor(zona.estado)} text-xs px-2 py-0.5`}>
                              {zona.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Building className="w-3 h-3 text-orange-600" />
                            <span>{zona.areasAsociadas} áreas</span>
                            <span>•</span>
                            <span>{zona.equiposAsociados} equipos</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-3 w-[35%]">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-700 leading-tight break-words whitespace-normal font-medium">
                            {zona.sede}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{zona.piso}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center p-3 w-[20%]">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 break-words whitespace-normal">
                            {zona.jefeZona}
                          </div>
                          <div className="text-xs text-gray-500 break-all">
                            {zona.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {zona.telefono}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center p-3 w-[15%]">
                        <div className="flex flex-col gap-1 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleView(zona)}
                            title="Ver"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleEdit(zona)}
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            onClick={() => handleDelete(zona)}
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
                    ` (filtrado de ${zonasData.length} entradas totales)`}
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
      <UIModalAgregarZona
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UIModalEditarZona
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        zona={selectedZona}
      />

      <UIModalEliminarZona
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        zona={selectedZona}
      />

      <UIModalVerZona
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        zona={selectedZona}
      />
    </div>
  );
}

export default VistaZonasPrincipal;
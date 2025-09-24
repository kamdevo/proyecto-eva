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
import { Edit, Trash2, Plus, Search, Settings, MapPin, Building, Users, Eye } from "lucide-react";

// Importar modales
import UIModalAgregarServicio from "./modals/ui-modal-agregar-servicio";
import UIModalEditarServicio from "./modals/ui-modal-editar-servicio";
import UIModalEliminarServicio from "./modals/ui-modal-eliminar-servicio";
import UIModalCrearZona from "./modals/ui-modal-crear-zona";
import UIModalCrearSede from "./modals/ui-modal-crear-sede";
import UIModalCrearArea from "./modals/ui-modal-crear-area";
import UIModalVerServicio from "./modals/ui-modal-ver-servicio";

export default function VistaServiciosPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isZonaModalOpen, setIsZonaModalOpen] = useState(false);
  const [isSedeModalOpen, setIsSedeModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de ejemplo para servicios
  const serviciosData = [
    {
      id: 1,
      nombre: "ACONDICIONAMIENTO FISICO",
      zona: "ZONA MOLANO1",
      piso: "PISO 2",
      centroCosto: "ADMINISTRACION UES URGENCIAS",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 35,
      areasAsociadas: 0,
    },
    {
      id: 2,
      nombre: "2004 URGENCIAS SEDE NORTE",
      zona: "ZONA NORTE",
      piso: "PISO 1",
      centroCosto: "ADMINISTRACION UES URGENCIAS",
      sede: "HUV NORTE",
      equiposAsociados: 64,
      areasAsociadas: 8,
    },
    {
      id: 3,
      nombre: "ALMACEN GENERAL",
      zona: "ZONA CENTRAL",
      piso: "PISO 1",
      centroCosto: "ALMACEN GENERAL",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 7,
      areasAsociadas: 0,
    },
    {
      id: 4,
      nombre: "ALMACEN GENERAL Y COMPRAS",
      zona: "ZONA CENTRAL",
      piso: "PISO 3",
      centroCosto: "ALMACEN GENERAL",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 4,
      areasAsociadas: 1,
    },
    {
      id: 5,
      nombre: "AMBULANCIA",
      zona: "ZONA MOLANO1",
      piso: "PISO 1",
      centroCosto: "GINECOBSTETRICIA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 56,
      areasAsociadas: 0,
    },
    {
      id: 6,
      nombre: "AMBULANCIA CARTAGO",
      zona: "ZONA SUR",
      piso: "PISO 1",
      centroCosto: "INVENTARIOS",
      sede: "HUV CARTAGO",
      equiposAsociados: 22,
      areasAsociadas: 0,
    },
    {
      id: 7,
      nombre: "ANA FRANK",
      zona: "ZONA SALUD1",
      piso: "PISO 4",
      centroCosto: "SALA CIRUGIA PEDIATRICA ANA FR",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 94,
      areasAsociadas: 0,
    },
    {
      id: 8,
      nombre: "ANGAR",
      zona: "ZONA CENTRAL",
      piso: "PISO 2",
      centroCosto: "ALMACEN GENERAL",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 11,
      areasAsociadas: 0,
    },
    {
      id: 9,
      nombre: "ANGIOGRAFIA",
      zona: "ZONA MOLANO1",
      piso: "PISO 1",
      centroCosto: "HEMODINAMIA",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 5,
      areasAsociadas: 0,
    },
    {
      id: 10,
      nombre: "ANHELO DE VIDA",
      zona: "ZONA SALUD1",
      piso: "PISO 3",
      centroCosto: "SALA PEDIATRIA GENERAL",
      sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL",
      equiposAsociados: 70,
      areasAsociadas: 0,
    },
    { id: 11, nombre: "CARDIOLOGIA ADULTOS", zona: "ZONA CRISTIAN", piso: "PISO 2", centroCosto: "CARDIOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 45, areasAsociadas: 3 },
    { id: 12, nombre: "CIRUGIA GENERAL", zona: "ZONA MOLANO1", piso: "PISO 3", centroCosto: "CIRUGIA GENERAL", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 78, areasAsociadas: 6 },
    { id: 13, nombre: "CONSULTA EXTERNA", zona: "ZONA NORTE", piso: "PISO 1", centroCosto: "CONSULTA EXTERNA", sede: "HUV NORTE", equiposAsociados: 32, areasAsociadas: 8 },
    { id: 14, nombre: "DERMATOLOGIA", zona: "ZONA SALUD1", piso: "PISO 2", centroCosto: "DERMATOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 18, areasAsociadas: 2 },
    { id: 15, nombre: "ENDOCRINOLOGIA", zona: "ZONA CRISTIAN", piso: "PISO 3", centroCosto: "ENDOCRINOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 25, areasAsociadas: 3 },
    { id: 16, nombre: "FARMACIA CENTRAL", zona: "ZONA CENTRAL", piso: "PISO 1", centroCosto: "FARMACIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 12, areasAsociadas: 2 },
    { id: 17, nombre: "GASTROENTEROLOGIA", zona: "ZONA MOLANO1", piso: "PISO 4", centroCosto: "GASTROENTEROLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 38, areasAsociadas: 4 },
    { id: 18, nombre: "GINECOLOGIA", zona: "ZONA SALUD1", piso: "PISO 5", centroCosto: "GINECOBSTETRICIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 52, areasAsociadas: 5 },
    { id: 19, nombre: "HEMATOLOGIA", zona: "ZONA CRISTIAN", piso: "PISO 4", centroCosto: "HEMATOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 29, areasAsociadas: 3 },
    { id: 20, nombre: "HOSPITALIZACION GENERAL", zona: "ZONA NORTE", piso: "PISO 2", centroCosto: "HOSPITALIZACION", sede: "HUV NORTE", equiposAsociados: 85, areasAsociadas: 12 },
    { id: 21, nombre: "IMAGENOLOGIA", zona: "ZONA CENTRAL", piso: "PISO 2", centroCosto: "IMAGENOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 67, areasAsociadas: 6 },
    { id: 22, nombre: "INFECTOLOGIA", zona: "ZONA MOLANO1", piso: "PISO 5", centroCosto: "INFECTOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 31, areasAsociadas: 3 },
    { id: 23, nombre: "LABORATORIO CLINICO", zona: "ZONA CRISTIAN", piso: "PISO 1", centroCosto: "LABORATORIO", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 89, areasAsociadas: 8 },
    { id: 24, nombre: "MEDICINA INTERNA", zona: "ZONA SALUD1", piso: "PISO 6", centroCosto: "MEDICINA INTERNA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 73, areasAsociadas: 9 },
    { id: 25, nombre: "NEFROLOGIA", zona: "ZONA NORTE", piso: "PISO 3", centroCosto: "NEFROLOGIA", sede: "HUV NORTE", equiposAsociados: 42, areasAsociadas: 4 },
    { id: 26, nombre: "NEUMOLOGIA", zona: "ZONA CENTRAL", piso: "PISO 4", centroCosto: "NEUMOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 36, areasAsociadas: 3 },
    { id: 27, nombre: "NEUROCIRUGIA", zona: "ZONA MOLANO1", piso: "PISO 6", centroCosto: "NEUROCIRUGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 58, areasAsociadas: 5 },
    { id: 28, nombre: "NEUROLOGIA", zona: "ZONA CRISTIAN", piso: "PISO 5", centroCosto: "NEUROLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 41, areasAsociadas: 4 },
    { id: 29, nombre: "NUTRICION", zona: "ZONA SALUD1", piso: "PISO 1", centroCosto: "NUTRICION", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 15, areasAsociadas: 2 },
    { id: 30, nombre: "OBSTETRICIA", zona: "ZONA NORTE", piso: "PISO 4", centroCosto: "GINECOBSTETRICIA", sede: "HUV NORTE", equiposAsociados: 63, areasAsociadas: 7 },
    { id: 31, nombre: "OFTALMOLOGIA", zona: "ZONA CENTRAL", piso: "PISO 3", centroCosto: "OFTALMOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 27, areasAsociadas: 3 },
    { id: 32, nombre: "ONCOLOGIA", zona: "ZONA MOLANO1", piso: "PISO 7", centroCosto: "ONCOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 76, areasAsociadas: 8 },
    { id: 33, nombre: "ORTOPEDIA", zona: "ZONA CRISTIAN", piso: "PISO 6", centroCosto: "ORTOPEDIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 54, areasAsociadas: 6 },
    { id: 34, nombre: "OTORRINOLARINGOLOGIA", zona: "ZONA SALUD1", piso: "PISO 7", centroCosto: "OTORRINOLARINGOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 33, areasAsociadas: 3 },
    { id: 35, nombre: "PATOLOGIA", zona: "ZONA NORTE", piso: "PISO 5", centroCosto: "PATOLOGIA", sede: "HUV NORTE", equiposAsociados: 21, areasAsociadas: 2 },
    { id: 36, nombre: "PEDIATRIA GENERAL", zona: "ZONA CENTRAL", piso: "PISO 5", centroCosto: "PEDIATRIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 68, areasAsociadas: 9 },
    { id: 37, nombre: "PSICOLOGIA", zona: "ZONA MOLANO1", piso: "PISO 2", centroCosto: "PSICOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 8, areasAsociadas: 1 },
    { id: 38, nombre: "PSIQUIATRIA", zona: "ZONA CRISTIAN", piso: "PISO 7", centroCosto: "PSIQUIATRIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 19, areasAsociadas: 2 },
    { id: 39, nombre: "QUIMIOTERAPIA", zona: "ZONA SALUD1", piso: "PISO 6", centroCosto: "ONCOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 44, areasAsociadas: 4 },
    { id: 40, nombre: "RADIOLOGIA", zona: "ZONA NORTE", piso: "PISO 6", centroCosto: "IMAGENOLOGIA", sede: "HUV NORTE", equiposAsociados: 59, areasAsociadas: 5 },
    { id: 41, nombre: "REHABILITACION", zona: "ZONA CENTRAL", piso: "PISO 6", centroCosto: "REHABILITACION", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 37, areasAsociadas: 4 },
    { id: 42, nombre: "REUMATOLOGIA", zona: "ZONA MOLANO1", piso: "PISO 3", centroCosto: "REUMATOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 26, areasAsociadas: 2 },
    { id: 43, nombre: "TERAPIA INTENSIVA", zona: "ZONA CRISTIAN", piso: "PISO 2", centroCosto: "UCI", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 92, areasAsociadas: 6 },
    { id: 44, nombre: "TERAPIA RESPIRATORIA", zona: "ZONA SALUD1", piso: "PISO 4", centroCosto: "TERAPIA RESPIRATORIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 48, areasAsociadas: 3 },
    { id: 45, nombre: "TOXICOLOGIA", zona: "ZONA NORTE", piso: "PISO 7", centroCosto: "TOXICOLOGIA", sede: "HUV NORTE", equiposAsociados: 17, areasAsociadas: 2 },
    { id: 46, nombre: "TRANSPLANTES", zona: "ZONA CENTRAL", piso: "PISO 7", centroCosto: "TRANSPLANTES", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 81, areasAsociadas: 7 },
    { id: 47, nombre: "UNIDAD CORONARIA", zona: "ZONA MOLANO1", piso: "PISO 4", centroCosto: "CARDIOLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 65, areasAsociadas: 5 },
    { id: 48, nombre: "UROLOGIA", zona: "ZONA CRISTIAN", piso: "PISO 3", centroCosto: "UROLOGIA", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 39, areasAsociadas: 4 },
    { id: 49, nombre: "VACUNACION", zona: "ZONA SALUD1", piso: "PISO 1", centroCosto: "VACUNACION", sede: "HUV EVARISTO GARCÍA - SEDE PRINCIPAL", equiposAsociados: 6, areasAsociadas: 1 },
    { id: 50, nombre: "VIGILANCIA EPIDEMIOLOGICA", zona: "ZONA SUR", piso: "PISO 2", centroCosto: "EPIDEMIOLOGIA", sede: "HUV CARTAGO", equiposAsociados: 14, areasAsociadas: 2 }
  ];

  const handleEdit = (servicio) => {
    setSelectedService(servicio);
    setIsEditModalOpen(true);
  };

  const handleDelete = (servicio) => {
    setSelectedService(servicio);
    setIsDeleteModalOpen(true);
  };

  const handleView = (servicio) => {
    setSelectedService(servicio);
    setIsViewModalOpen(true);
  };

  const totalItems = serviciosData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Services</h1>
                <p className="text-sm text-slate-200">Gestión de servicios</p>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
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
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Servicio</span>
                  </Button>
                  
                  <Button
                    onClick={() => setIsZonaModalOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Crear Zona</span>
                  </Button>
                  
                  <Button
                    onClick={() => setIsSedeModalOpen(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-2"
                  >
                    <Building className="w-4 h-4" />
                    <span>Crear Sede</span>
                  </Button>
                  
                  <Button
                    onClick={() => setIsAreaModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Crear Área</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Mostrar</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
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
            </div>

            {/* Tabla Completamente Responsiva */}
            <div className="w-full">
              <Table className="w-full table-fixed">
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 w-[30%]">
                      Servicio
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[35%]">
                      Centro de Costo
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[20%]">
                      Ubicación
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[15%]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviciosData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((servicio) => (
                    <TableRow key={servicio.id} className="hover:bg-gray-50">
                      {/* Servicio */}
                      <TableCell className="p-3 w-[30%]">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-900 text-sm leading-tight break-words whitespace-normal">
                            {servicio.nombre}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 px-2 py-0.5">
                              {servicio.zona}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Settings className="w-3 h-3 text-orange-600" />
                            <span>{servicio.equiposAsociados} equipos</span>
                            <Users className="w-3 h-3 text-teal-600" />
                            <span>{servicio.areasAsociadas} áreas</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Centro de Costo */}
                      <TableCell className="p-3 w-[35%]">
                        <div className="text-sm text-gray-700 leading-tight break-words whitespace-normal">
                          {servicio.centroCosto}
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 px-2 py-1 break-words whitespace-normal">
                            {servicio.sede}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      {/* Ubicación */}
                      <TableCell className="text-center p-3 w-[20%]">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-blue-600" />
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5">
                              {servicio.piso}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Acciones */}
                      <TableCell className="text-center p-3 w-[15%]">
                        <div className="flex flex-col gap-1 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600 text-white border-green-500"
                            onClick={() => handleView(servicio)}
                            title="Ver"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleEdit(servicio)}
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            onClick={() => handleDelete(servicio)}
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

            {/* Paginación */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de{" "}
                  {totalItems} entradas
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={
                        currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                      }
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
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
      <UIModalAgregarServicio
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UIModalEditarServicio
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        servicio={selectedService}
      />

      <UIModalEliminarServicio
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        servicio={selectedService}
      />

      <UIModalCrearZona
        isOpen={isZonaModalOpen}
        onClose={() => setIsZonaModalOpen(false)}
      />

      <UIModalCrearSede
        isOpen={isSedeModalOpen}
        onClose={() => setIsSedeModalOpen(false)}
      />

      <UIModalCrearArea
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
      />

      <UIModalVerServicio
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        servicio={selectedService}
      />
    </div>
  );
}
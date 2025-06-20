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
import { Edit, Trash2, Plus, Search, Settings } from "lucide-react";

// Importar modales
import UIModalAgregarServicio from "./modals/ui-modal-agregar-servicio";
import UIModalEditarServicio from "./modals/ui-modal-editar-servicio";
import UIModalEliminarServicio from "./modals/ui-modal-eliminar-servicio";

export default function VistaServiciosPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
      centroCosto: "ADMINISTRACION UES URGENCIAS",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 35,
      areasAsociadas: 0,
    },
    {
      id: 2,
      nombre: "2004 URGENCIAS SEDE NORTE",
      zona: "ZONA CRISTIAN",
      centroCosto: "ADMINISTRACION UES URGENCIAS",
      sede: "NORTE",
      equiposAsociados: 64,
      areasAsociadas: 8,
    },
    {
      id: 3,
      nombre: "ALMACEN GENERAL",
      zona: "N/R",
      centroCosto: "ALMACEN GENERAL",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 7,
      areasAsociadas: 0,
    },
    {
      id: 4,
      nombre: "ALMACEN GENERAL Y COMPRAS",
      zona: "N/R",
      centroCosto: "ALMACEN GENERAL",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 4,
      areasAsociadas: 1,
    },
    {
      id: 5,
      nombre: "AMBULANCIA",
      zona: "ZONA MOLANO1",
      centroCosto: "GINECOBSTETRICIA",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 56,
      areasAsociadas: 0,
    },
    {
      id: 6,
      nombre: "AMBULANCIA CARTAGO",
      zona: "N/R",
      centroCosto: "INVENTARIOS",
      sede: "CARTAGO",
      equiposAsociados: 22,
      areasAsociadas: 0,
    },
    {
      id: 7,
      nombre: "ANA FRANK",
      zona: "ZONA SALUD1",
      centroCosto: "SALA CIRUGIA PEDIATRICA ANA FR",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 94,
      areasAsociadas: 0,
    },
    {
      id: 8,
      nombre: "ANGAR",
      zona: "N/R",
      centroCosto: "ALMACEN GENERAL",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 11,
      areasAsociadas: 0,
    },
    {
      id: 9,
      nombre: "ANGIOGRAFIA",
      zona: "ZONA MOLANO1",
      centroCosto: "HEMODINAMIA",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 5,
      areasAsociadas: 0,
    },
    {
      id: 10,
      nombre: "ANHELO DE VIDA",
      zona: "ZONA SALUD1",
      centroCosto: "SALA PEDIATRIA GENERAL",
      sede: "SEDE PRINCIPAL",
      equiposAsociados: 70,
      areasAsociadas: 0,
    },
  ];

  const handleEdit = (servicio) => {
    setSelectedService(servicio);
    setIsEditModalOpen(true);
  };

  const handleDelete = (servicio) => {
    setSelectedService(servicio);
    setIsDeleteModalOpen(true);
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
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Servicio</span>
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

            {/* Tabla */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[150px]">
                      Zona
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[200px]">
                      Centro de costo
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 min-w-[120px]">
                      Sede
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center min-w-[120px]">
                      Equipos asociados
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center min-w-[120px]">
                      Áreas asociadas
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center min-w-[100px]">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviciosData.map((servicio) => (
                    <TableRow key={servicio.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-sm">
                        {servicio.nombre}
                      </TableCell>
                      <TableCell className="text-sm">{servicio.zona}</TableCell>
                      <TableCell className="text-sm">
                        {servicio.centroCosto}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline" className="text-xs">
                          {servicio.sede}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">
                        {servicio.equiposAsociados}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">
                        {servicio.areasAsociadas}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleEdit(servicio)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            onClick={() => handleDelete(servicio)}
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
                  Mostrando 1 a {Math.min(itemsPerPage, totalItems)} de{" "}
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
    </div>
  );
}

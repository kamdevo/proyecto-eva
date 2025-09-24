"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Edit, Trash2, Plus, Search, Users, Eye } from "lucide-react";

// Importar modales
import UIModalAgregarContacto from "./modals/ui-modal-agregar-contacto";
import UIModalEditarContacto from "./modals/ui-modal-editar-contacto";
import UIModalEliminarContacto from "./modals/ui-modal-eliminar-contacto";
import UIModalVerContacto from "./modals/ui-modal-ver-contacto";

export default function VistaContactosPrincipal() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Datos de contactos
  const contactsData = [
    {
      id: 1,
      nombre: "EQUIPOS TECTUM",
      email: "contacto@equipostectum.com",
      telefono: "318 555 0101",
      tipo: "PROVEEDOR",
      direccion: "Calle 123 #45-67, Bogotá",
      ciudad: "Bogotá",
      pais: "Colombia",
      nit: "900123456-1",
      contactoPrincipal: "Juan Pérez",
      estado: "ACTIVO"
    },
    {
      id: 2,
      nombre: "J.M MEDICOS EQUIPOS S.A.S",
      email: "info@jmequipos.com",
      telefono: "301 234 567 890",
      tipo: "PROVEEDOR",
      direccion: "Carrera 15 #32-18, Medellín",
      ciudad: "Medellín",
      pais: "Colombia",
      nit: "900234567-2",
      contactoPrincipal: "María González",
      estado: "ACTIVO"
    },
    {
      id: 3,
      nombre: "MEDICAS MEDICAL COLOMBIA SAS",
      email: "contacto@medicasmedical.com",
      telefono: "57 1 2345678",
      tipo: "PROVEEDOR",
      direccion: "Avenida 68 #45-23, Bogotá",
      ciudad: "Bogotá",
      pais: "Colombia",
      nit: "900345678-3",
      contactoPrincipal: "Carlos Rodríguez",
      estado: "ACTIVO"
    },
    {
      id: 4,
      nombre: "GERMAN MEDICAL SYSTEMS",
      email: "info@germanmedical.com",
      telefono: "+49 30 12345678",
      tipo: "FABRICANTE",
      direccion: "Berliner Str. 123, Berlin",
      ciudad: "Berlin",
      pais: "Alemania",
      nit: "DE123456789",
      contactoPrincipal: "Hans Mueller",
      estado: "ACTIVO"
    },
    {
      id: 5,
      nombre: "ABS EQUIPOS MEDICOS S.A.S",
      email: "ventas@absequipos.com",
      telefono: "6044567890",
      tipo: "REPRESENTANTE",
      direccion: "Calle 50 #25-30, Cali",
      ciudad: "Cali",
      pais: "Colombia",
      nit: "900456789-4",
      contactoPrincipal: "Ana López",
      estado: "ACTIVO"
    },
    {
      id: 6,
      nombre: "ADVANCED RADIOTHERAPY CORP",
      email: "contact@advancedradio.com",
      telefono: "+1 555 123 4567",
      tipo: "FABRICANTE",
      direccion: "123 Medical Ave, Boston",
      ciudad: "Boston",
      pais: "Estados Unidos",
      nit: "US987654321",
      contactoPrincipal: "John Smith",
      estado: "ACTIVO"
    },
    {
      id: 7,
      nombre: "AESCULAP AG",
      email: "info@aesculap.com",
      telefono: "+49 7461 95-0",
      tipo: "FABRICANTE",
      direccion: "Am Aesculap-Platz, Tuttlingen",
      ciudad: "Tuttlingen",
      pais: "Alemania",
      nit: "DE567890123",
      contactoPrincipal: "Klaus Weber",
      estado: "ACTIVO"
    },
    {
      id: 8,
      nombre: "AGFA HEALTHCARE",
      email: "healthcare@agfa.com",
      telefono: "+32 3 444 71 11",
      tipo: "FABRICANTE",
      direccion: "Septestraat 27, Mortsel",
      ciudad: "Mortsel",
      pais: "Bélgica",
      nit: "BE678901234",
      contactoPrincipal: "Pierre Dubois",
      estado: "ACTIVO"
    },
    {
      id: 9,
      nombre: "AGFA GEVAERT COLOMBIA S.A.S",
      email: "servicios_co@agfa.com",
      telefono: "57 1 6543210",
      tipo: "REPRESENTANTE",
      direccion: "Zona Franca Bogotá",
      ciudad: "Bogotá",
      pais: "Colombia",
      nit: "900789012-5",
      contactoPrincipal: "Roberto Silva",
      estado: "ACTIVO"
    },
    {
      id: 10,
      nombre: "SIEMENS HEALTHINEERS",
      email: "info@siemens-healthineers.com",
      telefono: "+49 9131 84-0",
      tipo: "FABRICANTE",
      direccion: "Henkestraße 127, Erlangen",
      ciudad: "Erlangen",
      pais: "Alemania",
      nit: "DE789012345",
      contactoPrincipal: "Michael Fischer",
      estado: "ACTIVO"
    }
  ];

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDelete = (contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  const filteredData = contactsData.filter(
    (contact) =>
      contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case "PROVEEDOR":
        return "bg-blue-100 text-blue-800";
      case "FABRICANTE":
        return "bg-green-100 text-green-800";
      case "REPRESENTANTE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Contactos</h1>
                <p className="text-sm text-slate-200">Gestión de contactos y proveedores</p>
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar contactos..."
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
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Contacto</span>
                </Button>

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
            <div className="w-full">
              <Table className="w-full table-fixed">
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 w-[30%]">Contacto</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[25%]">Email</TableHead>
                    <TableHead className="font-semibold text-slate-700 w-[20%]">Teléfono</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[15%]">Tipo</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-center w-[10%]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-gray-50">
                      <TableCell className="p-3 w-[30%]">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm leading-tight break-words whitespace-normal">
                            {contact.nombre}
                          </div>
                          <div className="text-xs text-gray-600">
                            ID: {contact.id} • {contact.contactoPrincipal}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-3 w-[25%]">
                        <div className="text-sm text-gray-700 break-all">
                          {contact.email}
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-3 w-[20%]">
                        <div className="text-sm text-gray-700">
                          {contact.telefono}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center p-3 w-[15%]">
                        <Badge className={`${getTypeColor(contact.tipo)} text-xs px-2 py-1`}>
                          {contact.tipo}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center p-3 w-[10%]">
                        <div className="flex flex-col gap-1 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleView(contact)}
                            title="Ver"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            onClick={() => handleEdit(contact)}
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500"
                            onClick={() => handleDelete(contact)}
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
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} entradas
                  {searchTerm && ` (filtrado de ${contactsData.length} entradas totales)`}
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
                      className={currentPage === i + 1 ? "bg-blue-500 text-white" : ""}
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
      <UIModalAgregarContacto
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <UIModalEditarContacto
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contacto={selectedContact}
      />

      <UIModalEliminarContacto
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        contacto={selectedContact}
      />

      <UIModalVerContacto
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        contacto={selectedContact}
      />
    </div>
  );
}
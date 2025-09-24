"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContactsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipoContacto: "PROVEEDOR",
  });
  const [contactToDelete, setContactToDelete] = useState(null);

  const contactsData = [
    {
      id: 1,
      nombre: "EQUIPOS TECTUM",
      email: "sin@email.com",
      telefono: "sin teléfono",
      correoElectronico: "PROVEEDOR",
      tipo: "PROVEEDOR",
    },
    {
      id: 2,
      nombre: "J.M MEDICOS EQUIPOS S.A.S",
      email: "info@jmequipos.com",
      telefono: "301 234 567 890",
      correoElectronico: "PROVEEDOR",
      tipo: "PROVEEDOR",
    },
    {
      id: 3,
      nombre: "MEDICAS MEDICAL COLOMBIA SAS",
      email: "contacto@medicasmedical.com",
      telefono: "57 1 2345678",
      correoElectronico: "PROVEEDOR",
      tipo: "PROVEEDOR",
    },
    {
      id: 4,
      nombre: "GERMAN MEDICAL SYSTEMS BRAND CO. LTD",
      email: "china.spain.colombia@company.com",
      telefono: "",
      correoElectronico: "FABRICANTE",
      tipo: "FABRICANTE",
    },
    {
      id: 5,
      nombre: "ABS EQUIPOS MEDICOS S.A.S",
      email: "ventas@absequipos.com",
      telefono: "6044567890",
      correoElectronico: "REPRESENTANTE",
      tipo: "REPRESENTANTE",
    },
    {
      id: 6,
      nombre: "ADVANCED RADIOTHERAPY CORPORATION",
      email: "",
      telefono: "",
      correoElectronico: "PROVEEDOR",
      tipo: "PROVEEDOR",
    },
    {
      id: 7,
      nombre: "AESCULAP AG",
      email: "info@aesculap@aesculap.com",
      telefono: "57 1 2345678",
      correoElectronico: "FABRICANTE",
      tipo: "FABRICANTE",
    },
    {
      id: 8,
      nombre: "AGFA",
      email: "",
      telefono: "",
      correoElectronico: "PROVEEDOR",
      tipo: "PROVEEDOR",
    },
    {
      id: 9,
      nombre: "AGFA GEVAERT COLOMBIA S.A.S",
      email: "servicios_co@agfa.com",
      telefono: "",
      correoElectronico: "PROVEEDOR",
      tipo: "PROVEEDOR",
    },
    {
      id: 10,
      nombre: "AGFA HEALTHCARE NV",
      email: "",
      telefono: "",
      correoElectronico: "FABRICANTE",
      tipo: "FABRICANTE",
    },
  ];

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        nombre: contact.nombre,
        email: contact.email,
        telefono: contact.telefono,
        tipoContacto: contact.tipo,
      });
    } else {
      setEditingContact(null);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        tipoContacto: "PROVEEDOR",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      tipoContacto: "PROVEEDOR",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para agregar o actualizar el contacto
    console.log(
      editingContact ? "Actualizando contacto:" : "Agregando contacto:",
      formData
    );
    handleCloseModal();
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
  };

  const confirmDelete = () => {
    // Aquí iría la lógica para eliminar el contacto
    console.log("Eliminando contacto:", contactToDelete);
    setContactToDelete(null);
  };

  const cancelDelete = () => {
    setContactToDelete(null);
  };

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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-4 sm:p-6 text-white">
          <h1 className="text-xl sm:text-2xl font-bold">Contactos y proveedores</h1>
          <p className="text-slate-200 mt-1 text-sm sm:text-base">
            Gestión de contactos y proveedores del sistema
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Lista de Contactos
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona todos los contactos y proveedores
                </p>
              </div>

              {/* Add Contact Button */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Contacto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      {editingContact
                        ? "Actualizar Contacto"
                        : "Agregar Contacto"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingContact
                        ? "Modifica la información del contacto seleccionado."
                        : "Completa la información para agregar un nuevo contacto."}
                    </DialogDescription>
                  </DialogHeader>

                  {/* Contact Form */}
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">
                        Nombre
                      </Label>
                      <Input
                        id="nombre"
                        placeholder="Nombre del contacto"
                        value={formData.nombre}
                        onChange={(e) =>
                          handleInputChange("nombre", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-sm font-medium">
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        placeholder="Número de teléfono"
                        value={formData.telefono}
                        onChange={(e) =>
                          handleInputChange("telefono", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="tipoContacto"
                        className="text-sm font-medium"
                      >
                        Tipo de contacto
                      </Label>
                      <Select
                        value={formData.tipoContacto}
                        onValueChange={(value) =>
                          handleInputChange("tipoContacto", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
                          <SelectItem value="FABRICANTE">FABRICANTE</SelectItem>
                          <SelectItem value="REPRESENTANTE">
                            REPRESENTANTE
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {editingContact ? "Actualizar" : "Agregar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar contactos..." className="pl-10" />
              </div>
              <Select defaultValue="10">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 registros por página</SelectItem>
                  <SelectItem value="25">25 registros por página</SelectItem>
                  <SelectItem value="50">50 registros por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {/* Contacts Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table className="w-full">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900 min-w-[200px]">
                      Nombre
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 w-16">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 min-w-[200px]">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 min-w-[150px]">
                      Teléfono
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 min-w-[120px]">
                      Tipo
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center w-24">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactsData.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900 text-sm">
                        <div className="break-words">{contact.nombre}</div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {contact.id}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        <div className="break-all">
                          {contact.email || "sin@email.com"}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {contact.telefono || "sin teléfono"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(contact.tipo)} text-xs`}>
                          {contact.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Button - Blue */}
                          <Button
                            size="sm"
                            onClick={() => handleOpenModal(contact)}
                            className="w-7 h-7 p-0 bg-blue-500 hover:bg-blue-600 rounded-md"
                            title="Editar contacto"
                          >
                            <Pencil className="h-3 w-3 text-white" />
                          </Button>

                          {/* Delete Button - Red */}
                          <Button
                            size="sm"
                            onClick={() => handleDeleteContact(contact)}
                            className="w-7 h-7 p-0 bg-red-500 hover:bg-red-600 rounded-md"
                            title="Eliminar contacto"
                          >
                            <Trash2 className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                Mostrando registros del 1 al 10 de un total de 10 registros
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button variant="outline" size="sm" disabled className="hidden sm:flex">
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button variant="outline" size="sm" disabled className="sm:hidden">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 text-white"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:block">
                    3
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:block">
                    4
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:block">
                    5
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={() => setContactToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              contacto{" "}
              <span className="font-semibold">{contactToDelete?.nombre}</span>{" "}
              del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
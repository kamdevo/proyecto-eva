"use client";

import { useState, useEffect } from "react";
import httpService from "../services/httpService";
import { toast } from "sonner";
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
    name: "",
    email: "",
    telefono: "",
    tcontacto_id: null,
  });
  const [contactToDelete, setContactToDelete] = useState(null);
  const [contactsData, setContactsData] = useState([]);
  const [tiposContacto, setTiposContacto] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchContactos();
    fetchTiposContacto();
  }, []);

  const fetchContactos = async (search = "") => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await httpService.get("/v1/contactos/list", { params });
      if (response.data.success) {
        setContactsData(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando contactos:", error);
      toast.error("Error al cargar contactos");
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposContacto = async () => {
    try {
      const response = await httpService.get("/v1/tcontacto");
      if (response.data.success) {
        setTiposContacto(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando tipos de contacto:", error);
    }
  };

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        email: contact.email || "",
        telefono: contact.telefono || "",
        tcontacto_id: contact.tcontacto_id || null,
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: "",
        email: "",
        telefono: "",
        tcontacto_id: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
    setFormData({
      name: "",
      email: "",
      telefono: "",
      tcontacto_id: null,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error("El nombre es requerido");
        return;
      }

      const loadingToast = toast.loading(editingContact ? "Actualizando contacto..." : "Creando contacto...");

      if (editingContact) {
        await httpService.put(`/v1/contactos/${editingContact.id}`, formData);
        toast.success("Contacto actualizado exitosamente", { id: loadingToast });
      } else {
        await httpService.post("/v1/contactos/create", formData);
        toast.success("Contacto creado exitosamente", { id: loadingToast });
      }

      handleCloseModal();
      fetchContactos();
    } catch (error) {
      console.error("Error guardando contacto:", error);
      toast.error("Error al guardar contacto");
    }
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
  };

  const confirmDelete = async () => {
    try {
      const loadingToast = toast.loading("Eliminando contacto...");
      await httpService.delete(`/v1/contactos/${contactToDelete.id}`);
      toast.success("Contacto eliminado exitosamente", { id: loadingToast });
      setContactToDelete(null);
      fetchContactos();
    } catch (error) {
      console.error("Error eliminando contacto:", error);
      toast.error("Error al eliminar contacto");
    }
  };

  const cancelDelete = () => {
    setContactToDelete(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.length >= 3 || value.length === 0) {
      fetchContactos(value);
    }
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
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nombre *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Nombre del contacto"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full"
                        required
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
                        htmlFor="tcontacto_id"
                        className="text-sm font-medium"
                      >
                        Tipo de contacto
                      </Label>
                      <Select
                        value={formData.tcontacto_id?.toString() || ""}
                        onValueChange={(value) =>
                          handleInputChange("tcontacto_id", value ? parseInt(value) : null)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposContacto.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.name}
                            </SelectItem>
                          ))}
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
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">Cargando contactos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : contactsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No se encontraron contactos
                      </TableCell>
                    </TableRow>
                  ) : (
                    contactsData.map((contact) => (
                      <TableRow key={contact.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900 text-sm">
                          <div className="break-words">{contact.name}</div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {contact.id}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          <div className="break-all">
                            {contact.email || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {contact.telefono || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {contact.tipo_nombre || "Sin tipo"}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                {loading ? (
                  "Cargando..."
                ) : (
                  `Mostrando ${contactsData.length} contacto${contactsData.length !== 1 ? 's' : ''}`
                )}
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
              <span className="font-semibold">{contactToDelete?.name}</span>{" "}
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
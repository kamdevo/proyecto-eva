"use client";

import { useState, useEffect } from "react";
import httpService from "../services/httpService";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Mail,
  Phone,
  Tag,
  Loader2,
  Package,
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
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar datos al montar el componente y cuando cambie el ordenamiento
  useEffect(() => {
    fetchContactos(searchTerm, currentPage);
    fetchTiposContacto();
  }, [sortField, sortDirection, currentPage]);

  const fetchContactos = async (search = "", page = 1) => {
    try {
      setLoading(true);
      const params = { 
        ...(search ? { search } : {}),
        sort_by: sortField,
        sort_direction: sortDirection,
        page: page,
        per_page: 10
      };
      const response = await httpService.get("/v1/contactos/list", { params });
      if (response.data.success) {
        setContactsData(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.last_page);
          setTotalItems(response.data.pagination.total);
        }
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
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-500" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
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
    setCurrentPage(1); // Reset to first page on search
    if (value.length >= 3 || value.length === 0) {
      fetchContactos(value, 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F4F6] p-4 md:p-8">
      
      {/* ── PAGE HEADER (White Editorial Style) ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-blue-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
              Contactos y Proveedores
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg text-sm">
              Gestión centralizada de fabricantes, representantes y proveedores externos vinculados al sistema EVA.
            </p>
          </div>
        </div>

        {/* Summary Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl  flex items-center gap-5 w-full md:w-64 transition-all hover:shadow-md">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registros</p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Barra de Controles y Búsqueda */}
        <div className="bg-white p-4 rounded-3xl  border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm shadow-inner"
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12  transition-all font-bold w-full lg:w-auto shrink-0"
              >
                <Plus className="w-5 h-5 font-bold" />
                Nuevo Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                     <Plus className="w-5 h-5" />
                   </div>
                   <DialogTitle className="text-xl font-bold text-slate-900">
                     {editingContact ? "Actualizar Contacto" : "Agregar Contacto"}
                   </DialogTitle>
                </div>
                <DialogDescription className="text-slate-500">
                  {editingContact
                    ? "Modifica los detalles del contacto seleccionado."
                    : "Ingresa la información básica del nuevo contacto/proveedor."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner"
                    placeholder="Nombre o Razón Social"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange("telefono", e.target.value)}
                        className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner"
                        placeholder="000-000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tcontacto_id" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Clasificación</Label>
                    <Select
                      value={formData.tcontacto_id?.toString() || ""}
                      onValueChange={(v) => handleInputChange("tcontacto_id", v ? parseInt(v) : null)}
                    >
                      <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 shadow-inner">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100">
                        {tiposContacto.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleCloseModal} className="flex-1 h-12 rounded-xl text-slate-500 hover:bg-slate-50">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100">
                  {editingContact ? "Actualizar" : "Guardar Registro"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabla de Resultados */}
        <div className="overflow-hidden rounded-3xl bg-white  overflow-x-auto relative">
          {loading && contactsData.length > 0 && (
            <div className="absolute inset-x-0 top-0 h-1 bg-blue-100 overflow-hidden z-10">
              <div className="h-full bg-blue-600 animate-progress origin-left"></div>
            </div>
          )}
            <table className={`w-full text-left border-separate border-spacing-0 text-sm ${loading && contactsData.length > 0 ? 'opacity-40 transition-opacity duration-300' : 'transition-opacity duration-300'}`}>
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-100">
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      Nombre / Razón Social {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    ID {getSortIcon('id')}
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    Correo Electrónico {getSortIcon('email')}
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    Teléfono {getSortIcon('telefono')}
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 text-center">
                    Tipo de Contacto
                  </th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100" /><div className="space-y-2"><div className="h-4 w-32 bg-slate-100 rounded" /><div className="h-3 w-24 bg-slate-100 rounded" /></div></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-40 bg-slate-100 rounded" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                      <td className="px-6 py-5 text-center"><div className="h-5 w-20 bg-slate-100 rounded-full mx-auto" /></td>
                      <td className="px-6 py-5 text-right"><div className="flex gap-2 justify-end"><div className="h-8 w-8 bg-slate-100 rounded-lg" /><div className="h-8 w-8 bg-slate-100 rounded-lg" /><div className="h-8 w-8 bg-slate-100 rounded-lg" /></div></td>
                    </tr>
                  ))
                ) : contactsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Users className="h-16 w-16 text-slate-100" />
                        <span className="text-slate-400 font-medium italic">No se encontraron registros</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contactsData.map((contact) => (
                    <tr key={contact.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100/50 group-hover:scale-110 transition-transform">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded-lg">#{contact.id}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic">
                        {contact.email ? (
                          <div className="flex items-center gap-2">
                             <Mail className="w-3.5 h-3.5 opacity-40" />
                             {contact.email}
                          </div>
                        ) : <span className="opacity-25">—</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {contact.telefono ? (
                          <div className="flex items-center gap-2">
                             <Phone className="w-3.5 h-3.5 opacity-40" />
                             {contact.telefono}
                          </div>
                        ) : <span className="opacity-25">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-white/50 ${
                           contact.tipo_nombre?.toUpperCase().includes('PROVEEDOR') ? 'bg-indigo-100 text-indigo-700' :
                           contact.tipo_nombre?.toUpperCase().includes('FABRICANTE') ? 'bg-amber-100 text-amber-700' :
                           'bg-emerald-100 text-emerald-700'
                         }`}>
                           <Tag className="w-3 h-3" />
                           {contact.tipo_nombre || "General"}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(contact)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                            title="Editar registro"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                            title="Eliminar registro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={(page) => setCurrentPage(page)}
              showInfo={true}
            />
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={() => setContactToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                 <Trash2 className="w-6 h-6" />
               </div>
               <AlertDialogTitle className="text-xl font-bold text-slate-900 italic">¿Confirmar Eliminación?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Estás a punto de eliminar permanentemente a <span className="font-bold text-slate-800">{contactToDelete?.name}</span>. 
              Esta acción es irreversible y podría afectar registros históricos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel onClick={cancelDelete} className="h-12 rounded-xl text-slate-500 border-slate-200">
              Conservar Registro
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Sí, Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

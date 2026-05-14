"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Building2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Factory,
} from "lucide-react";
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
import Pagination from "@/components/common/Pagination";
import ConfigPageSkeleton from "@/components/skeletons/ConfigPageSkeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import UIModalAgregarEmpresaMto from "@/components/modals/ui-modal-agregar-empresa-mto";
import UIModalEditarEmpresaMto from "@/components/modals/ui-modal-editar-empresa-mto";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export default function VistaEmpresasMantenimiento() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [empresaToDelete, setEmpresaToDelete] = useState(null);

  const [empresasData, setEmpresasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async (search = searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(
        `${API_URL}/v1/proveedores-mantenimiento?${params.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al cargar empresas");
      }

      let data = result.data || [];
      data = [...data].sort((a, b) => {
        let valA = a[sortField] ?? "";
        let valB = b[sortField] ?? "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });

      setEmpresasData(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al cargar empresas de mantenimiento");
      setEmpresasData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortField, sortDirection]);

  const toggleStatus = async (empresa) => {
    const newStatus = empresa.status === 1 ? 0 : 1;
    setEmpresasData((prev) =>
      prev.map((e) => (e.id === empresa.id ? { ...e, status: newStatus } : e))
    );
    try {
      const response = await fetch(
        `${API_URL}/v1/proveedores-mantenimiento/${empresa.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name: empresa.name, status: newStatus }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message);
      toast.success(newStatus === 1 ? "Empresa activada" : "Empresa desactivada");
    } catch (error) {
      setEmpresasData((prev) =>
        prev.map((e) => (e.id === empresa.id ? { ...e, status: empresa.status } : e))
      );
      toast.error(error.message || "Error al cambiar estado");
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (value.length >= 2 || value.length === 0) {
      fetchData(value);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = empresasData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDirection === "asc"
      ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />;
  };

  const confirmDelete = async () => {
    if (!empresaToDelete) return;
    try {
      const response = await fetch(
        `${API_URL}/v1/proveedores-mantenimiento/${empresaToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al eliminar empresa");
      }
      toast.success("Empresa eliminada correctamente");
      setEmpresaToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al eliminar empresa");
      setEmpresaToDelete(null);
    }
  };

  if (loading && empresasData.length === 0) {
    return <ConfigPageSkeleton columns={3} rows={6} accentColor="amber" />;
  }

  return (
    <div className="min-h-screen bg-[#F1F4F6] p-4 md:p-8">

      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl text-amber-500">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
              Empresas de Mantenimiento
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg text-sm">
              Administracion de proveedores y empresas externas de mantenimiento del sistema EVA.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center gap-5 w-full md:w-64 transition-all hover:shadow-md">
          <div className="bg-amber-100 p-3 rounded-2xl">
            <Building2 className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Empresas
            </p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Buscar empresa por nombre..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-400 text-sm shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <span className="hidden sm:inline">Mostrar</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-12 bg-slate-50 border-none rounded-2xl shadow-inner">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-amber-100 transition-all font-bold w-full lg:w-auto shrink-0"
          >
            <Plus className="w-5 h-5" />
            Nueva Empresa
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white overflow-x-auto relative">
          {loading && empresasData.length > 0 && (
            <div className="absolute inset-x-0 top-0 h-1 bg-amber-100 overflow-hidden z-10">
              <div className="h-full bg-amber-400 animate-progress origin-left" />
            </div>
          )}

          <table
            className={`w-full text-left border-separate border-spacing-0 text-sm ${
              loading && empresasData.length > 0
                ? "opacity-40 transition-opacity duration-300"
                : "transition-opacity duration-300"
            }`}
          >
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 w-24">
                  <button
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-1.5 hover:text-amber-600 transition-colors"
                  >
                    ID {getSortIcon("id")}
                  </button>
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1.5 hover:text-amber-600 transition-colors"
                  >
                    Nombre de la Empresa {getSortIcon("name")}
                  </button>
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 w-32 text-center">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1.5 hover:text-amber-600 transition-colors mx-auto"
                  >
                    Estado {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 text-right w-36">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-5 w-12 bg-slate-100 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-56 bg-slate-100 rounded" /></td>
                    <td className="px-6 py-4 text-center"><div className="h-5 w-16 bg-slate-100 rounded-full mx-auto" /></td>
                    <td className="px-6 py-4 text-right"><div className="flex gap-2 justify-end"><div className="h-8 w-8 bg-slate-100 rounded-lg" /><div className="h-8 w-8 bg-slate-100 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Building2 className="h-16 w-16 text-slate-100" />
                      <span className="text-slate-400 font-medium italic">
                        No se encontraron empresas
                      </span>
                      {searchTerm && (
                        <span className="text-xs text-slate-300">
                          Intenta con otro termino de busqueda
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((empresa) => (
                  <tr
                    key={empresa.id}
                    className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded-lg">
                        #{empresa.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold border border-amber-100/50 group-hover:scale-110 transition-transform">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700 uppercase tracking-wide">
                          {empresa.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Switch
                          checked={empresa.status === 1}
                          onCheckedChange={() => toggleStatus(empresa)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className={`text-[10px] font-semibold ${
                          empresa.status === 1 ? "text-green-600" : "text-slate-400"
                        }`}>
                          {empresa.status === 1 ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedEmpresa(empresa);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                          title="Editar empresa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEmpresaToDelete(empresa)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                          title="Eliminar empresa"
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
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              showInfo={true}
            />
          </div>
        </div>
      </div>

      <AlertDialog
        open={!!empresaToDelete}
        onOpenChange={() => setEmpresaToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">
                Confirmar Eliminacion
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Estas a punto de eliminar la empresa{" "}
              <span className="font-bold text-slate-800">
                {empresaToDelete?.name}
              </span>
              . Si tiene registros de mantenimiento asociados, la eliminacion sera bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel
              onClick={() => setEmpresaToDelete(null)}
              className="h-12 rounded-xl text-slate-500 border-slate-200"
            >
              Conservar Registro
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Si, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UIModalAgregarEmpresaMto
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          fetchData();
        }}
      />

      <UIModalEditarEmpresaMto
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          fetchData();
        }}
        empresa={selectedEmpresa}
      />
    </div>
  );
}

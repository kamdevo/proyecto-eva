"use client";

import { useState, useEffect, useRef } from "react";
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
  Wrench,
  Check,
  X,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Pagination from "@/components/common/Pagination";
import ConfigPageSkeleton from "@/components/skeletons/ConfigPageSkeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import UIModalAgregarEmpresaMto from "@/components/modals/ui-modal-agregar-empresa-mto";
import UIModalEditarEmpresaMto from "@/components/modals/ui-modal-editar-empresa-mto";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export default function VistaEmpresasMantenimiento() {
  const [activeTab, setActiveTab] = useState("empresas");

  // ─── Estado pestaña Empresas ───────────────────────────────────────────────
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

  // ─── Estado pestaña Proveedores ────────────────────────────────────────────
  const [proveedores, setProveedores] = useState([]);
  const [provLoading, setProvLoading] = useState(true);
  const [provSearch, setProvSearch] = useState("");
  const [provPage, setProvPage] = useState(1);
  const [provPerPage, setProvPerPage] = useState(10);
  const [provSortField, setProvSortField] = useState("id");
  const [provSortDir, setProvSortDir] = useState("desc");
  const [provToDelete, setProvToDelete] = useState(null);
  // Edición inline
  const [editingProvId, setEditingProvId] = useState(null);
  const [editingProvName, setEditingProvName] = useState("");
  // Agregar inline
  const [addingProv, setAddingProv] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const newProvRef = useRef(null);

  // ─── Empresas: carga ──────────────────────────────────────────────────────
  const fetchData = async (search = searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const response = await fetch(`${API_URL}/v1/empresas?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Error al cargar empresas");
      let data = [...(result.data || [])].sort((a, b) => {
        let valA = (a[sortField] ?? "").toString().toLowerCase();
        let valB = (b[sortField] ?? "").toString().toLowerCase();
        return valA < valB ? (sortDirection === "asc" ? -1 : 1) : valA > valB ? (sortDirection === "asc" ? 1 : -1) : 0;
      });
      setEmpresasData(data);
      setTotalItems(data.length);
    } catch (error) {
      toast.error(error.message || "Error al cargar empresas");
      setEmpresasData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [sortField, sortDirection]);

  // ─── Proveedores: carga ───────────────────────────────────────────────────
  const fetchProveedores = async (search = provSearch) => {
    try {
      setProvLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`${API_URL}/v1/proveedores-mantenimiento?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Error al cargar proveedores");
      setProveedores(data.data || []);
    } catch (err) {
      toast.error(err.message || "Error al cargar proveedores");
      setProveedores([]);
    } finally {
      setProvLoading(false);
    }
  };

  useEffect(() => { fetchProveedores(); }, []);

  // ─── Empresas: helpers ────────────────────────────────────────────────────
  const toggleStatus = async (empresa) => {
    const newEstado = empresa.estado === "true" ? "false" : "true";
    setEmpresasData((prev) => prev.map((e) => e.id === empresa.id ? { ...e, estado: newEstado } : e));
    try {
      const res = await fetch(`${API_URL}/v1/empresas/${empresa.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name: empresa.name, area: empresa.area, estado: newEstado }),
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      toast.success(newEstado === "true" ? "Empresa activada" : "Empresa desactivada");
    } catch {
      setEmpresasData((prev) => prev.map((e) => e.id === empresa.id ? { ...e, estado: empresa.estado } : e));
      toast.error("Error al cambiar estado");
    }
  };

  const handleSearch = (value) => { setSearchTerm(value); setCurrentPage(1); if (value.length >= 2 || value.length === 0) fetchData(value); };
  const handleSort = (field) => { if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDirection("asc"); } };
  const getSortIcon = (field) => sortField !== field ? <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" /> : sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-500" />;

  const confirmDelete = async () => {
    if (!empresaToDelete) return;
    try {
      const res = await fetch(`${API_URL}/v1/empresas/${empresaToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Error al eliminar");
      toast.success("Empresa eliminada correctamente");
      setEmpresaToDelete(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Error al eliminar empresa");
      setEmpresaToDelete(null);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = empresasData.slice(startIndex, startIndex + itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [itemsPerPage]);

  // ─── Proveedores: helpers ─────────────────────────────────────────────────
  const handleProvSearch = (v) => { setProvSearch(v); setProvPage(1); if (v.length >= 2 || v.length === 0) fetchProveedores(v); };
  const handleProvSort = (field) => { if (provSortField === field) setProvSortDir(provSortDir === "asc" ? "desc" : "asc"); else { setProvSortField(field); setProvSortDir("asc"); } };
  const getProvSortIcon = (field) => provSortField !== field ? <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" /> : provSortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-blue-500" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;

  const filteredProveedores = [...proveedores].sort((a, b) => {
    let valA = (a[provSortField] ?? "").toString().toLowerCase();
    let valB = (b[provSortField] ?? "").toString().toLowerCase();
    return valA < valB ? (provSortDir === "asc" ? -1 : 1) : valA > valB ? (provSortDir === "asc" ? 1 : -1) : 0;
  });
  const provTotalPages = Math.ceil(filteredProveedores.length / provPerPage);
  const provStart = (provPage - 1) * provPerPage;
  const currentProvData = filteredProveedores.slice(provStart, provStart + provPerPage);
  useEffect(() => { setProvPage(1); }, [provPerPage]);

  const toggleProvStatus = async (prov) => {
    const newStatus = prov.status === 1 ? 0 : 1;
    setProveedores((prev) => prev.map((p) => p.id === prov.id ? { ...p, status: newStatus } : p));
    try {
      const res = await fetch(`${API_URL}/v1/proveedores-mantenimiento/${prov.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name: prov.name, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(newStatus === 1 ? "Proveedor activado" : "Proveedor desactivado");
    } catch {
      setProveedores((prev) => prev.map((p) => p.id === prov.id ? { ...p, status: prov.status } : p));
      toast.error("Error al cambiar estado");
    }
  };

  const startEditProv = (prov) => { setEditingProvId(prov.id); setEditingProvName(prov.name); setAddingProv(false); };
  const cancelEditProv = () => { setEditingProvId(null); setEditingProvName(""); };

  const saveEditProv = async (prov) => {
    if (!editingProvName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/v1/proveedores-mantenimiento/${prov.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name: editingProvName.trim(), status: prov.status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Error al guardar");
      toast.success("Proveedor actualizado");
      cancelEditProv();
      fetchProveedores();
    } catch (err) {
      toast.error(err.message || "Error al actualizar proveedor");
    }
  };

  const saveNewProv = async () => {
    if (!newProvName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/v1/proveedores-mantenimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name: newProvName.trim(), status: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Error al crear");
      toast.success("Proveedor creado correctamente");
      setNewProvName("");
      setAddingProv(false);
      fetchProveedores();
    } catch (err) {
      toast.error(err.message || "Error al crear proveedor");
    }
  };

  const confirmDeleteProv = async () => {
    if (!provToDelete) return;
    try {
      const res = await fetch(`${API_URL}/v1/proveedores-mantenimiento/${provToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Error al eliminar");
      toast.success("Proveedor eliminado");
      setProvToDelete(null);
      fetchProveedores();
    } catch (err) {
      toast.error(err.message || "Error al eliminar proveedor");
      setProvToDelete(null);
    }
  };

  useEffect(() => { if (addingProv && newProvRef.current) newProvRef.current.focus(); }, [addingProv]);

  if (loading && empresasData.length === 0 && provLoading && proveedores.length === 0) {
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
              Empresas y Proveedores de Mantenimiento
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl text-sm">
              Gestiona las empresas externas y los proveedores que aparecen en los registros de mantenimiento preventivo.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-100 p-4 rounded-3xl flex items-center gap-4 transition-all hover:shadow-md">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <Building2 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Empresas</p>
              <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-3xl flex items-center gap-4 transition-all hover:shadow-md">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Proveedores</p>
              <p className="text-2xl font-bold text-slate-900">{proveedores.length}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-100 rounded-2xl p-1 mb-6 h-auto gap-1">
            <TabsTrigger
              value="empresas"
              className="rounded-xl px-6 py-3 text-sm font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Empresas de Mantenimiento
            </TabsTrigger>
            <TabsTrigger
              value="proveedores"
              className="rounded-xl px-6 py-3 text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Proveedores de Preventivos
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB EMPRESAS ─────────────────────────────────────────────────────── */}
          <TabsContent value="empresas" className="space-y-6">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <Input placeholder="Buscar empresa por nombre..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-400 text-sm shadow-inner" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
                <span className="hidden sm:inline">Mostrar</span>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-20 h-12 bg-slate-50 border-none rounded-2xl shadow-inner"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setIsAddModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-amber-100 font-bold w-full lg:w-auto shrink-0">
                <Plus className="w-5 h-5" /> Nueva Empresa
              </Button>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white overflow-x-auto relative">
              {loading && empresasData.length > 0 && (
                <div className="absolute inset-x-0 top-0 h-1 bg-amber-100 overflow-hidden z-10">
                  <div className="h-full bg-amber-400 animate-progress origin-left" />
                </div>
              )}
              <table className={`w-full text-left border-separate border-spacing-0 text-sm ${loading && empresasData.length > 0 ? "opacity-40 transition-opacity" : "transition-opacity"}`}>
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    {[["id", "ID", "w-24"], ["name", "Nombre de la Empresa", ""], ["area", "Área", ""], ["estado", "Estado", "w-32 text-center"], [null, "Acciones", "text-right w-36"]].map(([field, label, cls]) => (
                      <th key={label} className={`px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 ${cls}`}>
                        {field ? <button onClick={() => handleSort(field)} className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">{label} {getSortIcon(field)}</button> : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[24, 56, 32, 16, 8].map((w, ci) => <td key={ci} className="px-6 py-4"><div className={`h-4 w-${w} bg-slate-100 rounded`} /></td>)}
                      </tr>
                    ))
                  ) : currentData.length === 0 ? (
                    <tr><td colSpan={5} className="h-48 text-center text-slate-400 italic">No se encontraron empresas</td></tr>
                  ) : currentData.map((empresa) => (
                    <tr key={empresa.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded-lg">#{empresa.id}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold border border-amber-100/50 group-hover:scale-110 transition-transform">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 uppercase tracking-wide">{empresa.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-slate-500 text-sm">{empresa.area || "—"}</span></td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch checked={empresa.estado === "true"} onCheckedChange={() => toggleStatus(empresa)} className="data-[state=checked]:bg-green-500" />
                          <span className={`text-[10px] font-semibold ${empresa.estado === "true" ? "text-green-600" : "text-slate-400"}`}>
                            {empresa.estado === "true" ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedEmpresa(empresa); setIsEditModalOpen(true); }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEmpresaToDelete(empresa)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
                <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)} showInfo={true} />
              </div>
            </div>
          </TabsContent>

          {/* ─── TAB PROVEEDORES ──────────────────────────────────────────────────── */}
          <TabsContent value="proveedores" className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              <strong>Nota:</strong> Estos proveedores son los que aparecen en el selector al registrar un mantenimiento preventivo.
              Crea aquí los proveedores para que se listen en ese formulario.
            </div>

            <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <Input placeholder="Buscar proveedor por nombre..." value={provSearch} onChange={(e) => handleProvSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-sm shadow-inner" />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
                <span className="hidden sm:inline">Mostrar</span>
                <Select value={provPerPage.toString()} onValueChange={(v) => { setProvPerPage(Number(v)); setProvPage(1); }}>
                  <SelectTrigger className="w-20 h-12 bg-slate-50 border-none rounded-2xl shadow-inner"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setAddingProv(true); setEditingProvId(null); }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-blue-100 font-bold w-full lg:w-auto shrink-0">
                <Plus className="w-5 h-5" /> Nuevo Proveedor
              </Button>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white overflow-x-auto relative">
              <table className="w-full text-left border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    {[["id", "ID", "w-24"], ["name", "Nombre del Proveedor", ""], ["status", "Estado", "w-40 text-center"], [null, "Acciones", "text-right w-36"]].map(([field, label, cls]) => (
                      <th key={label} className={`px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 ${cls}`}>
                        {field ? <button onClick={() => handleProvSort(field)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">{label} {getProvSortIcon(field)}</button> : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Fila nueva */}
                  {addingProv && (
                    <tr className="bg-blue-50/50 border-b border-blue-100">
                      <td className="px-6 py-3 text-slate-400 text-xs italic">Nuevo</td>
                      <td className="px-6 py-3" colSpan={2}>
                        <Input ref={newProvRef} value={newProvName} onChange={(e) => setNewProvName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveNewProv(); if (e.key === "Escape") { setAddingProv(false); setNewProvName(""); } }}
                          placeholder="Nombre del proveedor..." className="h-9 rounded-xl border-blue-200 focus:ring-blue-400 text-sm" />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={saveNewProv} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="Guardar"><Check className="h-4 w-4" /></button>
                          <button onClick={() => { setAddingProv(false); setNewProvName(""); }} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors" title="Cancelar"><X className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {provLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[24, 56, 24, 16].map((w, ci) => <td key={ci} className="px-6 py-4"><div className={`h-4 w-${w} bg-slate-100 rounded`} /></td>)}
                      </tr>
                    ))
                  ) : currentProvData.length === 0 && !addingProv ? (
                    <tr><td colSpan={4} className="h-48 text-center text-slate-400 italic">
                      No hay proveedores. Haz clic en "Nuevo Proveedor" para agregar el primero.
                    </td></tr>
                  ) : currentProvData.map((prov) => (
                    <tr key={prov.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded-lg">#{prov.id}</span></td>
                      <td className="px-6 py-4">
                        {editingProvId === prov.id ? (
                          <Input value={editingProvName} onChange={(e) => setEditingProvName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveEditProv(prov); if (e.key === "Escape") cancelEditProv(); }}
                            className="h-9 rounded-xl border-blue-200 focus:ring-blue-400 text-sm" autoFocus />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50 group-hover:scale-110 transition-transform">
                              <Wrench className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-slate-700">{prov.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch checked={prov.status === 1} onCheckedChange={() => toggleProvStatus(prov)} className="data-[state=checked]:bg-green-500" />
                          <span className={`text-[10px] font-semibold ${prov.status === 1 ? "text-green-600" : "text-slate-400"}`}>
                            {prov.status === 1 ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingProvId === prov.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => saveEditProv(prov)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="Guardar"><Check className="h-4 w-4" /></button>
                            <button onClick={cancelEditProv} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors" title="Cancelar"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => startEditProv(prov)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Editar"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => setProvToDelete(prov)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors" title="Eliminar"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
                <Pagination currentPage={provPage} totalPages={provTotalPages} totalItems={filteredProveedores.length}
                  itemsPerPage={provPerPage} onPageChange={(page) => setProvPage(page)} showInfo={true} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Diálogos de confirmación ─────────────────────────────────────────── */}
      <AlertDialog open={!!empresaToDelete} onOpenChange={() => setEmpresaToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><Trash2 className="w-6 h-6" /></div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">Confirmar Eliminación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500">
              Estás a punto de eliminar la empresa <span className="font-bold text-slate-800">{empresaToDelete?.name}</span>.
              Si tiene registros asociados, la eliminación será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel onClick={() => setEmpresaToDelete(null)} className="h-12 rounded-xl text-slate-500 border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">Sí, Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!provToDelete} onOpenChange={() => setProvToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><Trash2 className="w-6 h-6" /></div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">Confirmar Eliminación</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500">
              Estás a punto de eliminar el proveedor <span className="font-bold text-slate-800">{provToDelete?.name}</span>.
              Si tiene registros de mantenimiento asociados, la eliminación será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel onClick={() => setProvToDelete(null)} className="h-12 rounded-xl text-slate-500 border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProv} className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">Sí, Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UIModalAgregarEmpresaMto isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); fetchData(); }} />
      <UIModalEditarEmpresaMto isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); fetchData(); }} empresa={selectedEmpresa} />
    </div>
  );
}

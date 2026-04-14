"use client";

import { useState, useEffect } from "react";
import httpService from "../services/httpService";
import { cachedGet, invalidateConfigCache } from "../services/configDataCache";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Package,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Boxes,
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

// Importar componentes comunes
import Pagination from "@/components/common/Pagination";
import ConfigPageSkeleton from "@/components/skeletons/ConfigPageSkeleton";
import UIModalMateriales from "@/components/modals/ui-modal-materiales";
import { toast } from "sonner";


export default function VistaMateriales() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de ordenamiento
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  // Estado para confirmar eliminación
  const [itemToDelete, setItemToDelete] = useState(null);

  const [materialesData, setMaterialesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar datos
  useEffect(() => {
    fetchData();
  }, [searchTerm, currentPage, itemsPerPage, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await cachedGet("/v1/materiales", {
          search: searchTerm,
          page: currentPage,
          per_page: itemsPerPage,
          sort_by: sortField,
          sort_order: sortDirection
      });
      if (res.success) {
        setMaterialesData(res.data.data);
        setTotalItems(res.data.total);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los materiales");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleOpenView = (item) => {
    setModalMode("view");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (newData) => {
    try {
      const loadingToast = toast.loading(selectedItem ? "Actualizando..." : "Guardando...");

      let response;
      if (selectedItem) {
        response = await httpService.put(`/v1/materiales/${selectedItem.id}`, newData);
      } else {
        response = await httpService.post("/v1/materiales", newData);
      }

      if (response.data.success) {
        toast.success(selectedItem ? "Actualizado correctamente" : "Creado correctamente", { id: loadingToast });
        invalidateConfigCache('/v1/materiales');
        fetchData();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(error.response?.data?.message || "Error al guardar el registro");
    }
  };

  const handleDeleteRequest = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    try {
      const loadingToast = toast.loading("Eliminando material...");
      const response = await httpService.delete(`/v1/materiales/${itemToDelete.id}`);
      if (response.data.success) {
        toast.success("Material eliminado correctamente", { id: loadingToast });
        setItemToDelete(null);
        invalidateConfigCache('/v1/materiales');
        fetchData();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar el material");
      setItemToDelete(null);
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
      ? <ArrowUp className="w-3.5 h-3.5 text-violet-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-violet-500" />;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Helper para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading && materialesData.length === 0) {
    return <ConfigPageSkeleton columns={6} rows={6} accentColor="violet" />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">

      {/* ── PAGE HEADER ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-violet-600">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
              Gestión de Materiales
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg text-sm">
              Administración de inventario y materiales del sistema EVA.
            </p>
          </div>
        </div>

        {/* Summary Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-5 w-full md:w-64 transition-all hover:shadow-md">
          <div className="bg-violet-100 p-3 rounded-2xl">
            <Boxes className="h-8 w-8 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Materiales</p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Barra de Controles y Búsqueda */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Buscar material por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-500 text-sm shadow-inner"
            />
          </div>

          {/* Items por página */}
          <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
            <span className="hidden sm:inline">Mostrar</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
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
            onClick={handleOpenAdd}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-violet-100 transition-all font-bold w-full lg:w-auto shrink-0"
          >
            <Plus className="w-5 h-5 font-bold" />
            Agregar Material
          </Button>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-white/50">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 w-36">
                    <button onClick={() => handleSort('codigo')} className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
                      Código {getSortIcon('codigo')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort('nombre')} className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
                      Nombre {getSortIcon('nombre')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 hidden lg:table-cell">
                    Descripción
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right w-36">
                    <button onClick={() => handleSort('precio_unitario')} className="flex items-center gap-1.5 hover:text-violet-600 transition-colors ml-auto">
                      Precio Unit. {getSortIcon('precio_unitario')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center w-24">
                    <button onClick={() => handleSort('cantidad')} className="flex items-center gap-1.5 hover:text-violet-600 transition-colors mx-auto">
                      Stock {getSortIcon('cantidad')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right w-40">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 w-44 bg-slate-100 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-100 rounded ml-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-5 w-12 bg-slate-100 rounded-full mx-auto" /></td>
                      <td className="px-6 py-4 text-right"><div className="flex gap-2 justify-end"><div className="h-8 w-8 bg-slate-100 rounded-lg" /><div className="h-8 w-8 bg-slate-100 rounded-lg" /><div className="h-8 w-8 bg-slate-100 rounded-lg" /></div></td>
                    </tr>
                  ))
                ) : materialesData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Package className="h-16 w-16 text-slate-100" />
                        <span className="text-slate-400 font-medium italic">No se encontraron materiales</span>
                        {searchTerm && (
                          <span className="text-xs text-slate-300">Intenta con otro término de búsqueda</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  materialesData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-mono font-bold rounded-lg border border-violet-100/50">
                          {item.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-bold border border-violet-100/50 group-hover:scale-110 transition-transform">
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 uppercase tracking-wide">{item.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs text-slate-400 line-clamp-1" title={item.descripcion}>
                          {item.descripcion || <span className="italic">Sin descripción</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-sm font-semibold text-slate-700">
                          {formatCurrency(item.precio_unitario || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          item.cantidad > 5
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100"
                        }`}>
                          {item.cantidad}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => handleOpenView(item)}
                            className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(item)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                            title="Eliminar"
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
          </div>

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

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-slate-900">¿Confirmar Eliminación?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 leading-relaxed">
              Estás a punto de eliminar permanentemente el material <span className="font-bold text-slate-800">{itemToDelete?.nombre}</span>.
              Esta acción es irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel onClick={() => setItemToDelete(null)} className="h-12 rounded-xl text-slate-500 border-slate-200">
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

      {/* Modal CRUD */}
      <UIModalMateriales
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        data={selectedItem}
        onSave={handleSave}
      />
    </div>
  );
}

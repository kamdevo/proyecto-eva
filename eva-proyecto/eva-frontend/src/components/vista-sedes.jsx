"use client";

import { useState, useEffect } from "react";
import httpService from "../services/httpService";
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
  MapPin,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Building2,
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
import UIModalSedes from "@/components/modals/ui-modal-sedes";
import { toast } from "sonner";

export default function VistaSedes() {
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
  const [sedeToDelete, setSedeToDelete] = useState(null);

  const [sedesData, setSedesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar datos
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, sortField, sortDirection]);

  const fetchData = async (search = searchTerm) => {
    try {
      setLoading(true);
      const response = await httpService.get("/v1/sedes", {
        params: {
          ...(search ? { search } : {}),
          page: currentPage,
          per_page: itemsPerPage,
          sort_by: sortField,
          sort_order: sortDirection,
        },
      });
      if (response.data.success) {
        if (response.data.data.data) {
          setSedesData(response.data.data.data);
          setTotalItems(response.data.data.total);
        } else {
          setSedesData(response.data.data);
          setTotalItems(response.data.data.length);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar las sedes");
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
        response = await httpService.put(`/v1/sedes/${selectedItem.id}`, newData);
      } else {
        response = await httpService.post("/v1/sedes", newData);
      }
      if (response.data.success) {
        toast.success(selectedItem ? "Sede actualizada correctamente" : "Sede creada correctamente", { id: loadingToast });
        fetchData();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error(error.response?.data?.message || "Error al guardar el registro");
    }
  };

  const handleDeleteRequest = (item) => {
    setSedeToDelete(item);
  };

  const confirmDelete = async () => {
    try {
      const loadingToast = toast.loading("Eliminando sede...");
      const response = await httpService.delete(`/v1/sedes/${sedeToDelete.id}`);
      if (response.data.success) {
        toast.success("Sede eliminada correctamente", { id: loadingToast });
        setSedeToDelete(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(error.response?.data?.message || "Error al eliminar la sede");
      setSedeToDelete(null);
    }
  };

  // Ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-500" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (value.length >= 3 || value.length === 0) {
      fetchData(value);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">

      {/* ── PAGE HEADER (White Editorial Style) ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-emerald-600">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
              Gestión de Sedes
            </h1>
            <p className="text-slate-500 mt-2 max-w-lg text-sm">
              Administración centralizada de ubicaciones y sedes operativas del sistema EVA.
            </p>
          </div>
        </div>

        {/* Summary Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-5 w-full md:w-64 transition-all hover:shadow-md">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sedes</p>
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
              placeholder="Buscar sede por nombre..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm shadow-inner"
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center gap-2.5 px-6 h-12 shadow-lg shadow-emerald-100 transition-all font-bold w-full lg:w-auto shrink-0"
          >
            <Plus className="w-5 h-5 font-bold" />
            Nueva Sede
          </Button>
        </div>

        {/* Tabla de Resultados */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-white/50">
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 w-24">
                    <button onClick={() => handleSort('id')} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                      ID {getSortIcon('id')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                      Nombre de la Sede {getSortIcon('name')}
                    </button>
                  </th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right w-40">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                        <span className="text-slate-400 font-medium">Sincronizando información...</span>
                      </div>
                    </td>
                  </tr>
                ) : sedesData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <MapPin className="h-16 w-16 text-slate-100" />
                        <span className="text-slate-400 font-medium italic">No se encontraron sedes</span>
                        {searchTerm && (
                          <span className="text-xs text-slate-300">Intenta con otro término de búsqueda</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sedesData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded-lg">#{item.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100/50 group-hover:scale-110 transition-transform">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-700 uppercase tracking-wide">{item.name}</span>
                        </div>
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
                            title="Editar sede"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(item)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                            title="Eliminar sede"
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
        open={!!sedeToDelete}
        onOpenChange={() => setSedeToDelete(null)}
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
              Estás a punto de eliminar permanentemente la sede <span className="font-bold text-slate-800">{sedeToDelete?.name}</span>.
              Esta acción es irreversible y podría afectar servicios y áreas vinculadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel onClick={() => setSedeToDelete(null)} className="h-12 rounded-xl text-slate-500 border-slate-200">
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

      <UIModalSedes
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        data={selectedItem}
        onSave={handleSave}
      />
    </div>
  );
}

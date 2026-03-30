"use client";

import { useState, useEffect } from "react";
import httpService from "../services/httpService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash2, Plus, Search, MapPin, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

// Importar componentes comunes
import Pagination from "@/components/common/Pagination";
import UIModalSedes from "@/components/modals/ui-modal-sedes";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [selectedItem, setSelectedItem] = useState(null);

  const [sedesData, setSedesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Cargar datos
  useEffect(() => {
    fetchData();
  }, [searchTerm, currentPage, itemsPerPage, sortField, sortDirection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await httpService.get("/v1/sedes", {
        params: {
          search: searchTerm,
          page: currentPage,
          per_page: itemsPerPage,
          sort_by: sortField,
          sort_order: sortDirection
        }
      });
      if (response.data.success) {
        // La API puede devolver los datos paginados o un array simple
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

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta sede?")) {
      try {
        const loadingToast = toast.loading("Eliminando...");
        const response = await httpService.delete(`/v1/sedes/${id}`);
        if (response.data.success) {
          toast.success("Sede eliminada correctamente", { id: loadingToast });
          fetchData();
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        toast.error(error.response?.data?.message || "Error al eliminar la sede");
      }
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
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-400" />
      : <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && sedesData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Skeleton Header */}
        <div className="h-28 bg-gradient-to-r from-[#1d293d] to-[#2d4a6e]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <Card className="shadow-xl border-0">
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-36" />
              </div>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-[#1d293d] to-[#2d4a6e] text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Logo + Título */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/15 backdrop-blur rounded-xl border border-white/20 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                  Gestión de Sedes
                </h1>
                <p className="text-sm text-blue-200 mt-0.5">
                  Administración de ubicaciones del sistema
                </p>
              </div>
            </div>

            {/* Stats pill */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 text-sm">
              <MapPin className="w-4 h-4 text-blue-300" />
              <span className="text-blue-100">
                <span className="font-bold text-white">{totalItems}</span> sedes registradas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 bg-white border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar sede por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-100 rounded-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Controles derecha */}
              <div className="flex items-center gap-3">
                {/* Items por página */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="hidden sm:inline">Mostrar</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-9 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="hidden sm:inline">entradas</span>
                </div>

                {/* Botón agregar */}
                <Button
                  onClick={handleOpenAdd}
                  className="bg-[#1d293d] hover:bg-[#2d4a6e] text-white flex items-center gap-2 h-9 px-4 rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Sede</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                  <TableHead className="w-24 pl-6 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                    <button
                      onClick={() => handleSort('id')}
                      className="flex items-center gap-1.5 hover:text-blue-600 transition-colors py-1"
                    >
                      ID
                      {getSortIcon('id')}
                    </button>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-600 uppercase text-xs tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 hover:text-blue-600 transition-colors py-1"
                    >
                      Nombre de la Sede
                      {getSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-slate-600 uppercase text-xs tracking-wider w-36 pr-6">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sedesData.length > 0 ? (
                  sedesData.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                    >
                      <TableCell className="pl-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                          #{item.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#1d293d]/10 to-[#2d4a6e]/20 border border-slate-200 flex-shrink-0">
                            <MapPin className="w-4 h-4 text-[#2d4a6e]" />
                          </div>
                          <span className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                            {item.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            title="Ver Detalles"
                            onClick={() => handleOpenView(item)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="w-8 h-8 p-0 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors"
                            title="Editar"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="w-8 h-8 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
                            title="Eliminar"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <MapPin className="w-10 h-10 text-slate-200" />
                        <p className="font-medium text-sm">No se encontraron sedes</p>
                        {searchTerm && (
                          <p className="text-xs">Intenta con otro término de búsqueda</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer paginación */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              showInfo={true}
            />
          </div>
        </Card>
      </div>

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

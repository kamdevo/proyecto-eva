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
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && sedesData.length === 0) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
        <Card className="mt-8">
          <div className="p-6">
            <Skeleton className="h-8 w-64" />
          </div>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-96" />
              <Skeleton className="h-10 w-24" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header Container */}
      <div className="max-w-7xl mx-auto mb-8 text-center bg-[#3c4c63] rounded-lg p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-3">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          Gestión de Sedes
        </h1>
        <p className="text-sm text-white mt-1">Administración de ubicaciones físicas y sedes</p>
      </div>

      <div className="max-w-7xl mx-auto uppercase">
        <Card className="shadow-sm border-0">
          <CardContent className="p-0">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 shadow-sm shrink-0 w-full sm:w-auto"
                    onClick={handleOpenAdd}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Sede</span>
                  </Button>

                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Buscar sede..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 h-10 w-full bg-white border-gray-200"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Mostrar</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-9">
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

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[100px] font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors py-2"
                      >
                        ID
                        {getSortIcon('id')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors py-2"
                      >
                        Nombre de la Sede
                        {getSortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-900 w-32">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sedesData.length > 0 ? (
                    sedesData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                        <TableCell className="font-medium text-gray-400 text-sm">#{item.id}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900 text-sm tracking-wide">{item.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 text-blue-600 hover:bg-blue-50 bg-blue-500/10"
                              title="Ver Detalles"
                              onClick={() => handleOpenView(item)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenEdit(item)}
                              className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 rounded-md"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5 text-white" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 p-0 bg-red-400 hover:bg-red-600 rounded-md"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-gray-400 italic">
                        No se encontraron sedes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="p-4 border-t border-gray-50 bg-gray-50/30">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                showInfo={true}
              />
            </div>
          </CardContent>
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

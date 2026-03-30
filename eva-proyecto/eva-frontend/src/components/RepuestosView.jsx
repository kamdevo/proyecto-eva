import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/common/Pagination";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Package,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const RepuestosView = () => {
  // Estados principales
  const [repuestos, setRepuestos] = useState([]);
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoFilter, setGrupoFilter] = useState("all");

  // Ordenamiento
  const [sortField, setSortField] = useState('code');
  const [sortDirection, setSortDirection] = useState('asc');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Formulario
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    code: "",
    cantidad: "",
    precio: "",
    grupo: "MT1",
    status: 1
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Cargar datos al montar o cambiar filtros
  useEffect(() => {
    fetchRepuestos();
  }, [currentPage, searchTerm, grupoFilter, sortField, sortDirection]);

  const fetchRepuestos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        grupo: grupoFilter,
        sort_by: sortField,
        sort_order: sortDirection
      });

      const response = await fetch(`/api/v1/repuestos-inventory?${queryParams}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }
      });
      const result = await response.json();

      if (result.success) {
        setRepuestos(result.data || []);
        if (result.pagination) {
          setTotalPages(result.pagination.last_page || 1);
          setTotalItems(result.pagination.total || 0);
        }
      } else {
        toast.error("Error al cargar inventario");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.warning("El nombre y el código son obligatorios");
      return;
    }

    const dataToSend = {
      ...formData,
      cantidad: formData.cantidad === "" ? null : parseInt(formData.cantidad),
      precio: formData.precio === "" ? null : parseFloat(formData.precio),
      status: parseInt(formData.status)
    };

    setSaving(true);
    try {
      const url = isEditMode
        ? `/api/v1/repuestos-inventory/${formData.id}`
        : `/api/v1/repuestos-inventory`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEditMode ? "Repuesto actualizado" : "Repuesto agregado");
        resetForm();
        fetchRepuestos();
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving repuesto:", error);
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Está seguro de eliminar este repuesto?")) return;

    try {
      const response = await fetch(`/api/v1/repuestos-inventory/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Repuesto eliminado");
        fetchRepuestos();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name || "",
      code: item.code || "",
      cantidad: item.cantidad || 0,
      precio: item.precio || 0,
      grupo: item.grupo || "MT1",
      status: item.status || 1
    });
    setIsEditMode(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      code: "",
      cantidad: "",
      precio: "",
      grupo: "MT1",
      status: 1
    });
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">

      {/* ── PAGE HEADER (Editorial Style) ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-1">
            Inventario de Repuestos
          </h1>
          <p className="text-slate-500 mt-2 max-w-lg text-sm">
            Control esencial de existencias y precios. Gestione el catálogo de repuestos, stock disponible y clasificación por grupos.
          </p>
        </div>

        {/* Summary Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-5 w-full md:w-64">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</p>
            <p className="text-3xl font-bold text-slate-900">{totalItems}</p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── TABLE SECTION ── */}
        <section className="lg:col-span-8 space-y-6">

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Buscar por nombre, código o grupo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 h-12 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <Select value={grupoFilter} onValueChange={(val) => {
              setGrupoFilter(val);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="bg-slate-50 border-none rounded-2xl h-12 px-6 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 w-full sm:w-48">
                <SelectValue placeholder="Todos los grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                <SelectItem value="MT1">MT1 - Mantenimiento</SelectItem>
                <SelectItem value="DM1">DM1 - Diagnóstico</SelectItem>
                <SelectItem value="ET1">ET1 - Electrónica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <button onClick={() => handleSort('code')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        Código {getSortIcon('code')}
                      </button>
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        Nombre {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <button onClick={() => handleSort('cantidad')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        Stock {getSortIcon('cantidad')}
                      </button>
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <button onClick={() => handleSort('precio')} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        Precio {getSortIcon('precio')}
                      </button>
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                      <button onClick={() => handleSort('grupo')} className="flex items-center justify-center gap-1.5 hover:text-blue-600 transition-colors w-full">
                        Grupo {getSortIcon('grupo')}
                      </button>
                    </th>
                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="h-48 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" />
                        <p className="text-slate-400 mt-3 text-sm">Cargando datos...</p>
                      </td>
                    </tr>
                  ) : repuestos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-48 text-center">
                        <Package className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium text-sm">No se encontraron repuestos</p>
                        {searchTerm && (
                          <p className="text-slate-300 text-xs mt-1">Intenta con otro término de búsqueda</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    repuestos.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.code}</td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-900">{item.name}</td>
                        <td className="px-6 py-5">
                          {item.cantidad <= 5 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-bold">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              {item.cantidad}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              {item.cantidad}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-emerald-600">
                          ${parseFloat(item.precio || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg">
                            {item.grupo}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100">
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
        </section>

        {/* ── CREATION FORM SIDEBAR ── */}
        <aside className="lg:col-span-4">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
            {/* Form Header */}
            <div className="bg-slate-900 px-6 py-5 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                {isEditMode ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {isEditMode ? "Editar Repuesto" : "Nuevo Repuesto"}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Field: Nombre */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Nombre del repuesto
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Filtro de Aire"
                  className="w-full px-4 py-3 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm placeholder-slate-300"
                />
              </div>

              {/* Field: Código */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Código Único
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="REP-001"
                  className="w-full px-4 py-3 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm placeholder-slate-300 font-mono"
                />
              </div>

              {/* Fields: Stock & Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Stock Inicial
                  </label>
                  <Input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Precio Unitario
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Field: Clasificación */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Grupo de Clasificación
                </label>
                <Input
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })}
                  placeholder="Ej: MT1, DM1, etc."
                  className="w-full px-4 py-3 h-12 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isEditMode ? "Actualizar Repuesto" : "Guardar Repuesto"}
                </button>
                <button
                  onClick={resetForm}
                  className="w-full bg-transparent text-slate-400 font-semibold py-2 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar Formulario
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tips Card */}
          <div className="mt-8 bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-600 rounded-xl mt-1 flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Análisis Rápido</h4>
                <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                  Recuerda que los repuestos del grupo "MT1" representan el 84% de las salidas este mes. Considera revisar los niveles de reabastecimiento.
                </p>
              </div>
            </div>
          </div>

          {/* Low stock alert */}
          {formData.cantidad <= 2 && formData.cantidad !== "" && (
            <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">
                <strong>Atención:</strong> Stock bajo detectado. Considere realizar una compra pronto.
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default RepuestosView;

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2
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

  // Cargar datos al montar o cambiar filtros
  useEffect(() => {
    fetchRepuestos();
  }, [currentPage, searchTerm, grupoFilter]);

  const fetchRepuestos = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        grupo: grupoFilter
      });

      const response = await fetch(`/api/v1/repuestos-inventory?${queryParams}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }
      });
      const result = await response.json();

      if (result.success) {
        // Estructura de ResponseFormatter::paginated
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

    // Limpiar datos para el backend
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado Premium */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1d293d] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Inventario de Repuestos</h1>
              <p className="text-slate-500 text-sm">Control esencial de existencias y precios</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block uppercase font-semibold">Total Items</span>
              <span className="text-xl font-bold text-[#1d293d]">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Buscador General */}
        <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, código o grupo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-11 bg-white border-slate-200 focus:ring-2 focus:ring-[#1d293d]/20 transition-all"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={grupoFilter} onValueChange={(val) => {
                  setGrupoFilter(val);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="h-11 bg-white border-slate-200">
                    <SelectValue placeholder="Filtrar por Grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    <SelectItem value="MT1">MT1 - Mantenimiento</SelectItem>
                    <SelectItem value="DM1">DM1 - Diagnóstico</SelectItem>
                    <SelectItem value="ET1">ET1 - Electrónica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Tabla de Inventario */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Repuestos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="font-bold text-slate-700">Código</TableHead>
                      <TableHead className="font-bold text-slate-700">Nombre</TableHead>
                      <TableHead className="font-bold text-slate-700 text-center">Stock</TableHead>
                      <TableHead className="font-bold text-slate-700">Precio</TableHead>
                      <TableHead className="font-bold text-slate-700">Grupo</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                          <p className="text-slate-500 mt-2">Cargando datos...</p>
                        </TableCell>
                      </TableRow>
                    ) : repuestos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <Package className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                          <p className="text-slate-500">No se encontraron repuestos</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      repuestos.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                          <TableCell className="font-mono text-xs font-bold text-[#1d293d]">{item.code}</TableCell>
                          <TableCell className="font-medium text-slate-700">{item.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={item.cantidad <= 5 ? "destructive" : "secondary"} className="font-bold">
                              {item.cantidad}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-green-700">
                            ${parseFloat(item.precio || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold">
                              {item.grupo}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
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

          {/* Formulario de Gestión */}
          <div className="lg:col-span-4">
            <Card className="border-none shadow-lg bg-white rounded-2xl sticky top-24">
              <CardHeader className="bg-[#1d293d] text-white rounded-t-2xl">
                <CardTitle className="text-lg flex items-center gap-2">
                  {isEditMode ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isEditMode ? "Editar Repuesto" : "Nuevo Repuesto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600">Nombre del repuesto</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Filtro de Aire"
                      className="border-slate-200 focus:border-[#1d293d]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-600">Código Único</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="REP-001"
                      className="border-slate-200 focus:border-[#1d293d] font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-600">Stock Inicial</Label>
                      <Input
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                        placeholder="0"
                        className="border-slate-200 focus:border-[#1d293d]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600">Precio Unitario</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          placeholder="0.00"
                          className="pl-7 border-slate-200 focus:border-[#1d293d]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-600">Grupo de Clasificación</Label>
                    <Input
                      value={formData.grupo}
                      onChange={(e) => setFormData({ ...formData, grupo: e.target.value.toUpperCase() })}
                      placeholder="Ej: MT1, DM1, etc."
                      className="border-slate-200 focus:border-[#1d293d]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="w-full bg-[#1d293d] hover:bg-[#2a3b52] text-white shadow-md active:scale-95 transition-transform"
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isEditMode ? "Actualizar Repuesto" : "Guardar Repuesto"}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={resetForm}
                    className="w-full text-slate-500 hover:bg-slate-100"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Limpiar Formulario
                  </Button>
                </div>

                {formData.cantidad <= 2 && formData.cantidad !== "" && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex gap-3 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 leading-tight">
                      <strong>Atención:</strong> Stock bajo detectado. Considere realizar una compra pronto.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RepuestosView;

"use client";

import { useState } from "react";
import { Search, Filter, Download, FileText, Calendar, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrders } from "../../hooks/usePurchaseOrders";

export function QueryPurchaseOrderModal({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("ordenes");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    proveedor: "TODOS",
    estado: "TODOS",
    tipo: "TODOS",
    fechaInicio: "",
    fechaFin: ""
  });

  const {
    purchaseOrders,
    loading,
    search,
    refresh
  } = usePurchaseOrders();

  const handleSearch = () => {
    const searchFilters = {
      search: searchTerm,
      ...filters
    };
    search(searchFilters);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      proveedor: "TODOS",
      estado: "TODOS", 
      tipo: "TODOS",
      fechaInicio: "",
      fechaFin: ""
    });
    refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-none w-[80vw] max-h-none h-[80vh] p-0 overflow-auto"
        style={{ width: '80vw', maxWidth: 'none', height: '80vh', maxHeight: 'none' }}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Search className="w-5 h-5 text-teal-600" />
              Consulta Avanzada de Órdenes de Compra
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
          {/* Pestañas */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <Button
              variant={activeTab === "ordenes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ordenes")}
              className={`flex-1 ${
                activeTab === "ordenes"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Órdenes de Compra
            </Button>
          </div>

          {/* Contenido de Órdenes de Compra */}
          {activeTab === "ordenes" && (
            <div className="space-y-6">
              {/* Filtros de Búsqueda */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="w-4 h-4 text-blue-600" />
                    Filtros de Búsqueda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Búsqueda General */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por número, proveedor, descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border-blue-300 focus:border-blue-500"
                    />
                    <Button 
                      onClick={handleSearch} 
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  {/* Filtros Específicos */}
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Proveedor:
                      </label>
                      <Select
                        value={filters.proveedor}
                        onValueChange={(value) => handleFilterChange("proveedor", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos los proveedores</SelectItem>
                          <SelectItem value="PROVEEDOR_A">Proveedor A</SelectItem>
                          <SelectItem value="PROVEEDOR_B">Proveedor B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Estado:
                      </label>
                      <Select
                        value={filters.estado}
                        onValueChange={(value) => handleFilterChange("estado", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos los estados</SelectItem>
                          <SelectItem value="ACTIVA">Activa</SelectItem>
                          <SelectItem value="APROBADA">Aprobada</SelectItem>
                          <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Tipo:
                      </label>
                      <Select
                        value={filters.tipo}
                        onValueChange={(value) => handleFilterChange("tipo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODOS">Todos los tipos</SelectItem>
                          <SelectItem value="ORDEN_COMPRA">Orden de Compra</SelectItem>
                          <SelectItem value="CONTRATO">Contrato</SelectItem>
                          <SelectItem value="COMODATO">Comodato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Filtros de Fecha */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Fecha Inicio:
                      </label>
                      <Input
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => handleFilterChange("fechaInicio", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">
                        Fecha Fin:
                      </label>
                      <Input
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => handleFilterChange("fechaFin", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={resetFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Limpiar Filtros
                    </Button>
                    <Button onClick={refresh} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Resultados */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Resultados de la Búsqueda
                    {!loading && purchaseOrders && (
                      <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-800">
                        {purchaseOrders.length} registros
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto p-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="text-slate-600 mt-2">Cargando órdenes de compra...</p>
                      </div>
                    ) : purchaseOrders && purchaseOrders.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {purchaseOrders.map((order) => (
                          <div
                            key={order.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-gray-200 hover:border-blue-300"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-200">
                                {order.orden || `OC-${order.id}`}
                              </Badge>
                              <Badge
                                className={
                                  order.status_text === "Aprobada"
                                    ? "bg-green-100 text-green-800"
                                    : order.status_text === "Activa"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {order.status_text}
                              </Badge>
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <Calendar className="w-4 h-4" />
                                {order.fecha_formatted || "Sin fecha"}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-slate-600">Proveedor:</p>
                                  <p className="font-medium">
                                    {order.proveedor_nombre || "Sin proveedor"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-600">Tipo:</p>
                                  <p className="font-medium">
                                    {order.tipo_compra_nombre || "Sin tipo"}
                                  </p>
                                </div>
                              </div>

                              {order.equipos_count && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-slate-600">
                                    Equipos asociados: 
                                    <span className="font-semibold ml-1 text-blue-600">
                                      {order.equipos_count}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600">No se encontraron órdenes de compra</p>
                      <p className="text-sm text-slate-500">
                        Ajusta los filtros de búsqueda para obtener resultados
                      </p>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

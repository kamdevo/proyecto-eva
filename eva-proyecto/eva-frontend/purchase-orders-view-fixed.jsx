"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Filter,
  FileText,
  Calendar,
  Building,
  Package,
  Menu,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AddPurchaseOrderModal } from "@/components/modals/add-purchase-order-modal";
import { QueryPurchaseOrderModal } from "@/components/modals/query-purchase-order-modal";
import { DownloadPdfModal } from "@/components/modals/download-pdf-modal";
import { useOrdenesCompra } from "@/hooks/useOrdenesCompra";

// Componente para filtros móviles
function MobilePurchaseFilters({
  searchTerm,
  setSearchTerm,
  handleSearch,
  selectedProveedor,
  setSelectedProveedor,
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Buscar</label>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs"
          />
          <Button
            onClick={handleSearch}
            size="sm"
            className="h-8 bg-teal-600 hover:bg-teal-700"
          >
            <Search className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Proveedor</label>
        <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="VARIAN">Varian Medical</SelectItem>
            <SelectItem value="MEDTRONIC">Medtronic</SelectItem>
            <SelectItem value="SIEMENS">Siemens Healthcare</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

// Componente para filtros desktop
function DesktopPurchaseFilters({
  searchTerm,
  setSearchTerm,
  handleSearch,
  selectedProveedor,
  setSelectedProveedor,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6">
      <div className="lg:col-span-2">
        <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1 lg:mb-2">
          Buscar órdenes
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Código, proveedor o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 lg:h-10 text-xs lg:text-sm"
          />
          <Button
            onClick={handleSearch}
            size="sm"
            className="h-8 lg:h-10 bg-teal-600 hover:bg-teal-700"
          >
            <Search className="w-3 h-3 lg:w-4 lg:h-4" />
          </Button>
        </div>
      </div>
      <div>
        <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1 lg:mb-2">
          Proveedor
        </label>
        <Select value={selectedProveedor} onValueChange={setSelectedProveedor}>
          <SelectTrigger className="h-8 lg:h-10 text-xs lg:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="VARIAN">Varian Medical</SelectItem>
            <SelectItem value="MEDTRONIC">Medtronic</SelectItem>
            <SelectItem value="SIEMENS">Siemens Healthcare</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs lg:text-sm font-medium text-slate-700 mb-1 lg:mb-2">
          Estado
        </label>
        <Select defaultValue="TODOS">
          <SelectTrigger className="h-8 lg:h-10 text-xs lg:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="ACTIVA">Activa</SelectItem>
            <SelectItem value="INACTIVA">Inactiva</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Componente para tarjetas móviles
function MobilePurchaseCard({ order }) {
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Activa":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactiva":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              {order.codigo}
            </h3>
            <p className="text-xs text-slate-600">{order.tipoCompra}</p>
          </div>
          <Badge
            variant="outline"
            className={`text-xs ${getStatusColor(order.estado)}`}
          >
            {order.estado}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-3 h-3" />
            <span>{order.fecha}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Building className="w-3 h-3" />
            <span className="truncate">{order.proveedor}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <FileText className="w-3 h-3" />
            <span className="truncate">{order.archivo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para filas desktop
function DesktopPurchaseRow({ order }) {
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Activa":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactiva":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="p-2 lg:p-4 border-r border-slate-200">
        <div>
          <span className="font-medium text-slate-800 text-xs lg:text-sm">
            {order.codigo}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Badge
              variant="outline"
              className={`text-xs ${getStatusColor(order.estado)}`}
            >
              {order.estado}
            </Badge>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200">
        <div className="flex items-center gap-2">
          <Package className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" />
          <span className="text-xs lg:text-sm text-slate-700">
            {order.tipoCompra}
          </span>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" />
          <span className="text-xs lg:text-sm text-slate-700">
            {order.fecha}
          </span>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" />
          <span className="text-xs lg:text-sm text-slate-700 truncate max-w-[120px] lg:max-w-[200px]">
            {order.archivo}
          </span>
        </div>
      </td>
      <td className="p-2 lg:p-4">
        <div className="flex items-center gap-2">
          <Building className="w-3 h-3 lg:w-4 lg:h-4 text-slate-500" />
          <span className="text-xs lg:text-sm text-slate-700 truncate max-w-[120px] lg:max-w-[200px]">
            {order.proveedor}
          </span>
        </div>
      </td>
    </tr>
  );
}

// Componente principal
export function PurchaseOrdersView() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [downloadPdfModalOpen, setDownloadPdfModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Hook para órdenes de compra
  const {
    ordenes,
    loading,
    error,
    pagination,
    fetchOrdenes,
    changePage,
    changePageSize,
    searchOrdenes,
  } = useOrdenesCompra();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProveedor, setSelectedProveedor] = useState("TODOS");

  // Función para manejar búsqueda
  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchOrdenes(searchTerm);
    } else {
      fetchOrdenes();
    }
  };

  // Formatear datos para mostrar
  const formatOrderData = (orden) => {
    return {
      id: orden.id?.toString() || "",
      codigo: orden.orden || "Sin código",
      tipoCompra: orden.tipo_compra_nombre || "No especificado",
      fecha: orden.fecha || new Date().toISOString().split("T")[0],
      archivo: orden.file || "sin_archivo.pdf",
      proveedor: "Proveedor " + (orden.proveedor_id || "N/A"),
      estado: orden.status === 1 ? "Activa" : "Inactiva",
      monto: "$0.00",
    };
  };

  const displayData = ordenes?.map(formatOrderData) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
          Órdenes de Compra
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
          Gestión y control de órdenes de compra hospitalarias
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
        <Card className="bg-slate-800 border-slate-700 shadow-lg flex-1">
          <CardContent className="p-1">
            <div className="flex flex-col sm:flex-row gap-0.5">
              <Button
                onClick={() => setAddModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center"
              >
                <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Agregar</span>
              </Button>
              <Button
                onClick={() => setQueryModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center"
              >
                <Search className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Consulta</span>
              </Button>
              <Button
                onClick={() => setDownloadPdfModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center"
              >
                <Download className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Descargar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Filters Section */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                Panel de Control
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-white/80 text-slate-700 border-slate-300 text-xs"
                >
                  {loading ? "Cargando..." : "Sistema Activo"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden h-8 w-8 p-0"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Collapsible Filters */}
            <Collapsible
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              className="sm:hidden"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-3 justify-between"
                >
                  <span>Filtros</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <MobilePurchaseFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleSearch={handleSearch}
                  selectedProveedor={selectedProveedor}
                  setSelectedProveedor={setSelectedProveedor}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <DesktopPurchaseFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                selectedProveedor={selectedProveedor}
                setSelectedProveedor={setSelectedProveedor}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>
              Mostrando órdenes: {pagination.current_page} a{" "}
              {Math.min(pagination.per_page, pagination.total)} de{" "}
              {pagination.total} registros
            </span>
            <Badge
              variant="secondary"
              className="bg-teal-100 text-teal-800 text-xs w-fit"
            >
              {loading ? "Actualizando..." : "Actualizada"}
            </Badge>
          </div>
        </div>

        {/* Pagination Top */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select
              value={pagination.per_page.toString()}
              onValueChange={(value) => changePageSize(parseInt(value))}
            >
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">
              órdenes por página
            </span>
            <span className="text-slate-700 sm:hidden">por página</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1 || loading}
            >
              Ant
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              {pagination.current_page}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(pagination.current_page + 1)}
              disabled={
                pagination.current_page >= pagination.last_page || loading
              }
            >
              Sig
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-slate-500">Cargando órdenes de compra...</div>
          </div>
        ) : displayData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-500">
              No se encontraron órdenes de compra
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block sm:hidden">
              <div className="space-y-3 p-3">
                {displayData.map((order) => (
                  <MobilePurchaseCard key={order.id} order={order} />
                ))}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px] lg:min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                      <th className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                        Código/Número
                      </th>
                      <th className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                        Tipo de compra
                      </th>
                      <th className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                        Fecha
                      </th>
                      <th className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                        Archivo
                      </th>
                      <th className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800">
                        Proveedor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.map((order) => (
                      <DesktopPurchaseRow key={order.id} order={order} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Results Info Bottom */}
        <div className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 border-t bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Total de órdenes: {pagination.total} órdenes</span>
            <span className="text-xs text-slate-500">
              Actualizado: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Pagination Bottom */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select
              value={pagination.per_page.toString()}
              onValueChange={(value) => changePageSize(parseInt(value))}
            >
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">
              órdenes por página
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              {pagination.current_page}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(pagination.current_page + 1)}
              disabled={
                pagination.current_page >= pagination.last_page || loading
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <AddPurchaseOrderModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
      <QueryPurchaseOrderModal
        open={queryModalOpen}
        onOpenChange={setQueryModalOpen}
      />
      <DownloadPdfModal
        open={downloadPdfModalOpen}
        onOpenChange={setDownloadPdfModalOpen}
      />
    </div>
  );
}

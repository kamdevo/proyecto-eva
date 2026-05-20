"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Filter,
  FileText,
  Calendar,
  Package,
  Menu,
  ChevronDown,
  Loader2,
  AlertCircle,
  RefreshCw,
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
import { SecopConsultationModal } from "@/components/modals/secop-consultation-modal";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useOrdenesCompra } from "../hooks/useOrdenesCompra";
import { useTiposCompra, useProveedores } from "../hooks/useTiposCompra";
import { PurchaseOrdersTable } from "./purchase-orders/PurchaseOrdersTable";
import SearchableSelect from "@/components/ui/searchable-select";

export function PurchaseOrdersView() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [secopModalOpen, setSecopModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProveedor, setSelectedProveedor] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");

  // Hooks para datos reales
  const { tipos, loading: tiposLoading } = useTiposCompra();
  const { proveedores, loading: proveedoresLoading } = useProveedores();

  // Use the custom hook for purchase orders
  const {
    purchaseOrders,
    loading,
    pagination,
    search,
    updateFilters,
    changePage,
    changePageSize,
    sort,
    sortBy,
    sortOrder,
    refresh,
    clearFilters,
    isEmpty,
    hasError,
    totalPages,
    currentPage,
    totalItems,
    showingFrom,
    showingTo,
  } = usePurchaseOrders();

  // Hook for Excel export functionality
  const { exportToExcel, loading: exportLoading } = useOrdenesCompra();

  // Handle search
  const handleSearch = () => {
    search(searchTerm);
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    changePageSize(parseInt(size));
  };

  // Handle Excel export
  const handleExportToExcel = async () => {
    try {
      await exportToExcel();
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedProveedor("");
    setSelectedTipo("");
    clearFilters();
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    console.log('Aplicando filtros:', {
      search: searchTerm,
      proveedor_id: selectedProveedor,
      tipo_compra_id: selectedTipo
    });
    
    // Aplicar todos los filtros al backend
    updateFilters({
      search: searchTerm,
      proveedor_id: selectedProveedor || '',
      tipo_compra_id: selectedTipo || '',
      page: 1 // Reset a página 1 al aplicar filtros
    });
  };

  return (
    <div className="min-h-screen bg-[#F1F4F6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Órdenes de Compra
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y control de órdenes de compra hospitalarias
          </p>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
            <span className="sm:hidden">+</span>
          </button>
          <button
            onClick={() => setSecopModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">SECOP</span>
          </button>
          <button
            onClick={handleExportToExcel}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {exportLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Filters Section */}
        <div className="border-b border-slate-100">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Filtros de búsqueda
              </label>
              <div className="flex items-center gap-2">
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
                  handleApplyFilters={handleApplyFilters}
                  handleClearFilters={handleClearFilters}
                  loading={loading}
                  selectedProveedor={selectedProveedor}
                  setSelectedProveedor={setSelectedProveedor}
                  selectedTipo={selectedTipo}
                  setSelectedTipo={setSelectedTipo}
                  proveedores={proveedores}
                  proveedoresLoading={proveedoresLoading}
                  tipos={tipos}
                  tiposLoading={tiposLoading}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <DesktopPurchaseFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                handleApplyFilters={handleApplyFilters}
                handleClearFilters={handleClearFilters}
                loading={loading}
                selectedProveedor={selectedProveedor}
                setSelectedProveedor={setSelectedProveedor}
                selectedTipo={selectedTipo}
                setSelectedTipo={setSelectedTipo}
                proveedores={proveedores}
                proveedoresLoading={proveedoresLoading}
                tipos={tipos}
                tiposLoading={tiposLoading}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="px-4 sm:px-5 py-3 text-sm text-slate-500 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {loading ? (
            <span>Cargando órdenes...</span>
          ) : hasError ? (
            <span className="text-red-600">Error al cargar órdenes</span>
          ) : (
            <span>
              Mostrando <span className="font-semibold text-slate-700">{showingFrom}</span>–<span className="font-semibold text-slate-700">{showingTo}</span> de <span className="font-semibold text-slate-700">{totalItems}</span> registros
              {totalPages > 1 && (
                <span className="text-slate-400 ml-2">(Página {currentPage} de {totalPages})</span>
              )}
            </span>
          )}
          {hasError && (
            <Button size="sm" variant="outline" onClick={refresh} className="h-7 px-2 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Reintentar
            </Button>
          )}
        </div>

        {/* Pagination Top */}
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select
              value={pagination.per_page.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
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
            {/* Primera página */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(1)}
              disabled={currentPage <= 1 || loading}
            >
              ««
            </Button>

            {/* Página anterior */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              ‹
            </Button>

            {/* Páginas numeradas */}
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisible / 2)
              );
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              // Ajustar si estamos cerca del final
              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    className={`h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm ${
                      i === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""
                    }`}
                    onClick={() => changePage(i)}
                    disabled={loading}
                  >
                    {i}
                  </Button>
                );
              }
              return pages;
            })()}

            {/* Página siguiente */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              ›
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(totalPages)}
              disabled={currentPage >= totalPages || loading}
            >
              »»
            </Button>
          </div>
        </div>

        {/* Responsive Table/Cards */}
        <div className="block sm:hidden">
          {/* Mobile Card View */}
          <div className="space-y-3 p-3">
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-slate-50 rounded w-3/4 animate-pulse"></div>
                    <div className="flex gap-2 mt-2">
                      <div className="h-6 bg-slate-50 rounded w-20 animate-pulse"></div>
                      <div className="h-6 bg-slate-50 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-sm text-red-600 mb-2">
                  Error al cargar las órdenes
                </p>
                <Button size="sm" variant="outline" onClick={refresh}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reintentar
                </Button>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">
                  No se encontraron órdenes de compra
                </p>
              </div>
            ) : (
              purchaseOrders.map((order) => (
                <MobilePurchaseCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>

        <div className="hidden sm:block">
          {/* Desktop Table View */}
          {hasError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-sm text-red-600 mb-3">Error al cargar las órdenes</p>
              <Button size="sm" variant="outline" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Reintentar
              </Button>
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-sm text-slate-600">No se encontraron órdenes de compra</p>
            </div>
          ) : (
            <PurchaseOrdersTable
              orders={purchaseOrders}
              loading={loading}
              onSort={sort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </div>

        {/* Results Info Bottom */}
        <div className="px-4 sm:px-5 py-3 text-sm text-slate-500 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Total: <span className="font-semibold text-slate-700">{totalItems}</span> órdenes</span>
          <span className="text-xs text-slate-400">Actualizado: {new Date().toLocaleString()}</span>
        </div>

        {/* Pagination Bottom */}
        <div className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select
              value={pagination.per_page.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">
              órdenes por página
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Primera página */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(1)}
              disabled={currentPage <= 1 || loading}
            >
              ««
            </Button>

            {/* Página anterior */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              ‹
            </Button>

            {/* Páginas numeradas */}
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisible / 2)
              );
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);

              // Ajustar si estamos cerca del final
              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="sm"
                    className={`h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm ${
                      i === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""
                    }`}
                    onClick={() => changePage(i)}
                    disabled={loading}
                  >
                    {i}
                  </Button>
                );
              }
              return pages;
            })()}

            {/* Página siguiente */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              ›
            </Button>

            {/* Última página */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => changePage(totalPages)}
              disabled={currentPage >= totalPages || loading}
            >
              »»
            </Button>
          </div>
        </div>
      </div>
      {/* Modals */}
      <AddPurchaseOrderModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
      <SecopConsultationModal
        open={secopModalOpen}
        onOpenChange={setSecopModalOpen}
      />
      </div>
    </div>
  );
}

// Mobile Filters Component
function MobilePurchaseFilters({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleApplyFilters,
  handleClearFilters,
  loading,
  selectedProveedor,
  setSelectedProveedor,
  selectedTipo,
  setSelectedTipo,
  proveedores,
  proveedoresLoading,
  tipos,
  tiposLoading,
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Proveedor:</label>
        <SearchableSelect
          value={selectedProveedor}
          onValueChange={setSelectedProveedor}
          options={proveedores}
          placeholder={proveedoresLoading ? "Cargando..." : "Todos los proveedores"}
          disabled={proveedoresLoading}
          loading={proveedoresLoading}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Tipo:</label>
        <SearchableSelect
          value={selectedTipo}
          onValueChange={setSelectedTipo}
          options={tipos}
          placeholder={tiposLoading ? "Cargando..." : "Todos los tipos"}
          disabled={tiposLoading}
          loading={tiposLoading}
          className="h-8 text-xs"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Buscar por código:</label>
        <Input
          placeholder="Código de orden..."
          className="h-8 text-xs bg-white/80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
          disabled={loading}
        />
      </div>
      
      {/* Botones de acción */}
      <div className="flex gap-2 pt-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-9 text-xs"
          onClick={handleClearFilters}
          disabled={loading}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Limpiar
        </Button>
        <Button 
          size="sm" 
    className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Filter className="w-3 h-3 mr-1" />
          )}
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}

// Desktop Filters Component
function DesktopPurchaseFilters({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleApplyFilters,
  handleClearFilters,
  loading,
  selectedProveedor,
  setSelectedProveedor,
  selectedTipo,
  setSelectedTipo,
  proveedores,
  proveedoresLoading,
  tipos,
  tiposLoading,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
        <div className="lg:col-span-3 space-y-2">
          <label className="text-sm font-medium text-slate-700">Proveedor:</label>
          <SearchableSelect
            value={selectedProveedor}
            onValueChange={setSelectedProveedor}
            options={proveedores}
            placeholder={proveedoresLoading ? "Cargando..." : "Todos los proveedores"}
            disabled={proveedoresLoading}
            loading={proveedoresLoading}
            className="h-9 text-sm"
          />
        </div>

        <div className="lg:col-span-3 space-y-2">
          <label className="text-sm font-medium text-slate-700">Tipo:</label>
          <SearchableSelect
            value={selectedTipo}
            onValueChange={setSelectedTipo}
            options={tipos}
            placeholder={tiposLoading ? "Cargando..." : "Todos los tipos"}
            disabled={tiposLoading}
            loading={tiposLoading}
            className="h-9 text-sm"
          />
        </div>

        <div className="lg:col-span-4 space-y-2">
          <label className="text-sm font-medium text-slate-700">Buscar por código:</label>
          <Input
            placeholder="Código de orden de compra"
            className="h-9 text-sm bg-white/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            disabled={loading}
          />
        </div>

        <div className="lg:col-span-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 text-sm"
            onClick={handleClearFilters}
            disabled={loading}
            title="Limpiar todos los filtros"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleApplyFilters}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile Card Component
function MobilePurchaseCard({ order }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <div>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                >
                  {order.orden || `OC-${order.id}`}
                </Badge>
                <Badge
                  className={
                    order.status_text === "Aprobada"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                      : order.status_text === "Activa"
                      ? "bg-[#1d293d]/10 text-[#1d293d] hover:bg-[#1d293d]/15 text-xs"
                      : order.status_text === "En Proceso"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs"
                  }
                >
                  {order.status_text}
                </Badge>
              </div>
              <div className="text-sm font-medium text-slate-900">
                {order.tipo_compra_nombre || "Sin tipo"}
              </div>
              <div className="text-xs text-slate-600">
                {order.proveedor_nombre || "Sin proveedor"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                {order.equipos_count || 0} equipos
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-slate-700">Fecha:</span>
              <div className="text-slate-900">
                {order.fecha_formatted || "Sin fecha"}
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-700">Archivo:</span>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-red-600" />
                <span className="text-slate-900">
                  {order.file ? "PDF" : "Sin archivo"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Row Component
function DesktopPurchaseRow({ order }) {
  return (
    <tr className="border-b hover:bg-slate-50/50 transition-colors">
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 font-mono text-xs"
            >
              {order.orden || `OC-${order.id}`}
            </Badge>
          </div>
          <div className="text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Estado:</span>
              <Badge
                className={
                  order.status_text === "Aprobada"
                    ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                    : order.status_text === "Activa"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs"
                    : order.status_text === "En Proceso"
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100 text-xs"
                }
              >
                {order.status_text}
              </Badge>
            </div>
            <div className="mt-1">
              <span className="font-medium">Equipos:</span>
              <span className="ml-1 text-slate-900 font-semibold">
                {order.equipos_count || 0}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="flex items-center gap-2">
          <div className="w-6 lg:w-8 h-6 lg:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Package className="w-3 lg:w-4 h-3 lg:h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900 text-xs lg:text-sm">
              {order.tipo_compra_nombre || "Sin tipo"}
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 lg:w-4 h-3 lg:h-4 text-slate-500" />
          <div className="text-xs lg:text-sm">
            <div className="font-medium text-slate-900">
              {order.fecha_formatted || "Sin fecha"}
            </div>
            <div className="text-xs text-slate-600 hidden lg:block">
              {order.fecha
                ? new Date(order.fecha).toLocaleDateString("es-ES", {
                    weekday: "long",
                  })
                : "Sin fecha"}
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="flex items-center gap-2">
          <div className="w-6 lg:w-8 h-6 lg:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-200">
            <FileText className="w-3 lg:w-4 h-3 lg:h-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 text-xs lg:text-sm truncate">
              {order.file || "Sin archivo"}
            </div>
            <div className="text-xs text-slate-600">
              {order.file ? "PDF" : "No disponible"}
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 align-top">
        <div className="space-y-1">
          <div className="font-medium text-slate-900 text-xs lg:text-sm">
            {order.proveedor_nombre || "Sin proveedor"}
          </div>
          <div className="text-xs text-slate-600">
            {order.secop_id
              ? `SECOP: ${order.secop_id}`
              : "Proveedor Autorizado"}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default PurchaseOrdersView;

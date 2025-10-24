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
import { QueryPurchaseOrderModal } from "@/components/modals/query-purchase-order-modal";
import { DownloadPdfModal } from "@/components/modals/download-pdf-modal";
import { SecopConsultationModal } from "@/components/modals/secop-consultation-modal";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import { useOrdenesCompra } from "../hooks/useOrdenesCompra";

export function PurchaseOrdersView() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [downloadPdfModalOpen, setDownloadPdfModalOpen] = useState(false);
  const [secopModalOpen, setSecopModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Use the custom hook for purchase orders
  const {
    purchaseOrders,
    loading,
    pagination,
    search,
    changePage,
    changePageSize,
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
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      {/* Responsive Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">
          Órdenes de Compra
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm lg:text-base">
          Gestión y control de órdenes de compra hospitalarias
        </p>
      </div>
      {/* Responsive Action Buttons */}
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
                onClick={() => setSecopModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center"
              >
                <RefreshCw className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">SECOP</span>
              </Button>
              <Button
                onClick={() => setDownloadPdfModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center"
              >
                <Download className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Agregar PDF</span>
              </Button>
              <Button
                onClick={handleExportToExcel}
                variant="ghost"
                size="sm"
                disabled={exportLoading}
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center"
              >
                {exportLoading ? (
                  <Loader2 className="w-3 h-3 mr-1 flex-shrink-0 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1 flex-shrink-0" />
                )}
                <span className="truncate">Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Responsive Filters Section */}
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
                  Sistema Activo
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
                  handleClearFilters={handleClearFilters}
                  loading={loading}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <DesktopPurchaseFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                handleClearFilters={handleClearFilters}
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {loading ? (
              <span>Cargando órdenes...</span>
            ) : hasError ? (
              <span className="text-red-600">Error al cargar órdenes</span>
            ) : (
              <span>
                Mostrando órdenes: {showingFrom} a {showingTo} de {totalItems}{" "}
                registros
                {totalPages > 1 && (
                  <span className="text-slate-500 ml-2">
                    (Página {currentPage} de {totalPages})
                  </span>
                )}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-teal-100 text-teal-800 text-xs w-fit"
              >
                {hasError ? "Error" : loading ? "Cargando" : "Actualizada"}
              </Badge>
              {hasError && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refresh}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Pagination Top */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b bg-slate-50">
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
                      i === currentPage ? "bg-teal-600 hover:bg-teal-700" : ""
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-16 bg-slate-50 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : hasError ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                        <p className="text-sm text-red-600 mb-2">
                          Error al cargar las órdenes
                        </p>
                        <Button size="sm" variant="outline" onClick={refresh}>
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Reintentar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : isEmpty ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          No se encontraron órdenes de compra
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((order) => (
                    <DesktopPurchaseRow key={order.id} order={order} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Info Bottom */}
        <div className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 border-t bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Total de órdenes: {totalItems} órdenes</span>
            <span className="text-xs text-slate-500">
              Actualizado: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Responsive Pagination Bottom */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-slate-50">
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
                      i === currentPage ? "bg-teal-600 hover:bg-teal-700" : ""
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
      <SecopConsultationModal
        open={secopModalOpen}
        onOpenChange={setSecopModalOpen}
      />
      <DownloadPdfModal
        open={downloadPdfModalOpen}
        onOpenChange={setDownloadPdfModalOpen}
      />
    </div>
  );
}

// Mobile Filters Component
function MobilePurchaseFilters({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleClearFilters,
  loading,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 w-7 p-0 bg-white/80"
          onClick={handleClearFilters}
          title="Limpiar todos los filtros"
        >
          <RefreshCw className="w-3 h-3 text-teal-600" />
        </Button>
        <span className="text-xs font-medium text-slate-700">Limpiar</span>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Proveedor:</label>
        <Select defaultValue="TODOS">
          <SelectTrigger className="h-8 text-xs bg-white/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="VARIAN">Varian</SelectItem>
            <SelectItem value="MEDTRONIC">Medtronic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-700">Buscar:</label>
        <div className="flex gap-2">
          <Input
            placeholder="Código de orden..."
            className="flex-1 h-8 text-xs bg-white/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={loading}
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-2 bg-white/80"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Search className="w-3 h-3 text-teal-600" />
            )}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Desde:</label>
          <Input
            type="date"
            defaultValue="2024-06-01"
            className="h-8 text-xs bg-white/80"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Hasta:</label>
          <Input
            type="date"
            defaultValue="2024-06-18"
            className="h-8 text-xs bg-white/80"
          />
        </div>
      </div>
    </div>
  );
}

// Desktop Filters Component
function DesktopPurchaseFilters({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleClearFilters,
  loading,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Limpiar:
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleClearFilters}
            title="Limpiar todos los filtros"
          >
            <RefreshCw className="w-4 h-4 text-teal-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Proveedor:
          </span>
          <Select defaultValue="TODOS">
            <SelectTrigger className="w-32 lg:w-40 h-8 text-sm bg-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="VARIAN">Varian Medical</SelectItem>
              <SelectItem value="MEDTRONIC">Medtronic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Buscar:
          </span>
          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              placeholder="Código de orden de compra"
              className="flex-1 min-w-0 h-8 text-sm bg-white/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 bg-white/80"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-teal-600" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Período:</span>
          <Input
            type="date"
            defaultValue="2024-06-01"
            className="w-28 lg:w-32 h-8 text-sm bg-white/80"
          />
          <span className="text-slate-500">—</span>
          <Input
            type="date"
            defaultValue="2024-06-18"
            className="w-28 lg:w-32 h-8 text-sm bg-white/80"
          />
        </div>
      </div>
      <div className="border-t border-teal-100 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tipo:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equipos">Equipos</SelectItem>
                <SelectItem value="suministros">Suministros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Estado:
            </label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Monto:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                <SelectItem value="50000+">$50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Depto:</label>
            <Select>
              <SelectTrigger className="h-8 text-sm bg-white/80">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="radiologia">Radiología</SelectItem>
                <SelectItem value="cardiologia">Cardiología</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Card Component
function MobilePurchaseCard({ order }) {
  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-3">
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
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs"
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
      </CardContent>
    </Card>
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
          <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-200">
            <Package className="w-3 lg:w-4 h-3 lg:h-4 text-teal-600" />
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

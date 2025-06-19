"use client"

import { useState } from "react"
import { Search, Plus, Download, Filter, FileText, Calendar, Building, Package, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AddPurchaseOrderModal } from "@/components/modals/add-purchase-order-modal"
import { QueryPurchaseOrderModal } from "@/components/modals/query-purchase-order-modal"
import { DownloadPdfModal } from "@/components/modals/download-pdf-modal"

const purchaseOrdersData = [
  {
    id: "001",
    codigo: "PO-2024-001",
    tipoCompra: "Equipos Médicos",
    fecha: "2024-06-15",
    archivo: "orden_compra_001.pdf",
    proveedor: "VARIAN MEDICAL SYSTEMS",
    estado: "Aprobada",
    monto: "$125,000.00",
  },
  {
    id: "002",
    codigo: "PO-2024-002",
    tipoCompra: "Suministros Médicos",
    fecha: "2024-06-14",
    archivo: "orden_compra_002.pdf",
    proveedor: "MEDTRONIC COLOMBIA",
    estado: "Pendiente",
    monto: "$45,750.00",
  },
  {
    id: "003",
    codigo: "PO-2024-003",
    tipoCompra: "Mantenimiento",
    fecha: "2024-06-13",
    archivo: "orden_compra_003.pdf",
    proveedor: "SIEMENS HEALTHCARE",
    estado: "En Proceso",
    monto: "$32,500.00",
  },
]

export function PurchaseOrdersView() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [queryModalOpen, setQueryModalOpen] = useState(false)
  const [downloadPdfModalOpen, setDownloadPdfModalOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      {/* Responsive Header */}
      <div className="mb-4 sm:mb-6">
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 sm:mb-2">Órdenes de Compra</h1>
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
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center">
                <Plus className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Agregar</span>
              </Button>
              <Button
                onClick={() => setQueryModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center">
                <Search className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Consulta</span>
              </Button>
              <Button
                onClick={() => setDownloadPdfModalOpen(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-slate-700 hover:text-white text-xs h-8 px-2 flex-1 min-w-0 justify-start sm:justify-center">
                <Download className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Agregar PDF</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Responsive Filters Section */}
        <div
          className="bg-gradient-to-r from-teal-50 to-blue-50 border-b border-teal-100">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Panel de Control</h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-white/80 text-slate-700 border-slate-300 text-xs">
                  Sistema Activo
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden h-8 w-8 p-0"
                  onClick={() => setFiltersOpen(!filtersOpen)}>
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Collapsible Filters */}
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="sm:hidden">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mb-3 justify-between">
                  <span>Filtros</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <MobilePurchaseFilters />
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <DesktopPurchaseFilters />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div
          className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 bg-slate-50 border-b">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Mostrando órdenes: 1 a 3 de 3 registros</span>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-xs w-fit">
              Actualizada
            </Badge>
          </div>
        </div>

        {/* Responsive Pagination Top */}
        <div
          className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 border-b bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select defaultValue="3">
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">órdenes por página</span>
            <span className="text-slate-700 sm:hidden">por página</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Ant
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Sig
            </Button>
          </div>
        </div>

        {/* Responsive Table/Cards */}
        <div className="block sm:hidden">
          {/* Mobile Card View */}
          <div className="space-y-3 p-3">
            {purchaseOrdersData.map((order) => (
              <MobilePurchaseCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        <div className="hidden sm:block">
          {/* Desktop Table View */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px] lg:min-w-[800px]">
              <thead>
                <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                  <th
                    className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Código/Número
                  </th>
                  <th
                    className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Tipo de compra
                  </th>
                  <th
                    className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Fecha
                  </th>
                  <th
                    className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800 border-r border-slate-200">
                    Archivo
                  </th>
                  <th
                    className="text-left p-2 lg:p-4 text-xs lg:text-sm font-semibold text-slate-800">Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrdersData.map((order) => (
                  <DesktopPurchaseRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Info Bottom */}
        <div
          className="p-3 sm:p-4 text-xs sm:text-sm text-slate-600 border-t bg-slate-50">
          <div
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Total de órdenes: 3 órdenes</span>
            <span className="text-xs text-slate-500">Actualizado: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Responsive Pagination Bottom */}
        <div
          className="px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-700">Mostrar</span>
            <Select defaultValue="3">
              <SelectTrigger className="w-12 sm:w-16 h-7 sm:h-8 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-slate-700 hidden sm:inline">órdenes por página</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Anterior
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm">
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
      {/* Modals */}
      <AddPurchaseOrderModal open={addModalOpen} onOpenChange={setAddModalOpen} />
      <QueryPurchaseOrderModal open={queryModalOpen} onOpenChange={setQueryModalOpen} />
      <DownloadPdfModal open={downloadPdfModalOpen} onOpenChange={setDownloadPdfModalOpen} />
    </div>
  );
}

// Mobile Filters Component
function MobilePurchaseFilters() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-white/80">
          <Filter className="w-3 h-3 text-teal-600" />
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
            className="flex-1 h-8 text-xs bg-white/80" />
          <Button size="sm" variant="outline" className="h-8 px-2 bg-white/80">
            <Search className="w-3 h-3 text-teal-600" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Desde:</label>
          <Input type="date" defaultValue="2024-06-01" className="h-8 text-xs bg-white/80" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Hasta:</label>
          <Input type="date" defaultValue="2024-06-18" className="h-8 text-xs bg-white/80" />
        </div>
      </div>
    </div>
  );
}

// Desktop Filters Component
function DesktopPurchaseFilters() {
  return (
    <div className="space-y-4">
      <div
        className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Limpiar:</span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
            <Filter className="w-4 h-4 text-teal-600" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Proveedor:</span>
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
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Buscar:</span>
          <div className="flex gap-2 flex-1 min-w-0">
            <Input
              placeholder="Código de orden de compra"
              className="flex-1 min-w-0 h-8 text-sm bg-white/80" />
            <Button size="sm" variant="outline" className="h-8 px-3 bg-white/80">
              <Search className="w-4 h-4 text-teal-600" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Período:</span>
          <Input
            type="date"
            defaultValue="2024-06-01"
            className="w-28 lg:w-32 h-8 text-sm bg-white/80" />
          <span className="text-slate-500">—</span>
          <Input
            type="date"
            defaultValue="2024-06-18"
            className="w-28 lg:w-32 h-8 text-sm bg-white/80" />
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
            <label className="text-sm font-medium text-slate-700">Estado:</label>
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
                  className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  {order.codigo}
                </Badge>
                <Badge
                  className={
                    order.estado === "Aprobada"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                      : order.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs"
                  }>
                  {order.estado}
                </Badge>
              </div>
              <div className="text-sm font-medium text-slate-900">{order.tipoCompra}</div>
              <div className="text-xs text-slate-600">{order.proveedor}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{order.monto}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-slate-700">Fecha:</span>
              <div className="text-slate-900">{new Date(order.fecha).toLocaleDateString("es-ES")}</div>
            </div>
            <div>
              <span className="font-medium text-slate-700">Archivo:</span>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-red-600" />
                <span className="text-slate-900">PDF</span>
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
              className="bg-orange-50 text-orange-700 border-orange-200 font-mono text-xs">
              {order.codigo}
            </Badge>
          </div>
          <div className="text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">Estado:</span>
              <Badge
                className={
                  order.estado === "Aprobada"
                    ? "bg-green-100 text-green-800 hover:bg-green-100 text-xs"
                    : order.estado === "Pendiente"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs"
                }>
                {order.estado}
              </Badge>
            </div>
            <div className="mt-1">
              <span className="font-medium">Monto:</span>
              <span className="ml-1 text-slate-900 font-semibold">{order.monto}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="flex items-center gap-2">
          <div
            className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-200">
            {order.tipoCompra === "Equipos Médicos" ? (
              <Package className="w-3 lg:w-4 h-3 lg:h-4 text-teal-600" />
            ) : order.tipoCompra === "Suministros Médicos" ? (
              <FileText className="w-3 lg:w-4 h-3 lg:h-4 text-blue-600" />
            ) : (
              <Building className="w-3 lg:w-4 h-3 lg:h-4 text-purple-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900 text-xs lg:text-sm">{order.tipoCompra}</div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 lg:w-4 h-3 lg:h-4 text-slate-500" />
          <div className="text-xs lg:text-sm">
            <div className="font-medium text-slate-900">
              {new Date(order.fecha).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-slate-600 hidden lg:block">
              {new Date(order.fecha).toLocaleDateString("es-ES", {
                weekday: "long",
              })}
            </div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 border-r border-slate-200 align-top">
        <div className="flex items-center gap-2">
          <div
            className="w-6 lg:w-8 h-6 lg:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-200">
            <FileText className="w-3 lg:w-4 h-3 lg:h-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 text-xs lg:text-sm truncate">{order.archivo}</div>
            <div className="text-xs text-slate-600">PDF</div>
          </div>
        </div>
      </td>
      <td className="p-2 lg:p-4 align-top">
        <div className="space-y-1">
          <div className="font-medium text-slate-900 text-xs lg:text-sm">{order.proveedor}</div>
          <div className="text-xs text-slate-600">Proveedor Autorizado</div>
        </div>
      </td>
    </tr>
  );
}

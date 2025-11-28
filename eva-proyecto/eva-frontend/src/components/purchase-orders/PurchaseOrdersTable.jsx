import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001";

export function PurchaseOrdersTable({ orders, loading, onSort, sortBy, sortOrder }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newOrder);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-slate-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-teal-600" />
      : <ArrowDown className="w-4 h-4 ml-1 text-teal-600" />;
  };

  const handleViewFile = (fileName) => {
    if (!fileName) return;
    const fileUrl = `${API_BASE_URL}/storage/ordenes_compra/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  const handleViewSecop = (url) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
              {[...Array(7)].map((_, i) => (
                <th key={i} className="text-left p-4 border-r border-slate-200">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-24"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b">
                {[...Array(7)].map((_, j) => (
                  <td key={j} className="p-4 border-r border-slate-100">
                    <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[1000px]">
        <thead>
          <tr className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <th className="text-left p-3 text-sm font-semibold text-slate-800 border-r border-slate-200">
              <button
                onClick={() => handleSort('orden')}
                className="flex items-center hover:text-teal-600 transition-colors"
              >
                Código/Número
                {getSortIcon('orden')}
              </button>
            </th>
            <th className="text-left p-3 text-sm font-semibold text-slate-800 border-r border-slate-200">
              <button
                onClick={() => handleSort('tipo_compra')}
                className="flex items-center hover:text-teal-600 transition-colors"
              >
                Tipo de Compra
                {getSortIcon('tipo_compra')}
              </button>
            </th>
            <th className="text-left p-3 text-sm font-semibold text-slate-800 border-r border-slate-200">
              <button
                onClick={() => handleSort('fecha')}
                className="flex items-center hover:text-teal-600 transition-colors"
              >
                Fecha
                {getSortIcon('fecha')}
              </button>
            </th>
            <th className="text-left p-3 text-sm font-semibold text-slate-800 border-r border-slate-200">
              <button
                onClick={() => handleSort('proveedor')}
                className="flex items-center hover:text-teal-600 transition-colors"
              >
                Proveedor
                {getSortIcon('proveedor')}
              </button>
            </th>
            <th className="text-left p-3 text-sm font-semibold text-slate-800 border-r border-slate-200">
              Archivo
            </th>
            <th className="text-left p-3 text-sm font-semibold text-slate-800">
              SECOP
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr
              key={order.id}
              className={`border-b transition-colors ${
                hoveredRow === index ? 'bg-teal-50' : 'hover:bg-slate-50'
              }`}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td className="p-3 border-r border-slate-100">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">{order.orden}</span>
                  {order.secop_id && (
                    <span className="text-xs text-slate-500">ID: {order.secop_id}</span>
                  )}
                </div>
              </td>
              <td className="p-3 border-r border-slate-100">
                <Badge variant="outline" className="text-xs">
                  {order.tipo_compra_nombre || 'N/A'}
                </Badge>
              </td>
              <td className="p-3 border-r border-slate-100">
                <span className="text-sm text-slate-700">{formatDate(order.fecha)}</span>
              </td>
              <td className="p-3 border-r border-slate-100">
                <span className="text-sm text-slate-900">
                  {order.proveedor_nombre || 'N/A'}
                </span>
              </td>
              <td className="p-3 border-r border-slate-100">
                {order.file ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewFile(order.file)}
                    className="h-8 px-3 text-xs"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Ver Archivo
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">Sin archivo</span>
                )}
              </td>
              <td className="p-3">
                {order.url_secop ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewSecop(order.url_secop)}
                    className="h-8 px-3 text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver SECOP
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">Sin URL</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

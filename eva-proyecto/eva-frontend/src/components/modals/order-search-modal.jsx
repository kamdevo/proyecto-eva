import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001";

export function OrderSearchModal({
  open,
  onOpenChange,
  onSelectOrder,
  currentOrderId
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await httpService.get('/v1/ordenes-compra', {
        params: {
          per_page: 100,
          search: searchTerm.trim() || undefined
        }
      });

      if (response.data?.success) {
        setOrders(response.data.data?.data || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Error al cargar las órdenes de compra");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedOrder(null);
      loadOrders();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => loadOrders(), 300);
      return () => clearTimeout(t);
    }
  }, [searchTerm, open]);

  const handleConfirmSelection = () => {
    if (selectedOrder && onSelectOrder) {
      onSelectOrder(selectedOrder);
      onOpenChange(false);
      setSelectedOrder(null);
      setSearchTerm("");
    } else {
      toast.error("Por favor selecciona una orden de compra");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedOrder(null);
    setSearchTerm("");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString('es-CO');
    } catch {
      return String(date);
    }
  };

  const getFileUrl = (file) => {
    if (!file) return null;
    if (/^https?:\/\//i.test(file)) return file;
    // Backend guarda en public/storage/ordenes_compra/<file>
    return `${API_BASE}/storage/ordenes_compra/${file}`;
  };

  const openFile = (e, url) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-6xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader className="pb-3 border-b shrink-0">
          <DialogTitle className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Buscar Órdenes de Compra
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona una orden de compra para asociar al equipo
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-3 py-3 overflow-hidden">
          {/* Búsqueda */}
          <div className="flex gap-3 shrink-0">
            <div className="flex-1">
              <Label className="text-sm font-medium">
                Buscar por número de orden, proveedor o tipo de compra
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Escribe para buscar órdenes de compra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={() => setSearchTerm("")} variant="outline" size="sm">
                Limpiar
              </Button>
            </div>
          </div>

          {/* Lista de órdenes */}
          <div className="flex-1 min-h-0 overflow-hidden border rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando órdenes de compra...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? "No se encontraron órdenes de compra" : "No hay órdenes de compra disponibles"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="w-10 p-3 text-left"></th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">ID</th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">N° Orden</th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Fecha</th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Proveedor</th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Tipo de compra</th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">Estado</th>
                      <th className="p-3 text-center font-semibold whitespace-nowrap">Archivo</th>
                      <th className="p-3 text-left font-semibold whitespace-nowrap">SECOP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const orderIdStr = String(order.id);
                      const isSelected = selectedOrder?.id === order.id;
                      const isCurrent = String(currentOrderId || '') === orderIdStr;
                      const fileUrl = getFileUrl(order.file);
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`border-t cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-100 hover:bg-blue-100'
                              : isCurrent
                              ? 'bg-green-50 hover:bg-green-100'
                              : 'hover:bg-blue-50'
                          }`}
                        >
                          <td className="p-3">
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                          </td>
                          <td className="p-3 text-gray-600">{order.id}</td>
                          <td className="p-3 font-medium text-blue-700">
                            {order.orden || `#${order.id}`}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {formatDate(order.fecha)}
                          </td>
                          <td className="p-3">
                            {order.proveedor_nombre || <span className="text-gray-400 italic">Sin proveedor</span>}
                          </td>
                          <td className="p-3">
                            {order.tipo_compra_nombre || <span className="text-gray-400 italic">N/A</span>}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              String(order.status) === '1' || order.status === 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {String(order.status) === '1' || order.status === 1 ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {fileUrl ? (
                              <button
                                type="button"
                                onClick={(e) => openFile(e, fileUrl)}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                title={`Ver archivo: ${order.file}`}
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-xs">Ver</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Sin archivo</span>
                            )}
                          </td>
                          <td className="p-3">
                            {order.url_secop ? (
                              <button
                                type="button"
                                onClick={(e) => openFile(e, order.url_secop)}
                                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                                title={order.url_secop}
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-xs">Ver</span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orden seleccionada - preview */}
          {selectedOrder && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shrink-0">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orden seleccionada
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="font-medium text-gray-700">ID:</span> {selectedOrder.id}</div>
                <div><span className="font-medium text-gray-700">N° Orden:</span> {selectedOrder.orden || 'N/A'}</div>
                <div><span className="font-medium text-gray-700">Fecha:</span> {formatDate(selectedOrder.fecha)}</div>
                <div><span className="font-medium text-gray-700">Proveedor:</span> {selectedOrder.proveedor_nombre || 'N/A'}</div>
                <div><span className="font-medium text-gray-700">Tipo:</span> {selectedOrder.tipo_compra_nombre || 'N/A'}</div>
                <div>
                  <span className="font-medium text-gray-700">Archivo:</span>{' '}
                  {getFileUrl(selectedOrder.file) ? (
                    <button
                      type="button"
                      onClick={(e) => openFile(e, getFileUrl(selectedOrder.file))}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <FileText className="w-3 h-3" /> Ver
                    </button>
                  ) : (
                    <span className="text-gray-500 italic">Sin archivo</span>
                  )}
                </div>
                {selectedOrder.url_secop && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">SECOP:</span>{' '}
                    <button
                      type="button"
                      onClick={(e) => openFile(e, selectedOrder.url_secop)}
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {selectedOrder.url_secop}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-3 border-t shrink-0">
          <Button onClick={handleCancel} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Seleccionar Orden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

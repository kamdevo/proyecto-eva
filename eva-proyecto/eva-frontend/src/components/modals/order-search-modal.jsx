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
import { Search, Package, FileText, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

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

  // Cargar órdenes de compra
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
        console.warn("No se pudieron cargar las órdenes de compra");
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

  // Cargar órdenes cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadOrders();
    }
  }, [open]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (open) {
      const debounceTimer = setTimeout(() => {
        loadOrders();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, open]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

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

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('es-CO');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Buscar Órdenes de Compra
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona una orden de compra para asociar al equipo
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
          {/* Búsqueda */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm font-medium">
                Buscar por número, proveedor, o descripción
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
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                size="sm"
                className="mb-0"
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Lista de órdenes */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando órdenes de compra...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {searchTerm ? "No se encontraron órdenes de compra" : "No hay órdenes de compra disponibles"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="w-12 p-3 text-left"></th>
                        <th className="p-3 text-left font-medium">Número</th>
                        <th className="p-3 text-left font-medium">Proveedor</th>
                        <th className="p-3 text-left font-medium">Fecha</th>
                        <th className="p-3 text-left font-medium">Valor</th>
                        <th className="p-3 text-left font-medium">Estado</th>
                        <th className="p-3 text-left font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          onClick={() => handleSelectOrder(order)}
                          className={`border-t cursor-pointer hover:bg-blue-50 transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-blue-100 border-blue-200' : ''
                          } ${currentOrderId === order.id.toString() ? 'bg-green-50' : ''}`}
                        >
                          <td className="p-3">
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                              selectedOrder?.id === order.id 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
                            }`}>
                              {selectedOrder?.id === order.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-medium text-blue-600">
                            {order.numero || order.id}
                          </td>
                          <td className="p-3">
                            {order.proveedor || "N/A"}
                          </td>
                          <td className="p-3">
                            {formatDate(order.fecha || order.created_at)}
                          </td>
                          <td className="p-3 font-medium">
                            {formatCurrency(order.valor_total || order.valor)}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.estado === 'completada' || order.estado === 'entregada'
                                ? 'bg-green-100 text-green-800'
                                : order.estado === 'pendiente' || order.estado === 'proceso'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.estado || "N/A"}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="truncate" title={order.descripcion || order.observaciones}>
                              {order.descripcion || order.observaciones || "Sin descripción"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Orden seleccionada */}
          {selectedOrder && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Orden seleccionada:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Número:</span> {selectedOrder.numero || selectedOrder.id}
                </div>
                <div>
                  <span className="font-medium">Proveedor:</span> {selectedOrder.proveedor || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {formatDate(selectedOrder.fecha || selectedOrder.created_at)}
                </div>
                <div>
                  <span className="font-medium">Valor:</span> {formatCurrency(selectedOrder.valor_total || selectedOrder.valor)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            onClick={handleCancel}
            variant="outline"
          >
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

export default function ConfirmarCierreModal({ isOpen, onClose, ticketId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      // ✅ Agregar objeto vacío como body para asegurar que sea POST
      const response = await httpService.post(`/v1/tickets/${ticketId}/confirmar-cierre`, {});

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al confirmar el cierre');
      }

      toast.success("✅ Ticket cerrado exitosamente");
      
      // Cerrar modal y dejar que el padre recargue los datos
      onClose();
    } catch (error) {
      console.error('❌ Error al confirmar cierre:', error);
      const errorMessage = error.response?.data?.message || error.message || "Error al confirmar el cierre del ticket";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="bg-green-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Confirmar Cierre de Ticket</DialogTitle>
              <p className="text-sm text-green-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  Confirmación de Cierre
                </p>
                <p className="text-sm text-yellow-800">
                  ¿Está seguro de que desea cerrar definitivamente este ticket?
                </p>
              </div>
            </div>
          </div>

          {/* Información */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Al confirmar el cierre:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
              <li>El ticket cambiará a estado <strong>"Cerrado"</strong></li>
              <li>Se registrará la fecha de cierre confirmado</li>
              <li>No se podrán realizar más modificaciones</li>
            </ul>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? "Confirmando..." : "Confirmar Cierre"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

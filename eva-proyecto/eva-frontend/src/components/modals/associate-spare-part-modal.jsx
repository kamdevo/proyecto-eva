"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Wrench, Send } from "lucide-react";
import { toast } from "sonner";

export default function AssociateSparePart({ isOpen, onClose, ticketId }) {
  const [repuestoNombre, setRepuestoNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!repuestoNombre.trim()) {
      toast.error("El nombre del repuesto es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/tickets/${ticketId}/repuesto-pendiente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          repuesto_nombre: repuestoNombre
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al asociar el repuesto');
      }

      toast.success("✅ Repuesto asociado exitosamente");
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al asociar el repuesto pendiente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className="bg-orange-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <Wrench className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Asociar Repuesto Pendiente</DialogTitle>
              <p className="text-sm text-orange-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="repuesto" className="text-sm font-semibold text-gray-700">
              Nombre del Repuesto *
            </Label>
            <Input
              id="repuesto"
              type="text"
              placeholder="Ej: Batería de litio 12V, Sensor de temperatura, etc."
              value={repuestoNombre}
              onChange={(e) => setRepuestoNombre(e.target.value)}
              className="w-full"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Ingrese el nombre completo del repuesto que se requiere
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Nota:</strong> El repuesto pendiente será registrado y notificado al área correspondiente para su gestión.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

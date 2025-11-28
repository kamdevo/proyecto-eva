"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Wrench, Send } from "lucide-react";
import { toast } from "sonner";

export default function AssociateSparePart({ isOpen, onClose, ticketId, hasSpare = false, currentSpareName = "" }) {
  const [repuestoNombre, setRepuestoNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState(hasSpare ? 'remove' : 'add'); // 'add' o 'remove'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si estamos en modo 'add', validar que haya nombre
    if (mode === 'add' && !repuestoNombre.trim()) {
      toast.error("El nombre del repuesto es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'remove') {
        // Quitar repuesto - cambiar condición a 'NO'
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/tickets/${ticketId}/quitar-repuesto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Error al quitar el repuesto');
        }

        toast.success("✅ Repuesto marcado como instalado exitosamente");
      } else {
        // Asociar repuesto nuevo
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
      }
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || (mode === 'remove' ? "Error al marcar el repuesto como instalado" : "Error al asociar el repuesto pendiente"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className={`${mode === 'remove' ? 'bg-blue-600' : 'bg-orange-600'} text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4`}>
          <div className="flex items-center">
            <Wrench className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                {mode === 'remove' ? 'Definir Repuesto como Instalado' : 'Asociar Repuesto Pendiente'}
              </DialogTitle>
              <p className="text-sm opacity-90">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {mode === 'remove' ? (
            // Modo Quitar Repuesto
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Repuesto actual:</strong> {currentSpareName}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>¿Está seguro?</strong> Al marcar como instalado, se confirmará que el repuesto fue instalado y esta acción no se puede revertir.
                </p>
              </div>
            </>
          ) : (
            // Modo Asociar Repuesto
            <>
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
            </>
          )}

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
              className={`${mode === 'remove' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? (mode === 'remove' ? "Procesando..." : "Enviando...") : (mode === 'remove' ? "Marcar como Instalado" : "Enviar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Building2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export default function UIModalEliminarEmpresaMto({ isOpen, onClose, empresa }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!empresa?.id) {
      toast.error("Error: no se encontró la empresa");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_URL}/v1/proveedores-mantenimiento/${empresa.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al eliminar empresa");
      }
      toast.success("✅ Empresa eliminada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al eliminar empresa");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!empresa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-red-500 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Eliminar Empresa de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {/* Icono + mensaje */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">¿Confirmar eliminación?</h3>
              <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
            </div>
          </div>

          {/* Empresa a eliminar */}
          <div className="bg-gray-50 p-5 rounded-xl border-l-4 border-red-500">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Empresa a eliminar:
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Nombre: </span>
                <span className="text-gray-800 font-semibold">{empresa.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Estado: </span>
                <span
                  className={`font-semibold ${
                    empresa.status === 1 ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {empresa.status === 1 ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Si esta empresa está asociada a registros de mantenimiento, no podrá ser eliminada.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-6"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl px-6 bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export default function UIModalEditarEmpresaMto({ isOpen, onClose, empresa }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (empresa) {
      setName(empresa.name || "");
      setStatus(empresa.status ?? 1);
    }
  }, [empresa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!empresa?.id) {
      toast.error("Error: no se encontró la empresa");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_URL}/v1/proveedores-mantenimiento/${empresa.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name: trimmed, status }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al actualizar empresa");
      }
      toast.success("✅ Empresa actualizada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al actualizar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!empresa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Editar Empresa de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Nombre */}
          <div className="space-y-3">
            <Label htmlFor="edit-name" className="text-base font-semibold text-gray-700">
              Nombre de la empresa
            </Label>
            <Input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Tecnimed S.A.S."
              className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 py-3 text-base"
              maxLength={100}
              autoFocus
            />
            <p className="text-xs text-gray-400">{name.length}/100 caracteres</p>
          </div>

          {/* Estado */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-700">Estado</Label>
            <button
              type="button"
              onClick={() => setStatus(status === 1 ? 0 : 1)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 w-full text-left ${
                status === 1
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-300 bg-gray-50 text-gray-500"
              }`}
            >
              {status === 1 ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className="font-medium">
                {status === 1 ? "Activo" : "Inactivo"}
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl px-6"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-xl px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

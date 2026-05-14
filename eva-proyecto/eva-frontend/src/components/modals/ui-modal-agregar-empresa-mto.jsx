"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export default function UIModalAgregarEmpresaMto({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/v1/proveedores-mantenimiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: trimmed, status: 1 }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al crear empresa");
      }
      toast.success("✅ Empresa de mantenimiento creada exitosamente");
      setName("");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al crear empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Agregar Empresa de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-semibold text-gray-700">
              Nombre de la empresa
            </Label>
            <Input
              id="name"
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
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

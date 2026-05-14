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
  const [area, setArea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedArea = area.trim();
    if (!trimmedName) { toast.error("El nombre es obligatorio"); return; }
    if (!trimmedArea) { toast.error("El área es obligatoria"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/v1/empresas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: trimmedName, area: trimmedArea, estado: "true" }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al crear empresa");
      }
      toast.success("✅ Empresa de mantenimiento creada exitosamente");
      setName("");
      setArea("");
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
    setArea("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 border-b-2 border-amber-400 pb-3 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Agregar Empresa de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Nombre de la empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Tecnimed S.A.S."
              className="rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400 py-3 text-base"
              maxLength={200}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area" className="text-sm font-semibold text-gray-700">
              Área <span className="text-red-500">*</span>
            </Label>
            <Input
              id="area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ej: Mantenimiento Biomédico"
              className="rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400 py-3 text-base"
              maxLength={200}
            />
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
              disabled={isSubmitting || !name.trim() || !area.trim()}
              className="rounded-xl px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

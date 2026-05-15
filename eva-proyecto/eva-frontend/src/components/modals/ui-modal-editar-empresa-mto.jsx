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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export default function UIModalEditarEmpresaMto({ isOpen, onClose, empresa }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [estado, setEstado] = useState("true");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (empresa) {
      setName(empresa.name || "");
      setArea(empresa.area || "");
      setEstado(empresa.estado ?? "true");
    }
  }, [empresa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedArea = area.trim();
    if (!trimmedName) { toast.error("El nombre es obligatorio"); return; }
    if (!trimmedArea) { toast.error("El área es obligatoria"); return; }
    if (!empresa?.id) { toast.error("Error: no se encontró la empresa"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/v1/empresas/${empresa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: trimmedName, area: trimmedArea, estado }),
      });
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

  const handleClose = () => { onClose(); };

  if (!empresa) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 border-b-2 border-amber-400 pb-3 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Editar Empresa de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
              Nombre de la empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-name"
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
            <Label htmlFor="edit-area" className="text-sm font-semibold text-gray-700">
              Área <span className="text-red-500">*</span>
            </Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400 py-3 text-base">
                <SelectValue placeholder="Seleccione el área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mantenimiento Biomédico">Mantenimiento Biomédico</SelectItem>
                <SelectItem value="Mantenimiento Industrial">Mantenimiento Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Estado</Label>
            <button
              type="button"
              onClick={() => setEstado(estado === "true" ? "false" : "true")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 w-full text-left ${
                estado === "true"
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-300 bg-gray-50 text-gray-500"
              }`}
            >
              {estado === "true" ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-gray-400" />
              )}
              <span className="font-medium">{estado === "true" ? "Activo" : "Inactivo"}</span>
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl px-6" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !area.trim()}
              className="rounded-xl px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

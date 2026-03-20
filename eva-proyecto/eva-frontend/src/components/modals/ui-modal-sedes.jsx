"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { MapPin, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function UIModalSedes({ 
  isOpen, 
  onClose, 
  mode = "add", // "add", "edit", "view"
  data = null, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    name: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "add") {
        setFormData({
          name: ""
        });
      } else if (data) {
        setFormData({
          name: data.name || ""
        });
      }
    }
  }, [isOpen, mode, data]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "view") {
      onClose();
      return;
    }

    if (!formData.name.trim()) {
      toast.error("El nombre de la sede es obligatorio");
      return;
    }

    onSave({
      ...formData
    });
  };

  const isView = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Nueva Sede" : mode === "edit" ? "Editar Sede" : "Detalles de la Sede"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nombre de la Sede *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Sede Principal"
              disabled={isView}
              required
              className="h-11"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {isView ? "Cerrar" : "Cancelar"}
            </Button>
            {!isView && (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10 px-6">
                {mode === "add" ? "Registrar Sede" : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

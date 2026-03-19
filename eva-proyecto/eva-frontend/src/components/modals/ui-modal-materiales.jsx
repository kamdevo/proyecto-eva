import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Package, Plus, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function UIModalMateriales({ 
  isOpen, 
  onClose, 
  mode = "add", // "add", "edit", "view"
  data = null, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    cantidad: 0,
    precio_unitario: 0
  });

  // Generate random code for materials: MAT-XXXX
  const generateRandomCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MAT-${random}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === "add") {
        setFormData({
          nombre: "",
          codigo: generateRandomCode(),
          descripcion: "",
          cantidad: 0,
          precio_unitario: 0
        });
      } else if (data) {
        setFormData({
          codigo: data.codigo || "",
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          cantidad: data.cantidad || 0,
          precio_unitario: data.precio_unitario || 0
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

    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    onSave({
      ...formData
    });
  };

  const isView = mode === "view";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-w-[95vw] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            <Package className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Nuevo Material" : mode === "edit" ? "Editar Material" : "Detalles del Material"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Código</Label>
              <Input 
                value={formData.codigo} 
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                disabled={isView || mode === "edit"} 
                className={mode === "add" ? "bg-gray-50 border-gray-200 font-mono text-blue-700 font-bold" : ""}
                placeholder="Autogenerado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: Tornillo 1/4"
                disabled={isView}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad" className="text-sm font-semibold text-gray-700">Cantidad Inicial</Label>
              <Input
                id="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => handleInputChange("cantidad", parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={isView}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_unitario" className="text-sm font-semibold text-gray-700">Precio Unitario ($)</Label>
              <Input
                id="precio_unitario"
                type="number"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => handleInputChange("precio_unitario", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                disabled={isView}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-700">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Detalles adicionales del material..."
              disabled={isView}
              className="resize-none h-32"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {isView ? "Cerrar" : "Cancelar"}
            </Button>
            {!isView && (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {mode === "add" ? "Registrar Material" : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

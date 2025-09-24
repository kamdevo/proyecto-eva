"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, X } from "lucide-react";

export default function UIModalCrearSede({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    direccion: "",
    telefono: "",
    email: "",
    responsable: "",
    pisos: "",
    descripcion: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.codigo) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    const sedeData = {
      id: Date.now(),
      ...formData,
      fechaCreacion: new Date().toISOString()
    };

    console.log("Nueva sede creada:", sedeData);
    alert(`✅ Sede "${formData.nombre}" creada exitosamente`);
    
    // Reset form
    setFormData({
      nombre: "",
      codigo: "",
      direccion: "",
      telefono: "",
      email: "",
      responsable: "",
      pisos: "",
      descripcion: ""
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      codigo: "",
      direccion: "",
      telefono: "",
      email: "",
      responsable: "",
      pisos: "",
      descripcion: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            Crear Nueva Sede
          </DialogTitle>
          <DialogDescription id="dialog-description">
            Información del modal
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la Sede *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: SEDE PRINCIPAL"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="codigo" className="text-sm font-medium">
                Código *
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                placeholder="Ej: SP01"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="direccion" className="text-sm font-medium">
              Dirección
            </Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange("direccion", e.target.value)}
              placeholder="Dirección completa"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono" className="text-sm font-medium">
                Teléfono
              </Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="Número de teléfono"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="correo@ejemplo.com"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsable" className="text-sm font-medium">
                Responsable
              </Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => handleInputChange("responsable", e.target.value)}
                placeholder="Nombre del responsable"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pisos" className="text-sm font-medium">
                Número de Pisos
              </Label>
              <Input
                id="pisos"
                type="number"
                value={formData.pisos}
                onChange={(e) => handleInputChange("pisos", e.target.value)}
                placeholder="Ej: 5"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Descripción de la sede..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t mt-8">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Crear Sede
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
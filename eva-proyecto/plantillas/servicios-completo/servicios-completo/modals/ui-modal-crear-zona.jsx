"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, X } from "lucide-react";

export default function UIModalCrearZona({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    piso: "",
    jefeZona: "",
    descripcion: "",
    responsable: "",
    ubicacion: ""
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

    const zonaData = {
      id: Date.now(),
      ...formData,
      fechaCreacion: new Date().toISOString()
    };

    console.log("Nueva zona creada:", zonaData);
    alert(`✅ Zona "${formData.nombre}" creada exitosamente`);
    
    // Reset form
    setFormData({
      nombre: "",
      codigo: "",
      piso: "",
      jefeZona: "",
      descripcion: "",
      responsable: "",
      ubicacion: ""
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      codigo: "",
      piso: "",
      jefeZona: "",
      descripcion: "",
      responsable: "",
      ubicacion: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Crear Nueva Zona
          </DialogTitle>
          <DialogDescription id="dialog-description">
            Información del modal
          </DialogDescription>

        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la Zona *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: ZONA MOLANO1"
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
                placeholder="Ej: ZM01"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="piso" className="text-sm font-medium">
                Piso
              </Label>
              <Select value={formData.piso} onValueChange={(value) => handleInputChange("piso", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar piso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PISO 1">PISO 1</SelectItem>
                  <SelectItem value="PISO 2">PISO 2</SelectItem>
                  <SelectItem value="PISO 3">PISO 3</SelectItem>
                  <SelectItem value="PISO 4">PISO 4</SelectItem>
                  <SelectItem value="PISO 5">PISO 5</SelectItem>
                  <SelectItem value="PISO 6">PISO 6</SelectItem>
                  <SelectItem value="PISO 7">PISO 7</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="jefeZona" className="text-sm font-medium">
                Jefe de Zona *
              </Label>
              <Input
                id="jefeZona"
                value={formData.jefeZona}
                onChange={(e) => handleInputChange("jefeZona", e.target.value)}
                placeholder="Nombre del jefe de zona"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ubicacion" className="text-sm font-medium">
              Ubicación
            </Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => handleInputChange("ubicacion", e.target.value)}
              placeholder="Ubicación física"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              placeholder="Descripción de la zona..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Crear Zona
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
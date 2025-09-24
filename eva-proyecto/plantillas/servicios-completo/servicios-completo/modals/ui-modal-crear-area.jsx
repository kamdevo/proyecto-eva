"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, X } from "lucide-react";

export default function UIModalCrearArea({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    tipo: "",
    piso: "",
    zona: "",
    jefeZona: "",
    responsable: "",
    capacidad: "",
    ubicacion: "",
    descripcion: ""
  });

  const tiposArea = [
    "Consulta Externa",
    "Hospitalización",
    "Urgencias",
    "Quirófanos",
    "UCI",
    "Laboratorio",
    "Radiología",
    "Farmacia",
    "Administración",
    "Servicios Generales"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.codigo || !formData.tipo) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    const areaData = {
      id: Date.now(),
      ...formData,
      fechaCreacion: new Date().toISOString()
    };

    console.log("Nueva área creada:", areaData);
    alert(`✅ Área "${formData.nombre}" creada exitosamente`);
    
    // Reset form
    setFormData({
      nombre: "",
      codigo: "",
      tipo: "",
      piso: "",
      zona: "",
      responsable: "",
      capacidad: "",
      ubicacion: "",
      descripcion: ""
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      codigo: "",
      tipo: "",
      piso: "",
      zona: "",
      responsable: "",
      capacidad: "",
      ubicacion: "",
      descripcion: ""
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-5xl h-fit max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Crear Nueva Área
          </DialogTitle>
          <DialogDescription>
            Complete la información para crear una nueva área en el hospital
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre del Área *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: Consulta Externa"
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
                placeholder="Ej: CE01"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipo" className="text-sm font-medium">
              Tipo de Área *
            </Label>
            <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar tipo de área" />
              </SelectTrigger>
              <SelectContent>
                {tiposArea.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="zona" className="text-sm font-medium">
                Zona *
              </Label>
              <Select value={formData.zona} onValueChange={(value) => {
                handleInputChange("zona", value);
                // Auto-asignar jefe de zona basado en la zona seleccionada
                const jefesPorZona = {
                  "ZONA MOLANO1": "Dr. Carlos Molano",
                  "ZONA CRISTIAN": "Dr. Cristian Pérez",
                  "ZONA SALUD1": "Dra. María Salud",
                  "ZONA NORTE": "Dr. Roberto Norte",
                  "ZONA SUR": "Dra. Ana Sur",
                  "ZONA CENTRAL": "Dr. Luis Central"
                };
                handleInputChange("jefeZona", jefesPorZona[value] || "");
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZONA MOLANO1">ZONA MOLANO1</SelectItem>
                  <SelectItem value="ZONA CRISTIAN">ZONA CRISTIAN</SelectItem>
                  <SelectItem value="ZONA SALUD1">ZONA SALUD1</SelectItem>
                  <SelectItem value="ZONA NORTE">ZONA NORTE</SelectItem>
                  <SelectItem value="ZONA SUR">ZONA SUR</SelectItem>
                  <SelectItem value="ZONA CENTRAL">ZONA CENTRAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="jefeZona" className="text-sm font-medium">
                Jefe de Zona (Auto-asignado)
              </Label>
              <Input
                id="jefeZona"
                value={formData.jefeZona}
                disabled
                className="mt-1 bg-gray-100"
                placeholder="Se asigna automáticamente según la zona"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsable" className="text-sm font-medium">
                Responsable del Área
              </Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => handleInputChange("responsable", e.target.value)}
                placeholder="Nombre del responsable del área"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="capacidad" className="text-sm font-medium">
                Capacidad
              </Label>
              <Input
                id="capacidad"
                type="number"
                value={formData.capacidad}
                onChange={(e) => handleInputChange("capacidad", e.target.value)}
                placeholder="Número de personas"
                className="mt-1"
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
              placeholder="Piso, bloque, etc."
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
              placeholder="Descripción del área..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t mt-8">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-2" />
              Crear Área
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
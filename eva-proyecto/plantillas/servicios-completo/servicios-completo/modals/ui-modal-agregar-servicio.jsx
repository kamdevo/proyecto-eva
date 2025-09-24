"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UIModalAgregarServicio({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    zona: "",
    piso: "",
    centroCosto: "",
    sede: "",
    area: "",
    equiposAsociados: 0,
    areasAsociadas: 0,
    descripcion: "",
    responsable: "",
    telefono: "",
    email: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para agregar el servicio
    console.log("Agregando servicio:", formData)
    onClose()
    // Resetear formulario
    setFormData({
      nombre: "",
      zona: "",
      piso: "",
      centroCosto: "",
      sede: "",
      area: "",
      equiposAsociados: 0,
      areasAsociadas: 0,
      descripcion: "",
      responsable: "",
      telefono: "",
      email: ""
    })
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-teal-500 pb-2">
            Agregar
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicio</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del servicio */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                Nombre del servicio
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="INGRESE SERVICIO"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Zona */}
            <div className="space-y-2">
              <Label htmlFor="zona" className="text-sm font-medium text-gray-700">
                Zona
              </Label>
              <Select onValueChange={(value) => handleInputChange("zona", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="N/R" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZONA MOLANO1">ZONA MOLANO1</SelectItem>
                  <SelectItem value="ZONA CRISTIAN">ZONA CRISTIAN</SelectItem>
                  <SelectItem value="ZONA SALUD1">ZONA SALUD1</SelectItem>
                  <SelectItem value="ZONA NORTE">ZONA NORTE</SelectItem>
                  <SelectItem value="ZONA CENTRAL">ZONA CENTRAL</SelectItem>
                  <SelectItem value="ZONA SUR">ZONA SUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Piso */}
            <div className="space-y-2">
              <Label htmlFor="piso" className="text-sm font-medium text-gray-700">
                Piso
              </Label>
              <Select onValueChange={(value) => handleInputChange("piso", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="N/R" />
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

            {/* Centro de costo */}
            <div className="space-y-2">
              <Label htmlFor="centroCosto" className="text-sm font-medium text-gray-700">
                Centro de costo
              </Label>
              <Select onValueChange={(value) => handleInputChange("centroCosto", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ADMINISTRACION UES URGENCIAS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRACION UES URGENCIAS">ADMINISTRACION UES URGENCIAS</SelectItem>
                  <SelectItem value="ALMACEN GENERAL">ALMACEN GENERAL</SelectItem>
                  <SelectItem value="GINECOBSTETRICIA">GINECOBSTETRICIA</SelectItem>
                  <SelectItem value="INVENTARIOS">INVENTARIOS</SelectItem>
                  <SelectItem value="HEMODINAMIA">HEMODINAMIA</SelectItem>
                  <SelectItem value="CARDIOLOGIA">CARDIOLOGIA</SelectItem>
                  <SelectItem value="CIRUGIA GENERAL">CIRUGIA GENERAL</SelectItem>
                  <SelectItem value="LABORATORIO">LABORATORIO</SelectItem>
                  <SelectItem value="IMAGENOLOGIA">IMAGENOLOGIA</SelectItem>
                  <SelectItem value="UCI">UCI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sede */}
            <div className="space-y-2">
              <Label htmlFor="sede" className="text-sm font-medium text-gray-700">
                Sede
              </Label>
              <Select onValueChange={(value) => handleInputChange("sede", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HUV EVARISTO GARCÍA - SEDE PRINCIPAL">HUV EVARISTO GARCÍA - SEDE PRINCIPAL</SelectItem>
                  <SelectItem value="HUV NORTE">HUV NORTE</SelectItem>
                  <SelectItem value="HUV CARTAGO">HUV CARTAGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Área */}
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                Área
              </Label>
              <Select onValueChange={(value) => handleInputChange("area", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTA EXTERNA">CONSULTA EXTERNA</SelectItem>
                  <SelectItem value="HOSPITALIZACION">HOSPITALIZACIÓN</SelectItem>
                  <SelectItem value="URGENCIAS">URGENCIAS</SelectItem>
                  <SelectItem value="QUIROFANOS">QUIRÓFANOS</SelectItem>
                  <SelectItem value="UCI">UCI</SelectItem>
                  <SelectItem value="LABORATORIO">LABORATORIO</SelectItem>
                  <SelectItem value="RADIOLOGIA">RADIOLOGÍA</SelectItem>
                  <SelectItem value="FARMACIA">FARMACIA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Equipos Asociados */}
              <div className="space-y-2">
                <Label htmlFor="equiposAsociados" className="text-sm font-medium text-gray-700">
                  Equipos Asociados
                </Label>
                <Input
                  id="equiposAsociados"
                  type="number"
                  min="0"
                  value={formData.equiposAsociados}
                  onChange={(e) => handleInputChange("equiposAsociados", parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>

              {/* Áreas Asociadas */}
              <div className="space-y-2">
                <Label htmlFor="areasAsociadas" className="text-sm font-medium text-gray-700">
                  Áreas Asociadas
                </Label>
                <Input
                  id="areasAsociadas"
                  type="number"
                  min="0"
                  value={formData.areasAsociadas}
                  onChange={(e) => handleInputChange("areasAsociadas", parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <Label htmlFor="responsable" className="text-sm font-medium text-gray-700">
                Responsable
              </Label>
              <Input
                id="responsable"
                type="text"
                placeholder="Nombre del responsable"
                value={formData.responsable}
                onChange={(e) => handleInputChange("responsable", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Teléfono */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Número de teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@hospital.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <textarea
                id="descripcion"
                placeholder="Descripción del servicio..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                Insertar
              </Button>

              <Button type="button" variant="outline" onClick={onClose} className="px-6">
                Close
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
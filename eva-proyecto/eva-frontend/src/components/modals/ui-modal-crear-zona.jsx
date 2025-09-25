"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { MapPin } from "lucide-react"

export default function UIModalCrearZona({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    sede: "",
    piso: "",
    jefeZona: "",
    telefono: "",
    email: "",
    descripcion: "",
    estado: "ACTIVA"
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Creando zona:", formData)
    onClose()
    setFormData({
      nombre: "",
      codigo: "",
      sede: "",
      piso: "",
      jefeZona: "",
      telefono: "",
      email: "",
      descripcion: "",
      estado: "ACTIVA"
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
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Crear Zona
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre de la zona *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: ZONA NORTE"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-sm font-medium text-gray-700">
                  Código
                </Label>
                <Input
                  id="codigo"
                  type="text"
                  placeholder="Ej: ZN001"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sede" className="text-sm font-medium text-gray-700">
                  Sede *
                </Label>
                <Select onValueChange={(value) => handleInputChange("sede", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HUV EVARISTO GARCÍA - SEDE PRINCIPAL">HUV EVARISTO GARCÍA - SEDE PRINCIPAL</SelectItem>
                    <SelectItem value="HUV NORTE">HUV NORTE</SelectItem>
                    <SelectItem value="HUV CARTAGO">HUV CARTAGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                  Estado
                </Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVA">ACTIVA</SelectItem>
                    <SelectItem value="INACTIVA">INACTIVA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción de la zona..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                className="w-full min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 w-full sm:w-auto">
                Crear Zona
              </Button>

              <Button type="button" variant="outline" onClick={onClose} className="px-6 w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
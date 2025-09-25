"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Building } from "lucide-react"

export default function UIModalCrearSede({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    email: "",
    responsable: "",
    descripcion: "",
    estado: "ACTIVA"
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Creando sede:", formData)
    onClose()
    setFormData({
      nombre: "",
      codigo: "",
      direccion: "",
      ciudad: "",
      telefono: "",
      email: "",
      responsable: "",
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
            <Building className="w-4 h-4 text-blue-600" />
            Crear Sede
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre de la sede *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ej: HUV SEDE NORTE"
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
                  placeholder="Ej: HUV-N001"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                Dirección *
              </Label>
              <Input
                id="direccion"
                type="text"
                placeholder="Dirección completa de la sede"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                  Ciudad *
                </Label>
                <Select onValueChange={(value) => handleInputChange("ciudad", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALI">CALI</SelectItem>
                    <SelectItem value="CARTAGO">CARTAGO</SelectItem>
                    <SelectItem value="PALMIRA">PALMIRA</SelectItem>
                    <SelectItem value="BUENAVENTURA">BUENAVENTURA</SelectItem>
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
                    <SelectItem value="EN_CONSTRUCCION">EN CONSTRUCCIÓN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Información de Contacto</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="318 555 0000"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="sede@huv.gov.co"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsable" className="text-sm font-medium text-gray-700">
                  Responsable
                </Label>
                <Input
                  id="responsable"
                  type="text"
                  placeholder="Nombre del responsable de la sede"
                  value={formData.responsable}
                  onChange={(e) => handleInputChange("responsable", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción de la sede..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                className="w-full min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 w-full sm:w-auto">
                Crear Sede
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
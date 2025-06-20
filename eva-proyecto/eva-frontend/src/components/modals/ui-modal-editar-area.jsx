"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UIModalEditarArea({ isOpen, onClose, area }) {
  const [formData, setFormData] = useState({
    nombre: "",
    servicio: "",
    piso: "",
  })

  // Cargar datos del área cuando se abre el modal
  useEffect(() => {
    if (area && isOpen) {
      setFormData({
        nombre: area.nombre || "",
        servicio: area.servicio || "",
        piso: area.piso || "",
      })
    }
  }, [area, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar el área
    console.log("Actualizando área:", formData)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-teal-500 pb-2">
            Editar
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Área</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del área */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                Nombre del área
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Servicio al que pertenece */}
            <div className="space-y-2">
              <Label htmlFor="servicio" className="text-sm font-medium text-gray-700">
                Servicio al que pertenece
              </Label>
              <Select value={formData.servicio} onValueChange={(value) => handleInputChange("servicio", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACONDICIONAMIENTO FISICO">ACONDICIONAMIENTO FISICO</SelectItem>
                  <SelectItem value="SUBESTACION">SUBESTACION</SelectItem>
                  <SelectItem value="RADIOTERAPIA">RADIOTERAPIA</SelectItem>
                  <SelectItem value="LABORATORIO">LABORATORIO</SelectItem>
                  <SelectItem value="AMBULANCIA CARTAGO">AMBULANCIA CARTAGO</SelectItem>
                  <SelectItem value="MORGUE">MORGUE</SelectItem>
                  <SelectItem value="HEMODINAMIA">HEMODINAMIA</SelectItem>
                  <SelectItem value="COMUNICACIONES">COMUNICACIONES</SelectItem>
                  <SelectItem value="COORDINACION ACADEMICA">COORDINACION ACADEMICA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Piso */}
            <div className="space-y-2">
              <Label htmlFor="piso" className="text-sm font-medium text-gray-700">
                Piso
              </Label>
              <Select value={formData.piso} onValueChange={(value) => handleInputChange("piso", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PISO1">PISO1</SelectItem>
                  <SelectItem value="PISO2">PISO2</SelectItem>
                  <SelectItem value="PISO3">PISO3</SelectItem>
                  <SelectItem value="PISO4">PISO4</SelectItem>
                  <SelectItem value="N/R">N/R</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 w-full sm:w-auto">
                Actualizar
              </Button>

              <Button type="button" variant="outline" onClick={onClose} className="px-6 w-full sm:w-auto">
                Close
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

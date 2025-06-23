"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UIModalAgregarArea({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    servicio: "",
    piso: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para agregar el área
    console.log("Agregando área:", formData)
    onClose()
    // Resetear formulario
    setFormData({
      nombre: "",
      servicio: "",
      piso: "",
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
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-teal-500 pb-2">
            Agregar
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
                placeholder="INGRESE AREA"
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
              <Select onValueChange={(value) => handleInputChange("servicio", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="----------" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acondicionamiento-fisico">ACONDICIONAMIENTO FISICO</SelectItem>
                  <SelectItem value="subestacion">SUBESTACION</SelectItem>
                  <SelectItem value="radioterapia">RADIOTERAPIA</SelectItem>
                  <SelectItem value="laboratorio">LABORATORIO</SelectItem>
                  <SelectItem value="ambulancia-cartago">AMBULANCIA CARTAGO</SelectItem>
                  <SelectItem value="morgue">MORGUE</SelectItem>
                  <SelectItem value="hemodinamia">HEMODINAMIA</SelectItem>
                  <SelectItem value="comunicaciones">COMUNICACIONES</SelectItem>
                  <SelectItem value="coordinacion-academica">COORDINACION ACADEMICA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Piso */}
            <div className="space-y-2">
              <Label htmlFor="piso" className="text-sm font-medium text-gray-700">
                Piso
              </Label>
              <Select onValueChange={(value) => handleInputChange("piso", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="N/R" />
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
                Insertar
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

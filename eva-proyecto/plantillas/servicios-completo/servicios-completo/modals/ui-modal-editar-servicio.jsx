"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UIModalEditarServicio({ isOpen, onClose, servicio }) {
  const [formData, setFormData] = useState({
    nombre: "",
    zona: "",
    piso: "",
    centroCosto: "",
    sede: "",
  })

  // Cargar datos del servicio cuando se abre el modal
  useEffect(() => {
    if (servicio && isOpen) {
      setFormData({
        nombre: servicio.nombre || "",
        zona: servicio.zona || "",
        piso: servicio.piso || "",
        centroCosto: servicio.centroCosto || "",
        sede: servicio.sede || "",
      })
    }
  }, [servicio, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica para actualizar el servicio
    console.log("Actualizando servicio:", formData)
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-teal-500 pb-2">
            Editar
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
              <Select value={formData.zona} onValueChange={(value) => handleInputChange("zona", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZONA MOLANO1">ZONA MOLANO1</SelectItem>
                  <SelectItem value="ZONA CRISTIAN">ZONA CRISTIAN</SelectItem>
                  <SelectItem value="ZONA SALUD1">ZONA SALUD1</SelectItem>
                  <SelectItem value="N/R">N/R</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Piso */}
            <div className="space-y-2">
              <Label htmlFor="piso" className="text-sm font-medium text-gray-700">
                Piso
              </Label>
              <Select value={formData.piso} onValueChange={(value) => handleInputChange("piso", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PISO1">PISO 1</SelectItem>
                  <SelectItem value="PISO2">PISO 2</SelectItem>
                  <SelectItem value="PISO3">PISO 3</SelectItem>
                  <SelectItem value="N/R">N/R</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Centro de costo */}
            <div className="space-y-2">
              <Label htmlFor="centroCosto" className="text-sm font-medium text-gray-700">
                Centro de costo
              </Label>
              <Select value={formData.centroCosto} onValueChange={(value) => handleInputChange("centroCosto", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRACION UES URGENCIAS">ADMINISTRACION UES URGENCIAS</SelectItem>
                  <SelectItem value="ALMACEN GENERAL">ALMACEN GENERAL</SelectItem>
                  <SelectItem value="GINECOBSTETRICIA">GINECOBSTETRICIA</SelectItem>
                  <SelectItem value="INVENTARIOS">INVENTARIOS</SelectItem>
                  <SelectItem value="HEMODINAMIA">HEMODINAMIA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sede */}
            <div className="space-y-2">
              <Label htmlFor="sede" className="text-sm font-medium text-gray-700">
                Sede
              </Label>
              <Select value={formData.sede} onValueChange={(value) => handleInputChange("sede", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDE PRINCIPAL">SEDE PRINCIPAL</SelectItem>
                  <SelectItem value="NORTE">NORTE</SelectItem>
                  <SelectItem value="CARTAGO">CARTAGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                Actualizar
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
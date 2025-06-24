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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                  <SelectItem value="zona-molano1">ZONA MOLANO1</SelectItem>
                  <SelectItem value="zona-cristian">ZONA CRISTIAN</SelectItem>
                  <SelectItem value="zona-salud1">ZONA SALUD1</SelectItem>
                  <SelectItem value="nr">N/R</SelectItem>
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
                  <SelectItem value="piso1">PISO 1</SelectItem>
                  <SelectItem value="piso2">PISO 2</SelectItem>
                  <SelectItem value="piso3">PISO 3</SelectItem>
                  <SelectItem value="nr">N/R</SelectItem>
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
                  <SelectItem value="admin-urgencias">ADMINISTRACION UES URGENCIAS</SelectItem>
                  <SelectItem value="almacen-general">ALMACEN GENERAL</SelectItem>
                  <SelectItem value="ginecobstetricia">GINECOBSTETRICIA</SelectItem>
                  <SelectItem value="inventarios">INVENTARIOS</SelectItem>
                  <SelectItem value="hemodinamia">HEMODINAMIA</SelectItem>
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
                  <SelectValue placeholder="CARTAGO" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sede-principal">SEDE PRINCIPAL</SelectItem>
                  <SelectItem value="norte">NORTE</SelectItem>
                  <SelectItem value="cartago">CARTAGO</SelectItem>
                </SelectContent>
              </Select>
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

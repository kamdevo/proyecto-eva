"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Edit } from "lucide-react"

export default function UIModalEditarContacto({ isOpen, onClose, contacto }) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "PROVEEDOR",
    direccion: "",
    ciudad: "",
    pais: "Colombia",
    nit: "",
    contactoPrincipal: "",
    estado: "ACTIVO"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (contacto && isOpen) {
      setFormData({
        nombre: contacto.nombre || "",
        email: contacto.email || "",
        telefono: contacto.telefono || "",
        tipo: contacto.tipo || "PROVEEDOR",
        direccion: contacto.direccion || "",
        ciudad: contacto.ciudad || "",
        pais: contacto.pais || "Colombia",
        nit: contacto.nit || "",
        contactoPrincipal: contacto.contactoPrincipal || "",
        estado: contacto.estado || "ACTIVO"
      })
    }
  }, [contacto, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Actualizando contacto:", formData)
      onClose()
    } catch (error) {
      console.error("Error al actualizar contacto:", error)
    } finally {
      setIsSubmitting(false)
    }
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
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Edit className="w-4 h-4 text-blue-600" />
            Editar Contacto
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre *
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

              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
                  Tipo *
                </Label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
                    <SelectItem value="FABRICANTE">FABRICANTE</SelectItem>
                    <SelectItem value="REPRESENTANTE">REPRESENTANTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nit" className="text-sm font-medium text-gray-700">
                  NIT/Documento
                </Label>
                <Input
                  id="nit"
                  type="text"
                  value={formData.nit}
                  onChange={(e) => handleInputChange("nit", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactoPrincipal" className="text-sm font-medium text-gray-700">
                  Contacto Principal
                </Label>
                <Input
                  id="contactoPrincipal"
                  type="text"
                  value={formData.contactoPrincipal}
                  onChange={(e) => handleInputChange("contactoPrincipal", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">
                Dirección
              </Label>
              <Input
                id="direccion"
                type="text"
                value={formData.direccion}
                onChange={(e) => handleInputChange("direccion", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                  Ciudad
                </Label>
                <Input
                  id="ciudad"
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange("ciudad", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais" className="text-sm font-medium text-gray-700">
                  País
                </Label>
                <Select value={formData.pais} onValueChange={(value) => handleInputChange("pais", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Colombia">Colombia</SelectItem>
                    <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                    <SelectItem value="Alemania">Alemania</SelectItem>
                    <SelectItem value="Bélgica">Bélgica</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                  Estado
                </Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                    <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="px-6" disabled={isSubmitting}>
                Cancelar
              </Button>

              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Textarea } from "../../ui/textarea"
import { MapPin } from "lucide-react"

export default function UIModalAgregarZona({ isOpen, onClose }) {
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

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Agregando zona:", formData)
      
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
      onClose()
    } catch (error) {
      console.error("Error al agregar zona:", error)
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
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[80vh] overflow-y-auto mx-4">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Agregar Zona
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3">
                <Input
                  placeholder="Nombre de la zona *"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Código *"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value.toUpperCase())}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2">
                <Select onValueChange={(value) => handleInputChange("sede", value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sede *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HUV EVARISTO GARCÍA - SEDE PRINCIPAL">HUV PRINCIPAL</SelectItem>
                    <SelectItem value="HUV NORTE">HUV NORTE</SelectItem>
                    <SelectItem value="HUV CARTAGO">HUV CARTAGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  placeholder="Piso"
                  value={formData.piso}
                  onChange={(e) => handleInputChange("piso", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVA">ACTIVA</SelectItem>
                    <SelectItem value="INACTIVA">INACTIVA</SelectItem>
                    <SelectItem value="MANTENIMIENTO">MANTTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  placeholder="Jefe de Zona *"
                  value={formData.jefeZona}
                  onChange={(e) => handleInputChange("jefeZona", e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Input
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Textarea
                placeholder="Descripción (opcional)..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                className="w-full h-12 resize-none text-xs"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="h-8 px-3 text-xs flex-1" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="h-8 px-3 text-xs flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
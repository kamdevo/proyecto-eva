"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Textarea } from "../../ui/textarea"
import { Edit } from "lucide-react"

export default function UIModalEditarArea({ isOpen, onClose, area }) {
  const [formData, setFormData] = useState({
    nombre: "",
    servicio: "",
    sede: "",
    piso: "",
    zona: "",
    responsable: "",
    telefono: "",
    email: "",
    capacidad: "",
    descripcion: "",
    estado: "ACTIVA"
  })

  useEffect(() => {
    if (area && isOpen) {
      setFormData({
        nombre: area.nombre || "",
        servicio: area.servicio || "",
        sede: area.sede || "",
        piso: area.piso || "",
        zona: area.zona || "",
        responsable: area.responsable || "",
        telefono: area.telefono || "",
        email: area.email || "",
        capacidad: area.capacidad || "",
        descripcion: area.descripcion || "",
        estado: area.estado || "ACTIVA"
      })
    }
  }, [area, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
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
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 flex items-center gap-2">
            <Edit className="w-4 h-4 text-blue-600" />
            Editar Área
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                  Nombre del área *
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
                    <SelectItem value="MANTENIMIENTO">MANTENIMIENTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicio" className="text-sm font-medium text-gray-700">
                  Servicio al que pertenece *
                </Label>
                <Select value={formData.servicio} onValueChange={(value) => handleInputChange("servicio", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACONDICIONAMIENTO FISICO">ACONDICIONAMIENTO FISICO</SelectItem>
                    <SelectItem value="SUBESTACION ELECTRICA">SUBESTACION ELECTRICA</SelectItem>
                    <SelectItem value="RADIOTERAPIA">RADIOTERAPIA</SelectItem>
                    <SelectItem value="LABORATORIO CLINICO">LABORATORIO CLINICO</SelectItem>
                    <SelectItem value="AMBULANCIA CARTAGO">AMBULANCIA CARTAGO</SelectItem>
                    <SelectItem value="MORGUE">MORGUE</SelectItem>
                    <SelectItem value="HEMODINAMIA">HEMODINAMIA</SelectItem>
                    <SelectItem value="COMUNICACIONES">COMUNICACIONES</SelectItem>
                    <SelectItem value="COORDINACION ACADEMICA">COORDINACION ACADEMICA</SelectItem>
                    <SelectItem value="CONSULTA EXTERNA">CONSULTA EXTERNA</SelectItem>
                    <SelectItem value="CIRUGIA GENERAL">CIRUGIA GENERAL</SelectItem>
                    <SelectItem value="UNIDAD CUIDADOS INTENSIVOS">UNIDAD CUIDADOS INTENSIVOS</SelectItem>
                    <SelectItem value="FARMACIA">FARMACIA</SelectItem>
                    <SelectItem value="IMAGENOLOGIA">IMAGENOLOGIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sede" className="text-sm font-medium text-gray-700">
                  Sede *
                </Label>
                <Select value={formData.sede} onValueChange={(value) => handleInputChange("sede", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HUV EVARISTO GARCÍA - SEDE PRINCIPAL">HUV EVARISTO GARCÍA - SEDE PRINCIPAL</SelectItem>
                    <SelectItem value="HUV NORTE">HUV NORTE</SelectItem>
                    <SelectItem value="HUV CARTAGO">HUV CARTAGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="piso" className="text-sm font-medium text-gray-700">
                  Piso
                </Label>
                <Select value={formData.piso} onValueChange={(value) => handleInputChange("piso", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PISO 1">PISO 1</SelectItem>
                    <SelectItem value="PISO 2">PISO 2</SelectItem>
                    <SelectItem value="PISO 3">PISO 3</SelectItem>
                    <SelectItem value="PISO 4">PISO 4</SelectItem>
                    <SelectItem value="PISO 5">PISO 5</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zona" className="text-sm font-medium text-gray-700">
                  Zona
                </Label>
                <Select value={formData.zona} onValueChange={(value) => handleInputChange("zona", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Información del Responsable</h4>
              
              <div className="space-y-2">
                <Label htmlFor="responsable" className="text-sm font-medium text-gray-700">
                  Responsable
                </Label>
                <Input
                  id="responsable"
                  type="text"
                  value={formData.responsable}
                  onChange={(e) => handleInputChange("responsable", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Información Adicional</h4>
              
              <div className="space-y-2">
                <Label htmlFor="capacidad" className="text-sm font-medium text-gray-700">
                  Capacidad
                </Label>
                <Input
                  id="capacidad"
                  type="text"
                  value={formData.capacidad}
                  onChange={(e) => handleInputChange("capacidad", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className="w-full min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 w-full sm:w-auto">
                Actualizar
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
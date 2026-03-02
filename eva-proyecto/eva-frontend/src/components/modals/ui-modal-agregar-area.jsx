"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { MapPin } from "lucide-react"
import { toast } from "sonner"

export default function UIModalAgregarArea({ isOpen, onClose, servicios = [], onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    servicio_id: "",
    piso_id: "",
    centro_id: null
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || window.APP_CONFIG?.API_BASE_URL + '/api' || 'http://192.168.2.146:8001/api'}/v1/areas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Área creada exitosamente')
        setFormData({
          name: "",
          servicio_id: "",
          piso_id: "",
          centro_id: null
        })
        if (onSuccess) onSuccess() // Recargar áreas
        onClose()
      } else {
        toast.error(data.message || 'Error al crear área')
      }
    } catch (error) {
      console.error('Error creando área:', error)
      toast.error('Error al crear área')
    } finally {
      setLoading(false)
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
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Agregar Área
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombre del área *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: QUIROFANO 1"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicio_id" className="text-sm font-medium text-gray-700">
                Servicio al que pertenece *
              </Label>
              <Select 
                value={formData.servicio_id} 
                onValueChange={(value) => handleInputChange("servicio_id", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar servicio..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id.toString()}>
                      {servicio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="piso_id" className="text-sm font-medium text-gray-700">
                Piso
              </Label>
              <Select onValueChange={(value) => handleInputChange("piso_id", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar piso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">PISO 1</SelectItem>
                  <SelectItem value="2">PISO 2</SelectItem>
                  <SelectItem value="3">PISO 3</SelectItem>
                  <SelectItem value="4">PISO 4</SelectItem>
                  <SelectItem value="5">PISO 5</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Área'}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="px-6 w-full sm:w-auto"
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
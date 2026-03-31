"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "sonner"
import httpService from "../../services/httpService"
import SearchableSelect from "../ui/searchable-select"
import { Loader2 } from "lucide-react"

export default function UIModalEditarServicio({ isOpen, onClose, servicio }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    piso_id: "",
    zona_id: "",
    centro_id: "",
    sede_id: "",
    is_active: true
  })

  const [options, setOptions] = useState({ sedes: [], zonas: [], pisos: [], centros: [] })
  const [loadingOptions, setLoadingOptions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Cargar opciones dinámicas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoadingOptions(true)
        try {
          // Cargar opciones si no están cargadas
          const resOptions = await httpService.get("/v1/servicios/options")
          if (resOptions.data.success) {
            setOptions(resOptions.data.data)
          }

          // Mapear datos del servicio seleccionado
          if (servicio) {
            setFormData({
              name: servicio.name || "",
              code: servicio.code || "",
              description: servicio.description || "",
              piso_id: servicio.piso_id?.toString() || "",
              zona_id: servicio.zona_id?.toString() || "",
              centro_id: servicio.centro_id?.toString() || "",
              sede_id: servicio.sede_id?.toString() || "",
              is_active: servicio.is_active === 1 || servicio.is_active === true
            })
          }
        } catch (err) {
          console.error("Error al cargar datos:", err)
          toast.error("No se pudieron cargar los datos")
        } finally {
          setLoadingOptions(false)
        }
      }
      fetchData()
    }
  }, [isOpen, servicio])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!servicio?.id) return

    setSubmitting(true)
    try {
      const res = await httpService.put(`/v1/servicios/${servicio.id}`, formData)
      
      if (res.data.success) {
        toast.success("Servicio actualizado correctamente")
        onClose(true) // Cerrar y refrescar
      } else {
        toast.error(res.data.message || "Error al actualizar")
      }
    } catch (err) {
      console.error("Error al guardar:", err)
      toast.error(err.response?.data?.message || "Error en el servidor")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2">
            Editar Servicio: {servicio?.name || ""}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 relative">
          {loadingOptions && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                  Nombre del servicio *
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-sm font-medium text-gray-700">
                  Código
                </Label>
                <Input
                  id="edit-code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-zona_id" className="text-sm font-medium text-gray-700">
                  Zona
                </Label>
                <Select value={formData.zona_id} onValueChange={(value) => handleInputChange("zona_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.zonas.map(z => (
                      <SelectItem key={z.id} value={z.id.toString()}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-piso_id" className="text-sm font-medium text-gray-700">
                  Piso
                </Label>
                <Select value={formData.piso_id} onValueChange={(value) => handleInputChange("piso_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar piso" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.pisos.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-centro_id" className="text-sm font-medium text-gray-700">
                Centro de costo
              </Label>
              <SearchableSelect
                placeholder="Buscar o seleccionar centro de costo..."
                options={options.centros}
                value={formData.centro_id}
                onValueChange={(value) => handleInputChange("centro_id", value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sede_id" className="text-sm font-medium text-gray-700">
                Sede
              </Label>
              <Select value={formData.sede_id} onValueChange={(value) => handleInputChange("sede_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  {options.sedes.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <textarea
                id="edit-description"
                className="w-full min-h-[80px] p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 py-2">
               <input 
                type="checkbox" 
                id="edit-active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
               />
               <Label htmlFor="edit-active" className="text-sm font-medium text-gray-700 cursor-pointer">
                 Servicio Activo
               </Label>
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
              <Button 
                type="submit" 
                disabled={submitting} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl min-w-[140px]"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Guardar Cambios"
                )}
              </Button>

              <Button type="button" variant="outline" onClick={() => onClose(false)} className="px-8 rounded-xl border-slate-200">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
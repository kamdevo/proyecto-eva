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

export default function UIModalAgregarServicio({ isOpen, onClose }) {
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
      const fetchOptions = async () => {
        setLoadingOptions(true)
        try {
          const res = await httpService.get("/v1/servicios/options")
          if (res.data.success) {
            setOptions(res.data.data)
          }
        } catch (err) {
          console.error("Error al cargar opciones:", err)
          toast.error("No se pudieron cargar las opciones de ubicación")
        } finally {
          setLoadingOptions(false)
        }
      }
      fetchOptions()
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await httpService.post("/v1/servicios", formData)
      
      if (res.data.success) {
        toast.success("Servicio creado correctamente")
        onClose(true) // Cerrar y refrescar lista
        resetForm()
      } else {
        toast.error(res.data.message || "Error al crear el servicio")
      }
    } catch (err) {
      console.error("Error al guardar:", err)
      const errorMsg = err.response?.data?.message || "Error en el servidor"
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      piso_id: "",
      zona_id: "",
      centro_id: "",
      sede_id: "",
      is_active: true
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2">
            Agregar Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nombre del servicio *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ej. URGENCIAS ADULTOS"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Código
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ej. SERV-001"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zona_id" className="text-sm font-medium text-gray-700">
                  Zona
                </Label>
                <Select value={formData.zona_id?.toString()} onValueChange={(value) => handleInputChange("zona_id", value)}>
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
                <Label htmlFor="piso_id" className="text-sm font-medium text-gray-700">
                  Piso
                </Label>
                <Select value={formData.piso_id?.toString()} onValueChange={(value) => handleInputChange("piso_id", value)}>
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
              <Label htmlFor="centro_id" className="text-sm font-medium text-gray-700">
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
              <Label htmlFor="sede_id" className="text-sm font-medium text-gray-700">
                Sede
              </Label>
              <Select value={formData.sede_id?.toString()} onValueChange={(value) => handleInputChange("sede_id", value)}>
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
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descripción
              </Label>
              <textarea
                id="description"
                className="w-full min-h-[80px] p-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Detalles adicionales del servicio..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
              <Button 
                type="submit" 
                disabled={submitting} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Crear Servicio"
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
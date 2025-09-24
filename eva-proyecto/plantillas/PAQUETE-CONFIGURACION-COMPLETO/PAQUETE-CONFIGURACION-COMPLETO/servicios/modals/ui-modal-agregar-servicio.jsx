import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

export default function UIModalAgregarServicio({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    zona: "",
    piso: "",
    centroCosto: "",
    sede: "",
    area: "",
    equiposAsociados: 0,
    areasAsociadas: 0,
    descripcion: "",
    responsable: "",
    telefono: "",
    email: ""
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Agregando servicio:", formData)
    onClose()
    setFormData({
      nombre: "",
      zona: "",
      piso: "",
      centroCosto: "",
      sede: "",
      area: "",
      equiposAsociados: 0,
      areasAsociadas: 0,
      descripcion: "",
      responsable: "",
      telefono: "",
      email: ""
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
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                Nombre del servicio *
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zona" className="text-sm font-medium text-gray-700">
                  Zona
                </Label>
                <Select onValueChange={(value) => handleInputChange("zona", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar zona" />
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

              <div className="space-y-2">
                <Label htmlFor="piso" className="text-sm font-medium text-gray-700">
                  Piso
                </Label>
                <Select onValueChange={(value) => handleInputChange("piso", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar piso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PISO 1">PISO 1</SelectItem>
                    <SelectItem value="PISO 2">PISO 2</SelectItem>
                    <SelectItem value="PISO 3">PISO 3</SelectItem>
                    <SelectItem value="PISO 4">PISO 4</SelectItem>
                    <SelectItem value="PISO 5">PISO 5</SelectItem>
                    <SelectItem value="PISO 6">PISO 6</SelectItem>
                    <SelectItem value="PISO 7">PISO 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="centroCosto" className="text-sm font-medium text-gray-700">
                Centro de costo *
              </Label>
              <Select onValueChange={(value) => handleInputChange("centroCosto", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar centro de costo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRACION UES URGENCIAS">ADMINISTRACION UES URGENCIAS</SelectItem>
                  <SelectItem value="ALMACEN GENERAL">ALMACEN GENERAL</SelectItem>
                  <SelectItem value="GINECOBSTETRICIA">GINECOBSTETRICIA</SelectItem>
                  <SelectItem value="INVENTARIOS">INVENTARIOS</SelectItem>
                  <SelectItem value="HEMODINAMIA">HEMODINAMIA</SelectItem>
                  <SelectItem value="CARDIOLOGIA">CARDIOLOGIA</SelectItem>
                  <SelectItem value="CIRUGIA GENERAL">CIRUGIA GENERAL</SelectItem>
                  <SelectItem value="LABORATORIO">LABORATORIO</SelectItem>
                  <SelectItem value="IMAGENOLOGIA">IMAGENOLOGIA</SelectItem>
                  <SelectItem value="UCI">UCI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sede" className="text-sm font-medium text-gray-700">
                Sede *
              </Label>
              <Select onValueChange={(value) => handleInputChange("sede", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HUV EVARISTO GARCÍA - SEDE PRINCIPAL">HUV EVARISTO GARCÍA - SEDE PRINCIPAL</SelectItem>
                  <SelectItem value="HUV NORTE">HUV NORTE</SelectItem>
                  <SelectItem value="HUV CARTAGO">HUV CARTAGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equiposAsociados" className="text-sm font-medium text-gray-700">
                  Equipos Asociados
                </Label>
                <Input
                  id="equiposAsociados"
                  type="number"
                  min="0"
                  value={formData.equiposAsociados}
                  onChange={(e) => handleInputChange("equiposAsociados", parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areasAsociadas" className="text-sm font-medium text-gray-700">
                  Áreas Asociadas
                </Label>
                <Input
                  id="areasAsociadas"
                  type="number"
                  min="0"
                  value={formData.areasAsociadas}
                  onChange={(e) => handleInputChange("areasAsociadas", parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6">
                Crear Servicio
              </Button>

              <Button type="button" variant="outline" onClick={onClose} className="px-6">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, X } from "lucide-react"

export default function UIModalEditarPropietario({ isOpen, onClose, propietario }) {
  const [formData, setFormData] = useState({
    nombre: "",
    logo: null,
  })

  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Actualizando propietario:", formData)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleInputChange("logo", e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange("logo", e.target.files[0])
    }
  }

  useEffect(() => {
    if (propietario && isOpen) {
      setFormData({
        nombre: propietario.nombre || "",
        logo: null,
      })
    }
  }, [propietario, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 flex-1">
              Editar Propietario
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del propietario */}
            <div className="space-y-3">
              <Label htmlFor="nombre" className="text-base font-semibold text-gray-700">
                Nombre del propietario
              </Label>
              <Input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-base"
                required
              />
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-700">Logo</Label>
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">Arrastra y suelta archivos aquí</p>
                    <p className="text-sm text-gray-500 mb-4">(o haz clic para seleccionar archivo)</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="file"
                      id="logo-upload-edit"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo-upload-edit").click()}
                      className="rounded-xl border-gray-300 hover:bg-gray-50 px-6 py-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar Archivo
                    </Button>
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 py-2"
                      onClick={() => document.getElementById("logo-upload-edit").click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Explorar...
                    </Button>
                  </div>

                  {formData.logo && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-700 font-medium">✓ Archivo seleccionado: {formData.logo.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-8 py-3 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Actualizar Propietario
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-gray-300 hover:bg-gray-50 px-8 py-3 font-semibold text-base"
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

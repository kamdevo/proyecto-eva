"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X } from "lucide-react"

export function DocumentUploadModal({ open, onOpenChange, equipment }) {
  const [uploadMethod, setUploadMethod] = useState("simple") // "simple" or "dragdrop"
  const [selectedFiles, setSelectedFiles] = useState([])

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const SimpleUpload = () => (
    <div className="space-y-4 p-3 sm:p-4 md:p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800">DOCUMENTACIÓN DEL EQUIPO</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <div>
          <Label htmlFor="file-type" className="text-xs sm:text-sm">
            Tipo de archivo:
          </Label>
          <Select>
            <SelectTrigger className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="certificado">Certificado</SelectItem>
              <SelectItem value="reporte">Reporte</SelectItem>
              <SelectItem value="guia">Guía</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="actions" className="text-xs sm:text-sm">
            Acciones:
          </Label>
          <div className="flex gap-2 mt-1">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white flex-1 text-xs sm:text-sm">
              <Upload className="h-4 w-4 mr-2" />
              Subir
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white flex-1 text-xs sm:text-sm">
              <X className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="file-input" className="text-xs sm:text-sm">
          Seleccionar archivo:
        </Label>
        <Input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm" />
      </div>
    </div>
  )

  const DragDropUpload = () => (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 md:p-12 text-center hover:border-blue-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400" />
          </div>
          <div>
            <p className="text-lg text-gray-600">Drag & drop files here</p>
            <p className="text-sm text-gray-500">or click to select files</p>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById("hidden-file-input").click()}
              className="text-xs sm:text-sm">
              Browse
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm">Upload</Button>
          </div>
        </div>
      </div>

      <input
        id="hidden-file-input"
        type="file"
        multiple
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden" />

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Subir Documentación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Upload Method Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={uploadMethod === "simple" ? "default" : "outline"}
              onClick={() => setUploadMethod("simple")}
              className="flex-1 text-xs sm:text-sm">
              Subida Simple
            </Button>
            <Button
              variant={uploadMethod === "dragdrop" ? "default" : "outline"}
              onClick={() => setUploadMethod("dragdrop")}
              className="flex-1 text-xs sm:text-sm">
              Arrastrar y Soltar
            </Button>
          </div>

          {/* Equipment Info */}
          {equipment && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Equipo Seleccionado:</h3>
              <p className="text-sm text-blue-700">
                <strong>ID:</strong> {equipment.equipo.code} - <strong>Nombre:</strong> {equipment.equipo.name}
              </p>
            </div>
          )}

          {/* Upload Interface */}
          {uploadMethod === "simple" ? <SimpleUpload /> : <DragDropUpload />}
        </div>

        <div className="flex justify-between p-4 border-t">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
            disabled={selectedFiles.length === 0}>
            <Upload className="h-4 w-4 mr-2" />
            Subir Archivos ({selectedFiles.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs sm:text-sm">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, AlertCircle, Upload, ImageIcon, Video, XCircle } from "lucide-react"

export function AgregarObservacionModal({ open, onOpenChange, equipo }) {
  const [observacion, setObservacion] = useState("")
  const [prioridad, setPrioridad] = useState("")
  const [fechaLimite, setFechaLimite] = useState("")
  const [responsable, setResponsable] = useState("")
  const [evidencias, setEvidencias] = useState([])
  const [dragActive, setDragActive] = useState(false)

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

    const files = Array.from(e.dataTransfer.files)
    setEvidencias((prev) => [...prev, ...files])
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setEvidencias((prev) => [...prev, ...files])
  }

  const removeEvidencia = (index) => {
    setEvidencias((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />;
    if (file.type.startsWith("video/")) return <Video className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />;
    return <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Agregando observación:", {
      observacion,
      prioridad,
      fechaLimite,
      responsable,
      evidencias,
      equipoId: equipo?.id,
    })
    onOpenChange(false)
    // Limpiar formulario
    setObservacion("")
    setPrioridad("")
    setFechaLimite("")
    setResponsable("")
    setEvidencias([])
  }

  if (!equipo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-200 pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-800">Agregar Observación</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-slate-100">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <div
            className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 sm:mt-3"></div>
        </DialogHeader>

        <div className="py-4 sm:py-6">
          {/* Información del equipo */}
          <div
            className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="font-medium text-slate-800 text-sm sm:text-base">Información del Equipo</span>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div>
                <span className="font-medium text-slate-600">ID:</span>
                <span className="ml-2 text-slate-900">#{equipo.id}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Equipo:</span>
                <span className="ml-2 text-slate-900">{equipo.equipo}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Código:</span>
                <span className="ml-2 text-slate-900">{equipo.codigo}</span>
              </div>
              <div>
                <span className="font-medium text-slate-600">Responsable:</span>
                <span className="ml-2 text-slate-900">{equipo.responsable}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <Label
                htmlFor="observacion"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Observación *
              </Label>
              <Textarea
                id="observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Describa detalladamente la observación sobre el mantenimiento del equipo..."
                className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2 sm:space-y-3">
                <Label
                  htmlFor="prioridad"
                  className="text-xs sm:text-sm font-medium text-slate-700">
                  Prioridad *
                </Label>
                <Select value={prioridad} onValueChange={setPrioridad} required>
                  <SelectTrigger className="h-8 sm:h-10 bg-slate-50 border-slate-300 text-xs sm:text-sm">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">🟢 Baja</SelectItem>
                    <SelectItem value="media">🟡 Media</SelectItem>
                    <SelectItem value="alta">🟠 Alta</SelectItem>
                    <SelectItem value="critica">🔴 Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label
                  htmlFor="fechaLimite"
                  className="text-xs sm:text-sm font-medium text-slate-700">
                  Fecha Límite
                </Label>
                <Input
                  id="fechaLimite"
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  className="h-8 sm:h-10 bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label
                htmlFor="responsable"
                className="text-xs sm:text-sm font-medium text-slate-700">
                Responsable de Seguimiento
              </Label>
              <Select value={responsable} onValueChange={setResponsable}>
                <SelectTrigger className="h-8 sm:h-10 bg-slate-50 border-slate-300 text-xs sm:text-sm">
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingenieros-biomedicos">Ingenieros Biomédicos</SelectItem>
                  <SelectItem value="j-restrepo">J. Restrepo</SelectItem>
                  <SelectItem value="sysmed">SYSMED</SelectItem>
                  <SelectItem value="mantenimiento">Departamento de Mantenimiento</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Evidencias */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium text-slate-700">Evidencias (Fotos/Videos)</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}>
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-slate-500 text-xs sm:text-sm mb-1">Arrastra fotos y videos aquí</div>
                <div className="text-slate-400 text-xs">o haz clic para seleccionar</div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-7 sm:h-8 text-xs sm:text-sm"
                  asChild>
                  <label htmlFor="evidencia-upload" className="cursor-pointer">
                    Seleccionar Archivos
                    <input
                      id="evidencia-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileSelect} />
                  </label>
                </Button>
              </div>

              {/* Lista de evidencias */}
              {evidencias.length > 0 && (
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-slate-700">
                    Archivos seleccionados ({evidencias.length})
                  </Label>
                  <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-1">
                    {evidencias.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">{file.name}</div>
                          <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvidencia(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 w-5 h-5 sm:w-6 sm:h-6 p-0">
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-800">
                  <strong>Nota:</strong> Esta observación se registrará en el historial del equipo y será visible para
                  todos los usuarios con acceso al sistema de mantenimiento.
                </div>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-medium border-slate-300 hover:bg-slate-50">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Agregar Observación
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, FileText, FileSpreadsheet, Download, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExportPlantillaModal({ open, onOpenChange }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [plantillaType, setPlantillaType] = useState("excel")
  const [uploadType, setUploadType] = useState("llenar-datos")

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

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      setSelectedFile(files[0])
    }
  }

  const handleDownloadTemplate = () => {
    console.log("Descargando plantilla:", plantillaType)
    // Aquí iría la lógica para descargar la plantilla
  }

  const handleUploadFile = () => {
    if (selectedFile) {
      console.log("Subiendo archivo:", selectedFile.name)
      console.log("Tipo de carga:", uploadType)
      // Aquí iría la lógica para procesar el archivo
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">Exportar Plantilla</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div
            className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          <Tabs defaultValue="descargar" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="descargar">Descargar Plantilla</TabsTrigger>
              <TabsTrigger value="subir">Subir Archivo</TabsTrigger>
            </TabsList>

            {/* Tab: Descargar Plantilla */}
            <TabsContent value="descargar" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800">Descargar Plantilla Vacía</h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Información:</strong> Descarga una plantilla vacía para llenar con los datos de
                      mantenimiento preventivo. La plantilla incluye todas las columnas necesarias y el formato
                      correcto.
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium text-slate-800">Tipo de Plantilla</Label>
                  <Select value={plantillaType} onValueChange={setPlantillaType}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          Excel (.xlsx) - Plantilla con formato
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          CSV (.csv) - Plantilla básica
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-800 mb-2">La plantilla incluye:</h4>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>Columnas para ID del equipo, meses de mantenimiento</li>
                    <li>Campo para responsable del mantenimiento</li>
                    <li>Frecuencia de mantenimiento (anual, semestral, etc.)</li>
                    <li>Formato y validaciones predefinidas</li>
                    <li>Instrucciones de llenado en la primera fila</li>
                  </ul>
                </div>

                <Button
                  onClick={handleDownloadTemplate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Plantilla {plantillaType.toUpperCase()}
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Subir Archivo */}
            <TabsContent value="subir" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-800">Subir Archivo de Datos</h3>

                <div className="space-y-3">
                  <Label className="text-base font-medium text-slate-800">Tipo de Carga</Label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llenar-datos">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-green-600" />
                          Llenar datos de la tabla (Excel/CSV)
                        </div>
                      </SelectItem>
                      <SelectItem value="subir-pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-600" />
                          Subir documento PDF
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {uploadType === "llenar-datos" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <strong>Llenar datos:</strong> Sube un archivo Excel o CSV con los datos de mantenimiento. Los
                        datos se procesarán y llenarán automáticamente la tabla del cronograma.
                      </div>
                    </div>
                  </div>
                )}

                {uploadType === "subir-pdf" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <strong>Subir PDF:</strong> Sube un documento PDF con el cronograma de mantenimiento. El archivo
                        se almacenará y estará disponible para consulta.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-base font-medium text-slate-800">Archivo</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <div className="text-slate-500 mb-2">
                      {selectedFile ? (
                        <div className="text-green-600 font-medium">Archivo seleccionado: {selectedFile.name}</div>
                      ) : (
                        <>
                          <div className="text-lg mb-1">Arrastra y suelta tu archivo aquí</div>
                          <div className="text-sm">
                            o haz clic para seleccionar
                            {uploadType === "llenar-datos" ? " (Excel, CSV)" : " (PDF)"}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="flex-1" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Seleccionar Archivo
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept={uploadType === "llenar-datos" ? ".xlsx,.xls,.csv" : ".pdf"}
                          onChange={handleFileSelect} />
                      </label>
                    </Button>
                    {selectedFile && (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-700">
                        Limpiar
                      </Button>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        {uploadType === "llenar-datos" ? (
                          <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-red-600" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{selectedFile.name}</div>
                          <div className="text-sm text-slate-600">
                            Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUploadFile}
                  disabled={!selectedFile}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 disabled:opacity-50">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadType === "llenar-datos" ? "Procesar y Llenar Datos" : "Subir Documento PDF"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function MonthModal({ open, onOpenChange }) {
  const handleDownload = () => {
    // Simulate Excel download
    const link = document.createElement("a")
    link.href = "#"
    link.download = "registro_equipos_biomedicos.xlsx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            📅 Descarga Mensual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4 text-center">
          <div className="flex justify-center">
            <div className="bg-green-100 p-6 rounded-full">
              <Download className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Descarga el registro de equipos biomédicos</h3>
            <p className="text-sm text-gray-600">
              No cuenta con imágenes porque descarga un archivo tipo Excel con todos los datos de los equipos
              registrados en el sistema.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Descargar Excel
            </Button>

            <div className="text-xs text-gray-500">
              El archivo incluye: Equipos, ubicaciones, estados, mantenimientos y más.
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

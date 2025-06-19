import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, X, FileText, AlertTriangle } from "lucide-react"

export function DownloadAllPdfModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">
              Descargar Contingencias
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4">
          <div className="space-y-4">
            <div
              className="flex items-start gap-3 p-3 sm:p-4 border border-orange-200 rounded-lg bg-orange-50">
              <AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-orange-900 text-sm sm:text-base">Descargar Reporte Completo</div>
                <div className="text-xs sm:text-sm text-orange-700 mt-1">
                  Se generará un PDF con todas las contingencias registradas
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-medium text-slate-800">Opciones del Reporte</h4>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Período de Contingencias</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    type="date"
                    defaultValue="2024-01-01"
                    className="h-8 sm:h-9 text-xs sm:text-sm" />
                  <Input
                    type="date"
                    defaultValue="2024-06-18"
                    className="h-8 sm:h-9 text-xs sm:text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Estado de Contingencias</Label>
                <Select defaultValue="todas">
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las Contingencias</SelectItem>
                    <SelectItem value="abiertas">Solo Abiertas</SelectItem>
                    <SelectItem value="cerradas">Solo Cerradas</SelectItem>
                    <SelectItem value="proceso">En Proceso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-slate-700">Origen de Contingencia</Label>
                <Select defaultValue="todos">
                  <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los Orígenes</SelectItem>
                    <SelectItem value="biomedico">Equipo Biomédico</SelectItem>
                    <SelectItem value="infraestructura">Infraestructura</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="suministros">Suministros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">Incluir en el reporte</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-descripcion" defaultChecked />
                <Label
                  htmlFor="incluir-descripcion"
                  className="text-xs sm:text-sm text-slate-700">
                  Descripción completa de contingencias
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-equipo" defaultChecked />
                <Label htmlFor="incluir-equipo" className="text-xs sm:text-sm text-slate-700">
                  Información detallada del equipo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-usuario" defaultChecked />
                <Label htmlFor="incluir-usuario" className="text-xs sm:text-sm text-slate-700">
                  Usuario que reporta
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-fechas" defaultChecked />
                <Label htmlFor="incluir-fechas" className="text-xs sm:text-sm text-slate-700">
                  Fechas de apertura y cierre
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-estadisticas" />
                <Label
                  htmlFor="incluir-estadisticas"
                  className="text-xs sm:text-sm text-slate-700">
                  Estadísticas y resumen ejecutivo
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>El archivo se generará en formato PDF y se descargará automáticamente</span>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm">
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-9 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Generar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, X, FileText, CheckSquare } from "lucide-react"

const availableOrders = [
  { id: "PO-2024-001", proveedor: "VARIAN MEDICAL SYSTEMS", fecha: "2024-06-15", monto: "$125,000.00" },
  { id: "PO-2024-002", proveedor: "MEDTRONIC COLOMBIA", fecha: "2024-06-14", monto: "$45,750.00" },
  { id: "PO-2024-003", proveedor: "SIEMENS HEALTHCARE", fecha: "2024-06-13", monto: "$32,500.00" },
]

export function DownloadPdfModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">Descargar PDF</DialogTitle>
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
            <h3 className="text-sm sm:text-base font-medium text-slate-800">Opciones de descarga</h3>

            <div className="space-y-3">
              <div
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-teal-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm">Descargar todas las órdenes</div>
                  <div className="text-xs sm:text-sm text-slate-600">Generar PDF con todas las órdenes de compra</div>
                </div>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Todas
                </Button>
              </div>

              <div
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                <CheckSquare className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 text-sm">Seleccionar órdenes específicas</div>
                  <div className="text-xs sm:text-sm text-slate-600">Elegir órdenes individuales para descargar</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-medium text-slate-800">Seleccionar órdenes de compra</h4>
              <Button variant="outline" size="sm" className="text-xs h-7">
                Seleccionar todas
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <Checkbox id={order.id} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-xs sm:text-sm">{order.id}</span>
                      <span className="text-xs text-slate-500">{order.fecha}</span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{order.proveedor}</div>
                    <div className="text-xs font-medium text-teal-700">{order.monto}</div>
                  </div>
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">Formato de descarga</Label>
            <Select defaultValue="pdf">
              <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF - Documento Portable</SelectItem>
                <SelectItem value="excel">Excel - Hoja de Cálculo</SelectItem>
                <SelectItem value="csv">CSV - Valores Separados por Comas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">Incluir en el reporte</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-detalles" defaultChecked />
                <Label htmlFor="incluir-detalles" className="text-xs sm:text-sm text-slate-700">
                  Detalles de la orden
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-proveedor" defaultChecked />
                <Label htmlFor="incluir-proveedor" className="text-xs sm:text-sm text-slate-700">
                  Información del proveedor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-montos" defaultChecked />
                <Label htmlFor="incluir-montos" className="text-xs sm:text-sm text-slate-700">
                  Montos y totales
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="incluir-fechas" defaultChecked />
                <Label htmlFor="incluir-fechas" className="text-xs sm:text-sm text-slate-700">
                  Fechas de creación y vencimiento
                </Label>
              </div>
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
            Descargar PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

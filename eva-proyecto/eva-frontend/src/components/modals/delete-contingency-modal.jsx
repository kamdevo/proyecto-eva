import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

export function DeleteContingencyModal({ open, onOpenChange, contingency }) {
  if (!contingency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[60vw] max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-red-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">Eliminar Contingencia</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-4 border border-red-200 rounded-lg bg-red-50">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-red-900 mb-1 text-sm sm:text-base">
                ¿Está seguro de eliminar esta contingencia?
              </div>
              <div className="text-xs sm:text-sm text-red-700">Esta acción no se puede deshacer.</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-lg border">
              <div className="text-xs sm:text-sm font-medium text-slate-800 mb-2">Detalles de la contingencia:</div>
              <div className="space-y-1 text-xs text-slate-600">
                <div><span className="font-medium">ID:</span> #{contingency.id}</div>
                <div><span className="font-medium">Fecha:</span> {contingency.fecha}</div>
                <div><span className="font-medium">Estado:</span> {contingency.estado}</div>
                <div><span className="font-medium">Descripción:</span></div>
                <div className="text-xs bg-white p-2 rounded border max-h-20 overflow-y-auto">{contingency.descripcion}</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <div className="text-xs sm:text-sm text-amber-800">
              <strong>Nota:</strong> Al eliminar esta contingencia, también se eliminará el archivo asociado y todo el historial relacionado.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm">
            Cancelar
          </Button>
          <Button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 h-9 text-sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Eliminar Contingencia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

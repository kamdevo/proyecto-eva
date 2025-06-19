import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

export function DeleteConfirmModal({ open, onOpenChange, equipment }) {
  const handleDelete = () => {
    // Here you would implement the actual delete logic
    console.log("Deleting equipment:", equipment?.equipo.code)
    onOpenChange(false)
  }

  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-red-700 border-b border-red-200 pb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="text-center">
            <div
              className="bg-red-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="h-10 w-10 text-red-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Está seguro de eliminar este equipo?</h3>

            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>ID:</strong> {equipment.equipo.code}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Nombre:</strong> {equipment.equipo.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Marca:</strong> {equipment.equipo.brand} - {equipment.equipo.model}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-lg mt-4">
              <p className="text-sm text-red-700">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. Se eliminarán todos los datos
                asociados al equipo incluyendo:
              </p>
              <ul className="text-xs text-red-600 mt-2 text-left">
                <li>• Historial de mantenimientos</li>
                <li>• Documentos asociados</li>
                <li>• Registros de calibración</li>
                <li>• Datos de ubicación</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
            onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Definitivamente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

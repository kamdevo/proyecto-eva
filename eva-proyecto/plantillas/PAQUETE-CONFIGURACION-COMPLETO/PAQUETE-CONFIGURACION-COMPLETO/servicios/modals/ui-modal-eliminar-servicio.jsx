"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { AlertTriangle } from "lucide-react"

export default function UIModalEliminarServicio({ isOpen, onClose, servicio }) {
  const handleConfirmDelete = () => {
    console.log("Eliminando servicio:", servicio)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-red-500 pb-2">
            Eliminar Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">¿Confirmar eliminación?</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>

          {servicio && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Servicio a eliminar:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Nombre:</span> {servicio.nombre}
                </p>
                <p>
                  <span className="font-medium">Zona:</span> {servicio.zona}
                </p>
                <p>
                  <span className="font-medium">Centro de costo:</span> {servicio.centroCosto}
                </p>
                <p>
                  <span className="font-medium">Sede:</span> {servicio.sede}
                </p>
                <p>
                  <span className="font-medium">Equipos asociados:</span> {servicio.equiposAsociados}
                </p>
                <p>
                  <span className="font-medium">Áreas asociadas:</span> {servicio.areasAsociadas}
                </p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Advertencia</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Al eliminar este servicio, también se eliminarán todas las asociaciones con equipos y áreas. Esta
                  acción es permanente y no se puede revertir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancelar
            </Button>

            <Button type="button" onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white px-6">
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
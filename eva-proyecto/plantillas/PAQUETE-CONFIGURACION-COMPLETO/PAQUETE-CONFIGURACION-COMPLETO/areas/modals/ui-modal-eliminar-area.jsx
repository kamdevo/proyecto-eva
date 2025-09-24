"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { AlertTriangle } from "lucide-react"

export default function UIModalEliminarArea({ isOpen, onClose, area }) {
  const handleConfirmDelete = () => {
    console.log("Eliminando área:", area)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-red-500 pb-2">
            Eliminar Área
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">¿Confirmar eliminación?</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>

          {area && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Área a eliminar:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="space-y-2">
                  <p className="break-words">
                    <span className="font-medium text-gray-700">Nombre:</span><br />
                    {area.nombre}
                  </p>
                  <p className="break-words">
                    <span className="font-medium text-gray-700">Servicio:</span><br />
                    {area.servicio}
                  </p>
                  <p className="break-words">
                    <span className="font-medium text-gray-700">Sede:</span><br />
                    {area.sede}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium text-gray-700">Piso:</span><br />
                    {area.piso}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Zona:</span><br />
                    {area.zona}
                  </p>
                  <p className="break-words">
                    <span className="font-medium text-gray-700">Responsable:</span><br />
                    {area.responsable}
                  </p>
                </div>
              </div>
              
              {area.capacidad && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Capacidad:</span> {area.capacidad}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Advertencia</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Al eliminar esta área, también se eliminarán todas las asociaciones con equipos y servicios. Esta
                  acción es permanente y no se puede revertir.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 w-full sm:w-auto order-1 sm:order-2"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
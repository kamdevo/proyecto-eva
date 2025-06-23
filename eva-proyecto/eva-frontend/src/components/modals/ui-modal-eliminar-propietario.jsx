"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, User, Building2, FileText } from "lucide-react"

export default function UIModalEliminarPropietario({ isOpen, onClose, propietario }) {
  const handleConfirmDelete = () => {
    // Aquí iría la lógica para eliminar el propietario
    console.log("Eliminando propietario:", propietario)
    onClose()
  }

  if (!propietario) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-red-500 pb-2 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Eliminar Propietario</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">¿Confirmar eliminación?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Esta acción no se puede deshacer y eliminará toda la información asociada
              </p>
            </div>
          </div>

          {/* Información del propietario a eliminar */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border-l-4 border-red-500">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>Propietario a eliminar:</span>
            </h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Nombre:</p>
                  <p className="text-gray-800 font-semibold">{propietario.nombre}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Tipo de empresa:</p>
                  <p className="text-gray-800">{propietario.tipoEmpresa}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Equipos asociados:</p>
                  <p className="text-gray-800 font-semibold">{propietario.equiposAsociados} equipos</p>
                </div>
              </div>

              {propietario.descripcion && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Descripción:</p>
                    <p className="text-gray-800 text-sm">{propietario.descripcion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advertencias */}
          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Advertencia Crítica</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Al eliminar este propietario se eliminarán permanentemente:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc space-y-1">
                    <li>Toda la información de contacto</li>
                    <li>Asociaciones con {propietario.equiposAsociados} equipos</li>
                    <li>Historial de registros y documentos</li>
                    <li>Logo y archivos multimedia</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Acción Irreversible</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Esta acción es permanente y no se puede revertir. Asegúrese de haber respaldado toda la información
                    importante antes de continuar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
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
              className="bg-red-500 hover:bg-red-600 text-white px-6 w-full sm:w-auto order-1 sm:order-2 flex items-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Eliminar Definitivamente</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

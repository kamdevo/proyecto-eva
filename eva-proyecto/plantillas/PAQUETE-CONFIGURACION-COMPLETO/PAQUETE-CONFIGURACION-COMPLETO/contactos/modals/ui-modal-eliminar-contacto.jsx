"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"
import { AlertTriangle, Trash2 } from "lucide-react"

export default function UIModalEliminarContacto({ isOpen, onClose, contacto }) {
  const handleConfirmDelete = () => {
    console.log("Eliminando contacto:", contacto)
    onClose()
  }

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case "PROVEEDOR":
        return "bg-blue-100 text-blue-800"
      case "FABRICANTE":
        return "bg-green-100 text-green-800"
      case "REPRESENTANTE":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-red-500 pb-2">
            Eliminar Contacto
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

          {contacto && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Contacto a eliminar:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Nombre:</span>
                  <span>{contacto.nombre}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="break-all">{contacto.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Teléfono:</span>
                  <span>{contacto.telefono}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tipo:</span>
                  <Badge className={`${getTypeColor(contacto.tipo)} text-xs`}>
                    {contacto.tipo}
                  </Badge>
                </div>
                {contacto.contactoPrincipal && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Contacto Principal:</span>
                    <span>{contacto.contactoPrincipal}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Advertencia</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Al eliminar este contacto, se perderá toda la información asociada. Esta
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
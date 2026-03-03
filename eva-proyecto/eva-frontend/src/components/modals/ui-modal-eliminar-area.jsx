"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function UIModalEliminarArea({ isOpen, onClose, area, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handleConfirmDelete = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://api.eva2.huv.gov.co/api'}/v1/areas/${area.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Área eliminada exitosamente')
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Error al eliminar área')
      }
    } catch (error) {
      console.error('Error eliminando área:', error)
      toast.error('Error al eliminar área')
    } finally {
      setLoading(false)
    }
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
              <div className="space-y-2 text-sm text-gray-600">
                <p className="break-words">
                  <span className="font-medium text-gray-700">ID:</span> {area.id}
                </p>
                <p className="break-words">
                  <span className="font-medium text-gray-700">Nombre:</span> {area.name}
                </p>
                <p className="break-words">
                  <span className="font-medium text-gray-700">Servicio:</span> {area.servicio_nombre || 'N/A'}
                </p>
                <p className="break-words">
                  <span className="font-medium text-gray-700">Sede:</span> {area.sede_nombre || 'N/A'}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Piso:</span> {area.piso_nombre || 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Advertencia</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  No se puede eliminar un área si tiene equipos asociados. Esta acción es permanente y no se puede revertir.
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
              disabled={loading}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 w-full sm:w-auto order-1 sm:order-2"
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Eliminar Área'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
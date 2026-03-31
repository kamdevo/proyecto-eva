"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import httpService from "../../services/httpService"

export default function UIModalEliminarServicio({ isOpen, onClose, servicio }) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!servicio?.id) return

    setSubmitting(true)
    try {
      const res = await httpService.delete(`/v1/servicios/${servicio.id}`)
      
      if (res.data.success) {
        toast.success("Servicio eliminado correctamente")
        onClose(true) // Cerrar y refrescar
      } else {
        toast.error(res.data.message || "No se pudo eliminar el servicio")
      }
    } catch (err) {
      console.error("Error al eliminar:", err)
      toast.error(err.response?.data?.message || "Error al procesar la eliminación")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            Eliminar Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-red-800 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el servicio <span className="font-bold underline">"{servicio?.name}"</span>?
              Esta acción es irreversible y podría afectar la visibilidad de los equipos vinculados.
            </p>
          </div>

          {servicio && (
            <div className="space-y-3 px-1 mb-6">
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Código:</span>
                <span className="text-slate-700 font-bold">{servicio.code || "---"}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Ubicación:</span>
                <span className="text-slate-700">{servicio.zona_nombre || "---"} - {servicio.piso_nombre || "---"}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-400 font-medium">Equipos:</span>
                <span className="text-slate-700 font-bold">{servicio.total_equipos || 0} vinculados</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              type="button" 
              variant="destructive"
              disabled={submitting}
              onClick={handleConfirmDelete} 
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-6 font-bold"
            >
              {submitting ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "SÍ, ELIMINAR AHORA"
              )}
            </Button>

            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onClose(false)} 
              className="w-full text-slate-500 hover:text-slate-800 rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
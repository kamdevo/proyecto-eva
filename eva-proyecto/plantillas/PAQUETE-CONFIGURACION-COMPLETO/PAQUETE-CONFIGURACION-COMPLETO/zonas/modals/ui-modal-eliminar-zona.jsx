"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import { AlertTriangle, Trash2, Shield, Building, User } from "lucide-react"

export default function UIModalEliminarZona({ isOpen, onClose, zona }) {
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [step, setStep] = useState(1)
  
  const requiredText = zona?.nombre || ""
  const isConfirmValid = confirmText === requiredText
  
  const handleConfirmDelete = async () => {
    if (!isConfirmValid) return
    
    setIsDeleting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log("Eliminando zona:", zona)
      onClose()
      setStep(1)
      setConfirmText("")
    } catch (error) {
      console.error("Error al eliminar zona:", error)
    } finally {
      setIsDeleting(false)
    }
  }
  
  const handleClose = () => {
    if (!isDeleting) {
      setStep(1)
      setConfirmText("")
      onClose()
    }
  }
  
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "ACTIVA":
        return "bg-green-100 text-green-800"
      case "INACTIVA":
        return "bg-red-100 text-red-800"
      case "MANTENIMIENTO":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-w-[95vw] max-h-[70vh] overflow-y-auto mx-4">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" />
            {step === 1 ? 'Eliminar Zona' : 'Confirmar'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-600" />
              <span className="text-xs font-semibold text-red-800">Acción Irreversible</span>
            </div>
          </div>

          {zona && (
            <div className="bg-white border rounded p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{zona.nombre}</span>
                <Badge className={`${getEstadoColor(zona.estado)} text-xs`}>
                  {zona.estado}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>Código: {zona.codigo}</div>
                  <div>Piso: {zona.piso || 'N/A'}</div>
                </div>
                <div className="text-xs text-gray-600">{zona.sede}</div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{zona.jefeZona}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <div className="text-center p-1 bg-orange-50 rounded">
                    <div className="text-sm font-bold text-orange-600">{zona.areasAsociadas}</div>
                    <div className="text-xs">Áreas</div>
                  </div>
                  <div className="text-center p-1 bg-red-50 rounded">
                    <div className="text-sm font-bold text-red-600">{zona.equiposAsociados}</div>
                    <div className="text-xs">Equipos</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-800">Impacto</span>
            </div>
            <div className="text-xs text-yellow-700">
              • {zona?.areasAsociadas} áreas • {zona?.equiposAsociados} equipos • Historial perdido
            </div>
          </div>
          
          {step === 2 && (
            <div className="bg-gray-50 border rounded p-2">
              <div className="text-xs font-medium text-gray-700 mb-1">
                Escriba: <span className="font-mono bg-gray-200 px-1 rounded">{requiredText}</span>
              </div>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Nombre exacto"
                className={`h-7 text-xs ${isConfirmValid ? 'border-green-500' : 'border-red-300'}`}
                disabled={isDeleting}
              />
              {confirmText && (
                <p className={`text-xs mt-1 ${isConfirmValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isConfirmValid ? '✓ Válido' : 'No coincide'}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={handleClose} className="h-7 px-3 text-xs flex-1" disabled={isDeleting}>
              Cancelar
            </Button>
            {step === 1 ? (
              <Button type="button" onClick={() => setStep(2)} className="h-7 px-3 text-xs flex-1 bg-yellow-500 hover:bg-yellow-600">
                Continuar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleConfirmDelete}
                className={`h-7 px-3 text-xs flex-1 ${
                  isConfirmValid && !isDeleting
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                disabled={!isConfirmValid || isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
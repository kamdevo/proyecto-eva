"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Building, Loader2 } from "lucide-react"
import { toast } from "sonner"
import httpService from "../../services/httpService"

export default function UIModalCrearSede({ isOpen, onClose }) {
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const res = await httpService.post("/v1/sede", { name: name.trim() })
      
      if (res.data.success) {
        toast.success("Sede creada exitosamente")
        setName("")
        onClose(true) // Cerrar e informar que hubo cambios
      } else {
        toast.error(res.data.message || "Error al crear la sede")
      }
    } catch (err) {
      console.error("Error al crear sede:", err)
      toast.error(err.response?.data?.message || "Error al conectar con el servidor")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
           <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building className="w-6 h-6 text-white" />
              </div>
              Nueva Sede
            </DialogTitle>
            <p className="text-blue-100 mt-2 text-sm">
              Registra una ubicación física central para agrupar servicios y zonas.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sede-name" className="text-sm font-bold text-slate-700 ml-1">
                Nombre de la sede *
              </Label>
              <Input
                id="sede-name"
                type="text"
                placeholder="Ej. HUV SEDE NORTE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                required
                autoFocus
              />
              <p className="text-[10px] text-slate-400 ml-1">
                Este nombre será visible en los selectores de equipos y servicios.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={submitting || !name.trim()}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-200 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "CREAR SEDE"
                )}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onClose(false)} 
                className="w-full py-6 text-slate-500 hover:text-slate-800 rounded-2xl font-medium"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
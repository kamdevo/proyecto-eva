"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import httpService from "../../services/httpService"

export default function UIModalCrearZona({ isOpen, onClose }) {
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSubmitting(true)
    try {
      const res = await httpService.post("/v1/zona", { 
        name: name.trim(),
        status: 1 
      })
      
      if (res.data.success) {
        toast.success("Zona creada exitosamente")
        setName("")
        onClose(true)
      } else {
        toast.error(res.data.message || "Error al crear la zona")
      }
    } catch (err) {
      console.error("Error al crear zona:", err)
      toast.error(err.response?.data?.message || "Error al conectar con el servidor")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden text-slate-800">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-white">
           <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              Nueva Zona
            </DialogTitle>
            <p className="text-emerald-100 mt-2 text-sm">
              Define departamentos o bloques físicos dentro del hospital.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="zona-name" className="text-sm font-bold text-slate-700 ml-1">
                Nombre de la zona *
              </Label>
              <Input
                id="zona-name"
                type="text"
                placeholder="Ej. ZONA QUIRÓFANOS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
                required
                autoFocus
              />
              <p className="text-[10px] text-slate-400 ml-1">
                Usa nombres claros que faciliten la ubicación de los equipos.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={submitting || !name.trim()}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-emerald-200 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "CREAR ZONA"
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
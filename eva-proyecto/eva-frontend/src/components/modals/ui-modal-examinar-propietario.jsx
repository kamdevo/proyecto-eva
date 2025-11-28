"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Building2, Phone, Mail, Globe, MapPin, Calendar, FileText, ImageIcon, ExternalLink } from "lucide-react"

export default function UIModalExaminarPropietario({ isOpen, onClose, propietario }) {
  if (!propietario) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800 border-b-2 border-blue-500 pb-2 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Información del Propietario</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Header con logo y nombre */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="w-32 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 shadow-sm">
              {propietario.logo ? (
                <img
                  src={propietario.logo_url || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/equipos/images/${propietario.logo}`}
                  alt={`Logo de ${propietario.nombre}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center text-gray-400"><svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><span class="text-xs">Sin logo</span></div>'
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">Sin logo</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{propietario.nombre}</h2>
              <Badge variant="outline" className="mb-3 bg-blue-100 text-blue-800 border-blue-300">
                {propietario.equipos_count || 0} equipos asociados
              </Badge>
              <p className="text-gray-600 leading-relaxed">Propietario ID: #{propietario.id}</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <span>Información Adicional</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <FileText className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Equipos Asociados</p>
                  <p className="text-2xl font-bold text-green-600">{propietario.equipos_count || 0}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <Calendar className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha de Registro</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {propietario.created_at ? new Date(propietario.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : 'No disponible'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <Building2 className="w-8 h-8 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">ID</p>
                  <p className="text-lg font-semibold text-purple-600">#{propietario.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border">
            <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Resumen</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{propietario.equipos_count || 0}</p>
                <p className="text-sm text-gray-600">Equipos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {propietario.created_at ? new Date().getFullYear() - new Date(propietario.created_at).getFullYear() : 0}
                </p>
                <p className="text-sm text-gray-600">Años</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{propietario.equipos_activos || 0}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{propietario.equipos_inactivos || 0}</p>
                <p className="text-sm text-gray-600">Inactivos</p>
              </div>
            </div>
          </div>

          {/* Botón de cierre */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white px-8">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

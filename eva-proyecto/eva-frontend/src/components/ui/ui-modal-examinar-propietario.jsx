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
              <img
                src={propietario.logo || "/placeholder.svg"}
                alt={`Logo de ${propietario.nombre}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
              <div className="hidden flex-col items-center justify-center text-gray-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs">Logo</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{propietario.nombre}</h2>
              <Badge variant="outline" className="mb-3 bg-blue-100 text-blue-800 border-blue-300">
                {propietario.tipoEmpresa}
              </Badge>
              <p className="text-gray-600 leading-relaxed">{propietario.descripcion}</p>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2 border-b pb-2">
              <Phone className="w-5 h-5 text-green-500" />
              <span>Información de Contacto</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Teléfono</p>
                  <p className="text-gray-600">{propietario.telefono}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-600 break-all">{propietario.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Dirección</p>
                  <p className="text-gray-600">{propietario.direccion}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                <Globe className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Sitio Web</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-600">{propietario.sitioWeb}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-purple-500 hover:text-purple-700"
                      onClick={() => window.open(`https://${propietario.sitioWeb}`, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
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
                  <p className="text-2xl font-bold text-green-600">{propietario.equiposAsociados}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <Calendar className="w-8 h-8 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha de Registro</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {new Date(propietario.fechaRegistro).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <Building2 className="w-8 h-8 text-purple-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Tipo de Empresa</p>
                  <p className="text-lg font-semibold text-purple-600">{propietario.tipoEmpresa}</p>
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
                <p className="text-2xl font-bold text-blue-600">{propietario.equiposAsociados}</p>
                <p className="text-sm text-gray-600">Equipos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {new Date().getFullYear() - new Date(propietario.fechaRegistro).getFullYear()}
                </p>
                <p className="text-sm text-gray-600">Años</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">1</p>
                <p className="text-sm text-gray-600">Sede</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">100%</p>
                <p className="text-sm text-gray-600">Activo</p>
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

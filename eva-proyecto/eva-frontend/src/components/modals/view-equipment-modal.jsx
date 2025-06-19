"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Settings, FileText, Clock } from "lucide-react"

export function ViewEquipmentModal({ open, onOpenChange, equipment }) {
  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            📋 Consulta de Equipo - Solo Lectura
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-3 sm:p-4 md:p-6">
          {/* Equipment Header */}
          <div
            className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 md:p-6 rounded-lg">
            <div className="flex items-start gap-3 sm:gap-4 md:gap-4">
              <img
                src={equipment.image || "/placeholder.svg"}
                alt={equipment.equipo.name}
                className="w-24 h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 object-cover rounded-lg border-2 border-blue-200" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 mb-2">{equipment.equipo.name}</h2>
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">ID:</span>
                    <Badge className="ml-2 bg-orange-100 text-orange-800">{equipment.equipo.code}</Badge>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Marca:</span>
                    <span className="ml-2">{equipment.equipo.brand}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Modelo:</span>
                    <span className="ml-2">{equipment.equipo.model}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Serie:</span>
                    <span className="ml-2">{equipment.equipo.series}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div
              className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3
                className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Settings className="h-5 w-5 text-blue-600" />
                Estado y Datos
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <Badge className="bg-green-100 text-green-800">{equipment.data.status}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Preventivos:</span>
                  <Badge className="bg-blue-100 text-blue-800">{equipment.data.preventivos}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Calibraciones:</span>
                  <Badge className="bg-purple-100 text-purple-800">{equipment.data.calibraciones}</Badge>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Registro Sanitario:</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{equipment.data.registroSanitario}</span>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3
                className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                Ubicación
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Servicio:</span>
                  <span className="font-medium">{equipment.ubicacion.servicio}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Área:</span>
                  <span className="font-medium">{equipment.ubicacion.area}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Zona:</span>
                  <span className="font-medium">{equipment.ubicacion.zona}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Sede:</span>
                  <span className="font-medium">{equipment.ubicacion.sede}</span>
                </div>
                <Separator />
                <div>
                  <span className="text-gray-600 text-xs sm:text-sm">Localización:</span>
                  <p className="text-xs sm:text-sm mt-1 bg-gray-50 p-2 rounded">{equipment.ubicacion.localizacion}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-xs sm:text-sm">Hospital:</span>
                  <p className="text-xs sm:text-sm mt-1 bg-blue-50 p-2 rounded text-blue-800">
                    {equipment.ubicacion.hospital}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Execution */}
          <div
            className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3
              className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Calendar className="h-5 w-5 text-purple-600" />
              Ejecución de Plan de Mantenimiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🔄</div>
                  <h4 className="font-semibold text-blue-800">Frecuencia</h4>
                  <p className="text-xs sm:text-sm text-blue-600 mt-2">{equipment.ejecucionPlan.frecuencia}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-semibold text-green-800">Último Mantenimiento</h4>
                  <p className="text-xs sm:text-sm text-green-600 mt-2">
                    {equipment.ejecucionPlan.ultimoMantenimiento}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">📅</div>
                  <h4 className="font-semibold text-yellow-800">Próximo Mantenimiento</h4>
                  <p className="text-xs sm:text-sm text-yellow-600 mt-2">
                    {equipment.ejecucionPlan.proximoMantenimiento}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Action */}
          <div
            className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3
              className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <Clock className="h-5 w-5 text-orange-600" />
              Última Acción Realizada
            </h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-purple-700">Tipo de Acción:</span>
                  <p className="text-purple-800 mt-1">{equipment.ultimaAccion.tipo}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-purple-700">Fecha de Creación:</span>
                  <p className="text-purple-800 mt-1 text-xs sm:text-sm">{equipment.ultimaAccion.fechaCreacion}</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-purple-700">Fecha de Cierre:</span>
                  <p className="text-purple-800 mt-1 text-xs sm:text-sm">{equipment.ultimaAccion.fechaCierre}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div
            className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 rounded-lg">
            <h3
              className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FileText className="h-5 w-5 text-gray-600" />
              Recursos Adicionales
            </h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-2">📋 Guía rápida: ACELERADOR LINEAL VARIAN</Badge>
              <Badge className="bg-green-100 text-green-800 px-3 py-2">
                📋 Manual: ACELERADOR LINEAL VARIAN TRUE BEAM ✅
              </Badge>
              <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0">
                🔧 Ver Contingencias
              </Button>
            </div>
          </div>

          {/* Read-Only Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-yellow-600">ℹ️</div>
              <div>
                <h4 className="font-semibold text-yellow-800">Modo Solo Lectura</h4>
                <p className="text-xs sm:text-sm text-yellow-700">
                  Esta vista es de solo consulta. Para realizar modificaciones, utilice el botón de editar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

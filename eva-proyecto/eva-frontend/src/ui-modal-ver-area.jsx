"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Eye, X, MapPin, Building, Users, Settings, Phone, Mail, User } from "lucide-react";

export default function UIModalVerArea({ isOpen, onClose, area }) {
  if (!area) return null;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "ACTIVA":
        return "bg-green-100 text-green-800";
      case "INACTIVA":
        return "bg-red-100 text-red-800";
      case "MANTENIMIENTO":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Detalles del Área
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 p-2">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-1">{area.nombre}</h3>
                <p className="text-sm text-blue-600">Área del Hospital Universitario del Valle</p>
              </div>
              <Badge className={`${getEstadoColor(area.estado)} text-sm px-3 py-1 w-fit`}>
                {area.estado}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Servicio</span>
              </div>
              <p className="text-sm text-gray-800 font-medium break-words">
                {area.servicio}
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Sede</span>
              </div>
              <p className="text-sm text-gray-800 break-words">
                {area.sede}
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Piso</span>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {area.piso}
              </Badge>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Zona</span>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                {area.zona}
              </Badge>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-lg font-medium text-gray-700">Responsable del Área</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Nombre</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  {area.responsable || 'No asignado'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Teléfono</span>
                </div>
                <p className="text-sm text-gray-800">
                  {area.telefono || 'No disponible'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Email</span>
                </div>
                <p className="text-sm text-gray-800 break-all">
                  {area.email || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Capacidad</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {area.capacidad || 'No especificada'}
                </div>
                <div className="text-xs text-gray-500">capacidad del área</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">ID del Área</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">#{area.id}</div>
                <div className="text-xs text-gray-500">identificador único</div>
              </div>
            </div>
          </div>

          {area.descripcion && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Descripción</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {area.descripcion}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-6">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
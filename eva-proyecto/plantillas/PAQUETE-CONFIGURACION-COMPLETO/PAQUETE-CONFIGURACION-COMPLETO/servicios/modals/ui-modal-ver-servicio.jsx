"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Eye, MapPin, Building, Users, Settings } from "lucide-react";

export default function UIModalVerServicio({ isOpen, onClose, servicio }) {
  if (!servicio) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Detalles del Servicio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">{servicio.nombre}</h3>
            <p className="text-sm text-blue-600">Servicio del Hospital Universitario del Valle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Zona</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {servicio.zona || 'No asignada'}
              </Badge>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Piso</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {servicio.piso || 'No asignado'}
              </Badge>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Sede</span>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {servicio.sede}
              </Badge>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Centro de Costo</span>
            </div>
            <p className="text-sm text-gray-800 font-medium">{servicio.centroCosto}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Equipos Asociados</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{servicio.equiposAsociados}</div>
                <div className="text-xs text-gray-500">equipos registrados</div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Áreas Asociadas</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{servicio.areasAsociadas}</div>
                <div className="text-xs text-gray-500">áreas vinculadas</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Eye, X, MapPin, Building, Phone, Mail, User } from "lucide-react";

export default function UIModalVerZona({ isOpen, onClose, zona }) {
  if (!zona) return null;

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
      <DialogContent className="max-w-2xl w-[95vw] max-h-[75vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              {zona.nombre}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-3 h-3" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          <div className="bg-blue-50 border rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{zona.codigo} - ID #{zona.id}</span>
              </div>
              <Badge className={`${getEstadoColor(zona.estado)} text-xs px-2 py-0.5`}>
                {zona.estado}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            <div className="bg-white border rounded p-2 text-center">
              <div className="text-sm font-bold text-teal-600">{zona.areasAsociadas}</div>
              <div className="text-xs text-gray-600">Áreas</div>
            </div>
            <div className="bg-white border rounded p-2 text-center">
              <div className="text-sm font-bold text-orange-600">{zona.equiposAsociados}</div>
              <div className="text-xs text-gray-600">Equipos</div>
            </div>
            <div className="bg-white border rounded p-2 text-center">
              <div className="text-sm font-bold text-green-600">98%</div>
              <div className="text-xs text-gray-600">Operativo</div>
            </div>
            <div className="bg-white border rounded p-2 text-center">
              <div className="text-sm font-bold text-purple-600">A+</div>
              <div className="text-xs text-gray-600">Calidad</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="bg-white border rounded p-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Sede:</span>
                  <div className="text-gray-800">{zona.sede}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Piso:</span>
                  <Badge variant="outline" className="text-xs ml-1">
                    {zona.piso || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-white border rounded p-2">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-green-600" />
                  <span className="font-medium">{zona.jefeZona}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-600" />
                  <span>{zona.telefono || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-red-600" />
                  <span className="break-all">{zona.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {zona.descripcion && (
            <div className="bg-gray-50 border rounded p-2">
              <p className="text-xs text-gray-800">{zona.descripcion}</p>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button onClick={onClose} className="h-6 px-3 text-xs">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
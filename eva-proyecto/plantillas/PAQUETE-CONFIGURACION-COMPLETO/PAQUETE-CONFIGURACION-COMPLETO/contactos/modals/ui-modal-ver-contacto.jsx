"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Eye, Users, Mail, Phone, MapPin, Building, User, Globe } from "lucide-react";

export default function UIModalVerContacto({ isOpen, onClose, contacto }) {
  if (!contacto) return null;

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case "PROVEEDOR":
        return "bg-blue-100 text-blue-800";
      case "FABRICANTE":
        return "bg-green-100 text-green-800";
      case "REPRESENTANTE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "ACTIVO":
        return "bg-green-100 text-green-800";
      case "INACTIVO":
        return "bg-red-100 text-red-800";
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
            Detalles del Contacto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Header del contacto */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">{contacto.nombre}</h3>
                <p className="text-sm text-blue-600">ID: {contacto.id}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`${getTypeColor(contacto.tipo)} text-sm px-3 py-1`}>
                  {contacto.tipo}
                </Badge>
                <Badge className={`${getEstadoColor(contacto.estado)} text-sm px-3 py-1`}>
                  {contacto.estado}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Información de Contacto</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <p className="text-sm text-gray-800 break-all">{contacto.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Teléfono</label>
                  <p className="text-sm text-gray-800">{contacto.telefono || 'No disponible'}</p>
                </div>
                {contacto.contactoPrincipal && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Contacto Principal</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-green-600" />
                      <span className="text-sm text-gray-800">{contacto.contactoPrincipal}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Información Empresarial</span>
              </div>
              <div className="space-y-3">
                {contacto.nit && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">NIT/Documento</label>
                    <p className="text-sm text-gray-800">{contacto.nit}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600">Tipo de Empresa</label>
                  <Badge className={`${getTypeColor(contacto.tipo)} text-xs mt-1`}>
                    {contacto.tipo}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          {(contacto.direccion || contacto.ciudad || contacto.pais) && (
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Ubicación</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contacto.direccion && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Dirección</label>
                    <p className="text-sm text-gray-800">{contacto.direccion}</p>
                  </div>
                )}
                {contacto.ciudad && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Ciudad</label>
                    <p className="text-sm text-gray-800">{contacto.ciudad}</p>
                  </div>
                )}
                {contacto.pais && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">País</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span className="text-sm text-gray-800">{contacto.pais}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-xs text-gray-500">Contacto activo</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-xs text-gray-500">Equipos asociados</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">A+</div>
              <div className="text-xs text-gray-500">Calificación</div>
            </div>
          </div>

          {/* Botón cerrar */}
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
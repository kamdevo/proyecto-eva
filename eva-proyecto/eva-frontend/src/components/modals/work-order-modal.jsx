"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, FileText, User, Clock } from "lucide-react";

export default function WorkOrderModal({ isOpen, onClose, ticket, orderType = "general" }) {
  const [formData, setFormData] = useState({
    numeroOrden: "",
    fechaCreacion: "",
    solicitante: "",
    departamento: "",
    prioridad: "",
    tipoTrabajo: "",
    descripcion: "",
    equipoAfectado: "",
    ubicacion: "",
    fechaVencimiento: "",
    asignadoA: "",
    estado: "Pendiente",
    observaciones: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const requiredFields = ['numeroOrden', 'fechaCreacion', 'solicitante', 'descripcion'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Complete los campos obligatorios: ${missingFields.join(', ')}`);
      return;
    }

    const orderData = {
      ...formData,
      tipo: orderType,
      fechaCreacion: new Date().toISOString(),
      numero: `WO-${Date.now()}`
    };

    console.log('📋 ORDEN DE TRABAJO:', orderData);
    alert(`✅ Orden de Trabajo ${orderData.numero} creada`);
    onClose();
  };

  if (!isOpen) return null;

  // Si se pasa un ticket, mostrar información completa del ticket
  if (ticket) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información Completa del Ticket #{ticket.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-500">ID del Ticket</Label>
                  <p className="font-semibold">#{ticket.id}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Origen</Label>
                  <p>{ticket.origin}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Tipo</Label>
                  <p className="capitalize">{ticket.tipo}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Estado</Label>
                  <p className="font-medium">{ticket.status}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Prioridad</Label>
                  <p className="font-medium">{ticket.prioridad}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Fecha de Creación</Label>
                  <p>{ticket.date} {ticket.time}</p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Descripción del Problema</h3>
              <p className="text-gray-800">{ticket.description}</p>
            </div>

            {/* Personal y Asignación */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">Personal y Asignación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-500">Creado por</Label>
                  <p className="font-medium">{ticket.creadoPor}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Asignado a</Label>
                  <p className="font-medium">{ticket.asignadoA}</p>
                </div>
              </div>
            </div>

            {/* Ubicación y Equipo */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3">Ubicación y Equipo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-gray-500">Área</Label>
                  <p className="font-medium">{ticket.area}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-500">Equipo</Label>
                  <p className="font-medium">{ticket.equipo}</p>
                </div>
              </div>
            </div>

            {/* Historial de Cambios */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3">Historial de Cambios</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-purple-400">
                  <Clock className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">{ticket.date} {ticket.time} - Ticket creado</p>
                    <p className="text-xs text-gray-600">Por: {ticket.creadoPor}</p>
                    <p className="text-xs text-gray-800">Ticket creado y asignado a {ticket.asignadoA}</p>
                  </div>
                </div>
                {ticket.status === 'En Proceso' && (
                  <div className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-blue-400">
                    <Clock className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">{ticket.date} - Estado cambiado a En Proceso</p>
                      <p className="text-xs text-gray-600">Por: {ticket.asignadoA}</p>
                      <p className="text-xs text-gray-800">Trabajo iniciado</p>
                    </div>
                  </div>
                )}
                {ticket.status === 'Cerrado' && (
                  <div className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-green-400">
                    <Clock className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">{ticket.date} - Ticket cerrado</p>
                      <p className="text-xs text-gray-600">Por: {ticket.asignadoA}</p>
                      <p className="text-xs text-gray-800">Trabajo completado satisfactoriamente</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Archivos y Documentos */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-3">Archivos y Documentos</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Orden_Trabajo_{ticket.id}.pdf</p>
                    <p className="text-xs text-gray-600">Subido el {ticket.date}</p>
                  </div>
                  <Button size="sm" variant="outline">Descargar</Button>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Evidencia_Fotografica_{ticket.id}.jpg</p>
                    <p className="text-xs text-gray-600">Subido el {ticket.date}</p>
                  </div>
                  <Button size="sm" variant="outline">Ver</Button>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Reporte_Tecnico_{ticket.id}.pdf</p>
                    <p className="text-xs text-gray-600">Subido el {ticket.date}</p>
                  </div>
                  <Button size="sm" variant="outline">Descargar</Button>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Modal original para crear orden de trabajo
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nueva Orden de Trabajo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroOrden">Número de Orden *</Label>
              <Input
                id="numeroOrden"
                value={formData.numeroOrden}
                onChange={(e) => handleInputChange('numeroOrden', e.target.value)}
                placeholder="WO-001"
              />
            </div>
            <div>
              <Label htmlFor="fechaCreacion">Fecha de Creación *</Label>
              <Input
                id="fechaCreacion"
                type="date"
                value={formData.fechaCreacion}
                onChange={(e) => handleInputChange('fechaCreacion', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="solicitante">Solicitante *</Label>
              <Input
                id="solicitante"
                value={formData.solicitante}
                onChange={(e) => handleInputChange('solicitante', e.target.value)}
                placeholder="Nombre del solicitante"
              />
            </div>
            <div>
              <Label htmlFor="departamento">Departamento</Label>
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => handleInputChange('departamento', e.target.value)}
                placeholder="Departamento solicitante"
              />
            </div>
          </div>

          {/* Detalles del Trabajo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(value) => handleInputChange('prioridad', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
              <Select value={formData.tipoTrabajo} onValueChange={(value) => handleInputChange('tipoTrabajo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="instalacion">Instalación</SelectItem>
                  <SelectItem value="mejora">Mejora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describa detalladamente el trabajo a realizar"
              rows={4}
            />
          </div>

          {/* Equipo y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipoAfectado">Equipo Afectado</Label>
              <Input
                id="equipoAfectado"
                value={formData.equipoAfectado}
                onChange={(e) => handleInputChange('equipoAfectado', e.target.value)}
                placeholder="Nombre o código del equipo"
              />
            </div>
            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                placeholder="Ubicación del trabajo"
              />
            </div>
          </div>

          {/* Asignación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fechaVencimiento"
                type="date"
                value={formData.fechaVencimiento}
                onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="asignadoA">Asignado A</Label>
              <Input
                id="asignadoA"
                value={formData.asignadoA}
                onChange={(e) => handleInputChange('asignadoA', e.target.value)}
                placeholder="Técnico o equipo asignado"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Crear Orden de Trabajo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
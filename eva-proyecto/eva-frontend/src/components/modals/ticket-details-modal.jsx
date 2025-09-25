"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Building, Calendar, User, FileText, Clock, AlertCircle } from "lucide-react";

export default function TicketDetailsModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Cerrado":
        return "bg-green-100 text-green-800 border-green-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Abierto":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Crítica":
        return "bg-red-500 text-white";
      case "Alta":
        return "bg-red-100 text-red-800";
      case "Media":
        return "bg-yellow-100 text-yellow-800";
      case "Baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold">Hospital Universitario del Valle</h1>
                <p className="text-blue-100 text-sm">Evaristo García - Sistema de Gestión de Tickets</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Document Header */}
        <div className="bg-gray-50 border-b p-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">DETALLE DEL TICKET</h2>
            <p className="text-sm text-gray-600">Información Completa del Ticket #{ticket.id}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Información General */}
          <div className="mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">INFORMACIÓN GENERAL</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket ID</label>
                <p className="text-sm font-bold text-gray-900 mt-1">#{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Origen</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{ticket.origin}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de Creación</label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {ticket.date} - {ticket.time}
                </p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
                <div className="mt-1">
                  <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridad</label>
                <div className="mt-1">
                  <Badge className={`${getPriorityColor(ticket.prioridad)} text-xs`}>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {ticket.prioridad}
                  </Badge>
                </div>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.area}</p>
              </div>
            </div>
          </div>

          {/* Descripción del Problema */}
          <div className="mb-6">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">DESCRIPCIÓN DEL PROBLEMA</h3>
            </div>
            <div className="border border-gray-200 p-4 rounded bg-gray-50">
              <p className="text-sm text-gray-900 leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {/* Información del Equipo */}
          <div className="mb-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">INFORMACIÓN DEL EQUIPO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipo</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{ticket.equipo}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ubicación</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.area}</p>
              </div>
            </div>
          </div>

          {/* Asignación y Responsables */}
          <div className="mb-6">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">ASIGNACIÓN Y RESPONSABLES</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Creado por</label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  {ticket.creadoPor}
                </p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asignado a</label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  {ticket.asignadoA}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Seguimiento */}
          <div className="mb-6">
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">INFORMACIÓN DE SEGUIMIENTO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tiempo Transcurrido</label>
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {Math.floor((new Date() - new Date(ticket.date)) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última Actualización</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date} {ticket.time}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo de Ticket</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{ticket.tipo}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <p>Documento generado el {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}</p>
              <p>Hospital Universitario del Valle - Sistema EVA</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
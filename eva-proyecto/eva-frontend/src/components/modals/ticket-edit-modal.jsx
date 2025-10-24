"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function TicketEditModal({ isOpen, onClose, ticket, onSave }) {
  const [editedTicket, setEditedTicket] = useState({
    description: ticket?.description || "",
    status: ticket?.status || "",
    fechaCierre: ticket?.fechaCierre || ""
  });

  if (!isOpen || !ticket) return null;

  const handleSave = () => {
    onSave({
      ...ticket,
      description: editedTicket.description,
      status: editedTicket.status,
      fechaCierre: editedTicket.fechaCierre
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[90vw] max-w-5xl">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Editar Ticket #{ticket.id}</h2>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Información básica (solo lectura) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Información del Ticket</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">ID:</span> #{ticket.id}
              </div>
              <div>
                <span className="font-medium text-gray-600">Origen:</span> {ticket.origin}
              </div>
              <div>
                <span className="font-medium text-gray-600">Creado por:</span> {ticket.creadoPor}
              </div>
              <div>
                <span className="font-medium text-gray-600">Asignado a:</span> {ticket.asignadoA}
              </div>
            </div>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select
                value={editedTicket.status}
                onValueChange={(value) => {
                  const updates = { status: value };
                  if (value === 'Cerrado' && !editedTicket.fechaCierre) {
                    updates.fechaCierre = new Date().toISOString().slice(0, 16);
                  }
                  setEditedTicket(prev => ({ ...prev, ...updates }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Abierto">Abierto</SelectItem>
                  <SelectItem value="En Proceso">En Proceso</SelectItem>
                  <SelectItem value="Cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <Textarea
                value={editedTicket.description}
                onChange={(e) => setEditedTicket(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full"
                placeholder="Descripción del problema..."
              />
            </div>

            {editedTicket.status === 'Cerrado' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Cierre
                  </label>
                  <input
                    type="datetime-local"
                    value={editedTicket.fechaCierre || ''}
                    onChange={(e) => setEditedTicket(prev => ({ ...prev, fechaCierre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma de quien cierra la orden
                  </label>
                  <div className="border border-gray-300 rounded-md p-4 h-24 flex items-end justify-center bg-gray-50">
                    <span className="text-xs text-gray-400">Espacio para firma</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Building, Save, Plus, Trash2, User, Wrench, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TicketEditModal({ isOpen, onClose, ticket, onSave }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [editedTicket, setEditedTicket] = useState({
    description: ticket?.description || "",
    status: ticket?.status || "",
    prioridad: ticket?.prioridad || "",
    fechaCierre: ticket?.fechaCierre || "",
    diagnostico: ticket?.diagnostico || "Diagnóstico técnico pendiente de evaluación",
    repuestosNecesarios: ticket?.repuestosNecesarios || "Por determinar según diagnóstico",
    tiempoEjecucion: ticket?.tiempoEjecucion || "2-4 horas",
    fechaFinalizacion: ticket?.fechaFinalizacion || "",
    trabajoRealizado: ticket?.trabajoRealizado || "Trabajo pendiente de ejecución",
    repuestosInstalados: ticket?.repuestosInstalados || "Ninguno instalado aún",
    tiempoEjecucionTrabajo: ticket?.tiempoEjecucionTrabajo || "Por determinar",
    fechaFinalizacionTrabajo: ticket?.fechaFinalizacionTrabajo || "",
    avances: ticket?.avances || "Ticket creado. Pendiente de asignación y diagnóstico inicial.",
    asignadoA: ticket?.asignadoA || "",
    equiposAsociados: ticket?.equiposAsociados || [],
    personalAsociado: ticket?.personalAsociado || [],
    participantes: ticket?.participantes || []
  });

  const [newEquipo, setNewEquipo] = useState("");
  const [newPersonal, setNewPersonal] = useState("");
  const [newParticipante, setNewParticipante] = useState("");

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

  const handleSave = () => {
    // Detectar cambios
    const changes = [];
    if (editedTicket.description !== ticket.description) changes.push('Descripción');
    if (editedTicket.status !== ticket.status) changes.push('Estado');
    if (editedTicket.diagnostico !== (ticket.diagnostico || 'Diagnóstico técnico pendiente de evaluación')) changes.push('Diagnóstico');
    if (editedTicket.repuestosNecesarios !== (ticket.repuestosNecesarios || 'Por determinar según diagnóstico')) changes.push('Repuestos necesarios');
    if (editedTicket.tiempoEjecucion !== (ticket.tiempoEjecucion || '2-4 horas')) changes.push('Tiempo de ejecución');
    if (editedTicket.fechaFinalizacion !== (ticket.fechaFinalizacion || '')) changes.push('Fecha de finalización');
    if (editedTicket.trabajoRealizado !== (ticket.trabajoRealizado || 'Trabajo pendiente de ejecución')) changes.push('Trabajo realizado');
    if (editedTicket.repuestosInstalados !== (ticket.repuestosInstalados || 'Ninguno instalado aún')) changes.push('Repuestos instalados');
    if (editedTicket.tiempoEjecucionTrabajo !== (ticket.tiempoEjecucionTrabajo || 'Por determinar')) changes.push('Tiempo de ejecución del trabajo');
    if (editedTicket.fechaFinalizacionTrabajo !== (ticket.fechaFinalizacionTrabajo || '')) changes.push('Fecha de finalización del trabajo');
    if (editedTicket.avances !== (ticket.avances || 'Ticket creado. Pendiente de asignación y diagnóstico inicial.')) changes.push('Avances');
    if (editedTicket.fechaCierre !== (ticket.fechaCierre || '')) changes.push('Fecha de cierre');

    if (changes.length === 0) {
      toast.error('Edición cancelada - No se realizaron cambios');
      return;
    }

    setPendingChanges(changes);
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    setShowConfirmDialog(false);
    onSave({
      ...ticket,
      ...editedTicket
    });
    toast.success('Ticket actualizado correctamente', {
      description: `Campos editados: ${pendingChanges.join(', ')}`,
      duration: 3000
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/images/logo_huv.jpg" 
                alt="Logo HUV" 
                className="w-16 h-16 mr-4 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.huv.gov.co/wp-content/uploads/2020/01/logo-huv.png';
                }}
              />
              <div>
                <h1 className="text-xl font-bold">Hospital Universitario del Valle</h1>
                <p className="text-blue-100 text-sm">Evaristo García - Editar Ticket #{ticket.id}</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Encabezado (Solo lectura) */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ENCABEZADO (Solo lectura)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sede *</label>
                <p className="text-sm text-gray-900 mt-1">SEDE PRINCIPAL</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Centro de costo *</label>
                <p className="text-sm text-gray-900 mt-1">CC-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Servicio *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.origin}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">O.T. # *</label>
                <p className="text-sm text-gray-900 mt-1">OT-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.area}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">O.T *</label>
                <p className="text-sm text-gray-900 mt-1">#{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date}</p>
              </div>
            </div>
          </div>

          {/* Equipo (Solo lectura) */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">EQUIPO (Solo lectura)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipo *</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{ticket.equipo}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modelo *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.equipo?.split(' ').slice(-1)[0] || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serie *</label>
                <p className="text-sm text-gray-900 mt-1">SN-{ticket.id}001</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marca *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.equipo?.split(' ')[0] || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">No. Inventario *</label>
                <p className="text-sm text-gray-900 mt-1">INV-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Solicitado por *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.creadoPor}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo electrónico *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.creadoPor?.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@huv.gov.co</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">TIPO DE ARREGLO *</label>
                <p className="text-sm text-gray-900 mt-1 uppercase">{ticket.tipo}</p>
              </div>
            </div>
          </div>

          {/* Problema (Editable) */}
          <div className="mb-6">
            <div className="border-l-4 border-orange-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-orange-900">PROBLEMA (Editable)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-orange-200 p-3 rounded col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción del problema presentado *</label>
                <Textarea
                  value={editedTicket.description}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full border-orange-300 focus:border-orange-500"
                />
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Empresa Asignada *</label>
                <p className="text-sm text-gray-900 mt-1">Hospital Universitario del Valle</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asignación específica *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.asignadoA}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de asignación *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date} {ticket.time}</p>
              </div>
            </div>
          </div>

          {/* Diagnóstico (Editable) */}
          <div className="mb-6">
            <div className="border-l-4 border-green-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-green-900">DIAGNÓSTICO (Editable)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-green-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diagnóstico *</label>
                <Textarea
                  value={editedTicket.diagnostico}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, diagnostico: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full border-green-300 focus:border-green-500"
                />
              </div>
              <div className="border border-green-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repuestos necesarios *</label>
                <Textarea
                  value={editedTicket.repuestosNecesarios}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, repuestosNecesarios: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full border-green-300 focus:border-green-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsable del diagnóstico *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.asignadoA}</p>
              </div>
              <div className="border border-green-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tiempo de ejecución *</label>
                <input
                  type="text"
                  value={editedTicket.tiempoEjecucion}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, tiempoEjecucion: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-green-300 rounded-md focus:border-green-500"
                />
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Inicio *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date}</p>
              </div>
              <div className="border border-green-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de finalización *</label>
                <input
                  type="date"
                  value={editedTicket.fechaFinalizacion}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, fechaFinalizacion: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-green-300 rounded-md focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Trabajo Realizado (Editable) */}
          <div className="mb-6">
            <div className="border-l-4 border-blue-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900">TRABAJO REALIZADO (Editable)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-blue-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo y descripción del trabajo realizado *</label>
                <Textarea
                  value={editedTicket.trabajoRealizado}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, trabajoRealizado: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full border-blue-300 focus:border-blue-500"
                />
              </div>
              <div className="border border-blue-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repuestos instalados *</label>
                <Textarea
                  value={editedTicket.repuestosInstalados}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, repuestosInstalados: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full border-blue-300 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsable de la reparación *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.asignadoA}</p>
              </div>
              <div className="border border-blue-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tiempo de ejecución *</label>
                <input
                  type="text"
                  value={editedTicket.tiempoEjecucionTrabajo}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, tiempoEjecucionTrabajo: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500"
                />
              </div>
              <div className="border border-gray-200 p-3 rounded bg-gray-50">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Inicio *</label>
                <p className="text-sm text-gray-900 mt-1">Pendiente</p>
              </div>
              <div className="border border-blue-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de finalización *</label>
                <input
                  type="date"
                  value={editedTicket.fechaFinalizacionTrabajo}
                  onChange={(e) => setEditedTicket(prev => ({ ...prev, fechaFinalizacionTrabajo: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-blue-300 rounded-md focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Asociaciones (Editable) */}
          <div className="mb-6">
            <div className="border-l-4 border-indigo-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">ASOCIACIONES (Editable)</h3>
            </div>
            
            {/* Asignación de Personal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="border border-indigo-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asignado a *</label>
                <Select
                  value={editedTicket.asignadoA}
                  onValueChange={(value) => setEditedTicket(prev => ({ ...prev, asignadoA: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleccionar personal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Juan Sebastián Torres">Juan Sebastián Torres</SelectItem>
                    <SelectItem value="Pedro Ramírez">Pedro Ramírez</SelectItem>
                    <SelectItem value="Aura María Castillo">Aura María Castillo</SelectItem>
                    <SelectItem value="Angelica María López">Angelica María López</SelectItem>
                    <SelectItem value="Natalia Pedrerosa">Natalia Pedrerosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Equipos Asociados */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipos Asociados</label>
              <div className="mt-2 space-y-2">
                {editedTicket.equiposAsociados.map((equipo, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Wrench className="w-4 h-4 text-gray-500" />
                    <span className="flex-1 text-sm">{equipo}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newEquipos = editedTicket.equiposAsociados.filter((_, i) => i !== index);
                        setEditedTicket(prev => ({ ...prev, equiposAsociados: newEquipos }));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar equipo..."
                    value={newEquipo}
                    onChange={(e) => setNewEquipo(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (newEquipo.trim()) {
                        setEditedTicket(prev => ({
                          ...prev,
                          equiposAsociados: [...prev.equiposAsociados, newEquipo.trim()]
                        }));
                        setNewEquipo("");
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Personal Asociado */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Personal Asociado</label>
              <div className="mt-2 space-y-2">
                {editedTicket.personalAsociado.map((personal, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="flex-1 text-sm">{personal}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newPersonal = editedTicket.personalAsociado.filter((_, i) => i !== index);
                        setEditedTicket(prev => ({ ...prev, personalAsociado: newPersonal }));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar personal..."
                    value={newPersonal}
                    onChange={(e) => setNewPersonal(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (newPersonal.trim()) {
                        setEditedTicket(prev => ({
                          ...prev,
                          personalAsociado: [...prev.personalAsociado, newPersonal.trim()]
                        }));
                        setNewPersonal("");
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Participantes */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participantes</label>
              <div className="mt-2 space-y-2">
                {editedTicket.participantes.map((participante, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="flex-1 text-sm">{participante}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newParticipantes = editedTicket.participantes.filter((_, i) => i !== index);
                        setEditedTicket(prev => ({ ...prev, participantes: newParticipantes }));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar participante..."
                    value={newParticipante}
                    onChange={(e) => setNewParticipante(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (newParticipante.trim()) {
                        setEditedTicket(prev => ({
                          ...prev,
                          participantes: [...prev.participantes, newParticipante.trim()]
                        }));
                        setNewParticipante("");
                      }
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Avances (Editable) */}
          <div className="mb-6">
            <div className="border-l-4 border-purple-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-purple-900">AVANCES (Editable)</h3>
            </div>
            <div className="border border-purple-200 p-3 rounded">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avances *</label>
              <Textarea
                value={editedTicket.avances}
                onChange={(e) => setEditedTicket(prev => ({ ...prev, avances: e.target.value }))}
                rows={3}
                className="mt-2 w-full border-purple-300 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Estado y Prioridad (Editable) */}
          <div className="mb-6">
            <div className="border-l-4 border-red-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-red-900">ESTADO Y PRIORIDAD (Editable)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</label>
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
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abierto">Abierto</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Cerrado">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridad</label>
                <Select
                  value={editedTicket.prioridad}
                  onValueChange={(value) => setEditedTicket(prev => ({ ...prev, prioridad: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baja">Baja</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editedTicket.status === 'Cerrado' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-3 rounded">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de cierre *</label>
                  <input
                    type="datetime-local"
                    value={editedTicket.fechaCierre || ''}
                    onChange={(e) => setEditedTicket(prev => ({ ...prev, fechaCierre: e.target.value }))}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="border border-gray-200 p-3 rounded" style={{minHeight: '100px'}}>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Firma de quien cierra la orden *</label>
                  <div className="mt-2 h-16 border-b border-gray-300 flex items-end justify-center">
                    <p className="text-xs text-gray-400 mb-1">Espacio para firma</p>
                  </div>
                </div>
              </div>
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

      {/* Modal de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Guardar Cambios
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Está seguro de que desea guardar los cambios realizados?
              {pendingChanges.length > 0 && (
                <span className="block mt-2 font-medium">
                  Campos modificados: {pendingChanges.join(', ')}
                </span>
              )}
            </p>
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
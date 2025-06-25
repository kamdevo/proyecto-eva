"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Trash2, Calendar } from "lucide-react";

const observacionesEjemplo = [
  {
    id: 1,
    texto: "Requiere calibración de precisión en el sistema de enfoque",
    prioridad: "alta",
    fecha: "2024-06-15",
    responsable: "J. Restrepo",
    estado: "pendiente",
  },
  {
    id: 2,
    texto: "Revisar sistema de refrigeración, temperatura elevada",
    prioridad: "media",
    fecha: "2024-06-10",
    responsable: "Ingenieros Biomédicos",
    estado: "en-proceso",
  },
  {
    id: 3,
    texto: "Mantenimiento preventivo completado satisfactoriamente",
    prioridad: "baja",
    fecha: "2024-06-05",
    responsable: "SYSMED",
    estado: "completado",
  },
];

export function EditarObservacionesModal({ open, onOpenChange, equipo }) {
  const [observaciones, setObservaciones] = useState(observacionesEjemplo);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPrioridad, setEditPrioridad] = useState("");

  const handleEdit = (observacion) => {
    setEditingId(observacion.id);
    setEditText(observacion.texto);
    setEditPrioridad(observacion.prioridad);
  };

  const handleSave = (id) => {
    setObservaciones((prev) =>
      prev.map((obs) =>
        obs.id === id
          ? { ...obs, texto: editText, prioridad: editPrioridad }
          : obs
      )
    );
    setEditingId(null);
    setEditText("");
    setEditPrioridad("");
  };

  const handleDelete = (id) => {
    setObservaciones((prev) => prev.filter((obs) => obs.id !== id));
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "critica":
        return "bg-red-100 text-red-800";
      case "alta":
        return "bg-orange-100 text-orange-800";
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "completado":
        return "bg-green-100 text-green-800";
      case "en-proceso":
        return "bg-blue-100 text-blue-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!equipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-green-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Editar Observaciones
              </DialogTitle>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          {/* Información del equipo */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-slate-600">Equipo:</span>
                <div className="text-slate-900 font-medium">
                  {equipo.equipo}
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-600">ID:</span>
                <div className="text-slate-900">#{equipo.id}</div>
              </div>
              <div>
                <span className="font-medium text-slate-600">Código:</span>
                <div className="text-slate-900">{equipo.codigo}</div>
              </div>
            </div>
          </div>

          {/* Lista de observaciones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-800">
                Observaciones Registradas
              </h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {observaciones.length} observaciones
              </Badge>
            </div>

            {observaciones.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Edit className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No hay observaciones registradas para este equipo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {observaciones.map((observacion) => (
                  <div
                    key={observacion.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={getPrioridadColor(observacion.prioridad)}
                          >
                            {observacion.prioridad.charAt(0).toUpperCase() +
                              observacion.prioridad.slice(1)}
                          </Badge>
                          <Badge className={getEstadoColor(observacion.estado)}>
                            {observacion.estado.replace("-", " ")}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(observacion.fecha).toLocaleDateString(
                              "es-ES"
                            )}
                          </div>
                        </div>

                        {editingId === observacion.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="min-h-[80px] text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <Select
                                value={editPrioridad}
                                onValueChange={setEditPrioridad}
                              >
                                <SelectTrigger className="w-40 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="baja">🟢 Baja</SelectItem>
                                  <SelectItem value="media">
                                    🟡 Media
                                  </SelectItem>
                                  <SelectItem value="alta">🟠 Alta</SelectItem>
                                  <SelectItem value="critica">
                                    🔴 Crítica
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => handleSave(observacion.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-slate-700 mb-2">
                              {observacion.texto}
                            </p>
                            <div className="text-xs text-slate-500">
                              <span className="font-medium">Responsable:</span>{" "}
                              {observacion.responsable}
                            </div>
                          </>
                        )}
                      </div>

                      {editingId !== observacion.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(observacion)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 w-8 h-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(observacion.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 w-8 h-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

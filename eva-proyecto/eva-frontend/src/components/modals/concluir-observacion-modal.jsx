import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Calendar, AlertTriangle } from "lucide-react";

const observacionesPendientes = [
  {
    id: 1,
    texto: "Requiere calibración de precisión en el sistema de enfoque",
    prioridad: "alta",
    fecha: "2024-06-15",
    responsable: "J. Restrepo",
  },
  {
    id: 2,
    texto: "Revisar sistema de refrigeración, temperatura elevada",
    prioridad: "media",
    fecha: "2024-06-10",
    responsable: "Ingenieros Biomédicos",
  },
];

export function ConcluirObservacionModal({ open, onOpenChange, equipo }) {
  const [selectedObservacion, setSelectedObservacion] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [resultado, setResultado] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Concluyendo observación:", {
      selectedObservacion,
      conclusion,
      resultado,
      equipoId: equipo?.id,
    });
    onOpenChange(false);
    // Limpiar formulario
    setSelectedObservacion("");
    setConclusion("");
    setResultado("");
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
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

  if (!equipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-purple-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Concluir Observación
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-3"></div>
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
                <span className="font-medium text-slate-600">Responsable:</span>
                <div className="text-slate-900">{equipo.responsable}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleccionar observación */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">
                Observación a Concluir *
              </Label>
              {observacionesPendientes.length === 0 ? (
                <div className="text-center py-6 text-slate-500 border border-slate-200 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>No hay observaciones pendientes para este equipo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {observacionesPendientes.map((obs) => (
                    <div
                      key={obs.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedObservacion === obs.id.toString()
                          ? "border-purple-300 bg-purple-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedObservacion(obs.id.toString())}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getPrioridadColor(obs.prioridad)}>
                              {obs.prioridad.charAt(0).toUpperCase() +
                                obs.prioridad.slice(1)}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(obs.fecha).toLocaleDateString("es-ES")}
                            </div>
                          </div>
                          <p className="text-sm text-slate-700">{obs.texto}</p>
                          <div className="text-xs text-slate-500 mt-1">
                            <span className="font-medium">Responsable:</span>{" "}
                            {obs.responsable}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <input
                            type="radio"
                            name="observacion"
                            value={obs.id}
                            checked={selectedObservacion === obs.id.toString()}
                            onChange={() =>
                              setSelectedObservacion(obs.id.toString())
                            }
                            className="w-4 h-4 text-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resultado */}
            <div className="space-y-3">
              <Label
                htmlFor="resultado"
                className="text-sm font-medium text-slate-700"
              >
                Resultado *
              </Label>
              <Select value={resultado} onValueChange={setResultado} required>
                <SelectTrigger className="h-10 bg-slate-50 border-slate-300">
                  <SelectValue placeholder="Seleccionar resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resuelto">
                    ✅ Resuelto Satisfactoriamente
                  </SelectItem>
                  <SelectItem value="parcial">
                    ⚠️ Resuelto Parcialmente
                  </SelectItem>
                  <SelectItem value="no-resuelto">❌ No Resuelto</SelectItem>
                  <SelectItem value="requiere-seguimiento">
                    🔄 Requiere Seguimiento
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conclusión */}
            <div className="space-y-3">
              <Label
                htmlFor="conclusion"
                className="text-sm font-medium text-slate-700"
              >
                Conclusión y Detalles *
              </Label>
              <Textarea
                id="conclusion"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Describa detalladamente las acciones realizadas, resultados obtenidos y cualquier recomendación adicional..."
                className="min-h-[120px] text-sm bg-slate-50 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Importante:</strong> Al concluir una observación, esta
                  se marcará como completada y se registrará en el historial del
                  equipo. Esta acción no se puede deshacer.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedObservacion || observacionesPendientes.length === 0
                }
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir Observación
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

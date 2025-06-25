import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2, FileText } from "lucide-react";

export function EliminarEquipoModal({ open, onOpenChange, equipo }) {
  const handleDelete = () => {
    console.log("Eliminando equipo:", equipo?.id);
    // Aquí iría la lógica para eliminar el equipo
    onOpenChange(false);
  };

  if (!equipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-red-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Eliminar Equipo
              </DialogTitle>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mt-3"></div>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-center gap-4 p-6 border border-red-200 rounded-xl bg-red-50 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-900 text-lg mb-1">
                ¿Está seguro de eliminar este equipo del cronograma?
              </div>
              <div className="text-sm text-red-700">
                Esta acción eliminará permanentemente el equipo y toda su
                información asociada del sistema de mantenimiento preventivo.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-800">
                  Información del Equipo a Eliminar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-slate-600">ID:</span>
                    <span className="ml-2 text-slate-900">#{equipo.id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Equipo:</span>
                    <span className="ml-2 text-slate-900">{equipo.equipo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Código:</span>
                    <span className="ml-2 text-slate-900">{equipo.codigo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Serie:</span>
                    <span className="ml-2 text-slate-900">{equipo.serie}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-slate-600">Marca:</span>
                    <span className="ml-2 text-slate-900">{equipo.marca}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Modelo:</span>
                    <span className="ml-2 text-slate-900">{equipo.modelo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">
                      Responsable:
                    </span>
                    <span className="ml-2 text-slate-900">
                      {equipo.responsable}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Estado:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs ${
                        equipo.cumplimientoGlobal === "Si cumple"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {equipo.cumplimientoGlobal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Consecuencias de la eliminación:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>
                      Se eliminará el cronograma de mantenimiento programado
                    </li>
                    <li>Se perderán todas las observaciones registradas</li>
                    <li>
                      Se eliminará el historial de mantenimientos realizados
                    </li>
                    <li>Se perderán los reportes y documentación asociada</li>
                    <li>Esta acción no se puede deshacer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Alternativa recomendada:</strong> En lugar de eliminar
                  el equipo, considere marcarlo como "Fuera de Servicio" o
                  "Inactivo" para mantener el historial de mantenimiento para
                  futuras referencias.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-8 py-3 text-sm font-medium border-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Equipo Permanentemente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

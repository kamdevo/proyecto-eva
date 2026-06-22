import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { migrateEquipmentType } from "../../services/httpService";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Modal de confirmación para migrar el tipo de un equipo:
 * biomédico (tipo_id=1) <-> industrial (tipo_id=2).
 *
 * Props:
 *  - open, onOpenChange
 *  - equipment: objeto del equipo (usa equipment.id / equipment.equipo?.code / name / brand / model)
 *  - equipmentType: "biomedical" | "industrial"  (tipo ACTUAL del equipo)
 *  - onMigrated(id): callback tras migrar con éxito
 */
export function MigrateTypeConfirmModal({
  open,
  onOpenChange,
  equipment,
  equipmentType = "biomedical",
  onMigrated,
}) {
  const [isMigrating, setIsMigrating] = useState(false);

  // Tipo destino: lo contrario al tipo actual
  const isBiomedical = equipmentType === "biomedical";
  const targetTipoId = isBiomedical ? 2 : 1;
  const targetLabel = isBiomedical ? "Industrial" : "Biomédico";
  const currentLabel = isBiomedical ? "Biomédico" : "Industrial";

  const handleMigrate = async () => {
    if (!equipment?.id) {
      toast.error("Error: ID de equipo no válido");
      return;
    }

    setIsMigrating(true);
    const toastId = "migrate-equipment-type";

    try {
      toast.loading("Migrando tipo de equipo...", { id: toastId });

      const result = await migrateEquipmentType(equipment.id, targetTipoId);

      if (result.success) {
        toast.success(result.message || `Equipo migrado a ${targetLabel}`, { id: toastId });
        if (onMigrated) {
          onMigrated(equipment.id);
        }
        onOpenChange(false);
      } else {
        toast.error(result.error || "Error al migrar el tipo de equipo", { id: toastId });
      }
    } catch (error) {
      console.error("❌ Error inesperado al migrar tipo de equipo:", error);
      toast.error("Error inesperado al migrar el tipo de equipo", { id: toastId });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-indigo-700 border-b border-indigo-200 pb-2 flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Migrar Tipo de Equipo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="text-center">
            <div className="bg-indigo-100 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <ArrowLeftRight className="h-10 w-10 text-indigo-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¿Migrar este equipo a <span className="text-indigo-700">{targetLabel}</span>?
            </h3>

            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                {currentLabel}
              </span>
              <ArrowLeftRight className="h-4 w-4 text-indigo-500" />
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                {targetLabel}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>ID:</strong> {equipment.equipo?.code || equipment.code || equipment.id}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Nombre:</strong>{" "}
                {equipment.equipo?.name || equipment.name || "Sin nombre"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Marca:</strong>{" "}
                {equipment.equipo?.brand || equipment.marca || "Sin marca"} -{" "}
                {equipment.equipo?.model || equipment.modelo || "Sin modelo"}
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg mt-4">
              <p className="text-sm text-indigo-700">
                El equipo dejará de aparecer en el listado de <strong>{currentLabel}s</strong> y
                pasará al listado de <strong>{targetLabel}s</strong>. Sus datos, historial y
                documentos se conservan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 p-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isMigrating}
          >
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
            onClick={handleMigrate}
            disabled={isMigrating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isMigrating ? "animate-spin" : ""}`} />
            {isMigrating ? "Migrando..." : `Migrar a ${targetLabel}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

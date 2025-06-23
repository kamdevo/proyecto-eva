import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export function DeleteModal({ isOpen, onClose, onConfirm, guideData }) {
  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <DialogHeader className="bg-red-500 px-6 py-4 text-center">
          <DialogTitle className="text-lg font-medium text-white">
            Confirmar Eliminación
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-700 mb-2">
            ¿Está seguro que desea eliminar esta guía?
          </p>
          {guideData && (
            <p className="text-sm text-gray-600 font-medium">
              "{guideData.name}"
            </p>
          )}
          <p className="text-sm text-red-600 mt-4">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 bg-gray-50 border-t gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

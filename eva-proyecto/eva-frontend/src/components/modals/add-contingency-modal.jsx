import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

export function AddContingencyModal({ open, onOpenChange }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">
              Agregar
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-4">
            Contingencia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor="fecha"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Fecha<span className="text-destructive">*</span>
              </Label>
              <Input
                id="fecha"
                type="date"
                defaultValue="2024-06-18"
                className="h-8 sm:h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label
                htmlFor="observacion"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Observación<span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="observacion"
                placeholder="Ingrese información detallada de la contingencia"
                className="text-xs sm:text-sm min-h-[60px] sm:min-h-[80px] resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">
              Archivo asociado<span className="text-destructive">*</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                dragActive
                  ? "border-teal-400 bg-teal-50"
                  : "border-slate-300 bg-slate-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">
                Drag & drop files here
              </div>
              <div className="text-slate-400 text-xs">
                (or click to select file)
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200"
            >
              SELECT FILE
            </Button>
            <Button
              size="sm"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
            >
              📁 Browse...
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm"
          >
            Close
          </Button>
          <Button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-9 text-sm">
            Insertar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EditModal({ isOpen, onClose, guideData }) {
  const [formData, setFormData] = useState({
    quickGuide: guideData?.name || "",
    name: guideData?.name || "",
    status: guideData?.status || "Activo",
    file: null,
  });

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.dataTransfer.files[0] }));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSave = () => {
    console.log("Guardando:", formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="bg-gray-100 px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium text-gray-800">
            Editar
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Guía rápida */}
          <div className="space-y-2">
            <Label
              htmlFor="quick-guide"
              className="text-sm font-medium text-gray-700"
            >
              Guía rápida
            </Label>
            <Input
              id="quick-guide"
              value={formData.quickGuide}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, quickGuide: e.target.value }))
              }
              className="w-full"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full"
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label
              htmlFor="status"
              className="text-sm font-medium text-gray-700"
            >
              Estado
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Archivo</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop files here or Click to select file
              </p>
              {formData.file && (
                <p className="text-xs text-blue-600 font-medium">
                  Archivo seleccionado: {formData.file.name}
                </p>
              )}
            </div>
          </div>

          {/* SELECT FILE Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-input")?.click()}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              SELECT FILE
            </Button>
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

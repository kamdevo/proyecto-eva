import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Upload, X, FileText, Gauge } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

const AddCalibracionModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onCalibracionAdded,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    fecha_calibracion: new Date().toISOString().split("T")[0],
    fecha_programada: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        description: "",
        fecha_calibracion: new Date().toISOString().split("T")[0],
        fecha_programada: "",
        file: null,
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no puede ser mayor a 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de archivo no permitido");
        return;
      }

      handleInputChange("file", file);
      toast.success("Archivo cargado correctamente");
    }
  };

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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    handleInputChange("file", null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "El código de calibración es obligatorio";
    }

    if (!formData.fecha_calibracion) {
      newErrors.fecha_calibracion = "La fecha de ejecución es obligatoria";
    }

    if (!formData.fecha_programada) {
      newErrors.fecha_programada = "La fecha programada es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor complete los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    const toastId = 'add-calibracion';

    try {
      toast.loading('Registrando calibración...', { id: toastId });
      
      const formDataToSend = new FormData();
      formDataToSend.append("equipo_id", equipmentId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("fecha_calibracion", formData.fecha_calibracion);
      formDataToSend.append("fecha_programada", formData.fecha_programada);
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const response = await httpService.post("/v1/calibracion", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Calibración agregada exitosamente", { id: toastId });
        if (onCalibracionAdded) onCalibracionAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error al agregar calibración:", error);
      toast.error(error.response?.data?.message || "Error al agregar la calibración", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <Gauge className="h-5 w-5" />
            Agregar Calibración
          </DialogTitle>
          {equipmentName && (
            <p className="text-sm text-gray-600">
              Equipo: <span className="font-medium">{equipmentName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código Calibración */}
          <div className="space-y-2">
            <Label htmlFor="description" className="required">
              Código de Calibración
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="Ingrese el código de la calibración"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Fecha de Ejecución */}
          <div className="space-y-2">
            <Label htmlFor="fecha_calibracion" className="required">
              Fecha de Ejecución
            </Label>
            <div className="relative">
              <Input
                id="fecha_calibracion"
                type="date"
                value={formData.fecha_calibracion}
                onChange={(e) =>
                  handleInputChange("fecha_calibracion", e.target.value)
                }
                className={errors.fecha_calibracion ? "border-red-500" : ""}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fecha_calibracion && (
              <p className="text-sm text-red-500">{errors.fecha_calibracion}</p>
            )}
          </div>

          {/* Fecha Programada */}
          <div className="space-y-2">
            <Label htmlFor="fecha_programada" className="required">
              Fecha Programada
            </Label>
            <div className="relative">
              <Input
                id="fecha_programada"
                type="date"
                value={formData.fecha_programada}
                onChange={(e) =>
                  handleInputChange("fecha_programada", e.target.value)
                }
                className={errors.fecha_programada ? "border-red-500" : ""}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fecha_programada && (
              <p className="text-sm text-red-500">{errors.fecha_programada}</p>
            )}
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label htmlFor="archivo">Archivo (Certificado de Calibración)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">
                      {formData.file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(formData.file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Arrastra un archivo aquí o{" "}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      selecciona uno
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Word, JPG, PNG (máx. 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Calibración"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCalibracionModal;

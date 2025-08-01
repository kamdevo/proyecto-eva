import React, { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Calendar, Upload, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

const AddObservacionModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onObservationAdded,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    fecha_nota: new Date().toISOString().split("T")[0],
    repuesto_id: "",
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
        fecha_nota: new Date().toISOString().split("T")[0],
        repuesto_id: "",
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
        toast.error("Tipo de archivo no permitido. Use PDF, Word o imágenes");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (!formData.fecha_nota) {
      newErrors.fecha_nota = "La fecha es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("description", formData.description);
      submitData.append("equipo_id", equipmentId);
      submitData.append("fecha_nota", formData.fecha_nota);
      submitData.append("repuesto_id", formData.repuesto_id || "");
      submitData.append("preventivo_id", 1); // Default value as per database structure

      if (formData.file) {
        submitData.append("file", formData.file);
      }

      const response = await httpService.post(
        "/observaciones/equipo",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Observación agregada exitosamente");
        onObservationAdded && onObservationAdded();
        onClose();
      } else {
        throw new Error(
          response.data.message || "Error al crear la observación"
        );
      }
    } catch (error) {
      console.error("Error creating observation:", error);
      toast.error(
        error.response?.data?.message || "Error al crear la observación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="w-5 h-5 text-blue-600" />
            Agregar Observación
          </DialogTitle>
          <div className="text-sm text-slate-600">
            Equipo: <span className="font-medium">{equipmentName}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Ingrese la descripción de la observación..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-[100px] ${
                errors.description ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Date Row */}
          <div className="space-y-2">
            <Label htmlFor="fecha_nota" className="text-sm font-medium">
              Fecha de la observación <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="fecha_nota"
                type="date"
                value={formData.fecha_nota}
                onChange={(e) =>
                  handleInputChange("fecha_nota", e.target.value)
                }
                className={`${errors.fecha_nota ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.fecha_nota && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.fecha_nota}
              </p>
            )}
          </div>

          {/* Spare Part ID */}
          <div className="space-y-2">
            <Label htmlFor="repuesto_id" className="text-sm font-medium">
              Repuesto pendiente (opcional)
            </Label>
            <Input
              id="repuesto_id"
              placeholder="ID del repuesto si aplica..."
              value={formData.repuesto_id}
              onChange={(e) => handleInputChange("repuesto_id", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Archivo adjunto (opcional)
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700">
                      {formData.file.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">
                    Arrastra y suelta un archivo aquí, o{" "}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                      selecciona un archivo
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={isSubmitting}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, Word, JPG, PNG (máx. 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Guardando..." : "Agregar Observación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddObservacionModal;

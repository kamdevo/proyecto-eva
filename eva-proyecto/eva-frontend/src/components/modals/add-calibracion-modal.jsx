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
import { Calendar, Gauge } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import FileDropzone from "@/components/common/FileDropzone";

const AddCalibracionModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onCalibracionAdded,
  calibracion = null,
}) => {
  const isEditing = !!calibracion;
  const [formData, setFormData] = useState({
    description: "",
    fecha_calibracion: new Date().toISOString().split("T")[0],
    fecha_programada: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      if (calibracion) {
        setFormData({
          description: calibracion.description || "",
          fecha_calibracion: calibracion.fecha_calibracion
            ? new Date(calibracion.fecha_calibracion).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          fecha_programada: calibracion.fecha_programada
            ? new Date(calibracion.fecha_programada).toISOString().split("T")[0]
            : "",
          file: null,
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        const parts = today.split('-');
        const lastDay = new Date(parseInt(parts[0]), parseInt(parts[1]), 0);
        const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth()+1).padStart(2,'0')}-${String(lastDay.getDate()).padStart(2,'0')}`;
        setFormData({
          description: "",
          fecha_calibracion: today,
          fecha_programada: lastDayStr,
          file: null,
        });
      }
      setErrors({});
    }
  }, [isOpen, calibracion]);

  const getLastDayOfMonth = (dateString) => {
    if (!dateString) return '';
    try {
      const parts = dateString.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const lastDay = new Date(year, month, 0);
      const resYear = lastDay.getFullYear();
      const resMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
      const resDay = String(lastDay.getDate()).padStart(2, '0');
      return `${resYear}-${resMonth}-${resDay}`;
    } catch (e) {
      return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-calcular fecha_programada al cambiar fecha_calibracion
      if (field === 'fecha_calibracion' && value) {
        updated.fecha_programada = getLastDayOfMonth(value);
      }
      return updated;
    });

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
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de archivo no permitido");
        return;
      }

      handleInputChange("file", file);
      toast.success("Archivo cargado correctamente");
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
      toast.loading(isEditing ? 'Actualizando calibración...' : 'Registrando calibración...', { id: toastId });
      
      const formDataToSend = new FormData();
      formDataToSend.append("equipo_id", equipmentId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("fecha_calibracion", formData.fecha_calibracion);
      formDataToSend.append("fecha_programada", formData.fecha_programada);
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      let response;
      if (isEditing) {
        formDataToSend.append("_method", "PUT");
        response = await httpService.post(`/v1/calibracion/${calibracion.id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await httpService.post("/v1/calibracion", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast.success(isEditing ? "Calibración actualizada exitosamente" : "Calibración agregada exitosamente", { id: toastId });
        // Esperar a que el padre recargue el historial antes de cerrar el modal
        if (onCalibracionAdded) {
          try { await onCalibracionAdded(); } catch (e) { console.warn('Error en onCalibracionAdded:', e); }
        }
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar calibración:", error);
      toast.error(error.response?.data?.message || "Error al guardar la calibración", { id: toastId });
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
            {isEditing ? "Editar Calibración" : "Agregar Calibración"}
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
            <FileDropzone
              file={formData.file}
              onFileChange={handleFileChange}
              onRemove={handleRemoveFile}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
            />
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

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
import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/components/ui/searchable-select";
import { Calendar, Package } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import FileDropzone from "@/components/common/FileDropzone";
import { useRepuestos } from "../../hooks/useRepuestos";

const AddRepuestoModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onRepuestoAdded,
}) => {
  const [formData, setFormData] = useState({
    repuesto_id: "",
    observacion: "",
    cantidad_entregada: "",
    fecha: new Date().toISOString().split("T")[0],
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repuestoFreeText, setRepuestoFreeText] = useState("");

  // Cargar repuestos desde la BD
  const { repuestos, loading: repuestosLoading } = useRepuestos();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        repuesto_id: "",
        observacion: "",
        cantidad_entregada: "",
        fecha: new Date().toISOString().split("T")[0],
        file: null,
      });
      setRepuestoFreeText("");
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

  const handleRemoveFile = () => {
    handleInputChange("file", null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.repuesto_id && !repuestoFreeText.trim()) {
      newErrors.repuesto_id = "El repuesto es obligatorio";
    }

    if (!formData.cantidad_entregada || parseInt(formData.cantidad_entregada) <= 0) {
      newErrors.cantidad_entregada = "La cantidad debe ser mayor a 0";
    }

    if (!formData.observacion.trim()) {
      newErrors.observacion = "La observación es obligatoria";
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha de instalación es obligatoria";
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
    const toastId = 'add-repuesto';

    try {
      toast.loading('Registrando repuesto/accesorio...', { id: toastId });
      
      const formDataToSend = new FormData();
      formDataToSend.append("equipo_id", equipmentId);
      if (formData.repuesto_id) {
        formDataToSend.append("repuesto_id", formData.repuesto_id);
      } else if (repuestoFreeText.trim()) {
        formDataToSend.append("repuesto_nombre", repuestoFreeText.trim());
      }
      formDataToSend.append("cantidad_entregada", formData.cantidad_entregada);
      formDataToSend.append("fecha", formData.fecha);
      formDataToSend.append("observacion", formData.observacion);
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const response = await httpService.post("/v1/equipo-repuestos", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Repuesto/Accesorio agregado exitosamente", { id: toastId });
        if (onRepuestoAdded) {
          try { await onRepuestoAdded(); } catch (e) { console.warn('Error en onRepuestoAdded:', e); }
        }
        onClose();
      }
    } catch (error) {
      console.error("Error al agregar repuesto:", error);
      toast.error(error.response?.data?.message || "Error al agregar el repuesto/accesorio", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-700">
            <Package className="h-5 w-5" />
            Agregar Repuesto/Accesorio
          </DialogTitle>
          {equipmentName && (
            <p className="text-sm text-gray-600">
              Equipo: <span className="font-medium">{equipmentName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Repuesto */}
          <div className="space-y-2">
            <Label htmlFor="repuesto_id" className="required">
              Repuesto/Accesorio
            </Label>
            <SearchableSelect
              options={repuestos}
              value={formData.repuesto_id}
              onChange={(value) => {
                handleInputChange("repuesto_id", value);
                if (value) setRepuestoFreeText("");
              }}
              allowFreeInput={true}
              onFreeInputChange={(text) => {
                setRepuestoFreeText(text);
                if (text) handleInputChange("repuesto_id", "");
              }}
              placeholder={repuestosLoading ? "Cargando repuestos..." : "Buscar o escribir nombre del repuesto"}
              disabled={repuestosLoading}
              className={errors.repuesto_id ? "border-red-500" : ""}
            />
            {errors.repuesto_id && (
              <p className="text-sm text-red-500">{errors.repuesto_id}</p>
            )}
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad_entregada" className="required">
              Cantidad
            </Label>
            <Input
              id="cantidad_entregada"
              type="number"
              min="1"
              value={formData.cantidad_entregada}
              onChange={(e) => handleInputChange("cantidad_entregada", e.target.value)}
              placeholder="Ingrese la cantidad"
              className={errors.cantidad_entregada ? "border-red-500" : ""}
            />
            {errors.cantidad_entregada && (
              <p className="text-sm text-red-500">{errors.cantidad_entregada}</p>
            )}
          </div>

          {/* Observación */}
          <div className="space-y-2">
            <Label htmlFor="observacion" className="required">
              Observación
            </Label>
            <Textarea
              id="observacion"
              value={formData.observacion}
              onChange={(e) => handleInputChange("observacion", e.target.value)}
              placeholder="Ingrese observaciones sobre el repuesto o accesorio"
              rows={4}
              className={errors.observacion ? "border-red-500" : ""}
            />
            {errors.observacion && (
              <p className="text-sm text-red-500">{errors.observacion}</p>
            )}
          </div>

          {/* Fecha de Instalación */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="required">
              Fecha de Instalación
            </Label>
            <div className="relative">
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  handleInputChange("fecha", e.target.value)
                }
                className={errors.fecha ? "border-red-500" : ""}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fecha && (
              <p className="text-sm text-red-500">{errors.fecha}</p>
            )}
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label htmlFor="archivo">Archivo Asociado</Label>
            <FileDropzone
              file={formData.file}
              onFileChange={handleFileChange}
              onRemove={handleRemoveFile}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              hint="PDF, Word, JPG, PNG (máx. 10MB)"
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
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Repuesto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRepuestoModal;

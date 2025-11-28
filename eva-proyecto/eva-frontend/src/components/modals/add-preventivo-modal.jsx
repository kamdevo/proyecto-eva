import React, { useState, useEffect } from "react";
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
import { Calendar, Upload, X, FileText, Wrench } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import { useProveedores } from "../../hooks/useTiposCompra";

const AddPreventivoModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onPreventivoAdded,
}) => {
  const [formData, setFormData] = useState({
    description: "",
    proveedor_mantenimiento_id: "",
    observacion: "",
    fecha_mantenimiento: new Date().toISOString().split("T")[0],
    fecha_programada: "",
    file: null,
    repuesto_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Cargar proveedores desde la BD
  const { proveedores, loading: proveedoresLoading } = useProveedores();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: "",
        proveedor_mantenimiento_id: "",
        observacion: "",
        fecha_mantenimiento: new Date().toISOString().split("T")[0],
        fecha_programada: "",
        file: null,
        repuesto_id: "",
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
      newErrors.description = "El código preventivo es obligatorio";
    }

    if (!formData.proveedor_mantenimiento_id) {
      newErrors.proveedor_mantenimiento_id = "El proveedor es obligatorio";
    }

    if (!formData.fecha_mantenimiento) {
      newErrors.fecha_mantenimiento = "La fecha de ejecución es obligatoria";
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
    const toastId = 'add-preventivo';

    try {
      toast.loading('Registrando mantenimiento preventivo...', { id: toastId });
      
      const formDataToSend = new FormData();
      formDataToSend.append("equipo_id", equipmentId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("proveedor_mantenimiento_id", formData.proveedor_mantenimiento_id);
      formDataToSend.append("observacion", formData.observacion || "");
      formDataToSend.append("fecha_mantenimiento", formData.fecha_mantenimiento);
      formDataToSend.append("fecha_programada", formData.fecha_programada);
      
      if (formData.repuesto_id) {
        formDataToSend.append("repuesto_id", formData.repuesto_id);
        formDataToSend.append("repuesto_pendiente", "si");
      } else {
        formDataToSend.append("repuesto_pendiente", "no");
      }
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      const response = await httpService.post("/v1/mantenimientos", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Mantenimiento preventivo agregado exitosamente", { id: toastId });
        if (onPreventivoAdded) onPreventivoAdded();
        onClose();
      }
    } catch (error) {
      console.error("Error al agregar preventivo:", error);
      toast.error(error.response?.data?.message || "Error al agregar el mantenimiento preventivo", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <Wrench className="h-5 w-5" />
            Agregar Mantenimiento Preventivo
          </DialogTitle>
          {equipmentName && (
            <p className="text-sm text-gray-600">
              Equipo: <span className="font-medium">{equipmentName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código Preventivo */}
          <div className="space-y-2">
            <Label htmlFor="description" className="required">
              Código Preventivo
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="Ingrese el código del preventivo"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Proveedor */}
          <div className="space-y-2">
            <Label htmlFor="proveedor_mantenimiento_id" className="required">
              Proveedor Mantenimiento
            </Label>
            <SearchableSelect
              options={proveedores}
              value={formData.proveedor_mantenimiento_id}
              onChange={(value) => handleInputChange("proveedor_mantenimiento_id", value)}
              placeholder="Seleccione un proveedor"
              loading={proveedoresLoading}
              disabled={proveedoresLoading}
              className={errors.proveedor_mantenimiento_id ? "border-red-500" : ""}
            />
            {errors.proveedor_mantenimiento_id && (
              <p className="text-sm text-red-500">{errors.proveedor_mantenimiento_id}</p>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observacion">Observaciones</Label>
            <Textarea
              id="observacion"
              value={formData.observacion}
              onChange={(e) =>
                handleInputChange("observacion", e.target.value)
              }
              placeholder="Ingrese observaciones del mantenimiento"
              rows={4}
              className={errors.observacion ? "border-red-500" : ""}
            />
            {errors.observacion && (
              <p className="text-sm text-red-500">{errors.observacion}</p>
            )}
          </div>

          {/* Fecha de Ejecución */}
          <div className="space-y-2">
            <Label htmlFor="fecha_mantenimiento" className="required">
              Fecha de Ejecución
            </Label>
            <div className="relative">
              <Input
                id="fecha_mantenimiento"
                type="date"
                value={formData.fecha_mantenimiento}
                onChange={(e) =>
                  handleInputChange("fecha_mantenimiento", e.target.value)
                }
                className={errors.fecha_mantenimiento ? "border-red-500" : ""}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.fecha_mantenimiento && (
              <p className="text-sm text-red-500">{errors.fecha_mantenimiento}</p>
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

          {/* Archivo Asociado */}
          <div className="space-y-2">
            <Label htmlFor="archivo">Archivo Asociado</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
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
                    <label className="text-green-600 hover:text-green-700 cursor-pointer">
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

          {/* Repuesto Pendiente */}
          <div className="space-y-2">
            <Label htmlFor="repuesto_id">Repuesto Pendiente (ID)</Label>
            <Input
              id="repuesto_id"
              type="number"
              value={formData.repuesto_id}
              onChange={(e) =>
                handleInputChange("repuesto_id", e.target.value)
              }
              placeholder="Ingrese ID del repuesto pendiente (si aplica)"
            />
            <p className="text-xs text-gray-500">
              Opcional: Si hay un repuesto pendiente por instalar, ingrese su ID
            </p>
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
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Preventivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPreventivoModal;

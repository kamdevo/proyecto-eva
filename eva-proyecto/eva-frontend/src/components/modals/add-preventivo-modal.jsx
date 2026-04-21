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
import { Calendar, Wrench } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import FileDropzone from "@/components/common/FileDropzone";
import { useProveedoresMantenimiento } from "../../hooks/useTiposCompra";

const AddPreventivoModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onPreventivoAdded,
  preventivo = null, // Para edición
  isIndustrial = false, // Para equipos industriales (mantenimiento_ind)
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Separar por 'T' (ISO) o espacio (MySQL) para obtener solo la parte de la fecha
    return dateString.toString().split(/[ T]/)[0];
  };

  const getLastDayOfMonth = (dateString) => {
    try {
      if (!dateString) return "";
      const parts = dateString.split("-");
      if (parts.length !== 3) return "";
      
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      
      // El día 0 del mes siguiente es el último día del mes actual
      const lastDay = new Date(year, month, 0);
      
      const resYear = lastDay.getFullYear();
      const resMonth = String(lastDay.getMonth() + 1).padStart(2, '0');
      const resDay = String(lastDay.getDate()).padStart(2, '0');
      
      return `${resYear}-${resMonth}-${resDay}`;
    } catch (e) {
      console.error("Error calculating last day of month:", e);
      return "";
    }
  };

  const initialFechaMantenimiento = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })();

  const [formData, setFormData] = useState({
    description: "",
    proveedor_mantenimiento_id: "",
    observacion: "",
    fecha_mantenimiento: initialFechaMantenimiento,
    fecha_programada: getLastDayOfMonth(initialFechaMantenimiento),
    file: null,
    repuesto_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proveedorFreeText, setProveedorFreeText] = useState("");

  // Cargar proveedores desde la BD
  const { proveedores, loading: proveedoresLoading, refresh: refreshProveedores } = useProveedoresMantenimiento();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      refreshProveedores(); // Refrescar lista para incluir proveedores recién creados
      setProveedorFreeText("");
      if (preventivo) {
        // En modo edición, cargamos los datos del preventivo seleccionado
        // Usamos substring(0, 10) para asegurar formato YYYY-MM-DD
        setFormData({
          description: preventivo.description || preventivo.descripcion || "",
          proveedor_mantenimiento_id: (preventivo.proveedor_mantenimiento_id || preventivo.proveedor_id || "").toString(),
          observacion: preventivo.observacion || preventivo.observaciones || "",
          fecha_mantenimiento: formatDate(preventivo.fecha_mantenimiento),
          fecha_programada: formatDate(preventivo.fecha_programada),
          file: null,
          repuesto_id: preventivo.repuesto_id || "",
        });
      } else {
        // Modo creación
        const today = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })();
        setFormData({
          description: "",
          proveedor_mantenimiento_id: "",
          observacion: "",
          fecha_mantenimiento: today,
          fecha_programada: getLastDayOfMonth(today),
          file: null,
          repuesto_id: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, preventivo]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Autocompletar fecha programada si cambia la fecha de ejecución
      if (field === "fecha_mantenimiento" && value) {
        newData.fecha_programada = getLastDayOfMonth(value);
      }

      return newData;
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
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("El archivo no puede ser mayor a 20MB");
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
      newErrors.description = "El código preventivo es obligatorio";
    }

    if (!isIndustrial && !formData.proveedor_mantenimiento_id && !proveedorFreeText.trim()) {
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

    if (!equipmentId) {
      toast.error("Error: No se pudo identificar el equipo. Cierre el modal e intente de nuevo.");
      return;
    }

    setIsSubmitting(true);
    const toastId = 'add-preventivo';

    try {
      toast.loading(preventivo ? 'Actualizando mantenimiento...' : 'Registrando mantenimiento...', { id: toastId });
      
      const formDataToSend = new FormData();
      formDataToSend.append("equipo_id", equipmentId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("fecha_mantenimiento", formData.fecha_mantenimiento);
      formDataToSend.append("fecha_programada", formData.fecha_programada);

      // Solo biomédico envía estos campos
      if (!isIndustrial) {
        if (formData.proveedor_mantenimiento_id) {
          formDataToSend.append("proveedor_mantenimiento_id", formData.proveedor_mantenimiento_id);
        } else if (proveedorFreeText.trim()) {
          formDataToSend.append("proveedor_nombre", proveedorFreeText.trim());
        }
        formDataToSend.append("observacion", formData.observacion || "");
        
        if (formData.repuesto_id) {
          formDataToSend.append("repuesto_id", formData.repuesto_id);
          formDataToSend.append("repuesto_pendiente", "si");
        } else {
          formDataToSend.append("repuesto_pendiente", "no");
        }
      }
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      let response;
      if (preventivo) {
        // Para Laravel, cuando se usa multipart/form-data con PUT, a veces es mejor usar POST con _method
        formDataToSend.append("_method", "PUT");
        response = await httpService.post(`/v1/mantenimientos/${preventivo.id}`, formDataToSend, {
          timeout: 120000,
        });
      } else {
        response = await httpService.post("/v1/mantenimientos", formDataToSend, {
          timeout: 120000,
        });
      }

      if (response.data.success) {
        toast.success(preventivo ? "Mantenimiento actualizado exitosamente" : "Mantenimiento agregado exitosamente", { id: toastId });
        if (onPreventivoAdded) {
          try { await onPreventivoAdded(); } catch (e) { console.warn('Error en onPreventivoAdded:', e); }
        }
        onClose();
      }
    } catch (error) {
      console.error("Error al guardar preventivo:", error);
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        toast.error(errorMessages || "Error de validación", { id: toastId });
      } else if (error?.code === 'ECONNABORTED') {
        toast.error('La subida tardó demasiado. Intenta con un archivo más pequeño.', { id: toastId });
      } else if (error?.response?.status === 413) {
        toast.error('El archivo es demasiado grande para el servidor.', { id: toastId });
      } else {
        toast.error(error.response?.data?.message || "Error al procesar el mantenimiento", { id: toastId });
      }
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
            {preventivo ? "Editar Mantenimiento Preventivo" : "Agregar Mantenimiento Preventivo"}
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

          {/* Proveedor - Solo biomédico */}
          {!isIndustrial && (
          <div className="space-y-2">
            <Label htmlFor="proveedor_mantenimiento_id" className="required">
              Proveedor Mantenimiento
            </Label>
            <SearchableSelect
              options={proveedores}
              value={formData.proveedor_mantenimiento_id}
              onChange={(value) => {
                handleInputChange("proveedor_mantenimiento_id", value);
                if (value) setProveedorFreeText("");
              }}
              allowFreeInput={true}
              onFreeInputChange={(text) => {
                setProveedorFreeText(text);
                if (text) handleInputChange("proveedor_mantenimiento_id", "");
              }}
              placeholder={proveedoresLoading ? "Cargando proveedores..." : "Buscar o escribir nombre del proveedor"}
              loading={proveedoresLoading}
              disabled={proveedoresLoading}
              className={errors.proveedor_mantenimiento_id ? "border-red-500" : ""}
            />
            {errors.proveedor_mantenimiento_id && (
              <p className="text-sm text-red-500">{errors.proveedor_mantenimiento_id}</p>
            )}
          </div>
          )}

          {/* Observaciones - Solo biomédico */}
          {!isIndustrial && (
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
          )}

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
            <FileDropzone
              file={formData.file}
              onFileChange={handleFileChange}
              onRemove={handleRemoveFile}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
              hint="PDF, Word, Excel, JPG, PNG, ZIP (máx. 20MB)"
            />
          </div>

          {/* Repuesto Pendiente - Solo biomédico */}
          {!isIndustrial && (
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
          )}

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
              {isSubmitting ? "Guardando..." : (preventivo ? "Actualizar Preventivo" : "Guardar Preventivo")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPreventivoModal;

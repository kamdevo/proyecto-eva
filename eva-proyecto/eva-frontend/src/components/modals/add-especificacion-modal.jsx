import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, Settings2 } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import SearchableSelect from "@/components/ui/searchable-select";

const AddEspecificacionModal = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  onEspecificacionAdded,
}) => {
  const [formData, setFormData] = useState({
    especificacion_id: "",
    valor: "",
    file: null,
  });

  const [especificaciones, setEspecificaciones] = useState([]);
  const [loadingEspecificaciones, setLoadingEspecificaciones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar catálogo de especificaciones
  useEffect(() => {
    if (isOpen) {
      loadEspecificaciones();
      setFormData({ especificacion_id: "", valor: "", file: null });
      setErrors({});
    }
  }, [isOpen]);

  const loadEspecificaciones = async () => {
    setLoadingEspecificaciones(true);
    try {
      const response = await httpService.get("/v1/especificaciones");
      const data = response?.data?.data || response?.data || [];
      setEspecificaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando especificaciones:", error);
      toast.error("Error al cargar especificaciones técnicas");
    } finally {
      setLoadingEspecificaciones(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.especificacion_id) newErrors.especificacion_id = "Seleccione una especificación";
    if (!formData.valor.trim()) newErrors.valor = "El valor es obligatorio";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Complete los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    const toastId = "add-especificacion";

    try {
      toast.loading("Guardando especificación técnica...", { id: toastId });

      const fd = new FormData();
      fd.append("equipo_id", equipmentId);
      fd.append("especificacion_id", formData.especificacion_id);
      fd.append("valor", formData.valor);
      if (formData.file) {
        fd.append("file", formData.file);
      }

      await httpService.post("/v1/equipo-especificaciones", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Especificación técnica agregada exitosamente", { id: toastId });
      onEspecificacionAdded?.();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error?.response?.data?.message || "Error al guardar especificación", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no puede ser mayor a 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no puede ser mayor a 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-800">
                Agregar Especificación Técnica
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">{equipmentName}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Especificación Técnica (select) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Especificación Técnica <span className="text-red-500">*</span>
            </Label>
            <SearchableSelect
              options={especificaciones.map((esp) => ({ id: esp.id.toString(), name: esp.name }))}
              value={formData.especificacion_id.toString()}
              onValueChange={(val) => {
                setFormData((prev) => ({ ...prev, especificacion_id: val }));
                if (errors.especificacion_id) setErrors((prev) => ({ ...prev, especificacion_id: "" }));
              }}
              placeholder={loadingEspecificaciones ? "Cargando..." : "Buscar especificación..."}
              disabled={loadingEspecificaciones}
            />
            {errors.especificacion_id && (
              <p className="text-xs text-red-500">{errors.especificacion_id}</p>
            )}
          </div>

          {/* Valor (textarea) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Valor <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.valor}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, valor: e.target.value }));
                if (errors.valor) setErrors((prev) => ({ ...prev, valor: "" }));
              }}
              placeholder="Ingrese el valor de la especificación"
              className={`min-h-[100px] rounded-xl resize-none ${
                errors.valor ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.valor && <p className="text-xs text-red-500">{errors.valor}</p>}
          </div>

          {/* Archivo (opcional) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Archivo <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            {formData.file ? (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm text-indigo-700 truncate flex-1">
                  {formData.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, file: null }))}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragActive ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Arrastra un archivo o{" "}
                  <label
                    htmlFor="especificacion-file"
                    className="text-indigo-600 cursor-pointer hover:underline font-medium"
                  >
                    selecciona uno
                  </label>
                </p>
                <p className="text-xs text-gray-400">Máx. 10MB</p>
                <input
                  id="especificacion-file"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              {isSubmitting ? "Guardando..." : "Guardar Especificación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEspecificacionModal;

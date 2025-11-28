import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Edit, Save, X } from "lucide-react";

export function EditarPlanModal({ open, onOpenChange, plan, proveedores, onSuccess }) {
  const [formData, setFormData] = useState({
    mes1: "",
    mes2: "",
    mes3: "",
    responsable: "",
    proveedor_mantenimiento_id: "0"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Cargar datos del plan cuando se abre el modal
  useEffect(() => {
    if (open && plan) {
      setFormData({
        mes1: plan.mes1 || "",
        mes2: plan.mes2 || "",
        mes3: plan.mes3 || "",
        responsable: plan.responsable || "",
        proveedor_mantenimiento_id: plan.proveedor_mantenimiento_id?.toString() || "0"
      });
      setErrors({});
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [open, plan]);

  const validateForm = () => {
    const newErrors = {};

    // Validar que al menos mes1 esté lleno
    if (!formData.mes1) {
      newErrors.mes1 = "Mes 1 es requerido";
    }

    // Validar que los meses sean números entre 1 y 12
    if (formData.mes1 && (formData.mes1 < 1 || formData.mes1 > 12)) {
      newErrors.mes1 = "Mes debe estar entre 1 y 12";
    }
    if (formData.mes2 && (formData.mes2 < 1 || formData.mes2 > 12)) {
      newErrors.mes2 = "Mes debe estar entre 1 y 12";
    }
    if (formData.mes3 && (formData.mes3 < 1 || formData.mes3 > 12)) {
      newErrors.mes3 = "Mes debe estar entre 1 y 12";
    }

    // Validar que responsable esté lleno
    if (!formData.responsable || formData.responsable.trim() === "") {
      newErrors.responsable = "Responsable es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001";
      
      // Preparar datos para enviar (convertir a números)
      const dataToSend = {
        mes1: formData.mes1 ? parseInt(formData.mes1) : null,
        mes2: formData.mes2 ? parseInt(formData.mes2) : null,
        mes3: formData.mes3 ? parseInt(formData.mes3) : null,
        responsable: formData.responsable,
      };

      // Solo enviar proveedor si es diferente de "0" (sin proveedor)
      if (formData.proveedor_mantenimiento_id && formData.proveedor_mantenimiento_id !== "0") {
        dataToSend.proveedor_mantenimiento_id = parseInt(formData.proveedor_mantenimiento_id);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/planes-mantenimientos/${plan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Plan actualizado exitosamente");
        
        // Esperar 1.5 segundos y cerrar modal
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onOpenChange(false);
        }, 1500);
      } else {
        setErrorMessage(data.message || "Error al actualizar el plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      setErrorMessage("Error de conexión al actualizar el plan");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Editar Plan de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        {/* Información del equipo */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-slate-600">Equipo:</span>
              <div className="text-slate-900 font-medium">
                {plan.equipo_nombre || "Sin nombre"}
              </div>
            </div>
            <div>
              <span className="font-medium text-slate-600">ID:</span>
              <div className="text-slate-900">{plan.equipo_id}</div>
            </div>
            <div>
              <span className="font-medium text-slate-600">Código:</span>
              <div className="text-slate-900">{plan.equipo_codigo || "N/A"}</div>
            </div>
            <div>
              <span className="font-medium text-slate-600">Año:</span>
              <div className="text-slate-900">{plan.anio}</div>
            </div>
          </div>
        </div>

        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <Save className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <X className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meses Programados */}
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <p className="font-medium mb-1">⚠️ Cálculo Automático:</p>
              <p>
                Mes 2 y Mes 3 se calculan automáticamente según la frecuencia del equipo. 
                Solo necesitas ingresar <strong>Mes 1</strong>. Puedes sobrescribir manualmente si es necesario.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mes1" className="text-sm font-medium">
                  Mes 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mes1"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.mes1}
                  onChange={(e) => handleChange("mes1", e.target.value)}
                  className={errors.mes1 ? "border-red-500" : ""}
                  placeholder="1-12"
                />
                {errors.mes1 && (
                  <p className="text-xs text-red-500 mt-1">{errors.mes1}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mes2" className="text-sm font-medium text-gray-500">
                  Mes 2 <span className="text-xs">(Auto)</span>
                </Label>
                <Input
                  id="mes2"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.mes2}
                  onChange={(e) => handleChange("mes2", e.target.value)}
                  className={errors.mes2 ? "border-red-500" : ""}
                  placeholder="Auto"
                />
                {errors.mes2 && (
                  <p className="text-xs text-red-500 mt-1">{errors.mes2}</p>
                )}
              </div>

              <div>
                <Label htmlFor="mes3" className="text-sm font-medium text-gray-500">
                  Mes 3 <span className="text-xs">(Auto)</span>
                </Label>
                <Input
                  id="mes3"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.mes3}
                  onChange={(e) => handleChange("mes3", e.target.value)}
                  className={errors.mes3 ? "border-red-500" : ""}
                  placeholder="Auto"
                />
                {errors.mes3 && (
                  <p className="text-xs text-red-500 mt-1">{errors.mes3}</p>
                )}
              </div>
            </div>
          </div>

          {/* Responsable */}
          <div>
            <Label htmlFor="responsable" className="text-sm font-medium">
              Responsable <span className="text-red-500">*</span>
            </Label>
            <Input
              id="responsable"
              type="text"
              value={formData.responsable}
              onChange={(e) => handleChange("responsable", e.target.value)}
              className={errors.responsable ? "border-red-500" : ""}
              placeholder="Ej: SYSMED"
            />
            {errors.responsable && (
              <p className="text-xs text-red-500 mt-1">{errors.responsable}</p>
            )}
          </div>

          {/* Proveedor (opcional) */}
          {proveedores && proveedores.length > 0 && (
            <div>
              <Label htmlFor="proveedor" className="text-sm font-medium">
                Proveedor (Opcional)
              </Label>
              <Select
                value={formData.proveedor_mantenimiento_id?.toString() || "0"}
                onValueChange={(value) => handleChange("proveedor_mantenimiento_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin proveedor</SelectItem>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={proveedor.id.toString()}>
                      {proveedor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">📝 Nota:</p>
            <p>
              Los cambios serán registrados en el historial con tu usuario y fecha/hora.
              Puedes ver el historial haciendo clic en el ícono de ojo verde.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditarPlanModal;

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

/**
 * Componente Modal para Creación de Correctivos
 * 
 * Componente reutilizable independiente para crear nuevos correctivos.
 * Separado del modal principal para mejor modularidad y reutilización.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Estado de visibilidad del modal
 * @param {function} props.onOpenChange - Función para cambiar el estado del modal
 * @param {function} props.onCorrectiveCreated - Callback cuando se crea un correctivo exitosamente
 */
export function CreateCorrectiveModal({ open, onOpenChange, onCorrectiveCreated }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    equipo_id: "",
    responsable_mantenimiento: "",
    descripcion_orden: "",
    codigo_orden: "",
    fecha_inicio: "",
    prioridad: "media"
  });

  // Estado de carga y equipos
  const [loading, setLoading] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [loadingEquipos, setLoadingEquipos] = useState(false);

  // Cargar lista de equipos al abrir el modal
  useEffect(() => {
    if (open) {
      loadEquipos();
      // Resetear formulario
      setFormData({
        equipo_id: "",
        responsable_mantenimiento: "",
        descripcion_orden: "",
        codigo_orden: "",
        fecha_inicio: "",
        prioridad: "media"
      });
    }
  }, [open]);

  /**
   * Cargar lista de equipos disponibles
   */
  const loadEquipos = async () => {
    setLoadingEquipos(true);
    try {
      const response = await httpService.get("/v1/equipos");
      
      let equiposData = [];
      if (response.data && response.data.data) {
        equiposData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        equiposData = response.data;
      }
      
      setEquipos(Array.isArray(equiposData) ? equiposData : []);
    } catch (error) {
      console.error("Error cargando equipos:", error);
      toast.error("Error al cargar la lista de equipos");
      setEquipos([]);
    } finally {
      setLoadingEquipos(false);
    }
  };

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Validar formulario antes del envío
   */
  const validateForm = () => {
    const errors = [];
    
    if (!formData.equipo_id) {
      errors.push("Debe seleccionar un equipo");
    }
    
    if (!formData.responsable_mantenimiento.trim()) {
      errors.push("Debe especificar el responsable del mantenimiento");
    }
    
    if (!formData.descripcion_orden.trim()) {
      errors.push("Debe proporcionar una descripción de la orden");
    }
    
    return errors;
  };

  /**
   * Enviar formulario para crear correctivo
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error("Errores en el formulario:\n" + errors.join("\n"));
      return;
    }

    setLoading(true);
    const toastId = 'create-corrective';
    
    try {
      toast.loading('Registrando correctivo general...', { id: toastId });
      
      const response = await httpService.post("/v1/correctivos-generales", formData);
      
      toast.success("Correctivo creado exitosamente", { id: toastId });
      
      // Notificar al componente padre
      if (onCorrectiveCreated) {
        onCorrectiveCreated(response.data);
      }
      
      // Cerrar modal
      onOpenChange(false);
      
    } catch (error) {
      console.error("❌ [CREATE] Error creando correctivo:", error);
      
      let errorMessage = "Error al crear el correctivo";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generar código de orden automático
   */
  const generateOrderCode = () => {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const code = `COR${timestamp}`;
    handleInputChange('codigo_orden', code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Crear Nuevo Correctivo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selección de equipo */}
              <div className="space-y-2">
                <Label htmlFor="equipo_id">Equipo *</Label>
                <Select 
                  value={formData.equipo_id} 
                  onValueChange={(value) => handleInputChange('equipo_id', value)}
                  disabled={loadingEquipos}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingEquipos ? "Cargando equipos..." : "Seleccionar equipo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((equipo) => (
                      <SelectItem key={equipo.id} value={equipo.id.toString()}>
                        {equipo.name} - {equipo.code || 'Sin código'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Responsable */}
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable del Mantenimiento *</Label>
                <Input
                  id="responsable"
                  value={formData.responsable_mantenimiento}
                  onChange={(e) => handleInputChange('responsable_mantenimiento', e.target.value)}
                  placeholder="Nombre del responsable"
                  required
                />
              </div>

              {/* Código de orden */}
              <div className="space-y-2">
                <Label htmlFor="codigo_orden">Código de Orden</Label>
                <div className="flex gap-2">
                  <Input
                    id="codigo_orden"
                    value={formData.codigo_orden}
                    onChange={(e) => handleInputChange('codigo_orden', e.target.value)}
                    placeholder="Código de la orden (opcional)"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateOrderCode}
                    className="whitespace-nowrap"
                  >
                    Generar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del correctivo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Correctivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción de la Orden *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion_orden}
                  onChange={(e) => handleInputChange('descripcion_orden', e.target.value)}
                  placeholder="Descripción detallada del mantenimiento correctivo a realizar"
                  rows={4}
                  required
                />
              </div>

              {/* Fecha de inicio */}
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                />
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select 
                  value={formData.prioridad} 
                  onValueChange={(value) => handleInputChange('prioridad', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="emergencia">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Correctivo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import httpService from "@/services/httpService";
import { toast } from "sonner";
import SearchableSelect from "@/components/ui/searchable-select";
import { useEffect } from "react";

export function AddContingencyModal({ open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    archivo: null,
    equipo_id: 1, // Requerido por el controlador
    severidad: 'Media',
    tipo: 'Falla',
    usuario_reporta: 1, // Temporal, debería venir del usuario logueado
    observaciones: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [equipments, setEquipments] = useState([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, [open]);

  const fetchEquipments = async () => {
    if (!open) return;
    setLoadingEquipments(true);
    try {
      const response = await httpService.get('/v1/equipos-list');
      if (response.data.success) {
        // Adaptar datos para SearchableSelect
        const data = response.data.data;
        const options = data.map(eq => ({
          id: eq.id,
          nombre: `${eq.name} - ${eq.code || 'S/C'}`,
          name: eq.name,
          codigo: eq.code
        }));
        setEquipments(options);
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
      toast.error("No se pudo cargar la lista de equipos");
    } finally {
      setLoadingEquipments(false);
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
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({...errors, archivo: 'Tipo de archivo no válido. Solo PDF, DOC, DOCX, JPG, PNG permitidos.'});
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({...errors, archivo: 'El archivo es muy grande. Máximo 5MB permitido.'});
      return;
    }

    setFormData({...formData, archivo: file});
    setErrors({...errors, archivo: null});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.equipo_id) {
      newErrors.equipo_id = 'El equipo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const toastId = 'add-contingency';
    try {
      setLoading(true);
      toast.loading('Registrando contingencia...', { id: toastId });

      // Crear FormData para envío con archivo
      const submitData = new FormData();
      submitData.append('fecha', formData.fecha);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('equipo_id', formData.equipo_id);
      submitData.append('severidad', formData.severidad);
      submitData.append('tipo', formData.tipo);
      submitData.append('usuario_reporta', formData.usuario_reporta);
      submitData.append('observaciones', formData.observaciones);
      
      if (formData.archivo) {
        submitData.append('archivo', formData.archivo);
      }

      const response = await httpService.post('/v1/contingencias', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Resetear formulario
        setFormData({
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
          archivo: null,
          equipo_id: 1,
          severidad: 'Media',
          tipo: 'Falla',
          usuario_reporta: 1,
          observaciones: ''
        });
        
        // Cerrar modal y notificar éxito
        onOpenChange(false);
        if (onSuccess) onSuccess();
        toast.success('Contingencia registrada exitosamente', { id: toastId });
      } else {
        throw new Error(response.data.message || 'Error al crear contingencia');
      }
    } catch (error) {
      console.error('Error creating contingency:', error);
      toast.error('Error al crear la contingencia: ' + (error.response?.data?.message || error.message), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      archivo: null,
      equipo_id: 1,
      severidad: 'Media',
      tipo: 'Falla',
      usuario_reporta: 1,
      observaciones: ''
    });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-teal-200 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-800">
              Agregar
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-1 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"></div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-4">
            Contingencia
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="fecha"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Fecha<span className="text-destructive">*</span>
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                className={`h-8 sm:h-9 text-xs sm:text-sm ${errors.fecha ? 'border-red-500' : ''}`}
              />
              {errors.fecha && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fecha}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="equipo_id"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Información del equipo<span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                placeholder="Busque un equipo por nombre o código..."
                options={equipments}
                value={formData.equipo_id?.toString()}
                onValueChange={(val) => setFormData({...formData, equipo_id: val})}
                loading={loadingEquipments}
                className={errors.equipo_id ? 'border-red-500' : ''}
              />
              {errors.equipo_id && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {errors.equipo_id}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="descripcion"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Observaciones<span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="descripcion"
                placeholder="Ingrese información detallada de la contingencia"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className={`text-xs sm:text-sm min-h-[60px] sm:min-h-[80px] resize-none ${errors.descripcion ? 'border-red-500' : ''}`}
                rows={3}
              />
              {errors.descripcion && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" />
                  {errors.descripcion}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">
              Archivo asociado (opcional)
            </Label>
            
            {!formData.archivo ? (
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                  dragActive
                    ? "border-teal-400 bg-teal-50"
                    : errors.archivo 
                    ? "border-red-400 bg-red-50"
                    : "border-slate-300 bg-slate-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400 mx-auto mb-2 sm:mb-3" />
                <div className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">
                  Arrastra archivos aquí
                </div>
                <div className="text-slate-400 text-xs mb-2">
                  o haz clic para seleccionar
                </div>
                <div className="text-xs text-slate-500">
                  PDF, DOC, DOCX, JPG, PNG (máx. 5MB)
                </div>
              </div>
            ) : (
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-green-900">
                        {formData.archivo.name}
                      </div>
                      <div className="text-xs text-green-600">
                        {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({...formData, archivo: null})}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {errors.archivo && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="w-3 h-3" />
                {errors.archivo}
              </div>
            )}
          </div>

          {!formData.archivo && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-input').click()}
                className="w-full sm:flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200"
              >
                📎 Seleccionar archivo
              </Button>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-9 text-sm disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Contingencia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

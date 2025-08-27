/**
 * ========================================
 * MODAL PARA CREAR TICKETS
 * ========================================
 *
 * Modal completo para creación de nuevos tickets
 * Incluye validación, carga de archivos y manejo de errores
 */

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useToast } from "../../contexts/ToastContext";
import useTickets from "../../hooks/useTickets";
import {
  X,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    prioridad: "media",
    equipo_id: "",
    fecha_limite: "",
    archivo_adjunto: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showToast } = useToast();
  const { createTicket } = useTickets();

  const totalSteps = 3;

  // Opciones para los selects
  const categorias = [
    { value: "soporte_tecnico", label: "Soporte Técnico" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "calibracion", label: "Calibración" },
    { value: "capacitacion", label: "Capacitación" },
    { value: "otro", label: "Otro" },
  ];

  const prioridades = [
    { value: "baja", label: "Baja" },
    { value: "media", label: "Media" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ];

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /**
   * Manejar selección de archivo
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño del archivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast("El archivo no puede ser mayor a 10MB", "error");
        return;
      }
      
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'application/zip'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        showToast("Tipo de archivo no permitido", "error");
        return;
      }

      handleInputChange('archivo_adjunto', file);
    }
  };

  /**
   * Validar paso actual
   */
  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.titulo.trim()) {
          newErrors.titulo = "El título es requerido";
        }
        if (!formData.descripcion.trim()) {
          newErrors.descripcion = "La descripción es requerida";
        }
        break;
      case 2:
        if (!formData.categoria) {
          newErrors.categoria = "La categoría es requerida";
        }
        if (!formData.prioridad) {
          newErrors.prioridad = "La prioridad es requerida";
        }
        break;
      case 3:
        // Paso opcional, no hay validaciones requeridas
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validar formulario completo
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es requerido";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    }

    if (!formData.categoria) {
      newErrors.categoria = "La categoría es requerida";
    }

    if (!formData.prioridad) {
      newErrors.prioridad = "La prioridad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Ir al siguiente paso
   */
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Ir al paso anterior
   */
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Simular progreso de carga
   */
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const progressInterval = simulateProgress();

    try {
      const ticketData = { ...formData };

      // Convertir fecha límite si existe
      if (ticketData.fecha_limite) {
        ticketData.fecha_limite = new Date(ticketData.fecha_limite).toISOString().split('T')[0];
      }

      const newTicket = await createTicket(ticketData);

      // Asegurar que el progreso llegue al 100%
      setUploadProgress(100);

      showToast("Ticket creado exitosamente", "success");

      // Resetear formulario
      setFormData({
        titulo: "",
        descripcion: "",
        categoria: "",
        prioridad: "media",
        equipo_id: "",
        fecha_limite: "",
        archivo_adjunto: null,
      });

      setCurrentStep(1);
      setUploadProgress(0);

      // Notificar al componente padre
      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }

      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Error creating ticket:", error);
      showToast("Error al crear ticket: " + error.message, "error");
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
    }
  };

  /**
   * Cerrar modal y resetear formulario
   */
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        titulo: "",
        descripcion: "",
        categoria: "",
        prioridad: "media",
        equipo_id: "",
        fecha_limite: "",
        archivo_adjunto: null,
      });
      setErrors({});
      setCurrentStep(1);
      setUploadProgress(0);
      onClose();
    }
  };

  /**
   * Renderizar contenido del paso actual
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Ingrese el título del ticket"
                className={errors.titulo ? "border-red-500" : ""}
              />
              {errors.titulo && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.titulo}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder="Describa detalladamente el problema o solicitud"
                rows={4}
                className={errors.descripcion ? "border-red-500" : ""}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.descripcion}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Categoría y Prioridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleInputChange('categoria', value)}
                >
                  <SelectTrigger className={errors.categoria ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.categoria}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">
                  Prioridad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => handleInputChange('prioridad', value)}
                >
                  <SelectTrigger className={errors.prioridad ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione una prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridades.map((prioridad) => (
                      <SelectItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prioridad && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.prioridad}
                  </p>
                )}
              </div>
            </div>

            {/* Equipo ID y Fecha Límite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipo_id">ID del Equipo (Opcional)</Label>
                <Input
                  id="equipo_id"
                  value={formData.equipo_id}
                  onChange={(e) => handleInputChange('equipo_id', e.target.value)}
                  placeholder="ID del equipo relacionado"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_limite">Fecha Límite (Opcional)</Label>
                <Input
                  id="fecha_limite"
                  value={formData.fecha_limite}
                  onChange={(e) => handleInputChange('fecha_limite', e.target.value)}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Archivo Adjunto */}
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo Adjunto (Opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="archivo"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('archivo').click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Seleccionar Archivo
                </Button>
                {formData.archivo_adjunto && (
                  <span className="text-sm text-gray-600">
                    {formData.archivo_adjunto.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Formatos permitidos: PDF, DOC, DOCX, JPG, PNG, ZIP (máximo 10MB)
              </p>
            </div>

            {/* Resumen del ticket */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Resumen del Ticket</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Título:</strong> {formData.titulo}</div>
                <div><strong>Categoría:</strong> {categorias.find(c => c.value === formData.categoria)?.label}</div>
                <div><strong>Prioridad:</strong> {prioridades.find(p => p.value === formData.prioridad)?.label}</div>
                {formData.equipo_id && <div><strong>Equipo:</strong> {formData.equipo_id}</div>}
                {formData.fecha_limite && <div><strong>Fecha límite:</strong> {formData.fecha_limite}</div>}
                {formData.archivo_adjunto && <div><strong>Archivo:</strong> {formData.archivo_adjunto.name}</div>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Crear Nuevo Ticket
          </DialogTitle>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Títulos de pasos */}
          <div className="flex justify-center mt-2">
            <div className="text-sm text-gray-600">
              {currentStep === 1 && "Información Básica"}
              {currentStep === 2 && "Detalles y Configuración"}
              {currentStep === 3 && "Archivos y Revisión"}
            </div>
          </div>
        </DialogHeader>

        {/* Barra de progreso durante envío */}
        {isSubmitting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Creando ticket...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contenido del paso actual */}
          {renderStepContent()}
        </form>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Crear Ticket
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

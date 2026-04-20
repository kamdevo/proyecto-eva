"use client";
import React, { useState } from "react";
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
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";

export function AgregarRegistroInvimaModal({ open, onOpenChange, onRegistroAdded }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    numero_registro: "",
    descripcion_detallada: "",
    titulo: "",
    marcas: "",
    archivo_pdf: null
  });

  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Ref para el input de archivo
  const fileInputRef = React.useRef(null);

  // Función para manejar cambios en inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Función para manejar archivos
  const handleFileChange = (file) => {
    if (!file) return;

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no puede exceder 10MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      archivo_pdf: file
    }));

    toast.success(`Archivo seleccionado: ${file.name}`);
  };

  // Función para drag and drop
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

  // Función para validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    const requiredFields = {
      numero_registro: 'Número de registro',
      descripcion_detallada: 'Descripción detallada',
      titulo: 'Título',
      marcas: 'Marcas'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${label} es obligatorio`;
      }
    });

    // Validar formato de registro INVIMA
    if (formData.numero_registro && formData.numero_registro.length < 8) {
      newErrors.numero_registro = 'El registro debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Registrando INVIMA...', { id: 'submit-invima' });

      // Crear FormData para envío con archivos
      const submitData = new FormData();
      
      // Agregar campos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (value !== null && value !== '') {
          submitData.append(key, value);
        }
      });

      // Agregar estado por defecto
      submitData.append('estado', 'vigente');

      const response = await httpService.post('/v1/registros-invima', submitData, {
        timeout: 60000
      });

      if (response.data.success) {
        toast.success('Registro INVIMA creado exitosamente', { id: 'submit-invima' });
        
        // Resetear formulario
        setFormData({
          numero_registro: "",
          descripcion_detallada: "",
          titulo: "",
          marcas: "",
          archivo_pdf: null
        });
        setErrors({});

        // Llamar callback si existe
        if (onRegistroAdded) {
          onRegistroAdded(response.data.data);
        }

        // Cerrar modal
        onOpenChange(false);
      } else {
        toast.error(response.data.message || 'Error al crear registro', { id: 'submit-invima' });
      }

    } catch (error) {
      console.error('Error creating INVIMA record:', error);

      // Errores de validación del servidor (422)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        const fieldMap = {
          numero_registro: 'numero_registro',
          descripcion_detallada: 'descripcion_detallada',
          titulo: 'titulo',
          marcas: 'marcas',
          archivo_pdf: 'archivo_pdf',
        };
        const mappedErrors = {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const key = fieldMap[field] || field;
          mappedErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(prev => ({ ...prev, ...mappedErrors }));
        // Mostrar el primer error encontrado como toast destacado
        const firstMsg = Object.values(mappedErrors)[0];
        toast.error(firstMsg || 'Corrija los errores en el formulario.', { id: 'submit-invima' });
      } else {
        const errorMessage = error.response?.data?.message || 'Error al crear el registro INVIMA';
        toast.error(errorMessage, { id: 'submit-invima' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para remover archivo
  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      archivo_pdf: null
    }));
    toast.info('Archivo removido');
  };

  // Función para abrir selector de archivos
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">
            📋 Agregar Nuevo Registro INVIMA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Registro Sanitario */}
          <div>
            <Label className="text-sm font-medium">
              Registro Sanitario:<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Ej: INVIMA2024M-0001234-R1"
              value={formData.numero_registro}
              onChange={(e) => handleInputChange('numero_registro', e.target.value)}
              className={`mt-1 ${errors.numero_registro ? 'border-red-500' : ''}`}
            />
            {errors.numero_registro && (
              <p className="text-red-500 text-xs mt-1">{errors.numero_registro}</p>
            )}
          </div>

          {/* Descripción Detallada */}
          <div>
            <Label className="text-sm font-medium">
              Descripción Detallada:<span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Descripción completa del registro sanitario..."
              value={formData.descripcion_detallada}
              onChange={(e) => handleInputChange('descripcion_detallada', e.target.value)}
              className={`mt-1 min-h-[100px] ${errors.descripcion_detallada ? 'border-red-500' : ''}`}
            />
            {errors.descripcion_detallada && (
              <p className="text-red-500 text-xs mt-1">{errors.descripcion_detallada}</p>
            )}
          </div>

          {/* Título */}
          <div>
            <Label className="text-sm font-medium">
              Título:<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Título del registro sanitario"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              className={`mt-1 ${errors.titulo ? 'border-red-500' : ''}`}
            />
            {errors.titulo && (
              <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Marcas */}
          <div>
            <Label className="text-sm font-medium">
              Marcas:<span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Marcas o fabricantes asociados"
              value={formData.marcas}
              onChange={(e) => handleInputChange('marcas', e.target.value)}
              className={`mt-1 ${errors.marcas ? 'border-red-500' : ''}`}
            />
            {errors.marcas && (
              <p className="text-red-500 text-xs mt-1">{errors.marcas}</p>
            )}
          </div>

          {/* File Uploader */}
          <div>
            <Label className="text-sm font-medium">
              Documento PDF del Registro:
            </Label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />

            <div
              className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : formData.archivo_pdf
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={formData.archivo_pdf ? undefined : openFileSelector}
            >
              {formData.archivo_pdf ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      ✓ {formData.archivo_pdf.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(formData.archivo_pdf.size / 1024)} KB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover archivo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileSelector();
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Cambiar archivo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Arrastra y suelta tu archivo PDF aquí
                    </p>
                    <p className="text-xs text-gray-500">
                      o haz clic para seleccionar
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📋 Solo archivos PDF. Máximo 10MB.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between p-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Registro'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

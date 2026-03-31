"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Calendar, FileText, Save } from "lucide-react";
import { toast } from "sonner";

export default function AddProgressModal({ isOpen, onClose, ticketId }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    titulo: "",
    descripcion: "",
    archivo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar formData desde localStorage o valores por defecto
  useEffect(() => {
    if (isOpen && ticketId) {
      const storageKey = `add_progress_state_${ticketId}`;
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setFormData({
            ...parsedState.formData,
            archivo: null // No podemos restaurar archivos
          });
          return;
        } catch(e) {
          console.error("Error parsing saved progress state", e);
        }
      }
      
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        titulo: "",
        descripcion: "",
        archivo: null
      });
    }
  }, [isOpen, ticketId]);

  // Guardar en localStorage ante cada cambio
  useEffect(() => {
    if (isOpen && ticketId) {
      const storageKey = `add_progress_state_${ticketId}`;
      const { archivo, ...formDataToSave } = formData;
      const stateToSave = {
        formData: formDataToSave
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    }
  }, [formData, isOpen, ticketId]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño máximo (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        archivo: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo.trim()) {
      toast.error("El título del avance es obligatorio");
      return;
    }
    
    if (!formData.descripcion.trim()) {
      toast.error("La descripción del avance es obligatoria");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      
      if (formData.archivo) {
        formDataToSend.append('archivo', formData.archivo);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/tickets/${ticketId}/avances`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al agregar el avance');
      }

      toast.success("✅ Avance agregado exitosamente");
      
      // Limpiar datos de autoguardado tras éxito
      localStorage.removeItem(`add_progress_state_${ticketId}`);

      // Resetear formulario
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        titulo: "",
        descripcion: "",
        archivo: null
      });
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al agregar el avance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] h-auto overflow-y-auto">
        <DialogHeader className="bg-green-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Agregar Avance al Ticket</DialogTitle>
              <p className="text-sm text-green-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fecha del Avance */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-sm font-semibold text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              Fecha del Avance
            </Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full"
              required
            />
          </div>

          {/* Título o Asunto */}
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-sm font-semibold text-gray-700">
              Título o Asunto del Avance *
            </Label>
            <Input
              id="titulo"
              name="titulo"
              type="text"
              placeholder="Ej: Revisión inicial del equipo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-700">
              Descripción del Avance *
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Describa detalladamente el avance realizado..."
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full min-h-[120px]"
              required
            />
            <p className="text-xs text-gray-500">
              {formData.descripcion.length} caracteres
            </p>
          </div>

          {/* Archivo Adjunto */}
          <div className="space-y-2">
            <Label htmlFor="archivo" className="text-sm font-semibold text-gray-700 flex items-center">
              <Upload className="w-4 h-4 mr-2 text-green-600" />
              Archivo Adjunto (Opcional)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition-colors">
              <Input
                id="archivo"
                name="archivo"
                type="file"
                onChange={handleFileChange}
                className="w-full"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
              />
              {formData.archivo && (
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  {formData.archivo.name} ({(formData.archivo.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Formatos permitidos: PDF, Word, Excel, Imágenes (Máx. 10MB)
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Guardando..." : "Ingresar Avance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

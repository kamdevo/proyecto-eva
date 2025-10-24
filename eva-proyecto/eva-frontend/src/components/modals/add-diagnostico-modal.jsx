"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Save, Upload, File } from "lucide-react";
import { toast } from "sonner";

export default function AddDiagnosticoModal({ isOpen, onClose, ticketId }) {
  const [formData, setFormData] = useState({
    retro_diagnostico: "",
    diagnostico: "",
    fecha_diagnostico: "",
    hora_diagnostico: "",
    tecnico_diagnostico_text: "",
    file_diagnostico: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        file_diagnostico: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.diagnostico.trim()) {
      toast.error("El diagnóstico es obligatorio");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('retro_diagnostico', formData.retro_diagnostico);
      formDataToSend.append('diagnostico', formData.diagnostico);
      
      if (formData.fecha_diagnostico) {
        formDataToSend.append('fecha_diagnostico', formData.fecha_diagnostico);
      }
      
      if (formData.hora_diagnostico) {
        formDataToSend.append('hora_diagnostico', formData.hora_diagnostico);
      }
      
      if (formData.tecnico_diagnostico_text) {
        formDataToSend.append('tecnico_diagnostico_text', formData.tecnico_diagnostico_text);
      }
      
      if (formData.file_diagnostico) {
        formDataToSend.append('file_diagnostico', formData.file_diagnostico);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/v1/tickets/${ticketId}/diagnostico`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al agregar el diagnóstico');
      }

      toast.success("Diagnóstico agregado exitosamente");
      
      // Resetear formulario
      setFormData({
        retro_diagnostico: "",
        diagnostico: "",
        fecha_diagnostico: "",
        hora_diagnostico: "",
        tecnico_diagnostico_text: "",
        file_diagnostico: null
      });
      
      // Cerrar modal - el padre se encarga de recargar los datos
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || "Error al agregar el diagnóstico");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-blue-600 text-white p-4 rounded-t-lg -mt-6 -mx-6 mb-4">
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-3" />
            <div>
              <DialogTitle className="text-lg font-bold text-white">Agregar Diagnóstico</DialogTitle>
              <p className="text-sm text-blue-100">Ticket #{ticketId}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Código del Retro */}
          <div className="space-y-2">
            <Label htmlFor="retro_diagnostico" className="text-sm font-semibold text-gray-700">
              Código del Informe de Diagnóstico
            </Label>
            <Input
              id="retro_diagnostico"
              name="retro_diagnostico"
              type="text"
              placeholder="Ej: DIAG-2024-001"
              value={formData.retro_diagnostico}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Código de referencia del informe (opcional)
            </p>
          </div>

          {/* Diagnóstico */}
          <div className="space-y-2">
            <Label htmlFor="diagnostico" className="text-sm font-semibold text-gray-700">
              Descripción del Diagnóstico *
            </Label>
            <Textarea
              id="diagnostico"
              name="diagnostico"
              placeholder="Describa el diagnóstico técnico del problema..."
              value={formData.diagnostico}
              onChange={handleInputChange}
              className="w-full min-h-[120px]"
              required
            />
            <p className="text-xs text-gray-500">
              {formData.diagnostico.length} caracteres
            </p>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_diagnostico" className="text-sm font-semibold text-gray-700">
                Fecha del Diagnóstico
              </Label>
              <Input
                id="fecha_diagnostico"
                name="fecha_diagnostico"
                type="date"
                value={formData.fecha_diagnostico}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Opcional - Se usa fecha actual si no se especifica
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_diagnostico" className="text-sm font-semibold text-gray-700">
                Hora del Diagnóstico
              </Label>
              <Input
                id="hora_diagnostico"
                name="hora_diagnostico"
                type="time"
                value={formData.hora_diagnostico}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Opcional - Se usa hora actual si no se especifica
              </p>
            </div>
          </div>

          {/* Técnico Diagnóstico */}
          <div className="space-y-2">
            <Label htmlFor="tecnico_diagnostico_text" className="text-sm font-semibold text-gray-700">
              Técnico Responsable del Diagnóstico
            </Label>
            <Input
              id="tecnico_diagnostico_text"
              name="tecnico_diagnostico_text"
              type="text"
              placeholder="Nombre del técnico que realizó el diagnóstico"
              value={formData.tecnico_diagnostico_text}
              onChange={handleInputChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Opcional - Se usa el usuario actual si no se especifica
            </p>
          </div>

          {/* Archivo */}
          <div className="space-y-2">
            <Label htmlFor="file_diagnostico" className="text-sm font-semibold text-gray-700">
              Archivo Asociado
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="file_diagnostico"
                name="file_diagnostico"
                type="file"
                onChange={handleFileChange}
                className="w-full"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              {formData.file_diagnostico && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <File className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">
                    {formData.file_diagnostico.name}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Opcional - PDF, Word, Excel o imágenes (máx. 10MB)
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El diagnóstico será registrado en el sistema y estará disponible para consulta en el historial del ticket.
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Guardando..." : "Guardar Diagnóstico"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { AlertCircle, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import useBajas from "../../hooks/useBajas";

function DarBajaEquipoModal({ open, onOpenChange, equipo, onSuccess }) {
  const { decommissionEquipment, loading, error } = useBajas();
  
  const [formData, setFormData] = useState({
    fecha_baja: new Date().toISOString().split('T')[0],
    descripcion: '',
    motivo: '',
    observaciones: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setFormData({
        fecha_baja: new Date().toISOString().split('T')[0],
        descripcion: '',
        motivo: '',
        observaciones: ''
      });
      setSelectedFile(null);
      setSubmitError(null);
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
      setSubmitError(null);
    } else {
      setSubmitError('El archivo debe ser menor a 10MB');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const validateForm = () => {
    if (!formData.fecha_baja) {
      setSubmitError('La fecha de baja es requerida');
      return false;
    }
    if (!formData.descripcion.trim()) {
      setSubmitError('La descripción es requerida');
      return false;
    }
    if (!formData.motivo.trim()) {
      setSubmitError('El motivo es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitError(null);
    const toastId = 'dar-baja-equipo';

    try {
      toast.loading('Procesando baja del equipo...', { id: toastId });
      
      await decommissionEquipment(equipo.id, formData, selectedFile);
      
      toast.success('Equipo dado de baja exitosamente', { id: toastId });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err.message || 'Error al dar de baja el equipo');
      toast.error(err.message || 'Error al dar de baja el equipo', { id: toastId });
    }
  };

  const handleViewDocument = (fileName) => {
    if (!fileName) return;
    
    // Construct the URL for the document in Laravel storage
    const documentUrl = `/storage/bajas/${fileName}`;
    
    // Open document in new window with print functionality
    const newWindow = window.open(documentUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
    } else {
      console.error('No se pudo abrir el documento. Verifique que no esté bloqueando ventanas emergentes.');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-red-600 border-b border-red-200 pb-2">
            Dar de Baja Equipo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del equipo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Equipo a dar de baja:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Nombre:</span> {equipo?.nombre || 'N/A'}</p>
              <p><span className="font-medium">Marca:</span> {equipo?.marca || 'N/A'}</p>
              <p><span className="font-medium">Modelo:</span> {equipo?.modelo || 'N/A'}</p>
              <p><span className="font-medium">Serie:</span> {equipo?.serie || 'N/A'}</p>
            </div>
          </div>

          {/* Fecha de baja */}
          <div className="space-y-2">
            <Label htmlFor="fecha_baja" className="text-sm font-medium">
              Fecha de Baja <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha_baja"
              type="date"
              value={formData.fecha_baja}
              onChange={(e) => handleInputChange('fecha_baja', e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción de la baja"
              className="w-full"
              required
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-sm font-medium">
              Motivo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.motivo}
              onValueChange={(value) => handleInputChange('motivo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el motivo de la baja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Obsolescencia">Obsolescencia</SelectItem>
                <SelectItem value="Daño irreparable">Daño irreparable</SelectItem>
                <SelectItem value="Fin de vida útil">Fin de vida útil</SelectItem>
                <SelectItem value="Reemplazo por tecnología nueva">Reemplazo por tecnología nueva</SelectItem>
                <SelectItem value="Costo de reparación elevado">Costo de reparación elevado</SelectItem>
                <SelectItem value="Falta de repuestos">Falta de repuestos</SelectItem>
                <SelectItem value="Normativa/Regulación">Normativa/Regulación</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales sobre la baja"
              className="w-full min-h-[80px]"
            />
          </div>

          {/* Upload de archivo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Documento de Respaldo</Label>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input').click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Arrastra un archivo aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Error display */}
          {(submitError || error) && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{submitError || error}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Dar de Baja'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default DarBajaEquipoModal;

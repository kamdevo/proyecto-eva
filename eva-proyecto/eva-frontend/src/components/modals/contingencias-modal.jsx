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
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, X, AlertTriangle, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import httpService from "@/services/httpService";
import authService from "@/services/authService";

export function ContingenciasModal({ open, onOpenChange, equipmentId, equipmentName }) {
  const [contingencias, setContingencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    observacion: "",
    file: null
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open && equipmentId) {
      fetchContingencias();
    }
  }, [open, equipmentId]);

  const fetchContingencias = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(`/v1/equipos/${equipmentId}/contingencias`);
      if (response.data.success) {
        setContingencias(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching contingencias:', error);
      toast.error("Error al cargar contingencias");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type (PDF, images, documents)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 
                        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de archivo no válido. Use PDF, imágenes o documentos Word.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    toast.success(`Archivo "${file.name}" cargado`);
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.observacion) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    setUploading(true);
    const toastId = 'submit-contingencia';
    
    try {
      toast.loading('Registrando contingencia...', { id: toastId });
      
      const user = authService.getStoredUser();
      const formDataToSend = new FormData();
      formDataToSend.append('equipo_id', equipmentId);
      formDataToSend.append('usuario_id', user?.id || 1);
      formDataToSend.append('fecha', formData.fecha);
      formDataToSend.append('observacion', formData.observacion);
      formDataToSend.append('estado_id', 1); // Estado inicial: Abierto
      
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await httpService.post('/v1/contingencias', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("Contingencia registrada exitosamente", { id: toastId });
        setFormData({
          fecha: new Date().toISOString().split('T')[0],
          observacion: "",
          file: null
        });
        setShowForm(false);
        fetchContingencias();
      } else {
        toast.error(response.data.message || "Error al registrar contingencia", { id: toastId });
      }
    } catch (error) {
      console.error('Error submitting contingencia:', error);
      toast.error(error.response?.data?.message || "Error al registrar contingencia", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleCerrarContingencia = async (contingenciaId) => {
    const toastId = 'cerrar-contingencia';
    try {
      toast.loading('Cerrando contingencia...', { id: toastId });
      
      const response = await httpService.put(`/v1/contingencias/${contingenciaId}/cerrar`);
      if (response.data.success) {
        toast.success("Contingencia cerrada exitosamente", { id: toastId });
        fetchContingencias();
      }
    } catch (error) {
      console.error('Error closing contingencia:', error);
      toast.error("Error al cerrar contingencia", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-slate-50 border-b border-slate-200 p-6 rounded-t-lg -mt-6 -mx-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="bg-amber-600 p-3 rounded-lg mr-4 shadow-sm">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800">Contingencias del Equipo</DialogTitle>
                <p className="text-sm text-slate-600 mt-1">{equipmentName}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-amber-600 text-white hover:bg-amber-700 transition-colors duration-200 shadow-sm"
              size="sm"
            >
              {showForm ? "Cancelar" : "Nueva Contingencia"}
            </Button>
          </motion.div>
        </DialogHeader>

        {/* Form for new contingencia */}
        <AnimatePresence>
          {showForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit} 
              className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Registrar Nueva Contingencia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="fecha" className="text-sm font-semibold text-slate-700">
                  Fecha de la Contingencia *
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mb-4">
                <Label htmlFor="observacion" className="text-sm font-semibold text-slate-500">
                Observación / Descripción *
              </Label>
              <Textarea
                id="observacion"
                value={formData.observacion}
                onChange={(e) => handleInputChange('observacion', e.target.value)}
                placeholder="Describa la contingencia presentada..."
                rows={4}
                required
                className="mt-1"
              />
            </div>

            {/* File Upload Area */}
            <div className="mb-4">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Archivo Adjunto (Opcional)
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.file ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">{formData.file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(formData.file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      Arrastra y suelta un archivo aquí, o
                    </p>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-orange-600 hover:text-orange-700 font-medium">
                        selecciona un archivo
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, imágenes o documentos Word (máx. 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={uploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700"
                disabled={uploading}
              >
                {uploading ? "Guardando..." : "Registrar Contingencia"}
              </Button>
            </div>
          </motion.form>
        )}
        </AnimatePresence>

        {/* List of contingencias */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Historial de Contingencias ({contingencias.length})
          </h3>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-3"></div>
                <p className="text-slate-600">Cargando contingencias...</p>
              </motion.div>
            ) : contingencias.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200"
              >
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No hay contingencias registradas para este equipo</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {contingencias.map((contingencia, index) => (
                  <motion.div
                    key={contingencia.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${contingencia.estado_id === 1 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                          <AlertTriangle className={`w-5 h-5 ${contingencia.estado_id === 1 ? 'text-amber-600' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">Contingencia #{contingencia.id}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${contingencia.estado_id === 1 ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'}`}
                            >
                              {contingencia.estado_id === 1 ? "Abierta" : "Cerrada"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(contingencia.fecha).toLocaleDateString('es-ES')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {contingencia.usuario_nombre || 'Usuario'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {contingencia.estado_id === 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCerrarContingencia(contingencia.id)}
                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 transition-colors duration-200"
                        >
                          Cerrar
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">{contingencia.observacion}</p>
                    
                    {contingencia.file && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8001/api'}/storage/contingencias/${contingencia.file}`, '_blank')}
                        className="text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Ver archivo adjunto
                    </Button>
                  )}
                  
                  {contingencia.fecha_cierre && (
                    <div className="mt-2 text-xs text-gray-500">
                      Cerrada el: {new Date(contingencia.fecha_cierre).toLocaleDateString('es-ES')}
                    </div>
                  )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Save, AlertCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const EditGuiaModal = ({ isOpen, onClose, guia, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    estado: "1",
    file: null,
  });
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (guia && isOpen) {
      setFormData({
        name: guia.name || "",
        estado: String(guia.estado || "1"),
        file: null,
      });
      setFileName(guia.file || "");
      setErrors({});
    }
  }, [guia, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
        toast.error("Solo se permiten archivos PDF, DOC o DOCX");
        return;
      }

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }

      setFormData({ ...formData, file });
      setFileName(file.name);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("estado", formData.estado);
      
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      // Simular llamada a API (reemplazar con tu endpoint real)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Guía rápida actualizada exitosamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating guía:", error);
      toast.error(error.message || "Error al actualizar la guía rápida");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", estado: "1", file: null });
      setFileName("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white">Editar Guía Rápida</DialogTitle>
                    <p className="text-blue-100 text-sm">Actualiza la información de la guía</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Nombre de la Guía <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Guía de Mantenimiento Preventivo"
                    className={`transition-all ${
                      errors.name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                    disabled={loading}
                  />
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-red-500 text-xs"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </motion.div>
                  )}
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                    disabled={loading}
                  >
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Activo
                        </div>
                      </SelectItem>
                      <SelectItem value="0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          Inactivo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Archivo */}
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-sm font-semibold text-gray-700">
                    Archivo (PDF, DOC, DOCX)
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file").click()}
                        disabled={loading}
                        className="flex-1 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {formData.file ? "Cambiar archivo" : "Seleccionar archivo"}
                      </Button>
                    </div>
                    {fileName && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 truncate flex-1">{fileName}</span>
                      </motion.div>
                    )}
                    <p className="text-xs text-gray-500">
                      Tamaño máximo: 10MB. Deja vacío para mantener el archivo actual.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 hover:bg-gray-100"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
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
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuiaModal;

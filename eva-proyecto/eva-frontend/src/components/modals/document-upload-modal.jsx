"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, Calendar, Clock, FileType } from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import { API_CONFIG } from "@/config/api";

export function DocumentUploadModal({
  open,
  onOpenChange,
  equipment,
  onDocumentUploaded,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [formData, setFormData] = useState({
    archivo_id: "",
    document: null,
    fecha_capacitacion: "",
    hora_capacitacion: "",
    otro: "",
  });

  // Cargar tipos de documentos al abrir el modal
  useEffect(() => {
    if (open) {
      loadDocumentTypes();
      resetForm();
    }
  }, [open]);

  const loadDocumentTypes = async () => {
    try {
      console.log("🔍 [DOCUMENT MODAL] Cargando tipos de documentos...");
      const response = await httpService.get("/v1/document-types");

      if (response.data.success) {
        setDocumentTypes(response.data.data);
        console.log(
          "✅ [DOCUMENT MODAL] Tipos de documentos cargados:",
          response.data.data.length
        );
      } else {
        throw new Error("Error al cargar tipos de documentos");
      }
    } catch (error) {
      console.error("❌ [DOCUMENT MODAL] Error cargando tipos:", error);
      toast.error("Error al cargar tipos de documentos");
    }
  };

  const resetForm = () => {
    setFormData({
      archivo_id: "",
      document: null,
      fecha_capacitacion: "",
      hora_capacitacion: "",
      otro: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(
        "📁 [DOCUMENT MODAL] Archivo seleccionado:",
        file.name,
        `(${(file.size / 1024).toFixed(1)} KB)`
      );
      handleInputChange("document", file);
    }
  };

  const handleUpload = async () => {
    try {
      // Validaciones
      if (!formData.archivo_id) {
        toast.error("Por favor selecciona un tipo de documento");
        return;
      }

      if (!formData.document) {
        toast.error("Por favor selecciona un archivo");
        return;
      }

      // Validación especial para capacitaciones (archivo_id = 9)
      if (formData.archivo_id === "9") {
        if (!formData.fecha_capacitacion || !formData.hora_capacitacion) {
          toast.error("Para capacitaciones, la fecha y hora son obligatorias");
          return;
        }
      }

      setIsUploading(true);
      console.log("🚀 [DOCUMENT MODAL] Iniciando subida de documento...");
      console.log("📋 [DOCUMENT MODAL] Datos del formulario:", {
        equipo_id: equipment?.id,
        archivo_id: formData.archivo_id,
        archivo_nombre: formData.document?.name,
        archivo_tamaño: formData.document?.size,
        fecha_capacitacion: formData.fecha_capacitacion,
        hora_capacitacion: formData.hora_capacitacion,
        otro: formData.otro,
      });

      // Preparar FormData
      const uploadData = new FormData();
      uploadData.append("archivo_id", formData.archivo_id);
      uploadData.append("document", formData.document);

      // Campos especiales para capacitaciones
      if (formData.archivo_id === "9") {
        uploadData.append("fecha_capacitacion", formData.fecha_capacitacion);
        uploadData.append("hora_capacitacion", formData.hora_capacitacion);
      }

      // Campo especial para "otros documentos"
      if (formData.archivo_id === "19" && formData.otro) {
        uploadData.append("otro", formData.otro);
      }

      const url = `/v1/equipos/${equipment.id}/upload-document`;
      console.log("🌐 [DOCUMENT MODAL] URL de subida:", url);

      const response = await httpService.post(url, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📤 [DOCUMENT MODAL] Respuesta del servidor:", response);

      if (response.data.success) {
        toast.success("Documento subido exitosamente");
        console.log(
          "✅ [DOCUMENT MODAL] Documento subido:",
          response.data.data
        );

        // Callback para actualizar la lista en el componente padre
        if (onDocumentUploaded) {
          onDocumentUploaded(response.data.data);
        }

        // Limpiar formulario y cerrar modal
        resetForm();
        onOpenChange(false);
      } else {
        throw new Error(response.data.message || "Error al subir documento");
      }
    } catch (error) {
      console.error("❌ [DOCUMENT MODAL] Error en subida:", error);

      if (error.response?.data?.errors) {
        // Errores de validación del servidor
        const errores = Object.values(error.response.data.errors).flat();
        toast.error(`Errores de validación: ${errores.join(", ")}`);
      } else {
        toast.error(
          error.response?.data?.message || "Error al subir documento"
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Determinar si mostrar campos especiales
  const isTrainingDocument = formData.archivo_id === "9";
  const isOtherDocument = formData.archivo_id === "19";
  const selectedDocType = documentTypes.find(
    (type) => type.id.toString() === formData.archivo_id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[80vw] max-w-4xl max-h-[85vh] overflow-y-auto p-4"
        style={{
          width: "80vw",
          maxWidth: "1024px",
          height: "85vh",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            📎 Subir Documento al Equipo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Información del Equipo */}
          {equipment && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                🔧 Equipo Seleccionado:
              </h3>
              <p className="text-sm text-blue-700">
                <strong>ID:</strong> {equipment.id} | <strong>Código:</strong>{" "}
                {equipment.code} | <strong>Nombre:</strong> {equipment.name}
              </p>
              {equipment.serial && (
                <p className="text-sm text-blue-600">
                  <strong>Serie:</strong> {equipment.serial}
                </p>
              )}
            </div>
          )}

          {/* Formulario de Subida */}
          <div className="space-y-4">
            {/* Tipo de Documento */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileType className="h-4 w-4" />
                Tipo de Documento *
              </Label>
              <Select
                value={formData.archivo_id}
                onValueChange={(value) =>
                  handleInputChange("archivo_id", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar tipo de documento..." />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDocType && (
                <p className="text-xs text-gray-600 mt-1">
                  📋 Tipo seleccionado: <strong>{selectedDocType.name}</strong>
                </p>
              )}
            </div>

            {/* Campo especial para "Otro documento" */}
            {isOtherDocument && (
              <div>
                <Label className="text-sm font-medium">
                  Especificar tipo de documento
                </Label>
                <Input
                  value={formData.otro}
                  onChange={(e) => handleInputChange("otro", e.target.value)}
                  placeholder="Ej: Manual de instalación, Certificado ISO, etc."
                  className="mt-1"
                />
              </div>
            )}

            {/* Campos especiales para Capacitaciones */}
            {isTrainingDocument && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                  🎓 Información de Capacitación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Capacitación *
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_capacitacion}
                      onChange={(e) =>
                        handleInputChange("fecha_capacitacion", e.target.value)
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora de Capacitación *
                    </Label>
                    <Input
                      type="time"
                      value={formData.hora_capacitacion}
                      onChange={(e) =>
                        handleInputChange("hora_capacitacion", e.target.value)
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selección de Archivo */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Seleccionar Archivo *
              </Label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                📋 Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG,
                JPEG, PNG (máximo 10MB)
              </p>

              {/* Información del archivo seleccionado */}
              {formData.document && (
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <FileText className="h-4 w-4" />
                    <span>
                      <strong>{formData.document.name}</strong>
                    </span>
                    <span className="text-green-600">
                      ({(formData.document.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-between p-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            ❌ Cancelar
          </Button>

          <Button
            onClick={handleUpload}
            disabled={!formData.archivo_id || !formData.document || isUploading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                📤 Subir Documento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

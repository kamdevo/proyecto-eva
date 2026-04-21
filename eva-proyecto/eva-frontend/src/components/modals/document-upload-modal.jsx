"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/ui/searchable-select";
import {
  Upload,
  FileText,
  X,
  Calendar,
  Clock,
  FileType,
  CloudUpload,
} from "lucide-react";
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
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [documentTypeFreeText, setDocumentTypeFreeText] = useState("");
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
    setDocumentTypeFreeText("");
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
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 10MB permitido.");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Tipo de archivo no permitido. Use PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG o PNG."
      );
      return;
    }

    console.log(
      "📁 [DOCUMENT MODAL] Archivo seleccionado:",
      file.name,
      `(${(file.size / 1024).toFixed(1)} KB)`
    );
    handleInputChange("document", file);
    toast.success(`Archivo "${file.name}" seleccionado correctamente`);
  };

  // Funciones para Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      validateAndSetFile(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    try {
      // Validaciones
      if (!formData.archivo_id && !documentTypeFreeText.trim()) {
        toast.error("Por favor selecciona o escribe un tipo de documento");
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
      
      // Si hay un tipo seleccionado del listado, enviarlo
      if (formData.archivo_id) {
        uploadData.append("archivo_id", formData.archivo_id);
        
        // Campo especial para "otros documentos" cuando se selecciona manualmente
        if (formData.archivo_id === "19" && formData.otro) {
          uploadData.append("otro", formData.otro);
        }
      } 
      // Si hay texto libre, usar el ID 19 (Otro documento) y enviar el texto en el campo "otro"
      else if (documentTypeFreeText.trim()) {
        uploadData.append("archivo_id", "19"); // ID de "Otro documento"
        uploadData.append("otro", documentTypeFreeText.trim());
      }
      
      uploadData.append("document", formData.document);

      // Campos especiales para capacitaciones
      if (formData.archivo_id === "9") {
        uploadData.append("fecha_capacitacion", formData.fecha_capacitacion);
        uploadData.append("hora_capacitacion", formData.hora_capacitacion);
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
        className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        style={{
          width: "90vw",
          maxWidth: "768px",
          maxHeight: "90vh",
        }}
      >
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-[#1d293d]/5 to-[#1d293d]/10">
          <DialogTitle className="text-lg font-semibold text-[#1d293d] flex items-center gap-2">
            📎 Subir Documento al Equipo
          </DialogTitle>
          {/* Información del Equipo - Compacta */}
          {equipment && (
            <div className="text-sm text-[#1d293d] mt-2">
              <span className="font-medium">🔧 {equipment.name}</span>
              <span className="ml-2 text-[#2a3b52]">
                #{equipment.id} | {equipment.code}
                {equipment.serial && ` | Serie: ${equipment.serial}`}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Formulario de Subida - Layout optimizado */}
          <div className="space-y-4">
            {/* Tipo de Documento */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <FileType className="h-4 w-4" />
                Tipo de Documento *
              </Label>
              <SearchableSelect
                options={documentTypes}
                value={formData.archivo_id}
                onChange={(value) => {
                  handleInputChange("archivo_id", value);
                  if (value) setDocumentTypeFreeText("");
                }}
                allowFreeInput={true}
                onFreeInputChange={(text) => {
                  setDocumentTypeFreeText(text);
                  if (text) handleInputChange("archivo_id", "");
                }}
                placeholder="Buscar o escribir tipo de documento..."
                className=""
              />
              <p className="text-xs text-slate-500 mt-1.5">
                💡 Puede buscar en la lista o escribir un tipo personalizado
              </p>
              {selectedDocType && (
                <p className="text-xs text-gray-600 mt-1">
                  📋 <strong>{selectedDocType.name}</strong>
                </p>
              )}
              {documentTypeFreeText && (
                <p className="text-xs text-blue-600 mt-1">
                  ✏️ Tipo personalizado: <strong>{documentTypeFreeText}</strong>
                </p>
              )}
            </div>

            {/* Campo especial para "Otro documento" */}
            {isOtherDocument && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Especificar tipo de documento
                </Label>
                <Input
                  value={formData.otro}
                  onChange={(e) => handleInputChange("otro", e.target.value)}
                  placeholder="Ej: Manual de instalación, Certificado ISO..."
                />
              </div>
            )}

            {/* Campos especiales para Capacitaciones */}
            {isTrainingDocument && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                  🎓 Información de Capacitación
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      Fecha *
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_capacitacion}
                      onChange={(e) =>
                        handleInputChange("fecha_capacitacion", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      Hora *
                    </Label>
                    <Input
                      type="time"
                      value={formData.hora_capacitacion}
                      onChange={(e) =>
                        handleInputChange("hora_capacitacion", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Área de Drag & Drop para Archivo */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4" />
                Seleccionar Archivo *
              </Label>

              {/* Zona de Drag & Drop */}
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${
                    isDragOver
                      ? "border-[#1d293d] bg-[#1d293d]/5 scale-105"
                      : "border-gray-300 hover:border-[#1d293d] hover:bg-gray-50"
                  }
                  ${formData.document ? "border-green-500 bg-green-50" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropZoneClick}
              >
                {/* Input oculto */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />

                {!formData.document ? (
                  <>
                    {/* Icono y texto cuando no hay archivo */}
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className={`
                        p-4 rounded-full transition-colors duration-300
                        ${isDragOver ? "bg-[#1d293d]/20" : "bg-gray-100"}
                      `}
                      >
                        <CloudUpload
                          className={`
                          h-8 w-8 transition-colors duration-300
                          ${isDragOver ? "text-[#1d293d]" : "text-gray-500"}
                        `}
                        />
                      </div>

                      <div>
                        <p
                          className={`
                          text-lg font-medium transition-colors duration-300
                          ${isDragOver ? "text-[#1d293d]" : "text-gray-700"}
                        `}
                        >
                          {isDragOver
                            ? "¡Suelta el archivo aquí!"
                            : "Arrastra tu archivo aquí"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          o{" "}
                          <span className="text-[#1d293d] font-medium">
                            haz clic para seleccionar
                          </span>
                        </p>
                      </div>

                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                        <p className="font-medium mb-1">Formatos permitidos:</p>
                        <p>PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG, PNG</p>
                        <p className="mt-1 text-gray-400">
                          Tamaño máximo: 10MB
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Información del archivo seleccionado */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-green-200 rounded-full">
                        <FileText className="h-8 w-8 text-green-700" />
                      </div>

                      <div className="text-center">
                        <p className="text-lg font-medium text-green-700">
                          ✅ Archivo Seleccionado
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          {formData.document.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {(formData.document.size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputChange("document", null);
                            toast.info("Archivo removido");
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-[#1d293d] hover:text-[#2a3b52] hover:bg-[#1d293d]/5"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Cambiar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>

          <Button
            onClick={handleUpload}
            disabled={(!formData.archivo_id && !documentTypeFreeText.trim()) || !formData.document || isUploading}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Subir Documento
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

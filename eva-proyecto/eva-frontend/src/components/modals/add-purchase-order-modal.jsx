"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Upload, X, Loader2, FileText, AlertCircle, Search, ExternalLink } from "lucide-react";
import { useOrdenesCompra } from "../../hooks/useOrdenesCompra";
import { useTiposCompra, useProveedores } from "../../hooks/useTiposCompra";
import { SecopConsultationModal } from "./secop-consultation-modal";
import SearchableSelect from "@/components/ui/searchable-select";
import { toast } from "sonner";

export function AddPurchaseOrderModal({ open, onOpenChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [secopModalOpen, setSecopModalOpen] = useState(false);
  const [selectedSecopProcess, setSelectedSecopProcess] = useState(null);

  // Hooks para datos reales
  const { createOrden } = useOrdenesCompra();
  const { tipos, loading: tiposLoading } = useTiposCompra();
  const { proveedores, loading: proveedoresLoading } = useProveedores();

  // Estado del formulario
  const [formData, setFormData] = useState({
    orden: "",
    fecha: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    proveedor_id: "",
    tipo_compra_id: "",
    status: 1,
    secop_id: "",
    url_secop: "",
  });

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
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.orden || !formData.fecha || !formData.tipo_compra_id) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("orden", formData.orden);
      submitData.append("fecha", formData.fecha);
      submitData.append("tipo_compra_id", formData.tipo_compra_id);
      submitData.append("status", formData.status);

      if (formData.proveedor_id) {
        submitData.append("proveedor_id", formData.proveedor_id);
      }

      // Datos SECOP
      if (formData.secop_id) {
        submitData.append("secop_id", formData.secop_id);
      }

      if (formData.url_secop) {
        submitData.append("url_secop", formData.url_secop);
      }

      if (selectedFile) {
        submitData.append("file", selectedFile);
      }

      await createOrden(submitData);

      // Limpiar formulario y cerrar modal
      setFormData({
        orden: "",
        fecha: new Date().toISOString().split("T")[0],
        proveedor_id: "",
        tipo_compra_id: "",
        status: 1,
        secop_id: "",
        url_secop: "",
      });
      setSelectedFile(null);
      setSelectedSecopProcess(null);
      onOpenChange(false);

      toast.success("Orden de compra creada exitosamente");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al crear orden de compra: " + (error.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de proceso SECOP
  const handleSecopProcessSelect = (process) => {
    console.log('🔗 [SECOP] Proceso seleccionado:', process);
    
    setSelectedSecopProcess(process);
    
    // Determinar el ID SECOP del proceso
    const secopId = process.id || 
                   process.uid || 
                   process.numero_constancia || 
                   process.numero_proceso || 
                   process.codigo_proceso || 
                   "";
    
    // Determinar la URL SECOP
    const secopUrl = process.url_proceso || 
                    process.url_secop || 
                    process.enlace || 
                    "";
    
    // Actualizar el formulario con los datos del proceso SECOP
    setFormData(prev => ({
      ...prev,
      secop_id: secopId,
      url_secop: secopUrl,
    }));
    
    console.log('📦 [SECOP] Campos auto-llenados:', {
      secop_id: secopId,
      url_secop: secopUrl
    });
  };

  // Limpiar formulario al cerrar modal
  useEffect(() => {
    if (!open) {
      setFormData({
        orden: "",
        fecha: new Date().toISOString().split("T")[0],
        proveedor_id: "",
        tipo_compra_id: "",
        status: 1,
        secop_id: "",
        url_secop: "",
      });
      setSelectedFile(null);
      setSelectedSecopProcess(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[75vw] lg:w-[65vw] xl:w-[55vw] max-w-6xl mx-auto max-h-[90vh] md:max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                Nueva Orden de Compra
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                Complete el formulario para registrar una orden de compra
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4" id="purchase-order-form">
          <h3 className="text-sm sm:text-base font-medium text-slate-800 mb-4">
            Soporte de compra
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="codigo"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Código<span className="text-destructive">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="INGRESE EL NÚMERO"
                value={formData.orden}
                onChange={(e) => handleInputChange("orden", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
                required
              />
            </div>

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
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                className="h-8 sm:h-9 text-xs sm:text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="proveedor"
                className="text-xs sm:text-sm font-medium text-slate-700"
              >
                Proveedor
              </Label>
              <SearchableSelect
                value={formData.proveedor_id}
                onValueChange={(value) => handleInputChange("proveedor_id", value)}
                options={proveedores}
                placeholder={proveedoresLoading ? "Cargando..." : "Seleccionar proveedor"}
                disabled={proveedoresLoading}
                loading={proveedoresLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="tipoCompra"
              className="text-xs sm:text-sm font-medium text-slate-700"
            >
              Tipo de compra<span className="text-destructive">*</span>
            </Label>
            <SearchableSelect
              value={formData.tipo_compra_id}
              onValueChange={(value) => handleInputChange("tipo_compra_id", value)}
              options={tipos}
              placeholder={tiposLoading ? "Cargando..." : "Seleccionar tipo de compra"}
              disabled={tiposLoading}
              loading={tiposLoading}
            />
          </div>

          {/* Sección SECOP */}
          <div className="space-y-4 p-3 md:p-4 lg:p-5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700">
                Integración SECOP
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSecopModalOpen(true)}
                className="text-xs"
              >
                <Search className="w-3 h-3 mr-1" />
                Consultar SECOP
              </Button>
            </div>

            {selectedSecopProcess && (
              <div className="p-3 bg-white rounded border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-800">
                    ✓ Proceso SECOP Seleccionado - Campos Auto-llenados
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSecopProcess(null);
                      setFormData(prev => ({
                        ...prev,
                        secop_id: "",
                        url_secop: "",
                      }));
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Entidad:</strong> {selectedSecopProcess.entidad || 'N/A'}</div>
                  <div><strong>Objeto:</strong> {selectedSecopProcess.objeto || 'N/A'}</div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                    <div className="text-blue-700 font-medium mb-1">Campos auto-completados:</div>
                    <div><strong>ID SECOP:</strong> {formData.secop_id || 'No disponible'}</div>
                    <div><strong>URL SECOP:</strong> {formData.url_secop ? (
                      <a
                        href={formData.url_secop}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Ver en SECOP <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : 'No disponible'}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="secop_id" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  ID SECOP
                  {formData.secop_id && selectedSecopProcess && (
                    <span className="text-green-600 text-xs">✓ Auto-llenado</span>
                  )}
                </Label>
                <Input
                  id="secop_id"
                  value={formData.secop_id}
                  onChange={(e) => handleInputChange("secop_id", e.target.value)}
                  placeholder="UID o número de constancia SECOP"
                  className={`h-8 text-xs ${
                    formData.secop_id && selectedSecopProcess 
                      ? 'border-green-300 bg-green-50' 
                      : ''
                  }`}
                />
              </div>
              <div>
                <Label htmlFor="url_secop" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  URL SECOP
                  {formData.url_secop && selectedSecopProcess && (
                    <span className="text-green-600 text-xs">✓ Auto-llenado</span>
                  )}
                </Label>
                <Input
                  id="url_secop"
                  value={formData.url_secop}
                  onChange={(e) => handleInputChange("url_secop", e.target.value)}
                  placeholder="URL del proceso en SECOP"
                  className={`h-8 text-xs ${
                    formData.url_secop && selectedSecopProcess 
                      ? 'border-green-300 bg-green-50' 
                      : ''
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">
              Archivo asociado<span className="text-destructive">*</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-300 bg-slate-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400 mx-auto mb-2 sm:mb-3" />
              <div className="text-slate-500 text-xs sm:text-sm mb-1 sm:mb-2">
                Arrastra y suelta tu archivo aquí, o{" "}
                <label className="text-blue-600 font-medium cursor-pointer">
                  haz clic para seleccionar
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              <div className="text-slate-400 text-xs">
                Formatos soportados: PDF, DOC, DOCX (Máx. 10MB)
              </div>
              {selectedFile && (
                <div className="text-xs text-green-600 mt-2">
                  Archivo seleccionado: {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          {/* Botones dentro del formulario */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto px-4 sm:px-6 h-9 text-sm"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 h-9 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Orden"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal de consulta SECOP */}
      <SecopConsultationModal
        open={secopModalOpen}
        onOpenChange={setSecopModalOpen}
        onSelectProcess={handleSecopProcessSelect}
      />
    </Dialog>
  );
}

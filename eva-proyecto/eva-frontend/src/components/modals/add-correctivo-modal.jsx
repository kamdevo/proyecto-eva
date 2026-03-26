"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  AlertCircle,
  Upload,
  X,
  FileText,
  Plus,
  CheckCircle2,
  History,
  Settings,
  FileCode,
  Calendar,
  Clock,
  Trash2,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";
import apiClient from "@/config/apiClient";
import SearchableSelect from "@/components/ui/searchable-select";

function AddCorrectivoModal({ isOpen, onClose, equipmentId, equipmentName, onCorrectivoAdded }) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [equipmentType, setEquipmentType] = useState(1); // 1 = Biomédico, 2 = Industrial
  const [options, setOptions] = useState({
    cierres: [],
    tiposFalla: [],
    repuestos: []
  });

  // Form State
  const [formData, setFormData] = useState({
    // Orden de Trabajo
    code_orden: "",
    orden: "",
    fecha_orden: new Date().toISOString().split('T')[0],
    hora_orden: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),

    // Avance
    descripcion_avance: "",
    fecha_avance: new Date().toISOString().split('T')[0],
    titulo_avance: "",

    // Archivo Asociado
    titulo_archivo: "",

    // Cierre
    code: "",
    description: "",
    fecha_mantenimiento: new Date().toISOString().split('T')[0],
    hora_mantenimiento: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    tipo_falla_id: "",
    cierre_id: "",

    // Repuesto Instalado
    repuesto_id_instalado: "",
    cantidad_instalado: "1",
    fecha_instalacion: new Date().toISOString().split('T')[0],
    observacion_repuesto: "",

    // Repuestos Pendientes
    repuestos_pendientes: [""]
  });

  // Files
  const [correctivoFile, setCorrectivoFile] = useState(null);
  const [repuestoFile, setRepuestoFile] = useState(null);

  // Fetch Equipment Details and Options
  useEffect(() => {
    if (isOpen && equipmentId) {
      const init = async () => {
        try {
          // Obtener tipo_id del equipo para filtrar repuestos
          const eqRes = await apiClient.get(`/v1/equipos/${equipmentId}`);
          const typeId = eqRes.data?.data?.tipo_id || 1;
          setEquipmentType(typeId);
          fetchOptions(typeId);
        } catch (err) {
          console.error("Error fetching equipment details:", err);
          fetchOptions(1);
        }
      };
      init();
    }
  }, [isOpen, equipmentId]);

  const fetchOptions = async (typeId) => {
    try {
      // 1. Cierres — nueva ruta retorna { success: true, data: [...] }
      const resCierres = await apiClient.get('/v1/codificacioncierre?status=1');
      const cierres = Array.isArray(resCierres.data?.data)
        ? resCierres.data.data
        : (resCierres.data?.data?.data || resCierres.data?.data || []);

      // 2. Tipos de Falla — nueva ruta retorna { success: true, data: [...] }
      const resFallas = await apiClient.get('/v1/tipofalla');
      const fallas = Array.isArray(resFallas.data?.data)
        ? resFallas.data.data
        : (resFallas.data?.data?.data || resFallas.data?.data || []);


      // 3. Repuestos (Solo de la tabla repuestos)
      let normalizedRepuestos = [];
      try {
        const resRepuestos = await apiClient.get('/v1/repuestos-inventory?per_page=2000');
        console.log("✅ repuestos-inventory RAW:", resRepuestos.data);

        // La respuesta de ResponseFormatter::paginated es:
        // { success, message, data: [...items], pagination: {...} }
        let rawRepuestos = [];
        if (Array.isArray(resRepuestos.data?.data)) {
          rawRepuestos = resRepuestos.data.data;
        } else if (Array.isArray(resRepuestos.data?.data?.data)) {
          rawRepuestos = resRepuestos.data.data.data;
        } else if (Array.isArray(resRepuestos.data)) {
          rawRepuestos = resRepuestos.data;
        }

        console.log("📦 rawRepuestos count:", rawRepuestos.length);

        normalizedRepuestos = rawRepuestos.map(r => ({
          ...r,
          id: r.id,
          name: r.code ? `[${r.code}] ${r.name || r.nombre || ''}` : (r.name || r.nombre || `ID: ${r.id}`)
        }));
      } catch (repErr) {
        console.error("❌ Error cargando repuestos:", repErr?.response?.status, repErr?.response?.data || repErr?.message);
      }

      setOptions({
        cierres: Array.isArray(cierres) ? cierres : [],
        tiposFalla: Array.isArray(fallas) ? fallas : [],
        repuestos: normalizedRepuestos
      });

      console.log("✅ Options set — cierres:", cierres.length, "fallas:", fallas.length, "repuestos:", normalizedRepuestos.length);

    } catch (err) {
      console.warn("⚠️ Error general en fetchOptions:", err);
      setOptions({
        cierres: [{ id: 14, name: "ABIERTA" }, { id: 15, name: "CERRADA" }],
        tiposFalla: [{ id: 1, name: "Falla General" }],
        repuestos: []
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Repuestos Pendientes Handlers
  const addRepuestoPendiente = () => {
    setFormData(prev => ({
      ...prev,
      repuestos_pendientes: [...prev.repuestos_pendientes, ""]
    }));
  };

  const updateRepuestoPendiente = (index, value) => {
    const newRepuestos = [...formData.repuestos_pendientes];
    newRepuestos[index] = value;
    setFormData(prev => ({ ...prev, repuestos_pendientes: newRepuestos }));
  };

  const removeRepuestoPendiente = (index) => {
    setFormData(prev => ({
      ...prev,
      repuestos_pendientes: prev.repuestos_pendientes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const toastId = "adding-correctivo";
    toast.loading("Registrando correctivo...", { id: toastId });

    try {
      const data = new FormData();

      // Mapeo riguroso para CorrectivoGeneralController.php
      data.append('equipo_id', equipmentId);
      data.append('code_orden', formData.code_orden);
      data.append('orden', formData.orden);
      
      // Concatenar fecha y hora para DATETIME
      const fecha_inicio_full = `${formData.fecha_orden} ${formData.hora_orden}`;
      data.append('fecha_inicio', fecha_inicio_full);

      // Panel: Avance
      data.append('diagnostico', formData.descripcion_avance);
      data.append('fecha_diagnostico', formData.fecha_avance);
      data.append('code_diagnostico', formData.titulo_avance); // Título de avance va a code_diagnostico

      // Panel: Archivo Asociado
      data.append('titulo_archivo', formData.titulo_archivo || "Documento de Correctivo");
      if (correctivoFile) {
        data.append('file_correctivo', correctivoFile);
      }

      // Panel: Cierre
      data.append('code', formData.code);
      data.append('description', formData.description);
      
      const fecha_mantenimiento_full = `${formData.fecha_mantenimiento} ${formData.hora_mantenimiento}`;
      data.append('fecha_mantenimiento', fecha_mantenimiento_full);
      
      data.append('tipo_falla_id', formData.tipo_falla_id);
      data.append('cierre_id', formData.cierre_id);

      // Repuesto Instalado
      if (formData.repuesto_id_instalado && formData.repuesto_id_instalado !== "none") {
        data.append('repuesto_id', formData.repuesto_id_instalado);
        data.append('cantidad_entregada', formData.cantidad_instalado);
        data.append('fecha_repuesto', formData.fecha_instalacion);
        data.append('observacion_repuesto', formData.observacion_repuesto);
        if (repuestoFile) {
          data.append('file_repuesto', repuestoFile);
        }
      }

      // Repuestos Pendientes (Array para Laravel)
      if (formData.repuestos_pendientes.length > 0) {
        formData.repuestos_pendientes.forEach((name, index) => {
          if (name.trim()) {
            data.append(`repuestos_pendientes[${index}]`, name.trim());
          }
        });
      }

      const response = await apiClient.post('/v1/correctivos-generales', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success("Correctivo registrado exitosamente", { id: toastId });
        if (onCorrectivoAdded) onCorrectivoAdded();
        onClose();
      } else {
        throw new Error(response.data.message || "Error al registrar");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error al registrar correctivo";
      setSubmitError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="flex items-center gap-2 text-yellow-700">
            <History className="h-5 w-5" />
            Registrar Nuevo Correctivo General
          </DialogTitle>
          {equipmentName && (
            <p className="text-sm text-gray-600 mt-1">
              Equipo: <span className="font-medium">{equipmentName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCION 1: ORDEN DE TRABAJO */}
          <div className="space-y-4  p-5 rounded-lg border border-red-200 border-dashed border-4 ">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2 border-b border-red-100 pb-1">
              <FileCode className="h-4 w-4" />
              ORDEN DE TRABAJO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code_orden">Código de Orden</Label>
                <Input
                  id="code_orden"
                  placeholder="Ej: OT-2024-001"
                  value={formData.code_orden}
                  onChange={(e) => handleInputChange('code_orden', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orden">Descripción de la Orden</Label>
                <Input
                  id="orden"
                  placeholder="Descripción breve de la orden"
                  value={formData.orden}
                  onChange={(e) => handleInputChange('orden', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha y Hora del Reporte</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.fecha_orden}
                    onChange={(e) => handleInputChange('fecha_orden', e.target.value)}
                    required
                  />
                  <Input
                    type="time"
                    className="w-32"
                    value={formData.hora_orden}
                    onChange={(e) => handleInputChange('hora_orden', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCION 2: AVANCE */}
          <div className="space-y-4   p-5 rounded-lg border border-blue-200 border-dashed border-3 ">
            <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2 border-b border-blue-100 pb-1">
              <History className="h-4 w-4" />
              AVANCE / DIAGNÓSTICO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo_avance">Título del Avance</Label>
                <Input
                  id="titulo_avance"
                  placeholder="Ej: Diagnóstico Inicial"
                  value={formData.titulo_avance}
                  onChange={(e) => handleInputChange('titulo_avance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_avance">Fecha del Avance</Label>
                <Input
                  id="fecha_avance"
                  type="date"
                  value={formData.fecha_avance}
                  onChange={(e) => handleInputChange('fecha_avance', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion_avance">Detalles del Avance</Label>
                <Textarea
                  id="descripcion_avance"
                  placeholder="Describa el progreso o hallazgos"
                  rows={2}
                  value={formData.descripcion_avance}
                  onChange={(e) => handleInputChange('descripcion_avance', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECCION 3: ARCHIVO ASOCIADO */}
          <div className="space-y-4   p-5 rounded-lg border border-purple-200 border-dashed border-4 ">
            <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2 border-b border-purple-100 pb-1">
              <Upload className="h-4 w-4" />
              ARCHIVO ASOCIADO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo_archivo">Título del Archivo</Label>
                <Input
                  id="titulo_archivo"
                  placeholder="Nombre descriptivo del archivo"
                  value={formData.titulo_archivo}
                  onChange={(e) => handleInputChange('titulo_archivo', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Documento</Label>
                {!correctivoFile ? (
                  <div
                    className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => document.getElementById('file-main').click()}
                  >
                    <Upload className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Click para subir archivo</span>
                    <input
                      id="file-main"
                      type="file"
                      className="hidden"
                      onChange={(e) => setCorrectivoFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border text-xs">
                    <span className="truncate max-w-[150px]">{correctivoFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setCorrectivoFile(null)} className="h-6 w-6 p-0 text-red-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCION 4: CIERRE */}
          <div className="space-y-4   p-5 rounded-lg border border-emerald-200 border-dashed border-4 ">
            <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2 border-b border-emerald-100 pb-1">
              <CheckCircle2 className="h-4 w-4" />
              CIERRE DEL CORRECTIVO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code_cierre">Código / Retro</Label>
                <Input
                  id="code_cierre"
                  placeholder="Código de reporte"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Falla</Label>
                <Select value={formData.tipo_falla_id} onValueChange={(v) => handleInputChange('tipo_falla_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.tiposFalla.map(falla => (
                      <SelectItem key={falla.id} value={falla.id.toString()}>{falla.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado de Cierre</Label>
                <Select value={formData.cierre_id} onValueChange={(v) => handleInputChange('cierre_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.cierres.map(cierre => (
                      <SelectItem key={cierre.id} value={cierre.id.toString()}>{cierre.code} - {cierre.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha y Hora Cierre</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={formData.fecha_mantenimiento}
                    onChange={(e) => handleInputChange('fecha_mantenimiento', e.target.value)}
                  />
                  <Input
                    type="time"
                    className="w-32"
                    value={formData.hora_mantenimiento}
                    onChange={(e) => handleInputChange('hora_mantenimiento', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description_cierre">Trabajo Realizado</Label>
                <Textarea
                  id="description_cierre"
                  placeholder="Detalle de las actividades de resolución"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECCION 5: REPUESTO INSTALADO */}
          <div className="space-y-4   p-5 rounded-lg border border-orange-200 border-dashed border-4 ">
            <h3 className="text-sm font-bold text-orange-700 flex items-center gap-2 border-b border-orange-100 pb-1">
              <Settings className="h-4 w-4" />
              REPUESTO INSTALADO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Seleccionar Repuesto</Label>
                <SearchableSelect
                  placeholder="Selecciona un repuesto..."
                  options={options.repuestos}
                  value={formData.repuesto_id_instalado}
                  onValueChange={(val) => handleInputChange('repuesto_id_instalado', val)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  value={formData.cantidad_instalado}
                  onChange={(e) => handleInputChange('cantidad_instalado', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Instalación</Label>
                <Input
                  type="date"
                  value={formData.fecha_instalacion}
                  onChange={(e) => handleInputChange('fecha_instalacion', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Observación del Repuesto</Label>
                <Input
                  value={formData.observacion_repuesto}
                  onChange={(e) => handleInputChange('observacion_repuesto', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Evidencia de Repuesto</Label>
                {!repuestoFile ? (
                  <div
                    className="border-2 border-dashed rounded-md p-3 text-center cursor-pointer hover:bg-gray-50 text-xs"
                    onClick={() => document.getElementById('file-repuesto').click()}
                  >
                    <Upload className="mx-auto h-4 w-4 text-gray-400 mb-1" />
                    <span>Subir archivo</span>
                    <input
                      id="file-repuesto"
                      type="file"
                      className="hidden"
                      onChange={(e) => setRepuestoFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border text-xs">
                    <span className="truncate">{repuestoFile.name}</span>
                    <X className="h-4 w-4 text-red-500 cursor-pointer" onClick={() => setRepuestoFile(null)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECCION 6: REPUESTOS PENDIENTES */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-amber-100 pb-1">
              <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <Package className="h-4 w-4" />
                REPUESTOS PENDIENTES
              </h3>
              <Button type="button" variant="ghost" size="sm" onClick={addRepuestoPendiente} className="h-6 text-amber-600 hover:text-amber-700 py-0">
                <Plus className="h-3 w-3 mr-1" /> Añadir
              </Button>
            </div>

            <div className="space-y-2">
              {formData.repuestos_pendientes.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Nombre del repuesto necesario"
                    className="h-8 text-sm"
                    value={name}
                    onChange={(e) => updateRepuestoPendiente(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRepuestoPendiente(index)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-xs border border-red-100">
              <AlertCircle className="h-4 w-4" />
              <span>{submitError}</span>
            </div>
          )}

          <DialogFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-md"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-md"
            >
              {loading ? "Guardando..." : "Registrar Correctivo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddCorrectivoModal;

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
  Package,
  Paperclip,
  User
} from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";
import apiClient from "@/config/apiClient";
import SearchableSelect from "@/components/ui/searchable-select";

function AddCorrectivoModal({ isOpen, onClose, equipmentId, equipmentName, onCorrectivoAdded, correctivo = null }) {
  const isEditing = !!correctivo;
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
    fecha_orden: new Date().toLocaleDateString('sv-SE'),
    hora_orden: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),

    // Avance
    descripcion_avance: "",
    fecha_avance: new Date().toLocaleDateString('sv-SE'),
    titulo_avance: "",

    // Archivo Asociado
    titulo_archivo: "",

    // Cierre
    code: "",
    description: "",
    fecha_mantenimiento: new Date().toLocaleDateString('sv-SE'),
    hora_mantenimiento: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    tipo_falla_id: "",
    cierre_id: "",

    // Repuesto Instalado
    repuesto_id_instalado: "",
    cantidad_instalado: "1",
    fecha_instalacion: new Date().toLocaleDateString('sv-SE'),
    observacion_repuesto: "",

    // Repuestos Pendientes
    repuestos_pendientes: [""]
  });

  // Files
  const [correctivoFile, setCorrectivoFile] = useState(null);
  const [repuestoFile, setRepuestoFile] = useState(null);
  const [repuestoFreeText, setRepuestoFreeText] = useState("");

  // Avances
  const [avances, setAvances] = useState([]);
  const [loadingAvances, setLoadingAvances] = useState(false);
  const [showAvanceDialog, setShowAvanceDialog] = useState(false);
  const [avanceFile, setAvanceFile] = useState(null);
  const [savingAvance, setSavingAvance] = useState(false);
  const [avanceForm, setAvanceForm] = useState({
    titulo: '',
    fecha: new Date().toLocaleDateString('sv-SE'),
    descripcion: '',
  });

  // Archivos del correctivo (múltiples)
  const [archivosCorrectivo, setArchivosCorrectivo] = useState([]);
  const [uploadingArchivo, setUploadingArchivo] = useState(false);
  const [nuevoArchivoFile, setNuevoArchivoFile] = useState(null);
  const [nuevoArchivoTitulo, setNuevoArchivoTitulo] = useState('');

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

      // Load avances when editing
      if (correctivo) {
        fetchAvances(correctivo.id);
        fetchArchivos(correctivo.id);
      }

      // Pre-fill form when editing
      if (correctivo) {
        const parseDatePart = (dt) => dt ? (dt.includes('T') ? dt.split('T')[0] : dt.split(' ')[0]) : new Date().toLocaleDateString('sv-SE');
        const parseTimePart = (dt) => {
          if (!dt) return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
          const parts = dt.includes('T') ? dt.split('T')[1] : dt.split(' ')[1];
          return parts ? parts.substring(0, 5) : '00:00';
        };
        setFormData(prev => ({
          ...prev,
          code_orden: correctivo.code_orden || '',
          orden: correctivo.orden || '',
          fecha_orden: parseDatePart(correctivo.fecha_inicio),
          hora_orden: parseTimePart(correctivo.fecha_inicio),
          titulo_avance: correctivo.code_diagnostico || '',
          fecha_avance: parseDatePart(correctivo.fecha_diagnostico),
          descripcion_avance: correctivo.diagnostico || '',
          code: correctivo.code || '',
          description: correctivo.description || '',
          fecha_mantenimiento: parseDatePart(correctivo.fecha_mantenimiento),
          hora_mantenimiento: parseTimePart(correctivo.fecha_mantenimiento),
          tipo_falla_id: correctivo.tipo_falla_id ? String(correctivo.tipo_falla_id) : '',
          cierre_id: correctivo.cierre_id ? String(correctivo.cierre_id) : '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          code_orden: '',
          orden: '',
          fecha_orden: new Date().toLocaleDateString('sv-SE'),
          hora_orden: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          titulo_avance: '',
          fecha_avance: new Date().toLocaleDateString('sv-SE'),
          descripcion_avance: '',
          code: '',
          description: '',
          tipo_falla_id: '',
          cierre_id: '',
        }));
      }
    }
  }, [isOpen, equipmentId, correctivo]);

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

  const getUsuarioId = () => {
    try {
      const u = JSON.parse(localStorage.getItem('eva_user') || localStorage.getItem('usuario') || 'null');
      return u?.id || u?.user_id || u?.usuario_id || null;
    } catch { return null; }
  };

  const fetchAvances = async (correctivoId) => {
    setLoadingAvances(true);
    try {
      const res = await apiClient.get(`/v1/correctivos-generales/${correctivoId}/avances`);
      setAvances(res.data?.data || []);
    } catch (err) {
      console.error('Error cargando avances:', err);
      setAvances([]);
    } finally {
      setLoadingAvances(false);
    }
  };

  const handleAddAvance = async (e) => {
    e.preventDefault();
    if (!avanceForm.titulo.trim() || !avanceForm.descripcion.trim()) {
      toast.error('Título y descripción son requeridos');
      return;
    }
    setSavingAvance(true);
    try {
      const data = new FormData();
      data.append('titulo', avanceForm.titulo);
      data.append('fecha', avanceForm.fecha);
      data.append('descripcion', avanceForm.descripcion);
      if (avanceFile) data.append('archivo', avanceFile);
      const uid = getUsuarioId();
      if (uid) data.append('usuario_id', uid);

      const res = await apiClient.post(`/v1/correctivos-generales/${correctivo.id}/avances`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        toast.success('Avance agregado exitosamente');
        setShowAvanceDialog(false);
        setAvanceForm({ titulo: '', fecha: new Date().toLocaleDateString('sv-SE'), descripcion: '' });
        setAvanceFile(null);
        fetchAvances(correctivo.id);
        if (onCorrectivoAdded) onCorrectivoAdded();
      } else {
        throw new Error(res.data?.message || 'Error al guardar');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error al agregar avance');
    } finally {
      setSavingAvance(false);
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

  const fetchArchivos = async (correctivoId) => {
    try {
      const res = await apiClient.get(`/v1/correctivos-generales/${correctivoId}/archivos`);
      setArchivosCorrectivo(res.data?.data || []);
    } catch (err) {
      console.error('Error cargando archivos:', err);
    }
  };

  const handleUploadArchivo = async () => {
    if (!nuevoArchivoFile) { toast.error('Selecciona un archivo primero'); return; }
    if (nuevoArchivoFile.size > 20 * 1024 * 1024) { toast.error('El archivo excede el límite de 20MB'); return; }
    setUploadingArchivo(true);
    try {
      const data = new FormData();
      data.append('archivo', nuevoArchivoFile);
      data.append('titulo', (nuevoArchivoTitulo || nuevoArchivoFile.name).substring(0, 95));
      const res = await apiClient.post(`/v1/correctivos-generales/${correctivo.id}/archivos`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      if (res.data?.success) {
        toast.success('Archivo subido exitosamente');
        setNuevoArchivoFile(null);
        setNuevoArchivoTitulo('');
        fetchArchivos(correctivo.id);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al subir archivo';
      if (err?.code === 'ECONNABORTED') {
        toast.error('La subida tardó demasiado. Intenta con un archivo más pequeño.');
      } else {
        toast.error(msg);
      }
    } finally {
      setUploadingArchivo(false);
    }
  };

  const handleDeleteArchivo = async (archivoId) => {
    try {
      await apiClient.delete(`/v1/correctivos-generales/${correctivo.id}/archivos/${archivoId}`);
      setArchivosCorrectivo(prev => prev.filter(a => a.id !== archivoId));
      toast.success('Archivo eliminado');
    } catch (err) {
      toast.error('Error al eliminar archivo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const toastId = "adding-correctivo";
    toast.loading(isEditing ? "Actualizando correctivo..." : "Registrando correctivo...", { id: toastId });

    try {
      const data = new FormData();

      // Mapeo riguroso para CorrectivoGeneralController.php
      const uid = getUsuarioId();
      if (uid) data.append('usuario_id', uid);
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
      } else if (repuestoFreeText.trim()) {
        data.append('repuesto_nombre', repuestoFreeText.trim());
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

      let response;
      if (isEditing) {
        data.append('_method', 'PUT');
        response = await apiClient.post(`/v1/correctivos-generales/${correctivo.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await apiClient.post('/v1/correctivos-generales', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast.success(isEditing ? "Correctivo actualizado exitosamente" : "Correctivo registrado exitosamente", { id: toastId });
        if (onCorrectivoAdded) {
          try { await onCorrectivoAdded(); } catch (e) { console.warn('Error en onCorrectivoAdded:', e); }
        }
        onClose();
      } else {
        throw new Error(response.data.message || "Error al guardar");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error al guardar correctivo";
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
            {isEditing ? "Editar Correctivo General" : "Registrar Nuevo Correctivo General"}
          </DialogTitle>
          {equipmentName && (
            <p className="text-sm text-gray-600 mt-1">
              Equipo: <span className="font-medium">{equipmentName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCION 1: ORDEN DE TRABAJO */}
          <div className="space-y-4  p-5 rounded-lg border-red-200 border-dashed border-4 ">
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
          <div className="space-y-4 p-5 rounded-lg border-blue-200 border-dashed border-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-1">
              <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                <History className="h-4 w-4" />
                AVANCE / DIAGNÓSTICO
              </h3>
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => { setAvanceForm({ titulo: '', fecha: new Date().toLocaleDateString('sv-SE'), descripcion: '' }); setAvanceFile(null); setShowAvanceDialog(true); }}
                  className="h-7 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2"
                >
                  <Plus className="h-3 w-3 mr-1" /> Agregar Avance
                </Button>
              )}
            </div>

            {isEditing ? (
              loadingAvances ? (
                <p className="text-xs text-gray-400 py-2 text-center">Cargando avances...</p>
              ) : avances.length === 0 ? (
                <p className="text-xs text-gray-400 py-2 text-center">Sin avances registrados aún</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {avances.map(av => {
                    const nombreUsuario = av.usuario_nombre?.trim() || 'Usuario';
                    const inicial = nombreUsuario.charAt(0).toUpperCase();
                    return (
                      <div key={av.id} className="p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
                        {/* Header: avatar + nombre + fecha */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-white">{inicial}</span>
                          </div>
                          <span className="text-xs font-medium text-blue-700 flex-1 truncate">{nombreUsuario}</span>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {av.date ? String(av.date).split('T')[0] : ''}
                          </span>
                        </div>
                        {/* Título */}
                        <p className="text-xs font-semibold text-gray-800 leading-snug">{av.title || 'Sin título'}</p>
                        {/* Descripción */}
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">{av.description}</p>
                        {/* Adjunto */}
                        {av.file && (
                          <a
                            href={`${API_CONFIG.BASE_URL}/storage/correctivos_generales/${av.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-blue-500 hover:text-blue-700 underline"
                          >
                            <Paperclip className="h-2.5 w-2.5" /> Ver adjunto
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
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
            )}
          </div>

          {/* SUB-DIALOG: Agregar Avance */}
          <Dialog open={showAvanceDialog} onOpenChange={setShowAvanceDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-blue-700">
                  <History className="h-4 w-4" /> Agregar Avance
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAvance} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Título / Asunto del Avance <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Ej: Diagnóstico inicial"
                      value={avanceForm.titulo}
                      onChange={(e) => setAvanceForm(p => ({ ...p, titulo: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha del Avance</Label>
                    <Input
                      type="date"
                      value={avanceForm.fecha}
                      onChange={(e) => setAvanceForm(p => ({ ...p, fecha: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Archivo Asociado</Label>
                    {!avanceFile ? (
                      <div
                        className="border-2 border-dashed rounded-md p-2.5 text-center cursor-pointer hover:bg-gray-50 text-xs"
                        onClick={() => document.getElementById('avance-file').click()}
                      >
                        <Paperclip className="mx-auto h-4 w-4 text-gray-400 mb-0.5" />
                        <span className="text-gray-500">Adjuntar</span>
                        <input id="avance-file" type="file" className="hidden" onChange={(e) => setAvanceFile(e.target.files[0])} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs">
                        <span className="truncate max-w-[110px]">{avanceFile.name}</span>
                        <X className="h-3.5 w-3.5 text-red-500 cursor-pointer flex-shrink-0" onClick={() => setAvanceFile(null)} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descripción del Avance <span className="text-red-500">*</span></Label>
                    <Textarea
                      placeholder="Detalle lo realizado o encontrado..."
                      rows={3}
                      value={avanceForm.descripcion}
                      onChange={(e) => setAvanceForm(p => ({ ...p, descripcion: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAvanceDialog(false)} disabled={savingAvance}>Cancelar</Button>
                  <Button type="submit" disabled={savingAvance} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {savingAvance ? 'Guardando...' : 'Guardar Avance'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* SECCION 3: ARCHIVO ASOCIADO */}
          <div className="space-y-4   p-5 rounded-lg border-purple-200 border-dashed border-4 ">
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
          <div className="space-y-4   p-5 rounded-lg border-emerald-200 border-dashed border-4 ">
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
          <div className="space-y-4   p-5 rounded-lg border-orange-200 border-dashed border-4 ">
            <h3 className="text-sm font-bold text-orange-700 flex items-center gap-2 border-b border-orange-100 pb-1">
              <Settings className="h-4 w-4" />
              REPUESTO INSTALADO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Seleccionar Repuesto</Label>
                <SearchableSelect
                  placeholder="Selecciona o escribe un repuesto..."
                  options={options.repuestos}
                  value={formData.repuesto_id_instalado}
                  onValueChange={(val) => {
                    handleInputChange('repuesto_id_instalado', val);
                    if (val) setRepuestoFreeText("");
                  }}
                  allowFreeInput={true}
                  onFreeInputChange={(text) => {
                    setRepuestoFreeText(text);
                    if (text) handleInputChange('repuesto_id_instalado', "");
                  }}
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
              {loading ? "Guardando..." : (isEditing ? "Actualizar Correctivo" : "Registrar Correctivo")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddCorrectivoModal;

"use client";
import React, { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Plus, Eye, X, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { PDFSlick } from "@pdfslick/react";
import "@pdfslick/react/dist/pdf_viewer.css";
import axios from "axios";

export function AddEquipmentModal({ open, onOpenChange, onEquipmentAdded }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    // Identificación del equipo
    name: "",
    serial: "",
    code: "",
    marca: "",
    modelo: "",
    descripcion: "",
    codigo_antiguo: "",
    codigo_inventario: "",
    centro_costo: "",
    pais_origen: "",

    // Ubicación
    servicio_id: "",
    area_id: "",
    sede_id: "1", // Default SEDE HUV
    localizacion_actual: "",

    // Registro histórico
    tadquisicion_id: "",
    garantia: "",
    activo_comodato: "",
    fecha_adquisicion: "",
    fecha_instalacion: "",
    fecha_recepcion_almacen: "",
    fecha_acta_recibo: "",
    fecha_inicio_operacion: "",
    fecha_fabricacion: "",
    costo: "",
    vida_util: "",

    // Registro técnico
    fuente_id: "",
    tecnologia_id: "",
    evaluacion_desempeno: "",
    calibracion: false,
    periodicidad_calibracion: "",
    frecuencia_id: "",

    // Estado actual
    funcionalidad: "",
    disponibilidad_id: "",
    estadoequipo_id: "",

    // Apoyo técnico
    manuales: {
      operacion: false,
      mantenimiento: false,
      partes: false,
      otros: false
    },
    planos: {
      electrico: false,
      electronico: false,
      neumatico: false,
      mecanico: false
    },
    cbiomedica_id: "",
    criesgo_id: "",

    // Componentes y seguimiento
    componentes: "",
    propietario_id: "",
    verificacion_fisica: "",
    observaciones: "",

    // Archivos
    image: null,
    archivo_excel: null,
    archivo_invima: null,

    // Campos adicionales
    invima: "",
    tipo_id: "1" // Default biomédico
  });

  // Estados para catálogos
  const [catalogs, setCatalogs] = useState({
    servicios: [],
    areas: [],
    propietarios: [],
    fuentes_alimentacion: [],
    tecnologias: [],
    frecuencias_mantenimiento: [],
    clasificaciones_biomedicas: [],
    clasificaciones_riesgo: [],
    tipos_adquisicion: [],
    estados_equipo: [],
    disponibilidades: [],
    sedes: []
  });

  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [errors, setErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Referencias para archivos
  const imageInputRef = useRef(null);
  const excelInputRef = useRef(null);

  // Cargar catálogos al abrir el modal
  useEffect(() => {
    if (open) {
      loadCatalogs();
    }
  }, [open]);

  // Validación asíncrona de unicidad
  const validateUniqueness = async (field, value) => {
    if (!value) return;

    try {
      const response = await axios.get(`/api/v1/equipos/validate-unique`, {
        params: { field, value },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.data.unique) {
        setErrors(prev => ({
          ...prev,
          [field]: `Ya existe un equipo con este ${field === 'code' ? 'código' : field === 'serial' ? 'número de serie' : 'código antiguo'}`
        }));
      }
    } catch (error) {
      console.error('Error validating uniqueness:', error);
    }
  };

  // Debounce para validaciones asíncronas
  useEffect(() => {
    const timeouts = {};

    ['code', 'serial', 'codigo_antiguo'].forEach(field => {
      if (formData[field]) {
        timeouts[field] = setTimeout(() => {
          validateUniqueness(field, formData[field]);
        }, 500);
      }
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [formData.code, formData.serial, formData.codigo_antiguo]);

  // Función para cargar catálogos
  const loadCatalogs = async () => {
    try {
      setLoadingCatalogs(true);
      // Usar endpoint público directamente (sin autenticación)
      const response = await axios.get('/api/v1/test/modal-equipment-data', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setCatalogs(response.data.data);
      } else {
        toast.error('Error al cargar los catálogos');
      }
    } catch (error) {
      console.error('Error loading catalogs:', error);
      toast.error('Error al cargar los catálogos del sistema');
    } finally {
      setLoadingCatalogs(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Función para manejar cambios en checkboxes anidados
  const handleNestedCheckboxChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Función para comprimir imagen
  const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Función para manejar archivos
  const handleFileChange = async (field, file) => {
    if (!file) return;

    // Validar tipo y tamaño de archivo
    const validations = {
      image: {
        types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        label: 'imagen'
      },
      archivo_excel: {
        types: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'],
        maxSize: field === 'archivo_excel' ? 10 * 1024 * 1024 : 20 * 1024 * 1024, // 10MB Excel, 20MB PDF
        label: 'archivo'
      }
    };

    const validation = validations[field];

    if (!validation.types.includes(file.type)) {
      toast.error(`Tipo de archivo no válido para ${validation.label}`);
      return;
    }

    let processedFile = file;

    // Comprimir imagen si es necesario
    if (field === 'image' && file.size > 2 * 1024 * 1024) { // Comprimir si es mayor a 2MB
      try {
        toast.loading('Comprimiendo imagen...', { id: 'compress-image' });
        processedFile = await compressImage(file);
        toast.success('Imagen comprimida exitosamente', { id: 'compress-image' });
      } catch (error) {
        toast.error('Error al comprimir imagen', { id: 'compress-image' });
        return;
      }
    }

    if (processedFile.size > validation.maxSize) {
      toast.error(`El archivo es muy grande. Máximo ${validation.maxSize / (1024 * 1024)}MB`);
      return;
    }
  
    setFormData(prev => ({
      ...prev,
      [field]: processedFile
    }));

    toast.success(`${validation.label} seleccionada correctamente`);
  };

  // Función para previsualizar archivos
  const handlePreviewFile = (file, type) => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setPreviewFile(fileURL);
    setPreviewType(type);
    setShowPreview(true);
  };

  // Función para cerrar preview
  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setPreviewFile(null);
    setPreviewType(null);
    setShowPreview(false);
  };

  // Función para validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos obligatorios
    const requiredFields = {
      name: 'Nombre del equipo',
      serial: 'Serie',
      code: 'INV/Activo',
      marca: 'Marca',
      modelo: 'Modelo',
      codigo_antiguo: 'Código antiguo',
      codigo_inventario: 'Código nuevo',
      servicio_id: 'Servicio',
      centro_costo: 'Centro de costo',
      pais_origen: 'País de origen',
      tadquisicion_id: 'Forma de adquisición',
      garantia: 'Garantía',
      fecha_adquisicion: 'Fecha de adquisición',
      fecha_instalacion: 'Fecha de instalación',
      fecha_recepcion_almacen: 'Fecha recepción almacén',
      fecha_acta_recibo: 'Fecha acta de recibo',
      fecha_inicio_operacion: 'Fecha de inicio operación',
      fecha_fabricacion: 'Fecha de fabricación',
      costo: 'Costo',
      vida_util: 'Vida útil',
      fuente_id: 'Fuente de alimentación',
      tecnologia_id: 'Tecnología predominante',
      evaluacion_desempeno: 'Evaluación de desempeño',
      frecuencia_id: 'Frecuencia de mantenimiento',
      funcionalidad: 'Funcionalidad',
      disponibilidad_id: 'Disponibilidad',
      localizacion_actual: 'Localización actual',
      cbiomedica_id: 'Clasificación biomédica',
      criesgo_id: 'Clasificación de riesgo',
      propietario_id: 'Propietario',
      verificacion_fisica: 'Verificación física',
      archivo_excel: 'Archivo Excel hoja de vida'
    };

    // Validar campos obligatorios
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = `${label} es obligatorio`;
      }
    });

    // Validaciones específicas
    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.costo = 'El costo debe ser un número válido';
    }

    if (formData.vida_util && isNaN(parseInt(formData.vida_util))) {
      newErrors.vida_util = 'La vida útil debe ser un número entero';
    }

    // Validar fechas lógicas
    const fechas = ['fecha_fabricacion', 'fecha_adquisicion', 'fecha_recepcion_almacen', 'fecha_instalacion', 'fecha_inicio_operacion'];
    const fechaValues = fechas.map(f => formData[f] ? new Date(formData[f]) : null);

    if (fechaValues[0] && fechaValues[1] && fechaValues[0] > fechaValues[1]) {
      newErrors.fecha_adquisicion = 'La fecha de adquisición no puede ser anterior a la fecha de fabricación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Registrando equipo...', { id: 'submit-equipment' });

      // Crear FormData para envío con archivos
      const submitData = new FormData();

      // Agregar todos los campos del formulario con mapeo correcto
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'manuales' || key === 'planos') {
          // Convertir objetos anidados a JSON
          submitData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          // Archivos
          submitData.append(key, value);
        } else if (value !== null && value !== '') {
          // Mapear campos del frontend al backend
          let backendKey = key;
          if (key === 'serial') {
            backendKey = 'numero_serie'; // Mapear serial -> numero_serie
          }
          submitData.append(backendKey, value);
        }
      });

      const response = await axios.post('/api/v1/equipos', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Equipo registrado exitosamente', { id: 'submit-equipment' });

        // Resetear formulario
        setFormData({
          name: "", serial: "", code: "", marca: "", modelo: "", descripcion: "",
          codigo_antiguo: "", codigo_inventario: "", centro_costo: "", pais_origen: "",
          servicio_id: "", area_id: "", sede_id: "1", localizacion_actual: "",
          tadquisicion_id: "", garantia: "", activo_comodato: "",
          fecha_adquisicion: "", fecha_instalacion: "", fecha_recepcion_almacen: "",
          fecha_acta_recibo: "", fecha_inicio_operacion: "", fecha_fabricacion: "",
          costo: "", vida_util: "", fuente_id: "", tecnologia_id: "",
          evaluacion_desempeno: "", calibracion: false, periodicidad_calibracion: "",
          frecuencia_id: "", funcionalidad: "", disponibilidad_id: "", estadoequipo_id: "",
          manuales: { operacion: false, mantenimiento: false, partes: false, otros: false },
          planos: { electrico: false, electronico: false, neumatico: false, mecanico: false },
          cbiomedica_id: "", criesgo_id: "", componentes: "", propietario_id: "",
          verificacion_fisica: "", observaciones: "", image: null, archivo_excel: null,
          archivo_invima: null, invima: "", tipo_id: "1"
        });

        // Llamar callback si existe
        if (onEquipmentAdded) {
          onEquipmentAdded(response.data.data);
        }

        // Cerrar modal
        onOpenChange(false);
      } else {
        toast.error(response.data.message || 'Error al registrar equipo', { id: 'submit-equipment' });
      }
    } catch (error) {
      console.error('Error submitting equipment:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrar el equipo';
      toast.error(errorMessage, { id: 'submit-equipment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl min-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Agregar - Equipo biomédico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* REGISTRO DE EQUIPOS BIOMÉDICOS */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO DE EQUIPOS BIOMÉDICOS HOSPITAL UNIVERSITARIO DEL VALLE
                "EVARISTO GARCÍA"
              </CardTitle>
              <div className="text-center text-xs text-gray-600 mt-1">
                IDENTIFICACIÓN DEL EQUIPO
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Nombre del equipo:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="NOMBRE"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Serie:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="SERIE"
                      value={formData.serial}
                      onChange={(e) => handleInputChange('serial', e.target.value)}
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.serial ? 'border-red-500' : ''}`}
                    />
                    {errors.serial && <p className="text-red-500 text-xs mt-1">{errors.serial}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      INV/Activo:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="CÓDIGO INVENTARIO"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.code ? 'border-red-500' : ''}`}
                    />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Marca:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="MARCA"
                      value={formData.marca}
                      onChange={(e) => handleInputChange('marca', e.target.value)}
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.marca ? 'border-red-500' : ''}`}
                    />
                    {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Modelo:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="MODELO"
                      value={formData.modelo}
                      onChange={(e) => handleInputChange('modelo', e.target.value)}
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.modelo ? 'border-red-500' : ''}`}
                    />
                    {errors.modelo && <p className="text-red-500 text-xs mt-1">{errors.modelo}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      R.Invima:<span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="REGISTRO INVIMA"
                        value={formData.invima}
                        onChange={(e) => handleInputChange('invima', e.target.value)}
                        className="flex-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      />
                      <Button
                        size="sm"
                        type="button"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Archivo Registro INVIMA (PDF):
                    </Label>
                    <div className="mt-1">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange('archivo_invima', e.target.files[0])}
                        className="block w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {formData.archivo_invima && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ {formData.archivo_invima.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Descripción adicional:
                    </Label>
                    <Input
                      placeholder="DESCRIPCIÓN ADICIONAL"
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Archivo excel hoja de vida:
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => excelInputRef.current?.click()}
                      >
                        Seleccionar archivo
                      </Button>
                      <span className="text-sm text-gray-500 flex items-center">
                        {formData.archivo_excel ? formData.archivo_excel.name : 'NINGÚN ARCHIVO SELECCIONADO'}
                      </span>
                      {formData.archivo_excel && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => handlePreviewFile(formData.archivo_excel, 'excel')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.pdf"
                      onChange={(e) => handleFileChange('archivo_excel', e.target.files[0])}
                      className="hidden"
                    />
                    {errors.archivo_excel && <p className="text-red-500 text-xs mt-1">{errors.archivo_excel}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Antiguo:<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="CÓDIGO ANTIGUO"
                        value={formData.codigo_antiguo}
                        onChange={(e) => handleInputChange('codigo_antiguo', e.target.value)}
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.codigo_antiguo ? 'border-red-500' : ''}`}
                      />
                      {errors.codigo_antiguo && <p className="text-red-500 text-xs mt-1">{errors.codigo_antiguo}</p>}
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Nuevo:<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="CÓDIGO INVENTARIO"
                        value={formData.codigo_inventario}
                        onChange={(e) => handleInputChange('codigo_inventario', e.target.value)}
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.codigo_inventario ? 'border-red-500' : ''}`}
                      />
                      {errors.codigo_inventario && <p className="text-red-500 text-xs mt-1">{errors.codigo_inventario}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Ubicación:<span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-xs sm:text-sm">
                            Servicio ★<span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.servicio_id}
                            onValueChange={(value) => {
                              handleInputChange('servicio_id', value);
                              // Limpiar área cuando cambie el servicio
                              handleInputChange('area_id', '');
                            }}
                          >
                            <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.servicio_id ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogs.servicios?.map((servicio) => (
                                <SelectItem key={servicio.id} value={servicio.id.toString()}>
                                  {servicio.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.servicio_id && <p className="text-red-500 text-xs mt-1">{errors.servicio_id}</p>}
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">
                            Área ★ <span className="text-muted-foreground">(opcional)</span>
                          </Label>
                          <Select
                            value={formData.area_id}
                            onValueChange={(value) => handleInputChange('area_id', value)}
                            disabled={!formData.servicio_id}
                          >
                            <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.area_id ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder="Seleccionar área" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No disponible</SelectItem>
                              {catalogs.areas?.filter(area => area.servicio_id?.toString() === formData.servicio_id).map((area) => (
                                <SelectItem key={area.id} value={area.id.toString()}>
                                  {area.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.area_id && <p className="text-red-500 text-xs mt-1">{errors.area_id}</p>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Sede:<span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.sede_id}
                        onValueChange={(value) => handleInputChange('sede_id', value)}
                      >
                        <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="SEDE HUV" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogs.sedes?.map((sede) => (
                            <SelectItem key={sede.id} value={sede.id.toString()}>
                              {sede.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-gray-500 mt-1">
                        Seleccione la ubicación del equipo
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">
                          Centro de costo:
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="CENTRO DE COSTO"
                          value={formData.centro_costo}
                          onChange={(e) => handleInputChange('centro_costo', e.target.value)}
                          className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.centro_costo ? 'border-red-500' : ''}`}
                        />
                        {errors.centro_costo && <p className="text-red-500 text-xs mt-1">{errors.centro_costo}</p>}
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">
                          País de origen:
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="PAÍS DE ORIGEN"
                          value={formData.pais_origen}
                          onChange={(e) => handleInputChange('pais_origen', e.target.value)}
                          className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.pais_origen ? 'border-red-500' : ''}`}
                        />
                        {errors.pais_origen && <p className="text-red-500 text-xs mt-1">{errors.pais_origen}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      IMAGEN RELACIONADA DEL EQUIPO
                    </Label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2 min-h-[150px] sm:min-h-[180px] flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => imageInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files.length > 0) {
                          handleFileChange('image', files[0]);
                        }
                      }}
                    >
                      {formData.image ? (
                        <div className="w-full">
                          <img
                            src={URL.createObjectURL(formData.image)}
                            alt="Preview"
                            className="max-h-32 mx-auto mb-2 rounded"
                          />
                          <p className="text-sm text-gray-600 mb-2">{formData.image.name}</p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewFile(formData.image, 'image');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange('image', null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500 mb-2">
                            Arrastra y suelta archivos aquí
                          </p>
                          <p className="text-sm text-gray-400 mb-4">
                            (o haz clic para seleccionar archivo)
                          </p>
                          <Button variant="outline" size="sm" type="button">
                            SELECCIONAR ARCHIVO
                          </Button>
                        </>
                      )}
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('image', e.target.files[0])}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REGISTRO HISTÓRICO */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO HISTÓRICO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Forma de adquisición:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tadquisicion_id}
                    onValueChange={(value) => handleInputChange('tadquisicion_id', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.tadquisicion_id ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="--SELECCIONE--" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.tipos_adquisicion?.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tadquisicion_id && <p className="text-red-500 text-xs mt-1">{errors.tadquisicion_id}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Garantía:<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="GARANTÍA EN AÑOS"
                    value={formData.garantia}
                    onChange={(e) => handleInputChange('garantia', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.garantia ? 'border-red-500' : ''}`}
                  />
                  {errors.garantia && <p className="text-red-500 text-xs mt-1">{errors.garantia}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Activo comodato:
                    {formData.tadquisicion_id === '3' && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    placeholder="CÓDIGO DE COMODATO"
                    value={formData.activo_comodato}
                    onChange={(e) => handleInputChange('activo_comodato', e.target.value)}
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    disabled={formData.tadquisicion_id !== '3'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo requerido para equipos en comodato
                  </p>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de adquisición:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_adquisicion}
                    onChange={(e) => handleInputChange('fecha_adquisicion', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fecha_adquisicion ? 'border-red-500' : ''}`}
                  />
                  {errors.fecha_adquisicion && <p className="text-red-500 text-xs mt-1">{errors.fecha_adquisicion}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de instalación:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_instalacion}
                    onChange={(e) => handleInputChange('fecha_instalacion', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fecha_instalacion ? 'border-red-500' : ''}`}
                  />
                  {errors.fecha_instalacion && <p className="text-red-500 text-xs mt-1">{errors.fecha_instalacion}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha recepción almacén:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_recepcion_almacen}
                    onChange={(e) => handleInputChange('fecha_recepcion_almacen', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fecha_recepcion_almacen ? 'border-red-500' : ''}`}
                  />
                  {errors.fecha_recepcion_almacen && <p className="text-red-500 text-xs mt-1">{errors.fecha_recepcion_almacen}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha acta de recibo:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_acta_recibo}
                    onChange={(e) => handleInputChange('fecha_acta_recibo', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fecha_acta_recibo ? 'border-red-500' : ''}`}
                  />
                  {errors.fecha_acta_recibo && <p className="text-red-500 text-xs mt-1">{errors.fecha_acta_recibo}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de inicio operación:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_inicio_operacion}
                    onChange={(e) => handleInputChange('fecha_inicio_operacion', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fecha_inicio_operacion ? 'border-red-500' : ''}`}
                  />
                  {errors.fecha_inicio_operacion && <p className="text-red-500 text-xs mt-1">{errors.fecha_inicio_operacion}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de fabricación:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_fabricacion}
                    onChange={(e) => handleInputChange('fecha_fabricacion', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fecha_fabricacion ? 'border-red-500' : ''}`}
                  />
                  {errors.fecha_fabricacion && <p className="text-red-500 text-xs mt-1">{errors.fecha_fabricacion}</p>}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Costo:<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="COSTO EN PESOS"
                    type="number"
                    value={formData.costo}
                    onChange={(e) => handleInputChange('costo', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.costo ? 'border-red-500' : ''}`}
                  />
                  {errors.costo && <p className="text-red-500 text-xs mt-1">{errors.costo}</p>}
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">
                    Vida útil:<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="VIDA ÚTIL EN AÑOS"
                    type="number"
                    value={formData.vida_util}
                    onChange={(e) => handleInputChange('vida_util', e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.vida_util ? 'border-red-500' : ''}`}
                  />
                  {errors.vida_util && <p className="text-red-500 text-xs mt-1">{errors.vida_util}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REGISTRO TÉCNICO DE INSTALACIÓN Y FUNCIONAMIENTO */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO TÉCNICO DE INSTALACIÓN Y FUNCIONAMIENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Fuente de alimentación:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.fuente_id}
                    onValueChange={(value) => handleInputChange('fuente_id', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.fuente_id ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.fuentes_alimentacion?.map((fuente) => (
                        <SelectItem key={fuente.id} value={fuente.id.toString()}>
                          {fuente.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuente_id && <p className="text-red-500 text-xs mt-1">{errors.fuente_id}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Tecnología predominante:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tecnologia_id}
                    onValueChange={(value) => handleInputChange('tecnologia_id', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.tecnologia_id ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.tecnologias?.map((tecnologia) => (
                        <SelectItem key={tecnologia.id} value={tecnologia.id.toString()}>
                          {tecnologia.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tecnologia_id && <p className="text-red-500 text-xs mt-1">{errors.tecnologia_id}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Evaluación de desempeño:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.evaluacion_desempeno}
                    onValueChange={(value) => handleInputChange('evaluacion_desempeno', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.evaluacion_desempeno ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="deficiente">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.evaluacion_desempeno && <p className="text-red-500 text-xs mt-1">{errors.evaluacion_desempeno}</p>}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    ¿Se realiza calibración?
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.calibracion ? "true" : "false"}
                    onValueChange={(value) => handleInputChange('calibracion', value === "true")}
                  >
                    <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Periodicidad calibración:
                    {formData.calibracion && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    placeholder="Periodicidad en meses"
                    value={formData.periodicidad_calibracion}
                    onChange={(e) => handleInputChange('periodicidad_calibracion', e.target.value)}
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    disabled={!formData.calibracion}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo requerido si se realiza calibración
                  </p>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Frecuencia de mantenimiento:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.frecuencia_id}
                    onValueChange={(value) => handleInputChange('frecuencia_id', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.frecuencia_id ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.frecuencias_mantenimiento?.map((frecuencia) => (
                        <SelectItem key={frecuencia.id} value={frecuencia.id.toString()}>
                          {frecuencia.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.frecuencia_id && <p className="text-red-500 text-xs mt-1">{errors.frecuencia_id}</p>}
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <Label className="text-base font-semibold text-xs sm:text-sm">
                  Estado actual del equipo:
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Funcionalidad:<span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.funcionalidad}
                      onValueChange={(value) => handleInputChange('funcionalidad', value)}
                    >
                      <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.funcionalidad ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optima">Óptima</SelectItem>
                        <SelectItem value="buena">Buena</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="deficiente">Deficiente</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.funcionalidad && <p className="text-red-500 text-xs mt-1">{errors.funcionalidad}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Disponibilidad:<span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.disponibilidad_id}
                      onValueChange={(value) => handleInputChange('disponibilidad_id', value)}
                    >
                      <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.disponibilidad_id ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.disponibilidades?.map((disponibilidad) => (
                          <SelectItem key={disponibilidad.id} value={disponibilidad.id.toString()}>
                            {disponibilidad.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.disponibilidad_id && <p className="text-red-500 text-xs mt-1">{errors.disponibilidad_id}</p>}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Localización actual:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="LOCALIZACIÓN ACTUAL"
                      value={formData.localizacion_actual}
                      onChange={(e) => handleInputChange('localizacion_actual', e.target.value)}
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.localizacion_actual ? 'border-red-500' : ''}`}
                    />
                    {errors.localizacion_actual && <p className="text-red-500 text-xs mt-1">{errors.localizacion_actual}</p>}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* REGISTRO DE APOYO TÉCNICO */}
              <div>
                <Label className="text-base font-semibold text-xs sm:text-sm">
                  REGISTRO DE APOYO TÉCNICO
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div>
                    <Label className="font-medium text-xs sm:text-sm">
                      Manuales:<span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="manual-operacion"
                          checked={formData.manuales.operacion}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('manuales', 'operacion', checked)}
                        />
                        <Label
                          htmlFor="manual-operacion"
                          className="text-xs sm:text-sm"
                        >
                          Operación
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="manual-mantenimiento"
                          checked={formData.manuales.mantenimiento}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('manuales', 'mantenimiento', checked)}
                        />
                        <Label
                          htmlFor="manual-mantenimiento"
                          className="text-xs sm:text-sm"
                        >
                          Mantenimiento
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="manual-partes"
                          checked={formData.manuales.partes}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('manuales', 'partes', checked)}
                        />
                        <Label
                          htmlFor="manual-partes"
                          className="text-xs sm:text-sm"
                        >
                          Partes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="manual-otros"
                          checked={formData.manuales.otros}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('manuales', 'otros', checked)}
                        />
                        <Label
                          htmlFor="manual-otros"
                          className="text-xs sm:text-sm"
                        >
                          Otros
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="font-medium text-xs sm:text-sm">
                      Planos:<span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano-electrico"
                          checked={formData.planos.electrico}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('planos', 'electrico', checked)}
                        />
                        <Label
                          htmlFor="plano-electrico"
                          className="text-xs sm:text-sm"
                        >
                          Eléctrico
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano-electronico"
                          checked={formData.planos.electronico}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('planos', 'electronico', checked)}
                        />
                        <Label
                          htmlFor="plano-electronico"
                          className="text-xs sm:text-sm"
                        >
                          Electrónico
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano-neumatico"
                          checked={formData.planos.neumatico}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('planos', 'neumatico', checked)}
                        />
                        <Label
                          htmlFor="plano-neumatico"
                          className="text-xs sm:text-sm"
                        >
                          Neumático
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano-mecanico"
                          checked={formData.planos.mecanico}
                          onCheckedChange={(checked) => handleNestedCheckboxChange('planos', 'mecanico', checked)}
                        />
                        <Label
                          htmlFor="plano-mecanico"
                          className="text-xs sm:text-sm"
                        >
                          Mecánico
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Clasificación biomédica:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.cbiomedica_id}
                      onValueChange={(value) => handleInputChange('cbiomedica_id', value)}
                    >
                      <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.cbiomedica_id ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.clasificaciones_biomedicas?.map((clasificacion) => (
                          <SelectItem key={clasificacion.id} value={clasificacion.id.toString()}>
                            {clasificacion.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cbiomedica_id && <p className="text-red-500 text-xs mt-1">{errors.cbiomedica_id}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Solo visible para equipos biomédicos (tipo_id = 1)
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Clasificación de acuerdo al riesgo:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.criesgo_id}
                      onValueChange={(value) => handleInputChange('criesgo_id', value)}
                    >
                      <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.criesgo_id ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.clasificaciones_riesgo?.map((riesgo) => (
                          <SelectItem key={riesgo.id} value={riesgo.id.toString()}>
                            {riesgo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.criesgo_id && <p className="text-red-500 text-xs mt-1">{errors.criesgo_id}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COMPONENTES */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                COMPONENTES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="border border-gray-300 rounded-lg p-4 min-h-[80px] sm:min-h-[100px] bg-white">
                <Textarea
                  placeholder="Descripción de componentes del equipo..."
                  value={formData.componentes}
                  onChange={(e) => handleInputChange('componentes', e.target.value)}
                  className="min-h-[100px] border-none resize-none focus:ring-0 w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEGUIMIENTO */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                SEGUIMIENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Propietario:<span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.propietario_id}
                    onValueChange={(value) => handleInputChange('propietario_id', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.propietario_id ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="SELECCIONE UN ELEMENTO DE LA LISTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No disponible</SelectItem>
                      {catalogs.propietarios?.map((propietario) => (
                        <SelectItem key={propietario.id} value={propietario.id.toString()}>
                          {propietario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propietario_id && <p className="text-red-500 text-xs mt-1">{errors.propietario_id}</p>}
                  <Button variant="outline" size="sm" className="mt-2" type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Verificación física:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.verificacion_fisica}
                    onValueChange={(value) => handleInputChange('verificacion_fisica', value)}
                  >
                    <SelectTrigger className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${errors.verificacion_fisica ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="no-aplica">No Aplica</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.verificacion_fisica && <p className="text-red-500 text-xs mt-1">{errors.verificacion_fisica}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OBSERVACIONES */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                OBSERVACIONES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <Textarea
                placeholder="Escriba todas las observaciones que se estimen pertinentes para el seguimiento del equipo"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                className="min-h-[60px] sm:min-h-[80px] w-full"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between p-4 border-t">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            onClick={handleSubmit}
            disabled={loading || loadingCatalogs}
            type="button"
          >
            {loading ? 'Registrando...' : 'Agregar'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-8"
            disabled={loading}
            type="button"
          >
            Cerrar
          </Button>
        </div>

        {/* Modal de previsualización de archivos */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={closePreview}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewType === 'image' ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  Previsualización de archivo
                </DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {previewType === 'image' && (
                  <img
                    src={previewFile}
                    alt="Preview"
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                )}
                {previewType === 'excel' && previewFile && (
                  <div className="text-center">
                    {previewFile.endsWith('.pdf') ? (
                      <div className="h-96">
                        <PDFSlick
                          file={previewFile}
                          className="h-full"
                        />
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">
                          Archivo Excel seleccionado. La previsualización no está disponible para archivos Excel.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          El archivo se procesará al enviar el formulario.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end p-4 border-t">
                <Button variant="outline" onClick={closePreview}>
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

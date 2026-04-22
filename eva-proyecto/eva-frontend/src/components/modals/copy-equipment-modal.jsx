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
import {
  Upload,
  Plus,
  Eye,
  X,
  FileText,
  Image as ImageIcon,
  Search,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import httpService from "@/services/httpService";
import { AgregarRegistroInvimaModal } from "./agregar-registro-invima-modal";
import SearchableSelect from "@/components/ui/searchable-select";

export function CopyEquipmentModal({
  open,
  onOpenChange,
  onEquipmentAdded,
  equipment = null, // El equipo origen del que se copian los datos
  equipmentType = "biomedical", // "biomedical" | "industrial"
}) {
  // Estado del formulario
  const [loadingDetails, setLoadingDetails] = useState(false);
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
    movilidad: "",
    fuente_id: "",
    tecnologia_id: "",
    evaluacion_desempeno: "",
    calibracion: false,
    periodicidad_calibracion: "",
    frecuencia_id: "",

    // Estado actual
    funcionalidad: "",
    estadoequipo_id: "",

    // Apoyo técnico
    manuales: {
      operacion: false,
      mantenimiento: false,
      partes: false,
      otros: false,
    },
    planos: {
      electrico: false,
      electronico: false,
      neumatico: false,
      mecanico: false,
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
    tipo_id: equipmentType === "industrial" ? "2" : "1", // 1=biomédico, 2=industrial
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
    sedes: [],
    centros: [],
  });

  // Estado para registros INVIMA
  const [registrosInvima, setRegistrosInvima] = useState([]);
  const [loadingInvima, setLoadingInvima] = useState(false);
  const [searchInvima, setSearchInvima] = useState("");

  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [errors, setErrors] = useState({});
  const [showInvimaModal, setShowInvimaModal] = useState(false);
  const [formReady, setFormReady] = useState(false);

  // Función para deserializar datos de PHP (Misma que EditEquipmentModal)
  const deserializePHPData = (phpSerializedString) => {
    if (!phpSerializedString || typeof phpSerializedString !== "string") {
      return {};
    }

    try {
      if (phpSerializedString.startsWith("{") || phpSerializedString.startsWith("[")) {
        return JSON.parse(phpSerializedString);
      }

      if (phpSerializedString === "N;") return {};

      const result = {};
      const stringMatches = phpSerializedString.match(/s:\d+:"([^"]+)"/g);
      if (stringMatches) {
        const values = stringMatches
          .map((match) => {
            const valueMatch = match.match(/s:\d+:"([^"]+)"/);
            return valueMatch ? valueMatch[1] : null;
          })
          .filter(Boolean);

        values.forEach((value) => {
          result[value] = true;
        });
      }
      return result;
    } catch (e) {
      console.warn("⚠️ [CopyModal] Error deserializando datos PHP:", e, phpSerializedString);
      return {};
    }
  };

  // Referencias para archivos
  const imageInputRef = useRef(null);
  const excelInputRef = useRef(null);

  // Reset del formulario y obtención de datos cuando el modal se abre
  useEffect(() => {
    if (open) {
      console.log("🔍 [CopyModal] Modal abierto. Prop equipment:", equipment);
      setErrors({}); // Limpiar errores previos
      loadCatalogs();
      loadRegistrosInvima();
      
      // Si tenemos un equipo origen con ID, buscar sus detalles completos
      if (equipment?.id) {
        fetchEquipmentDetails(equipment.id);
      } else {
        console.warn("⚠️ [CopyModal] El equipo prop no tiene ID o es null.");
        if (equipment) populateForm(equipment);
      }
    }
  }, [open, equipment?.id]);

  // Función para obtener detalles completos del equipo origen
  const fetchEquipmentDetails = async (id) => {
    try {
      setLoadingDetails(true);
      console.log(`🌐 [CopyModal] Solicitando /v1/equipos/${id}/complete-info ...`);
      
      const response = await httpService.get(`/v1/equipos/${id}/complete-info`);
      
      console.log("📡 [CopyModal] Respuesta completa:", response.data);

      if (response.data.success && response.data.data) {
        const fullData = response.data.data;
        console.log("✅ [CopyModal] Detalles completos recibidos:", fullData);
        populateForm(fullData);
      } else {
        console.warn("⚠️ [CopyModal] La API no devolvió success, usando datos locales.");
        populateForm(equipment);
      }
    } catch (error) {
      console.error("❌ [CopyModal] Error al obtener detalles:", error);
      populateForm(equipment);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Función para poblar el formulario con datos
  const populateForm = (sourceData) => {
    if (!sourceData) {
      console.error("❌ [CopyModal] No hay sourceData para poblar el formulario");
      return;
    }

    console.log("📋 [CopyModal] Poblando formulario con:", sourceData);
    setFormReady(false);

    // Intentar encontrar el objeto base (a veces está envuelto en 'equipo')
    // El backend de complete-info devuelve el objeto directamente en el nivel superior de 'data'
    const baseEq = sourceData.equipo || sourceData;
    
    // Helper para formatear fechas a YYYY-MM-DD
    const fmtDate = (d) => {
      if (!d) return "";
      try {
        const dateObj = new Date(d);
        if (isNaN(dateObj.getTime())) return "";
        return dateObj.toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    // Helper para asegurar que IDs sean strings y maneje 0 como vacío
    const safeId = (val) => {
      if (val === null || val === undefined || val === 0 || val === "0" || val === "null") return "";
      return String(val);
    };

    // Mapeo EXACTO basado en EditEquipmentModal.jsx
    const newFormData = {
      // ── Identificación ────────────────────────────
      name: baseEq.name || baseEq.nombre || "",
      marca: baseEq.marca || "",
      modelo: baseEq.modelo || "",
      descripcion: baseEq.descripcion || "",
      pais_origen: baseEq.propiedad || baseEq.pais_origen || "",
      centro_costo: safeId(baseEq.centro_id || baseEq.centro_costo_id),
      localizacion_actual: baseEq.localizacion_actual || "",
      componentes: baseEq.componentes || "",
      evaluacion_desempeno: baseEq.evaluacion_desempenio || baseEq.evaluacion_desempeno || "",

      // ── Fechas (Usando nombres de DB de EditEquipmentModal) ──
      fecha_fabricacion: fmtDate(baseEq.fecha_fabricacion),
      fecha_instalacion: fmtDate(baseEq.fecha_instalacion),
      fecha_adquisicion: fmtDate(baseEq.fecha_ad || baseEq.fecha_adquisicion),
      fecha_recepcion_almacen: fmtDate(baseEq.fecha_recepcion_almacen),
      fecha_acta_recibo: fmtDate(baseEq.fecha_acta_recibo),
      fecha_inicio_operacion: fmtDate(baseEq.fecha_inicio_operacion),

      // ── Valores y Ciclo de vida ──────────────────────
      costo: baseEq.costo || "",
      vida_util: baseEq.vida_util || "",
      garantia: baseEq.garantia || "",
      activo_comodato: !!(baseEq.activo_comodato === 1 || baseEq.activo_comodato === true),

      // ── IDs Técnicos y Clasificación ───────────────
      fuente_id: safeId(baseEq.fuente_id),
      tecnologia_id: safeId(baseEq.tecnologia_id),
      frecuencia_id: safeId(baseEq.frecuencia_id),
      estadoequipo_id: safeId(baseEq.estadoequipo_id),
      cbiomedica_id: safeId(baseEq.cbiomedica_id),
      criesgo_id: safeId(baseEq.criesgo_id),
      propietario_id: safeId(baseEq.propietario_id),
      tadquisicion_id: safeId(baseEq.tadquisicion_id),
      servicio_id: safeId(baseEq.servicio_id),
      area_id: safeId(baseEq.area_id),
      sede_id: safeId(baseEq.sede_id || "1"),

      // ── Otros técnicos ───────────────────────────
      calibracion: !!(baseEq.calibracion === 1 || baseEq.calibracion === true || baseEq.calibracion === "SI"),
      periodicidad_calibracion: baseEq.periodicidad || baseEq.periodicidad_calibracion || "",
      funcionalidad: baseEq.funcionalidad || "",
      verificacion_fisica: baseEq.verificacion_fisica || "",
      
      // ── Apoyo técnico (Deserialización PHP) ───────
      manuales: deserializePHPData(baseEq.manual || baseEq.manuales),
      planos: deserializePHPData(baseEq.plano || baseEq.planos),

      // ── INVIMA ────────────────────────────────────
      invima: baseEq.invima || baseEq.numero_invima || "",
      invima_id: (baseEq.invima_id && baseEq.invima_id !== 0) ? baseEq.invima_id.toString() : "",

      // ── Campos ÚNICOS (Vaciados por ser copia) ──────
      serial: "",
      code: "",
      codigo_antiguo: "",
      codigo_inventario: "",

      // ── Variables Sistema ─────────────────────────
      tipo_id: equipmentType === "industrial" ? "2" : "1",
      observaciones: "",
      image: null,
      archivo_excel: null,
      archivo_invima: null,
      currentImageUrl: baseEq.image_url || (baseEq.image ? `${import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001"}/storage/${baseEq.image}` : null),
    };

    setFormData(newFormData);
    // Pequeño delay para asegurar que el estado se procesó
    setTimeout(() => {
      setFormReady(true);
      console.log("✅ [CopyModal] Formulario listo.");
    }, 100);
  };

  // Reset del formulario cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      setFormData((prev) => ({
        ...prev,
        serial: "",
        code: "",
        codigo_antiguo: "",
        codigo_inventario: "",
      }));
    }
  }, [open]);
  // =============================================================

  // Validación asíncrona de unicidad
  const validateUniqueness = async (field, value) => {
    if (!value) return;

    try {
      const response = await httpService.get(`/v1/equipos/validate-unique`, {
        params: { field, value },
      });

      if (!response.data.unique) {
        setErrors((prev) => ({
          ...prev,
          [field]: `Ya existe un equipo con este ${
            field === "code"
              ? "código"
              : field === "serial"
              ? "número de serie"
              : "código antiguo"
          }`,
        }));
      }
    } catch (error) {
      console.error("Error validating uniqueness:", error);
    }
  };

  // Debounce para validaciones asíncronas
  useEffect(() => {
    const timeouts = {};

    ["code", "serial", "codigo_antiguo"].forEach((field) => {
      if (formData[field]) {
        timeouts[field] = setTimeout(() => {
          validateUniqueness(field, formData[field]);
        }, 500);
      }
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, [formData.code, formData.serial, formData.codigo_antiguo]);

  // Función para cargar catálogos
  const loadCatalogs = async () => {
    try {
      setLoadingCatalogs(true);
      // Usar endpoint público directamente (sin autenticación)
      const response = await httpService.get("/v1/test/modal-equipment-data");

      if (response.data.success) {
        setCatalogs(response.data.data);
      } else {
        toast.error("Error al cargar los catálogos");
      }
    } catch (error) {
      console.error("Error loading catalogs:", error);
      toast.error("Error al cargar los catálogos del sistema");
    } finally {
      setLoadingCatalogs(false);
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Función para manejar cambios en checkboxes anidados
  const handleNestedCheckboxChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Función para comprimir imagen
  const compressImage = (
    file,
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8
  ) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
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
        canvas.toBlob(resolve, "image/jpeg", quality);
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
        types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        maxSize: 5 * 1024 * 1024, // 5MB
        label: "imagen",
      },
      archivo_excel: {
        types: [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/pdf",
        ],
        maxSize:
          field === "archivo_excel" ? 10 * 1024 * 1024 : 20 * 1024 * 1024, // 10MB Excel, 20MB PDF
        label: "archivo",
      },
    };

    const validation = validations[field];

    if (!validation.types.includes(file.type)) {
      toast.error(`Tipo de archivo no válido para ${validation.label}`);
      return;
    }

    let processedFile = file;

    // Comprimir imagen si es necesario
    if (field === "image" && file.size > 2 * 1024 * 1024) {
      // Comprimir si es mayor a 2MB
      try {
        toast.loading("Comprimiendo imagen...", { id: "compress-image" });
        processedFile = await compressImage(file);
        toast.success("Imagen comprimida exitosamente", {
          id: "compress-image",
        });
      } catch (error) {
        toast.error("Error al comprimir imagen", { id: "compress-image" });
        return;
      }
    }

    if (processedFile.size > validation.maxSize) {
      toast.error(
        `El archivo es muy grande. Máximo ${
          validation.maxSize / (1024 * 1024)
        }MB`
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedFile,
    }));

    toast.success(`${validation.label} seleccionada correctamente`);
  };

  // Función para cargar registros INVIMA
  const loadRegistrosInvima = async () => {
    try {
      setLoadingInvima(true);
      const response = await httpService.get("/v1/registros-invima");

      if (response.data.success) {
        setRegistrosInvima(response.data.data);
      } else {
        toast.error("Error al cargar registros INVIMA");
      }
    } catch (error) {
      console.error("Error loading INVIMA records:", error);
      toast.error("Error al cargar registros INVIMA");
    } finally {
      setLoadingInvima(false);
    }
  };

  // Función para validar registro INVIMA
  const validateInvimaRegistration = async () => {
    if (!formData.invima) {
      toast.error("Ingrese un número de registro INVIMA");
      return;
    }

    try {
      toast.loading("Validando registro INVIMA...", { id: "validate-invima" });

      // Verificar si el registro existe en la base de datos
      const registroExiste = registrosInvima.find(
        (r) => r.numero_registro === formData.invima
      );

      if (registroExiste) {
        toast.success(
          `Registro INVIMA válido: ${registroExiste.nombre_equipo}`,
          { id: "validate-invima" }
        );
      } else {
        // TEMPORALMENTE COMENTADO: Validación básica de formato si no está en BD
        /*
        const invimaPattern = /^[A-Z0-9-]+$/;
        if (
          !invimaPattern.test(formData.invima) ||
          formData.invima.length < 8
        ) {
          toast.error("Formato de registro INVIMA inválido", {
            id: "validate-invima",
          });
          return;
        }
        */
        toast.success("Registro INVIMA aceptado", {
          id: "validate-invima",
        });
      }
    } catch (error) {
      toast.error("Error al validar registro INVIMA", {
        id: "validate-invima",
      });
    }
  };

  // Función para buscar registros INVIMA
  // Filtrar registros INVIMA basado en búsqueda
  const filteredRegistrosInvima = registrosInvima.filter((registro) => {
    if (!(searchInvima || "").trim()) return true;

    const searchTerm = searchInvima.toLowerCase();
    const numeroRegistro = (registro.numero_registro || "").toLowerCase();
    const nombreEquipo = (registro.nombre_equipo || "").toLowerCase();
    const fabricante = (registro.fabricante || "").toLowerCase();

    return (
      numeroRegistro.includes(searchTerm) ||
      nombreEquipo.includes(searchTerm) ||
      fabricante.includes(searchTerm)
    );
  });

  // Función para manejar selección de registro INVIMA
  const handleInvimaSelection = (numeroRegistro) => {
    // Actualizar el campo invima
    handleInputChange("invima", numeroRegistro);

    // Actualizar el campo de búsqueda con el número seleccionado
    setSearchInvima(numeroRegistro || "");

    // Encontrar el registro completo para mostrar información adicional
    const registroSeleccionado = registrosInvima.find(
      (r) => r.numero_registro === numeroRegistro
    );
    if (registroSeleccionado) {
      // CRÍTICO: actualizar el FK invima_id (lo que se guarda en BD)
      handleInputChange("invima_id", registroSeleccionado.id.toString());
      toast.success(
        `Registro seleccionado: ${registroSeleccionado.nombre_equipo}`
      );
    }
  };

  // Función para visualizar documento PDF de INVIMA
  const viewInvimaDocument = async () => {
    if (!formData.invima) {
      toast.error("Seleccione un registro INVIMA primero");
      return;
    }

    const registroSeleccionado = registrosInvima.find(
      (r) => r.numero_registro === formData.invima
    );

    if (!registroSeleccionado) {
      toast.error("Registro INVIMA no encontrado");
      return;
    }

    // Verificar si tiene archivo PDF
    if (!registroSeleccionado.archivo_pdf) {
      toast.warning("Este registro no tiene documento PDF asociado");
      return;
    }

    try {
      // archivo_pdf contiene solo el nombre del archivo, la carpeta es fija: registros_sanitarios/
      const base = import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001";
      const fileUrl = `${base}/storage/registros_sanitarios/${registroSeleccionado.archivo_pdf}`;

      console.log("🔗 URL PDF INVIMA:", fileUrl);

      const newWindow = window.open(fileUrl, "_blank");
      if (!newWindow) {
        throw new Error("No se pudo abrir la ventana. Verifica que no esté bloqueada por el navegador.");
      }

      toast.success(`Documento abierto: ${registroSeleccionado.numero_registro}`);
    } catch (error) {
      console.error("❌ Error loading INVIMA PDF:", error);
      toast.error(`Error al cargar el documento PDF: ${error.message}`);
    }
  };

  // Función para limpiar selección de INVIMA
  const clearInvimaSelection = () => {
    handleInputChange("invima", "");
    handleInputChange("invima_id", "");
    setSearchInvima("");
    toast.info("Selección de registro INVIMA limpiada");
  };

  // Función para manejar nuevo registro INVIMA creado
  const handleInvimaRegistroAdded = (nuevoRegistro) => {
    // El backend devuelve nombres de columna BD: invima, titulo, marcas, description, file
    // El frontend usa alias del GET: numero_registro, nombre_equipo, fabricante, modelo, archivo_pdf
    const registroNormalizado = {
      id:              nuevoRegistro.id,
      numero_registro: nuevoRegistro.numero_registro ?? nuevoRegistro.invima,
      nombre_equipo:   nuevoRegistro.nombre_equipo   ?? nuevoRegistro.titulo,
      fabricante:      nuevoRegistro.fabricante       ?? nuevoRegistro.marcas,
      modelo:          nuevoRegistro.modelo           ?? nuevoRegistro.description,
      archivo_pdf:     nuevoRegistro.archivo_pdf      ?? nuevoRegistro.file,
    };

    // Agregar a la lista y autoseleccionar
    setRegistrosInvima((prev) => [...prev, registroNormalizado]);
    handleInputChange("invima", registroNormalizado.numero_registro);
    handleInputChange("invima_id", registroNormalizado.id ? registroNormalizado.id.toString() : "");
    setSearchInvima(registroNormalizado.numero_registro || "");
    setShowInvimaModal(false);
    toast.success(`Registro ${registroNormalizado.numero_registro} creado y seleccionado`);
  };

  // Función para validar formulario
  const validateForm = () => {
    const newErrors = {};

    // 1. Nombre obligatorio (mín. 3 caracteres)
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = "El nombre del equipo es obligatorio y debe tener al menos 3 caracteres";
    }

    // 2. Campos obligatorios del formulario
    const camposObligatorios = {
      servicio_id:         "Servicio/Ubicación",
      tadquisicion_id:     "Forma de adquisición",
      fuente_id:           "Fuente de alimentación",
      tecnologia_id:       "Tecnología predominante",
      frecuencia_id:       "Frecuencia de mantenimiento",
      funcionalidad:       "Funcionalidad",
      localizacion_actual: "Localización física actual",
      propietario_id:      "Propietario del equipo",
    };
    Object.entries(camposObligatorios).forEach(([field, label]) => {
      if (!formData[field] || formData[field] === "") {
        newErrors[field] = `${label} es obligatorio`;
      }
    });

    // 3. Solo para biomédicos (tipo_id = 1)
    if (String(formData.tipo_id) === "1") {
      if (!formData.cbiomedica_id || formData.cbiomedica_id === "") {
        newErrors.cbiomedica_id = "Clasificación biomédica es obligatoria para equipos biomédicos";
      }
      if (!formData.criesgo_id || formData.criesgo_id === "") {
        newErrors.criesgo_id = "Clasificación de riesgo es obligatoria para equipos biomédicos";
      }
    }

    // 3. Unicidad: re-propagar errores del validateUniqueness() si existen
    if (errors.serial)         newErrors.serial         = errors.serial;
    if (errors.code)           newErrors.code           = errors.code;
    if (errors.codigo_antiguo) newErrors.codigo_antiguo = errors.codigo_antiguo;

    // 5. Archivo Excel solo .xlsx / .xls
    if (formData.archivo_excel) {
      const ext = formData.archivo_excel.name?.split(".").pop()?.toLowerCase();
      if (!['xlsx', 'xls'].includes(ext)) {
        newErrors.archivo_excel = "Solo se permiten archivos Excel (.xlsx o .xls)";
      }
      if (formData.archivo_excel.size > 20 * 1024 * 1024) {
        newErrors.archivo_excel = "El archivo Excel no puede superar 20 MB";
      }
    }

    // 6. Números opcionales
    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.costo = "El costo debe ser un número válido";
    }
    if (formData.vida_util && isNaN(parseInt(formData.vida_util))) {
      newErrors.vida_util = "La vida útil debe ser un número entero";
    }

    // 7. Fechas lógicas: fabricación no puede ser posterior a adquisición
    if (formData.fecha_fabricacion && formData.fecha_adquisicion) {
      if (new Date(formData.fecha_fabricacion) > new Date(formData.fecha_adquisicion)) {
        newErrors.fecha_adquisicion = "La fecha de adquisición no puede ser anterior a la fecha de fabricación";
      }
    }

    // 8. Archivo INVIMA solo PDF
    if (formData.archivo_invima) {
      if (formData.archivo_invima.type !== "application/pdf") {
        newErrors.archivo_invima = "El archivo de registro INVIMA debe ser un PDF";
      }
      if (formData.archivo_invima.size > 10 * 1024 * 1024) {
        newErrors.archivo_invima = "El archivo de registro INVIMA no puede exceder 10 MB";
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Verifique los campos marcados con errores");
      return;
    }

    try {
      setLoading(true);
      const tieneArchivo = formData.archivo_excel instanceof File || formData.image instanceof File;
      toast.loading(
        tieneArchivo
          ? "Copiando equipo y subiendo archivo... Esto puede tardar unos segundos."
          : "Copiando equipo...",
        { id: "submit-equipment" }
      );

      // Crear FormData para envío con archivos
      const submitData = new FormData();

      // Agregar todos los campos del formulario con mapeo correcto
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "currentImageUrl") return; // No enviar la URL de previsualización

        if (key === "manuales" || key === "planos") {
          // Convertir objetos anidados a JSON
          submitData.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          // Archivos
          submitData.append(key, value);
        } else if (value !== null && value !== "") {
          // Mapear campos del frontend al backend según la estructura de la BD
          let backendKey = key;

          // Mapeos específicos de campos
          const fieldMappings = {
            fecha_adquisicion: "fecha_ad",
            numero_serie: "serial",
            codigo_inventario: "codigo_antiguo", // Usar el campo que existe en BD
            centro_costo: "centro_id", // Mapear a columna centro_id
            pais_origen: "propiedad", // Mapear a campo existente temporalmente
          };

          if (fieldMappings[key]) {
            backendKey = fieldMappings[key];
          }

          submitData.append(backendKey, value);
        }
      });

      // Si no hay nueva imagen pero hay una imagen actual, indicar al backend que la copie
      if (!formData.image && formData.currentImageUrl) {
        // Extraer la ruta relativa de la URL (asumiendo formato /storage/...)
        const pathMatch = formData.currentImageUrl.match(/\/storage\/(.+)$/);
        if (pathMatch && pathMatch[1]) {
          submitData.append('copy_image_path', pathMatch[1]);
        }
      }

      const response = await httpService.post("/v1/equipos-create", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      if (response.data.success) {
        toast.success("Equipo copiado exitosamente", {
          id: "submit-equipment",
        });

        // Resetear formulario
        setFormData({
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
          servicio_id: "",
          area_id: "",
          sede_id: "1",
          localizacion_actual: "",
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
          fuente_id: "",
          tecnologia_id: "",
          evaluacion_desempeno: "",
          calibracion: false,
          periodicidad_calibracion: "",
          frecuencia_id: "",
          funcionalidad: "",
          estadoequipo_id: "",
          manuales: {
            operacion: false,
            mantenimiento: false,
            partes: false,
            otros: false,
          },
          planos: {
            electrico: false,
            electronico: false,
            neumatico: false,
            mecanico: false,
          },
          cbiomedica_id: "",
          criesgo_id: "",
          componentes: "",
          propietario_id: "",
          verificacion_fisica: "",
          observaciones: "",
          image: null,
          archivo_excel: null,
          archivo_invima: null,
          invima: "",
          tipo_id: "1",
          currentImageUrl: null,
        });

        // Llamar callback si existe
        if (onEquipmentAdded) {
          onEquipmentAdded(response.data.data);
        }

        // Cerrar modal
        onOpenChange(false);
      } else {
        toast.error(response.data.message || "Error al registrar equipo", {
          id: "submit-equipment",
        });
      }
    } catch (error) {
      console.error("Error submitting equipment:", error);
      const errorMessage =
        error.response?.data?.message || "Error al registrar el equipo";
      toast.error(errorMessage, { id: "submit-equipment" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl min-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-2">
            <DialogTitle className="text-xl font-semibold text-blue-700">
              Copiar - {equipmentType === "industrial" ? "Equipo industrial" : "Equipo biomédico"}
            </DialogTitle>
            {equipment?.id && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchEquipmentDetails(equipment.id)}
                disabled={loadingDetails}
                className="h-8 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
              >
                🔄 Reintentar carga
              </Button>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mt-2">
            <p className="text-sm text-blue-800">
              📋 <strong>Modo copia:</strong> Los datos del equipo origen han sido pre-cargados. 
              Complete o modifique los campos necesarios. Los campos <strong>Serie</strong>, <strong>INV/Activo</strong> y <strong>Códigos</strong> deben ser únicos para la nueva copia.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-4 relative">
          {(!formReady || loadingDetails) && (
            <div className="absolute inset-0 bg-white/70 z-50 flex flex-col items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-blue-700 font-medium">
                {loadingDetails ? "Obteniendo información del equipo origen..." : "Preparando formulario..."}
              </p>
            </div>
          )}

          {/* REGISTRO DE EQUIPOS BIOMÉDICOS */}
          <Card>
            <CardHeader className="bg-gray-100 py-3">
              <CardTitle className="text-sm font-medium text-center">
                REGISTRO DE EQUIPOS{" "}
                {equipmentType === "industrial" ? "INDUSTRIALES" : "BIOMÉDICOS"}{" "}
                HOSPITAL UNIVERSITARIO DEL VALLE "EVARISTO GARCÍA"
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
                      Nombre del equipo:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="NOMBRE"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Serie:
                    </Label>
                    <Input
                      placeholder="SERIE"
                      value={formData.serial}
                      onChange={(e) =>
                        handleInputChange("serial", e.target.value)
                      }
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.serial ? "border-red-500" : ""
                      }`}
                    />
                    {errors.serial && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.serial}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      INV/Activo:
                    </Label>
                    <Input
                      placeholder="CÓDIGO INVENTARIO"
                      value={formData.code}
                      onChange={(e) =>
                        handleInputChange("code", e.target.value)
                      }
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.code ? "border-red-500" : ""
                      }`}
                    />
                    {errors.code && (
                      <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Marca:
                    </Label>
                    <Input
                      placeholder="MARCA"
                      value={formData.marca}
                      onChange={(e) =>
                        handleInputChange("marca", e.target.value)
                      }
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.marca ? "border-red-500" : ""
                      }`}
                    />
                    {errors.marca && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.marca}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Modelo:
                    </Label>
                    <Input
                      placeholder="MODELO"
                      value={formData.modelo}
                      onChange={(e) =>
                        handleInputChange("modelo", e.target.value)
                      }
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.modelo ? "border-red-500" : ""
                      }`}
                    />
                    {errors.modelo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.modelo}
                      </p>
                    )}
                  </div>

                  {/* SECCIÓN DE REGISTRO INVIMA MEJORADA */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <Label className="text-sm font-semibold text-blue-800">
                        REGISTRO SANITARIO INVIMA
                      </Label>
                    </div>

                    <div className="space-y-3">
                      {/* Registro seleccionado actualmente */}
                      {formData.invima ? (
                        <div className="flex items-start gap-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-blue-900 truncate">{formData.invima}</p>
                            {(() => {
                              const reg = registrosInvima.find(r => r.numero_registro === formData.invima);
                              return reg ? (
                                <p className="text-xs text-blue-700 truncate">{reg.nombre_equipo} — {reg.fabricante}</p>
                              ) : null;
                            })()}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" type="button" onClick={viewInvimaDocument}
                              className="bg-blue-600 hover:bg-blue-700 text-white h-6 w-6 p-0"
                              title="Ver documento PDF">
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button size="sm" type="button" onClick={clearInvimaSelection}
                              className="bg-red-500 hover:bg-red-600 text-white h-6 w-6 p-0"
                              title="Limpiar selección">
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {/* Campo de búsqueda + botón agregar (siempre visible) */}
                      <div>
                        <Label className="text-xs sm:text-sm text-gray-700">
                          Buscar Registro INVIMA:
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            placeholder="Número, nombre de equipo o fabricante..."
                            value={searchInvima}
                            onChange={(e) => setSearchInvima(e.target.value)}
                            className={`flex-1 h-8 text-xs sm:text-sm ${errors.invima ? "border-red-500" : ""}`}
                            autoComplete="off"
                          />
                          <Button size="sm" type="button"
                            onClick={() => setShowInvimaModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Agregar nuevo registro INVIMA">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {errors.invima && (
                          <p className="text-red-500 text-xs mt-1">{errors.invima}</p>
                        )}

                        {/* Lista inline de resultados */}
                        {(searchInvima || '').trim().length >= 2 && (
                          <div className="mt-2 border border-blue-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto bg-white shadow-sm">
                            {loadingInvima ? (
                              <div className="px-3 py-2 text-xs text-gray-500">Cargando registros...</div>
                            ) : filteredRegistrosInvima.length > 0 ? (
                              filteredRegistrosInvima.slice(0, 12).map((registro) => (
                                <button
                                  key={registro.id}
                                  type="button"
                                  onClick={() => handleInvimaSelection(registro.numero_registro)}
                                  className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 transition-colors"
                                >
                                  <span className="block text-xs font-semibold text-blue-800">{registro.numero_registro}</span>
                                  <span className="block text-xs text-gray-500 truncate">
                                    {registro.nombre_equipo} — {registro.fabricante}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-gray-500">Sin resultados para "{searchInvima}"</div>
                            )}
                          </div>
                        )}
                        {(searchInvima || '').trim().length > 0 && (searchInvima || '').trim().length < 2 && (
                          <p className="text-xs text-gray-400 mt-1">Escribe al menos 2 caracteres para buscar</p>
                        )}
                      </div>
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
                      onChange={(e) =>
                        handleInputChange("descripcion", e.target.value)
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Archivo excel hoja de vida:
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
                        {formData.archivo_excel
                          ? formData.archivo_excel.name
                          : "NINGÚN ARCHIVO SELECCIONADO"}
                      </span>
                    </div>
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.pdf"
                      onChange={(e) =>
                        handleFileChange("archivo_excel", e.target.files[0])
                      }
                      className="hidden"
                    />
                    {errors.archivo_excel && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.archivo_excel}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Antiguo:
                      </Label>
                      <Input
                        placeholder="CÓDIGO ANTIGUO"
                        value={formData.codigo_antiguo}
                        onChange={(e) =>
                          handleInputChange("codigo_antiguo", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.codigo_antiguo ? "border-red-500" : ""
                        }`}
                      />
                      {errors.codigo_antiguo && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.codigo_antiguo}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Nuevo:
                      </Label>
                      <Input
                        placeholder="CÓDIGO INVENTARIO"
                        value={formData.codigo_inventario}
                        onChange={(e) =>
                          handleInputChange("codigo_inventario", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.codigo_inventario ? "border-red-500" : ""
                        }`}
                      />
                      {errors.codigo_inventario && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.codigo_inventario}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Ubicación:
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-xs sm:text-sm">
                            Servicio ★
                            <span className="text-destructive">*</span>
                          </Label>
                          <SearchableSelect
                            placeholder="Seleccionar servicio"
                            options={catalogs.servicios || []}
                            value={formData.servicio_id}
                            onValueChange={(value) => {
                              handleInputChange("servicio_id", value);
                              // Limpiar área cuando cambie el servicio
                              handleInputChange("area_id", "");
                            }}
                            className={`mt-1 ${
                              errors.servicio_id ? "border-red-500 rounded-md" : ""
                            }`}
                          />
                          {errors.servicio_id && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.servicio_id}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">
                            Área ★{" "}
                            <span className="text-muted-foreground">
                              (opcional)
                            </span>
                          </Label>
                          <SearchableSelect
                            placeholder="Seleccionar área"
                            options={[
                              { id: "0", name: "No disponible" },
                              ...(catalogs.areas
                                ?.filter(
                                  (area) =>
                                    area.servicio_id?.toString() ===
                                    formData.servicio_id
                                ) || [])
                            ]}
                            value={formData.area_id}
                            onValueChange={(value) =>
                              handleInputChange("area_id", value)
                            }
                            disabled={!formData.servicio_id}
                            className={`mt-1 ${
                              errors.area_id ? "border-red-500 rounded-md" : ""
                            }`}
                          />
                          {errors.area_id && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.area_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Sede:
                      </Label>
                      <SearchableSelect
                        placeholder="SEDE HUV"
                        options={catalogs.sedes || []}
                        value={formData.sede_id}
                        onValueChange={(value) =>
                          handleInputChange("sede_id", value)
                        }
                        className="mt-1"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Seleccione la ubicación del equipo
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs sm:text-sm">
                          Centro de costo:
                        </Label>
                        <SearchableSelect
                          placeholder="SELECCIONAR CENTRO DE COSTO"
                          options={catalogs.centros || []}
                          value={formData.centro_costo}
                          onValueChange={(value) =>
                            handleInputChange("centro_costo", value)
                          }
                          className={`mt-1 ${
                            errors.centro_costo
                              ? "border-red-500 rounded-md"
                              : ""
                          }`}
                        />
                        {errors.centro_costo && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.centro_costo}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm">
                          País de origen:
                        </Label>
                        <Input
                          placeholder="PAÍS DE ORIGEN"
                          value={formData.pais_origen}
                          onChange={(e) =>
                            handleInputChange("pais_origen", e.target.value)
                          }
                          className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                            errors.pais_origen ? "border-red-500" : ""
                          }`}
                        />
                        {errors.pais_origen && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.pais_origen}
                          </p>
                        )}
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
                          handleFileChange("image", files[0]);
                        }
                      }}
                    >
                      {formData.image ? (
                        <div className="w-full">
                          <img
                            src={URL.createObjectURL(formData.image)}
                            alt="Preview"
                            className="max-h-32 mx-auto mb-2 rounded border shadow-sm"
                          />
                          <p className="text-xs text-blue-600 font-medium mb-2">
                             Nueva imagen seleccionada
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="xs"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange("image", null);
                              }}
                              className="h-7 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="h-3 w-3 mr-1" /> Quitar
                            </Button>
                            <Button
                              variant="secondary"
                              size="xs"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                imageInputRef.current?.click();
                              }}
                              className="h-7"
                            >
                              Cambiar
                            </Button>
                          </div>
                        </div>
                      ) : formData.currentImageUrl ? (
                        <div className="w-full">
                          <img
                            src={formData.currentImageUrl}
                            alt="Current"
                            className="max-h-32 mx-auto mb-2 rounded border shadow-sm opacity-90"
                            onError={(e) => {
                              console.warn("⚠️ Error cargando imagen origen:", formData.currentImageUrl);
                              e.target.src = "/img/no-image.png"; // Fallback si falla
                              e.target.style.opacity = "0.5";
                            }}
                          />
                          <p className="text-xs text-gray-500 font-medium mb-2">
                            Imagen del equipo origen
                          </p>
                          <div className="flex gap-2 justify-center">
                             <Button
                              variant="outline"
                              size="xs"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInputChange("currentImageUrl", null);
                              }}
                              className="h-7 text-orange-600 border-orange-200 hover:bg-orange-50"
                              title="No copiar imagen del equipo origen"
                            >
                              <ImageIcon className="h-3 w-3 mr-1" /> No copiar
                            </Button>
                            <Button
                              variant="primary"
                              size="xs"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                imageInputRef.current?.click();
                              }}
                              className="h-7 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Cambiar Imagen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                      onChange={(e) =>
                        handleFileChange("image", e.target.files[0])
                      }
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
                    onValueChange={(value) =>
                      handleInputChange("tadquisicion_id", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.tadquisicion_id ? "border-red-500" : ""
                      }`}
                    >
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
                  {errors.tadquisicion_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tadquisicion_id}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Garantía:
                  </Label>
                  <Input
                    placeholder="GARANTÍA EN AÑOS"
                    value={formData.garantia}
                    onChange={(e) =>
                      handleInputChange("garantia", e.target.value)
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.garantia ? "border-red-500" : ""
                    }`}
                  />
                  {errors.garantia && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.garantia}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Activo comodato:
                    {formData.tadquisicion_id === "3" && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Input
                    placeholder="CÓDIGO DE COMODATO"
                    value={formData.activo_comodato}
                    onChange={(e) =>
                      handleInputChange("activo_comodato", e.target.value)
                    }
                    className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                    disabled={formData.tadquisicion_id !== "3"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo requerido para equipos en comodato
                  </p>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de adquisición:
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_adquisicion}
                    onChange={(e) =>
                      handleInputChange("fecha_adquisicion", e.target.value)
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.fecha_adquisicion ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha_adquisicion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_adquisicion}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de instalación:
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_instalacion}
                    onChange={(e) =>
                      handleInputChange("fecha_instalacion", e.target.value)
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.fecha_instalacion ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha_instalacion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_instalacion}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha recepción almacén:
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_recepcion_almacen}
                    onChange={(e) =>
                      handleInputChange(
                        "fecha_recepcion_almacen",
                        e.target.value
                      )
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.fecha_recepcion_almacen ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha_recepcion_almacen && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_recepcion_almacen}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha acta de recibo:
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_acta_recibo}
                    onChange={(e) =>
                      handleInputChange("fecha_acta_recibo", e.target.value)
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.fecha_acta_recibo ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha_acta_recibo && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_acta_recibo}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de inicio operación:
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_inicio_operacion}
                    onChange={(e) =>
                      handleInputChange(
                        "fecha_inicio_operacion",
                        e.target.value
                      )
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.fecha_inicio_operacion ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha_inicio_operacion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_inicio_operacion}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fecha de fabricación:
                  </Label>
                  <Input
                    type="date"
                    value={formData.fecha_fabricacion}
                    onChange={(e) =>
                      handleInputChange("fecha_fabricacion", e.target.value)
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.fecha_fabricacion ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fecha_fabricacion && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fecha_fabricacion}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">
                    Costo:
                  </Label>
                  <Input
                    placeholder="COSTO EN PESOS"
                    type="number"
                    value={formData.costo}
                    onChange={(e) => handleInputChange("costo", e.target.value)}
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.costo ? "border-red-500" : ""
                    }`}
                  />
                  {errors.costo && (
                    <p className="text-red-500 text-xs mt-1">{errors.costo}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">
                    Vida útil:
                  </Label>
                  <Input
                    placeholder="VIDA ÚTIL EN AÑOS"
                    type="number"
                    value={formData.vida_util}
                    onChange={(e) =>
                      handleInputChange("vida_util", e.target.value)
                    }
                    className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                      errors.vida_util ? "border-red-500" : ""
                    }`}
                  />
                  {errors.vida_util && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vida_util}
                    </p>
                  )}
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
                    Fijo o Móvil:
                  </Label>
                  <Select
                    value={formData.movilidad}
                    onValueChange={(value) => handleInputChange("movilidad", value)}
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.movilidad ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIJO">Fijo</SelectItem>
                      <SelectItem value="MOVIL">Móvil</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.movilidad && (
                    <p className="text-red-500 text-xs mt-1">{errors.movilidad}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Fuente de alimentación:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.fuente_id}
                    onValueChange={(value) =>
                      handleInputChange("fuente_id", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.fuente_id ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.fuentes_alimentacion?.map((fuente) => (
                        <SelectItem
                          key={fuente.id}
                          value={fuente.id.toString()}
                        >
                          {fuente.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuente_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fuente_id}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Tecnología predominante:
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tecnologia_id}
                    onValueChange={(value) =>
                      handleInputChange("tecnologia_id", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.tecnologia_id ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.tecnologias?.map((tecnologia) => (
                        <SelectItem
                          key={tecnologia.id}
                          value={tecnologia.id.toString()}
                        >
                          {tecnologia.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tecnologia_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tecnologia_id}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Evaluación de desempeño:
                  </Label>
                  <Select
                    value={formData.evaluacion_desempeno}
                    onValueChange={(value) =>
                      handleInputChange("evaluacion_desempeno", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.evaluacion_desempeno ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excelente">Excelente</SelectItem>
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="deficiente">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.evaluacion_desempeno && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.evaluacion_desempeno}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    ¿Se realiza calibración?
                  </Label>
                  <Select
                    value={formData.calibracion ? "true" : "false"}
                    onValueChange={(value) =>
                      handleInputChange("calibracion", value === "true")
                    }
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
                    {formData.calibracion && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Input
                    placeholder="Periodicidad en meses"
                    value={formData.periodicidad_calibracion}
                    onChange={(e) =>
                      handleInputChange(
                        "periodicidad_calibracion",
                        e.target.value
                      )
                    }
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
                    onValueChange={(value) =>
                      handleInputChange("frecuencia_id", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.frecuencia_id ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.frecuencias_mantenimiento?.map((frecuencia) => (
                        <SelectItem
                          key={frecuencia.id}
                          value={frecuencia.id.toString()}
                        >
                          {frecuencia.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.frecuencia_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.frecuencia_id}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <Label className="text-base font-semibold text-xs sm:text-sm">
                  Estado actual del equipo:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Funcionalidad:<span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.funcionalidad}
                      onValueChange={(value) =>
                        handleInputChange("funcionalidad", value)
                      }
                    >
                      <SelectTrigger
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.funcionalidad ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.funcionalidades && catalogs.funcionalidades.length > 0 ? (
                          catalogs.funcionalidades.map((f) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0">No disponible</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.funcionalidad && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.funcionalidad}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Disponibilidad:
                    </Label>
                    <Select
                      value={formData.estadoequipo_id}
                      onValueChange={(value) =>
                        handleInputChange("estadoequipo_id", value)
                      }
                    >
                      <SelectTrigger
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.estadoequipo_id ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.disponibilidades &&
                        catalogs.disponibilidades.length > 0 ? (
                          catalogs.disponibilidades.map((disponibilidad) => (
                            <SelectItem
                              key={disponibilidad.id}
                              value={disponibilidad.id.toString()}
                            >
                              {disponibilidad.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0">No disponible</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.estadoequipo_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.estadoequipo_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Localización actual:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="LOCALIZACIÓN ACTUAL"
                      value={formData.localizacion_actual}
                      onChange={(e) =>
                        handleInputChange("localizacion_actual", e.target.value)
                      }
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.localizacion_actual ? "border-red-500" : ""
                      }`}
                    />
                    {errors.localizacion_actual && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.localizacion_actual}
                      </p>
                    )}
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
                      Manuales:
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="manual-operacion"
                          checked={formData.manuales.operacion}
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "manuales",
                              "operacion",
                              checked
                            )
                          }
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
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "manuales",
                              "mantenimiento",
                              checked
                            )
                          }
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
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "manuales",
                              "partes",
                              checked
                            )
                          }
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
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "manuales",
                              "otros",
                              checked
                            )
                          }
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
                      Planos:
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano-electrico"
                          checked={formData.planos.electrico}
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "planos",
                              "electrico",
                              checked
                            )
                          }
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
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "planos",
                              "electronico",
                              checked
                            )
                          }
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
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "planos",
                              "neumatico",
                              checked
                            )
                          }
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
                          onCheckedChange={(checked) =>
                            handleNestedCheckboxChange(
                              "planos",
                              "mecanico",
                              checked
                            )
                          }
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
                      onValueChange={(value) =>
                        handleInputChange("cbiomedica_id", value)
                      }
                    >
                      <SelectTrigger
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.cbiomedica_id ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.clasificaciones_biomedicas?.map(
                          (clasificacion) => (
                            <SelectItem
                              key={clasificacion.id}
                              value={clasificacion.id.toString()}
                            >
                              {clasificacion.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {errors.cbiomedica_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.cbiomedica_id}
                      </p>
                    )}
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
                      onValueChange={(value) =>
                        handleInputChange("criesgo_id", value)
                      }
                    >
                      <SelectTrigger
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.criesgo_id ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogs.clasificaciones_riesgo?.map((riesgo) => (
                          <SelectItem
                            key={riesgo.id}
                            value={riesgo.id.toString()}
                          >
                            {riesgo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.criesgo_id && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.criesgo_id}
                      </p>
                    )}
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
                  onChange={(e) =>
                    handleInputChange("componentes", e.target.value)
                  }
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
                    onValueChange={(value) =>
                      handleInputChange("propietario_id", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.propietario_id ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="SELECCIONE UN ELEMENTO DE LA LISTA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No disponible</SelectItem>
                      {catalogs.propietarios?.map((propietario) => (
                        <SelectItem
                          key={propietario.id}
                          value={propietario.id.toString()}
                        >
                          {propietario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propietario_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.propietario_id}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">
                    Verificación física:
                  </Label>
                  <Select
                    value={formData.verificacion_fisica}
                    onValueChange={(value) =>
                      handleInputChange("verificacion_fisica", value)
                    }
                  >
                    <SelectTrigger
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.verificacion_fisica ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="no-aplica">No Aplica</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.verificacion_fisica && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.verificacion_fisica}
                    </p>
                  )}
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
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
                }
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
            {loading ? "Registrando..." : "Agregar"}
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
      </DialogContent>

      {/* Modal para agregar registro INVIMA */}
      <AgregarRegistroInvimaModal
        open={showInvimaModal}
        onOpenChange={setShowInvimaModal}
        onRegistroAdded={handleInvimaRegistroAdded}
      />
    </Dialog>
  );
}

export default CopyEquipmentModal;

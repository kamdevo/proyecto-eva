import React, { useState, useEffect } from "react";
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
  Save,
  AlertCircle,
  FileText,
  X,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import { API_CONFIG } from "@/config/api";
import { AgregarRegistroInvimaModal } from "./agregar-registro-invima-modal";
import { ManualSearchModal } from "./manual-search-modal";
import { QuickGuideSearchModal } from "./quick-guide-search-modal";
import { OrderSearchModal } from "./order-search-modal";

export function EditEquipmentModal({
  open = false,
  onOpenChange,
  equipment,
  onEquipmentUpdated,
  equipmentType = "biomedical", // "biomedical" | "industrial"
}) {

  // Estados principales
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [completeEquipmentData, setCompleteEquipmentData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    otrosCorrectivos: false,
    preventivos: false,
    calibraciones: false,
    repuestos: false,
  });
  const [equipmentHistory, setEquipmentHistory] = useState({
    correctivos: [],
    preventivos: [],
    calibraciones: [],
    repuestos: [],
    observaciones: [],
  });
  const [dropdownOptions, setDropdownOptions] = useState({
    servicios: [],
    areas: [],
    propietarios: [],
    fuentes: [],
    tecnologias: [],
    frecuencias: [],
    clasificacionesBiomedicas: [],
    clasificacionesRiesgo: [],
    tiposAdquisicion: [],
    estadosEquipo: [],
  });

  // Estados para INVIMA
  const [registrosInvima, setRegistrosInvima] = useState([]);
  const [loadingInvima, setLoadingInvima] = useState(false);
  const [searchInvima, setSearchInvima] = useState("");
  const [filteredRegistrosInvima, setFilteredRegistrosInvima] = useState([]);
  const [showInvimaModal, setShowInvimaModal] = useState(false);
  
  // Estados para modales de búsqueda
  const [showManualSearchModal, setShowManualSearchModal] = useState(false);
  const [showGuideSearchModal, setShowGuideSearchModal] = useState(false);
  const [showOrderSearchModal, setShowOrderSearchModal] = useState(false);
  
  // Estados para guardar la información de los manuales, guías y órdenes seleccionados
  const [selectedManualInfo, setSelectedManualInfo] = useState(null);
  const [selectedGuideInfo, setSelectedGuideInfo] = useState(null);
  const [selectedOrderInfo, setSelectedOrderInfo] = useState(null);

  // Función para cargar el historial del equipo
  const loadEquipmentHistory = async (equipmentId) => {
    try {
      console.log("📊 Loading equipment history for ID:", equipmentId);

      // Usar el nuevo endpoint de historial completo del equipo
      const historyResponse = await httpService.get(
        `/v1/equipos/${equipmentId}/equipment-history`
      );

      if (historyResponse.data?.success) {
        setEquipmentHistory(historyResponse.data.data);
        console.log(
          "✅ Equipment history loaded successfully:",
          historyResponse.data.data
        );
      } else {
        // Si el endpoint unificado no funciona, intentar el original
        const fallbackResponse = await httpService.get(
          `/v1/equipos/${equipmentId}/historial`
        );

        if (fallbackResponse.data?.success) {
          setEquipmentHistory(fallbackResponse.data.data);
        } else {
          // Si ninguno funciona, intentar endpoints individuales
          await loadIndividualHistories(equipmentId);
        }
      }
    } catch (error) {
      console.warn(
        "⚠️ Equipment history endpoint not available, trying individual endpoints"
      );
      await loadIndividualHistories(equipmentId);
    }
  };

  // Función para deserializar datos de PHP
  const deserializePHPData = (phpSerializedString) => {
    if (!phpSerializedString || typeof phpSerializedString !== "string") {
      return {};
    }

    try {
      // Si es JSON, parsearlo directamente
      if (
        phpSerializedString.startsWith("{") ||
        phpSerializedString.startsWith("[")
      ) {
        return JSON.parse(phpSerializedString);
      }

      // Si es "N;" (null serializado en PHP), retornar objeto vacío
      if (phpSerializedString === "N;") {
        return {};
      }

      // Deserializar formato PHP serializado array
      // Ejemplo: a:2:{i:0;s:9:"operacion";i:1;s:6:"partes";}
      const result = {};

      // Extraer strings del array serializado
      const stringMatches = phpSerializedString.match(/s:\d+:"([^"]+)"/g);
      if (stringMatches) {
        const values = stringMatches
          .map((match) => {
            const valueMatch = match.match(/s:\d+:"([^"]+)"/);
            return valueMatch ? valueMatch[1] : null;
          })
          .filter(Boolean);

        console.log("📋 Valores extraídos del PHP serializado:", values);

        // Mapear valores encontrados a true en el objeto resultado
        values.forEach((value) => {
          result[value] = true;
        });
      }

      return result;
    } catch (e) {
      console.warn("Error deserializando datos PHP:", e, phpSerializedString);
      return {};
    }
  };

  // Función auxiliar para cargar historiales individuales
  const loadIndividualHistories = async (equipmentId) => {
    const historyData = {
      correctivos: [],
      preventivos: [],
      calibraciones: [],
      repuestos: [],
      observaciones: [],
    };

    try {
      // Cargar correctivos generales
      try {
        const correctivosResponse = await httpService.get(
          `/v1/correctivos?equipo_id=${equipmentId}`
        );
        historyData.correctivos = correctivosResponse.data?.data || [];
      } catch (err) {
        console.warn("Could not load correctivos:", err.message);
      }

      // Cargar preventivos
      try {
        const preventivosResponse = await httpService.get(
          `/v1/mantenimientos?equipo_id=${equipmentId}&tipo=preventivo`
        );
        historyData.preventivos = preventivosResponse.data?.data || [];
      } catch (err) {
        console.warn("Could not load preventivos:", err.message);
      }

      // Cargar calibraciones
      try {
        const calibracionesResponse = await httpService.get(
          `/v1/calibraciones?equipo_id=${equipmentId}`
        );
        historyData.calibraciones = calibracionesResponse.data?.data || [];
      } catch (err) {
        console.warn("Could not load calibraciones:", err.message);
      }

      // Cargar repuestos
      try {
        const repuestosResponse = await httpService.get(
          `/v1/repuestos?equipo_id=${equipmentId}`
        );
        historyData.repuestos = repuestosResponse.data?.data || [];
      } catch (err) {
        console.warn("Could not load repuestos:", err.message);
      }

      // Cargar observaciones
      try {
        const observacionesResponse = await httpService.get(
          `/v1/observaciones?equipo_id=${equipmentId}`
        );
        historyData.observaciones = observacionesResponse.data?.data || [];
      } catch (err) {
        console.warn("Could not load observaciones:", err.message);
      }

      setEquipmentHistory(historyData);
      console.log("✅ Individual equipment histories loaded");
    } catch (error) {
      console.error("❌ Error loading individual histories:", error);
      setEquipmentHistory({
        correctivos: [],
        preventivos: [],
        calibraciones: [],
        repuestos: [],
        observaciones: [],
      });
    }
  };

  // Combined effect to load dropdown options first, then equipment data
  useEffect(() => {
    const loadModalData = async () => {
      if (!open || !equipment?.id) return;

      setLoading(true);
      console.log("🚀 Starting modal data loading sequence...");

      try {
        // Step 1: Load dropdown options first
        console.log("📋 Step 1: Loading dropdown options...");
        const optionsResponse = await httpService.get(
          "/v1/equipos/filter-options"
        );

        if (optionsResponse.data.success) {
          const options = {
            sedes: optionsResponse.data.data.sedes || [],
            servicios: optionsResponse.data.data.servicios || [],
            areas: optionsResponse.data.data.areas || [],
            propietarios: optionsResponse.data.data.propietarios || [],
            fuentes: optionsResponse.data.data.fuentes || [],
            tecnologias: optionsResponse.data.data.tecnologias || [],
            frecuencias: optionsResponse.data.data.frecuencias || [],
            clasificacionesBiomedicas:
              optionsResponse.data.data.clasificaciones || [],
            clasificacionesRiesgo: optionsResponse.data.data.riesgos || [],
            tiposAdquisicion: optionsResponse.data.data.tipos_adquisicion || [],
            estadosEquipo: optionsResponse.data.data.estados || [],
            tipos:
              optionsResponse.data.data.tipos_equipos ||
              optionsResponse.data.data.tipos ||
              [],
            disponibilidades: optionsResponse.data.data.disponibilidades || [],
            invimas:
              optionsResponse.data.data.invimas ||
              optionsResponse.data.data.registros_invima ||
              [],
            ordenesCompra: optionsResponse.data.data.ordenes_compra || [],
            bajas: optionsResponse.data.data.bajas || [],
            guias: optionsResponse.data.data.guias || [],
            manuales: optionsResponse.data.data.manuales || [],
            necesidades: optionsResponse.data.data.necesidades || [],
          };

          setDropdownOptions(options);
          console.log(
            "✅ Dropdown options loaded:",
            Object.keys(options).map(
              (key) => `${key}: ${options[key].length} items`
            )
          );

          // Debug específico para algunos dropdowns importantes
          console.log("🔍 Debug fuentes:", options.fuentes?.slice(0, 3));
          console.log(
            "🔍 Debug tecnologias:",
            options.tecnologias?.slice(0, 3)
          );
          console.log(
            "🔍 Debug frecuencias:",
            options.frecuencias?.slice(0, 3)
          );
        }

        // Step 2: Load equipment data after dropdown options are ready
        console.log("🔧 Step 2: Loading equipment data...");
        const equipmentResponse = await httpService.get(
          `/v1/equipos/${equipment.id}/complete-info`
        );

        if (equipmentResponse.data.success) {
          console.log("✅ Equipment data loaded successfully");
          setCompleteEquipmentData(equipmentResponse.data.data);

          // Step 3: Load equipment history (correctivos, preventivos, calibraciones, repuestos)
          console.log("📋 Step 3: Loading equipment history...");
          await loadEquipmentHistory(equipment.id);

          // Step 4: Initialize form data after all data is ready
          console.log("📝 Step 4: Initializing form data...");
          // Small delay to ensure dropdown options state is updated
          setTimeout(() => {
            initializeFormData(equipmentResponse.data.data);
          }, 100);
        } else {
          console.error(
            "❌ Error fetching complete equipment data:",
            equipmentResponse.data.message
          );
          // Fallback to basic equipment data
          initializeFormDataFromBasic(equipment);
        }
      } catch (error) {
        console.error("❌ Error in modal data loading:", error);
        // Fallback to basic equipment data
        initializeFormDataFromBasic(equipment);
      } finally {
        setLoading(false);
        console.log("🏁 Modal data loading sequence completed");
      }
    };

    // Reset form ready state when modal opens
    if (open) {
      setFormReady(false);
      loadModalData();
      loadRegistrosInvima(); // Cargar registros INVIMA cuando se abre el modal
    }
  }, [open, equipment?.id]);

  // Reset form when equipment changes or modal closes
  React.useEffect(() => {
    if (!open) {
      setFormData({});
      setErrors({});
      setIsSubmitting(false);
      setValidationErrors([]);
      setFormReady(false);
      // Limpiar información de manuales, guías y órdenes
      setSelectedManualInfo(null);
      setSelectedGuideInfo(null);
      setSelectedOrderInfo(null);
    }
  }, [open]);

  // Initialize form data from complete equipment data
  const initializeFormData = (equipmentData) => {
    console.log(
      "🔧 Initializing form data with complete equipment data:",
      equipmentData
    );

    // Debug: Log specific field mappings and dropdown availability
    console.log("🔍 Key field mappings and dropdown status:");
    console.log(
      "  - servicio_id:",
      equipmentData.servicio_id,
      "→",
      equipmentData.servicio_id?.toString() || ""
    );
    console.log(
      "  - propietario_id:",
      equipmentData.propietario_id,
      "→",
      equipmentData.propietario_id?.toString() || ""
    );
    console.log(
      "  - calibracion:",
      equipmentData.calibracion,
      "→",
      equipmentData.calibracion === "1" ||
        equipmentData.calibracion === true ||
        equipmentData.calibracion === "SI"
    );
    console.log(
      "  - image:",
      equipmentData.image,
      "→",
      equipmentData.image_url
    );

    // Debug: Check dropdown options availability
    console.log("📋 Dropdown options status:");
    console.log(
      "  - servicios available:",
      dropdownOptions.servicios?.length || 0
    );
    console.log(
      "  - propietarios available:",
      dropdownOptions.propietarios?.length || 0
    );
    console.log(
      "  - clasificacionesBiomedicas available:",
      dropdownOptions.clasificacionesBiomedicas?.length || 0
    );
    console.log(
      "  - clasificacionesRiesgo available:",
      dropdownOptions.clasificacionesRiesgo?.length || 0
    );

    setFormData({
      // Identificación básica
      name: equipmentData.name || "",
      descripcion: equipmentData.descripcion || "",
      serial: equipmentData.serial || "",
      code: equipmentData.code || "",
      codigo_antiguo: equipmentData.codigo_antiguo || "",
      marca: equipmentData.marca || "",
      modelo: equipmentData.modelo || "",
      invima: (() => {
        // Si tiene invima_id, buscar el numero_registro correspondiente
        if (equipmentData.invima_id && equipmentData.invima_id !== 0) {
          const registroInvima = registrosInvima.find(r => r.id === equipmentData.invima_id);
          return registroInvima ? registroInvima.numero_registro : "";
        }
        // Si no, usar el campo numero_invima o invima directo
        return equipmentData.numero_invima || equipmentData.invima || "";
      })(),

      // Fechas y especificaciones temporales
      fecha_fabricacion: equipmentData.fecha_fabricacion || "",
      fecha_instalacion: equipmentData.fecha_instalacion || "",
      fecha_ad: equipmentData.fecha_ad || "",
      fecha_vencimiento_garantia:
        equipmentData.fecha_vencimiento_garantia || "",
      fecha_acta_recibo: equipmentData.fecha_acta_recibo || "",
      fecha_inicio_operacion: equipmentData.fecha_inicio_operacion || "",
      fecha_recepcion_almacen: equipmentData.fecha_recepcion_almacen || "",
      vida_util: equipmentData.vida_util || "",

      // Ubicación y movilidad
      sede_id:
        equipmentData.sede_id && equipmentData.sede_id !== 0
          ? equipmentData.sede_id.toString()
          : "",
      servicio_id:
        equipmentData.servicio_id && equipmentData.servicio_id !== 0
          ? equipmentData.servicio_id.toString()
          : "",
      area_id:
        equipmentData.area_id && equipmentData.area_id !== 0
          ? equipmentData.area_id.toString()
          : "",
      movilidad: equipmentData.movilidad || "FIJO",
      localizacion_actual: equipmentData.localizacion_actual || "",

      // Información económica y adquisición
      costo: equipmentData.costo || "",
      tadquisicion_id:
        equipmentData.tadquisicion_id && equipmentData.tadquisicion_id !== 0
          ? equipmentData.tadquisicion_id.toString()
          : "",
      garantia: equipmentData.garantia || "",
      activo_comodato: equipmentData.activo_comodato || "",

      // Clasificaciones biomédicas
      cbiomedica_id:
        equipmentData.cbiomedica_id && equipmentData.cbiomedica_id !== 0
          ? equipmentData.cbiomedica_id.toString()
          : "",
      criesgo_id:
        equipmentData.criesgo_id && equipmentData.criesgo_id !== 0
          ? equipmentData.criesgo_id.toString()
          : "",

      // Información técnica
      fuente_id:
        equipmentData.fuente_id && equipmentData.fuente_id !== 0
          ? equipmentData.fuente_id.toString()
          : "",
      tecnologia_id:
        equipmentData.tecnologia_id && equipmentData.tecnologia_id !== 0
          ? equipmentData.tecnologia_id.toString()
          : "",
      frecuencia_id:
        equipmentData.frecuencia_id && equipmentData.frecuencia_id !== 0
          ? equipmentData.frecuencia_id.toString()
          : "",
      calibracion:
        equipmentData.calibracion === "1" ||
        equipmentData.calibracion === true ||
        equipmentData.calibracion === "SI",
      evaluacion_desempenio: equipmentData.evaluacion_desempenio || "",
      periodicidad: equipmentData.periodicidad || "ANUAL",
      repuesto_pendiente:
        equipmentData.repuesto_pendiente === "1" ||
        equipmentData.repuesto_pendiente === true ||
        equipmentData.repuesto_pendiente === "si",

      // Especificaciones eléctricas
      v1: equipmentData.v1 || "",
      v2: equipmentData.v2 || "",
      v3: equipmentData.v3 || "",

      // Propietario y tipo
      propietario_id:
        equipmentData.propietario_id && equipmentData.propietario_id !== 0
          ? equipmentData.propietario_id.toString()
          : "",
      tipo_id:
        equipmentData.tipo_id && equipmentData.tipo_id !== 0
          ? equipmentData.tipo_id.toString()
          : "",
      propiedad: equipmentData.propiedad || "",

      // Estado y disponibilidad
      estadoequipo_id:
        equipmentData.estadoequipo_id && equipmentData.estadoequipo_id !== 0
          ? equipmentData.estadoequipo_id.toString()
          : "",
      disponibilidad_id:
        equipmentData.disponibilidad_id && equipmentData.disponibilidad_id !== 0
          ? equipmentData.disponibilidad_id.toString()
          : "",

      // Documentación y archivos
      manual: equipmentData.manual || "",
      archivo_invima: equipmentData.archivo_invima || "",
      plano: equipmentData.plano || "",
      accesorios: equipmentData.accesorios || "",

      // IDs de relaciones adicionales
      invima_id:
        equipmentData.invima_id && equipmentData.invima_id !== 0
          ? equipmentData.invima_id.toString()
          : "",
      orden_compra_id:
        equipmentData.orden_compra_id && equipmentData.orden_compra_id !== 0
          ? equipmentData.orden_compra_id.toString()
          : "",
      baja_id:
        equipmentData.baja_id && equipmentData.baja_id !== 0
          ? equipmentData.baja_id.toString()
          : "",
      guia_id:
        equipmentData.guia_id && equipmentData.guia_id !== 0
          ? equipmentData.guia_id.toString()
          : "",
      manual_id:
        equipmentData.manual_id && equipmentData.manual_id !== 0
          ? equipmentData.manual_id.toString()
          : "",
      necesidad_id:
        equipmentData.necesidad_id && equipmentData.necesidad_id !== 0
          ? equipmentData.necesidad_id.toString()
          : "",

      // Mantenimiento
      plan: equipmentData.plan || "",

      // Observaciones y otros
      observacion: equipmentData.observacion || "",
      otros: equipmentData.otros || "",

      // Apoyo técnico - manuales y planos
      manuales: (() => {
        try {
          console.log("🔧 Processing manuales data:", equipmentData.manual);

          // Usar la función deserializadora
          const deserializedManuales = deserializePHPData(equipmentData.manual);

          // Si la deserialización devolvió datos, usarlos
          if (Object.keys(deserializedManuales).length > 0) {
            return {
              operacion: deserializedManuales.operacion || false,
              mantenimiento: deserializedManuales.mantenimiento || false,
              partes: deserializedManuales.partes || false,
              otros: deserializedManuales.otros || false,
            };
          }

          // Fallback a valores por defecto
          return {
            operacion: false,
            mantenimiento: false,
            partes: false,
            otros: false,
          };
        } catch (e) {
          console.warn("Error parsing manuales:", e);
          return {
            operacion: false,
            mantenimiento: false,
            partes: false,
            otros: false,
          };
        }
      })(),
      planos: (() => {
        try {
          console.log("🔧 Processing planos data:", equipmentData.plano);

          // Usar la función deserializadora
          const deserializedPlanos = deserializePHPData(equipmentData.plano);

          // Si la deserialización devolvió datos, usarlos
          if (Object.keys(deserializedPlanos).length > 0) {
            return {
              electrico: deserializedPlanos.electrico || false,
              electronico: deserializedPlanos.electronico || false,
              neumatico: deserializedPlanos.neumatico || false,
              mecanico: deserializedPlanos.mecanico || false,
            };
          }

          // Fallback a valores por defecto
          return {
            electrico: false,
            electronico: false,
            neumatico: false,
            mecanico: false,
          };
        } catch (e) {
          console.warn("Error parsing planos:", e);
          return {
            electrico: false,
            electronico: false,
            neumatico: false,
            mecanico: false,
          };
        }
      })(),
    });

    // Debug: Log final form data after state update
    const finalFormData = {
      // Identificación básica
      name: equipmentData.name || "",
      descripcion: equipmentData.descripcion || "",
      serial: equipmentData.serial || "",
      code: equipmentData.code || "",
      servicio_id: equipmentData.servicio_id?.toString() || "",
      propietario_id: equipmentData.propietario_id?.toString() || "",
      calibracion:
        equipmentData.calibracion === "1" ||
        equipmentData.calibracion === true ||
        equipmentData.calibracion === "SI",
      observacion: equipmentData.observacion || "",
    };

    console.log("✅ Form data initialized successfully. Sample fields:");
    console.log("  - name:", finalFormData.name);
    console.log("  - servicio_id:", finalFormData.servicio_id);
    console.log("  - propietario_id:", finalFormData.propietario_id);
    console.log("  - calibracion:", finalFormData.calibracion);
    console.log("  - observacion:", finalFormData.observacion);
    
    // Debug específico para manuales, guías y órdenes
    console.log("📖 DEBUG MANUALES, GUÍAS Y ÓRDENES:");
    console.log("  - manual_id desde equipmentData:", equipmentData.manual_id);
    console.log("  - guia_id desde equipmentData:", equipmentData.guia_id);
    console.log("  - orden_compra_id desde equipmentData:", equipmentData.orden_compra_id);
    console.log("  - manual_id en formData:", equipmentData.manual_id && equipmentData.manual_id !== 0 ? equipmentData.manual_id.toString() : "");
    console.log("  - guia_id en formData:", equipmentData.guia_id && equipmentData.guia_id !== 0 ? equipmentData.guia_id.toString() : "");
    console.log("  - orden_compra_id en formData:", equipmentData.orden_compra_id && equipmentData.orden_compra_id !== 0 ? equipmentData.orden_compra_id.toString() : "");

    // Debug específico para campos select problemáticos
    console.log("🔍 DEBUG SELECT VALUES:");
    console.log(
      "  - fuente_id:",
      finalFormData.fuente_id,
      "(from:",
      equipmentData.fuente_id,
      ")"
    );
    console.log(
      "  - tecnologia_id:",
      finalFormData.tecnologia_id,
      "(from:",
      equipmentData.tecnologia_id,
      ")"
    );
    console.log(
      "  - frecuencia_id:",
      finalFormData.frecuencia_id,
      "(from:",
      equipmentData.frecuencia_id,
      ")"
    );
    console.log(
      "  - cbiomedica_id:",
      finalFormData.cbiomedica_id,
      "(from:",
      equipmentData.cbiomedica_id,
      ")"
    );
    console.log(
      "  - criesgo_id:",
      finalFormData.criesgo_id,
      "(from:",
      equipmentData.criesgo_id,
      ")"
    );
    console.log(
      "  - estadoequipo_id:",
      finalFormData.estadoequipo_id,
      "(from:",
      equipmentData.estadoequipo_id,
      ")"
    );

    setErrors({});

    // Mark form as ready for rendering with proper state management
    setFormReady(false); // Reset first

    setTimeout(() => {
      console.log("🎯 Setting form as ready for rendering");
      console.log("📊 Form data before ready:", {
        sede_id: formData.sede_id,
        servicio_id: formData.servicio_id,
        area_id: formData.area_id,
        propietario_id: formData.propietario_id,
        name: formData.name,
        serial: formData.serial,
      });

      setFormReady(true);

      // Additional delay to ensure Select components receive the updated values
      setTimeout(() => {
        console.log("🔄 Final verification of form state");
      }, 100);
    }, 200);
  };

  // Fallback initialization from basic equipment data
  const initializeFormDataFromBasic = (equipment) => {
    setFormData({
      // Map from the device structure we receive from the list
      name: equipment.equipo?.name || "",
      serial: equipment.equipo?.series || "",
      code: equipment.equipo?.code || "",
      marca: equipment.equipo?.brand || "",
      modelo: equipment.equipo?.model || "",
      // Set defaults for all other fields to match database schema
      descripcion: "",
      codigo_antiguo: "",
      invima: "",

      // Fechas
      fecha_fabricacion: "",
      fecha_instalacion: "",
      fecha_ad: "",
      fecha_vencimiento_garantia: "",
      fecha_acta_recibo: "",
      fecha_inicio_operacion: "",
      fecha_recepcion_almacen: "",
      vida_util: "",

      // Ubicación
      sede_id: "",
      servicio_id: "",
      area_id: "",
      movilidad: "FIJO",
      localizacion_actual: "",

      // Económico
      costo: "",
      tadquisicion_id: "",
      garantia: "",
      activo_comodato: "",

      // Clasificaciones
      cbiomedica_id: "",
      criesgo_id: "",

      // Técnico
      fuente_id: "",
      tecnologia_id: "",
      frecuencia_id: "",
      calibracion: false,
      evaluacion_desempenio: "",
      periodicidad: "ANUAL",
      repuesto_pendiente: false,

      // Eléctrico
      v1: "",
      v2: "",
      v3: "",

      // Propietario y tipo
      propietario_id: "",
      tipo_id: "",
      propiedad: "",

      // Estado
      estadoequipo_id: "",
      disponibilidad_id: "",

      // Documentación
      manual: "",
      archivo_invima: "",
      plano: "",
      accesorios: "",

      // IDs adicionales
      invima_id: "",
      orden_compra_id: "",
      baja_id: "",
      guia_id: "",
      manual_id: "",
      necesidad_id: "",

      // Mantenimiento
      plan: "",

      // Observaciones
      observacion: "",
      otros: "",
    });
    setErrors({});
  };

  // Funciones para INVIMA
  const loadRegistrosInvima = async () => {
    try {
      setLoadingInvima(true);
      const response = await httpService.get("/v1/registros-invima"); // Mantener endpoint original

      if (response.data.success) {
        setRegistrosInvima(response.data.data);
        setFilteredRegistrosInvima(response.data.data);
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

  const validateInvimaRegistration = async () => {
    if (!formData.invima) {
      toast.error("Ingrese un número de registro INVIMA");
      return;
    }

    try {
      toast.loading("Validando registro INVIMA...", { id: "validate-invima" });

      const registroExiste = registrosInvima.find(
        (r) => r.numero_registro === formData.invima // Backend mapea invima → numero_registro
      );

      if (registroExiste) {
        toast.success(
          `Registro INVIMA válido: ${registroExiste.nombre_equipo}`,
          { id: "validate-invima" }
        );
      } else {
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
        toast.warning("Registro no encontrado en BD, pero formato válido", {
          id: "validate-invima",
        });
      }
    } catch (error) {
      toast.error("Error al validar registro INVIMA", {
        id: "validate-invima",
      });
    }
  };

  const searchRegistrosInvima = () => {
    if (!searchInvima.trim()) {
      setFilteredRegistrosInvima(registrosInvima);
      return;
    }

    const resultados = registrosInvima.filter(
      (registro) =>
        registro.numero_registro // Backend mapea invima → numero_registro
          ?.toLowerCase()
          .includes(searchInvima.toLowerCase()) ||
        registro.nombre_equipo // Backend mapea titulo → nombre_equipo
          ?.toLowerCase()
          .includes(searchInvima.toLowerCase()) ||
        registro.fabricante // Backend mapea marcas → fabricante
          ?.toLowerCase()
          .includes(searchInvima.toLowerCase()) ||
        registro.modelo // Backend mapea description → modelo
          ?.toLowerCase()
          .includes(searchInvima.toLowerCase())
    );

    setFilteredRegistrosInvima(resultados);

    if (resultados.length > 0) {
      toast.success(`${resultados.length} registro(s) encontrado(s)`);
      if (resultados.length === 1) {
        handleInputChange("invima", resultados[0].numero_registro);
        toast.success(
          `Registro seleccionado: ${resultados[0].numero_registro}`
        );
      }
    } else {
      toast.warning("No se encontraron registros");
    }
  };

  const handleInvimaSelection = (value) => {
    handleInputChange("invima", value);
    const selectedRecord = registrosInvima.find(
      (r) => r.numero_registro === value // Backend mapea invima → numero_registro
    );
    if (selectedRecord) {
      toast.success(`Registro INVIMA seleccionado: ${value}`);
    }
  };

  const clearInvimaSelection = () => {
    handleInputChange("invima", "");
    setSearchInvima("");
    setFilteredRegistrosInvima(registrosInvima);
    toast.info("Selección de registro INVIMA limpiada");
  };

  const viewInvimaDocument = () => {
    if (!formData.invima) {
      toast.error("Seleccione un registro INVIMA primero");
      return;
    }

    const registro = registrosInvima.find(
      (r) => r.numero_registro === formData.invima // Backend mapea invima → numero_registro
    );

    if (!registro) {
      toast.error("Registro INVIMA no encontrado");
      return;
    }

    if (registro.archivo_pdf) {
      // Backend mapea file → archivo_pdf
      // Construir URL del archivo
      const fileUrl = `${API_CONFIG.BASE_URL}/api/storage/registros_sanitarios/${registro.archivo_pdf}`;

      // Abrir en nueva ventana optimizada para visualización e impresión empresarial
      const newWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );

      if (!newWindow) {
        toast.error(
          "No se pudo abrir la ventana. Verifique que su navegador permita ventanas emergentes."
        );
        return;
      }

      // Crear interfaz de visualización empresarial
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registro INVIMA - ${registro.numero_registro}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
            }
            .header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 5px 0 0 0;
              opacity: 0.9;
              font-size: 14px;
            }
            .pdf-container {
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              height: calc(100vh - 160px);
            }
            .pdf-frame {
              width: 100%;
              height: 100%;
              border: none;
            }
            .controls {
              text-align: center;
              margin: 15px 0;
            }
            .btn {
              background: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              margin: 0 5px;
              transition: background-color 0.2s;
            }
            .btn:hover {
              background: #2563eb;
            }
            .btn-print {
              background: #059669;
            }
            .btn-print:hover {
              background: #047857;
            }
            @media print {
              body { margin: 0; padding: 0; background: white; }
              .header, .controls { display: none; }
              .pdf-container { height: 100vh; box-shadow: none; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Registro INVIMA</h1>
            <p>N° Registro: ${registro.numero_registro}</p>
          </div>
          
          <div class="controls">
            <button class="btn btn-print" onclick="window.print()">
              🖨️ Imprimir Documento
            </button>
            <button class="btn" onclick="toggleFullscreen()">
              📱 Pantalla Completa
            </button>
            <button class="btn" onclick="downloadFile()">
              💾 Descargar PDF
            </button>
          </div>
          
          <div class="pdf-container">
            <iframe src="${fileUrl}" class="pdf-frame" id="pdfFrame"></iframe>
          </div>

          <script>
            function toggleFullscreen() {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }
            
            function downloadFile() {
              const link = document.createElement('a');
              link.href = '${fileUrl}';
              link.download = '${registro.archivo_pdf}';
              link.click();
            }

            // Auto-focus para mejor experiencia de usuario
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.focus();
              }, 500);
            });

            // Manejar errores de carga del PDF
            document.getElementById('pdfFrame').addEventListener('error', () => {
              document.querySelector('.pdf-container').innerHTML = 
                '<div style="padding: 40px; text-align: center; color: #dc2626;">' +
                '<h3>⚠️ Error al cargar el documento</h3>' +
                '<p>No se pudo cargar el archivo PDF. Verifique que el archivo existe y es válido.</p>' +
                '<button class="btn" onclick="location.reload()">🔄 Reintentar</button>' +
                '</div>';
            });
          </script>
        </body>
        </html>
      `);

      newWindow.document.close();
    } else {
      toast.warning("No hay archivo PDF disponible para este registro");
    }
  };

  // Función para ver documentos PDF de observaciones
  const viewObservacionDocument = (filename) => {
    if (!filename) {
      toast.error("No hay archivo PDF disponible para esta observación");
      return;
    }

    // Construir URL del archivo de observación
    const fileUrl = `/storage/observaciones/${filename}`;

    // Abrir en nueva ventana optimizada para visualización e impresión empresarial
    const newWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800,scrollbars=yes,resizable=yes"
    );

    if (!newWindow) {
      toast.error(
        "No se pudo abrir la ventana. Verifique que su navegador permita ventanas emergentes."
      );
      return;
    }

    // Crear interfaz de visualización empresarial
    newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento de Observación - ${filename}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
          }
          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .pdf-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            height: calc(100vh - 160px);
          }
          .pdf-frame {
            width: 100%;
            height: 100%;
            border: none;
          }
          .controls {
            text-align: center;
            margin: 15px 0;
          }
          .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 5px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background: #2563eb;
          }
          .btn-print {
            background: #059669;
          }
          .btn-print:hover {
            background: #047857;
          }
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .header, .controls { display: none; }
            .pdf-container { height: 100vh; box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Documento de Observación</h1>
          <p>Archivo: ${filename}</p>
        </div>
        
        <div class="controls">
          <button class="btn btn-print" onclick="window.print()">
            🖨️ Imprimir Documento
          </button>
          <button class="btn" onclick="toggleFullscreen()">
            📱 Pantalla Completa
          </button>
          <button class="btn" onclick="downloadFile()">
            💾 Descargar PDF
          </button>
        </div>
        
        <div class="pdf-container">
          <iframe src="${fileUrl}" class="pdf-frame" id="pdfFrame"></iframe>
        </div>

        <script>
          function toggleFullscreen() {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          
          function downloadFile() {
            const link = document.createElement('a');
            link.href = '${fileUrl}';
            link.download = '${filename}';
            link.click();
          }

          // Auto-focus para mejor experiencia de usuario
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.focus();
            }, 500);
          });

          // Manejar errores de carga del PDF
          document.getElementById('pdfFrame').addEventListener('error', () => {
            document.querySelector('.pdf-container').innerHTML = 
              '<div style="padding: 40px; text-align: center; color: #dc2626;">' +
              '<h3>⚠️ Error al cargar el documento</h3>' +
              '<p>No se pudo cargar el archivo PDF. Verifique que el archivo existe y es válido.</p>' +
              '<button class="btn" onclick="location.reload()">🔄 Reintentar</button>' +
              '</div>';
          });
        </script>
      </body>
      </html>
    `);

    newWindow.document.close();
  };

  // Función para ver documentos PDF de correctivos
  const viewCorrectivoDocument = (filename) => {
    if (!filename) {
      toast.error("No hay archivo PDF disponible para este correctivo");
      return;
    }

    // Construir URL del archivo de correctivo
    const fileUrl = `/storage/correctivos/${filename}`;

    // Abrir en nueva ventana optimizada para visualización e impresión empresarial
    const newWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800,scrollbars=yes,resizable=yes"
    );

    if (!newWindow) {
      toast.error(
        "No se pudo abrir la ventana. Verifique que su navegador permita ventanas emergentes."
      );
      return;
    }

    // Crear interfaz de visualización empresarial
    newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento de Correctivo - ${filename}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
          }
          .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .pdf-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            height: calc(100vh - 160px);
          }
          .pdf-frame {
            width: 100%;
            height: 100%;
            border: none;
          }
          .controls {
            text-align: center;
            margin: 15px 0;
          }
          .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 5px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background: #2563eb;
          }
          .btn-print {
            background: #059669;
          }
          .btn-print:hover {
            background: #047857;
          }
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .header, .controls { display: none; }
            .pdf-container { height: 100vh; box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Documento de Correctivo</h1>
          <p>Archivo: ${filename}</p>
        </div>
        
        <div class="controls">
          <button class="btn btn-print" onclick="window.print()">
            🖨️ Imprimir Documento
          </button>
          <button class="btn" onclick="toggleFullscreen()">
            📱 Pantalla Completa
          </button>
          <button class="btn" onclick="downloadFile()">
            💾 Descargar PDF
          </button>
        </div>
        
        <div class="pdf-container">
          <iframe src="${fileUrl}" class="pdf-frame" id="pdfFrame"></iframe>
        </div>

        <script>
          function toggleFullscreen() {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          
          function downloadFile() {
            const link = document.createElement('a');
            link.href = '${fileUrl}';
            link.download = '${filename}';
            link.click();
          }

          // Auto-focus para mejor experiencia de usuario
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.focus();
            }, 500);
          });

          // Manejar errores de carga del PDF
          document.getElementById('pdfFrame').addEventListener('error', () => {
            document.querySelector('.pdf-container').innerHTML = 
              '<div style="padding: 40px; text-align: center; color: #dc2626;">' +
              '<h3>⚠️ Error al cargar el documento</h3>' +
              '<p>No se pudo cargar el archivo PDF. Verifique que el archivo existe y es válido.</p>' +
              '<button class="btn" onclick="location.reload()">🔄 Reintentar</button>' +
              '</div>';
          });
        </script>
      </body>
      </html>
    `);

    newWindow.document.close();
  };

  const handleNewInvimaCreated = (newInvima) => {
    setRegistrosInvima((prev) => [...prev, newInvima]);
    toast.success("Registro INVIMA agregado exitosamente");
  };

  // Handlers para manuales y guías
  const handleManualSelection = (manual) => {
    console.log("🔥 MANUAL SELECCIONADO:", manual);
    console.log("🔥 ID del manual:", manual.id);
    handleInputChange("manual_id", manual.id.toString());
    setSelectedManualInfo(manual); // Guardar toda la información del manual
    console.log("🔥 formData.manual_id después de selección:", formData.manual_id);
    toast.success(`Manual asociado: ${manual.descripcion}`);
  };

  const handleGuideSelection = (guide) => {
    console.log("🔥 GUÍA SELECCIONADA:", guide);
    console.log("🔥 ID de la guía:", guide.id);
    handleInputChange("guia_id", guide.id.toString());
    setSelectedGuideInfo(guide); // Guardar toda la información de la guía
    console.log("🔥 formData.guia_id después de selección:", formData.guia_id);
    toast.success(`Guía rápida asociada: ${guide.name}`);
  };

  const handleViewManual = () => {
    // Usar la información guardada del manual seleccionado
    if (selectedManualInfo && selectedManualInfo.url) {
      window.open(selectedManualInfo.url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("URL del manual no disponible");
    }
  };

  const handleViewGuide = () => {
    // Usar la información guardada de la guía seleccionada
    if (selectedGuideInfo && selectedGuideInfo.file) {
      const fileUrl = `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/storage/guias/${selectedGuideInfo.file}`;
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Archivo de la guía no disponible");
    }
  };

  const handleRemoveManual = () => {
    handleInputChange("manual_id", "");
    setSelectedManualInfo(null);
    toast.info("Manual desasociado");
  };

  const handleRemoveGuide = () => {
    handleInputChange("guia_id", "");
    setSelectedGuideInfo(null);
    toast.info("Guía rápida desasociada");
  };

  // Handler para órdenes de compra
  const handleOrderSelection = (order) => {
    console.log("🔥 ORDEN SELECCIONADA:", order);
    console.log("🔥 ID de la orden:", order.id);
    handleInputChange("orden_compra_id", order.id.toString());
    setSelectedOrderInfo(order); // Guardar toda la información de la orden
    console.log("🔥 formData.orden_compra_id después de selección:", formData.orden_compra_id);
    toast.success(`Orden de compra asociada: ${order.orden || order.numero || `ID: ${order.id}`}`);
  };

  const handleRemoveOrder = () => {
    handleInputChange("orden_compra_id", "");
    setSelectedOrderInfo(null);
    toast.info("Orden de compra desasociada");
  };

  // Función para ver documentos PDF de repuestos
  const viewRepuestoDocument = (filename) => {
    if (!filename) {
      toast.error("No hay archivo PDF disponible para este repuesto");
      return;
    }

    // Construir URL del archivo de repuesto
    const fileUrl = `/storage/repuestos/${filename}`;

    // Abrir en nueva ventana optimizada para visualización e impresión empresarial
    const newWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800,scrollbars=yes,resizable=yes"
    );

    if (!newWindow) {
      toast.error(
        "No se pudo abrir la ventana. Verifique que su navegador permita ventanas emergentes."
      );
      return;
    }

    // Crear interfaz de visualización empresarial
    newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Documento de Repuesto - ${filename}</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
          }
          .header {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .pdf-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            height: calc(100vh - 160px);
          }
          .pdf-frame {
            width: 100%;
            height: 100%;
            border: none;
          }
          .controls {
            text-align: center;
            margin: 15px 0;
          }
          .btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 0 5px;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background: #2563eb;
          }
          .btn-print {
            background: #059669;
          }
          .btn-print:hover {
            background: #047857;
          }
          @media print {
            body { margin: 0; padding: 0; background: white; }
            .header, .controls { display: none; }
            .pdf-container { height: 100vh; box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Documento de Repuesto</h1>
          <p>Archivo: ${filename}</p>
        </div>
        
        <div class="controls">
          <button class="btn btn-print" onclick="window.print()">
            🖨️ Imprimir Documento
          </button>
          <button class="btn" onclick="toggleFullscreen()">
            📱 Pantalla Completa
          </button>
          <button class="btn" onclick="downloadFile()">
            💾 Descargar PDF
          </button>
        </div>
        
        <div class="pdf-container">
          <iframe src="${fileUrl}" class="pdf-frame" id="pdfFrame"></iframe>
        </div>

        <script>
          function toggleFullscreen() {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          
          function downloadFile() {
            const link = document.createElement('a');
            link.href = '${fileUrl}';
            link.download = '${filename}';
            link.click();
          }

          // Auto-focus para mejor experiencia de usuario
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.focus();
            }, 500);
          });

          // Manejar errores de carga del PDF
          document.getElementById('pdfFrame').addEventListener('error', () => {
            document.querySelector('.pdf-container').innerHTML = 
              '<div style="padding: 40px; text-align: center; color: #dc2626;">' +
              '<h3>⚠️ Error al cargar el documento</h3>' +
              '<p>No se pudo cargar el archivo PDF. Verifique que el archivo existe y es válido.</p>' +
              '<button class="btn" onclick="location.reload()">🔄 Reintentar</button>' +
              '</div>';
          });
        </script>
      </body>
      </html>
    `);

    newWindow.document.close();
  };

  // Efecto para actualizar INVIMA cuando se cargan los registros
  React.useEffect(() => {
    if (registrosInvima.length > 0 && completeEquipmentData && !formData.invima) {
      const equipmentData = completeEquipmentData;
      
      // Si tiene invima_id, buscar el numero_registro correspondiente
      if (equipmentData.invima_id && equipmentData.invima_id !== 0) {
        const registroInvima = registrosInvima.find(r => r.id === parseInt(equipmentData.invima_id));
        if (registroInvima) {
          setFormData(prev => ({
            ...prev,
            invima: registroInvima.numero_registro,
            invima_id: equipmentData.invima_id.toString()
          }));
        }
      }
    }
  }, [registrosInvima, completeEquipmentData]);

  // Efecto para cargar información de manuales y guías asociados
  React.useEffect(() => {
    const loadManualAndGuideInfo = async () => {
      if (!completeEquipmentData) {
        console.log("🔍 No completeEquipmentData disponible para cargar info asociada");
        return;
      }

      console.log("🔍 Cargando información asociada para equipo:", {
        manual_id: completeEquipmentData.manual_id,
        guia_id: completeEquipmentData.guia_id,
        orden_compra_id: completeEquipmentData.orden_compra_id
      });

      // Limpiar estados previos antes de cargar nuevos datos
      setSelectedManualInfo(null);
      setSelectedGuideInfo(null);
      setSelectedOrderInfo(null);

      // Cargar información del manual si existe manual_id
      if (completeEquipmentData.manual_id && completeEquipmentData.manual_id !== 0 && completeEquipmentData.manual_id !== "0") {
        console.log("📖 Buscando manual ID:", completeEquipmentData.manual_id);
        try {
          const response = await httpService.get(`/v1/manuales`);
          console.log("📖 Respuesta completa de manuales:", response.data);
          
          let manualesArray = [];
          
          // Manejar diferentes estructuras de respuesta
          if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
            // Estructura con paginación: { data: { data: [...] } }
            manualesArray = response.data.data.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            // Estructura simple: { data: [...] }
            manualesArray = response.data.data;
          } else if (Array.isArray(response.data)) {
            // Array directo: [...]
            manualesArray = response.data;
          }
          
          console.log("📖 Array de manuales procesado:", manualesArray);
          
          if (manualesArray.length > 0) {
            const manual = manualesArray.find(m => 
              m.id.toString() === completeEquipmentData.manual_id.toString()
            );
            console.log("📖 Manual encontrado:", manual);
            if (manual) {
              setSelectedManualInfo(manual);
              console.log("📖 Manual info establecida:", manual.descripcion);
            } else {
              console.warn("📖 Manual no encontrado con ID:", completeEquipmentData.manual_id);
            }
          }
        } catch (error) {
          console.error("❌ Error loading manual info:", error);
        }
      }

      // Cargar información de la guía si existe guia_id
      if (completeEquipmentData.guia_id && completeEquipmentData.guia_id !== 0 && completeEquipmentData.guia_id !== "0") {
        console.log("🚀 Buscando guía ID:", completeEquipmentData.guia_id);
        try {
          const response = await httpService.get(`/v1/guias-rapidas`);
          console.log("🚀 Respuesta completa de guías:", response.data);
          
          let guiasArray = [];
          
          // Manejar diferentes estructuras de respuesta
          if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
            // Estructura con paginación: { data: { data: [...] } }
            guiasArray = response.data.data.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            // Estructura simple: { data: [...] }
            guiasArray = response.data.data;
          } else if (Array.isArray(response.data)) {
            // Array directo: [...]
            guiasArray = response.data;
          }
          
          console.log("🚀 Array de guías procesado:", guiasArray);
          
          if (guiasArray.length > 0) {
            const guide = guiasArray.find(g => 
              g.id.toString() === completeEquipmentData.guia_id.toString()
            );
            console.log("🚀 Guía encontrada:", guide);
            if (guide) {
              setSelectedGuideInfo(guide);
              console.log("🚀 Guía info establecida:", guide.name);
            } else {
              console.warn("🚀 Guía no encontrada con ID:", completeEquipmentData.guia_id);
            }
          }
        } catch (error) {
          console.error("❌ Error loading guide info:", error);
        }
      }

      // Cargar información de la orden de compra si existe orden_compra_id
      if (completeEquipmentData.orden_compra_id && completeEquipmentData.orden_compra_id !== 0 && completeEquipmentData.orden_compra_id !== "0") {
        console.log("📋 Buscando orden ID:", completeEquipmentData.orden_compra_id);
        try {
          const response = await httpService.get(`/v1/ordenes-compra`);
          console.log("📋 Respuesta completa de órdenes:", response.data);
          
          let ordenesArray = [];
          
          // Manejar diferentes estructuras de respuesta
          if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
            // Estructura con paginación: { data: { data: [...] } }
            ordenesArray = response.data.data.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            // Estructura simple: { data: [...] }
            ordenesArray = response.data.data;
          } else if (Array.isArray(response.data)) {
            // Array directo: [...]
            ordenesArray = response.data;
          }
          
          console.log("📋 Array de órdenes procesado:", ordenesArray);
          
          if (ordenesArray.length > 0) {
            const order = ordenesArray.find(o => 
              o.id.toString() === completeEquipmentData.orden_compra_id.toString()
            );
            console.log("📋 Orden encontrada:", order);
            if (order) {
              setSelectedOrderInfo(order);
              console.log("📋 Orden info establecida:", order.orden || order.numero);
            } else {
              console.warn("📋 Orden no encontrada con ID:", completeEquipmentData.orden_compra_id);
            }
          }
        } catch (error) {
          console.error("❌ Error loading order info:", error);
        }
      }
    };

    loadManualAndGuideInfo();
  }, [completeEquipmentData]);

  // Debug useEffect para ver cuándo cambia completeEquipmentData
  useEffect(() => {
    console.log("🔄 completeEquipmentData cambió:", completeEquipmentData);
    if (completeEquipmentData) {
      console.log("🔄 IDs disponibles:", {
        manual_id: completeEquipmentData.manual_id,
        guia_id: completeEquipmentData.guia_id,
        orden_compra_id: completeEquipmentData.orden_compra_id
      });
    }
  }, [completeEquipmentData]);

  // Efecto para filtrar registros INVIMA
  React.useEffect(() => {
    if (searchInvima.trim()) {
      const filtered = registrosInvima.filter(
        (registro) =>
          registro.numero_registro // Backend mapea invima → numero_registro
            ?.toLowerCase()
            .includes(searchInvima.toLowerCase()) ||
          registro.nombre_equipo // Backend mapea titulo → nombre_equipo
            ?.toLowerCase()
            .includes(searchInvima.toLowerCase()) ||
          registro.fabricante // Backend mapea marcas → fabricante
            ?.toLowerCase()
            .includes(searchInvima.toLowerCase()) ||
          registro.modelo // Backend mapea description → modelo
            ?.toLowerCase()
            .includes(searchInvima.toLowerCase())
      );
      setFilteredRegistrosInvima(filtered);
    } else {
      setFilteredRegistrosInvima(registrosInvima);
    }
  }, [searchInvima, registrosInvima]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Function to handle nested checkbox changes (for manuales and planos)
  const handleNestedCheckboxChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas requeridas
    if (!formData.name?.trim()) {
      newErrors.name = "El nombre del equipo es obligatorio";
    }

    if (!formData.serial?.trim()) {
      newErrors.serial = "El número de serie es obligatorio";
    }

    if (!formData.marca?.trim()) {
      newErrors.marca = "La marca es obligatoria";
    }

    if (!formData.modelo?.trim()) {
      newErrors.modelo = "El modelo es obligatorio";
    }

    // Validación de fechas
    if (formData.fecha_fabricacion && formData.fecha_instalacion) {
      const fechaFabricacion = new Date(formData.fecha_fabricacion);
      const fechaInstalacion = new Date(formData.fecha_instalacion);

      if (fechaInstalacion < fechaFabricacion) {
        newErrors.fecha_instalacion =
          "La fecha de instalación no puede ser anterior a la fecha de fabricación";
      }
    }

    // Validación de valores económicos
    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.costo = "El costo debe ser un número válido";
    }

    // Validación de vida útil
    if (formData.vida_util && isNaN(parseInt(formData.vida_util))) {
      newErrors.vida_util = "La vida útil debe ser un número válido";
    }

    // Validaciones de campos requeridos según el tipo de equipo
    if (!formData.servicio_id) {
      newErrors.servicio_id = "El servicio es obligatorio";
    }

    if (!formData.propietario_id) {
      newErrors.propietario_id = "El propietario es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🚀 [EDIT MODAL] Iniciando actualización del equipo");
      console.log("🚀 [EDIT MODAL] Equipment ID:", equipment.id);
      console.log("🚀 [EDIT MODAL] Form data antes de procesar:", formData);

      // Solo validación básica - los campos son opcionales en edición
      console.log("🚀 [EDIT MODAL] Validación básica pasada, procediendo con edición...");

      // ✅ DETERMINAR SI HAY IMAGEN NUEVA PARA USAR FormData O JSON
      const hasNewImage =
        formData.newImage && formData.newImage instanceof File;

      if (hasNewImage) {
        console.log(
          "📸 [EDIT MODAL] Enviando con imagen nueva usando FormData"
        );

        // Prepare data for submission with FormData (for image upload)
        const submitFormData = new FormData();

        // Add all form fields to FormData
        Object.keys(formData).forEach((key) => {
          if (key !== "showImageUpload") {
            if (key === "newImage" && formData[key] instanceof File) {
              submitFormData.append("image", formData[key]);
            } else if (key !== "newImage") {
              if (formData[key] !== null && formData[key] !== undefined) {
                if (key === "manuales" || key === "planos") {
                  submitFormData.append(key, JSON.stringify(formData[key]));
                } else if (key === "calibracion") {
                  submitFormData.append(key, formData[key] ? "1" : "0");
                } else if (key.endsWith("_id")) {
                  const value = formData[key];
                  if (value && value !== "" && value !== null && value !== undefined) {
                    const parsedValue = parseInt(value);
                    if (!isNaN(parsedValue) && parsedValue > 0) {
                      submitFormData.append(key, parsedValue.toString());
                    }
                  }
                } else {
                  submitFormData.append(key, formData[key]);
                }
              }
            }
          }
        });

        console.log("🚀 [EDIT MODAL] FormData preparado para envío con imagen");

        const url = `/v1/equipos/${equipment.id}/update-with-image`;
        console.log("🚀 [EDIT MODAL] URL de actualización con imagen:", url);

        const response = await httpService.put(url, submitFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(
          "🚀 [EDIT MODAL] Respuesta del servidor (con imagen):",
          response
        );

        if (response.data.success) {
          toast.success("Equipo e imagen actualizados exitosamente");
          onEquipmentUpdated && onEquipmentUpdated();
          onOpenChange(false);
        } else {
          throw new Error(
            response.data.message || "Error al actualizar el equipo con imagen"
          );
        }
      } else {
        console.log("📄 [EDIT MODAL] Enviando sin imagen usando JSON");

        // Prepare data for submission as JSON (no image)
        const submitData = {};

        // Add all form fields
        Object.keys(formData).forEach((key) => {
          if (key !== "newImage" && key !== "showImageUpload") {
            if (formData[key] !== null && formData[key] !== undefined) {
              if (key === "manuales" || key === "planos") {
                submitData[key] = JSON.stringify(formData[key]);
              } else if (key === "calibracion") {
                submitData[key] = formData[key] ? "1" : "0";
              } else if (key.endsWith("_id")) {
                const value = formData[key];
                if (value && value !== "" && value !== null && value !== undefined) {
                  const parsedValue = parseInt(value);
                  if (!isNaN(parsedValue) && parsedValue > 0) {
                    submitData[key] = parsedValue.toString();
                  }
                }
              } else {
                submitData[key] = formData[key];
              }
            }
          }
        });

        console.log("🚀 [EDIT MODAL] Datos preparados para envío (solo campos con valores):");
        console.log("📊 Número total de campos:", Object.keys(submitData).length);
        console.log("📋 Lista completa de campos enviados:", Object.keys(submitData).sort());
        console.log("🔍 Datos detallados:", submitData);
        
        // Debug específico para manuales y guías
        console.log("📖 Manual ID a enviar:", submitData.manual_id);
        console.log("🚀 Guía ID a enviar:", submitData.guia_id);
        if (selectedManualInfo) {
          console.log("📖 Info del manual seleccionado:", selectedManualInfo);
        }
        if (selectedGuideInfo) {
          console.log("🚀 Info de la guía seleccionada:", selectedGuideInfo);
        }

        const camposCriticos = [
          "name",
          "serial",
          "marca",
          "modelo",
          "invima",
          "observacion",
          "servicio_id",
          "propietario_id",
          "calibracion",
        ];
        console.log("🎯 Verificación de campos críticos:");
        camposCriticos.forEach((campo) => {
          console.log(
            `  - ${campo}:`,
            submitData[campo],
            `(tipo: ${typeof submitData[campo]})`
          );
        });

        // ✅ VERIFICACIÓN DE CAMPOS _id
        const camposId = Object.keys(submitData).filter((key) =>
          key.endsWith("_id")
        );
        console.log("🔗 Campos _id encontrados:", camposId.length);
        camposId.forEach((campo) => {
          console.log(`  - ${campo}:`, submitData[campo]);
        });

        const url = `/v1/equipos/${equipment.id}/update-no-auth`;
        console.log("🚀 [EDIT MODAL] URL de actualización:", url);

        const response = await httpService.put(url, submitData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("🚀 [EDIT MODAL] Respuesta del servidor:", response);

        if (response.data.success) {
          toast.success("Equipo actualizado exitosamente");
          onEquipmentUpdated && onEquipmentUpdated();
          onOpenChange(false);
        } else {
          throw new Error(
            response.data.message || "Error al actualizar el equipo"
          );
        }
      }
    } catch (error) {
      console.error("🚨 [EDIT MODAL] Error updating equipment:", error);
      console.error("🚨 [EDIT MODAL] Error response:", error.response);
      console.error("🚨 [EDIT MODAL] Error data:", error.response?.data);

      // Manejar errores de validación específicos
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const newErrors = {};

        // Mapear errores de validación del backend al frontend
        Object.keys(validationErrors).forEach((field) => {
          const messages = validationErrors[field];
          if (Array.isArray(messages) && messages.length > 0) {
            newErrors[field] = messages[0]; // Tomar el primer mensaje de error
          }
        });

        setErrors(newErrors);

        // Mostrar mensaje general de validación
        toast.error("Por favor, corrija los errores de validación");
      } else {
        toast.error(
          error.response?.data?.message || "Error al actualizar el equipo"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-700 border-b border-blue-200 pb-2">
            Editar - Equipo biomédico
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <div>
            {/* REGISTRO DE EQUIPOS BIOMÉDICOS */}
            <Card>
              <CardHeader className="bg-gray-100 py-3">
                <CardTitle className="text-sm font-medium text-center">
                  REGISTRO DE EQUIPOS BIOMÉDICOS HOSPITAL UNIVERSITARIO DEL
                  VALLE "EVARISTO GARCÍA"
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
                        value={formData.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.name ? "border-red-500" : ""
                        }`}
                        placeholder="Ingrese el nombre del equipo"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Serie:<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={formData.serial || ""}
                        onChange={(e) =>
                          handleInputChange("serial", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.serial ? "border-red-500" : ""
                        }`}
                        placeholder="Ingrese el número de serie"
                        disabled={isSubmitting || loading}
                      />
                      {errors.serial && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.serial}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">Código:</Label>
                      <Input
                        value={formData.code || ""}
                        onChange={(e) =>
                          handleInputChange("code", e.target.value)
                        }
                        className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        placeholder="Código del equipo"
                        disabled={isSubmitting || loading}
                      />
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Código Antiguo:
                      </Label>
                      <Input
                        value={formData.codigo_antiguo || ""}
                        onChange={(e) =>
                          handleInputChange("codigo_antiguo", e.target.value)
                        }
                        className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                        placeholder="Código de inventario anterior"
                        disabled={isSubmitting || loading}
                      />
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Marca:<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={formData.marca || ""}
                        onChange={(e) =>
                          handleInputChange("marca", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.marca ? "border-red-500" : ""
                        }`}
                        placeholder="Marca del equipo"
                        disabled={isSubmitting || loading}
                      />
                      {errors.marca && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.marca}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Modelo:<span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={formData.modelo || ""}
                        onChange={(e) =>
                          handleInputChange("modelo", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.modelo ? "border-red-500" : ""
                        }`}
                        placeholder="Modelo del equipo"
                        disabled={isSubmitting || loading}
                      />
                      {errors.modelo && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.modelo}
                        </p>
                      )}
                    </div>

                    {/* SECCIÓN DE REGISTRO INVIMA COMPLETA */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <Label className="text-sm font-semibold text-blue-800">
                          REGISTRO SANITARIO INVIMA
                        </Label>
                      </div>

                      <div className="space-y-3">
                        {/* Selección de Registro INVIMA */}
                        <div>
                          <Label className="text-xs sm:text-sm text-gray-700">
                            Seleccionar Registro INVIMA:
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="mt-1 invima-select-container">
                            <Select
                              value={formData.invima || ""}
                              onValueChange={handleInvimaSelection}
                              disabled={isSubmitting || loading}
                            >
                              <SelectTrigger
                                className={`h-7 sm:h-8 md:h-9 text-xs sm:text-sm max-w-full invima-select-trigger ${
                                  errors.invima ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue
                                  placeholder="Seleccione un registro INVIMA..."
                                  className="truncate max-w-[calc(100%-24px)]"
                                >
                                  {formData.invima && (
                                    <span
                                      className="truncate block max-w-[300px]"
                                      title={formData.invima}
                                    >
                                      {formData.invima}
                                    </span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-w-[500px]">
                                {loadingInvima ? (
                                  <SelectItem value="loading" disabled>
                                    Cargando registros...
                                  </SelectItem>
                                ) : filteredRegistrosInvima.length > 0 ? (
                                  filteredRegistrosInvima.map((registro) => (
                                    <SelectItem
                                      key={registro.id}
                                      value={registro.numero_registro} // Backend mapea invima → numero_registro
                                      className="max-w-[480px]"
                                    >
                                      <div className="flex flex-col max-w-[460px]">
                                        <span className="font-medium text-sm truncate">
                                          {registro.numero_registro}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate">
                                          {(
                                            registro.nombre_equipo ||
                                            registro.modelo
                                          )?.length > 60
                                            ? `${(
                                                registro.nombre_equipo ||
                                                registro.modelo
                                              ).substring(0, 60)}...`
                                            : registro.nombre_equipo ||
                                              registro.modelo}{" "}
                                          {registro.fabricante &&
                                            `- ${registro.fabricante}`}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : searchInvima.trim() ? (
                                  <SelectItem value="no-results" disabled>
                                    No se encontraron resultados para "
                                    {searchInvima}"
                                  </SelectItem>
                                ) : (
                                  <SelectItem value="no-data" disabled>
                                    No hay registros disponibles
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            {errors.invima && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.invima}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Búsqueda de Registro INVIMA */}
                        <div>
                          <Label className="text-xs sm:text-sm text-gray-700">
                            Búsqueda Manual:
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              placeholder="Buscar por número, equipo o fabricante..."
                              value={searchInvima}
                              onChange={(e) => setSearchInvima(e.target.value)}
                              className="flex-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                              readOnly={!!formData.invima}
                              disabled={isSubmitting || loading}
                            />

                            {/* Iconos de acción cuando hay selección */}
                            {formData.invima && (
                              <>
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={viewInvimaDocument}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  title="Ver documento PDF del registro INVIMA"
                                  disabled={isSubmitting || loading}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={clearInvimaSelection}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  title="Limpiar selección"
                                  disabled={isSubmitting || loading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            <Button
                              size="sm"
                              type="button"
                              onClick={searchRegistrosInvima}
                              className="bg-gray-600 hover:bg-gray-700 text-white"
                              title="Buscar registro INVIMA"
                              disabled={isSubmitting || loading}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              onClick={() => setShowInvimaModal(true)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Agregar nuevo registro INVIMA"
                              disabled={isSubmitting || loading}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            💡{" "}
                            {formData.invima
                              ? "Registro seleccionado. Use el icono 📄 para ver el documento."
                              : "Use la búsqueda para filtrar registros o ingrese manualmente"}
                          </p>
                        </div>

                        {/* Información sobre archivo PDF */}
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <strong>📄 Archivo PDF:</strong> Para adjuntar el
                            documento PDF del registro INVIMA, use el botón "+"
                            para crear un nuevo registro completo con archivo.
                          </p>
                        </div>

                        {/* Información adicional */}
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <strong>ℹ️ Información:</strong> El registro
                            sanitario INVIMA es obligatorio para equipos
                            médicos. Asegúrate de que el número coincida con el
                            documento PDF adjunto.
                          </p>
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
                      <Textarea
                        value={formData.descripcion || ""}
                        onChange={(e) =>
                          handleInputChange("descripcion", e.target.value)
                        }
                        placeholder="Descripción adicional del equipo"
                        className="mt-1 text-xs sm:text-sm"
                        disabled={isSubmitting || loading}
                        rows={3}
                      />
                    </div>

                    {/* Fechas importantes */}
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Año de fabricación:
                      </Label>
                      <Input
                        type="date"
                        value={formData.fecha_fabricacion || ""}
                        onChange={(e) =>
                          handleInputChange("fecha_fabricacion", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.fecha_fabricacion ? "border-red-500" : ""
                        }`}
                        disabled={isSubmitting || loading}
                      />
                      {errors.fecha_fabricacion && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.fecha_fabricacion}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Año de instalación:
                      </Label>
                      <Input
                        type="date"
                        value={formData.fecha_instalacion || ""}
                        onChange={(e) =>
                          handleInputChange("fecha_instalacion", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.fecha_instalacion ? "border-red-500" : ""
                        }`}
                        disabled={isSubmitting || loading}
                      />
                      {errors.fecha_instalacion && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.fecha_instalacion}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Vida útil estimada (años):
                      </Label>
                      <Input
                        type="number"
                        value={formData.vida_util || ""}
                        onChange={(e) =>
                          handleInputChange("vida_util", e.target.value)
                        }
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.vida_util ? "border-red-500" : ""
                        }`}
                        placeholder="Años de vida útil"
                        disabled={isSubmitting || loading}
                      />
                      {errors.vida_util && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.vida_util}
                        </p>
                      )}
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-xs sm:text-sm">
                          Ubicación:<span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-1 gap-4 mt-2">
                          <div>
                            <Label className="text-xs sm:text-sm">
                              Sede:
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              key={`sede-${formReady}-${formData.sede_id}`}
                              value={formData.sede_id || ""}
                              onValueChange={(value) =>
                                handleInputChange("sede_id", value)
                              }
                              disabled={isSubmitting || loading || !formReady}
                            >
                              <SelectTrigger
                                className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                                  errors.sede_id ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Seleccione una sede" />
                              </SelectTrigger>
                              <SelectContent>
                                {dropdownOptions.sedes?.map((sede) => (
                                  <SelectItem
                                    key={sede.id}
                                    value={sede.id.toString()}
                                  >
                                    {sede.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.sede_id && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.sede_id}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs sm:text-sm">
                              Servicio:
                              <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              key={`servicio-${formReady}-${formData.servicio_id}`}
                              value={formData.servicio_id || ""}
                              onValueChange={(value) =>
                                handleInputChange("servicio_id", value)
                              }
                              disabled={isSubmitting || loading || !formReady}
                            >
                              <SelectTrigger
                                className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                                  errors.servicio_id ? "border-red-500" : ""
                                }`}
                              >
                                <SelectValue placeholder="Seleccione un servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {dropdownOptions.servicios.map((servicio) => (
                                  <SelectItem
                                    key={servicio.id}
                                    value={servicio.id.toString()}
                                  >
                                    {servicio.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.servicio_id && (
                              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.servicio_id}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label className="text-xs sm:text-sm">Área:</Label>
                            <Select
                              key={`area-${formReady}-${formData.area_id}`}
                              value={formData.area_id || ""}
                              onValueChange={(value) =>
                                handleInputChange("area_id", value)
                              }
                              disabled={isSubmitting || loading || !formReady}
                            >
                              <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                                <SelectValue placeholder="Seleccione un área" />
                              </SelectTrigger>
                              <SelectContent>
                                {dropdownOptions.areas
                                  .filter(
                                    (area) =>
                                      !formData.servicio_id ||
                                      area.servicio_id?.toString() ===
                                        formData.servicio_id
                                  )
                                  .map((area) => (
                                    <SelectItem
                                      key={area.id}
                                      value={area.id.toString()}
                                    >
                                      {area.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs sm:text-sm">
                          Tipo de equipo:
                        </Label>
                        <Select
                          value={formData.movilidad || "FIJO"}
                          onValueChange={(value) =>
                            handleInputChange("movilidad", value)
                          }
                          disabled={isSubmitting || loading}
                        >
                          <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIJO">FIJO</SelectItem>
                            <SelectItem value="MÓVIL">MÓVIL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs sm:text-sm">
                            Centro de costo:
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.localizacion_actual || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "localizacion_actual",
                                e.target.value
                              )
                            }
                            placeholder="Centro de costo"
                            className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                            disabled={isSubmitting || loading}
                          />
                        </div>
                        <div>
                          <Label className="text-xs sm:text-sm">
                            País de origen:
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.propiedad || ""}
                            onChange={(e) =>
                              handleInputChange("propiedad", e.target.value)
                            }
                            placeholder="País de origen"
                            className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                            disabled={isSubmitting || loading}
                          />
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-2 min-h-[200px] flex flex-col items-center justify-center">
                        {/* Show current image if exists */}
                        {(completeEquipmentData?.image_url ||
                          completeEquipmentData?.image ||
                          equipment?.equipo?.image) &&
                        !formData.newImage ? (
                          <div className="w-full">
                            <img
                              src={
                                completeEquipmentData?.image_url ||
                                (completeEquipmentData?.image
                                  ? `${window.location.origin}/storage/${completeEquipmentData.image}`
                                  : null) ||
                                equipment?.equipo?.image
                              }
                              alt="Equipment"
                              className="max-w-full max-h-40 object-contain mb-3 mx-auto"
                              onError={(e) => {
                                console.log("Image load error:", e.target.src);
                                e.target.style.display = "none";
                              }}
                            />
                            <p className="text-sm text-gray-600 mb-2">
                              Imagen actual
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleInputChange("showImageUpload", true)
                              }
                              disabled={isSubmitting || loading}
                            >
                              Cambiar imagen
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full">
                            {formData.newImage ? (
                              <div>
                                <img
                                  src={URL.createObjectURL(formData.newImage)}
                                  alt="New Equipment"
                                  className="max-w-full max-h-40 object-contain mb-3 mx-auto"
                                />
                                <p className="text-sm text-gray-600 mb-2">
                                  Nueva imagen
                                </p>
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleInputChange("newImage", null);
                                      handleInputChange(
                                        "showImageUpload",
                                        false
                                      );
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <Upload className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
                                <p className="text-gray-500 mb-2">
                                  {completeEquipmentData?.image ||
                                  equipment?.equipo?.image
                                    ? "Seleccionar nueva imagen"
                                    : "Seleccionar imagen del equipo"}
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      handleInputChange("newImage", file);
                                    }
                                  }}
                                  className="hidden"
                                  id="image-upload"
                                  disabled={isSubmitting || loading}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("image-upload")
                                      .click()
                                  }
                                  disabled={isSubmitting || loading}
                                >
                                  Seleccionar archivo
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                    </Label>
                    <Select
                      value={formData.tadquisicion_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("tadquisicion_id", value)
                      }
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="--SELECCIONE--" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.tiposAdquisicion.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Propietario:<span className="text-destructive">*</span>
                    </Label>
                    <Select
                      key={`propietario-${formReady}-${formData.propietario_id}`}
                      value={formData.propietario_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("propietario_id", value)
                      }
                      disabled={isSubmitting || loading || !formReady}
                    >
                      <SelectTrigger
                        className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                          errors.propietario_id ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Seleccione propietario" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.propietarios.map((propietario) => (
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
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.propietario_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Costo de adquisición:
                    </Label>
                    <Input
                      type="number"
                      value={formData.costo || ""}
                      onChange={(e) =>
                        handleInputChange("costo", e.target.value)
                      }
                      placeholder="Valor en pesos"
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.costo ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    {errors.costo && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.costo}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fecha de adquisición:
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_ad || ""}
                      onChange={(e) =>
                        handleInputChange("fecha_ad", e.target.value)
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fecha de instalación:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_instalacion || ""}
                      onChange={(e) =>
                        handleInputChange("fecha_instalacion", e.target.value)
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fecha recepción almacén:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_recepcion_almacen || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "fecha_recepcion_almacen",
                          e.target.value
                        )
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fecha acta de recibo:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_acta_recibo || ""}
                      onChange={(e) =>
                        handleInputChange("fecha_acta_recibo", e.target.value)
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fecha de inicio operación:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_inicio_operacion || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "fecha_inicio_operacion",
                          e.target.value
                        )
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      disabled={isSubmitting || loading}
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fecha de fabricación:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha_fabricacion || ""}
                      onChange={(e) =>
                        handleInputChange("fecha_fabricacion", e.target.value)
                      }
                      className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
                      disabled={isSubmitting || loading}
                    />
                  </div>
                </div>

                {/* Orden de Compra Asociada */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium text-xs sm:text-sm">
                      📋 Orden de Compra Asociada:
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOrderSearchModal(true)}
                      className="text-orange-600 border-orange-300 hover:bg-orange-100 text-xs px-3 py-1 h-7"
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Buscar
                    </Button>
                  </div>

                  {selectedOrderInfo ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-orange-800 truncate">
                            {selectedOrderInfo.orden || `Orden N° ${selectedOrderInfo.numero || selectedOrderInfo.id}`}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Proveedor: {selectedOrderInfo.proveedor || "N/A"}
                          </p>
                          {selectedOrderInfo.valor_total && (
                            <p className="text-xs text-orange-600">
                              Valor: {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP'
                              }).format(selectedOrderInfo.valor_total)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveOrder}
                            className="text-red-600 hover:bg-red-100 h-7 w-7 p-0"
                            title="Quitar orden de compra"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                      <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">
                        Sin orden de compra asociada
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Costo:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.costo || ""}
                      onChange={(e) =>
                        handleInputChange("costo", e.target.value)
                      }
                      placeholder="Valor en pesos"
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.costo ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    {errors.costo && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.costo}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Vida útil:<span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.vida_util || ""}
                      onChange={(e) =>
                        handleInputChange("vida_util", e.target.value)
                      }
                      placeholder="Años de vida útil"
                      className={`mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm ${
                        errors.vida_util ? "border-red-500" : ""
                      }`}
                      disabled={isSubmitting || loading}
                    />
                    {errors.vida_util && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
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
                {/* Especificaciones técnicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Fuente de alimentación:
                    </Label>
                    <Select
                      value={formData.fuente_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("fuente_id", value)
                      }
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Seleccione fuente" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.fuentes.map((fuente) => (
                          <SelectItem
                            key={fuente.id}
                            value={fuente.id.toString()}
                          >
                            {fuente.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Tecnología predominante:
                    </Label>
                    <Select
                      value={formData.tecnologia_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("tecnologia_id", value)
                      }
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Seleccione tecnología" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.tecnologias.map((tecnologia) => (
                          <SelectItem
                            key={tecnologia.id}
                            value={tecnologia.id.toString()}
                          >
                            {tecnologia.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Frecuencia de mantenimiento:
                    </Label>
                    <Select
                      value={formData.frecuencia_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("frecuencia_id", value)
                      }
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Seleccione frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.frecuencias.map((frecuencia) => (
                          <SelectItem
                            key={frecuencia.id}
                            value={frecuencia.id.toString()}
                          >
                            {frecuencia.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Clasificación biomédica:
                    </Label>
                    <Select
                      key={`cbiomedica-${formReady}-${formData.cbiomedica_id}`}
                      value={formData.cbiomedica_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("cbiomedica_id", value)
                      }
                      disabled={isSubmitting || loading || !formReady}
                    >
                      <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Seleccione clasificación" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.clasificacionesBiomedicas.map(
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
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Clasificación de riesgo:
                    </Label>
                    <Select
                      key={`criesgo-${formReady}-${formData.criesgo_id}`}
                      value={formData.criesgo_id || ""}
                      onValueChange={(value) =>
                        handleInputChange("criesgo_id", value)
                      }
                      disabled={isSubmitting || loading || !formReady}
                    >
                      <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Seleccione riesgo" />
                      </SelectTrigger>
                      <SelectContent>
                        {dropdownOptions.clasificacionesRiesgo.map((riesgo) => (
                          <SelectItem
                            key={riesgo.id}
                            value={riesgo.id.toString()}
                          >
                            {riesgo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      ¿Requiere calibración?
                    </Label>
                    <Select
                      value={formData.calibracion ? "true" : "false"}
                      onValueChange={(value) =>
                        handleInputChange("calibracion", value === "true")
                      }
                      disabled={isSubmitting || loading}
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
                </div>

                <Separator className="my-6" />

                <div>
                  <Label className="text-base font-semibold">
                    Estado y observaciones:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Estado del equipo:
                      </Label>
                      <Select
                        value={formData.estadoequipo_id || ""}
                        onValueChange={(value) =>
                          handleInputChange("estadoequipo_id", value)
                        }
                        disabled={isSubmitting || loading}
                      >
                        <SelectTrigger className="mt-1 h-7 sm:h-8 md:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {dropdownOptions.estadosEquipo.map((estado) => (
                            <SelectItem
                              key={estado.id}
                              value={estado.id.toString()}
                            >
                              {estado.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-xs sm:text-sm">
                        Observaciones:
                      </Label>
                      <Textarea
                        value={formData.observacion || ""}
                        onChange={(e) =>
                          handleInputChange("observacion", e.target.value)
                        }
                        placeholder="Observaciones adicionales sobre el equipo"
                        className="mt-1 text-xs sm:text-sm"
                        disabled={isSubmitting || loading}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* REGISTRO DE APOYO TÉCNICO */}
                <div>
                  <Label className="text-base font-semibold">
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
                            id="edit-manual-operacion"
                            checked={formData.manuales?.operacion || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "manuales",
                                "operacion",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-manual-operacion"
                            className="text-xs sm:text-sm"
                          >
                            Operación
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-manual-mantenimiento"
                            checked={formData.manuales?.mantenimiento || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "manuales",
                                "mantenimiento",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-manual-mantenimiento"
                            className="text-xs sm:text-sm"
                          >
                            Mantenimiento
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-manual-partes"
                            checked={formData.manuales?.partes || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "manuales",
                                "partes",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-manual-partes"
                            className="text-xs sm:text-sm"
                          >
                            Partes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-manual-otros"
                            checked={formData.manuales?.otros || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "manuales",
                                "otros",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-manual-otros"
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
                            id="edit-plano-electrico"
                            checked={formData.planos?.electrico || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "planos",
                                "electrico",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-plano-electrico"
                            className="text-xs sm:text-sm"
                          >
                            Eléctrico
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-plano-electronico"
                            checked={formData.planos?.electronico || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "planos",
                                "electronico",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-plano-electronico"
                            className="text-xs sm:text-sm"
                          >
                            Electrónico
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-plano-neumatico"
                            checked={formData.planos?.neumatico || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "planos",
                                "neumatico",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-plano-neumatico"
                            className="text-xs sm:text-sm"
                          >
                            Neumático
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-plano-mecanico"
                            checked={formData.planos?.mecanico || false}
                            onCheckedChange={(checked) =>
                              handleNestedCheckboxChange(
                                "planos",
                                "mecanico",
                                checked
                              )
                            }
                            disabled={isSubmitting || loading}
                          />
                          <Label
                            htmlFor="edit-plano-mecanico"
                            className="text-xs sm:text-sm"
                          >
                            Mecánico
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manuales y Guías Asociados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    
                    {/* Manual Asociado */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-xs sm:text-sm">
                          📖 Manual Asociado:
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowManualSearchModal(true)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-100 text-xs px-3 py-1 h-7"
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Buscar
                        </Button>
                      </div>
                      
                      {selectedManualInfo ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-800 truncate">
                                {selectedManualInfo.descripcion}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                ID: {selectedManualInfo.id}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleViewManual}
                                className="text-green-600 hover:bg-green-100 h-7 w-7 p-0"
                                title="Ver manual"
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveManual}
                                className="text-red-600 hover:bg-red-100 h-7 w-7 p-0"
                                title="Quitar manual"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                          <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            Sin manual asociado
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Guía Rápida Asociada */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium text-xs sm:text-sm">
                          🚀 Guía Rápida Asociada:
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowGuideSearchModal(true)}
                          className="text-purple-600 border-purple-300 hover:bg-purple-100 text-xs px-3 py-1 h-7"
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Buscar
                        </Button>
                      </div>
                      
                      {selectedGuideInfo ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-purple-800 truncate">
                                {selectedGuideInfo.name}
                              </p>
                              <p className="text-xs text-purple-600 mt-1">
                                ID: {selectedGuideInfo.id}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleViewGuide}
                                className="text-purple-600 hover:bg-purple-100 h-7 w-7 p-0"
                                title="Ver guía rápida"
                              >
                                <FileText className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveGuide}
                                className="text-red-600 hover:bg-red-100 h-7 w-7 p-0"
                                title="Quitar guía rápida"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                          <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">
                            Sin guía rápida asociada
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <Label className="text-xs sm:text-sm">
                        Clasificación biomédica:
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.cbiomedica_id || ""}
                        onValueChange={(value) =>
                          handleInputChange("cbiomedica_id", value)
                        }
                        disabled={isSubmitting || loading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar clasificación" />
                        </SelectTrigger>
                        <SelectContent>
                          {dropdownOptions.clasificacionesBiomedicas.map(
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
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm">
                        Clasificación de acuerdo al riesgo:
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.criesgo_id || ""}
                        onValueChange={(value) =>
                          handleInputChange("criesgo_id", value)
                        }
                        disabled={isSubmitting || loading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Seleccionar riesgo" />
                        </SelectTrigger>
                        <SelectContent>
                          {dropdownOptions.clasificacionesRiesgo.map(
                            (riesgo) => (
                              <SelectItem
                                key={riesgo.id}
                                value={riesgo.id.toString()}
                              >
                                {riesgo.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
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
                    value={formData.accesorios || ""}
                    onChange={(e) =>
                      handleInputChange("accesorios", e.target.value)
                    }
                    placeholder="Descripción de componentes y accesorios del equipo..."
                    className="min-h-[100px] border-none resize-none focus:ring-0 w-full"
                    disabled={isSubmitting || loading}
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
                    <Label className="text-xs sm:text-sm">Propietario:</Label>
                    <Select defaultValue="hospital">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">
                          Hospital Universitario del Valle
                        </SelectItem>
                        <SelectItem value="tercero">Tercero</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Verificación física:
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.evaluacion_desempenio || ""}
                      onValueChange={(value) =>
                        handleInputChange("evaluacion_desempenio", value)
                      }
                      disabled={isSubmitting || loading}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realizada">Realizada</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="no-aplica">No Aplica</SelectItem>
                        <SelectItem value="excelente">Excelente</SelectItem>
                        <SelectItem value="bueno">Bueno</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
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
                <div className="space-y-4">
                  <Textarea
                    placeholder="Escriba todas las observaciones que se estimen pertinentes para el seguimiento del equipo"
                    value={formData.observacion || ""}
                    onChange={(e) =>
                      handleInputChange("observacion", e.target.value)
                    }
                    className="min-h-[60px] sm:min-h-[80px] w-full"
                    disabled={isSubmitting}
                  />

                  {/* Historial de observaciones */}
                  {equipmentHistory.observaciones &&
                    equipmentHistory.observaciones.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2 text-gray-700">
                          Historial de Observaciones:
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {equipmentHistory.observaciones.map((obs, index) => (
                            <div
                              key={obs.id || index}
                              className="p-2 bg-gray-50 rounded text-xs border"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-gray-600">
                                  {obs.created_at
                                    ? new Date(
                                        obs.created_at
                                      ).toLocaleDateString()
                                    : "Fecha no disponible"}
                                </span>
                                {obs.file && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() =>
                                      viewObservacionDocument(obs.file)
                                    }
                                  >
                                    Ver archivo
                                  </Button>
                                )}
                              </div>
                              <p className="text-gray-800">
                                {obs.description || "Sin descripción"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* CORRECTIVOS TICKETS */}
            <Card>
              <CardHeader className="bg-red-50 py-3">
                <CardTitle className="text-sm font-medium text-center text-red-700">
                  CORRECTIVOS TICKETS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-xs">
                          Id Orden
                        </th>
                        <th className="border border-gray-300 p-2 text-xs">
                          Fecha de creación
                        </th>
                        <th className="border border-gray-300 p-2 text-xs">
                          Descripción
                        </th>
                        <th className="border border-gray-300 p-2 text-xs">
                          Estado
                        </th>
                        <th className="border border-gray-300 p-2 text-xs">
                          ARCHIVO RELACIONADO
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Datos dinámicos de correctivos_generales */}
                      {equipmentHistory.correctivos &&
                      equipmentHistory.correctivos.length > 0 ? (
                        equipmentHistory.correctivos.map(
                          (correctivo, index) => (
                            <tr key={correctivo.id || index}>
                              <td className="border border-gray-300 p-2 text-xs">
                                {correctivo.id || correctivo.code_orden || "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {correctivo.created_at
                                  ? new Date(
                                      correctivo.created_at
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {correctivo.description ||
                                  correctivo.diagnostico ||
                                  "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    correctivo.status === 1
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {correctivo.status === 1
                                    ? "Activo"
                                    : "Inactivo"}
                                </span>
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {correctivo.file ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      viewCorrectivoDocument(correctivo.file)
                                    }
                                  >
                                    Ver archivo
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            className="border border-gray-300 p-2 text-xs text-center text-gray-500"
                            colSpan="5"
                          >
                            No hay tickets correctivos registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* OTROS CORRECTIVOS */}
            <Card>
              <CardHeader className="bg-yellow-50 py-3">
                <CardTitle className="text-sm font-medium text-center text-yellow-700 flex items-center justify-center gap-2">
                  OTROS CORRECTIVOS
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        otrosCorrectivos: !prev.otrosCorrectivos,
                      }))
                    }
                  >
                    <Plus
                      className={`h-4 w-4 transition-transform ${
                        expandedSections?.otrosCorrectivos ? "rotate-45" : ""
                      }`}
                    />
                  </Button>
                </CardTitle>
              </CardHeader>
              {expandedSections?.otrosCorrectivos && (
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Información de la Orden de trabajo
                      </h4>
                      <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50">
                        <p className="text-xs text-gray-600">
                          Información de órdenes de trabajo adicionales
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Información de cierre
                      </h4>
                      <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50">
                        <p className="text-xs text-gray-600">
                          Información de cierre de órdenes
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button type="button" variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  </div>
                  <div className="mt-4 border border-gray-300 p-3 bg-gray-50">
                    <h4 className="font-medium text-sm mb-2">
                      ARCHIVO RELACIONADO
                    </h4>
                    <div className="text-xs text-gray-600">
                      Archivos relacionados con órdenes de trabajo
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* PREVENTIVOS */}
            <Card>
              <CardHeader className="bg-green-50 py-3">
                <CardTitle className="text-sm font-medium text-center text-green-700 flex items-center justify-center gap-2">
                  PREVENTIVOS
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        preventivos: !prev.preventivos,
                      }))
                    }
                  >
                    <Plus
                      className={`h-4 w-4 transition-transform ${
                        expandedSections?.preventivos ? "rotate-45" : ""
                      }`}
                    />
                  </Button>
                </CardTitle>
              </CardHeader>
              {expandedSections?.preventivos && (
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-xs">
                            nro mantenimiento
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            fecha de ejecución
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            información relacionada
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Datos dinámicos de planes_mantenimientos */}
                        {equipmentHistory.preventivos &&
                        equipmentHistory.preventivos.length > 0 ? (
                          equipmentHistory.preventivos.map(
                            (preventivo, index) => (
                              <tr key={preventivo.id || index}>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {preventivo.id || "-"}
                                </td>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {preventivo.fecha_mantenimiento
                                    ? new Date(
                                        preventivo.fecha_mantenimiento
                                      ).toLocaleDateString()
                                    : preventivo.fecha_programada
                                    ? new Date(
                                        preventivo.fecha_programada
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {preventivo.description ||
                                    preventivo.observacion ||
                                    "-"}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              className="border border-gray-300 p-2 text-xs text-center text-gray-500"
                              colSpan="3"
                            >
                              No hay mantenimientos preventivos registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* CALIBRACIONES */}
            <Card>
              <CardHeader className="bg-blue-50 py-3">
                <CardTitle className="text-sm font-medium text-center text-blue-700 flex items-center justify-center gap-2">
                  CALIBRACIONES
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        calibraciones: !prev.calibraciones,
                      }))
                    }
                  >
                    <Plus
                      className={`h-4 w-4 transition-transform ${
                        expandedSections?.calibraciones ? "rotate-45" : ""
                      }`}
                    />
                  </Button>
                </CardTitle>
              </CardHeader>
              {expandedSections?.calibraciones && (
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-xs">
                            NRO CALIBRACION
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            FECHA DE EJECUCION
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            FECHA PROGRAMADA
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            ARCHIVO RELACIONADO
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Datos dinámicos de calibracion */}
                        {equipmentHistory.calibraciones &&
                        equipmentHistory.calibraciones.length > 0 ? (
                          equipmentHistory.calibraciones.map(
                            (calibracion, index) => (
                              <tr key={calibracion.id || index}>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {calibracion.id || "-"}
                                </td>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {calibracion.fecha_calibracion
                                    ? new Date(
                                        calibracion.fecha_calibracion
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {calibracion.fecha_programada
                                    ? new Date(
                                        calibracion.fecha_programada
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>
                                <td className="border border-gray-300 p-2 text-xs">
                                  {calibracion.file ? (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                    >
                                      Ver certificado
                                    </Button>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              className="border border-gray-300 p-2 text-xs text-center text-gray-500"
                              colSpan="4"
                            >
                              No hay calibraciones registradas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* REPUESTOS/ACCESORIOS */}
            <Card>
              <CardHeader className="bg-purple-50 py-3">
                <CardTitle className="text-sm font-medium text-center text-purple-700 flex items-center justify-center gap-2">
                  REPUESTOS/ACCESORIOS
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        repuestos: !prev.repuestos,
                      }))
                    }
                  >
                    <Plus
                      className={`h-4 w-4 transition-transform ${
                        expandedSections?.repuestos ? "rotate-45" : ""
                      }`}
                    />
                  </Button>
                </CardTitle>
              </CardHeader>
              {expandedSections?.repuestos && (
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-xs">
                            REPUESTO/ACCESORIO
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            OBSERVACION
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            FECHA DE INSTALACION
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            CANTIDAD ENTREGADA
                          </th>
                          <th className="border border-gray-300 p-2 text-xs">
                            ARCHIVO RELACIONADO
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Datos dinámicos de equipo_repuestos */}
                        {equipmentHistory.repuestos &&
                        equipmentHistory.repuestos.length > 0 ? (
                          equipmentHistory.repuestos.map((repuesto, index) => (
                            <tr key={repuesto.id || index}>
                              <td className="border border-gray-300 p-2 text-xs">
                                {repuesto.name ||
                                  repuesto.repuesto?.name ||
                                  "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {repuesto.observacion || "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {repuesto.fecha
                                  ? new Date(
                                      repuesto.fecha
                                    ).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {repuesto.cantidad_entregada || "-"}
                              </td>
                              <td className="border border-gray-300 p-2 text-xs">
                                {repuesto.file ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      viewRepuestoDocument(repuesto.file)
                                    }
                                  >
                                    Ver archivo
                                  </Button>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              className="border border-gray-300 p-2 text-xs text-center text-gray-500"
                              colSpan="5"
                            >
                              No hay repuestos/accesorios registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="flex justify-between p-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-8 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Modal para agregar nuevo registro INVIMA */}
      <AgregarRegistroInvimaModal
        open={showInvimaModal}
        onOpenChange={setShowInvimaModal}
        onInvimaCreated={handleNewInvimaCreated}
      />

      {/* Modal de búsqueda de manuales */}
      <ManualSearchModal
        open={showManualSearchModal}
        onOpenChange={setShowManualSearchModal}
        onSelectManual={handleManualSelection}
        currentManualId={formData.manual_id}
      />

      {/* Modal de búsqueda de guías rápidas */}
      <QuickGuideSearchModal
        open={showGuideSearchModal}
        onOpenChange={setShowGuideSearchModal}
        onSelectGuide={handleGuideSelection}
        currentGuideId={formData.guia_id}
      />

      {/* Modal de búsqueda de órdenes de compra */}
      <OrderSearchModal
        open={showOrderSearchModal}
        onOpenChange={setShowOrderSearchModal}
        onSelectOrder={handleOrderSelection}
        currentOrderId={formData.orden_compra_id}
      />
    </Dialog>
  );
}

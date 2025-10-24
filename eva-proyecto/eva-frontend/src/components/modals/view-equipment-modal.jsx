"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Settings,
  FileText,
  Download,
  Building,
  Wrench,
  Shield,
  DollarSign,
  User,
  AlertCircle,
  Info,
  Package,
  History,
  Clock,
  UserCheck,
} from "lucide-react";
import { usePDF } from "@react-pdf/renderer";
import { EquipmentLifecyclePDFCompact   } from "../pdf/equipment-lifecycle-pdf-compact";
import { MinimalTestPDF } from "../pdf/minimal-test-pdf";
import EquipmentModalReplicaPDF from "../pdf/equipment-modal-replica-pdf";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import { ManualSearchModal } from "./manual-search-modal";
import { QuickGuideSearchModal } from "./quick-guide-search-modal";

export function ViewEquipmentModal({
  open,
  onOpenChange,
  equipment,
  equipmentType = "biomedical", // "biomedical" | "industrial"
}) {
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [userHistory, setUserHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para modales de apoyo técnico
  const [showManualSearchModal, setShowManualSearchModal] = useState(false);
  const [showGuideSearchModal, setShowGuideSearchModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Estados para información completa de manuales y guías
  const [selectedManualInfo, setSelectedManualInfo] = useState(null);
  const [selectedGuideInfo, setSelectedGuideInfo] = useState(null);

  // PDF generation hook - using new modal replica component
  const [instance, updateInstance] = usePDF({
    document: null, // Initialize as null to prevent initial render errors
  });

  // Function to fetch user history for equipment (PUBLIC ENDPOINT)
  const fetchUserHistory = async (equipmentId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://192.168.56.1:8001/api"}/v1/equipos/${equipmentId}/user-history`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUserHistory(data.data || []);
      } else {
        console.warn('API returned success: false for user history');
        setUserHistory([]);
      }
      
    } catch (error) {
      console.error('Error fetching user history:', error);
      setUserHistory([]);
    }
  };

  // Define fetchEquipmentDetailsPublic function first
  const fetchEquipmentDetailsPublic = async (equipmentId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://192.168.56.1:8001/api"}/v1/equipos/${equipmentId}/complete-info`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      setEquipmentDetails(data.data);
      // Load user history after equipment details
      await fetchUserHistory(equipmentId);
    } else {
      throw new Error(data.message || "Error al obtener datos del equipo");
    }
  };

  // Define fetchEquipmentDetails function with useCallback
  const fetchEquipmentDetails = useCallback(async (equipmentId) => {
    setLoading(true);
    setError(null);

    try {
      // Try authenticated request first
      const authToken =
        localStorage.getItem("eva_auth_token") ||
        localStorage.getItem("auth_token");

      if (authToken) {
        try {
          const response = await httpService.get(
            `/v1/equipos/${equipmentId}/complete-info`
          );
          if (response.data?.success) {
            setEquipmentDetails(response.data.data);
            // Load user history after equipment details
            await fetchUserHistory(equipmentId);
            return;
          }
        } catch (authError) {
          if (authError.response?.status === 401) {
            toast.error(
              "Error de autenticación. Intentando endpoint público..."
            );
          }
        }
      }

      // Fallback to public endpoint
      await fetchEquipmentDetailsPublic(equipmentId);
    } catch (err) {
      console.error("Error fetching equipment details:", err);
      setError("Error al cargar los detalles del equipo");
      toast.error("Error al cargar los detalles del equipo");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch complete equipment information when modal opens
  useEffect(() => {
    if (open && equipment?.id) {
      setImageError(false); // Reset image error state
      fetchEquipmentDetails(equipment.id);
    }
  }, [open, equipment?.id, fetchEquipmentDetails]);

  // Cargar información completa de manuales y guías cuando se cargan los detalles del equipo
  useEffect(() => {
    const loadAssociatedInfo = async () => {
      if (!equipmentDetails) return;

      // Limpiar estados previos
      setSelectedManualInfo(null);
      setSelectedGuideInfo(null);

      // Cargar información del manual si existe manual_id
      if (equipmentDetails.manual_id && equipmentDetails.manual_id !== 0) {
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
              m.id.toString() === equipmentDetails.manual_id.toString()
            );
            console.log("📖 Manual encontrado:", manual);
            if (manual) {
              setSelectedManualInfo(manual);
              console.log("📖 Manual cargado en vista:", manual.descripcion);
            } else {
              console.warn("📖 Manual no encontrado con ID:", equipmentDetails.manual_id);
            }
          }
        } catch (error) {
          console.error("Error loading manual in view:", error);
        }
      }

      // Cargar información de la guía si existe guia_id
      if (equipmentDetails.guia_id && equipmentDetails.guia_id !== 0) {
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
              g.id.toString() === equipmentDetails.guia_id.toString()
            );
            console.log("🚀 Guía encontrada:", guide);
            if (guide) {
              setSelectedGuideInfo(guide);
              console.log("🚀 Guía cargada en vista:", guide.name);
            } else {
              console.warn("🚀 Guía no encontrada con ID:", equipmentDetails.guia_id);
            }
          }
        } catch (error) {
          console.error("Error loading guide in view:", error);
        }
      }
    };

    loadAssociatedInfo();
  }, [equipmentDetails]);

  // Update PDF when equipment details change - using new modal replica component
  useEffect(() => {
    if (equipmentDetails && EquipmentModalReplicaPDF) {
      try {
        // Combinar todos los datos para el PDF incluyendo información cargada
        const pdfData = {
          ...equipmentDetails,
          selectedManualInfo,
          selectedGuideInfo,
          userHistory
        };
        
        updateInstance(
          <EquipmentModalReplicaPDF data={pdfData} />
        );
      } catch (error) {
        console.error("Error updating PDF instance:", error);
      }
    }
  }, [equipmentDetails, selectedManualInfo, selectedGuideInfo, userHistory, updateInstance]);

  // Handle PDF download
  const handleDownloadPDF = () => {
    try {
      if (instance.url && !instance.loading && !instance.error) {
        const link = document.createElement("a");
        link.href = instance.url;
        link.download = `equipo_${
          equipmentDetails?.code || equipment?.id
        }_reporte.pdf`;
        link.click();
        toast.success("Reporte PDF descargado exitosamente");
      } else if (instance.loading) {
        toast.info("El PDF se está generando, espere un momento...");
      } else if (instance.error) {
        console.error("PDF generation error:", instance.error);
        toast.error("Error al generar el PDF. Verifique los datos del equipo.");
      } else {
        toast.error("Error al generar el PDF. Intente nuevamente.");
      }
    } catch (error) {
      console.error("Error in PDF download:", error);
      toast.error("Error al descargar el PDF. Intente nuevamente.");
    }
  };

  // Enhanced safe value function with better data handling
  const safeValue = (value, fallback = "No disponible") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (value === 0) return "0"; // Handle zero values properly
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (typeof value === "object" && value !== null) {
      if (value.name) return value.name;
      if (value.nombre) return value.nombre;
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Enhanced date formatting with better error handling
  const formatDate = (date, fallback = "No disponible") => {
    if (!date || date === null || date === undefined || date === "")
      return fallback;
    
    try {
      if (typeof date === "string" && date.includes("-")) {
        return new Date(date).toLocaleDateString("es-ES");
      }
      if (typeof date === "number") {
        return new Date(date).toLocaleDateString("es-ES");
      }
      return String(date);
    } catch (error) {
      console.warn("Error formatting date:", date, error);
      return fallback;
    }
  };

  // Handle manual selection (read-only modal, no actual selection)
  const handleSelectManual = (manual) => {
    console.log("Manual selection in view modal (read-only):", manual);
    // In view modal, this is just for logging/debugging
    // The modal will close automatically
  };

  // Handle guide selection (read-only modal, no actual selection)
  const handleSelectGuide = (guide) => {
    console.log("Guide selection in view modal (read-only):", guide);
    // In view modal, this is just for logging/debugging
    // The modal will close automatically
  };

  // Calculate age function
  const calculateAge = (fabricationDate) => {
    if (!fabricationDate) return "No disponible";
    try {
      const today = new Date();
      const fabDate = new Date(fabricationDate);
      const years = today.getFullYear() - fabDate.getFullYear();
      return `${years} años`;
    } catch {
      return "No calculable";
    }
  };

  // Handlers para manuales y guías (solo visualización en modal de vista)
  const handleViewManual = () => {
    const manualId = equipmentDetails?.manual_id;
    if (!manualId) {
      toast.error("No hay manual asociado a este equipo");
      return;
    }

    // Para el modal de vista, abrir modal de búsqueda para ver detalles
    setShowManualSearchModal(true);
  };

  const handleViewGuide = () => {
    const guideId = equipmentDetails?.guia_id;
    if (!guideId) {
      toast.error("No hay guía rápida asociada a este equipo");
      return;
    }

    // Para el modal de vista, abrir modal de búsqueda para ver detalles
    setShowGuideSearchModal(true);
  };

  // Use equipment details if available, otherwise fallback to passed equipment
  const displayData = equipmentDetails || equipment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-blue-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-blue-700">
                  FORMATO DE HOJA DE VIDA PARA EQUIPOS{" "}
                  {equipmentType === "industrial"
                    ? "INDUSTRIALES"
                    : "BIOMÉDICOS"}
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  Hospital Universitario del Valle Evaristo García
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={!equipmentDetails || instance.loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {instance.loading ? "Generando..." : "Descargar PDF"}
            </Button>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Cargando información del equipo...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {displayData && (
          <div className="max-h-[70vh] overflow-y-auto">
            {/* HEADER IDÉNTICO AL PDF */}
            <div className="flex items-center justify-between p-6 border-b-2 border-blue-600 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 flex-shrink-0">
                  <img 
                    src="/images/logo_huv.jpg" 
                    alt="Hospital Universitario del Valle"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="text-center flex-1">
                  <h1 className="text-xl font-bold text-blue-700 mb-1">
                    HOSPITAL UNIVERSITARIO DEL VALLE "EVARISTO GARCÍA"
                  </h1>
                  <p className="text-lg text-blue-600 font-medium">
                    HOJA DE VIDA - {safeValue(displayData.name?.toUpperCase())}
                  </p>
                  <p className="text-sm text-blue-500">
                    Sistema de Gestión EVA - Electromedicina
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE EQUIPO CON IMAGEN */}
            <div className="flex gap-6 p-6 bg-gray-50 border-b">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-800 mb-4">
                  {safeValue(displayData.name)}
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>ID:</strong> {safeValue(displayData.id)}</div>
                  <div><strong>Código:</strong> {safeValue(displayData.code)}</div>
                  <div><strong>Serie:</strong> {safeValue(displayData.serial)}</div>
                  <div><strong>Marca:</strong> {safeValue(displayData.marca)}</div>
                  <div><strong>Modelo:</strong> {safeValue(displayData.modelo)}</div>
                  <div><strong>Estado:</strong> {safeValue(displayData.estado_nombre)}</div>
                </div>
              </div>
              <div className="w-24 h-24 border border-gray-300 rounded flex items-center justify-center bg-white">
                {displayData.image && !imageError ? (
                  <img
                    src={displayData.image_url || displayData.image}
                    alt={displayData.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <FileText className="h-8 w-8" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}
              </div>
            </div>

            {/* INFORMACIÓN GENERAL Y UBICACIÓN - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                INFORMACIÓN GENERAL Y UBICACIÓN
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">ID del Equipo</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.id)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Código</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.code)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Serie</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.serial)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Estado</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.estado_nombre)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Sede</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.sede_nombre)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Servicio</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.servicio_nombre)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Área</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.area_nombre)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Piso</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.piso)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARACTERÍSTICAS TÉCNICAS - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                CARACTERÍSTICAS TÉCNICAS Y ESPECIFICACIONES
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Marca</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.marca)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Modelo</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.modelo)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Potencia</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.potencia)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Corriente</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.corriente)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">País Origen</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.pais_origen)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Frecuencia</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.frecuencia)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Año Fabricación</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_fabricacion, new Date(displayData.fecha_fabricacion).getFullYear())}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Garantía</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.garantia)} años</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Vida Útil</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.vida_util)} años</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Voltaje</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.v1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* INFORMACIÓN REGULATORIA Y FECHAS CRÍTICAS - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                INFORMACIÓN REGULATORIA Y FECHAS CRÍTICAS
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Reg. INVIMA</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.registro_sanitario)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Estado INVIMA</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.estado_invima)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">F. Fabricación</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_fabricacion)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">F. Instalación</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_instalacion)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">F. Acta Recibo</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_acta_recibo)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">F. Operación</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_inicio_operacion)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">F. Venc. Garantía</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_vencimiento_garantia)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">F. Venc. INVIMA</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(displayData.fecha_vencimiento_invima)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* INFORMACIÓN FINANCIERA Y CONTRACTUAL - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                INFORMACIÓN FINANCIERA Y CONTRACTUAL
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Costo</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.costo)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Propietario</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.propietario_nombre)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Propiedad</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.propiedad)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Comodato</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.activo_comodato)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANTENIMIENTOS PREVENTIVOS RECIENTES - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                MANTENIMIENTOS PREVENTIVOS RECIENTES
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Fecha</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Tipo</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Técnico</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.mantenimientos_preventivos && displayData.mantenimientos_preventivos.length > 0 ? (
                      displayData.mantenimientos_preventivos.slice(0, 5).map((mant, index) => (
                        <tr key={index}>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(mant.fecha_programada)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(mant.tipo)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(mant.tecnico_nombre)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(mant.estado)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="border border-blue-200 px-3 py-4 text-center italic text-gray-500">
                          No hay mantenimientos preventivos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CALIBRACIONES RECIENTES - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                CALIBRACIONES RECIENTES
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Fecha Calibración</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Tipo</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Próxima</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.calibraciones && displayData.calibraciones.length > 0 ? (
                      displayData.calibraciones.slice(0, 4).map((cal, index) => (
                        <tr key={index}>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(cal.fecha_calibracion)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(cal.tipo_calibracion)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(cal.proxima_calibracion)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(cal.resultado)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="border border-blue-200 px-3 py-4 text-center italic text-gray-500">
                          No hay calibraciones registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANTENIMIENTOS CORRECTIVOS RECIENTES - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                MANTENIMIENTOS CORRECTIVOS RECIENTES
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Fecha</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Descripción</th>
                      <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayData.contingencias && displayData.contingencias.length > 0 ? (
                      displayData.contingencias.slice(0, 6).map((cont, index) => (
                        <tr key={index}>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{formatDate(cont.fecha_reporte)}</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(cont.descripcion_problema).substring(0, 100)}...</td>
                          <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(cont.usuario_nombre)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border border-blue-200 px-3 py-4 text-center italic text-gray-500">
                          No hay mantenimientos correctivos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DOCUMENTOS ASOCIADOS - ESTILO TABULAR EXCEL CON ENLACES FUNCIONALES */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                DOCUMENTOS ASOCIADOS
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-blue-300">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Nombre</th>
                        <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Tipo de Documento</th>
                        <th className="border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.documentos && displayData.documentos.length > 0 ? (
                        displayData.documentos.slice(0, 6).map((doc, index) => (
                          <tr key={index}>
                            <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(doc.nombre_archivo)}</td>
                            <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(doc.tipo_documento)}</td>
                            <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(doc.fecha_documento)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="border border-blue-200 px-3 py-4 text-center italic text-gray-500">
                            No hay documentos asociados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="space-y-4">
                  {/* Documentación Asociada con Enlaces Funcionales */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3 bg-blue-50 px-3 py-2 border border-blue-200">📚 Documentación Asociada</h4>
                    <div className="space-y-3 border border-blue-300 p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">📖 Manual Asociado:</span>
                        {selectedManualInfo ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800">
                              {selectedManualInfo.descripcion}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(selectedManualInfo.url, "_blank")}
                              className="text-green-600 hover:bg-green-100 h-6 w-6 p-0"
                              title="Ver manual"
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : displayData.manual_id ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Cargando manual...</Badge>
                        ) : (
                          <span className="text-gray-500">Sin manual asociado</span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">🚀 Guía Rápida Asociada:</span>
                        {selectedGuideInfo ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-800">
                              {selectedGuideInfo.name}
                            </Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const fileUrl = `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/storage/guias/${selectedGuideInfo.file}`;
                                window.open(fileUrl, "_blank");
                              }}
                              className="text-purple-600 hover:bg-purple-100 h-6 w-6 p-0"
                              title="Ver guía rápida"
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : displayData.guia_id ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Cargando guía...</Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin guía rápida asociada</span>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded border border-blue-200">
                        <strong className="text-gray-700">Accesorios:</strong>
                        <div 
                          className="mt-1 text-gray-600 text-xs"
                          dangerouslySetInnerHTML={{
                            __html: displayData.accesorios || "No especificados"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN ADICIONAL - ESTILO TABULAR EXCEL */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white bg-blue-600 px-4 py-2 mb-0">
                INFORMACIÓN ADICIONAL
              </h3>
              <div className="border border-blue-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Verificación Inventario</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.verificacion_inventario)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 w-1/4">Código Antiguo</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.codigo_antiguo)}</td>
                    </tr>
                    <tr>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Repuesto Pendiente</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.repuesto_pendiente)}</td>
                      <td className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">Plan Mantenimiento</td>
                      <td className="border border-blue-200 px-3 py-2 text-sm">{safeValue(displayData.plan)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOTÓN VER HISTORIAL FUERA DEL FORMATO PDF */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  <History className="h-4 w-4 mr-2" />
                  {showHistory ? 'Ocultar Historial' : 'Ver Historial de Usuarios'}
                </Button>
              </div>
            </div>

            {/* HISTORIAL DE USUARIOS CON ANIMACIÓN */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showHistory ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="p-6 bg-white border-t">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  📋 HISTORIAL DE ACTIVIDAD DE USUARIOS
                </h3>
                
                {userHistory.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {userHistory.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          {entry.tipo === 'observacion' ? (
                            <UserCheck className="h-4 w-4 text-blue-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {entry.usuario}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(entry.fecha).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">{entry.accion}:</span> {entry.detalle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      No hay actividad registrada para este equipo
                    </p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700">
                      <strong>Nota:</strong> Este historial muestra las últimas actividades de usuarios que han agregado observaciones o documentos a este equipo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg m-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    Modo Solo Lectura
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Esta vista es de solo consulta. Los datos se obtienen
                    directamente de la base de datos del sistema EVA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Modal de búsqueda de manuales */}
      <ManualSearchModal
        open={showManualSearchModal}
        onOpenChange={setShowManualSearchModal}
        onSelectManual={handleSelectManual}
      />

      {/* Modal de búsqueda de guías */}
      <QuickGuideSearchModal
        open={showGuideSearchModal}
        onOpenChange={setShowGuideSearchModal}
        onSelectGuide={handleSelectGuide}
      />
    </Dialog>
  );
}

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
  Info
} from "lucide-react";
import { usePDF } from '@react-pdf/renderer';
import { EquipmentLifecyclePDFRobust } from '../pdf/equipment-lifecycle-pdf-robust';
import { MinimalTestPDF } from '../pdf/minimal-test-pdf';
import { toast } from 'sonner';
import httpService from '@/services/httpService';

export function ViewEquipmentModal({ open, onOpenChange, equipment }) {
  const [equipmentDetails, setEquipmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // PDF generation hook - switch between components for testing
  // Use MinimalTestPDF for basic testing, EquipmentLifecyclePDFRobust for full functionality
  const [instance, updateInstance] = usePDF({
    document: equipmentDetails ? <EquipmentLifecyclePDFRobust equipment={equipmentDetails} /> : null
    // document: equipmentDetails ? <MinimalTestPDF equipment={equipmentDetails} /> : null  // For testing
  });

  // Define fetchEquipmentDetailsPublic function first
  const fetchEquipmentDetailsPublic = async (equipmentId) => {
    const response = await fetch(`http://localhost:8000/api/v1/equipos/${equipmentId}/complete-info`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      setEquipmentDetails(data.data);
    } else {
      throw new Error(data.message || 'Error al obtener datos del equipo');
    }
  };

  // Define fetchEquipmentDetails function with useCallback
  const fetchEquipmentDetails = useCallback(async (equipmentId) => {
    setLoading(true);
    setError(null);

    try {
      // Try authenticated request first
      const authToken = localStorage.getItem('eva_auth_token') || localStorage.getItem('auth_token');

      if (authToken) {
        try {
          const response = await httpService.get(`/v1/equipos/${equipmentId}/complete-info`);
          if (response.data?.success) {
            setEquipmentDetails(response.data.data);
            return;
          }
        } catch (authError) {
          if (authError.response?.status === 401) {
            toast.error('Error de autenticación. Intentando endpoint público...');
          }
        }
      }

      // Fallback to public endpoint
      await fetchEquipmentDetailsPublic(equipmentId);

    } catch (err) {
      console.error('Error fetching equipment details:', err);
      setError('Error al cargar los detalles del equipo');
      toast.error('Error al cargar los detalles del equipo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch complete equipment information when modal opens
  useEffect(() => {
    if (open && equipment?.id) {
      fetchEquipmentDetails(equipment.id);
    }
  }, [open, equipment?.id, fetchEquipmentDetails]);

  // Update PDF when equipment details change
  useEffect(() => {
    if (equipmentDetails) {
      updateInstance(<EquipmentLifecyclePDFRobust equipment={equipmentDetails} />);
      // updateInstance(<MinimalTestPDF equipment={equipmentDetails} />);  // For testing
    }
  }, [equipmentDetails, updateInstance]);

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (instance.url) {
      const link = document.createElement('a');
      link.href = instance.url;
      link.download = `equipo_${equipmentDetails?.code || equipment?.id}_reporte.pdf`;
      link.click();
      toast.success('Reporte PDF descargado exitosamente');
    } else {
      toast.error('Error al generar el PDF. Intente nuevamente.');
    }
  };

  // Enhanced safe value function with better data handling
  const safeValue = (value, fallback = 'No disponible') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (value === 0) return '0'; // Handle zero values properly
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object' && value !== null) {
      if (value.name) return value.name;
      if (value.nombre) return value.nombre;
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Enhanced date formatting with better error handling
  const formatDate = (date, fallback = 'No disponible') => {
    if (!date || date === null || date === undefined || date === '') return fallback;
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return fallback;
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return fallback;
    }
  };





  // Calculate age function
  const calculateAge = (fabricationDate) => {
    if (!fabricationDate) return 'No disponible';
    try {
      const today = new Date();
      const fabDate = new Date(fabricationDate);
      const years = today.getFullYear() - fabDate.getFullYear();
      return `${years} años`;
    } catch {
      return 'No calculable';
    }
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
                  FORMATO DE HOJA DE VIDA PARA EQUIPOS BIOMÉDICOS
                </DialogTitle>
                <p className="text-sm text-gray-600">Hospital Universitario del Valle Evaristo García</p>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={!equipmentDetails || instance.loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {instance.loading ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando información del equipo...</span>
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
          <div className="space-y-6 p-2">
            {/* SECCIÓN 1: ENCABEZADO E IDENTIFICACIÓN PRINCIPAL */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-start gap-6">
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-blue-200">
                  {displayData.image ? (
                    <img
                      src={displayData.image_url || displayData.image}
                      alt={displayData.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="flex flex-col items-center text-gray-500">
                    <FileText className="h-8 w-8 mb-1" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-800 mb-4">
                    {safeValue(displayData.name)}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-600">ID del Equipo:</span>
                      <Badge className="ml-2 bg-orange-100 text-orange-800">
                        {safeValue(displayData.id)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Código:</span>
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        {safeValue(displayData.code)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Serie:</span>
                      <span className="ml-2 text-sm">{safeValue(displayData.serial)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Estado:</span>
                      <Badge className={`ml-2 ${
                        displayData.estado_nombre?.toLowerCase().includes('operativo') || displayData.estado_nombre?.toLowerCase().includes('funcionando')
                          ? 'bg-green-100 text-green-800'
                          : displayData.estado_nombre?.toLowerCase().includes('mantenimiento')
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {safeValue(displayData.estado_nombre)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Marca:</span>
                      <span className="ml-2 text-sm">{safeValue(displayData.marca)}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-600">Modelo:</span>
                      <span className="ml-2 text-sm">{safeValue(displayData.modelo)}</span>
                    </div>
                  </div>
                  {displayData.descripcion && (
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-gray-600">Descripción:</span>
                      <p className="text-sm text-gray-700 mt-1 bg-white p-3 rounded border">
                        {displayData.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: INFORMACIÓN TÉCNICA DEL FABRICANTE */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <Settings className="h-5 w-5 text-blue-600" />
                2. Información Técnica del Fabricante
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Año de Fabricación:</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(displayData.fecha_fabricacion)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">País de Origen:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.pais_origen)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Voltaje:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.voltaje)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frecuencia:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.frecuencia)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Edad del Equipo:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {calculateAge(displayData.fecha_fabricacion)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Movilidad:</span>
                    <Badge className={`${
                      displayData.movilidad?.toLowerCase() === 'movil'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {safeValue(displayData.movilidad)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CLASIFICACIONES Y CATEGORIZACIÓN */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <Shield className="h-5 w-5 text-purple-600" />
                3. Clasificaciones y Categorización
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Clasificación Biomédica:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {safeValue(displayData.clasificacion_nombre)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Clasificación de Riesgo:</span>
                    <Badge className={`${
                      displayData.riesgo_nombre?.toLowerCase().includes('alto')
                        ? 'bg-red-100 text-red-800'
                        : displayData.riesgo_nombre?.toLowerCase().includes('medio')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {safeValue(displayData.riesgo_nombre)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Registro INVIMA:</span>
                    <span className="font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">
                      {safeValue(displayData.registro_sanitario)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Archivos Disponibles:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {safeValue(displayData.cuenta_archivos, '0')} archivos
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: UBICACIÓN Y CONTEXTO OPERATIVO */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <MapPin className="h-5 w-5 text-green-600" />
                4. Ubicación y Contexto Operativo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sede:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.sede_nombre)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Servicio:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.servicio_nombre)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Área:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.area_nombre)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Piso:</span>
                    <span className="text-gray-800">{safeValue(displayData.piso)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sector:</span>
                    <span className="text-gray-800">{safeValue(displayData.sector)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Localización Actual:</span>
                    <span className="text-gray-800">{safeValue(displayData.localizacion_actual)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-semibold text-blue-800">Hospital:</span>
                <p className="text-sm text-blue-700 mt-1">
                  Hospital Universitario del Valle Evaristo García
                </p>
              </div>
            </div>

            {/* SECCIÓN 5: INFORMACIÓN FINANCIERA Y CONTRACTUAL */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                5. Información Financiera y Contractual
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Costo de Adquisición:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.costo)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipo de Adquisición:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.tipo_compra)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vida Útil Estimada:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.vida_util)} años
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Propietario Legal:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.propietario_nombre)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Número de Contrato:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.numero_contrato)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orden de Compra:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.orden_compra)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: CRONOLOGÍA DE FECHAS CRÍTICAS */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                6. Cronología de Fechas Críticas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">Fechas de Adquisición</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha de Adquisición:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_ad)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recepción Almacén:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_recepcion_almacen)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Acta de Recibo:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_acta_recibo)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">Fechas Operativas</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha de Instalación:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_instalacion)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Inicio de Operación:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_inicio_operacion)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entrega al Servicio:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_entrega_servicio)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">Fechas de Mantenimiento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Último Mantenimiento:</span>
                      <span className="text-gray-800">{formatDate(displayData.ultimo_mantenimiento)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Última Calibración:</span>
                      <span className="text-gray-800">{formatDate(displayData.ultima_calibracion)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha de Mantenimiento:</span>
                      <span className="text-gray-800">{formatDate(displayData.fecha_mantenimiento)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 7: ESTADO OPERATIVO Y DISPONIBILIDAD */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <Wrench className="h-5 w-5 text-orange-600" />
                7. Estado Operativo y Disponibilidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requiere Calibración:</span>
                    <Badge className={`${
                      displayData.calibracion?.toLowerCase() === 'si'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {safeValue(displayData.calibracion)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Evaluación Desempeño:</span>
                    <Badge className={`${
                      displayData.evaluacion_desempenio?.toLowerCase() === 'si'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {safeValue(displayData.evaluacion_desempenio)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Verificación Inventario:</span>
                    <Badge className={`${
                      displayData.verificacion_inventario?.toLowerCase() === 'verificado'
                        ? 'bg-green-100 text-green-800'
                        : displayData.verificacion_inventario?.toLowerCase() === 'nuevo'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {safeValue(displayData.verificacion_inventario)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status del Registro:</span>
                    <Badge className={`${
                      displayData.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {displayData.status ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado Mantenimiento:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.estado_mantenimiento)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan de Mantenimiento:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.plan)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 8: INFORMACIÓN DE AUDITORÍA Y TRAZABILIDAD */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <User className="h-5 w-5 text-indigo-600" />
                8. Información de Auditoría y Trazabilidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha de Creación:</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(displayData.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha de Cambio:</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(displayData.fecha_cambio)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usuario Creador:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.usuario_creador_nombre)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Periodicidad:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.periodicidad)}
                    </span>
                  </div>
                </div>
              </div>
              {displayData.observacion && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Observaciones:</span>
                  <p className="text-sm text-gray-600 mt-1">{displayData.observacion}</p>
                </div>
              )}
            </div>

            {/* SECCIÓN 9: DOCUMENTACIÓN Y ARCHIVOS DIGITALES */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                9. Documentación y Archivos Digitales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Archivos Disponibles:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {safeValue(displayData.cuenta_archivos, '0')} archivos
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manual Técnico:</span>
                    <span className="font-medium text-gray-800">
                      {displayData.manual ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Planos Técnicos:</span>
                    <span className="font-medium text-gray-800">
                      {displayData.plano ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Archivo Excel:</span>
                    <span className="font-medium text-gray-800">
                      {displayData.file ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Archivo INVIMA:</span>
                    <span className="font-medium text-gray-800">
                      {displayData.archivo_registro_sanitario ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accesorios:</span>
                    <span className="font-medium text-gray-800">
                      {safeValue(displayData.accesorios)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 10: INFORMACIÓN ADICIONAL */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-800 mb-4">
                <Info className="h-5 w-5 text-blue-600" />
                Información Adicional del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold text-gray-800">Estado General</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {displayData.status ? 'Sistema Activo' : 'Sistema Inactivo'}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔧</div>
                  <h4 className="font-semibold text-gray-800">Mantenimiento</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {displayData.ultimo_mantenimiento ? 'Registrado' : 'Sin registros'}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📋</div>
                  <h4 className="font-semibold text-gray-800">Documentación</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    {parseInt(displayData.cuenta_archivos || 0) > 0 ? 'Completa' : 'Incompleta'}
                  </p>
                </div>
              </div>
            </div>

            {/* Read-Only Notice */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    Modo Solo Lectura
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Esta vista es de solo consulta. Los datos se obtienen directamente de la base de datos del sistema EVA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

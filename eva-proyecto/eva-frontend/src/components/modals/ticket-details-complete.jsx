"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Building, FileText, FileSignature, Plus, Wrench, UserPlus, Printer, Calendar, User, Clock, AlertCircle, ExternalLink, Upload, File, Link, Image as ImageIcon, Pencil, Check } from "lucide-react";
import WorkOrderClosureModal from "./work-order-closure-modal";
import AddProgressModal from "./add-progress-modal";
import AssociateSparePart from "./associate-spare-part-modal";
import AssignResponsibleModal from "./assign-responsible-modal";
import AddDiagnosticoModal from "./add-diagnostico-modal";
import EnviarCierreModal from "./enviar-cierre-modal";
import ConfirmarCierreModal from "./confirmar-cierre-modal";
import EquipmentSearchModal from "./equipment-search-modal";
import { toast } from "sonner";
import httpService from "@/services/httpService";
import permissionService from "@/services/permissionService";
import { pdf } from '@react-pdf/renderer';
import TicketPDF from '../pdf/TicketPDF';

export default function TicketDetailsModal({ isOpen, onClose, ticket, onRefresh, readOnly = false }) {
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [showSparePartModal, setShowSparePartModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDiagnosticoModal, setShowDiagnosticoModal] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [showConfirmarCierreModal, setShowConfirmarCierreModal] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showEquipmentSearchModal, setShowEquipmentSearchModal] = useState(false);

  // Estados para edición de categoría
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [mantenimientoOptions, setMantenimientoOptions] = useState({ categorias: [], subcategorias: [] });
  const [selectedCategory, setSelectedCategory] = useState(ticket?.tipo_mantenimiento_id || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(ticket?.subcategoria_mantenimiento_id || "");

  // Estados para subir archivo de cierre
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Cargar datos completos SOLO al abrir el modal (no en cada renderizado)
  useEffect(() => {
    if (isOpen && ticket?.id) {
      console.log('🔄 Modal abierto - Cargando datos completos del ticket:', ticket.id);
      if (onRefresh) onRefresh();
      
      // Cargar opciones de mantenimiento
      loadMantenimientoOptions();
      
      // Sincronizar estados de edición
      setSelectedCategory(ticket.tipo_mantenimiento_id || "");
      setSelectedSubcategory(ticket.subcategoria_mantenimiento_id || "");
      setIsEditingCategory(false);
    }
  }, [isOpen]); // Solo cuando cambia isOpen (se abre/cierra el modal)

  const loadMantenimientoOptions = async () => {
    try {
      const response = await httpService.get('/v1/mantenimiento-options');
      if (response.data.success) {
        setMantenimientoOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar opciones de mantenimiento:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) {
      toast.error("Debe seleccionar al menos la categoría principal");
      return;
    }

    try {
      setIsUpdatingCategory(true);
      const res = await httpService.put(`/v1/gestion-tickets/${ticket.id}`, {
        tipo_mantenimiento_id: selectedCategory,
        subcategoria_mantenimiento_id: selectedSubcategory || null
      });

      if (res.data.success) {
        toast.success("Categoría actualizada correctamente");
        setIsEditingCategory(false);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      toast.error("Error al actualizar la categoría");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Función simple para cerrar modales sin recargar
  const handleModalClose = (modalSetter) => {
    modalSetter(false);
  };

  // Función para cerrar modal Y recargar datos (solo para modales que cambian el estado)
  const handleModalCloseWithRefresh = (modalSetter) => {
    modalSetter(false);
    if (onRefresh) {
      // Pequeño delay para que el backend procese
      setTimeout(() => {
        onRefresh();
      }, 300);
    }
  };

  // Función para marcar repuesto como instalado (cambiar condición a NO)
  const handleMarcarRepuestoInstalado = async () => {
    try {
      toast.loading('Marcando repuesto como instalado...', { id: 'instalar-repuesto' });

      const response = await httpService.post(`/v1/tickets/${ticket.id}/quitar-repuesto`);

      // Actualizar el ticket en tiempo real con la respuesta del backend
      if (response.data && response.data.data) {
        ticket.repuesto_pendiente = null;
        ticket.repuesto_pendiente_condicion = 'no';
        ticket.repuestos_usados = response.data.data.repuestos_usados;
      }

      toast.success('Repuesto marcado como instalado correctamente', { id: 'instalar-repuesto' });

      // Recargar datos del ticket en el fondo
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error al marcar repuesto como instalado:', error);
      toast.error('Error al marcar repuesto como instalado', { id: 'instalar-repuesto' });
    }
  };

  // Función para manejar selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo no debe superar los 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Función para subir archivo de cierre
  const handleUploadFile = async () => {
    if (!selectedFile) {
      toast.error("Por favor seleccione un archivo");
      return;
    }

    try {
      setIsUploadingFile(true);

      const formData = new FormData();
      formData.append('file_cierre', selectedFile);

      const response = await httpService.post(
        `/v1/tickets/${ticket.id}/upload-cierre-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success("Archivo subido y reemplazado exitosamente");
        setSelectedFile(null);
        // Recargar datos del ticket
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 300);
        }
      } else {
        toast.error(response.data.message || "Error al subir el archivo");
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast.error(error.response?.data?.message || "Error al subir el archivo");
    } finally {
      setIsUploadingFile(false);
    }
  };

  if (!isOpen || !ticket) return null;

  // Lógica basada únicamente en estado_id
  const isTicketOpen = ticket.estado_id === 1; // Abierto
  const isEstadoAsignado = ticket.estado_id === 2; // Asignado
  const tieneDiagnostico = ticket.estado_id === 3; // Diagnosticado
  const isTicketCerrado = ticket.estado_id === 4; // Cerrado
  const isEsperandoCierre = ticket.estado_id === 5; // Esperando cierre

  // Mostrar botón "Asignar Responsable" solo en estado Abierto (1)
  const mostrarBotonAsignarResponsable = isTicketOpen;

  // Mostrar botón "Agregar Diagnóstico" solo en estado Asignado (2)
  const mostrarBotonDiagnostico = isEstadoAsignado;

  // Mostrar botón "Enviar a Cierre" desde estado Asignado (2) y Diagnosticado (3)
  const mostrarBotonEnviarCierre = isEstadoAsignado || tieneDiagnostico;

  // Mostrar botón "Asociar Equipo" solo si el ticket fue creado manualmente (sin equipo_id)
  // y no está cerrado
  const mostrarBotonAsociarEquipo = !ticket.equipo_id && !isTicketCerrado;

  // Debug en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🎫 Ticket Debug:', {
      id: ticket.id,
      estado_id: ticket.estado_id,
      isTicketOpen,
      isEstadoAsignado,
      tieneDiagnostico,
      isTicketCerrado,
      isEsperandoCierre,
      mostrarBotonAsignarResponsable,
      mostrarBotonDiagnostico,
      mostrarBotonEnviarCierre
    });
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Cerrado":
        return "bg-green-100 text-green-800 border-green-200";
      case "En Proceso":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "Abierto":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para asociar equipo a ticket creado manualmente
  const handleAssociateEquipment = async (equipment) => {
    try {
      console.log('🔗 Asociando equipo al ticket:', { ticketId: ticket.id, equipment });

      // Enviar al backend para actualizar en la BD
      const response = await httpService.put(`/v1/gestion-tickets/${ticket.id}`, {
        equipo_id: equipment.id,
        codigo_equipo: equipment.code,
        nombre_equipo: equipment.name,
        marca_equipo: equipment.marca,
        modelo_equipo: equipment.modelo,
        serie_equipo: equipment.serial
      });

      if (response.data.success) {
        toast.success('✅ Equipo asociado exitosamente');
        setShowEquipmentSearchModal(false);

        // Recargar datos del ticket desde la BD
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
          }, 300);
        }
      } else {
        toast.error(response.data.message || 'Error al asociar el equipo');
      }
    } catch (error) {
      console.error('Error asociando equipo:', error);
      toast.error(error.response?.data?.message || 'Error al asociar el equipo al ticket');
    }
  };

  const handlePrint = async () => {
    setShowPrintConfirm(false); // Cerrar modal de confirmación

    try {
      // Generar PDF usando react-pdf/renderer
      const blob = await pdf(<TicketPDF ticket={ticket} />).toBlob();

      // Crear URL del blob
      const url = URL.createObjectURL(blob);

      // Abrir en nueva ventana para imprimir
      const printWindow = window.open(url, '_blank');

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      // Limpiar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      toast.success('PDF generado correctamente', {
        description: 'El documento está listo para imprimir',
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el PDF', {
        description: error.message,
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="min-w-[80vw] w-auto h-auto max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-lg scrollbar-slim"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Detalle del Ticket #{ticket?.id}</DialogTitle>

          {/* Header simple del modal */}
          <div className="text-white px-6 py-4 sticky top-0 z-10 flex items-center justify-between" style={{ backgroundColor: '#1D293D' }}>
            <h2 className="text-lg font-bold">DETALLE DEL TICKET</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:opacity-80"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Botones de Acción */}
          <div className="bg-gray-50 border-b p-4">

            {/* Botones de Acción - NO mostrar si el ticket está cerrado O si es readOnly */}
            {!readOnly && (
              <>
                {/* Botón especial: Confirmar Cierre (solo cuando está en estado "Esperando cierre") */}
                {!isTicketCerrado && isEsperandoCierre && (
                  <div className="flex justify-center pt-3 border-t">
                    <Button
                      onClick={() => setShowConfirmarCierreModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Confirmar Cierre del Ticket
                    </Button>
                  </div>
                )}

                {/* Botones de acciones - Todos en una sola fila horizontal */}
                {!isTicketCerrado && (
                  <div className="flex flex-wrap justify-center gap-2 pt-3 border-t">
                    {/* Botón Asignar Responsable - Solo en estado Abierto */}
                    {mostrarBotonAsignarResponsable && (
                      <Button
                        onClick={() => setShowAssignModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Asignar Responsable
                      </Button>
                    )}

                    {/* Botón Agregar Avance - Siempre visible mientras no esté cerrado */}
                    <Button
                      onClick={() => setShowAddProgressModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Avance
                    </Button>

                    {/* Botón Asociar Repuesto - Solo mostrar si NO tiene repuesto pendiente Y condición no es 'no' */}
                    {!ticket.repuesto_pendiente && ticket.repuesto_pendiente_condicion !== 'no' && (
                      <Button
                        onClick={() => setShowSparePartModal(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        size="sm"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Asociar Repuesto
                      </Button>
                    )}

                    {/* Botón Definir Repuesto como Instalado - Solo mostrar si tiene repuesto pendiente activo */}
                    {ticket.repuesto_pendiente && ticket.repuesto_pendiente_condicion === 'si' && (
                      <Button
                        onClick={handleMarcarRepuestoInstalado}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Definir repuesto como instalado
                      </Button>
                    )}

                    {/* Botón Asociar Equipo - Solo para tickets creados manualmente sin equipo */}
                    {mostrarBotonAsociarEquipo && (
                      <Button
                        onClick={() => setShowEquipmentSearchModal(true)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        size="sm"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Asociar Equipo
                      </Button>
                    )}

                    {/* Botón Agregar Diagnóstico - Solo en estado Asignado */}
                    {mostrarBotonDiagnostico && (
                      <Button
                        onClick={() => setShowDiagnosticoModal(true)}
                        className="text-white hover:opacity-90"
                        style={{ backgroundColor: '#1D293D' }}
                        size="sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Agregar Diagnóstico
                      </Button>
                    )}

                    {/* Botón Enviar a Cierre - Desde estado Asignado */}
                    {mostrarBotonEnviarCierre && (
                      <Button
                        onClick={() => setShowCierreModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Enviar a Cierre
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Mensaje informativo cuando está en modo solo lectura */}
            {readOnly && (
              <div className="flex justify-center pt-3 border-t">
                <div className="border rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D', color: '#1D293D' }}>
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Modo solo lectura - Para realizar cambios, acceda a "Gestión de Tickets"
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Diseño tipo talonario */}
            <div className="bg-white border-4 border-gray-500 mb-6 shadow-md rounded-2xl overflow-hidden">
              {/* Encabezado talonario con logo */}
              <div className="flex items-start justify-between p-4 border-b-4" style={{ borderColor: '#1D293D' }}>
                {/* Logo HUV */}
                <div className="flex-shrink-0 mr-4">
                  <img
                    src="/images/logo_huv.jpg"

                    alt="Logo HUV"
                    className="w-[140px] h-[140px] "
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://www.huv.gov.co/wp-content/uploads/2020/01/logo-huv.png';
                    }}
                  />
                </div>

                {/* Título centrado */}
                <div className="flex-1 text-center pt-2">
                  <h1 className="font-bold text-base" style={{ color: '#1D293D' }}>Hospital Universitario del Valle Evaristo García</h1>
                  <p className="text-xs text-gray-600 mt-1">Sistema de Gestión de Mantenimiento</p>
                </div>

                {/* OT a la derecha */}
                <div className="border-3 px-4 py-2 text-center min-w-[140px] rounded-xl shadow-sm" style={{ borderColor: '#1D293D', backgroundColor: '#f0f4f8' }}>
                  <p className="text-[10px] font-semibold uppercase" style={{ color: '#1D293D' }}>Orden de Trabajo</p>
                  <p className="text-2xl font-bold" style={{ color: '#1D293D' }}># {ticket.id}</p>
                  <p className="text-[10px] text-gray-600 mt-1">Fecha inicio</p>
                  <p className="text-xs font-medium text-gray-800">{ticket.fecha_inicio ? new Date(ticket.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>

              {/* Fila: Sede, Servicio, Área */}
              <div className="grid grid-cols-3 border-b-2 border-gray-500">
                <div className="border-r-2 border-gray-500 px-3 py-2 bg-white">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">SEDE</p>
                  <p className="text-xs text-gray-900">{ticket.sede_nombre || 'SEDE PRINCIPAL'}</p>
                </div>
                <div className="border-r-2 border-gray-500 px-3 py-2 bg-white">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">SERVICIO</p>
                  <p className="text-xs text-gray-900">{ticket.servicio_nombre || 'CONTRATACIÓN'}</p>
                </div>
                <div className="px-3 py-2 bg-white">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">ÁREA</p>
                  <p className="text-xs text-gray-900">{ticket.area_nombre || 'Datos no disponibles'}</p>
                </div>
              </div>

              {/* Datos del encabezado integrados */}
              <div className="grid grid-cols-3 gap-px bg-gray-500 border-b-2 border-gray-500">
                <div className="bg-white px-3 py-2">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">Centro de costo</p>
                  <p className="text-xs text-gray-900">CC-{ticket.id}</p>
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">O.T. #</p>
                  <p className="text-xs text-gray-900">OT-{ticket.id}</p>
                </div>
                <div className="bg-white px-3 py-2">
                  <p className="text-[10px] font-bold text-gray-700 uppercase mb-1">Fecha</p>
                  <p className="text-xs text-gray-900">{ticket.fecha_inicio ? new Date(ticket.fecha_inicio).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Equipo */}
            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">INFORMACIÓN DEL EQUIPO</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Equipo *</label>
                  <p className="text-sm font-medium text-gray-900 mt-2">{ticket.equipo_final || ticket.equipo || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Modelo *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.modelo_final || ticket.equipo?.split(' ').slice(-1)[0] || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Serie *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.serie_final || `SN-${ticket.id}001`}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Marca *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.marca_final || ticket.equipo?.split(' ')[0] || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">No. Inventario *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.codigo_final || `INV-${ticket.id}`}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Solicitado por *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.reportante_nombre || ticket.creadoPor || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Correo electrónico *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.reportante_email || 'Datos no disponibles'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">TIPO DE ARREGLO *</label>
                  <p className="text-sm text-gray-900 mt-2 uppercase">{ticket.tipo || ticket.origen || 'Datos no disponibles'}</p>
                </div>
                {/* Visualización de Categoría (Solo si no estamos editando) */}
                {!isEditingCategory && (
                  <div className="border-l-2 border-orange-400 pl-3 rounded-lg relative group min-h-[50px]">
                    <label className="text-xs font-bold text-orange-600 uppercase tracking-wide border-b border-orange-300 pb-1 mb-2 flex items-center justify-between">
                      Categoría Mantenimiento
                      {permissionService.isAdmin() && (
                        <button 
                          onClick={() => setIsEditingCategory(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-100 rounded text-orange-600"
                          title="Editar categoría"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </label>
                    <div className="space-y-3 mt-2">
                       <div>
                         <p className="text-sm text-gray-900 font-medium">{ticket.tipo_mantenimiento_nombre || "No asignada"}</p>
                       </div>
                       {ticket.subcategoria_mantenimiento_nombre && (
                         <div>
                           <label className="text-[10px] font-bold text-orange-600 uppercase tracking-tight block border-b border-orange-100 mb-1">Subcategoría</label>
                           <p className="text-sm text-gray-900 font-medium">{ticket.subcategoria_mantenimiento_nombre}</p>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {/* Formulario de Edición de Categoría */}
                {isEditingCategory && (
                  <div className="col-span-full bg-orange-50 border border-orange-200 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-orange-700 uppercase flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Editar Categorización
                      </h4>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-orange-700 hover:bg-orange-100 px-2"
                          onClick={() => setIsEditingCategory(false)}
                          disabled={isUpdatingCategory}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 bg-orange-600 hover:bg-orange-700 text-white px-3 flex items-center gap-1 shadow-sm"
                          onClick={handleUpdateCategory}
                          disabled={isUpdatingCategory}
                        >
                          {isUpdatingCategory ? (
                            <Clock className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          {isUpdatingCategory ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-orange-600 uppercase ml-1">Categoría Principal</label>
                        <select 
                          className="w-full bg-white border border-orange-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all shadow-sm"
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubcategory(""); // Reset subcat when cat changes
                          }}
                        >
                          <option value="">Seleccione una categoría</option>
                          {mantenimientoOptions.categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-orange-600 uppercase ml-1">Subcategoría</label>
                        <select 
                          className="w-full bg-white border border-orange-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all shadow-sm"
                          value={selectedSubcategory}
                          onChange={(e) => setSelectedSubcategory(e.target.value)}
                        >
                          <option value="">Seleccione una subcategoría</option>
                          {mantenimientoOptions.subcategorias
                            .filter(sub => sub.id_padre == selectedCategory)
                            .map(sub => (
                              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Última Localización *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.localizacion_actual || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Responsable Mantenimiento *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.responsable_mantenimiento || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Estado Actual del Equipo *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.estado_equipo_nombre || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between">
                  DESCRIPCIÓN DEL PROBLEMA
                  {ticket.image && (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001"}/storage/correctivos_generales/${ticket.image.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 flex items-center text-sm font-normal"
                      style={{ color: '#1D293D' }}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Ver evidencia
                    </a>
                  )}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Descripción del problema presentado *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.descripcion || ticket.description || 'Datos no disponibles'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Empresa Asignada *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.empresa_nombre || 'Hospital Universitario del Valle'}</p>
                  <p className="text-xs text-gray-600 mt-1">Asignado por: <span className="font-medium">
                    {ticket.usuario_asigno_nombre
                      ? `${ticket.usuario_asigno_nombre} ${ticket.usuario_asigno_apellido || ''}`.trim()
                      : 'N/A'}
                  </span></p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Asignación específica *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.asignado_nombre || ticket.asignadoA || 'No asignado'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de asignación *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.fecha_asignacion ? new Date(ticket.fecha_asignacion).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                </div>
              </div>
            </div>

            {/* Diagnóstico */}
            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between">
                  DIAGNÓSTICO
                  {ticket.file_diagnostico && (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/correctivos_generales/${ticket.file_diagnostico.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 flex items-center text-sm font-normal"
                      style={{ color: '#1D293D' }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver documento
                    </a>
                  )}
                </h3>
              </div>
              <div className="border-l-2 border-gray-400 pl-3 rounded-lg col-span-2 mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Diagnóstico *</label>
                <p className="text-sm text-gray-900 mt-2">{ticket.diagnostico || ticket.retro_diagnostico || 'Datos no disponibles'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Repuestos necesarios *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.repuesto_pendiente || ticket.repuestos_usados || ticket.repuestos_diagnostico || 'N/A'}</p>
                  {ticket.repuesto_pendiente_condicion && (
                    <p className="text-xs text-gray-600 mt-1">Condición: <span className="font-medium uppercase">{ticket.repuesto_pendiente_condicion}</span></p>
                  )}
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Responsable del diagnóstico *</label>
                  <p className="text-sm text-gray-900 mt-2">
                    {ticket.tecnico_diagnostico_text ||
                      `${ticket.nombre_tecnico_diagnostico || ''} ${ticket.apellido_tecnico_diagnostico || ''}`.trim() ||
                      ticket.asignado_nombre ||
                      'Datos no disponibles'}
                  </p>
                </div>
              </div>

              {/* Subsección: Tiempo de ejecución */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Tiempo de ejecución</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de inicio *</label>
                    <p className="text-sm text-gray-900 mt-2">{ticket.fecha_diagnostico ? new Date(ticket.fecha_diagnostico).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                  </div>
                  <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de finalización *</label>
                    <p className="text-sm text-gray-900 mt-2">{ticket.fecha_diagnostico ? new Date(ticket.fecha_diagnostico).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trabajo Realizado */}
            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between">
                  TRABAJO REALIZADO
                  {ticket.file_cierre && (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/correctivos_generales/${ticket.file_cierre}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 flex items-center text-sm font-normal"
                      style={{ color: '#1D293D' }}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ver documento
                    </a>
                  )}
                </h3>
              </div>

              {/* Sección para anexar archivo (solo si está en estado Esperando cierre) */}
              {ticket.estado_id === 5 && (
                <div className="border p-4 rounded-lg mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                  <div className="flex items-start gap-3">
                    <Upload className="w-5 h-5 mt-1" style={{ color: '#1D293D' }} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2" style={{ color: '#1D293D' }}>
                        {ticket.file_cierre ? 'Reemplazar Documento de Trabajo Realizado' : 'Anexar Documento de Trabajo Realizado'}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: '#1D293D' }}>
                        {ticket.file_cierre
                          ? 'Ya existe un documento. Si sube uno nuevo, el anterior será reemplazado permanentemente.'
                          : 'Suba el documento firmado o con información adicional del trabajo realizado.'}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <input
                            type="file"
                            id="file-cierre-upload"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            className="hidden"
                          />
                          <label
                            htmlFor="file-cierre-upload"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg cursor-pointer hover:opacity-80 transition-colors text-sm"
                            style={{ borderColor: '#1D293D' }}
                          >
                            <File className="w-4 h-4" />
                            {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                          </label>
                        </div>

                        {selectedFile && (
                          <Button
                            onClick={handleUploadFile}
                            disabled={isUploadingFile}
                            className="text-white hover:opacity-90"
                            style={{ backgroundColor: '#1D293D' }}
                          >
                            {isUploadingFile ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Archivo
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <p className="text-xs mt-2" style={{ color: '#1D293D' }}>
                        Formatos: PDF, Word, Excel, Imágenes. Máximo 10MB.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="border-l-2 border-gray-400 pl-3 rounded-lg col-span-2 mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Tipo y descripción del trabajo realizado *</label>
                <p className="text-sm text-gray-900 mt-2">{ticket.reparacion || ticket.retro_cierre || 'Datos no disponibles'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Repuestos instalados *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.repuestos_usados || ticket.repuestos || 'Datos no disponibles'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Responsable de la reparación *</label>
                  <p className="text-sm text-gray-900 mt-2">
                    {ticket.tecnico_cierre_text ||
                      `${ticket.nombre_tecnico_cierre || ''} ${ticket.apellido_tecnico_cierre || ''}`.trim() ||
                      'Datos no disponibles'}
                  </p>
                </div>
              </div>

              {/* Subsección: Tiempo de ejecución */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase">Tiempo de ejecución</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de inicio *</label>
                    <p className="text-sm text-gray-900 mt-2">{ticket.fecha_asignacion_cierre ? new Date(ticket.fecha_asignacion_cierre).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                  </div>
                  <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de finalización *</label>
                    <p className="text-sm text-gray-900 mt-2">{ticket.fecha_fin ? new Date(ticket.fecha_fin).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Avances del Trabajo */}
            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  AVANCES DEL TRABAJO
                </h3>
              </div>
              <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Estado del trabajo + observaciones *</label>
                {ticket.avances && ticket.avances.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {ticket.avances.map((avance, index) => (
                      <div key={avance.id || index} className="border-l-2 border-gray-300 pl-3 py-2 bg-gray-50">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{avance.fecha || avance.date || avance.created_at ? new Date(avance.fecha || avance.date || avance.created_at).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          {' - '}
                          {avance.descripcion || avance.observacion || avance.description}
                        </p>
                        {avance.usuario_nombre && (
                          <p className="text-xs text-gray-500 mt-1">Por: {avance.usuario_nombre}</p>
                        )}
                        {avance.file && (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/correctivos_generales/${avance.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 flex items-center text-xs mt-1"
                            style={{ color: '#1D293D' }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Ver archivo
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900 mt-2">No hay avances registrados aún.</p>
                )}
              </div>
            </div>

            {/* Cierre */}
            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">CIERRE</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de solicitud de cierre *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.fecha_asignacion_cierre ? new Date(ticket.fecha_asignacion_cierre).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Fecha de cierre *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.fecha_fin ? new Date(ticket.fecha_fin).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Datos no disponibles'}</p>
                </div>
              </div>

              {/* Firmas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-gray-400 p-4 rounded-xl shadow-sm" style={{ minHeight: '150px' }}>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Firma del Técnico *</label>
                  <div className="mt-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    <div className="h-20 flex items-center justify-center">
                      {ticket.firma_tecnico ? (
                        <img src={ticket.firma_tecnico} alt="Firma Técnico" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <p className="text-xs text-gray-400">Sin firma</p>
                      )}
                    </div>
                    {ticket.firma_tecnico_nombre && (
                      <div className="border-t border-gray-300 p-2 bg-white text-center">
                        <p className="text-sm font-semibold text-gray-800">{ticket.firma_tecnico_nombre}</p>
                        {ticket.firma_tecnico_fecha && (
                          <p className="text-xs text-gray-500">{new Date(ticket.firma_tecnico_fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-2 border-gray-400 p-4 rounded-xl shadow-sm" style={{ minHeight: '150px' }}>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Firma de Recibido *</label>
                  <div className="mt-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                    <div className="h-20 flex items-center justify-center">
                      {ticket.firma_recibido ? (
                        <img src={ticket.firma_recibido} alt="Firma Recibido" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <p className="text-xs text-gray-400">Sin firma</p>
                      )}
                    </div>
                    {ticket.firma_recibido_nombre && (
                      <div className="border-t border-gray-300 p-2 bg-white text-center">
                        <p className="text-sm font-semibold text-gray-800">{ticket.firma_recibido_nombre}</p>
                        {ticket.firma_recibido_fecha && (
                          <p className="text-xs text-gray-500">{new Date(ticket.firma_recibido_fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Estado Actual */}
            <div className="mb-6">
              <div className="border-l-4 p-3 mb-4" style={{ backgroundColor: '#f0f4f8', borderColor: '#1D293D' }}>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">ESTADO ACTUAL</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Estado *</label>
                  <p className="text-sm text-gray-900 mt-2">
                    <Badge className={`${getStatusColor(ticket.estado_descripcion || ticket.estado)} border text-sm`}>
                      {ticket.estado_descripcion || ticket.estado || 'N/A'}
                    </Badge>
                  </p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Prioridad *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.prioridad_texto || ticket.prioridad || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Origen *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.origen || 'N/A'}</p>
                </div>
                <div className="border-l-2 border-gray-400 pl-3 rounded-lg">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide border-b border-gray-300 pb-1 mb-2 block">Total avances *</label>
                  <p className="text-sm text-gray-900 mt-2">{ticket.total_avances || ticket.avances?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-400 pt-4 mt-6 text-center">
              <p className="text-xs text-gray-700 mb-2">
                Estoy de acuerdo en que todo el trabajo se ha realizado satisfactoriamente.
              </p>
              <p className="text-xs text-gray-600">
                Hospital Universitario del Valle - Sistema EVA - <strong>¡Eva Tickets!</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button onClick={() => setShowPrintConfirm(true)} className="text-white hover:opacity-90" style={{ backgroundColor: '#1D293D' }}>
                <FileText className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              {/* TODO: Botón deshabilitado - Las firmas ahora se integran en el modal de Enviar a Cierre
            <Button 
              onClick={() => setIsWorkOrderModalOpen(true)} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileSignature className="w-4 h-4 mr-2" />
              Generar Orden Firmada
            </Button>
            */}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Orden de Cierre con Firma */}
      <WorkOrderClosureModal
        open={isWorkOrderModalOpen}
        onOpenChange={setIsWorkOrderModalOpen}
        workOrder={ticket}
      />

      {/* Modales de Acciones */}
      <AddProgressModal
        isOpen={showAddProgressModal}
        onClose={() => handleModalCloseWithRefresh(setShowAddProgressModal)}
        ticketId={ticket.id}
      />

      <AssociateSparePart
        isOpen={showSparePartModal}
        onClose={() => handleModalCloseWithRefresh(setShowSparePartModal)}
        ticketId={ticket.id}
        hasSpare={false}
        currentSpareName={''}
      />

      <AssignResponsibleModal
        isOpen={showAssignModal}
        onClose={() => handleModalCloseWithRefresh(setShowAssignModal)}
        ticketId={ticket.id}
      />

      <AddDiagnosticoModal
        isOpen={showDiagnosticoModal}
        onClose={() => handleModalCloseWithRefresh(setShowDiagnosticoModal)}
        ticketId={ticket.id}
      />

      <EnviarCierreModal
        isOpen={showCierreModal}
        onClose={() => handleModalCloseWithRefresh(setShowCierreModal)}
        ticketId={ticket.id}
        ticketCode={ticket.code || ticket.codigo || ''}
      />

      <ConfirmarCierreModal
        isOpen={showConfirmarCierreModal}
        onClose={() => handleModalCloseWithRefresh(setShowConfirmarCierreModal)}
        ticketId={ticket.id}
      />

      <EquipmentSearchModal
        isOpen={showEquipmentSearchModal}
        onClose={() => setShowEquipmentSearchModal(false)}
        onSelectEquipment={handleAssociateEquipment}
        ticketType={
          ticket.origen?.toLowerCase().includes('biom') ? 'biomedico' :
            ticket.origen?.toLowerCase().includes('indus') ? 'industrial' :
              ticket.origen?.toLowerCase().includes('infra') ? 'infraestructura' :
                'biomedico'
        }
      />

      {/* Modal de confirmación de impresión */}
      <Dialog open={showPrintConfirm} onOpenChange={setShowPrintConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Confirmar Impresión</DialogTitle>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f4f8' }}>
              <FileText className="w-8 h-8" style={{ color: '#1D293D' }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Imprimir Ticket
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Desea imprimir el detalle completo del ticket #{ticket.id}?
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setShowPrintConfirm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 text-white hover:opacity-90"
                style={{ backgroundColor: '#1D293D' }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
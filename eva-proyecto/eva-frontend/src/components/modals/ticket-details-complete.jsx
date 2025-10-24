"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Building, FileText, FileSignature, Plus, Wrench, UserPlus, Printer, Calendar, User, Clock, AlertCircle, ExternalLink, Upload, File } from "lucide-react";
import WorkOrderClosureModal from "./work-order-closure-modal";
import AddProgressModal from "./add-progress-modal";
import AssociateSparePart from "./associate-spare-part-modal";
import AssignResponsibleModal from "./assign-responsible-modal";
import AddDiagnosticoModal from "./add-diagnostico-modal";
import EnviarCierreModal from "./enviar-cierre-modal";
import ConfirmarCierreModal from "./confirmar-cierre-modal";
import { toast } from "sonner";
import httpService from "@/services/httpService";

export default function TicketDetailsModal({ isOpen, onClose, ticket, onRefresh }) {
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);
  const [showSparePartModal, setShowSparePartModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDiagnosticoModal, setShowDiagnosticoModal] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);
  const [showConfirmarCierreModal, setShowConfirmarCierreModal] = useState(false);
  
  // Estados para subir archivo de cierre
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Cargar datos completos SOLO al abrir el modal (no en cada renderizado)
  useEffect(() => {
    if (isOpen && ticket?.id && onRefresh) {
      console.log('🔄 Modal abierto - Cargando datos completos del ticket:', ticket.id);
      onRefresh();
    }
  }, [isOpen]); // Solo cuando cambia isOpen (se abre/cierra el modal)

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
        toast.success("Archivo subido exitosamente");
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

  // Verificar si el ticket está abierto - puede venir como estado_descripcion, estado, o status
  const estadoTicket = ticket.estado_descripcion || ticket.estado || ticket.status || "";
  const isTicketOpen = estadoTicket.toLowerCase().includes("abierto") || ticket.estado_id === 1;
  
  // Verificar si el ticket tiene responsable asignado
  const tieneResponsable = ticket.asignado_id || ticket.asignado_nombre;
  
  // Verificar si el ticket está en estado "Asignado" (estado_id = 2)
  const isEstadoAsignado = ticket.estado_id === 2 || estadoTicket.toLowerCase().includes("asignado");
  
  // Verificar si el ticket está esperando cierre (estado_id = 5)
  const isEsperandoCierre = ticket.estado_id === 5 || estadoTicket.toLowerCase().includes("esperando cierre");
  
  // Verificar si el ticket tiene diagnóstico (estado_id = 3)
  const tieneDiagnostico = ticket.estado_id === 3 || estadoTicket.toLowerCase().includes("diagnosticado");
  
  // ✅ Verificar si el ticket está cerrado (estado_id = 4)
  const isTicketCerrado = ticket.estado_id === 4 || estadoTicket.toLowerCase().includes("cerrado");
  
  // Mostrar botones de diagnóstico y cierre SOLO si está asignado Y NO tiene diagnóstico Y NO está esperando cierre
  const mostrarBotonesDiagnosticoYCierre = (isEstadoAsignado || tieneResponsable) && !tieneDiagnostico && !isEsperandoCierre;
  
  // Debug en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🎫 Ticket Debug:', {
      id: ticket.id,
      estado_id: ticket.estado_id,
      estado_descripcion: ticket.estado_descripcion,
      isTicketOpen,
      tieneResponsable,
      isEstadoAsignado,
      mostrarBotonesDiagnosticoYCierre,
      asignado_id: ticket.asignado_id,
      asignado_nombre: ticket.asignado_nombre,
      isEsperandoCierre
    });
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Cerrado":
        return "bg-green-100 text-green-800 border-green-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Abierto":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handlePrint = () => {
    if (window.confirm('¿Desea imprimir el detalle completo del ticket?')) {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Orden de Trabajo #${ticket.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          padding: 15mm; 
          font-size: 10px;
          line-height: 1.3;
        }
        
        .header-talonario {
          display: grid;
          grid-template-columns: 120px 1fr 180px;
          align-items: center;
          gap: 15px;
          padding-bottom: 10px;
          border-bottom: 3px solid #2563eb;
          margin-bottom: 12px;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logo-huv {
          width: 90px;
          height: auto;
        }
        
        .title-container {
          text-align: center;
        }
        
        .title-container h1 {
          font-size: 15px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 2px;
        }
        
        .title-container h2 {
          font-size: 13px;
          color: #64748b;
          font-weight: normal;
        }
        
        .ot-container {
          background: #eff6ff;
          border: 2px solid #2563eb;
          border-radius: 4px;
          padding: 8px;
          text-align: center;
        }
        
        .ot-label {
          font-size: 11px;
          color: #2563eb;
          font-weight: bold;
          letter-spacing: 1px;
        }
        
        .ot-number {
          font-size: 18px;
          font-weight: bold;
          color: #1e3a8a;
          margin-top: 2px;
        }
        
        .ot-date {
          font-size: 8px;
          color: #64748b;
          margin-top: 2px;
        }
        
        .main-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .info-box {
          border: 1px solid #cbd5e1;
          border-radius: 3px;
          padding: 6px 8px;
          background: #f8fafc;
        }
        
        .info-label {
          font-size: 8px;
          color: #64748b;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 3px;
        }
        
        .info-value {
          font-size: 10px;
          color: #0f172a;
          font-weight: 500;
        }
        
        .section {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        
        .section-header {
          background: linear-gradient(to right, #1e40af, #3b82f6);
          color: white;
          padding: 5px 10px;
          font-weight: bold;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        
        .section-content {
          padding: 8px;
          background: white;
        }
        
        .section-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        
        .section-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        
        .section-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }
        
        .field {
          border-left: 2px solid #e2e8f0;
          padding-left: 6px;
        }
        
        .field-label {
          font-size: 7px;
          color: #64748b;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        
        .field-value {
          font-size: 9px;
          color: #0f172a;
        }
        
        .full-width {
          grid-column: span 4;
        }
        
        .half-width {
          grid-column: span 2;
        }
        
        .firma-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 8px;
        }
        
        .firma-box {
          border: 2px solid #cbd5e1;
          border-radius: 4px;
          padding: 8px;
          text-align: center;
          background: #fafafa;
        }
        
        .firma-title {
          font-size: 8px;
          font-weight: bold;
          color: #475569;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        
        .firma-image {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px dashed #cbd5e1;
          border-radius: 3px;
          margin-bottom: 5px;
        }
        
        .firma-image img {
          max-height: 55px;
          max-width: 100%;
        }
        
        .firma-nombre {
          font-size: 9px;
          font-weight: bold;
          color: #0f172a;
          padding-top: 5px;
          border-top: 1px solid #e2e8f0;
        }
        
        .firma-fecha {
          font-size: 7px;
          color: #64748b;
          margin-top: 2px;
        }
        
        .footer {
          margin-top: 15px;
          padding-top: 8px;
          border-top: 2px solid #cbd5e1;
          text-align: center;
          font-size: 8px;
          color: #64748b;
        }
        
        .footer-line {
          margin: 2px 0;
        }
        
        @media print {
          body { padding: 5mm; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header-talonario">
        <div class="logo-container">
          <img src="/images/logo_huv.jpg" alt="Logo HUV" class="logo-huv" />
        </div>
        
        <div class="title-container">
          <h1>Hospital Universitario del Valle Evaristo García</h1>
          <h2>Sistema de Gestión de Mantenimiento</h2>
        </div>
        
        <div class="ot-container">
          <div class="ot-label">ORDEN DE TRABAJO</div>
          <div class="ot-number"># ${ticket.id || 'N/A'}</div>
          <div class="ot-date">Fecha ${new Date().toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit', year: 'numeric'})}</div>
        </div>
      </div>

      <div class="main-info">
        <div class="info-box">
          <div class="info-label">Sede</div>
          <div class="info-value">${ticket.sede_nombre || 'N/A'}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Servicio</div>
          <div class="info-value">${ticket.servicio_nombre || ticket.origin || 'N/A'}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Área</div>
          <div class="info-value">${ticket.area_nombre || ticket.area || 'N/A'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">INFORMACIÓN DEL EQUIPO</div>
        <div class="section-content">
          <div class="section-grid">
            <div class="field">
              <div class="field-label">Equipo</div>
              <div class="field-value">${ticket.equipo_final || ticket.nombre_equipo || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Marca</div>
              <div class="field-value">${ticket.marca_final || ticket.marca_equipo || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Modelo</div>
              <div class="field-value">${ticket.modelo_final || ticket.modelo_equipo || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Serie</div>
              <div class="field-value">${ticket.serie_final || ticket.serie_equipo || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">No. Inventario</div>
              <div class="field-value">${ticket.codigo_final || ticket.codigo_equipo || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Solicitado por</div>
              <div class="field-value">${ticket.reportante_nombre || ticket.creadoPor || 'N/A'}</div>
            </div>
            <div class="field half-width">
              <div class="field-label">Correo electrónico</div>
              <div class="field-value">${ticket.reportante_email || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">DESCRIPCIÓN DEL PROBLEMA</div>
        <div class="section-content">
          <div class="section-grid">
            <div class="field full-width">
              <div class="field-label">Descripción del problema presentado</div>
              <div class="field-value">${ticket.problema_descripcion || ticket.description || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Empresa Asignada</div>
              <div class="field-value">${ticket.empresa_nombre || 'HUV MANTENIMIENTO BIOMÉDICO'}</div>
            </div>
            <div class="field">
              <div class="field-label">Asignado a</div>
              <div class="field-value">${ticket.asignado_nombre || ticket.asignadoA || 'No asignado'}</div>
            </div>
            <div class="field half-width">
              <div class="field-label">Fecha de asignación</div>
              <div class="field-value">${ticket.fecha_asignacion_usuario ? new Date(ticket.fecha_asignacion_usuario).toLocaleString('es-CO') : 'Pendiente'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">DIAGNÓSTICO</div>
        <div class="section-content">
          <div class="section-grid">
            <div class="field half-width">
              <div class="field-label">Diagnóstico</div>
              <div class="field-value">${ticket.diagnostico || 'Pendiente'}</div>
            </div>
            <div class="field half-width">
              <div class="field-label">Repuestos necesarios</div>
              <div class="field-value">${ticket.repuestos_diagnostico || 'Por determinar'}</div>
            </div>
            <div class="field">
              <div class="field-label">Responsable diagnóstico</div>
              <div class="field-value">${ticket.tecnico_diagnostico_text || ticket.asignado_nombre || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Tiempo ejecución</div>
              <div class="field-value">${ticket.tiempo_diagnostico || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Fecha Inicio</div>
              <div class="field-value">${ticket.fecha_diagnostico ? new Date(ticket.fecha_diagnostico).toLocaleString('es-CO') : 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Fecha finalización</div>
              <div class="field-value">${ticket.fecha_diagnostico ? new Date(ticket.fecha_diagnostico).toLocaleString('es-CO') : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">TRABAJO REALIZADO</div>
        <div class="section-content">
          <div class="section-grid">
            <div class="field half-width">
              <div class="field-label">Tipo y descripción del trabajo realizado</div>
              <div class="field-value">${ticket.reparacion || 'Pendiente'}</div>
            </div>
            <div class="field half-width">
              <div class="field-label">Repuestos instalados</div>
              <div class="field-value">${ticket.repuestos_instalados || 'Ninguno'}</div>
            </div>
            <div class="field">
              <div class="field-label">Responsable reparación</div>
              <div class="field-value">${ticket.tecnico_cierre_text || ticket.asignado_nombre || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Tiempo ejecución</div>
              <div class="field-value">${ticket.tiempo_reparacion || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Fecha Inicio</div>
              <div class="field-value">${ticket.fecha_asignacion_cierre ? new Date(ticket.fecha_asignacion_cierre).toLocaleString('es-CO') : 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Fecha finalización</div>
              <div class="field-value">${ticket.fecha_cierre_confirmado ? new Date(ticket.fecha_cierre_confirmado).toLocaleString('es-CO') : 'Pendiente'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">CIERRE Y FIRMAS</div>
        <div class="section-content">
          <div class="section-grid-2" style="margin-bottom: 10px;">
            <div class="field">
              <div class="field-label">Fecha solicitud de cierre</div>
              <div class="field-value">${ticket.fecha_asignacion_cierre ? new Date(ticket.fecha_asignacion_cierre).toLocaleString('es-CO') : 'Pendiente'}</div>
            </div>
            <div class="field">
              <div class="field-label">Fecha de cierre</div>
              <div class="field-value">${ticket.fecha_cierre_confirmado ? new Date(ticket.fecha_cierre_confirmado).toLocaleString('es-CO') : 'Pendiente'}</div>
            </div>
          </div>
          
          <div class="firma-container">
            <div class="firma-box">
              <div class="firma-title">Firma del Técnico</div>
              <div class="firma-image">
                ${ticket.firma_tecnico ? `<img src="${ticket.firma_tecnico}" alt="Firma Técnico" />` : '<span style="color: #94a3b8; font-size: 9px;">Sin firma</span>'}
              </div>
              ${ticket.firma_tecnico_nombre ? `
                <div class="firma-nombre">${ticket.firma_tecnico_nombre}</div>
                ${ticket.firma_tecnico_fecha ? `<div class="firma-fecha">${new Date(ticket.firma_tecnico_fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
              ` : ''}
            </div>
            
            <div class="firma-box">
              <div class="firma-title">Firma de Recibido</div>
              <div class="firma-image">
                ${ticket.firma_recibido ? `<img src="${ticket.firma_recibido}" alt="Firma Recibido" />` : '<span style="color: #94a3b8; font-size: 9px;">Sin firma</span>'}
              </div>
              ${ticket.firma_recibido_nombre ? `
                <div class="firma-nombre">${ticket.firma_recibido_nombre}</div>
                ${ticket.firma_recibido_fecha ? `<div class="firma-fecha">${new Date(ticket.firma_recibido_fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">ESTADO ACTUAL</div>
        <div class="section-content">
          <div class="section-grid-3">
            <div class="field">
              <div class="field-label">Estado</div>
              <div class="field-value">${ticket.estado || ticket.status || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Prioridad</div>
              <div class="field-value">${ticket.prioridad || 'Normal'}</div>
            </div>
            <div class="field">
              <div class="field-label">Código confirmación</div>
              <div class="field-value">${ticket.code || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-line">Estoy de acuerdo en que todo el trabajo se ha realizado satisfactoriamente.</div>
        <div class="footer-line"><strong>Documento generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</strong></div>
        <div class="footer-line">Hospital Universitario del Valle - Sistema EVA - <strong>¡Eva Tickets!</strong></div>
      </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    alert('🖨️ Documento enviado a impresión');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className= "min-w-[80vw] w-auto h-auto max-h-[95vh]  overflow-y-auto p-0"
          showCloseButton={false}
        >
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold">Hospital Universitario del Valle</h1>
                <p className="text-blue-100 text-sm">Evaristo García - Sistema de Gestión de Tickets</p>
              </div>
            </div>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-blue-700"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Document Header con Botones de Acción */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-center">
              <h2 className="text-lg font-bold text-gray-900">DETALLE DEL TICKET</h2>
              <p className="text-sm text-gray-600">Información Completa del Ticket #{ticket.id}</p>
            </div>
          </div>
          
          {/* Botones de Acción - NO mostrar si el ticket está cerrado */}
          
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
          
          {/* Botones cuando el ticket está Abierto */}
          {!isTicketCerrado && isTicketOpen && (
            <div className="flex justify-center gap-3 pt-3 border-t">
              <Button 
                onClick={() => setShowAddProgressModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Avance
              </Button>
              <Button 
                onClick={() => setShowSparePartModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Asociar Repuesto
              </Button>
              {!tieneResponsable && (
                <Button 
                  onClick={() => setShowAssignModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Asignar Responsable
                </Button>
              )}
            </div>
          )}
          
          {/* Botones de Diagnóstico y Cierre (cuando está Asignado o tiene responsable) */}
          {!isTicketCerrado && mostrarBotonesDiagnosticoYCierre && (
            <div className="flex justify-center gap-3 pt-3 mt-3 border-t">
              <Button 
                onClick={() => setShowDiagnosticoModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Agregar Diagnóstico
              </Button>
              <Button 
                onClick={() => setShowCierreModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Enviar a Cierre
              </Button>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Encabezado */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ENCABEZADO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sede *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.sede_nombre || 'SEDE PRINCIPAL'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Centro de costo *</label>
                <p className="text-sm text-gray-900 mt-1">CC-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Servicio *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.servicio_nombre || ticket.origin || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">O.T. # *</label>
                <p className="text-sm text-gray-900 mt-1">OT-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.area_nombre || ticket.area || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">O.T *</label>
                <p className="text-sm text-gray-900 mt-1">#{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.fecha_inicio ? new Date(ticket.fecha_inicio).toLocaleDateString('es-CO') : ticket.date || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">EQUIPO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Equipo *</label>
                <p className="text-sm font-medium text-gray-900 mt-1">{ticket.equipo_final || ticket.equipo || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modelo *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.modelo_final || ticket.equipo?.split(' ').slice(-1)[0] || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serie *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.serie_final || `SN-${ticket.id}001`}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marca *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.marca_final || ticket.equipo?.split(' ')[0] || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">No. Inventario *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.codigo_final || `INV-${ticket.id}`}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Solicitado por *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.reportante_nombre || ticket.creadoPor || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo electrónico *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.creadoPor?.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@huv.gov.co</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">TIPO DE ARREGLO *</label>
                <p className="text-sm text-gray-900 mt-1 uppercase">{ticket.tipo}</p>
              </div>
            </div>
          </div>

          {/* Problema */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">PROBLEMA</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-3 rounded col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción del problema presentado *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.descripcion || ticket.description || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Empresa Asignada *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.empresa_nombre || 'Hospital Universitario del Valle'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Asignación específica *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.asignadoA}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de asignación *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date} {ticket.time}</p>
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                DIAGNÓSTICO
                {ticket.file_diagnostico && (
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/correctivos_generales/${ticket.file_diagnostico}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-normal"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver documento
                  </a>
                )}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diagnóstico *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.diagnostico || 'Diagnóstico técnico pendiente de evaluación'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repuestos necesarios *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.repuestos || 'Por determinar según diagnóstico'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsable del diagnóstico *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.asignadoA}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tiempo de ejecución *</label>
                <p className="text-sm text-gray-900 mt-1">2-4 horas</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Inicio *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de finalización *</label>
                <p className="text-sm text-gray-900 mt-1">Pendiente</p>
              </div>
            </div>
          </div>

          {/* Trabajo Realizado */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                TRABAJO REALIZADO
                {ticket.file_cierre && (
                  <a 
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/correctivos_generales/${ticket.file_cierre}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-normal"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver documento
                  </a>
                )}
              </h3>
            </div>
            
            {/* Sección para anexar archivo (solo si está en estado Esperando cierre) */}
            {ticket.estado_id === 5 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">Anexar Documento de Trabajo Realizado</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Suba el documento firmado o con información adicional del trabajo realizado.
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
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors text-sm"
                        >
                          <File className="w-4 h-4" />
                          {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                        </label>
                      </div>
                      
                      {selectedFile && (
                        <Button
                          onClick={handleUploadFile}
                          disabled={isUploadingFile}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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
                    
                    <p className="text-xs text-blue-600 mt-2">
                      Formatos: PDF, Word, Excel, Imágenes. Máximo 10MB.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo y descripción del trabajo realizado *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.reparacion || 'Trabajo pendiente de ejecución'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repuestos instalados *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.repuestos || 'Ninguno instalado aún'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsable de la reparación *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.asignadoA}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tiempo de ejecución *</label>
                <p className="text-sm text-gray-900 mt-1">Por determinar</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha Inicio *</label>
                <p className="text-sm text-gray-900 mt-1">Pendiente</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de finalización *</label>
                <p className="text-sm text-gray-900 mt-1">Pendiente</p>
              </div>
            </div>
          </div>

          {/* Avances */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                AVANCES {ticket.total_avances > 0 && `(${ticket.total_avances})`}
              </h3>
            </div>
            {ticket.avances && ticket.avances.length > 0 ? (
              <div className="space-y-3">
                {ticket.avances.map((avance, index) => (
                  <div key={avance.id || index} className="border border-gray-200 p-4 rounded bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{avance.title}</h4>
                      <span className="text-xs text-gray-500">{avance.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{avance.description}</p>
                    {avance.file && (
                      <a 
                        href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/storage/correctivos_generales/${avance.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver archivo adjunto
                      </a>
                    )}
                    {avance.usuario_nombre && (
                      <p className="text-xs text-gray-500 mt-2">Registrado por: {avance.usuario_nombre}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avances *</label>
                <p className="text-sm text-gray-900 mt-1">No hay avances registrados aún.</p>
              </div>
            )}
          </div>

          {/* Cierre */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">CIERRE</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de solicitud de cierre *</label>
                <p className="text-sm text-gray-900 mt-1">Pendiente</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de cierre *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.status === 'Cerrado' ? `${ticket.date} ${ticket.time}` : 'Pendiente'}</p>
              </div>
            </div>
            
            {/* Firmas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-3 rounded" style={{minHeight: '150px'}}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Firma del Técnico *</label>
                <div className="mt-2 border border-gray-300 rounded bg-gray-50">
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
              <div className="border border-gray-200 p-3 rounded" style={{minHeight: '150px'}}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Firma de Recibido *</label>
                <div className="mt-2 border border-gray-300 rounded bg-gray-50">
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

          {/* Estado */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ESTADO ACTUAL</h3>
            </div>
            <div className="border border-gray-200 p-3 rounded">
              <Badge className={`${getStatusColor(estadoTicket)} border text-sm`}>
                {estadoTicket || 'Sin estado'}
              </Badge>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <p>Documento generado el {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}</p>
              <p>Hospital Universitario del Valle - Sistema EVA</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
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
        onClose={() => handleModalClose(setShowSparePartModal)}
        ticketId={ticket.id}
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
    </>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Building, FileText } from "lucide-react";

export default function TicketDetailsModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

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
      <title>Detalle del Ticket #${ticket.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .section { margin-bottom: 15px; }
        .section-title { background-color: #f0f0f0; padding: 8px; font-weight: bold; border: 1px solid #000; }
        .field-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
        .field { border: 1px solid #ccc; padding: 8px; }
        .field-label { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; }
        .field-value { font-size: 11px; margin-top: 3px; }
        .full-width { grid-column: span 4; }
        .half-width { grid-column: span 2; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HOSPITAL UNIVERSITARIO DEL VALLE</h1>
        <h2>Evaristo García</h2>
        <h3>DETALLE DEL TICKET</h3>
        <p>Ticket #${ticket.id}</p>
      </div>

      <div class="section">
        <div class="section-title">ENCABEZADO</div>
        <div class="field-grid">
          <div class="field"><div class="field-label">Sede *</div><div class="field-value">SEDE PRINCIPAL</div></div>
          <div class="field"><div class="field-label">Centro de costo *</div><div class="field-value">CC-${ticket.id}</div></div>
          <div class="field"><div class="field-label">Servicio *</div><div class="field-value">${ticket.origin}</div></div>
          <div class="field"><div class="field-label">O.T. # *</div><div class="field-value">OT-${ticket.id}</div></div>
          <div class="field"><div class="field-label">Área *</div><div class="field-value">${ticket.area}</div></div>
          <div class="field"><div class="field-label">O.T *</div><div class="field-value">#${ticket.id}</div></div>
          <div class="field"><div class="field-label">Fecha *</div><div class="field-value">${ticket.date}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">EQUIPO</div>
        <div class="field-grid">
          <div class="field"><div class="field-label">Equipo *</div><div class="field-value">${ticket.equipo}</div></div>
          <div class="field"><div class="field-label">Modelo *</div><div class="field-value">${ticket.equipo?.split(' ').slice(-1)[0] || 'N/A'}</div></div>
          <div class="field"><div class="field-label">Serie *</div><div class="field-value">SN-${ticket.id}001</div></div>
          <div class="field"><div class="field-label">Marca *</div><div class="field-value">${ticket.equipo?.split(' ')[0] || 'N/A'}</div></div>
          <div class="field"><div class="field-label">No. Inventario *</div><div class="field-value">INV-${ticket.id}</div></div>
          <div class="field"><div class="field-label">Solicitado por *</div><div class="field-value">${ticket.creadoPor}</div></div>
          <div class="field"><div class="field-label">Correo electrónico *</div><div class="field-value">${ticket.creadoPor?.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@huv.gov.co</div></div>
          <div class="field"><div class="field-label">TIPO DE ARREGLO *</div><div class="field-value">${ticket.tipo?.toUpperCase()}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">PROBLEMA</div>
        <div class="field-grid">
          <div class="field full-width"><div class="field-label">Descripción del problema presentado *</div><div class="field-value">${ticket.description}</div></div>
          <div class="field"><div class="field-label">Empresa Asignada *</div><div class="field-value">Hospital Universitario del Valle</div></div>
          <div class="field"><div class="field-label">Asignación específica *</div><div class="field-value">${ticket.asignadoA}</div></div>
          <div class="field"><div class="field-label">Fecha de asignación *</div><div class="field-value">${ticket.date} ${ticket.time}</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">DIAGNÓSTICO</div>
        <div class="field-grid">
          <div class="field half-width"><div class="field-label">Diagnóstico *</div><div class="field-value">Diagnóstico técnico pendiente de evaluación</div></div>
          <div class="field half-width"><div class="field-label">Repuestos necesarios *</div><div class="field-value">Por determinar según diagnóstico</div></div>
          <div class="field"><div class="field-label">Responsable del diagnóstico *</div><div class="field-value">${ticket.asignadoA}</div></div>
          <div class="field"><div class="field-label">Tiempo de ejecución *</div><div class="field-value">2-4 horas</div></div>
          <div class="field"><div class="field-label">Fecha Inicio *</div><div class="field-value">${ticket.date}</div></div>
          <div class="field"><div class="field-label">Fecha de finalización *</div><div class="field-value">Pendiente</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">TRABAJO REALIZADO</div>
        <div class="field-grid">
          <div class="field half-width"><div class="field-label">Tipo y descripción del trabajo realizado *</div><div class="field-value">Trabajo pendiente de ejecución</div></div>
          <div class="field half-width"><div class="field-label">Repuestos instalados *</div><div class="field-value">Ninguno instalado aún</div></div>
          <div class="field"><div class="field-label">Responsable de la reparación *</div><div class="field-value">${ticket.asignadoA}</div></div>
          <div class="field"><div class="field-label">Tiempo de ejecución *</div><div class="field-value">Por determinar</div></div>
          <div class="field"><div class="field-label">Fecha Inicio *</div><div class="field-value">Pendiente</div></div>
          <div class="field"><div class="field-label">Fecha de finalización *</div><div class="field-value">Pendiente</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">AVANCES</div>
        <div class="field-grid">
          <div class="field full-width"><div class="field-label">Avances *</div><div class="field-value">Ticket creado. Pendiente de asignación y diagnóstico inicial.</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">CIERRE</div>
        <div class="field-grid">
          <div class="field"><div class="field-label">Fecha de solicitud de cierre *</div><div class="field-value">Pendiente</div></div>
          <div class="field"><div class="field-label">Fecha de cierre *</div><div class="field-value">${ticket.status === 'Cerrado' ? ticket.date + ' ' + ticket.time : 'Pendiente'}</div></div>
          <div class="field" style="height: 80px;"><div class="field-label">Firma de quien cierra la orden *</div><div class="field-value" style="height: 60px; border-bottom: 1px solid #000; margin-top: 10px;"></div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ESTADO ACTUAL</div>
        <div class="field-grid">
          <div class="field"><div class="field-label">Estado</div><div class="field-value">${ticket.status}</div></div>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
        <p>Documento generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
        <p>Hospital Universitario del Valle - Sistema EVA</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold">Hospital Universitario del Valle</h1>
                <p className="text-blue-100 text-sm">Evaristo García - Sistema de Gestión de Tickets</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
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
                <p className="text-sm text-gray-900 mt-1">SEDE PRINCIPAL</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Centro de costo *</label>
                <p className="text-sm text-gray-900 mt-1">CC-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Servicio *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.origin}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">O.T. # *</label>
                <p className="text-sm text-gray-900 mt-1">OT-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.area}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">O.T *</label>
                <p className="text-sm text-gray-900 mt-1">#{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.date}</p>
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
                <p className="text-sm font-medium text-gray-900 mt-1">{ticket.equipo}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modelo *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.equipo?.split(' ').slice(-1)[0] || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serie *</label>
                <p className="text-sm text-gray-900 mt-1">SN-{ticket.id}001</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marca *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.equipo?.split(' ')[0] || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">No. Inventario *</label>
                <p className="text-sm text-gray-900 mt-1">INV-{ticket.id}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Solicitado por *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.creadoPor}</p>
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
                <p className="text-sm text-gray-900 mt-1">{ticket.description}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Empresa Asignada *</label>
                <p className="text-sm text-gray-900 mt-1">Hospital Universitario del Valle</p>
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
              <h3 className="text-lg font-semibold text-gray-900">DIAGNÓSTICO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Diagnóstico *</label>
                <p className="text-sm text-gray-900 mt-1">Diagnóstico técnico pendiente de evaluación</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repuestos necesarios *</label>
                <p className="text-sm text-gray-900 mt-1">Por determinar según diagnóstico</p>
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
              <h3 className="text-lg font-semibold text-gray-900">TRABAJO REALIZADO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo y descripción del trabajo realizado *</label>
                <p className="text-sm text-gray-900 mt-1">Trabajo pendiente de ejecución</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Repuestos instalados *</label>
                <p className="text-sm text-gray-900 mt-1">Ninguno instalado aún</p>
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
              <h3 className="text-lg font-semibold text-gray-900">AVANCES</h3>
            </div>
            <div className="border border-gray-200 p-3 rounded">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avances *</label>
              <p className="text-sm text-gray-900 mt-1">Ticket creado. Pendiente de asignación y diagnóstico inicial.</p>
            </div>
          </div>

          {/* Cierre */}
          <div className="mb-6">
            <div className="border-l-4 border-gray-500 p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">CIERRE</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de solicitud de cierre *</label>
                <p className="text-sm text-gray-900 mt-1">Pendiente</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha de cierre *</label>
                <p className="text-sm text-gray-900 mt-1">{ticket.status === 'Cerrado' ? `${ticket.date} ${ticket.time}` : 'Pendiente'}</p>
              </div>
              <div className="border border-gray-200 p-3 rounded" style={{minHeight: '100px'}}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Firma de quien cierra la orden *</label>
                <div className="mt-2 h-16 border-b border-gray-300 flex items-end justify-center">
                  <p className="text-xs text-gray-400 mb-1">Espacio para firma</p>
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
              <Badge className={`${getStatusColor(ticket.status)} border text-sm`}>
                {ticket.status}
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
          </div>
        </div>
      </div>
    </div>
  );
}
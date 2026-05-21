import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const stripHtml = (html) => html ? String(html).replace(/<[^>]*>/g, '') : '';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 7,
    fontFamily: 'Helvetica',
  },
  // Contenedor principal del talonario
  talonario: {
    border: '1.5px solid #D1D5DB',
    borderRadius: 8,
    marginBottom: 5,
  },
  // Header con logo, título y OT
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderBottom: '1.5px solid #93C5FD',
  },
  logoContainer: {
    width: 40,
    marginRight: 8,
  },
  logo: {
    width: 35,
    height: 35,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 0,
  },
  hospitalName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 6,
    color: '#6B7280',
  },
  otBox: {
    backgroundColor: '#EFF6FF',
    border: '1.5px solid #93C5FD',
    borderRadius: 6,
    padding: 4,
    width: 100,
    alignItems: 'center',
  },
  otLabel: {
    fontSize: 7,
    color: '#1E40AF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  otNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 0,
  },
  otDate: {
    fontSize: 6,
    color: '#6B7280',
    marginTop: 1,
  },
  // Fila de Sede, Servicio, Área
  infoRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
  },
  infoCell: {
    flex: 1,
    padding: 3,
    borderRight: '1px solid #E5E7EB',
  },
  infoCellLast: {
    flex: 1,
    padding: 3,
  },
  infoLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 6,
    color: '#111827',
  },
  // Fila de datos adicionales
  dataRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dataCell: {
    flex: 1,
    padding: 3,
    borderRight: '1px solid #E5E7EB',
  },
  dataCellLast: {
    flex: 1,
    padding: 3,
  },
  // Secciones
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    backgroundColor: '#EFF6FF',
    borderLeft: '2px solid #93C5FD',
    padding: 2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // Grid de campos
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  field: {
    width: '32%',
    marginBottom: 2,
    borderLeft: '1.5px solid #D1D5DB',
    paddingLeft: 3,
  },
  fieldFull: {
    width: '100%',
    marginBottom: 3,
    borderLeft: '1.5px solid #D1D5DB',
    paddingLeft: 4,
  },
  fieldLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 0,
    borderBottom: '0.5px solid #E5E7EB',
    paddingBottom: 0,
  },
  fieldValue: {
    fontSize: 7,
    color: '#111827',
    marginTop: 1,
  },
  // Firmas
  signaturesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  signatureBox: {
    flex: 1,
    border: '1.5px solid #D1D5DB',
    borderRadius: 6,
    padding: 4,
    minHeight: 50,
  },
  signatureLabel: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  signatureArea: {
    border: '1px solid #E5E7EB',
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  signatureImage: {
    maxWidth: '100%',
    maxHeight: 40,
  },
  signatureName: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 2,
  },
  signatureDate: {
    fontSize: 5,
    color: '#6B7280',
    textAlign: 'center',
  },
  noSignature: {
    fontSize: 6,
    color: '#9CA3AF',
  },
  // Footer
  footer: {
    borderTop: '1px solid #D1D5DB',
    paddingTop: 6,
    marginTop: 5,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6,
    color: '#374151',
    marginBottom: 2,
  },
  footerBrand: {
    fontSize: 6,
    color: '#6B7280',
  },
  footerBold: {
    fontWeight: 'bold',
  },
});

const TicketPDF = ({ ticket }) => {
  // Validar que ticket existe
  if (!ticket) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: No se encontró información del ticket</Text>
        </Page>
      </Document>
    );
  }

  // Helper para renderizar valores de forma segura
  const safeValue = (value, fallback = 'N/A') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Talonario */}
        <View style={styles.talonario}>
          {/* Header */}
          <View style={styles.header}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image src="/images/logo_huv.jpg" style={styles.logo} />
            </View>

            {/* Título */}
            <View style={styles.titleContainer}>
              <Text style={styles.hospitalName}>
                Hospital Universitario del Valle Evaristo García
              </Text>
              <Text style={styles.subtitle}>
                Sistema de Gestión de Mantenimiento
              </Text>
            </View>

            {/* OT */}
            <View style={styles.otBox}>
              <Text style={styles.otLabel}>ORDEN DE TRABAJO</Text>
              <Text style={styles.otNumber}># {safeValue(ticket.id)}</Text>
              <Text style={styles.otDate}>Fecha inicio</Text>
              <Text style={styles.otDate}>{formatDate(ticket.fecha_inicio)}</Text>
            </View>
          </View>

          {/* Fila: Sede, Servicio, Área */}
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>SEDE</Text>
              <Text style={styles.infoValue}>{safeValue(ticket.sede_nombre, 'SEDE PRINCIPAL')}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>SERVICIO</Text>
              <Text style={styles.infoValue}>{safeValue(ticket.servicio_nombre, 'CONTRATACIÓN')}</Text>
            </View>
            <View style={styles.infoCellLast}>
              <Text style={styles.infoLabel}>ÁREA</Text>
              <Text style={styles.infoValue}>{safeValue(ticket.area_nombre, 'Datos no disponibles')}</Text>
            </View>
          </View>

          {/* Fila: Datos adicionales */}
          <View style={styles.dataRow}>
            <View style={styles.dataCell}>
              <Text style={styles.infoLabel}>Centro de costo</Text>
              <Text style={styles.infoValue}>CC-{safeValue(ticket.id)}</Text>
            </View>
            <View style={styles.dataCell}>
              <Text style={styles.infoLabel}>O.T. #</Text>
              <Text style={styles.infoValue}>OT-{safeValue(ticket.id)}</Text>
            </View>
            <View style={styles.dataCellLast}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>{formatDateTime(ticket.fecha_inicio)}</Text>
            </View>
          </View>
        </View>

        {/* Sección: Información del Equipo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL EQUIPO</Text>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Equipo *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.equipo_final || ticket.equipo)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Modelo *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.modelo_final)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Serie *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.serie_final, `SN-${safeValue(ticket.id)}001`)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Marca *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.marca_final)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>No. Inventario *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.codigo_final, `INV-${safeValue(ticket.id)}`)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Solicitado por *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.reportante_nombre || ticket.creadoPor)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Correo electrónico *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.reportante_email, 'Datos no disponibles')}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TIPO DE ARREGLO *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.tipo || ticket.origen, 'Datos no disponibles')}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Última Localización *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.localizacion_actual)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Responsable Mantenimiento *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.responsable_mantenimiento)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Estado Actual del Equipo *</Text>
              <Text style={styles.fieldValue}>{safeValue(ticket.estado_equipo_nombre)}</Text>
            </View>
            {ticket.tipo_mantenimiento_nombre && (
              <View style={[styles.field, { borderLeftColor: '#F97316' }]}>
                <Text style={[styles.fieldLabel, { color: '#EA580C', borderBottomColor: '#FFEDD5' }]}>
                  Categoría Mantenimiento
                </Text>
                <Text style={[styles.fieldValue, { fontWeight: 'bold' }]}>
                  {ticket.tipo_mantenimiento_nombre}
                </Text>
              </View>
            )}
            {ticket.subcategoria_mantenimiento_nombre && (
              <View style={[styles.field, { borderLeftColor: '#F97316' }]}>
                <Text style={[styles.fieldLabel, { color: '#EA580C', borderBottomColor: '#FFEDD5' }]}>
                  Subcategoría
                </Text>
                <Text style={[styles.fieldValue, { fontWeight: 'bold' }]}>
                  {ticket.subcategoria_mantenimiento_nombre}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Sección: Descripción del Problema */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DESCRIPCIÓN DEL PROBLEMA</Text>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.fieldLabel}>Descripción del problema presentado *</Text>
            <Text style={styles.fieldValue}>{stripHtml(ticket.descripcion || ticket.description) || 'Datos no disponibles'}</Text>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Empresa Asignada *</Text>
              <Text style={styles.fieldValue}>{ticket.empresa_nombre || 'Hospital Universitario del Valle'}</Text>
              <Text style={[styles.fieldValue, { fontSize: 9, color: '#666', marginTop: 2 }]}>
                Asignado por: {ticket.usuario_asigno_nombre || 'N/A'}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Asignación específica *</Text>
              <Text style={styles.fieldValue}>{ticket.asignado_nombre || ticket.asignadoA || 'No asignado'}</Text>
            </View>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.fieldLabel}>Fecha de asignación *</Text>
            <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_asignacion)}</Text>
          </View>
        </View>

        {/* Sección: Diagnóstico */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DIAGNÓSTICO</Text>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.fieldLabel}>Diagnóstico *</Text>
            <Text style={styles.fieldValue}>{ticket.diagnostico || ticket.retro_diagnostico || ' '}</Text>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Repuestos necesarios *</Text>
              <Text style={styles.fieldValue}>{ticket.repuestos_usados || ticket.repuestos_diagnostico || ' '}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Responsable del diagnóstico *</Text>
              <Text style={styles.fieldValue}>
                {ticket.tecnico_diagnostico_text || 
                 `${ticket.nombre_tecnico_diagnostico || ''} ${ticket.apellido_tecnico_diagnostico || ''}`.trim() || 
                 ticket.asignado_nombre || 
                 ' '}
              </Text>
            </View>
          </View>
          <View style={{marginTop: 5, padding: 5, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 4}}>
            <Text style={{fontSize: 7, fontWeight: 'bold', color: '#374151', marginBottom: 3}}>Tiempo de ejecución</Text>
            <View style={styles.fieldGrid}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fecha de inicio *</Text>
                <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_diagnostico) !== 'N/A' ? formatDateTime(ticket.fecha_diagnostico) : ' '}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fecha de finalización *</Text>
                <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_diagnostico) !== 'N/A' ? formatDateTime(ticket.fecha_diagnostico) : ' '}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Trabajo Realizado */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRABAJO REALIZADO</Text>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.fieldLabel}>Tipo y descripción del trabajo realizado *</Text>
            <Text style={styles.fieldValue}>{ticket.reparacion || ticket.retro_cierre || ' '}</Text>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Repuestos instalados *</Text>
              <Text style={styles.fieldValue}>{ticket.repuestos_instalados || ticket.repuestos_usados || ' '}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Responsable de la reparación *</Text>
              <Text style={styles.fieldValue}>
                {ticket.tecnico_cierre_text || 
                 `${ticket.nombre_tecnico_cierre || ''} ${ticket.apellido_tecnico_cierre || ''}`.trim() || 
                 ' '}
              </Text>
            </View>
          </View>
          <View style={{marginTop: 5, padding: 5, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 4}}>
            <Text style={{fontSize: 7, fontWeight: 'bold', color: '#374151', marginBottom: 3}}>Tiempo de ejecución</Text>
            <View style={styles.fieldGrid}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fecha de inicio *</Text>
                <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_asignacion_cierre || ticket.fecha_inicio) !== 'N/A' ? formatDateTime(ticket.fecha_asignacion_cierre || ticket.fecha_inicio) : ' '}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Fecha de finalización *</Text>
                <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_fin) !== 'N/A' ? formatDateTime(ticket.fecha_fin) : ' '}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Avances del Trabajo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AVANCES DEL TRABAJO</Text>
          </View>
          <View style={styles.fieldFull}>
            <Text style={styles.fieldLabel}>Estado del trabajo + observaciones *</Text>
            {ticket.avances && ticket.avances.length > 0 ? (
              ticket.avances.map((avance, index) => (
                <View key={index} style={{marginBottom: 4, paddingLeft: 5, borderLeft: '1px solid #E5E7EB'}}>
                  <Text style={styles.fieldValue}>
                    {formatDateTime(avance.fecha || avance.date || avance.created_at)} - {avance.descripcion || avance.observacion || avance.description || avance.title}
                  </Text>
                  {avance.usuario_nombre && (
                    <Text style={{fontSize: 6, color: '#6B7280', marginTop: 1}}>Por: {avance.usuario_nombre}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={{marginBottom: 4, paddingLeft: 5, minHeight: 20}}>
                <Text style={styles.fieldValue}> </Text>
              </View>
            )}
          </View>
        </View>

        {/* Sección: Cierre y Firmas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CIERRE Y ESTADO ACTUAL</Text>
          </View>
          <View style={styles.fieldGrid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fecha de solicitud de cierre *</Text>
              <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_asignacion_cierre)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fecha de cierre *</Text>
              <Text style={styles.fieldValue}>{formatDateTime(ticket.fecha_fin)}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Estado *</Text>
              <Text style={styles.fieldValue}>{ticket.estado || 'N/A'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Prioridad *</Text>
              <Text style={styles.fieldValue}>{ticket.prioridad_texto || ticket.prioridad || 'N/A'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Origen *</Text>
              <Text style={styles.fieldValue}>{ticket.origen || 'N/A'}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Total avances *</Text>
              <Text style={styles.fieldValue}>{ticket.total_avances || ticket.avances?.length || 0}</Text>
            </View>
          </View>

          {/* Sección de Firmas Digitales */}
          <View style={styles.signaturesContainer}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Firma del Técnico *</Text>
              <View style={styles.signatureArea}>
                {ticket?.firma_tecnico && typeof ticket.firma_tecnico === 'string' && ticket.firma_tecnico.trim() !== '' ? (
                  <Image src={ticket.firma_tecnico} style={styles.signatureImage} />
                ) : (
                  <Text style={styles.noSignature}> </Text>
                )}
              </View>
              <Text style={styles.signatureName}>{ticket.firma_tecnico_nombre || ' '}</Text>
              <Text style={styles.signatureDate}>
                {ticket.firma_tecnico_fecha ? formatDate(ticket.firma_tecnico_fecha) : ' '}
              </Text>
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Firma de Recibido *</Text>
              <View style={styles.signatureArea}>
                {ticket?.firma_recibido && typeof ticket.firma_recibido === 'string' && ticket.firma_recibido.trim() !== '' ? (
                  <Image src={ticket.firma_recibido} style={styles.signatureImage} />
                ) : (
                  <Text style={styles.noSignature}> </Text>
                )}
              </View>
              <Text style={styles.signatureName}>{ticket.firma_recibido_nombre || ' '}</Text>
              <Text style={styles.signatureDate}>
                {ticket.firma_recibido_fecha ? formatDate(ticket.firma_recibido_fecha) : ' '}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Estoy de acuerdo en que todo el trabajo se ha realizado satisfactoriamente.
          </Text>
          <Text style={styles.footerBrand}>
            Hospital Universitario del Valle - Sistema EVA - <Text style={styles.footerBold}>¡Eva Tickets!</Text>
          </Text>
          <Text style={styles.footerText}>
            Generado el {formatDateTime(new Date().toISOString())}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TicketPDF;

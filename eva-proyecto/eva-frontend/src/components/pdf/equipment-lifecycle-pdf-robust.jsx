import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Importar el logo del hospital
const HuvLogo = "/images/logo_huv.jpg";

// Robust styles with no complex properties
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    borderBottomStyle: "solid",
  },
  logoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    objectFit: "contain",
  },
  titleSection: {
    flex: 4,
    paddingLeft: 20,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 3,
  },
  hospitalName: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#4b5563",
    flex: 2,
  },
  value: {
    fontSize: 9,
    color: "#111827",
    flex: 3,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    marginRight: 10,
  },
  equipmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderStyle: "solid",
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: 4,
    borderRadius: 4,
    fontSize: 8,
    textAlign: "center",
    marginTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
  },
  // Table styles
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    minHeight: 25,
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    borderRightStyle: "solid",
  },
  tableCellHeader: {
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
  },
  noData: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
    padding: 10,
  },
});

// Safe value function
const getSafeValue = (value, fallback = "No disponible") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value === "object" && value !== null) {
    if (value.name) return String(value.name);
    if (value.nombre) return String(value.nombre);
    return fallback;
  }
  return String(value);
};

// Safe date formatting
const getSafeDate = (date, fallback = "No disponible") => {
  if (!date || date === null || date === undefined || date === "") {
    return fallback;
  }
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    return dateObj.toLocaleDateString("es-ES");
  } catch {
    return fallback;
  }
};

export const EquipmentLifecyclePDFRobust = ({ equipment }) => {
  // Ensure equipment is an object
  const safeEquipment = equipment || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={HuvLogo} style={styles.logo} />
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              FORMATO DE HOJA DE VIDA PARA EQUIPOS BIOMÉDICOS
            </Text>
            <Text style={styles.subtitle}>
              HOSPITAL UNIVERSITARIO DEL VALLE EVARISTO GARCÍA
            </Text>
            <Text style={styles.hospitalName}>
              Sistema EVA - Gestión de Equipos Médicos (v2.0 - Formato Tabla)
            </Text>
          </View>
        </View>

        {/* Equipment Header */}
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>
              {getSafeValue(safeEquipment.name, "Equipo Sin Nombre")}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Código:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.code)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Serie:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.serial)}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text>
                {getSafeValue(safeEquipment.estado_nombre, "Sin estado")}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1: Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. IDENTIFICACIÓN PRINCIPAL</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}
              >
                Campo
              </Text>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 3 }]}
              >
                Valor
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                ID Equipo:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.id)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Marca:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.marca)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Modelo:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.modelo)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Código Anterior:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.codigo_antiguo)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Technical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. INFORMACIÓN TÉCNICA</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}
              >
                Especificación
              </Text>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 3 }]}
              >
                Detalle
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Fecha Fabricación:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeDate(safeEquipment.fecha_fabricacion)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Voltaje Principal:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.v1)} V
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Movilidad:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.movilidad)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Clasificación:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.clasificacion_nombre)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. UBICACIÓN Y LOCALIZACIÓN</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}
              >
                Ubicación
              </Text>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 3 }]}
              >
                Descripción
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Sede:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.sede_nombre)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Servicio:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.servicio_nombre)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Área:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.area_nombre)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Localización Actual:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.localizacion_actual)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. INFORMACIÓN FINANCIERA Y PATRIMONIAL
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}
              >
                Concepto
              </Text>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 3 }]}
              >
                Valor
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Costo de Adquisición:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                ${getSafeValue(safeEquipment.costo, "0")}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Vida Útil:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.vida_util)} años
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Garantía:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.garantia)} meses
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Propietario:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeValue(safeEquipment.propietario_nombre)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5: Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. CRONOLOGÍA DE FECHAS IMPORTANTES
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}
              >
                Evento
              </Text>
              <Text
                style={[styles.tableCell, styles.tableCellHeader, { flex: 3 }]}
              >
                Fecha
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Fecha de Adquisición:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeDate(safeEquipment.fecha_ad)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Fecha de Instalación:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeDate(safeEquipment.fecha_instalacion)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Inicio de Operación:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeDate(safeEquipment.fecha_inicio_operacion)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: "bold" }]}>
                Acta de Recibo:
              </Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>
                {getSafeDate(safeEquipment.fecha_acta_recibo)}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6: Maintenance Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. REGISTROS DE MANTENIMIENTO PREVENTIVO
          </Text>
          {safeEquipment.mantenimientos_preventivos &&
          safeEquipment.mantenimientos_preventivos.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha Programada
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 3 },
                  ]}
                >
                  Descripción
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha Realizada
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Proveedor
                </Text>
              </View>
              {safeEquipment.mantenimientos_preventivos
                .slice(0, 5)
                .map((mant, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeDate(mant.fecha_programada)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 3 }]}>
                      {getSafeValue(
                        mant.description,
                        "Mantenimiento preventivo"
                      )}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeDate(mant.fecha_mantenimiento)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeValue(mant.tecnico_nombre, "No asignado")}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.noData}>
              No hay registros de mantenimiento preventivo disponibles
            </Text>
          )}
        </View>

        {/* Section 7: Corrective Maintenance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. MANTENIMIENTOS CORRECTIVOS</Text>
          {safeEquipment.contingencias &&
          safeEquipment.contingencias.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha Reporte
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 4 },
                  ]}
                >
                  Observación/Problema
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Usuario
                </Text>
              </View>
              {safeEquipment.contingencias.slice(0, 5).map((cont, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {getSafeDate(cont.fecha)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 4 }]}>
                    {getSafeValue(cont.observacion, "Sin descripción")}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {getSafeValue(cont.usuario_nombre, "No especificado")}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>
              No hay registros de mantenimiento correctivo
            </Text>
          )}
        </View>

        {/* Section 8: Calibration History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. HISTORIAL DE CALIBRACIONES</Text>
          {safeEquipment.calibraciones &&
          safeEquipment.calibraciones.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha Calibración
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 3 },
                  ]}
                >
                  Descripción
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha Programada
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 1 },
                  ]}
                >
                  Estado
                </Text>
              </View>
              {safeEquipment.calibraciones.slice(0, 3).map((cal, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {getSafeDate(cal.fecha_calibracion)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {getSafeValue(cal.description, "Calibración estándar")}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {getSafeDate(cal.fecha_programada)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {getSafeValue(
                      cal.status === 1 ? "Activo" : "Inactivo",
                      "Activo"
                    )}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>
              No hay registros de calibración disponibles
            </Text>
          )}
        </View>

        {/* Section 9: Associated Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. DOCUMENTOS ASOCIADOS</Text>
          {safeEquipment.documentos && safeEquipment.documentos.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 3 },
                  ]}
                >
                  Nombre
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Tipo
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 1 },
                  ]}
                >
                  Tamaño
                </Text>
              </View>
              {safeEquipment.documentos.slice(0, 6).map((doc, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>
                    {getSafeValue(doc.name, "Documento sin nombre")}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {getSafeValue(doc.vinculo, "Documento")}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {getSafeDate(doc.created_at)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {getSafeValue(doc.tamano_archivo, "N/A")}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>
              No hay documentos asociados disponibles
            </Text>
          )}
        </View>

        {/* Section 10: Technical Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. CONTACTOS TÉCNICOS</Text>
          {safeEquipment.contactos_tecnicos &&
          safeEquipment.contactos_tecnicos.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Nombre
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Empresa
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Teléfono
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Email
                </Text>
              </View>
              {safeEquipment.contactos_tecnicos
                .slice(0, 4)
                .map((contacto, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeValue(contacto.nombre)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeValue(contacto.empresa)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeValue(contacto.telefono)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeValue(contacto.email)}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.noData}>
              No hay contactos técnicos registrados
            </Text>
          )}
        </View>

        {/* Section 11: Recent Observations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. OBSERVACIONES RECIENTES</Text>
          {safeEquipment.observaciones_recientes &&
          safeEquipment.observaciones_recientes.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Fecha
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 4 },
                  ]}
                >
                  Observación
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableCellHeader,
                    { flex: 2 },
                  ]}
                >
                  Usuario
                </Text>
              </View>
              {safeEquipment.observaciones_recientes
                .slice(0, 3)
                .map((obs, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeDate(obs.created_at)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 4 }]}>
                      {getSafeValue(obs.description)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {getSafeValue(obs.usuario_nombre)}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.noData}>No hay observaciones recientes</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Hospital Universitario del Valle - Sistema EVA | Generado el{" "}
          {new Date().toLocaleDateString("es-ES")}
        </Text>
      </Page>
    </Document>
  );
};

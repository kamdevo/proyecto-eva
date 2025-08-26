import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Estilos simplificados y compatibles
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
  },
  titleSection: {
    flex: 1,
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
    textAlign: "center",
    marginBottom: 3,
    color: "#374151",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e40af",
    backgroundColor: "#e0f2fe",
    padding: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    padding: 5,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 5,
    minHeight: 25,
  },
  tableCell: {
    fontSize: 8,
    padding: 2,
    color: "#374151",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  infoItem: {
    width: "50%",
    flexDirection: "row",
    marginBottom: 3,
    paddingRight: 10,
  },
  label: {
    fontWeight: "bold",
    width: "40%",
    fontSize: 9,
    color: "#374151",
  },
  value: {
    width: "60%",
    fontSize: 9,
    color: "#1f2937",
  },
  noData: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#6b7280",
    padding: 10,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
});

// Función helper para valores seguros
const getSafeValue = (value, defaultValue = "No disponible") => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  return String(value);
};

// Función helper para fechas seguras
const getSafeDate = (dateValue) => {
  if (!dateValue) return "No disponible";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return date.toLocaleDateString("es-ES");
  } catch {
    return "Fecha inválida";
  }
};

export const EquipmentLifecyclePDFSimpleFixed = ({ equipment }) => {
  // Validación de entrada
  if (!equipment) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.noData}>
            No se proporcionaron datos del equipo
          </Text>
        </Page>
      </Document>
    );
  }

  const safeEquipment = equipment || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>HOJA DE VIDA DEL EQUIPO MÉDICO</Text>
            <Text style={styles.subtitle}>
              Hospital Universitario del Valle
            </Text>
            <Text style={styles.subtitle}>
              Sistema EVA - Gestión de Equipos Biomédicos
            </Text>
          </View>
        </View>

        {/* 1. Información Básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            1. INFORMACIÓN BÁSICA DEL EQUIPO
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.name)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Código:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.codigo || safeEquipment.code)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Serie:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.serie || safeEquipment.serial)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Marca:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.marca || safeEquipment.brand)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Modelo:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.modelo || safeEquipment.model)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Servicio:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.servicio_nombre)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.estado_nombre)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Propietario:</Text>
              <Text style={styles.value}>
                {getSafeValue(safeEquipment.propietario_nombre)}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Mantenimientos Preventivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. MANTENIMIENTOS PREVENTIVOS</Text>
          {safeEquipment.mantenimientos_preventivos &&
          safeEquipment.mantenimientos_preventivos.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                  Fecha Prog.
                </Text>
                <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                  Fecha Real.
                </Text>
                <Text style={[styles.tableHeaderText, { width: "40%" }]}>
                  Descripción
                </Text>
                <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                  Técnico
                </Text>
              </View>
              {safeEquipment.mantenimientos_preventivos
                .slice(0, 5)
                .map((mant, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {getSafeDate(mant.fecha_programada)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {getSafeDate(mant.fecha_mantenimiento)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "40%" }]}>
                      {getSafeValue(mant.description)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {getSafeValue(mant.tecnico_nombre)}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.noData}>
              No hay mantenimientos preventivos registrados
            </Text>
          )}
        </View>

        {/* 3. Contingencias/Correctivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. MANTENIMIENTOS CORRECTIVOS</Text>
          {safeEquipment.contingencias &&
          safeEquipment.contingencias.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                  Fecha
                </Text>
                <Text style={[styles.tableHeaderText, { width: "50%" }]}>
                  Observación
                </Text>
                <Text style={[styles.tableHeaderText, { width: "30%" }]}>
                  Usuario
                </Text>
              </View>
              {safeEquipment.contingencias.slice(0, 5).map((cont, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {getSafeDate(cont.fecha)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "50%" }]}>
                    {getSafeValue(cont.observacion)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "30%" }]}>
                    {getSafeValue(cont.usuario_nombre)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No hay contingencias registradas</Text>
          )}
        </View>

        {/* 4. Calibraciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. CALIBRACIONES</Text>
          {safeEquipment.calibraciones &&
          safeEquipment.calibraciones.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: "25%" }]}>
                  Fecha Calibración
                </Text>
                <Text style={[styles.tableHeaderText, { width: "35%" }]}>
                  Descripción
                </Text>
                <Text style={[styles.tableHeaderText, { width: "25%" }]}>
                  Próxima Fecha
                </Text>
                <Text style={[styles.tableHeaderText, { width: "15%" }]}>
                  Estado
                </Text>
              </View>
              {safeEquipment.calibraciones.slice(0, 3).map((cal, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "25%" }]}>
                    {getSafeDate(cal.fecha_calibracion)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>
                    {getSafeValue(cal.description)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "25%" }]}>
                    {getSafeDate(cal.fecha_programada)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {getSafeValue(cal.status)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No hay calibraciones registradas</Text>
          )}
        </View>

        {/* 5. Documentos Asociados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. DOCUMENTOS ASOCIADOS</Text>
          {safeEquipment.documentos && safeEquipment.documentos.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                  No.
                </Text>
                <Text style={[styles.tableHeaderText, { width: "40%" }]}>
                  Nombre
                </Text>
                <Text style={[styles.tableHeaderText, { width: "30%" }]}>
                  Archivo
                </Text>
                <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                  Fecha
                </Text>
              </View>
              {safeEquipment.documentos.slice(0, 6).map((doc, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: "10%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, { width: "40%" }]}>
                    {getSafeValue(doc.name)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "30%" }]}>
                    {getSafeValue(doc.vinculo)}
                  </Text>
                  <Text style={[styles.tableCell, { width: "20%" }]}>
                    {getSafeDate(doc.created_at)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No hay documentos asociados</Text>
          )}
        </View>

        {/* 6. Observaciones Recientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. OBSERVACIONES RECIENTES</Text>
          {safeEquipment.observaciones_recientes &&
          safeEquipment.observaciones_recientes.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                  Fecha
                </Text>
                <Text style={[styles.tableHeaderText, { width: "50%" }]}>
                  Observación
                </Text>
                <Text style={[styles.tableHeaderText, { width: "30%" }]}>
                  Usuario
                </Text>
              </View>
              {safeEquipment.observaciones_recientes
                .slice(0, 3)
                .map((obs, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: "20%" }]}>
                      {getSafeDate(obs.created_at)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "50%" }]}>
                      {getSafeValue(obs.description)}
                    </Text>
                    <Text style={[styles.tableCell, { width: "30%" }]}>
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

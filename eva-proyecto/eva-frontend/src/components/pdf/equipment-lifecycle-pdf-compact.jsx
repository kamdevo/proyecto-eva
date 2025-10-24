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

// Estilos compactos optimizados para máximo 2 páginas
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 15,
    fontFamily: "Helvetica",
    fontSize: 8,
  },
  
  // Header compacto
  header: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
    borderBottomStyle: "solid",
  },
  logoSection: {
    width: 70,
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  titleSection: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: "#1e40af",
    textAlign: "center",
    marginBottom: 1,
  },
  
  // Sección de equipo con imagen mejorada
  equipmentHeader: {
    flexDirection: "row",
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "solid",
  },
  equipmentInfo: {
    flex: 2.5,
  },
  equipmentName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
  },
  equipmentImageContainer: {
    width: 90,
    height: 90,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "solid",
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  equipmentImage: {
    width: 85,
    height: 85,
    objectFit: "contain",
  },
  noImageText: {
    fontSize: 6,
    color: "#6b7280",
    textAlign: "center",
    padding: 5,
  },
  
  // Diseño de 4 columnas para información principal
  fourColumnRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  column: {
    flex: 1,
    marginRight: 6,
  },
  
  // Secciones compactas
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#1e40af",
    padding: 3,
    textAlign: "center",
    marginBottom: 4,
  },
  
  // Tabla compacta mejorada
  compactTable: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    minHeight: 16,
  },
  tableCell: {
    padding: 2,
    fontSize: 7,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    borderRightStyle: "solid",
    textAlign: "left",
  },
  tableCellHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 7,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  
  // Campos de información
  fieldRow: {
    flexDirection: "row",
    marginBottom: 1.5,
    alignItems: "flex-start",
  },
  fieldLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#374151",
    width: 65,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 7,
    color: "#1e40af",
    flex: 1,
    flexWrap: "wrap",
  },
  
  // Lista de elementos compacta
  compactList: {
    marginTop: 2,
  },
  listItem: {
    fontSize: 6,
    marginBottom: 0.5,
    color: "#6b7280",
  },
  
  // Dos columnas para secciones específicas
  twoColumnRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  halfColumn: {
    flex: 1,
    marginRight: 4,
  },
  
  // Footer
  footer: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    textAlign: "center",
    fontSize: 6,
    color: "#6b7280",
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
  },
  
  // Estilos para valores monetarios
  currencyValue: {
    fontSize: 7,
    color: "#059669",
    fontWeight: "bold",
  },
  
  // Estilos para estados
  statusBadge: {
    fontSize: 6,
    padding: 2,
    borderRadius: 2,
    textAlign: "center",
  },
  statusActive: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  statusInactive: {
    backgroundColor: "#fef2f2",
    color: "#991b1b",
  },
});

// Funciones auxiliares mejoradas
const getSafeValue = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object" && value !== null) {
    if (value.name) return String(value.name);
    if (value.nombre) return String(value.nombre);
    return fallback;
  }
  return String(value);
};

const getSafeDate = (date, fallback = "N/A") => {
  if (!date) return fallback;
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return fallback;
    return dateObj.toLocaleDateString("es-ES");
  } catch {
    return fallback;
  }
};

const formatCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const getImageUrl = (equipment) => {
  if (equipment.image_url) return equipment.image_url;
  if (equipment.image) {
    // Construir URL completa desde el campo image
    return `${import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001"}/storage/equipos/images/${equipment.image}`;
  }
  return null;
};

export const EquipmentLifecyclePDFCompact = ({ equipment }) => {
  const safeEquipment = equipment || {};
  const imageUrl = getImageUrl(safeEquipment);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header compacto */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={HuvLogo} style={styles.logo} />
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>
              HOJA DE VIDA - EQUIPO BIOMÉDICO
            </Text>
            <Text style={styles.subtitle}>
              HOSPITAL UNIVERSITARIO DEL VALLE "EVARISTO GARCÍA"
            </Text>
            <Text style={styles.subtitle}>
              Sistema EVA - Gestión de Equipos Médicos
            </Text>
          </View>
        </View>

        {/* Información principal del equipo con imagen */}
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>
              {getSafeValue(safeEquipment.name, "Equipo Sin Nombre")}
            </Text>
            <View style={styles.fourColumnRow}>
              <View style={styles.column}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Código:</Text>
                  <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.code)}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Serie:</Text>
                  <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.serial)}</Text>
                </View>
              </View>
              <View style={styles.column}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Marca:</Text>
                  <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.marca)}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Modelo:</Text>
                  <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.modelo)}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.equipmentImageContainer}>
            {imageUrl ? (
              <Image
                style={styles.equipmentImage}
                src={imageUrl}
              />
            ) : (
              <Text style={styles.noImageText}>
                Sin imagen{'\n'}disponible
              </Text>
            )}
          </View>
        </View>

        {/* Información de ubicación y clasificación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DE UBICACIÓN Y CLASIFICACIÓN</Text>
          <View style={styles.fourColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Sede:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.sede_nombre)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Servicio:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.servicio_nombre)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Área:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.area_nombre)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Ubicación:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.localizacion_actual)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Estado:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.estado_nombre)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Clasificación:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.clasificacion_nombre)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Riesgo:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.riesgo_nombre)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Movilidad:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.movilidad)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Características técnicas y especificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CARACTERÍSTICAS TÉCNICAS Y ESPECIFICACIONES</Text>
          <View style={styles.fourColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Voltaje 1:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.v1)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Voltaje 2:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.v2)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Voltaje 3:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.v3)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Calibración:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.calibracion)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Periodicidad:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.periodicidad)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Eval. Desemp.:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.evaluacion_desempenio)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Garantía:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.garantia)} años</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Vida Útil:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.vida_util)} años</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información regulatoria y fechas críticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN REGULATORIA Y FECHAS CRÍTICAS</Text>
          <View style={styles.fourColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Reg. INVIMA:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.registro_sanitario)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Estado INVIMA:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.estado_invima)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>F. Fabricación:</Text>
                <Text style={styles.fieldValue}>{getSafeDate(safeEquipment.fecha_fabricacion)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>F. Instalación:</Text>
                <Text style={styles.fieldValue}>{getSafeDate(safeEquipment.fecha_instalacion)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>F. Acta Recibo:</Text>
                <Text style={styles.fieldValue}>{getSafeDate(safeEquipment.fecha_acta_recibo)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>F. Operación:</Text>
                <Text style={styles.fieldValue}>{getSafeDate(safeEquipment.fecha_inicio_operacion)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>F. Venc. Garantía:</Text>
                <Text style={styles.fieldValue}>{getSafeDate(safeEquipment.fecha_vencimiento_garantia)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>F. Venc. INVIMA:</Text>
                <Text style={styles.fieldValue}>{getSafeDate(safeEquipment.fecha_vencimiento_invima)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Información financiera y propietario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN FINANCIERA Y CONTRACTUAL</Text>
          <View style={styles.fourColumnRow}>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Costo:</Text>
                <Text style={[styles.fieldValue, styles.currencyValue]}>
                  {formatCurrency(safeEquipment.costo)}
                </Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Propietario:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.propietario_nombre)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Propiedad:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.propiedad)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Comodato:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.activo_comodato)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabla de mantenimientos preventivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANTENIMIENTOS PREVENTIVOS RECIENTES</Text>
          <View style={styles.compactTable}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1}]}>Fecha</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 2}]}>Tipo</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 2}]}>Técnico</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1}]}>Estado</Text>
            </View>
            {safeEquipment.mantenimientos_preventivos && safeEquipment.mantenimientos_preventivos.length > 0 ? (
              safeEquipment.mantenimientos_preventivos.slice(0, 5).map((mant, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, {flex: 1}]}>{getSafeDate(mant.fecha_programada)}</Text>
                  <Text style={[styles.tableCell, {flex: 2}]}>{getSafeValue(mant.tipo)}</Text>
                  <Text style={[styles.tableCell, {flex: 2}]}>{getSafeValue(mant.tecnico_nombre)}</Text>
                  <Text style={[styles.tableCell, {flex: 1}]}>{getSafeValue(mant.estado)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 4, textAlign: "center", fontStyle: "italic"}]}>
                  No hay mantenimientos preventivos registrados
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tabla de calibraciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CALIBRACIONES RECIENTES</Text>
          <View style={styles.compactTable}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1.5}]}>Fecha Calibración</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 2}]}>Tipo</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1.5}]}>Próxima</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1}]}>Resultado</Text>
            </View>
            {safeEquipment.calibraciones && safeEquipment.calibraciones.length > 0 ? (
              safeEquipment.calibraciones.slice(0, 4).map((cal, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, {flex: 1.5}]}>{getSafeDate(cal.fecha_calibracion)}</Text>
                  <Text style={[styles.tableCell, {flex: 2}]}>{getSafeValue(cal.tipo_calibracion)}</Text>
                  <Text style={[styles.tableCell, {flex: 1.5}]}>{getSafeDate(cal.proxima_calibracion)}</Text>
                  <Text style={[styles.tableCell, {flex: 1}]}>{getSafeValue(cal.resultado)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 6, textAlign: "center", fontStyle: "italic"}]}>
                  No hay calibraciones registradas
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer de página 1 */}
        <Text style={styles.footer}>
          Documento generado por Sistema EVA - {new Date().toLocaleDateString("es-ES")} - 
          Hospital Universitario del Valle "Evaristo García" - Página 1 de 2
        </Text>
      </Page>

      {/* PÁGINA 2 - Información complementaria */}
      <Page size="A4" style={styles.page}>
        {/* Header reducido para segunda página */}
        <View style={[styles.header, {marginBottom: 8}]}>
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, {fontSize: 11}]}>
              HOJA DE VIDA - {getSafeValue(safeEquipment.name, "EQUIPO")} (Continuación)
            </Text>
            <Text style={[styles.subtitle, {fontSize: 8}]}>
              Código: {getSafeValue(safeEquipment.code)} | Serie: {getSafeValue(safeEquipment.serial)}
            </Text>
          </View>
        </View>

        {/* Tabla de mantenimientos correctivos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANTENIMIENTOS CORRECTIVOS RECIENTES</Text>
          <View style={styles.compactTable}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1}]}>Fecha</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 3}]}>Descripción</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 2}]}>Usuario</Text>
            </View>
            {safeEquipment.contingencias && safeEquipment.contingencias.length > 0 ? (
              safeEquipment.contingencias.slice(0, 6).map((cont, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, {flex: 1}]}>{getSafeDate(cont.fecha_reporte)}</Text>
                  <Text style={[styles.tableCell, {flex: 3}]}>{getSafeValue(cont.descripcion_problema).substring(0, 100)}...</Text>
                  <Text style={[styles.tableCell, {flex: 2}]}>{getSafeValue(cont.usuario_nombre)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 6, textAlign: "center", fontStyle: "italic"}]}>
                  No hay mantenimientos correctivos registrados
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Documentos asociados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DOCUMENTOS ASOCIADOS</Text>
          <View style={styles.compactTable}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 3}]}>Nombre del Documento</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 2}]}>Tipo</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, {flex: 1}]}>Fecha</Text>
            </View>
            {safeEquipment.documentos && safeEquipment.documentos.length > 0 ? (
              safeEquipment.documentos.slice(0, 6).map((doc, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, {flex: 3}]}>{getSafeValue(doc.tipo_documento)}</Text>
                  <Text style={[styles.tableCell, {flex: 2}]}>{getSafeValue(doc.nombre_archivo)}</Text>
                  <Text style={[styles.tableCell, {flex: 1}]}>{getSafeValue(doc.fecha_documento)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 6, textAlign: "center", fontStyle: "italic"}]}>
                  No hay documentos asociados
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Información complementaria en dos columnas */}
        <View style={styles.twoColumnRow}>
          <View style={styles.halfColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CONTACTOS TÉCNICOS</Text>
              {safeEquipment.contactos_tecnicos && safeEquipment.contactos_tecnicos.length > 0 ? (
                <View style={styles.compactList}>
                  {safeEquipment.contactos_tecnicos.slice(0, 5).map((contacto, index) => (
                    <View key={index} style={{marginBottom: 3}}>
                      <Text style={{fontSize: 7, fontWeight: "bold", color: "#1e40af"}}>
                        {getSafeValue(contacto.nombre)}
                      </Text>
                      <Text style={{fontSize: 6, color: "#6b7280"}}>
                        Tel: {getSafeValue(contacto.telefono)}
                      </Text>
                      <Text style={{fontSize: 6, color: "#6b7280"}}>
                        Email: {getSafeValue(contacto.email)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.listItem}>No hay contactos registrados</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACCESORIOS</Text>
              <View style={{padding: 4, backgroundColor: "#f9fafb", borderRadius: 2}}>
                <Text style={{fontSize: 6, color: "#374151"}}>
                  {getSafeValue(safeEquipment.accesorios, "No especificados").replace(/<[^>]*>/g, '')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.halfColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OBSERVACIONES RECIENTES</Text>
              {safeEquipment.observaciones_recientes && safeEquipment.observaciones_recientes.length > 0 ? (
                <View style={styles.compactList}>
                  {safeEquipment.observaciones_recientes.slice(0, 4).map((obs, index) => (
                    <View key={index} style={{marginBottom: 4, padding: 3, backgroundColor: "#fef7f0", borderRadius: 2}}>
                      <Text style={{fontSize: 6, fontWeight: "bold", color: "#1e40af"}}>
                        {getSafeDate(obs.created_at)} - {getSafeValue(obs.usuario_nombre)}
                      </Text>
                      <Text style={{fontSize: 6, color: "#374151"}}>
                        {getSafeValue(obs.observacion).substring(0, 120)}...
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.listItem}>No hay observaciones recientes</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Verificación Inventario:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.verificacion_inventario)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Código Antiguo:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.codigo_antiguo)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Repuesto Pendiente:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.repuesto_pendiente)}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Plan Mantenimiento:</Text>
                <Text style={styles.fieldValue}>{getSafeValue(safeEquipment.plan)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer de página 2 */}
        <Text style={styles.footer}>
          Documento generado por Sistema EVA - {new Date().toLocaleDateString("es-ES")} - 
          Hospital Universitario del Valle "Evaristo García" - Página 2 de 2
        </Text>
      </Page>
    </Document>
  );
};

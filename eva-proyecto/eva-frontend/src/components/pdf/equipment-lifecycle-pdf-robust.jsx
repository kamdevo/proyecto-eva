import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Importar el logo del hospital
const HuvLogo = '/images/logo_huv.jpg';

// Robust styles with no complex properties
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    objectFit: 'contain',
  },
  titleSection: {
    flex: 4,
    paddingLeft: 20,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 3,
  },
  hospitalName: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
    flex: 2,
  },
  value: {
    fontSize: 9,
    color: '#111827',
    flex: 3,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    marginRight: 10,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'solid',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: 4,
    borderRadius: 4,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
  },
});

// Safe value function
const getSafeValue = (value, fallback = 'No disponible') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'object' && value !== null) {
    if (value.name) return String(value.name);
    if (value.nombre) return String(value.nombre);
    return fallback;
  }
  return String(value);
};

// Safe date formatting
const getSafeDate = (date, fallback = 'No disponible') => {
  if (!date || date === null || date === undefined || date === '') {
    return fallback;
  }
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    return dateObj.toLocaleDateString('es-ES');
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
            <Text style={styles.mainTitle}>FORMATO DE HOJA DE VIDA PARA EQUIPOS BIOMÉDICOS</Text>
            <Text style={styles.subtitle}>HOSPITAL UNIVERSITARIO DEL VALLE EVARISTO GARCÍA</Text>
            <Text style={styles.hospitalName}>Sistema EVA - Gestión de Equipos Médicos</Text>
          </View>
        </View>

        {/* Equipment Header */}
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>
              {getSafeValue(safeEquipment.name, 'Equipo Sin Nombre')}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Código:</Text>
              <Text style={styles.value}>{getSafeValue(safeEquipment.code)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Serie:</Text>
              <Text style={styles.value}>{getSafeValue(safeEquipment.serial)}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text>{getSafeValue(safeEquipment.estado_nombre, 'Sin estado')}</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. IDENTIFICACIÓN PRINCIPAL</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>ID:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.id)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Marca:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.marca)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Modelo:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.modelo)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Código Anterior:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.codigo_antiguo)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Technical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. INFORMACIÓN TÉCNICA</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha Fabricación:</Text>
                <Text style={styles.value}>{getSafeDate(safeEquipment.fecha_fabricacion)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Voltaje:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.v1)} V</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Movilidad:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.movilidad)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Clasificación:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.clasificacion_nombre)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. UBICACIÓN</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Sede:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.sede_nombre)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Servicio:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.servicio_nombre)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Área:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.area_nombre)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Localización:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.localizacion_actual)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: Financial Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. INFORMACIÓN FINANCIERA</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Costo:</Text>
                <Text style={styles.value}>${getSafeValue(safeEquipment.costo, '0')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Vida Útil:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.vida_util)} años</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Garantía:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.garantia)} meses</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Propietario:</Text>
                <Text style={styles.value}>{getSafeValue(safeEquipment.propietario_nombre)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 5: Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. FECHAS IMPORTANTES</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Adquisición:</Text>
                <Text style={styles.value}>{getSafeDate(safeEquipment.fecha_ad)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Instalación:</Text>
                <Text style={styles.value}>{getSafeDate(safeEquipment.fecha_instalacion)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Inicio Operación:</Text>
                <Text style={styles.value}>{getSafeDate(safeEquipment.fecha_inicio_operacion)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Acta Recibo:</Text>
                <Text style={styles.value}>{getSafeDate(safeEquipment.fecha_acta_recibo)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Hospital Universitario del Valle - Sistema EVA | Generado el {new Date().toLocaleDateString('es-ES')}
        </Text>
      </Page>
    </Document>
  );
};

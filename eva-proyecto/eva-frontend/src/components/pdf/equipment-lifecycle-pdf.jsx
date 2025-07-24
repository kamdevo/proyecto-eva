import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottom: '2px solid #2563eb',
    paddingBottom: 15,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  titleSection: {
    flex: 4,
    paddingLeft: 20,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 3,
  },
  hospitalName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    border: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    borderBottom: '1px solid #d1d5db',
    paddingBottom: 3,
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
  gridItem3: {
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
    border: '1px solid #bfdbfe',
  },
  equipmentImage: {
    width: 80,
    height: 60,
    marginRight: 15,
    borderRadius: 5,
    border: '1px solid #d1d5db',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
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
    width: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 8,
    color: '#374151',
    fontWeight: 'bold',
  },
});

export const EquipmentLifecyclePDF = ({ equipment }) => {
  // Función para formatear fechas
  const formatDate = (date) => {
    if (!date) return 'No disponible';
    try {
      return new Date(date).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para obtener valor seguro
  const safeValue = (value, fallback = 'No disponible') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object' && value.name) return value.name;
    return String(value);
  };

  // Calcular edad del equipo
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Institucional */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={{ fontSize: 8, textAlign: 'center', color: '#2563eb' }}>HUV</Text>
              <Text style={{ fontSize: 6, textAlign: 'center', color: '#2563eb' }}>LOGO</Text>
            </View>
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
              {safeValue(equipment?.name)}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Código de Inventario:</Text>
              <Text style={styles.value}>{safeValue(equipment?.code)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Número de Serie:</Text>
              <Text style={styles.value}>{safeValue(equipment?.serial)}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text>{safeValue(equipment?.estado_nombre, 'Sin estado')}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. IDENTIFICACIÓN PRINCIPAL</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>ID del Equipo:</Text>
                <Text style={styles.value}>{safeValue(equipment?.id)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Código Anterior:</Text>
                <Text style={styles.value}>{safeValue(equipment?.codigo_antiguo)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Marca:</Text>
                <Text style={styles.value}>{safeValue(equipment?.marca)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Modelo:</Text>
                <Text style={styles.value}>{safeValue(equipment?.modelo)}</Text>
              </View>
            </View>
          </View>
          {equipment?.descripcion && (
            <View style={styles.row}>
              <Text style={styles.label}>Descripción:</Text>
              <Text style={styles.value}>{equipment.descripcion}</Text>
            </View>
          )}
        </View>

        {/* SECCIÓN 2: INFORMACIÓN TÉCNICA DEL FABRICANTE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. INFORMACIÓN TÉCNICA DEL FABRICANTE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Año de Fabricación:</Text>
                <Text style={styles.value}>{formatDate(equipment?.fecha_fabricacion)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>País de Origen:</Text>
                <Text style={styles.value}>{safeValue(equipment?.pais_origen)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Voltaje:</Text>
                <Text style={styles.value}>{safeValue(equipment?.voltaje)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Frecuencia:</Text>
                <Text style={styles.value}>{safeValue(equipment?.frecuencia)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECCIÓN 3: CLASIFICACIONES Y CATEGORIZACIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. CLASIFICACIONES Y CATEGORIZACIÓN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Clasificación Biomédica:</Text>
            <Text style={styles.value}>{safeValue(equipment?.clasificacion_nombre)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Clasificación de Riesgo:</Text>
            <Text style={styles.value}>{safeValue(equipment?.riesgo_nombre)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registro INVIMA:</Text>
            <Text style={styles.value}>{safeValue(equipment?.registro_sanitario)}</Text>
          </View>
        </View>

        {/* SECCIÓN 4: UBICACIÓN Y CONTEXTO OPERATIVO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. UBICACIÓN Y CONTEXTO OPERATIVO</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Sede:</Text>
                <Text style={styles.value}>{safeValue(equipment?.sede_nombre)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Servicio:</Text>
                <Text style={styles.value}>{safeValue(equipment?.servicio_nombre)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Área:</Text>
                <Text style={styles.value}>{safeValue(equipment?.area_nombre)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Movilidad:</Text>
                <Text style={styles.value}>{safeValue(equipment?.movilidad)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECCIÓN 5: INFORMACIÓN FINANCIERA Y CONTRACTUAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. INFORMACIÓN FINANCIERA Y CONTRACTUAL</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Costo de Adquisición:</Text>
                <Text style={styles.value}>{safeValue(equipment?.costo)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Tipo de Adquisición:</Text>
                <Text style={styles.value}>{safeValue(equipment?.tipo_compra)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Propietario:</Text>
                <Text style={styles.value}>{safeValue(equipment?.propietario_nombre)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Vida Útil:</Text>
                <Text style={styles.value}>{safeValue(equipment?.vida_util)} años</Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Número de Contrato:</Text>
            <Text style={styles.value}>{safeValue(equipment?.numero_contrato)}</Text>
          </View>
        </View>

        {/* SECCIÓN 6: CRONOLOGÍA DE FECHAS CRÍTICAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. CRONOLOGÍA DE FECHAS CRÍTICAS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem3}>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de Adquisición:</Text>
                <Text style={styles.value}>{formatDate(equipment?.fecha_ad)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de Instalación:</Text>
                <Text style={styles.value}>{formatDate(equipment?.fecha_instalacion)}</Text>
              </View>
            </View>
            <View style={styles.gridItem3}>
              <View style={styles.row}>
                <Text style={styles.label}>Recepción Almacén:</Text>
                <Text style={styles.value}>{formatDate(equipment?.fecha_recepcion_almacen)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Inicio Operación:</Text>
                <Text style={styles.value}>{formatDate(equipment?.fecha_inicio_operacion)}</Text>
              </View>
            </View>
            <View style={styles.gridItem3}>
              <View style={styles.row}>
                <Text style={styles.label}>Acta de Recibo:</Text>
                <Text style={styles.value}>{formatDate(equipment?.fecha_acta_recibo)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Último Mantenimiento:</Text>
                <Text style={styles.value}>{formatDate(equipment?.ultimo_mantenimiento)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECCIÓN 7: ESTADO OPERATIVO Y DISPONIBILIDAD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. ESTADO OPERATIVO Y DISPONIBILIDAD</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Estado del Equipo:</Text>
                <Text style={styles.value}>{safeValue(equipment?.estado_nombre)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Requiere Calibración:</Text>
                <Text style={styles.value}>{safeValue(equipment?.calibracion)}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Evaluación Desempeño:</Text>
                <Text style={styles.value}>{safeValue(equipment?.evaluacion_desempenio)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Verificación Inventario:</Text>
                <Text style={styles.value}>{safeValue(equipment?.verificacion_inventario)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Edad del Equipo:</Text>
            <Text style={styles.value}>{calculateAge(equipment?.fecha_fabricacion)}</Text>
          </View>
        </View>

        {/* SECCIÓN 8: INFORMACIÓN DE AUDITORÍA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. INFORMACIÓN DE AUDITORÍA Y TRAZABILIDAD</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha de Creación:</Text>
                <Text style={styles.value}>{formatDate(equipment?.created_at)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status del Registro:</Text>
                <Text style={styles.value}>{equipment?.status ? 'Activo' : 'Inactivo'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Archivos Disponibles:</Text>
                <Text style={styles.value}>{safeValue(equipment?.cuenta_archivos, '0')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Última Calibración:</Text>
                <Text style={styles.value}>{formatDate(equipment?.ultima_calibracion)}</Text>
              </View>
            </View>
          </View>
          {equipment?.observacion && (
            <View style={styles.row}>
              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.value}>{equipment.observacion}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Hospital Universitario del Valle - Sistema EVA | Generado el {new Date().toLocaleDateString('es-ES')} a las {new Date().toLocaleTimeString('es-ES')}
        </Text>
      </Page>
    </Document>
  );
};

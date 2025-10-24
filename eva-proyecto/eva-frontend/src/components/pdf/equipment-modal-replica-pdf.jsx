import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Estilos para PDF que replican el modal
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    marginBottom: 15
  },
  logo: {
    width: 100,
    height: 100,
    marginRight: 15
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    marginLeft: 20,
    marginRight: 20
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold'
  },
  systemInfo: {
    fontSize: 8,
    color: '#3b82f6'
  },
  equipmentSection: {
    flexDirection: 'row',
    gap: 15,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10
  },
  equipmentInfo: {
    flex: 1
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  equipmentItem: {
    width: '48%',
    fontSize: 9,
    marginBottom: 4
  },
  imageContainer: {
    width: 80,
    height: 80,
    border: '1pt solid #d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  noImage: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    padding: 8,
    marginBottom: 0,
    marginTop: 15
  },
  table: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    marginBottom: 15
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe'
  },
  tableCellHeader: {
    width: '25%',
    backgroundColor: '#dbeafe',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#bfdbfe',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  tableCellData: {
    width: '25%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#bfdbfe',
    fontSize: 9
  },
  dataTable: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    marginBottom: 10
  },
  dataTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6'
  },
  dataTableHeaderCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#93c5fd',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  dataTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe'
  },
  dataTableCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#bfdbfe',
    fontSize: 8
  },
  historyButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    alignItems: 'center',
    marginTop: 10
  },
  historyButtonText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold'
  },
  footer: {
    backgroundColor: '#fef3cd',
    border: '1pt solid #d97706',
    padding: 8,
    marginTop: 15,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 9,
    color: '#92400e',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  footerSubText: {
    fontSize: 8,
    color: '#b45309',
    textAlign: 'center',
    marginTop: 2
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
    fontSize: 9
  },
  emptyState: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#6b7280',
    padding: 10
  }
});

const EquipmentModalReplicaPDF = ({ data }) => {
  const safeValue = (value, defaultValue = 'N/A') => {
    if (value === null || value === undefined || value === '') return defaultValue;
    if (value === 0) return '0';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object' && value !== null) {
      if (value.name) return value.name;
      if (value.nombre) return value.nombre;
      return JSON.stringify(value);
    }
    return String(value);
  };

  const formatDate = (dateString, fallback = 'N/A') => {
    if (!dateString || dateString === null || dateString === undefined || dateString === '') return fallback;
    try {
      if (typeof dateString === 'string' && dateString.includes('-')) {
        return new Date(dateString).toLocaleDateString('es-ES');
      }
      if (typeof dateString === 'number') {
        return new Date(dateString).toLocaleDateString('es-ES');
      }
      return String(dateString);
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return fallback;
    }
  };

  // Función para convertir imagen a base64
  const [equipmentImageBase64, setEquipmentImageBase64] = React.useState(null);
  const [logoBase64, setLogoBase64] = React.useState(null);

  // Función para convertir imagen de URL a base64 con timeout
  const convertImageToBase64 = async (imageUrl, timeout = 10000) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(imageUrl, { 
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Verificar que es una imagen válida
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          // Verificar que el resultado es válido
          if (result && result.startsWith('data:image/')) {
            resolve(result);
          } else {
            reject(new Error('Invalid base64 result'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Error converting image to base64 (${imageUrl}):`, error.message);
      return null;
    }
  };

  // Cargar imágenes al montar el componente
  React.useEffect(() => {
    const loadImages = async () => {
      // Convertir logo del hospital - probando múltiples rutas
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001";
        const logoPossiblePaths = [
          `${baseUrl}/images/logo_huv.jpg`,
          `${baseUrl}/public/images/logo_huv.jpg`,
          `${baseUrl}/storage/images/logo_huv.jpg`,
          `${baseUrl}/assets/images/logo_huv.jpg`,
          `${baseUrl}/logo_huv.jpg`,
          `${baseUrl}/images/logo_huv.png`,
          `${baseUrl}/public/images/logo_huv.png`
        ];
        
        let logoLoaded = false;
        for (const logoPath of logoPossiblePaths) {
          try {
            const response = await fetch(logoPath, { method: 'HEAD' });
            if (response.ok) {
              const logoBase64Result = await convertImageToBase64(logoPath);
              if (logoBase64Result) {
                setLogoBase64(logoBase64Result);
                console.log(`✅ Logo del hospital cargado desde: ${logoPath}`);
                logoLoaded = true;
                break;
              }
            }
          } catch (e) {
            continue; // Probar la siguiente ruta
          }
        }
        
        if (!logoLoaded) {
          console.warn('⚠️ No se pudo cargar el logo del hospital desde ninguna ruta');
        }
      } catch (error) {
        console.error('❌ Error loading hospital logo:', error);
      }

      // Convertir imagen del equipo si existe - probando múltiples rutas
      const imageFields = [
        data?.image_url, 
        data?.imagen_url, 
        data?.image, 
        data?.imagen,
        data?.foto_url,
        data?.archivo_imagen
      ];
      
      const imageFileName = imageFields.find(field => field && field.trim() !== '');
      
      if (imageFileName) {
        try {
          let imageUrl = imageFileName;
          
          // Si no es una URL completa, probar diferentes rutas del backend
          if (!imageUrl.startsWith('http')) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://192.168.56.1:8001";
            const possiblePaths = [
              `${baseUrl}/storage/equipos/${imageUrl}`,
              `${baseUrl}/storage/app/public/equipos/${imageUrl}`,
              `${baseUrl}/public/storage/equipos/${imageUrl}`,
              `${baseUrl}/images/equipos/${imageUrl}`,
              `${baseUrl}/storage/${imageUrl}`,
              `${baseUrl}/${imageUrl}`
            ];
            
            // Probar cada ruta hasta encontrar una que funcione
            for (const path of possiblePaths) {
              try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                  imageUrl = path;
                  console.log(`✅ Imagen encontrada en: ${path}`);
                  break;
                }
              } catch (e) {
                continue; // Probar la siguiente ruta
              }
            }
          }
          
          const equipmentBase64 = await convertImageToBase64(imageUrl);
          if (equipmentBase64) {
            setEquipmentImageBase64(equipmentBase64);
            console.log(`✅ Imagen del equipo convertida a base64 exitosamente`);
          } else {
            console.warn(`⚠️ No se pudo convertir la imagen: ${imageUrl}`);
          }
        } catch (error) {
          console.error('❌ Error loading equipment image:', error);
        }
      } else {
        console.log('ℹ️ No se encontró imagen para el equipo');
      }
    };

    loadImages();
  }, [data]);

  // Función para obtener la fuente de imagen del equipo
  const getEquipmentImageSource = () => {
    if (equipmentImageBase64) {
      return equipmentImageBase64;
    }
    return null;
  };

  // Logo por defecto en base64 (simple círculo azul con HUV)
  const defaultLogoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSIjMjU2M2ViIiBzdHJva2U9IiMxZDRlZDgiIHN0cm9rZS13aWR0aD0iMyIvPgo8dGV4dCB4PSI1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IVVY8L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IT1NQSVRBTDWVDGV4dD4KPC9zdmc+';

  // Función para obtener la fuente del logo
  const getLogoSource = () => {
    if (logoBase64) {
      return logoBase64;
    }
    // Usar logo por defecto si no se pudo cargar el real
    return defaultLogoBase64;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER IDÉNTICO AL MODAL CON LOGO GRANDE */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image 
              src={getLogoSource()}
              style={{ width: 100, height: 100, objectFit: 'contain' }}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              HOSPITAL UNIVERSITARIO DEL VALLE "EVARISTO GARCÍA"
            </Text>
            <Text style={styles.subtitle}>
              HOJA DE VIDA - {safeValue(data?.name?.toUpperCase())}
            </Text>
            <Text style={styles.systemInfo}>
              Sistema de Gestión EVA - Electromedicina
            </Text>
          </View>
        </View>

        {/* SECCIÓN DE EQUIPO CON IMAGEN */}
        <View style={styles.equipmentSection}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>
              {safeValue(data?.name)}
            </Text>
            <View style={styles.equipmentGrid}>
              <Text style={styles.equipmentItem}>ID: {safeValue(data?.id)}</Text>
              <Text style={styles.equipmentItem}>Código: {safeValue(data?.code)}</Text>
              <Text style={styles.equipmentItem}>Serie: {safeValue(data?.serial)}</Text>
              <Text style={styles.equipmentItem}>Marca: {safeValue(data?.marca)}</Text>
              <Text style={styles.equipmentItem}>Modelo: {safeValue(data?.modelo)}</Text>
              <Text style={styles.equipmentItem}>Estado: {safeValue(data?.estado_nombre)}</Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            {getEquipmentImageSource() ? (
              <Image 
                src={getEquipmentImageSource()} 
                style={{ width: 80, height: 80, objectFit: 'cover' }}
              />
            ) : (
              <Text style={styles.noImage}>
                {equipmentImageBase64 === null ? 'Cargando imagen...' : 'Sin imagen disponible'}
              </Text>
            )}
          </View>
        </View>

        {/* INFORMACIÓN GENERAL Y UBICACIÓN - ESTILO TABULAR */}
        <Text style={styles.sectionTitle}>INFORMACIÓN GENERAL Y UBICACIÓN</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>ID del Equipo</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.id)}</Text>
            <Text style={styles.tableCellHeader}>Código</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.code)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Serie</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.serial)}</Text>
            <Text style={styles.tableCellHeader}>Estado</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.estado_nombre)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Sede</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.sede_nombre)}</Text>
            <Text style={styles.tableCellHeader}>Servicio</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.servicio_nombre)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Área</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.area_nombre)}</Text>
            <Text style={styles.tableCellHeader}>Piso</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.piso)}</Text>
          </View>
        </View>

        {/* CARACTERÍSTICAS TÉCNICAS Y ESPECIFICACIONES */}
        <Text style={styles.sectionTitle}>CARACTERÍSTICAS TÉCNICAS Y ESPECIFICACIONES</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Marca</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.marca)}</Text>
            <Text style={styles.tableCellHeader}>Modelo</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.modelo)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Potencia</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.potencia)}</Text>
            <Text style={styles.tableCellHeader}>Corriente</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.corriente)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>País Origen</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.pais_origen)}</Text>
            <Text style={styles.tableCellHeader}>Frecuencia</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.frecuencia)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Año Fabricación</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_fabricacion, new Date(data?.fecha_fabricacion || Date.now()).getFullYear())}</Text>
            <Text style={styles.tableCellHeader}>Garantía</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.garantia)} años</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Vida Útil</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.vida_util)} años</Text>
            <Text style={styles.tableCellHeader}>Voltaje</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.v1)}</Text>
          </View>
        </View>

        {/* INFORMACIÓN REGULATORIA Y FECHAS CRÍTICAS */}
        <Text style={styles.sectionTitle}>INFORMACIÓN REGULATORIA Y FECHAS CRÍTICAS</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Reg. INVIMA</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.registro_sanitario)}</Text>
            <Text style={styles.tableCellHeader}>Estado INVIMA</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.estado_invima)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>F. Fabricación</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_fabricacion)}</Text>
            <Text style={styles.tableCellHeader}>F. Instalación</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_instalacion)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>F. Acta Recibo</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_acta_recibo)}</Text>
            <Text style={styles.tableCellHeader}>F. Operación</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_inicio_operacion)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>F. Venc. Garantía</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_vencimiento_garantia)}</Text>
            <Text style={styles.tableCellHeader}>F. Venc. INVIMA</Text>
            <Text style={styles.tableCellData}>{formatDate(data?.fecha_vencimiento_invima)}</Text>
          </View>
        </View>

        {/* INFORMACIÓN FINANCIERA Y CONTRACTUAL */}
        <Text style={styles.sectionTitle}>INFORMACIÓN FINANCIERA Y CONTRACTUAL</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Costo</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.costo)}</Text>
            <Text style={styles.tableCellHeader}>Propietario</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.propietario_nombre)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Propiedad</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.propiedad)}</Text>
            <Text style={styles.tableCellHeader}>Comodato</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.activo_comodato)}</Text>
          </View>
        </View>

        {/* MANTENIMIENTOS PREVENTIVOS */}
        <Text style={styles.sectionTitle}>MANTENIMIENTOS PREVENTIVOS RECIENTES</Text>
        <View style={styles.dataTable}>
          <View style={styles.dataTableHeader}>
            <Text style={styles.dataTableHeaderCell}>Fecha</Text>
            <Text style={styles.dataTableHeaderCell}>Tipo</Text>
            <Text style={styles.dataTableHeaderCell}>Técnico</Text>
            <Text style={styles.dataTableHeaderCell}>Estado</Text>
          </View>
          {data?.mantenimientos_preventivos && data.mantenimientos_preventivos.length > 0 ? (
            data.mantenimientos_preventivos.slice(0, 5).map((mant, index) => (
              <View key={index} style={styles.dataTableRow}>
                <Text style={styles.dataTableCell}>{formatDate(mant.fecha_programada)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(mant.tipo)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(mant.tecnico_nombre)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(mant.estado)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.dataTableRow}>
              <Text style={[styles.dataTableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }]}>
                No hay mantenimientos preventivos registrados
              </Text>
            </View>
          )}
        </View>

        {/* CALIBRACIONES RECIENTES */}
        <Text style={styles.sectionTitle}>CALIBRACIONES RECIENTES</Text>
        <View style={styles.dataTable}>
          <View style={styles.dataTableHeader}>
            <Text style={styles.dataTableHeaderCell}>Fecha Calibración</Text>
            <Text style={styles.dataTableHeaderCell}>Tipo</Text>
            <Text style={styles.dataTableHeaderCell}>Próxima</Text>
            <Text style={styles.dataTableHeaderCell}>Resultado</Text>
          </View>
          {data?.calibraciones && data.calibraciones.length > 0 ? (
            data.calibraciones.slice(0, 4).map((cal, index) => (
              <View key={index} style={styles.dataTableRow}>
                <Text style={styles.dataTableCell}>{formatDate(cal.fecha_calibracion)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(cal.tipo_calibracion)}</Text>
                <Text style={styles.dataTableCell}>{formatDate(cal.proxima_calibracion)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(cal.resultado)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.dataTableRow}>
              <Text style={[styles.dataTableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }]}>
                No hay calibraciones registradas
              </Text>
            </View>
          )}
        </View>

        {/* MANTENIMIENTOS CORRECTIVOS RECIENTES */}
        <Text style={styles.sectionTitle}>MANTENIMIENTOS CORRECTIVOS RECIENTES</Text>
        <View style={styles.dataTable}>
          <View style={styles.dataTableHeader}>
            <Text style={styles.dataTableHeaderCell}>Fecha</Text>
            <Text style={styles.dataTableHeaderCell}>Descripción</Text>
            <Text style={styles.dataTableHeaderCell}>Usuario</Text>
          </View>
          {data?.contingencias && data.contingencias.length > 0 ? (
            data.contingencias.slice(0, 6).map((cont, index) => (
              <View key={index} style={styles.dataTableRow}>
                <Text style={styles.dataTableCell}>{formatDate(cont.fecha_reporte)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(cont.descripcion_problema).substring(0, 100)}...</Text>
                <Text style={styles.dataTableCell}>{safeValue(cont.usuario_nombre)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.dataTableRow}>
              <Text style={[styles.dataTableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }]}>
                No hay mantenimientos correctivos registrados
              </Text>
            </View>
          )}
        </View>

        {/* DOCUMENTOS ASOCIADOS CON ENLACES FUNCIONALES */}
        <Text style={styles.sectionTitle}>DOCUMENTOS ASOCIADOS</Text>
        <View style={styles.dataTable}>
          <View style={styles.dataTableHeader}>
            <Text style={styles.dataTableHeaderCell}>Nombre</Text>
            <Text style={styles.dataTableHeaderCell}>Tipo de Documento</Text>
            <Text style={styles.dataTableHeaderCell}>Fecha</Text>
          </View>
          {data?.documentos && data.documentos.length > 0 ? (
            data.documentos.slice(0, 6).map((doc, index) => (
              <View key={index} style={styles.dataTableRow}>
                <Text style={styles.dataTableCell}>
                  {doc.url ? (
                    <Link src={doc.url} style={styles.link}>
                      {safeValue(doc.nombre_archivo)}
                    </Link>
                  ) : (
                    safeValue(doc.nombre_archivo)
                  )}
                </Text>
                <Text style={styles.dataTableCell}>{safeValue(doc.tipo_documento)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(doc.fecha_documento)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.dataTableRow}>
              <Text style={[styles.dataTableCell, { textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }]}>
                No hay documentos asociados
              </Text>
            </View>
          )}
        </View>

        {/* DOCUMENTACIÓN ASOCIADA */}
        <Text style={styles.sectionTitle}>DOCUMENTACIÓN ASOCIADA</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Manual Asociado</Text>
            <Text style={styles.tableCellData}>
              {data?.selectedManualInfo ? (
                <Link src={data.selectedManualInfo.url} style={styles.link}>
                  {data.selectedManualInfo.descripcion}
                </Link>
              ) : data?.manual_id ? (
                'Cargando manual...'
              ) : (
                'Sin manual asociado'
              )}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Guía Rápida Asociada</Text>
            <Text style={styles.tableCellData}>
              {data?.selectedGuideInfo ? (
                <Link 
                  src={`${process.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/storage/guias/${data.selectedGuideInfo.file}`} 
                  style={styles.link}
                >
                  {data.selectedGuideInfo.name}
                </Link>
              ) : data?.guia_id ? (
                'Cargando guía...'
              ) : (
                'Sin guía rápida asociada'
              )}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Accesorios</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.accesorios) || 'No especificados'}</Text>
          </View>
        </View>

        {/* INFORMACIÓN ADICIONAL */}
        <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Verificación Inventario</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.verificacion_inventario)}</Text>
            <Text style={styles.tableCellHeader}>Código Antiguo</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.codigo_antiguo)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHeader}>Repuesto Pendiente</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.repuesto_pendiente)}</Text>
            <Text style={styles.tableCellHeader}>Plan Mantenimiento</Text>
            <Text style={styles.tableCellData}>{safeValue(data?.plan)}</Text>
          </View>
        </View>

        {/* HISTORIAL DE USUARIOS */}
        <Text style={styles.sectionTitle}>HISTORIAL DE ACTIVIDAD DE USUARIOS</Text>
        {data?.userHistory && data.userHistory.length > 0 ? (
          <View style={styles.dataTable}>
            <View style={styles.dataTableHeader}>
              <Text style={styles.dataTableHeaderCell}>Usuario</Text>
              <Text style={styles.dataTableHeaderCell}>Acción</Text>
              <Text style={styles.dataTableHeaderCell}>Detalle</Text>
              <Text style={styles.dataTableHeaderCell}>Fecha</Text>
            </View>
            {data.userHistory.slice(0, 8).map((entry, index) => (
              <View key={index} style={styles.dataTableRow}>
                <Text style={styles.dataTableCell}>{safeValue(entry.usuario)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(entry.accion)}</Text>
                <Text style={styles.dataTableCell}>{safeValue(entry.detalle)}</Text>
                <Text style={styles.dataTableCell}>
                  {formatDate(entry.fecha)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.table, { textAlign: 'center', padding: 20 }]}>
            <Text style={{ fontStyle: 'italic', color: '#6b7280' }}>
              No hay actividad registrada para este equipo
            </Text>
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Modo Solo Lectura
          </Text>
          <Text style={styles.footerSubText}>
            Esta vista es de solo consulta. Los datos se obtienen directamente de la base de datos del sistema EVA.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default EquipmentModalReplicaPDF;

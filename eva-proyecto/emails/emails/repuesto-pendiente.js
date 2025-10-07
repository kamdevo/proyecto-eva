import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const RepuestoPendienteEmail = ({
  preventivo = {
    id: 123,
    fecha_mantenimiento: '2024-10-03 15:30:00',
    observacion: 'Equipo requiere calibración urgente. Se detectó desviación en las mediciones.',
    servicio_nombre: 'RADIOLOGÍA',
    area_nombre: 'Diagnóstico por Imágenes',
    equipo_id: 456,
    equipo_nombre: 'Rayos X Portátil',
    equipo_marca: 'Siemens',
    equipo_modelo: 'MobileDiagnost wDR',
    equipo_codigo: 'RX-001-HUV',
    equipo_serie: 'SN123456789'
  }
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        Notificación de repuesto pendiente - Preventivo #{preventivo.id}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg"
              alt="Hospital Universitario del Valle"
              width="120"
              height="120"
              style={{
                display: 'block',
                margin: 'auto auto 15px auto',
                borderRadius: '10px'
              }}
            />
            <Heading style={headerTitle}>
              PREVENTIVO NRO {preventivo.id}
            </Heading>
          </Section>

          {/* Subtitle */}
          <Section style={subtitle}>
            <Text style={subtitleText}>
              Eva Gestiona la tecnología
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {/* Información Básica */}
            <Row style={infoRow}>
              <Column>
                <Text style={infoLabel}>Código de preventivo:</Text>
              </Column>
              <Column>
                <Text style={infoValue}>{preventivo.id}</Text>
              </Column>
            </Row>

            <Row style={infoRow}>
              <Column>
                <Text style={infoLabel}>Fecha de ejecución:</Text>
              </Column>
              <Column>
                <Text style={infoValue}>
                  {preventivo.fecha_mantenimiento || 'No registrada'}
                </Text>
              </Column>
            </Row>

            {/* Observaciones (si existen) */}
            {preventivo.observacion && (
              <Section style={observationBox}>
                <Heading as="h3" style={sectionTitle}>
                  Observación:
                </Heading>
                <Text style={observationText}>
                  {preventivo.observacion}
                </Text>
              </Section>
            )}

            {/* Ubicación */}
            <Heading as="h3" style={sectionTitle}>
              Ubicación de referencia:
            </Heading>
            <Text style={infoValue}>
              {preventivo.servicio_nombre || 'N/A'}
            </Text>
            {preventivo.area_nombre && (
              <Row style={infoRow}>
                <Column>
                  <Text style={infoLabel}>Área:</Text>
                </Column>
                <Column>
                  <Text style={infoValue}>{preventivo.area_nombre}</Text>
                </Column>
              </Row>
            )}

            {/* Información del Equipo */}
            <Heading as="h3" style={sectionTitle}>
              Información del equipo:
            </Heading>
            <Text style={equipmentInfo}>
              • <strong>Id del equipo en el sistema:</strong> {preventivo.equipo_id || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Nombre del equipo:</strong> {preventivo.equipo_nombre || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Marca del equipo:</strong> {preventivo.equipo_marca || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Modelo del equipo:</strong> {preventivo.equipo_modelo || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Activo fijo del equipo:</strong> {preventivo.equipo_codigo || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Serie del equipo:</strong> {preventivo.equipo_serie || 'N/A'}
            </Text>

            {/* Repuesto Faltante */}
            <Section style={repuestoBox}>
              <Heading as="h3" style={repuestoTitle}>
                Repuesto faltante:
              </Heading>
              <Text style={repuestoText}>
                {preventivo.observacion || 'Repuesto pendiente de especificar'}
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Electromedicina, 2019 - Hospital Universitario del valle</strong>
            </Text>
            <Row style={socialLinks}>
              <Column>
                <Link href="https://twitter.com/HUValleCali" style={socialLink}>
                  Twitter
                </Link>
              </Column>
              <Column>
                <Link href="https://www.facebook.com/HUValleCali" style={socialLink}>
                  Facebook
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RepuestoPendienteEmail;

// Estilos
const main = {
  backgroundColor: '#f4f4f4',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const header = {
  backgroundColor: '#70bbd9',
  padding: '30px 20px',
  textAlign: 'center',
};

const headerTitle = {
  color: '#ffffff',
  margin: '0',
  fontSize: '24px',
  fontWeight: 'bold',
};

const subtitle = {
  backgroundColor: '#5aa9c9',
  padding: '15px 20px',
  textAlign: 'center',
};

const subtitleText = {
  color: '#ffffff',
  fontSize: '16px',
  fontStyle: 'italic',
  margin: '0',
};

const content = {
  padding: '30px 20px',
  backgroundColor: '#ffffff',
};

const sectionTitle = {
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '20px 0 10px 0',
  paddingBottom: '5px',
  borderBottom: '2px solid #70bbd9',
};

const infoRow = {
  padding: '8px 0',
};

const infoLabel = {
  color: '#333333',
  fontWeight: 'bold',
  margin: '0',
};

const infoValue = {
  color: '#666666',
  margin: '0',
};

const observationBox = {
  backgroundColor: '#fff9e6',
  borderLeft: '4px solid #ffc107',
  padding: '15px',
  margin: '15px 0',
};

const observationText = {
  margin: '10px 0 0 0',
  color: '#666',
};

const equipmentInfo = {
  padding: '5px 0',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0',
};

const repuestoBox = {
  backgroundColor: '#ffebee',
  borderLeft: '4px solid #ee4c50',
  padding: '15px',
  margin: '15px 0',
};

const repuestoTitle = {
  border: 'none',
  margin: '0 0 10px 0',
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
};

const repuestoText = {
  margin: '0',
  color: '#333',
  fontWeight: 'bold',
};

const footer = {
  backgroundColor: '#ee4c50',
  padding: '20px',
  textAlign: 'center',
  color: '#ffffff',
};

const footerText = {
  margin: '5px 0',
  fontSize: '12px',
  color: '#ffffff',
};

const socialLinks = {
  marginTop: '15px',
};

const socialLink = {
  color: '#ffffff',
  textDecoration: 'none',
  margin: '0 10px',
  fontSize: '14px',
};

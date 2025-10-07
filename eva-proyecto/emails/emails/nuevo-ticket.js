import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Img,
  Row,
  Column,
  Link
} from '@react-email/components';

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const NuevoTicketEmail = ({
  ticket = {
    id: 789,
    descripcion: 'Falla en el sistema de refrigeración del equipo de resonancia magnética',
    fecha_inicio: '2024-10-03 14:15:00',
    prioridad: 3,
    servicio_nombre: 'RADIOLOGÍA',
    area_nombre: 'Resonancia Magnética',
    equipo_id: 789,
    equipo_nombre: 'Resonancia Magnética 1.5T',
    equipo_marca: 'General Electric',
    equipo_modelo: 'Signa HDxt',
    equipo_codigo: 'RM-002-HUV',
    equipo_serie: 'GE987654321',
    reportante_nombre: 'Dr. Juan Carlos Pérez'
  }
}) => {
  
  // Usar datos reales si se pasan, si no usar defaults
  const ticketData = {
    id: ticket.id || 789,
    descripcion: ticket.descripcion || 'Falla en el sistema de refrigeración del equipo de resonancia magnética',
    fecha_inicio: ticket.fecha_inicio || new Date().toISOString(),
    prioridad: ticket.prioridad || 2,
    servicio_nombre: ticket.servicio_nombre || 'RADIOLOGÍA',
    area_nombre: ticket.area_nombre || 'Resonancia Magnética',
    equipo_id: ticket.equipo_id || 789,
    equipo_nombre: ticket.equipo_nombre || 'Resonancia Magnética 1.5T',
    equipo_marca: ticket.equipo_marca || 'General Electric',
    equipo_modelo: ticket.equipo_modelo || 'Signa HDxt',
    equipo_codigo: ticket.equipo_codigo || 'RM-002-HUV',
    equipo_serie: ticket.equipo_serie || 'GE987654321',
    reportante_nombre: ticket.reportante_nombre || 'Dr. Juan Carlos Pérez'
  };
  
  const getPriorityStyle = (prioridad) => {
    switch (prioridad) {
      case 3:
        return { ...priorityBox, backgroundColor: '#ffebee', color: '#ee4c50' };
      case 2:
        return { ...priorityBox, backgroundColor: '#fff9e6', color: '#ffc107' };
      default:
        return { ...priorityBox, backgroundColor: '#e8f5e9', color: '#4caf50' };
    }
  };

  const getPriorityText = (prioridad) => {
    switch (prioridad) {
      case 3: return 'ALTA';
      case 2: return 'MEDIA';
      default: return 'BAJA';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>
        Creación de Ticket Nro {ticketData.id} - {ticketData.descripcion}
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
              TICKET NRO {ticketData.id}
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
            {/* Asunto */}
            <Row style={infoRow}>
              <Column>
                <Text style={infoLabel}>Asunto:</Text>
              </Column>
              <Column>
                <Text style={infoValue}>
                  {ticketData.descripcion || 'Nuevo ticket creado'}
                </Text>
              </Column>
            </Row>

            {/* Descripción */}
            <Section style={descriptionBox}>
              <Heading as="h3" style={descriptionTitle}>
                Descripción:
              </Heading>
              <Text style={descriptionText}>
                {ticketData.descripcion || 'Sin descripción detallada'}
              </Text>
              <Row style={{ marginTop: '10px' }}>
                <Column>
                  <Text style={infoLabel}>Fecha de registro:</Text>
                </Column>
                <Column>
                  <Text style={infoValue}>
                    {ticketData.fecha_inicio || new Date().toLocaleString()}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Ubicación */}
            <Heading as="h3" style={sectionTitle}>
              Ubicación de referencia:
            </Heading>
            <Text style={infoValue}>
              {ticketData.servicio_nombre || 'N/A'}
            </Text>
            {ticketData.area_nombre && (
              <Row style={infoRow}>
                <Column>
                  <Text style={infoLabel}>Área:</Text>
                </Column>
                <Column>
                  <Text style={infoValue}>{ticketData.area_nombre}</Text>
                </Column>
              </Row>
            )}

            {/* Información del Equipo */}
            <Heading as="h3" style={sectionTitle}>
              Información del equipo:
            </Heading>
            <Text style={equipmentInfo}>
              • <strong>Id del equipo en el sistema:</strong> {ticketData.equipo_id || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Nombre del equipo:</strong> {ticketData.equipo_nombre || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Marca del equipo:</strong> {ticketData.equipo_marca || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Modelo del equipo:</strong> {ticketData.equipo_modelo || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Activo fijo del equipo:</strong> {ticketData.equipo_codigo || 'N/A'}
            </Text>
            <Text style={equipmentInfo}>
              • <strong>Serie del equipo:</strong> {ticketData.equipo_serie || 'N/A'}
            </Text>
            
            {/* Prioridad */}
            <Row style={infoRow}>
              <Column>
                <Text style={equipmentInfo}>
                  • <strong>Prioridad:</strong>
                </Text>
              </Column>
              <Column>
                <Text style={getPriorityStyle(ticketData.prioridad || 1)}>
                  {getPriorityText(ticketData.prioridad || 1)}
                </Text>
              </Column>
            </Row>

            {/* Información del Solicitante */}
            <Heading as="h3" style={sectionTitle}>
              Información del Solicitante:
            </Heading>
            <Text style={equipmentInfo}>
              • <strong>Nombre:</strong> {ticketData.reportante_nombre || 'N/A'}
            </Text>
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

export default NuevoTicketEmail;

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

const descriptionBox = {
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #70bbd9',
  padding: '15px',
  margin: '15px 0',
};

const descriptionTitle = {
  border: 'none',
  margin: '0 0 10px 0',
  color: '#333333',
  fontSize: '16px',
  fontWeight: 'bold',
};

const descriptionText = {
  margin: '0',
  color: '#666',
};

const equipmentInfo = {
  padding: '5px 0',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0',
};

const priorityBox = {
  display: 'inline-block',
  padding: '5px 15px',
  borderRadius: '4px',
  fontWeight: 'bold',
  margin: '10px 0',
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

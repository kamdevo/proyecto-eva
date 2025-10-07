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

export const TestEmail = ({
  email = 'test@example.com',
  fecha = new Date().toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        Prueba Sistema EVA - Hospital Universitario del Valle
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
              PRUEBA DE CORREO
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
            {/* Success Box */}
            <Section style={successBox}>
              <Heading as="h3" style={successTitle}>
                ✅ ¡Configuración Exitosa!
              </Heading>
              <Text style={successText}>
                Si recibes este mensaje, la configuración de correo del Sistema EVA está funcionando correctamente.
              </Text>
            </Section>

            {/* System Info */}
            <Section style={infoSection}>
              <Heading as="h4" style={infoSectionTitle}>
                📋 Información del Sistema:
              </Heading>
              <Text style={infoRow}>
                • <strong>Sistema:</strong> EVA - Gestión Hospitalaria
              </Text>
              <Text style={infoRow}>
                • <strong>Servidor:</strong> Hospital Universitario del Valle
              </Text>
              <Text style={infoRow}>
                • <strong>Fecha:</strong> {fecha}
              </Text>
              <Text style={infoRow}>
                • <strong>Destinatario:</strong> {email}
              </Text>
            </Section>

            {/* Design Features */}
            <Section style={infoSection}>
              <Heading as="h4" style={infoSectionTitle}>
                🎨 Características del Diseño:
              </Heading>
              <Text style={infoRow}>
                • <strong>Header:</strong> Azul institucional (#70bbd9)
              </Text>
              <Text style={infoRow}>
                • <strong>Footer:</strong> Rojo institucional (#ee4c50)
              </Text>
              <Text style={infoRow}>
                • <strong>Tipografía:</strong> Arial, sans-serif
              </Text>
              <Text style={infoRow}>
                • <strong>Responsive:</strong> Compatible con todos los dispositivos
              </Text>
              <Text style={infoRow}>
                • <strong>Tecnología:</strong> React Email + JSX
              </Text>
            </Section>

            <Text style={centerText}>
              <strong>El sistema de notificaciones está listo para usar.</strong>
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

export default TestEmail;

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

const successBox = {
  backgroundColor: '#e8f5e9',
  borderLeft: '4px solid #4caf50',
  padding: '20px',
  margin: '20px 0',
  borderRadius: '4px',
};

const successTitle = {
  color: '#2e7d32',
  margin: '0 0 10px 0',
  fontSize: '18px',
};

const successText = {
  color: '#388e3c',
  margin: '0',
  lineHeight: '1.6',
};

const infoSection = {
  margin: '20px 0',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
};

const infoSectionTitle = {
  color: '#333333',
  margin: '0 0 10px 0',
  fontSize: '16px',
};

const infoRow = {
  padding: '5px 0',
  color: '#666666',
  margin: '0',
};

const centerText = {
  textAlign: 'center',
  marginTop: '30px',
  color: '#666',
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

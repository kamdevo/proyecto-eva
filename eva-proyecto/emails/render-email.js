import { render } from '@react-email/render';
import fs from 'fs';
import path from 'path';
import React from 'react';

// Importar las plantillas
import { NuevoTicketEmail } from './emails/nuevo-ticket.js';
import { RepuestoPendienteEmail } from './emails/repuesto-pendiente.js';
import { TestEmail } from './emails/test-email.js';

// Obtener argumentos
const template = process.argv[2];
const dataFile = process.argv[3];

if (!template) {
  console.error('❌ Uso: node render-email.js <template> [data-file]');
  process.exit(1);
}

try {
  // Leer datos si se proporciona archivo
  let data = {};
  if (dataFile && fs.existsSync(dataFile)) {
    const dataContent = fs.readFileSync(dataFile, 'utf-8');
    data = JSON.parse(dataContent);
    console.error(`📊 Datos cargados desde ${dataFile}:`, JSON.stringify(data, null, 2));
  }

  let emailComponent;
  
  // Seleccionar plantilla y pasar datos reales
  switch (template) {
    case 'nuevo-ticket':
      emailComponent = React.createElement(NuevoTicketEmail, { 
        ticket: data.ticket || {} 
      });
      break;
      
    case 'repuesto-pendiente':
      emailComponent = React.createElement(RepuestoPendienteEmail, { 
        preventivo: data.preventivo || {} 
      });
      break;
      
    case 'test-email':
      emailComponent = React.createElement(TestEmail, { 
        email: data.email || 'test@example.com' 
      });
      break;
      
    default:
      throw new Error(`❌ Template no encontrado: ${template}`);
  }

  // Renderizar con @react-email/render
  const html = render(emailComponent, {
    pretty: true,
    plainText: false
  });

  console.log(html);

} catch (error) {
  console.error('❌ Error renderizando email:', error.message);
  
  // Fallback básico con datos si es posible
  const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Fallback - ${template}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
        .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
        .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
        .error-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 ${template.toUpperCase().replace('-', ' ')}</h1>
        </div>
        <div class="subtitle">
            <p>Eva Gestiona la tecnología</p>
        </div>
        <div class="content">
            <div class="error-box">
                <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ Fallback HTML</h3>
                <p style="color: #856404; margin: 0;">
                    React Email falló. Usando HTML básico para: <strong>${template}</strong>
                </p>
            </div>
        </div>
        <div class="footer">
            <p style="margin: 5px 0; font-size: 12px;">
                <strong>Electromedicina, 2019 - Hospital Universitario del valle</strong>
            </p>
        </div>
    </div>
</body>
</html>`;
  
  console.log(fallbackHtml);
}

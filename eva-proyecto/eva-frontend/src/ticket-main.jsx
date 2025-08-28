/**
 * ========================================
 * TICKET MAIN - SISTEMA EVA
 * ========================================
 * 
 * Punto de entrada específico para la aplicación de tickets
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import TicketApp from './TicketApp.jsx';
import './index.css';

// Configuración global para desarrollo
if (import.meta.env.DEV) {
  // Configurar console logs más detallados en desarrollo
  console.log('🎯 Sistema EVA - Aplicación de Tickets iniciada');
  console.log('📋 Componentes disponibles:');
  console.log('  - ClosedTickets: /closed-tickets');
  console.log('  - GestionTickets: /gestion-tickets');
  console.log('  - MyTickets: /my-tickets');
}

// Crear root y renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TicketApp />
  </React.StrictMode>,
);

// Exponer utilidades globales en desarrollo
if (import.meta.env.DEV) {
  window.EVA_TICKETS = {
    version: '2.0.0',
    components: ['ClosedTickets', 'GestionTickets', 'MyTickets'],
    routes: {
      home: '/',
      closedTickets: '/closed-tickets',
      gestionTickets: '/gestion-tickets',
      myTickets: '/my-tickets'
    }
  };
}

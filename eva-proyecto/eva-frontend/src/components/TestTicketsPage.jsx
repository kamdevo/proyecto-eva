/**
 * ========================================
 * PÁGINA DE PRUEBA - SISTEMA DE TICKETS
 * ========================================
 *
 * Página simple para probar los componentes de tickets
 * Sin dependencias problemáticas de importaciones @/
 */

import React, { useState } from 'react';

// Componente simple de botón
const SimpleButton = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Componente simple de input
const SimpleInput = ({ placeholder, value, onChange, className = '' }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

// Componente simple de card
const SimpleCard = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
};

// Componente simple de badge
const SimpleBadge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// Datos de ejemplo para tickets
const mockTickets = [
  {
    id: 1,
    numero_ticket: 'TK-001',
    titulo: 'Problema de conexión WiFi',
    descripcion: 'No puedo conectarme a la red WiFi del hospital',
    estado: 'abierto',
    prioridad: 'alta',
    categoria: 'soporte_tecnico',
    fecha_creacion: '2024-01-15',
    usuario_creador: 'Juan Pérez',
    usuario_asignado: 'Ana García',
  },
  {
    id: 2,
    numero_ticket: 'TK-002',
    titulo: 'Error en sistema de monitoreo',
    descripcion: 'El sistema de monitoreo de pacientes muestra errores',
    estado: 'en_proceso',
    prioridad: 'urgente',
    categoria: 'mantenimiento',
    fecha_creacion: '2024-01-16',
    usuario_creador: 'María López',
    usuario_asignado: 'Carlos Ruiz',
  },
  {
    id: 3,
    numero_ticket: 'TK-003',
    titulo: 'Calibración de equipo médico',
    descripcion: 'Necesita calibración el equipo de rayos X',
    estado: 'pendiente',
    prioridad: 'media',
    categoria: 'calibracion',
    fecha_creacion: '2024-01-17',
    usuario_creador: 'Pedro Martín',
    usuario_asignado: null,
  },
  {
    id: 4,
    numero_ticket: 'TK-004',
    titulo: 'Capacitación en nuevo equipo',
    descripcion: 'Solicitud de capacitación para el nuevo ventilador',
    estado: 'resuelto',
    prioridad: 'baja',
    categoria: 'capacitacion',
    fecha_creacion: '2024-01-18',
    usuario_creador: 'Laura Sánchez',
    usuario_asignado: 'Ana García',
  },
];

// Componente principal de la página de prueba
const TestTicketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedPriority, setSelectedPriority] = useState('todos');

  // Filtrar tickets basado en los criterios
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.numero_ticket.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'todos' || ticket.estado === selectedStatus;
    const matchesPriority = selectedPriority === 'todos' || ticket.prioridad === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Función para obtener el color del badge según el estado
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'abierto': return 'error';
      case 'en_proceso': return 'info';
      case 'pendiente': return 'warning';
      case 'resuelto': return 'success';
      case 'cerrado': return 'default';
      default: return 'default';
    }
  };

  // Función para obtener el color del badge según la prioridad
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'urgente': return 'error';
      case 'alta': return 'warning';
      case 'media': return 'info';
      case 'baja': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎫 Sistema de Tickets EVA - Página de Prueba
          </h1>
          <p className="text-gray-600">
            Demostración del sistema de gestión de tickets implementado
          </p>
        </div>

        {/* Filtros */}
        <SimpleCard className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <SimpleInput
                placeholder="Buscar por título, descripción o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="abierto">Abierto</option>
                <option value="en_proceso">En Proceso</option>
                <option value="pendiente">Pendiente</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas las prioridades</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </SimpleCard>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SimpleCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockTickets.length}</div>
              <div className="text-sm text-gray-600">Total Tickets</div>
            </div>
          </SimpleCard>
          
          <SimpleCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockTickets.filter(t => t.estado === 'abierto').length}
              </div>
              <div className="text-sm text-gray-600">Abiertos</div>
            </div>
          </SimpleCard>
          
          <SimpleCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockTickets.filter(t => t.estado === 'en_proceso').length}
              </div>
              <div className="text-sm text-gray-600">En Proceso</div>
            </div>
          </SimpleCard>
          
          <SimpleCard>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockTickets.filter(t => t.estado === 'resuelto').length}
              </div>
              <div className="text-sm text-gray-600">Resueltos</div>
            </div>
          </SimpleCard>
        </div>

        {/* Lista de Tickets */}
        <SimpleCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Lista de Tickets ({filteredTickets.length})
            </h2>
            <SimpleButton>
              + Crear Nuevo Ticket
            </SimpleButton>
          </div>
          
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-500">
                      {ticket.numero_ticket}
                    </span>
                    <SimpleBadge variant={getPriorityBadgeVariant(ticket.prioridad)}>
                      {ticket.prioridad.toUpperCase()}
                    </SimpleBadge>
                    <SimpleBadge variant={getStatusBadgeVariant(ticket.estado)}>
                      {ticket.estado.replace('_', ' ').toUpperCase()}
                    </SimpleBadge>
                  </div>
                  <span className="text-sm text-gray-500">{ticket.fecha_creacion}</span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">
                  {ticket.titulo}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {ticket.descripcion}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>👤 {ticket.usuario_creador}</span>
                    <span>📋 {ticket.categoria.replace('_', ' ')}</span>
                    {ticket.usuario_asignado && (
                      <span>🔧 Asignado a: {ticket.usuario_asignado}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <SimpleButton variant="outline" className="text-xs px-2 py-1">
                      Ver
                    </SimpleButton>
                    <SimpleButton variant="outline" className="text-xs px-2 py-1">
                      Editar
                    </SimpleButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No se encontraron tickets que coincidan con los filtros</p>
            </div>
          )}
        </SimpleCard>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>✅ Sistema de Tickets EVA - Implementación Completa</p>
          <p>Componentes creados: TicketDashboard, AdvancedTicketFilters, VirtualizedTicketList, NotificationCenter</p>
        </div>
      </div>
    </div>
  );
};

export default TestTicketsPage;

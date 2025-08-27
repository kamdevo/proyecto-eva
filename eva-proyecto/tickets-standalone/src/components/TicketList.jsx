import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  User, 
  Tag,
  RefreshCw,
  Plus
} from 'lucide-react'

// Datos mock de tickets
const mockTickets = [
  {
    id: 1,
    numero_ticket: 'TK-001',
    titulo: 'Problema de conexión WiFi en sala de emergencias',
    descripcion: 'Los equipos médicos no pueden conectarse a la red WiFi, afectando el monitoreo de pacientes',
    estado: 'abierto',
    prioridad: 'urgente',
    categoria: 'soporte_tecnico',
    fecha_creacion: '2024-01-15T10:30:00Z',
    fecha_limite: '2024-01-16T18:00:00Z',
    usuario_creador: 'Dr. Juan Pérez',
    usuario_asignado: 'Ana García',
    equipo: 'Monitor de signos vitales - Sala 101',
  },
  {
    id: 2,
    numero_ticket: 'TK-002',
    titulo: 'Calibración de equipo de rayos X',
    descripcion: 'El equipo de rayos X requiere calibración mensual según protocolo',
    estado: 'en_proceso',
    prioridad: 'alta',
    categoria: 'calibracion',
    fecha_creacion: '2024-01-16T08:15:00Z',
    fecha_limite: '2024-01-20T17:00:00Z',
    usuario_creador: 'Técnico María López',
    usuario_asignado: 'Carlos Ruiz',
    equipo: 'Equipo de Rayos X - Radiología',
  },
  {
    id: 3,
    numero_ticket: 'TK-003',
    titulo: 'Mantenimiento preventivo ventilador',
    descripcion: 'Mantenimiento preventivo programado para ventilador mecánico',
    estado: 'pendiente',
    prioridad: 'media',
    categoria: 'mantenimiento',
    fecha_creacion: '2024-01-17T14:20:00Z',
    fecha_limite: '2024-01-25T16:00:00Z',
    usuario_creador: 'Enfermera Laura Sánchez',
    usuario_asignado: null,
    equipo: 'Ventilador Mecánico - UCI',
  },
  {
    id: 4,
    numero_ticket: 'TK-004',
    titulo: 'Capacitación en nuevo desfibrilador',
    descripcion: 'Solicitud de capacitación para el personal en el uso del nuevo desfibrilador',
    estado: 'resuelto',
    prioridad: 'baja',
    categoria: 'capacitacion',
    fecha_creacion: '2024-01-18T09:45:00Z',
    fecha_limite: '2024-01-30T17:00:00Z',
    usuario_creador: 'Jefe de Enfermería Pedro Martín',
    usuario_asignado: 'Ana García',
    equipo: 'Desfibrilador - Emergencias',
  },
  {
    id: 5,
    numero_ticket: 'TK-005',
    titulo: 'Error en sistema de monitoreo central',
    descripcion: 'El sistema central de monitoreo muestra errores intermitentes',
    estado: 'abierto',
    prioridad: 'alta',
    categoria: 'soporte_tecnico',
    fecha_creacion: '2024-01-19T11:30:00Z',
    fecha_limite: '2024-01-21T18:00:00Z',
    usuario_creador: 'Supervisor Técnico Roberto Silva',
    usuario_asignado: 'Carlos Ruiz',
    equipo: 'Sistema Central de Monitoreo',
  },
  {
    id: 6,
    numero_ticket: 'TK-006',
    titulo: 'Instalación de nuevo equipo de ultrasonido',
    descripcion: 'Instalación y configuración de nuevo equipo de ultrasonido',
    estado: 'cerrado',
    prioridad: 'media',
    categoria: 'instalacion',
    fecha_creacion: '2024-01-10T16:00:00Z',
    fecha_limite: '2024-01-15T17:00:00Z',
    usuario_creador: 'Dr. Carmen Rodríguez',
    usuario_asignado: 'Ana García',
    equipo: 'Equipo de Ultrasonido - Ginecología',
  },
]

export default function TicketList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [priorityFilter, setPriorityFilter] = useState('todos')
  const [categoryFilter, setCategoryFilter] = useState('todos')

  // Filtrar tickets
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      const matchesSearch = 
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.numero_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.usuario_creador.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'todos' || ticket.estado === statusFilter
      const matchesPriority = priorityFilter === 'todos' || ticket.prioridad === priorityFilter
      const matchesCategory = categoryFilter === 'todos' || ticket.categoria === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'destructive'
      case 'en_proceso': return 'default'
      case 'pendiente': return 'outline'
      case 'resuelto': return 'secondary'
      case 'cerrado': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgente': return 'destructive'
      case 'alta': return 'destructive'
      case 'media': return 'default'
      case 'baja': return 'secondary'
      default: return 'outline'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (fechaLimite, estado) => {
    if (estado === 'resuelto' || estado === 'cerrado') return false
    return new Date(fechaLimite) < new Date()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de Tickets</h1>
          <p className="text-gray-600">
            {filteredTickets.length} de {mockTickets.length} tickets
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Link to="/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En Proceso</option>
              <option value="pendiente">Pendiente</option>
              <option value="resuelto">Resuelto</option>
              <option value="cerrado">Cerrado</option>
            </select>

            {/* Prioridad */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todas las prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            {/* Categoría */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todos">Todas las categorías</option>
              <option value="soporte_tecnico">Soporte Técnico</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="calibracion">Calibración</option>
              <option value="capacitacion">Capacitación</option>
              <option value="instalacion">Instalación</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header del ticket */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-500">
                      {ticket.numero_ticket}
                    </span>
                    <Badge variant={getPriorityColor(ticket.prioridad)}>
                      {ticket.prioridad.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.estado)}>
                      {ticket.estado.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {isOverdue(ticket.fecha_limite, ticket.estado) && (
                      <Badge variant="destructive">VENCIDO</Badge>
                    )}
                  </div>

                  {/* Título y descripción */}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {ticket.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {ticket.descripcion}
                  </p>

                  {/* Información adicional */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ticket.usuario_creador}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(ticket.fecha_creacion)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{ticket.categoria.replace('_', ' ')}</span>
                    </div>
                    {ticket.usuario_asignado && (
                      <div className="flex items-center gap-1">
                        <span>🔧 Asignado a: {ticket.usuario_asignado}</span>
                      </div>
                    )}
                  </div>

                  {/* Equipo */}
                  {ticket.equipo && (
                    <div className="mt-2 text-xs text-blue-600">
                      📱 {ticket.equipo}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center ml-4">
                  <Link to={`/tickets/${ticket.id}`}>
                    <Button variant="ghost" size="sm">
                      Ver detalles
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron tickets
            </h3>
            <p className="text-gray-600 mb-4">
              No hay tickets que coincidan con los filtros seleccionados
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setStatusFilter('todos')
              setPriorityFilter('todos')
              setCategoryFilter('todos')
            }}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

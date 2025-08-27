import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  User, 
  Calendar, 
  Tag,
  MapPin,
  Wrench,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

// Datos mock del ticket
const mockTicketData = {
  1: {
    id: 1,
    numero_ticket: 'TK-001',
    titulo: 'Problema de conexión WiFi en sala de emergencias',
    descripcion: 'Los equipos médicos no pueden conectarse a la red WiFi, afectando el monitoreo de pacientes. El problema comenzó esta mañana alrededor de las 8:00 AM y afecta a todos los dispositivos en la sala de emergencias.',
    estado: 'abierto',
    prioridad: 'urgente',
    categoria: 'soporte_tecnico',
    fecha_creacion: '2024-01-15T10:30:00Z',
    fecha_limite: '2024-01-16T18:00:00Z',
    fecha_actualizacion: '2024-01-15T14:20:00Z',
    usuario_creador: 'Dr. Juan Pérez',
    usuario_asignado: 'Ana García',
    equipo: 'Monitor de signos vitales - Sala 101',
    ubicacion: 'Sala de Emergencias - Piso 1',
    solucion: null,
    comentarios: [
      {
        id: 1,
        usuario: 'Dr. Juan Pérez',
        fecha: '2024-01-15T10:30:00Z',
        mensaje: 'Ticket creado. El problema afecta el monitoreo de 3 pacientes críticos.',
        tipo: 'comentario'
      },
      {
        id: 2,
        usuario: 'Ana García',
        fecha: '2024-01-15T11:15:00Z',
        mensaje: 'Ticket asignado. Revisando la configuración de red.',
        tipo: 'sistema'
      },
      {
        id: 3,
        usuario: 'Ana García',
        fecha: '2024-01-15T14:20:00Z',
        mensaje: 'Identificado problema en el router principal. Solicitando reemplazo.',
        tipo: 'comentario'
      }
    ],
    historial: [
      {
        fecha: '2024-01-15T10:30:00Z',
        accion: 'Ticket creado',
        usuario: 'Dr. Juan Pérez'
      },
      {
        fecha: '2024-01-15T11:15:00Z',
        accion: 'Asignado a Ana García',
        usuario: 'Sistema'
      },
      {
        fecha: '2024-01-15T14:20:00Z',
        accion: 'Comentario agregado',
        usuario: 'Ana García'
      }
    ]
  }
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  const ticket = mockTicketData[id]

  if (!ticket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ticket no encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              El ticket solicitado no existe o ha sido eliminado.
            </p>
            <Button onClick={() => navigate('/tickets')}>
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  const addComment = () => {
    if (!newComment.trim()) return
    
    setIsAddingComment(true)
    setTimeout(() => {
      // Simular agregar comentario
      setNewComment('')
      setIsAddingComment(false)
      alert('Comentario agregado exitosamente')
    }, 1000)
  }

  const changeStatus = (newStatus) => {
    alert(`Estado cambiado a: ${newStatus}`)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {ticket.numero_ticket}
              </h1>
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
            <h2 className="text-xl text-gray-700">{ticket.titulo}</h2>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <select
            onChange={(e) => changeStatus(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue={ticket.estado}
          >
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En Proceso</option>
            <option value="pendiente">Pendiente</option>
            <option value="resuelto">Resuelto</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.descripcion}</p>
            </CardContent>
          </Card>

          {/* Comentarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comentarios ({ticket.comentarios.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {ticket.comentarios.map((comentario) => (
                  <div key={comentario.id} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comentario.usuario}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comentario.fecha)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comentario.mensaje}</p>
                    {comentario.tipo === 'sistema' && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Agregar comentario */}
              <div className="border-t pt-4">
                <textarea
                  placeholder="Agregar un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={addComment} 
                    disabled={!newComment.trim() || isAddingComment}
                    size="sm"
                  >
                    {isAddingComment ? 'Agregando...' : 'Agregar Comentario'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información del ticket */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Creado por</div>
                  <div className="text-sm text-gray-600">{ticket.usuario_creador}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Wrench className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Asignado a</div>
                  <div className="text-sm text-gray-600">
                    {ticket.usuario_asignado || 'Sin asignar'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Fecha de creación</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(ticket.fecha_creacion)}
                  </div>
                </div>
              </div>

              {ticket.fecha_limite && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Fecha límite</div>
                    <div className={`text-sm ${
                      isOverdue(ticket.fecha_limite, ticket.estado) 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {formatDate(ticket.fecha_limite)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Categoría</div>
                  <div className="text-sm text-gray-600">
                    {ticket.categoria.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {ticket.ubicacion && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Ubicación</div>
                    <div className="text-sm text-gray-600">{ticket.ubicacion}</div>
                  </div>
                </div>
              )}

              {ticket.equipo && (
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Equipo</div>
                    <div className="text-sm text-gray-600">{ticket.equipo}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => changeStatus('en_proceso')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Marcar en proceso
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => changeStatus('resuelto')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como resuelto
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => changeStatus('cerrado')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cerrar ticket
              </Button>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticket.historial.map((evento, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{evento.accion}</div>
                    <div className="text-gray-600">
                      {evento.usuario} - {formatDate(evento.fecha)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

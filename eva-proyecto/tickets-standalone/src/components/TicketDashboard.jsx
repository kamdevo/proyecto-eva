import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react'

// Datos mock para el dashboard
const mockStats = {
  totalTickets: 156,
  ticketsAbiertos: 23,
  ticketsEnProceso: 18,
  ticketsResueltos: 115,
  tiempoPromedioResolucion: 4.2,
  ticketsVencidos: 5,
  ticketsHoy: 8,
  ticketsSemana: 34,
}

const mockCategoryData = [
  { name: 'Soporte Técnico', value: 45, color: '#3b82f6' },
  { name: 'Mantenimiento', value: 32, color: '#10b981' },
  { name: 'Calibración', value: 28, color: '#f59e0b' },
  { name: 'Capacitación', value: 18, color: '#8b5cf6' },
  { name: 'Otro', value: 12, color: '#6b7280' },
]

const mockRecentTickets = [
  {
    id: 1,
    numero: 'TK-001',
    titulo: 'Problema de conexión WiFi',
    estado: 'abierto',
    prioridad: 'alta',
    fecha: '2024-01-15',
  },
  {
    id: 2,
    numero: 'TK-002',
    titulo: 'Calibración de equipo médico',
    estado: 'en_proceso',
    prioridad: 'media',
    fecha: '2024-01-16',
  },
  {
    id: 3,
    numero: 'TK-003',
    titulo: 'Capacitación en nuevo equipo',
    estado: 'resuelto',
    prioridad: 'baja',
    fecha: '2024-01-17',
  },
]

const mockTrendData = [
  { mes: 'Ene', tickets: 45 },
  { mes: 'Feb', tickets: 52 },
  { mes: 'Mar', tickets: 48 },
  { mes: 'Abr', tickets: 61 },
  { mes: 'May', tickets: 55 },
  { mes: 'Jun', tickets: 67 },
]

export default function TicketDashboard() {
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLastUpdate(new Date())
    }, 1000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'destructive'
      case 'en_proceso': return 'default'
      case 'resuelto': return 'secondary'
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tickets</h1>
          <p className="text-gray-600">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockStats.ticketsAbiertos}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.ticketsVencidos} vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockStats.ticketsEnProceso}</div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio: {mockStats.tiempoPromedioResolucion}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.ticketsResueltos}</div>
            <p className="text-xs text-muted-foreground">
              74% de resolución
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos y datos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCategoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{category.value}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: category.color,
                          width: `${(category.value / Math.max(...mockCategoryData.map(c => c.value))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendencia mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Tickets por mes</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="grid grid-cols-6 gap-2">
                {mockTrendData.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{item.mes}</div>
                    <div 
                      className="bg-blue-500 rounded-t"
                      style={{ 
                        height: `${(item.tickets / Math.max(...mockTrendData.map(d => d.tickets))) * 60}px`,
                        minHeight: '10px'
                      }}
                    />
                    <div className="text-xs font-medium mt-1">{item.tickets}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-sm text-gray-500">{ticket.numero}</span>
                  <div>
                    <h4 className="font-medium">{ticket.titulo}</h4>
                    <p className="text-sm text-gray-600">{ticket.fecha}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(ticket.prioridad)}>
                    {ticket.prioridad}
                  </Badge>
                  <Badge variant={getStatusColor(ticket.estado)}>
                    {ticket.estado.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.ticketsHoy}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.ticketsSemana}</div>
            <p className="text-xs text-muted-foreground">
              +15% vs semana anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.tiempoPromedioResolucion}h</div>
            <p className="text-xs text-muted-foreground">
              -0.5h vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TicketDashboard from './components/TicketDashboard'
import TicketList from './components/TicketList'
import CreateTicket from './components/CreateTicket'
import TicketDetail from './components/TicketDetail'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-2xl font-bold text-blue-600">🎫</span>
                  <span className="ml-2 text-xl font-semibold text-gray-900">
                    Sistema de Tickets EVA
                  </span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link to="/tickets">
                  <Button variant="ghost">Tickets</Button>
                </Link>
                <Link to="/create">
                  <Button>Crear Ticket</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<TicketDashboard />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/create" element={<CreateTicket />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

// Página de inicio
function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎫 Sistema de Tickets EVA
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Gestión completa de tickets para equipos médicos e industriales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              📊 Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visualiza estadísticas y métricas del sistema de tickets
            </p>
            <Link to="/dashboard">
              <Button className="w-full">Ver Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              📋 Lista de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Gestiona y filtra todos los tickets del sistema
            </p>
            <Link to="/tickets">
              <Button className="w-full">Ver Tickets</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              ➕ Crear Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Crea un nuevo ticket de soporte o mantenimiento
            </p>
            <Link to="/create">
              <Button className="w-full">Crear Nuevo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Características Implementadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✅ Completado</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Dashboard con estadísticas</li>
                <li>• Lista de tickets con filtros</li>
                <li>• Creación de tickets</li>
                <li>• Gestión de estados</li>
                <li>• Filtros avanzados</li>
                <li>• Búsqueda en tiempo real</li>
                <li>• Interfaz responsive</li>
                <li>• Componentes reutilizables</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🔧 Tecnologías</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• React 18</li>
                <li>• Vite</li>
                <li>• Tailwind CSS</li>
                <li>• React Router</li>
                <li>• Lucide Icons</li>
                <li>• Componentes UI personalizados</li>
                <li>• Hooks personalizados</li>
                <li>• Estado local optimizado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

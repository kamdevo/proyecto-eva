import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FolderOpen,
  Settings,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  RefreshCw
} from 'lucide-react';

export default function PrototypeNavigation() {
  const prototypes = [
    {
      title: 'Tickets Cerrados',
      description: 'Visualización y gestión de tickets cerrados con filtros avanzados',
      path: '/prototype/closed-tickets',
      icon: CheckCircle,
      color: 'bg-green-500',
      features: [
        'Filtros por tipo de documento',
        'Vista responsive (desktop/mobile)',
        'Modal de visualización de documentos',
        'Estadísticas dinámicas',
        'Integración con backend'
      ]
    },
    {
      title: 'Gestión de Tickets',
      description: 'Panel completo para gestionar todos los tickets del sistema',
      path: '/prototype/gestion-tickets',
      icon: Settings,
      color: 'bg-blue-500',
      features: [
        'Búsqueda en tiempo real',
        'Filtros por origen',
        'Paginación avanzada',
        'Vista de tarjetas móviles',
        'Modal de órdenes de trabajo'
      ]
    },
    {
      title: 'Mis Tickets',
      description: 'Creación y gestión de tickets personales con formularios especializados',
      path: '/prototype/my-tickets',
      icon: FileText,
      color: 'bg-purple-500',
      features: [
        'Formularios para equipos licenciados',
        'Formularios para equipos industriales',
        'Formularios para infraestructura',
        'Carga de archivos',
        'Validación de formularios'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Prototipos de Componentes EVA
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Componentes mejorados para el sistema de gestión de tickets con integración 
            completa al backend, diseño responsive y funcionalidades avanzadas.
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Estado del Desarrollo</h3>
              <p className="text-sm text-blue-700">
                Componentes completados y listos para pruebas. Integración con backend implementada 
                con datos de fallback para desarrollo.
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {prototypes.map((prototype, index) => {
            const IconComponent = prototype.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${prototype.color}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{prototype.title}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {prototype.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Características:
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {prototype.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link to={prototype.path}>
                      <Button className="w-full mt-4">
                        Ver Prototipo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Instrucciones para Pruebas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Para Desarrolladores:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Los componentes están en <code className="bg-gray-100 px-1 rounded">src/components/Prueba tokects/</code></li>
                  <li>• Rutas disponibles: <code className="bg-gray-100 px-1 rounded">/prototype/*</code></li>
                  <li>• Integración con <code className="bg-gray-100 px-1 rounded">ticketService</code> implementada</li>
                  <li>• Datos de fallback incluidos para desarrollo sin backend</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Para Testing:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Probar funcionalidad en diferentes tamaños de pantalla</li>
                  <li>• Verificar formularios y validaciones</li>
                  <li>• Comprobar filtros y búsquedas</li>
                  <li>• Validar integración con backend cuando esté disponible</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend Testing */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Herramientas de Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/backend-test">
                <Button variant="outline" className="w-full sm:w-auto">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pruebas de Backend
                </Button>
              </Link>
              <Link to="/crud-test">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Pruebas CRUD Integrales
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Caché
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Herramientas para validar la conectividad y limpiar datos en caché.
            </p>
          </CardContent>
        </Card>

        {/* Back to Main App */}
        <div className="text-center mt-8">
          <Link to="/home">
            <Button variant="outline">
              Volver a la Aplicación Principal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

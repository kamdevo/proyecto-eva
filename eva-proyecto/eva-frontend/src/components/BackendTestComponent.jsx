/**
 * Componente de prueba para validar la integración con el backend
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Database,
  Server,
  Wifi
} from 'lucide-react';

// Importar servicios
import ticketService from '@/services/ticketService';
import equipoService from '@/services/equipoService';
import tecnicoService from '@/services/tecnicoService';
import servicioService from '@/services/servicioService';

export default function BackendTestComponent() {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);

  const tests = [
    {
      id: 'tickets-get',
      name: 'Obtener Tickets',
      description: 'Prueba la obtención de tickets desde el backend',
      service: ticketService,
      method: 'getTickets',
      params: { per_page: 5 }
    },
    {
      id: 'tickets-create',
      name: 'Crear Ticket',
      description: 'Prueba la creación de un ticket de prueba',
      service: ticketService,
      method: 'createTicket',
      params: {
        titulo: 'Ticket de Prueba - Backend Test',
        descripcion: 'Este es un ticket de prueba para validar la integración',
        prioridad: 'media',
        tipo_ticket: 'licensed',
        estado: 'abierto'
      }
    },
    {
      id: 'equipos-get',
      name: 'Obtener Equipos',
      description: 'Prueba la obtención de equipos desde el backend',
      service: equipoService,
      method: 'getEquipos',
      params: { per_page: 10 }
    },
    {
      id: 'tecnicos-get',
      name: 'Obtener Técnicos',
      description: 'Prueba la obtención de técnicos desde el backend',
      service: tecnicoService,
      method: 'getTecnicos',
      params: { per_page: 10 }
    },
    {
      id: 'servicios-get',
      name: 'Obtener Servicios',
      description: 'Prueba la obtención de servicios desde el backend',
      service: servicioService,
      method: 'getServicios',
      params: { per_page: 10 }
    },
    {
      id: 'tickets-stats',
      name: 'Estadísticas de Tickets',
      description: 'Prueba la obtención de estadísticas',
      service: ticketService,
      method: 'getTicketStats',
      params: {}
    }
  ];

  const runTest = async (test) => {
    setTestResults(prev => ({
      ...prev,
      [test.id]: { status: 'running', message: 'Ejecutando prueba...', data: null }
    }));

    try {
      const startTime = Date.now();
      const result = await test.service[test.method](test.params);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          [test.id]: {
            status: 'success',
            message: `Prueba exitosa (${duration}ms)`,
            data: result.data,
            meta: result.meta,
            duration
          }
        }));
        toast.success(`${test.name}: Prueba exitosa`);
      } else {
        setTestResults(prev => ({
          ...prev,
          [test.id]: {
            status: 'warning',
            message: `Datos de fallback utilizados (${duration}ms)`,
            data: result.data,
            duration
          }
        }));
        toast.warning(`${test.name}: Usando datos de fallback`);
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: {
          status: 'error',
          message: `Error: ${error.message}`,
          error: error,
          duration: 0
        }
      }));
      toast.error(`${test.name}: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});
    
    for (const test of tests) {
      await runTest(test);
      // Pequeña pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
    toast.success('Todas las pruebas completadas');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Database className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Fallback</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Ejecutando</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Server className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pruebas de Integración Backend
            </h1>
            <p className="text-gray-600">
              Validación de conectividad y funcionalidad de servicios
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Wifi className="h-4 w-4" />
            )}
            {testing ? 'Ejecutando Pruebas...' : 'Ejecutar Todas las Pruebas'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setTestResults({})}
            disabled={testing}
          >
            Limpiar Resultados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => {
          const result = testResults[test.id];
          
          return (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  {getStatusIcon(result?.status)}
                </div>
                <p className="text-sm text-gray-600">{test.description}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(result?.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runTest(test)}
                      disabled={testing}
                    >
                      Probar
                    </Button>
                  </div>
                  
                  {result && (
                    <div className="text-sm">
                      <p className="text-gray-700 mb-2">{result.message}</p>
                      
                      {result.data && (
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          <p><strong>Registros:</strong> {Array.isArray(result.data) ? result.data.length : 'N/A'}</p>
                          {result.meta && (
                            <p><strong>Total:</strong> {result.meta.total || 'N/A'}</p>
                          )}
                          {result.duration && (
                            <p><strong>Tiempo:</strong> {result.duration}ms</p>
                          )}
                        </div>
                      )}
                      
                      {result.error && (
                        <div className="bg-red-50 p-2 rounded text-xs text-red-700">
                          <p><strong>Error:</strong> {result.error.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(testResults).filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Exitosas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(testResults).filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Fallback</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(testResults).filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Errores</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(testResults).filter(r => r.duration).reduce((acc, r) => acc + r.duration, 0)}ms
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

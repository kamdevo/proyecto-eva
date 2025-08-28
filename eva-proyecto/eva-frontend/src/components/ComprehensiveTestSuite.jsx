/**
 * Suite de Pruebas Integral - Sistema EVA
 * Prueba todas las funcionalidades CRUD y operaciones de base de datos
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Database,
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  Download
} from 'lucide-react';

// Importar todos los servicios
import ticketService from '@/services/ticketService';
import equipoService from '@/services/equipoService';
import tecnicoService from '@/services/tecnicoService';
import servicioService from '@/services/servicioService';

export default function ComprehensiveTestSuite() {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [testData, setTestData] = useState({
    ticket: {
      titulo: 'Ticket de Prueba CRUD',
      descripcion: 'Este es un ticket de prueba para validar operaciones CRUD',
      prioridad: 'alta',
      tipo_ticket: 'licensed',
      estado: 'abierto'
    },
    equipo: {
      name: 'Equipo de Prueba CRUD',
      tipo: 'biomedico',
      marca: 'Test Brand',
      modelo: 'TEST-001',
      numero_serie: 'TEST123456',
      ubicacion: 'Sala de Pruebas',
      estado: 'activo'
    }
  });
  const [createdItems, setCreatedItems] = useState({});

  const crudTests = [
    {
      id: 'tickets-crud',
      name: 'Tickets CRUD',
      service: ticketService,
      operations: ['create', 'read', 'update', 'delete', 'search']
    },
    {
      id: 'equipos-crud', 
      name: 'Equipos CRUD',
      service: equipoService,
      operations: ['create', 'read', 'update', 'delete']
    },
    {
      id: 'tecnicos-read',
      name: 'Técnicos READ',
      service: tecnicoService,
      operations: ['read', 'search']
    },
    {
      id: 'servicios-read',
      name: 'Servicios READ', 
      service: servicioService,
      operations: ['read', 'search']
    }
  ];

  const updateTestResult = (testId, operation, result) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [operation]: result
      }
    }));
  };

  // Operación CREATE
  const testCreate = async (test) => {
    try {
      updateTestResult(test.id, 'create', { status: 'running', message: 'Creando registro...' });
      
      let result;
      if (test.id === 'tickets-crud') {
        result = await test.service.createTicket(testData.ticket);
      } else if (test.id === 'equipos-crud') {
        result = await test.service.createEquipo(testData.equipo);
      }

      if (result && result.success) {
        setCreatedItems(prev => ({ ...prev, [test.id]: result.data }));
        updateTestResult(test.id, 'create', {
          status: 'success',
          message: `Registro creado exitosamente. ID: ${result.data.id}`,
          data: result.data
        });
        toast.success(`${test.name}: Registro creado`);
        return true;
      } else {
        throw new Error(result?.message || 'Error desconocido');
      }
    } catch (error) {
      updateTestResult(test.id, 'create', {
        status: 'error',
        message: `Error al crear: ${error.message}`,
        error
      });
      toast.error(`${test.name}: Error al crear`);
      return false;
    }
  };

  // Operación READ
  const testRead = async (test) => {
    try {
      updateTestResult(test.id, 'read', { status: 'running', message: 'Leyendo registros...' });
      
      let result;
      if (test.id === 'tickets-crud') {
        result = await test.service.getTickets({ per_page: 5 });
      } else if (test.id === 'equipos-crud') {
        result = await test.service.getEquipos({ per_page: 5 });
      } else if (test.id === 'tecnicos-read') {
        result = await test.service.getTecnicos({ per_page: 5 });
      } else if (test.id === 'servicios-read') {
        result = await test.service.getServicios({ per_page: 5 });
      }

      if (result && result.success) {
        updateTestResult(test.id, 'read', {
          status: 'success',
          message: `${result.data?.length || 0} registros obtenidos`,
          data: result.data,
          meta: result.meta
        });
        toast.success(`${test.name}: Datos leídos correctamente`);
        return true;
      } else {
        throw new Error(result?.message || 'Error desconocido');
      }
    } catch (error) {
      updateTestResult(test.id, 'read', {
        status: 'error',
        message: `Error al leer: ${error.message}`,
        error
      });
      toast.error(`${test.name}: Error al leer`);
      return false;
    }
  };

  // Operación UPDATE
  const testUpdate = async (test) => {
    const createdItem = createdItems[test.id];
    if (!createdItem) {
      updateTestResult(test.id, 'update', {
        status: 'error',
        message: 'No hay registro creado para actualizar'
      });
      return false;
    }

    try {
      updateTestResult(test.id, 'update', { status: 'running', message: 'Actualizando registro...' });
      
      let updateData;
      let result;
      
      if (test.id === 'tickets-crud') {
        updateData = { ...testData.ticket, titulo: 'Ticket ACTUALIZADO - Prueba CRUD' };
        result = await test.service.updateTicket(createdItem.id, updateData);
      } else if (test.id === 'equipos-crud') {
        updateData = { ...testData.equipo, name: 'Equipo ACTUALIZADO - Prueba CRUD' };
        result = await test.service.updateEquipo(createdItem.id, updateData);
      }

      if (result && result.success) {
        updateTestResult(test.id, 'update', {
          status: 'success',
          message: `Registro actualizado exitosamente. ID: ${createdItem.id}`,
          data: result.data
        });
        toast.success(`${test.name}: Registro actualizado`);
        return true;
      } else {
        throw new Error(result?.message || 'Error desconocido');
      }
    } catch (error) {
      updateTestResult(test.id, 'update', {
        status: 'error',
        message: `Error al actualizar: ${error.message}`,
        error
      });
      toast.error(`${test.name}: Error al actualizar`);
      return false;
    }
  };

  // Operación DELETE
  const testDelete = async (test) => {
    const createdItem = createdItems[test.id];
    if (!createdItem) {
      updateTestResult(test.id, 'delete', {
        status: 'error',
        message: 'No hay registro creado para eliminar'
      });
      return false;
    }

    try {
      updateTestResult(test.id, 'delete', { status: 'running', message: 'Eliminando registro...' });
      
      let result;
      if (test.id === 'tickets-crud') {
        result = await test.service.deleteTicket(createdItem.id);
      } else if (test.id === 'equipos-crud') {
        result = await test.service.deleteEquipo(createdItem.id);
      }

      if (result && result.success) {
        setCreatedItems(prev => {
          const newItems = { ...prev };
          delete newItems[test.id];
          return newItems;
        });
        updateTestResult(test.id, 'delete', {
          status: 'success',
          message: `Registro eliminado exitosamente. ID: ${createdItem.id}`
        });
        toast.success(`${test.name}: Registro eliminado`);
        return true;
      } else {
        throw new Error(result?.message || 'Error desconocido');
      }
    } catch (error) {
      updateTestResult(test.id, 'delete', {
        status: 'error',
        message: `Error al eliminar: ${error.message}`,
        error
      });
      toast.error(`${test.name}: Error al eliminar`);
      return false;
    }
  };

  // Operación SEARCH
  const testSearch = async (test) => {
    try {
      updateTestResult(test.id, 'search', { status: 'running', message: 'Buscando registros...' });
      
      let result;
      if (test.id === 'tickets-crud') {
        result = await test.service.searchTickets('prueba', { per_page: 5 });
      } else {
        // Para otros servicios, usar filtros básicos
        result = await test.service[test.id.includes('tecnicos') ? 'getTecnicos' : 'getServicios']({ 
          search: 'test',
          per_page: 5 
        });
      }

      if (result && result.success) {
        updateTestResult(test.id, 'search', {
          status: 'success',
          message: `Búsqueda completada. ${result.data?.length || 0} resultados`,
          data: result.data
        });
        toast.success(`${test.name}: Búsqueda exitosa`);
        return true;
      } else {
        throw new Error(result?.message || 'Error desconocido');
      }
    } catch (error) {
      updateTestResult(test.id, 'search', {
        status: 'error',
        message: `Error en búsqueda: ${error.message}`,
        error
      });
      toast.error(`${test.name}: Error en búsqueda`);
      return false;
    }
  };

  // Ejecutar operación específica
  const runOperation = async (test, operation) => {
    switch (operation) {
      case 'create':
        return await testCreate(test);
      case 'read':
        return await testRead(test);
      case 'update':
        return await testUpdate(test);
      case 'delete':
        return await testDelete(test);
      case 'search':
        return await testSearch(test);
      default:
        return false;
    }
  };

  // Ejecutar todas las pruebas CRUD para un servicio
  const runFullCrudTest = async (test) => {
    setTesting(true);
    
    for (const operation of test.operations) {
      await runOperation(test, operation);
      // Pausa entre operaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTesting(false);
  };

  // Ejecutar todas las pruebas
  const runAllTests = async () => {
    setTesting(true);
    setTestResults({});
    setCreatedItems({});
    
    for (const test of crudTests) {
      await runFullCrudTest(test);
      // Pausa entre servicios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setTesting(false);
    toast.success('Todas las pruebas CRUD completadas');
  };

  const getOperationIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOperationBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 text-xs">OK</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 text-xs">ERROR</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">...</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">-</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Suite de Pruebas CRUD Integral
            </h1>
            <p className="text-gray-600">
              Validación completa de operaciones de base de datos
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {testing ? 'Ejecutando Pruebas...' : 'Ejecutar Todas las Pruebas CRUD'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setTestResults({});
              setCreatedItems({});
            }}
            disabled={testing}
          >
            Limpiar Resultados
          </Button>
        </div>

        {/* Datos de Prueba */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Datos de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Ticket de Prueba:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p><strong>Título:</strong> {testData.ticket.titulo}</p>
                  <p><strong>Prioridad:</strong> {testData.ticket.prioridad}</p>
                  <p><strong>Tipo:</strong> {testData.ticket.tipo_ticket}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Equipo de Prueba:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  <p><strong>Nombre:</strong> {testData.equipo.name}</p>
                  <p><strong>Tipo:</strong> {testData.equipo.tipo}</p>
                  <p><strong>Marca:</strong> {testData.equipo.marca}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados de Pruebas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {crudTests.map((test) => {
          const results = testResults[test.id] || {};
          
          return (
            <Card key={test.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runFullCrudTest(test)}
                    disabled={testing}
                  >
                    Probar
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {test.operations.map((operation) => {
                    const result = results[operation];
                    
                    return (
                      <div key={operation} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(result?.status)}
                          <span className="text-sm font-medium capitalize">
                            {operation === 'read' ? 'Leer' : 
                             operation === 'create' ? 'Crear' :
                             operation === 'update' ? 'Actualizar' :
                             operation === 'delete' ? 'Eliminar' :
                             operation === 'search' ? 'Buscar' : operation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getOperationBadge(result?.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => runOperation(test, operation)}
                            disabled={testing}
                            className="h-6 px-2"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Mostrar resultados detallados */}
                  {Object.keys(results).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                      <h5 className="font-medium mb-2">Últimos Resultados:</h5>
                      {Object.entries(results).map(([op, result]) => (
                        <div key={op} className="mb-1">
                          <strong>{op}:</strong> {result.message}
                          {result.data && Array.isArray(result.data) && (
                            <span className="text-gray-600"> ({result.data.length} registros)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen General */}
      {Object.keys(testResults).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumen de Pruebas CRUD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).reduce((acc, test) => 
                    acc + Object.values(test).filter(r => r.status === 'success').length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Operaciones Exitosas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).reduce((acc, test) => 
                    acc + Object.values(test).filter(r => r.status === 'error').length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Errores</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(testResults).reduce((acc, test) => 
                    acc + Object.values(test).length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Operaciones</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(createdItems).length}
                </div>
                <div className="text-sm text-gray-600">Registros Creados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

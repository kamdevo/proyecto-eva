/**
 * Utilidades para probar la conectividad entre frontend y backend
 * Incluye pruebas de endpoints, autenticación y funcionalidades específicas
 */

import apiService from '../services/apiService.js';
import authService from '../services/authService.js';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.js';

class ConnectivityTest {
  constructor() {
    this.results = [];
    this.isRunning = false;
  }

  /**
   * Ejecutar todas las pruebas de conectividad
   */
  async runAllTests() {
    if (this.isRunning) {
      console.warn('Las pruebas ya están en ejecución');
      return this.results;
    }

    this.isRunning = true;
    this.results = [];

    console.log('🔍 Iniciando pruebas de conectividad...');

    try {
      // Pruebas básicas
      await this.testBasicConnectivity();
      await this.testCorsConfiguration();
      
      // Pruebas de autenticación
      await this.testAuthEndpoints();
      
      // Pruebas de endpoints principales
      await this.testMainEndpoints();
      
      // Pruebas de funcionalidades específicas
      await this.testSpecificFeatures();
      
      console.log('✅ Pruebas de conectividad completadas');
      return this.generateReport();
      
    } catch (error) {
      console.error('❌ Error durante las pruebas:', error);
      this.addResult('GENERAL', 'Error general', false, error.message);
      return this.generateReport();
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Probar conectividad básica
   */
  async testBasicConnectivity() {
    console.log('🌐 Probando conectividad básica...');

    try {
      // Probar si el servidor está disponible
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'HEAD',
        mode: 'cors',
      });

      this.addResult(
        'CONECTIVIDAD',
        'Servidor backend disponible',
        response.ok,
        response.ok ? `Status: ${response.status}` : `Error: ${response.status}`
      );
    } catch (error) {
      this.addResult(
        'CONECTIVIDAD',
        'Servidor backend disponible',
        false,
        `Error de red: ${error.message}`
      );
    }

    try {
      // Probar endpoint de health check
      const response = await fetch(`${API_CONFIG.API_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      this.addResult(
        'CONECTIVIDAD',
        'Health check endpoint',
        response.ok,
        response.ok ? `Status: ${data.status || 'OK'}` : `Error: ${response.status}`
      );
    } catch (error) {
      this.addResult(
        'CONECTIVIDAD',
        'Health check endpoint',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * Probar configuración CORS
   */
  async testCorsConfiguration() {
    console.log('🔒 Probando configuración CORS...');

    try {
      const response = await fetch(`${API_CONFIG.API_URL}/test-cors`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization',
        },
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      };

      this.addResult(
        'CORS',
        'Configuración CORS',
        response.ok,
        response.ok ? `Headers: ${JSON.stringify(corsHeaders)}` : `Error: ${response.status}`
      );
    } catch (error) {
      this.addResult(
        'CORS',
        'Configuración CORS',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * Probar endpoints de autenticación
   */
  async testAuthEndpoints() {
    console.log('🔐 Probando endpoints de autenticación...');

    // Probar CSRF cookie
    try {
      await authService.getCsrfCookie();
      this.addResult('AUTH', 'CSRF Cookie', true, 'Cookie obtenida exitosamente');
    } catch (error) {
      this.addResult('AUTH', 'CSRF Cookie', false, error.message);
    }

    // Probar endpoint de login (sin credenciales válidas)
    try {
      await authService.login({ email: 'test@test.com', password: 'invalid' });
      this.addResult('AUTH', 'Login endpoint', false, 'Login exitoso con credenciales inválidas');
    } catch (error) {
      // Esperamos que falle con credenciales inválidas
      const isExpectedError = error.message.includes('credenciales') || 
                             error.message.includes('unauthorized') ||
                             error.message.includes('invalid');
      
      this.addResult(
        'AUTH',
        'Login endpoint',
        isExpectedError,
        isExpectedError ? 'Endpoint responde correctamente' : error.message
      );
    }
  }

  /**
   * Probar endpoints principales
   */
  async testMainEndpoints() {
    console.log('📊 Probando endpoints principales...');

    const endpoints = [
      { name: 'Equipos', service: () => apiService.equipos.getList({ page: 1, limit: 1 }) },
      { name: 'Mantenimientos', service: () => apiService.mantenimientos.getList({ page: 1, limit: 1 }) },
      { name: 'Calibraciones', service: () => apiService.calibraciones.getList({ page: 1, limit: 1 }) },
      { name: 'Contingencias', service: () => apiService.contingencias.getList({ page: 1, limit: 1 }) },
      { name: 'Servicios', service: () => apiService.servicios.getList({ page: 1, limit: 1 }) },
      { name: 'Áreas', service: () => apiService.areas.getList({ page: 1, limit: 1 }) },
      { name: 'Dashboard Stats', service: () => apiService.dashboard.getStats() },
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await endpoint.service();
        this.addResult(
          'ENDPOINTS',
          endpoint.name,
          result.success,
          result.success ? `${result.data?.length || 0} registros` : 'Error en respuesta'
        );
      } catch (error) {
        // Si es error 401, el endpoint funciona pero necesita autenticación
        const needsAuth = error.message.includes('401') || error.message.includes('unauthorized');
        this.addResult(
          'ENDPOINTS',
          endpoint.name,
          needsAuth,
          needsAuth ? 'Endpoint funcional (requiere autenticación)' : error.message
        );
      }
    }
  }

  /**
   * Probar funcionalidades específicas
   */
  async testSpecificFeatures() {
    console.log('⚙️ Probando funcionalidades específicas...');

    // Probar búsqueda
    try {
      const result = await apiService.equipos.searchEquipos('test', { limit: 1 });
      this.addResult(
        'FEATURES',
        'Búsqueda de equipos',
        result.success,
        result.success ? 'Búsqueda funcional' : 'Error en búsqueda'
      );
    } catch (error) {
      const needsAuth = error.message.includes('401') || error.message.includes('unauthorized');
      this.addResult(
        'FEATURES',
        'Búsqueda de equipos',
        needsAuth,
        needsAuth ? 'Funcional (requiere autenticación)' : error.message
      );
    }

    // Probar exportación
    try {
      const result = await apiService.equipos.exportEquipos('excel', { limit: 1 });
      this.addResult(
        'FEATURES',
        'Exportación',
        result.success,
        result.success ? 'Exportación funcional' : 'Error en exportación'
      );
    } catch (error) {
      const needsAuth = error.message.includes('401') || error.message.includes('unauthorized');
      this.addResult(
        'FEATURES',
        'Exportación',
        needsAuth,
        needsAuth ? 'Funcional (requiere autenticación)' : error.message
      );
    }
  }

  /**
   * Agregar resultado de prueba
   */
  addResult(category, test, success, details) {
    this.results.push({
      category,
      test,
      success,
      details,
      timestamp: new Date().toISOString(),
    });

    const status = success ? '✅' : '❌';
    console.log(`${status} [${category}] ${test}: ${details}`);
  }

  /**
   * Generar reporte de resultados
   */
  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const successRate = totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(2) : 0;

    const report = {
      summary: {
        total: totalTests,
        successful: successfulTests,
        failed: failedTests,
        successRate: `${successRate}%`,
        timestamp: new Date().toISOString(),
      },
      results: this.results,
      recommendations: this.generateRecommendations(),
    };

    console.log('📊 Reporte de conectividad:', report);
    return report;
  }

  /**
   * Generar recomendaciones basadas en los resultados
   */
  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.results.filter(r => !r.success);

    if (failedTests.some(t => t.category === 'CONECTIVIDAD')) {
      recommendations.push('Verificar que el servidor backend esté ejecutándose en el puerto correcto');
      recommendations.push('Comprobar la configuración de red y firewall');
    }

    if (failedTests.some(t => t.category === 'CORS')) {
      recommendations.push('Revisar la configuración CORS en config/cors.php');
      recommendations.push('Verificar que el frontend esté en la lista de orígenes permitidos');
    }

    if (failedTests.some(t => t.category === 'AUTH')) {
      recommendations.push('Verificar la configuración de Laravel Sanctum');
      recommendations.push('Comprobar que las rutas de autenticación estén registradas');
    }

    if (failedTests.some(t => t.category === 'ENDPOINTS')) {
      recommendations.push('Verificar que todas las rutas API estén registradas');
      recommendations.push('Comprobar que los controladores estén funcionando correctamente');
    }

    if (recommendations.length === 0) {
      recommendations.push('¡Todas las pruebas pasaron exitosamente! El sistema está listo para usar.');
    }

    return recommendations;
  }

  /**
   * Probar conectividad específica de un endpoint
   */
  async testSingleEndpoint(endpoint, method = 'GET', data = null) {
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiService.getList(endpoint);
          break;
        case 'POST':
          response = await apiService.create(endpoint, data);
          break;
        default:
          throw new Error(`Método ${method} no soportado`);
      }

      return {
        success: true,
        endpoint,
        method,
        response,
        message: 'Endpoint funcional'
      };
    } catch (error) {
      return {
        success: false,
        endpoint,
        method,
        error: error.message,
        message: 'Error en endpoint'
      };
    }
  }
}

// Crear instancia singleton
const connectivityTest = new ConnectivityTest();

export default connectivityTest;

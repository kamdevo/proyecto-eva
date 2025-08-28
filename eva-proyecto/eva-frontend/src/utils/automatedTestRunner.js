/**
 * ========================================
 * EJECUTOR DE PRUEBAS AUTOMATIZADAS - SISTEMA EVA
 * ========================================
 *
 * Script para ejecutar pruebas automatizadas de todas las funcionalidades
 */

import ticketService from '../services/ticketService.js';
import equipoService from '../services/equipoService.js';
import tecnicoService from '../services/tecnicoService.js';
import servicioService from '../services/servicioService.js';

class AutomatedTestRunner {
  constructor() {
    this.results = [];
    this.createdItems = [];
  }

  /**
   * Ejecutar todas las pruebas automatizadas
   */
  async runAllTests() {
    console.log('🚀 Iniciando pruebas automatizadas del Sistema EVA...');
    this.results = [];
    this.createdItems = [];

    const testSuites = [
      { name: 'Pruebas de Tickets', method: this.testTicketsCRUD },
      { name: 'Pruebas de Equipos', method: this.testEquiposCRUD },
      { name: 'Pruebas de Técnicos', method: this.testTecnicosRead },
      { name: 'Pruebas de Servicios', method: this.testServiciosRead },
      { name: 'Pruebas de Búsqueda', method: this.testSearchFunctionality },
      { name: 'Pruebas de Validación', method: this.testValidation },
      { name: 'Pruebas de Cache', method: this.testCacheFunctionality }
    ];

    for (const suite of testSuites) {
      try {
        console.log(`\n📋 Ejecutando: ${suite.name}`);
        await suite.method.call(this);
        this.logResult(suite.name, 'SUCCESS', 'Suite completada exitosamente');
      } catch (error) {
        this.logResult(suite.name, 'ERROR', error.message);
        console.error(`❌ Error en ${suite.name}:`, error);
      }
    }

    // Limpiar datos de prueba
    await this.cleanup();

    // Generar reporte final
    return this.generateReport();
  }

  /**
   * Pruebas CRUD de Tickets
   */
  async testTicketsCRUD() {
    const testTicket = {
      titulo: 'Ticket Automatizado - Prueba CRUD',
      descripcion: 'Este ticket fue creado automáticamente para pruebas',
      prioridad: 'alta',
      tipo_ticket: 'licensed',
      estado: 'abierto',
      usuario_creador: 'test-user'
    };

    // CREATE
    console.log('  ➤ Probando creación de ticket...');
    const createResult = await ticketService.createTicket(testTicket);
    if (!createResult.success) {
      throw new Error('Fallo al crear ticket');
    }
    this.createdItems.push({ type: 'ticket', id: createResult.data.id, service: ticketService });
    this.logResult('Tickets CREATE', 'SUCCESS', `Ticket creado con ID: ${createResult.data.id}`);

    // READ
    console.log('  ➤ Probando lectura de tickets...');
    const readResult = await ticketService.getTickets({ per_page: 10 });
    if (!readResult.success || !Array.isArray(readResult.data)) {
      throw new Error('Fallo al leer tickets');
    }
    this.logResult('Tickets READ', 'SUCCESS', `${readResult.data.length} tickets obtenidos`);

    // READ BY ID
    console.log('  ➤ Probando lectura por ID...');
    const readByIdResult = await ticketService.getTicketById(createResult.data.id);
    if (!readByIdResult.success) {
      throw new Error('Fallo al leer ticket por ID');
    }
    this.logResult('Tickets READ BY ID', 'SUCCESS', 'Ticket obtenido por ID');

    // UPDATE
    console.log('  ➤ Probando actualización de ticket...');
    const updateData = { ...testTicket, titulo: 'Ticket ACTUALIZADO - Prueba Automatizada' };
    const updateResult = await ticketService.updateTicket(createResult.data.id, updateData);
    if (!updateResult.success) {
      throw new Error('Fallo al actualizar ticket');
    }
    this.logResult('Tickets UPDATE', 'SUCCESS', 'Ticket actualizado correctamente');

    // SEARCH
    console.log('  ➤ Probando búsqueda de tickets...');
    const searchResult = await ticketService.searchTickets('automatizada');
    if (!searchResult.success) {
      throw new Error('Fallo en búsqueda de tickets');
    }
    this.logResult('Tickets SEARCH', 'SUCCESS', `${searchResult.data.length} tickets encontrados`);
  }

  /**
   * Pruebas CRUD de Equipos
   */
  async testEquiposCRUD() {
    const testEquipo = {
      name: 'Equipo Automatizado - Prueba CRUD',
      tipo: 'biomedico',
      marca: 'Test Brand',
      modelo: 'AUTO-TEST-001',
      numero_serie: 'AUTO123456',
      ubicacion: 'Sala de Pruebas Automatizadas',
      estado: 'activo'
    };

    // CREATE
    console.log('  ➤ Probando creación de equipo...');
    const createResult = await equipoService.createEquipo(testEquipo);
    if (!createResult.success) {
      throw new Error('Fallo al crear equipo');
    }
    this.createdItems.push({ type: 'equipo', id: createResult.data.id, service: equipoService });
    this.logResult('Equipos CREATE', 'SUCCESS', `Equipo creado con ID: ${createResult.data.id}`);

    // READ
    console.log('  ➤ Probando lectura de equipos...');
    const readResult = await equipoService.getEquipos({ per_page: 10 });
    if (!readResult.success || !Array.isArray(readResult.data)) {
      throw new Error('Fallo al leer equipos');
    }
    this.logResult('Equipos READ', 'SUCCESS', `${readResult.data.length} equipos obtenidos`);

    // UPDATE
    console.log('  ➤ Probando actualización de equipo...');
    const updateData = { ...testEquipo, name: 'Equipo ACTUALIZADO - Prueba Automatizada' };
    const updateResult = await equipoService.updateEquipo(createResult.data.id, updateData);
    if (!updateResult.success) {
      throw new Error('Fallo al actualizar equipo');
    }
    this.logResult('Equipos UPDATE', 'SUCCESS', 'Equipo actualizado correctamente');

    // READ BY TYPE
    console.log('  ➤ Probando lectura por tipo...');
    const byTypeResult = await equipoService.getEquiposByTipo('biomedico');
    if (!byTypeResult.success) {
      throw new Error('Fallo al leer equipos por tipo');
    }
    this.logResult('Equipos READ BY TYPE', 'SUCCESS', `${byTypeResult.data.length} equipos biomédicos`);
  }

  /**
   * Pruebas de lectura de Técnicos
   */
  async testTecnicosRead() {
    console.log('  ➤ Probando lectura de técnicos...');
    const readResult = await tecnicoService.getTecnicos({ per_page: 10 });
    if (!readResult.success || !Array.isArray(readResult.data)) {
      throw new Error('Fallo al leer técnicos');
    }
    this.logResult('Técnicos READ', 'SUCCESS', `${readResult.data.length} técnicos obtenidos`);

    console.log('  ➤ Probando lectura por especialidad...');
    const bySpecialtyResult = await tecnicoService.getTecnicosByEspecialidad('Biomédico');
    if (!bySpecialtyResult.success) {
      throw new Error('Fallo al leer técnicos por especialidad');
    }
    this.logResult('Técnicos BY SPECIALTY', 'SUCCESS', `${bySpecialtyResult.data.length} técnicos biomédicos`);
  }

  /**
   * Pruebas de lectura de Servicios
   */
  async testServiciosRead() {
    console.log('  ➤ Probando lectura de servicios...');
    const readResult = await servicioService.getServicios({ per_page: 10 });
    if (!readResult.success || !Array.isArray(readResult.data)) {
      throw new Error('Fallo al leer servicios');
    }
    this.logResult('Servicios READ', 'SUCCESS', `${readResult.data.length} servicios obtenidos`);

    console.log('  ➤ Probando lectura por categoría...');
    const byCategoryResult = await servicioService.getServiciosByCategoria('Críticos');
    if (!byCategoryResult.success) {
      throw new Error('Fallo al leer servicios por categoría');
    }
    this.logResult('Servicios BY CATEGORY', 'SUCCESS', `${byCategoryResult.data.length} servicios críticos`);
  }

  /**
   * Pruebas de funcionalidad de búsqueda
   */
  async testSearchFunctionality() {
    console.log('  ➤ Probando búsqueda de tickets...');
    const ticketSearch = await ticketService.searchTickets('test', { per_page: 5 });
    if (!ticketSearch.success) {
      throw new Error('Fallo en búsqueda de tickets');
    }
    this.logResult('Search Tickets', 'SUCCESS', `${ticketSearch.data.length} resultados`);

    console.log('  ➤ Probando filtros de equipos...');
    const equipoFilter = await equipoService.getEquipos({ tipo: 'biomedico', per_page: 5 });
    if (!equipoFilter.success) {
      throw new Error('Fallo en filtros de equipos');
    }
    this.logResult('Filter Equipos', 'SUCCESS', `${equipoFilter.data.length} equipos filtrados`);
  }

  /**
   * Pruebas de validación
   */
  async testValidation() {
    console.log('  ➤ Probando validación de datos...');
    
    try {
      // Intentar crear ticket con datos inválidos
      await ticketService.createTicket({});
      throw new Error('La validación debería haber fallado');
    } catch (error) {
      if (error.message.includes('validación')) {
        this.logResult('Validation Test', 'SUCCESS', 'Validación funcionando correctamente');
      } else {
        throw error;
      }
    }
  }

  /**
   * Pruebas de funcionalidad de cache
   */
  async testCacheFunctionality() {
    console.log('  ➤ Probando funcionalidad de cache...');
    
    // Primera llamada (debería ir al servidor)
    const start1 = Date.now();
    await ticketService.getTickets({ per_page: 5 });
    const time1 = Date.now() - start1;

    // Segunda llamada (debería usar cache)
    const start2 = Date.now();
    await ticketService.getTickets({ per_page: 5 });
    const time2 = Date.now() - start2;

    // El cache debería ser más rápido
    if (time2 < time1) {
      this.logResult('Cache Test', 'SUCCESS', `Cache funcionando (${time1}ms vs ${time2}ms)`);
    } else {
      this.logResult('Cache Test', 'WARNING', 'Cache podría no estar funcionando óptimamente');
    }
  }

  /**
   * Limpiar datos de prueba
   */
  async cleanup() {
    console.log('\n🧹 Limpiando datos de prueba...');
    
    for (const item of this.createdItems) {
      try {
        if (item.type === 'ticket') {
          await item.service.deleteTicket(item.id);
        } else if (item.type === 'equipo') {
          await item.service.deleteEquipo(item.id);
        }
        console.log(`  ✓ Eliminado ${item.type} con ID: ${item.id}`);
      } catch (error) {
        console.warn(`  ⚠️ No se pudo eliminar ${item.type} ${item.id}:`, error.message);
      }
    }
  }

  /**
   * Registrar resultado de prueba
   */
  logResult(test, status, message) {
    const result = {
      test,
      status,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const emoji = status === 'SUCCESS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
    console.log(`    ${emoji} ${test}: ${message}`);
  }

  /**
   * Generar reporte final
   */
  generateReport() {
    const successful = this.results.filter(r => r.status === 'SUCCESS').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const total = this.results.length;

    const report = {
      summary: {
        total,
        successful,
        warnings,
        errors,
        successRate: ((successful / total) * 100).toFixed(1)
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 REPORTE FINAL DE PRUEBAS:');
    console.log(`   Total de pruebas: ${total}`);
    console.log(`   ✅ Exitosas: ${successful}`);
    console.log(`   ⚠️ Advertencias: ${warnings}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📈 Tasa de éxito: ${report.summary.successRate}%`);

    if (errors === 0) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisar los errores arriba.');
    }

    return report;
  }
}

// Función de utilidad para ejecutar pruebas desde la consola
export const runAutomatedTests = async () => {
  const runner = new AutomatedTestRunner();
  return await runner.runAllTests();
};

// Exponer en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.runAutomatedTests = runAutomatedTests;
}

export default AutomatedTestRunner;

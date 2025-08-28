/**
 * ========================================
 * EJECUTOR DE PRUEBAS DE UI - SISTEMA EVA
 * ========================================
 *
 * Script para simular interacciones de usuario y verificar funcionalidades
 */

class UITestRunner {
  constructor() {
    this.results = [];
    this.currentTest = null;
  }

  /**
   * Ejecutar todas las pruebas de UI
   */
  async runAllUITests() {
    console.log('🎯 Iniciando pruebas de interfaz de usuario...');
    this.results = [];

    const tests = [
      { name: 'Navegación Principal', method: this.testMainNavigation },
      { name: 'ClosedTickets UI', method: this.testClosedTicketsUI },
      { name: 'GestionTickets UI', method: this.testGestionTicketsUI },
      { name: 'MyTickets UI', method: this.testMyTicketsUI },
      { name: 'Backend Test UI', method: this.testBackendTestUI },
      { name: 'CRUD Test UI', method: this.testCrudTestUI }
    ];

    for (const test of tests) {
      try {
        console.log(`\n🔍 Probando: ${test.name}`);
        this.currentTest = test.name;
        await test.method.call(this);
        this.logResult(test.name, 'SUCCESS', 'Prueba de UI completada');
      } catch (error) {
        this.logResult(test.name, 'ERROR', error.message);
        console.error(`❌ Error en ${test.name}:`, error);
      }
    }

    return this.generateUIReport();
  }

  /**
   * Probar navegación principal
   */
  async testMainNavigation() {
    // Verificar que estamos en la página correcta
    if (!window.location.pathname.includes('prototypes')) {
      window.location.href = '/prototypes';
      await this.wait(2000);
    }

    // Verificar elementos principales
    this.checkElement('h1', 'Título principal');
    this.checkElement('[data-testid="prototype-nav"]', 'Navegación de prototipos', false);
    
    // Verificar enlaces de navegación
    const links = [
      'a[href="/prototype/closed-tickets"]',
      'a[href="/prototype/gestion-tickets"]', 
      'a[href="/prototype/my-tickets"]',
      'a[href="/backend-test"]',
      'a[href="/crud-test"]'
    ];

    links.forEach((selector, index) => {
      this.checkElement(selector, `Enlace ${index + 1}`, false);
    });

    console.log('  ✅ Navegación principal verificada');
  }

  /**
   * Probar UI de ClosedTickets
   */
  async testClosedTicketsUI() {
    window.location.href = '/prototype/closed-tickets';
    await this.wait(3000);

    // Verificar elementos principales
    this.checkElement('h1', 'Título de página');
    this.checkElement('input[type="text"]', 'Campo de búsqueda', false);
    this.checkElement('select', 'Selector de filtros', false);
    this.checkElement('button', 'Botones de acción', false);

    // Verificar tabla o tarjetas
    const hasTable = document.querySelector('table');
    const hasCards = document.querySelector('[class*="card"]');
    
    if (!hasTable && !hasCards) {
      throw new Error('No se encontró tabla ni tarjetas de datos');
    }

    // Verificar paginación
    this.checkElement('[class*="pagination"]', 'Controles de paginación', false);

    console.log('  ✅ UI de ClosedTickets verificada');
  }

  /**
   * Probar UI de GestionTickets
   */
  async testGestionTicketsUI() {
    window.location.href = '/prototype/gestion-tickets';
    await this.wait(3000);

    // Verificar elementos principales
    this.checkElement('h1', 'Título de página');
    this.checkElement('input[placeholder*="buscar"]', 'Campo de búsqueda', false);
    this.checkElement('button', 'Botones de acción', false);

    // Verificar filtros
    const filterButtons = document.querySelectorAll('button[class*="filter"], button[class*="badge"]');
    if (filterButtons.length === 0) {
      console.warn('  ⚠️ No se encontraron botones de filtro');
    }

    // Verificar contenido de datos
    const hasContent = document.querySelector('table, [class*="card"], [class*="ticket"]');
    if (!hasContent) {
      console.warn('  ⚠️ No se encontró contenido de datos visible');
    }

    console.log('  ✅ UI de GestionTickets verificada');
  }

  /**
   * Probar UI de MyTickets
   */
  async testMyTicketsUI() {
    window.location.href = '/prototype/my-tickets';
    await this.wait(3000);

    // Verificar elementos principales
    this.checkElement('h1', 'Título de página');
    
    // Verificar botones de creación de tickets
    const createButtons = document.querySelectorAll('button[class*="bg-blue"], button[class*="bg-green"], button[class*="bg-orange"]');
    if (createButtons.length < 3) {
      throw new Error('No se encontraron los 3 botones de creación de tickets');
    }

    // Simular clic en primer botón para abrir modal
    try {
      createButtons[0].click();
      await this.wait(1000);

      // Verificar que se abrió el modal
      const modal = document.querySelector('[role="dialog"], [class*="modal"]');
      if (!modal) {
        throw new Error('Modal no se abrió al hacer clic');
      }

      // Verificar elementos del formulario
      this.checkElement('input, select, textarea', 'Campos de formulario', false);
      this.checkElement('button[type="submit"], button[class*="crear"]', 'Botón de envío', false);

      // Cerrar modal
      const closeButton = document.querySelector('button[class*="cancel"], button[aria-label="Close"]');
      if (closeButton) {
        closeButton.click();
        await this.wait(500);
      }

    } catch (error) {
      console.warn('  ⚠️ Error probando modal:', error.message);
    }

    console.log('  ✅ UI de MyTickets verificada');
  }

  /**
   * Probar UI de Backend Test
   */
  async testBackendTestUI() {
    window.location.href = '/backend-test';
    await this.wait(3000);

    // Verificar elementos principales
    this.checkElement('h1', 'Título de página');
    this.checkElement('button[class*="ejecutar"], button[class*="test"]', 'Botón de pruebas', false);

    // Verificar tarjetas de prueba
    const testCards = document.querySelectorAll('[class*="card"]');
    if (testCards.length === 0) {
      throw new Error('No se encontraron tarjetas de prueba');
    }

    // Simular clic en botón de prueba
    try {
      const testButton = document.querySelector('button[class*="ejecutar"], button[class*="test"]');
      if (testButton && !testButton.disabled) {
        testButton.click();
        await this.wait(2000);
        console.log('  ✅ Botón de prueba ejecutado');
      }
    } catch (error) {
      console.warn('  ⚠️ Error ejecutando prueba:', error.message);
    }

    console.log('  ✅ UI de Backend Test verificada');
  }

  /**
   * Probar UI de CRUD Test
   */
  async testCrudTestUI() {
    window.location.href = '/crud-test';
    await this.wait(3000);

    // Verificar elementos principales
    this.checkElement('h1', 'Título de página');
    this.checkElement('button', 'Botones de acción', false);

    // Verificar tarjetas de servicios
    const serviceCards = document.querySelectorAll('[class*="card"]');
    if (serviceCards.length === 0) {
      throw new Error('No se encontraron tarjetas de servicios');
    }

    // Verificar datos de prueba
    this.checkElement('[class*="datos"], [class*="test-data"]', 'Sección de datos de prueba', false);

    console.log('  ✅ UI de CRUD Test verificada');
  }

  /**
   * Verificar que existe un elemento
   */
  checkElement(selector, description, required = true) {
    const element = document.querySelector(selector);
    if (!element) {
      if (required) {
        throw new Error(`Elemento requerido no encontrado: ${description} (${selector})`);
      } else {
        console.warn(`  ⚠️ Elemento opcional no encontrado: ${description}`);
        return false;
      }
    }
    console.log(`  ✅ ${description} encontrado`);
    return true;
  }

  /**
   * Esperar un tiempo determinado
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Registrar resultado de prueba
   */
  logResult(test, status, message) {
    const result = {
      test,
      status,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    this.results.push(result);
    
    const emoji = status === 'SUCCESS' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${emoji} ${test}: ${message}`);
  }

  /**
   * Generar reporte de pruebas de UI
   */
  generateUIReport() {
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

    console.log('\n📊 REPORTE DE PRUEBAS DE UI:');
    console.log(`   Total de pruebas: ${total}`);
    console.log(`   ✅ Exitosas: ${successful}`);
    console.log(`   ⚠️ Advertencias: ${warnings}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📈 Tasa de éxito: ${report.summary.successRate}%`);

    if (errors === 0) {
      console.log('\n🎉 ¡TODAS LAS PRUEBAS DE UI PASARON!');
    } else {
      console.log('\n⚠️ Algunas pruebas de UI fallaron. Revisar los errores arriba.');
    }

    return report;
  }

  /**
   * Probar funcionalidad específica
   */
  async testSpecificFeature(featureName, testFunction) {
    try {
      console.log(`\n🔍 Probando funcionalidad específica: ${featureName}`);
      await testFunction();
      this.logResult(featureName, 'SUCCESS', 'Funcionalidad verificada');
    } catch (error) {
      this.logResult(featureName, 'ERROR', error.message);
      console.error(`❌ Error en ${featureName}:`, error);
    }
  }
}

// Función de utilidad para ejecutar pruebas de UI
export const runUITests = async () => {
  const runner = new UITestRunner();
  return await runner.runAllUITests();
};

// Función para probar funcionalidad específica
export const testFeature = async (name, testFn) => {
  const runner = new UITestRunner();
  return await runner.testSpecificFeature(name, testFn);
};

// Exponer en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.runUITests = runUITests;
  window.testFeature = testFeature;
  
  // Función de utilidad para probar formularios
  window.testForm = async (formSelector) => {
    const form = document.querySelector(formSelector);
    if (!form) {
      console.error('❌ Formulario no encontrado:', formSelector);
      return false;
    }
    
    const inputs = form.querySelectorAll('input, select, textarea');
    console.log(`📝 Formulario encontrado con ${inputs.length} campos`);
    
    inputs.forEach((input, index) => {
      console.log(`  ${index + 1}. ${input.tagName} - ${input.type || input.tagName} - ${input.name || input.id || 'sin nombre'}`);
    });
    
    return true;
  };
  
  // Función para probar botones
  window.testButtons = () => {
    const buttons = document.querySelectorAll('button');
    console.log(`🔘 ${buttons.length} botones encontrados:`);
    
    buttons.forEach((button, index) => {
      const text = button.textContent.trim();
      const disabled = button.disabled;
      const classes = button.className;
      console.log(`  ${index + 1}. "${text}" - ${disabled ? 'DESHABILITADO' : 'HABILITADO'} - ${classes}`);
    });
    
    return buttons.length;
  };
}

export default UITestRunner;

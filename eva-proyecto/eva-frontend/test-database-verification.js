/**
 * VERIFICACIÓN DE DATOS EN BASE DE DATOS
 * Script para verificar que los datos de equipos están correctamente registrados
 */

const API_BASE_URL = 'http://localhost:8000/api';

console.log('🔍 VERIFICACIÓN DE DATOS EN BASE DE DATOS\n');
console.log('=' .repeat(60));

/**
 * Función para hacer peticiones HTTP
 */
async function makeRequest(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

/**
 * Verificar que el endpoint de verificación funciona
 */
async function testVerificationEndpoint() {
  console.log('\n🚀 PROBANDO ENDPOINT DE VERIFICACIÓN...');
  console.log('-'.repeat(50));
  
  const url = `${API_BASE_URL}/v1/test/verify-equipment-data`;
  const result = await makeRequest(url);
  
  if (result.success) {
    console.log('✅ Endpoint de verificación funciona correctamente');
    console.log(`📊 Status: ${result.status}`);
    return result.data;
  } else {
    console.log('❌ Error en endpoint de verificación');
    console.log(`📊 Status: ${result.status}`);
    console.log(`🔍 Error: ${result.error || result.data?.message}`);
    return null;
  }
}

/**
 * Verificar datos de un equipo específico
 */
async function verifyEquipmentData(equipmentId = null) {
  console.log('\n📋 VERIFICANDO DATOS DE EQUIPO...');
  console.log('-'.repeat(50));
  
  const url = equipmentId 
    ? `${API_BASE_URL}/v1/test/verify-equipment-data/${equipmentId}`
    : `${API_BASE_URL}/v1/test/verify-equipment-data`;
    
  const result = await makeRequest(url);
  
  if (!result.success) {
    console.log('❌ Error verificando datos del equipo');
    console.log(`📊 Status: ${result.status}`);
    console.log(`🔍 Error: ${result.error || result.data?.message}`);
    return null;
  }
  
  const { data } = result.data;
  const equipo = data.datos_equipo;
  const analisis = data.analisis_completitud;
  const stats = data.estadisticas;
  
  console.log(`✅ Datos del equipo ID: ${data.equipo_id}`);
  console.log(`📈 Completitud: ${stats.porcentaje_completitud}% (${stats.estado_general})`);
  
  // Mostrar información básica
  console.log('\n📌 INFORMACIÓN BÁSICA:');
  console.log(`   Nombre: ${equipo.name || '❌ VACÍO'}`);
  console.log(`   Código: ${equipo.code || '❌ VACÍO'}`);
  console.log(`   Serie: ${equipo.serial || '❌ VACÍO'}`);
  console.log(`   Marca: ${equipo.marca || '❌ VACÍO'}`);
  console.log(`   Modelo: ${equipo.modelo || '❌ VACÍO'}`);
  
  // Mostrar relaciones
  console.log('\n🔗 RELACIONES:');
  console.log(`   Servicio: ${equipo.servicio_nombre || '❌ NO RELACIONADO'} (ID: ${equipo.servicio_id})`);
  console.log(`   Área: ${equipo.area_nombre || '❌ NO RELACIONADO'} (ID: ${equipo.area_id || 'N/A'})`);
  console.log(`   Propietario: ${equipo.propietario_nombre || '❌ NO RELACIONADO'} (ID: ${equipo.propietario_id})`);
  console.log(`   Estado: ${equipo.estado_nombre || '❌ NO RELACIONADO'} (ID: ${equipo.estadoequipo_id || 'N/A'})`);
  console.log(`   Clasificación Biomédica: ${equipo.clasificacion_biomedica || '❌ NO RELACIONADO'} (ID: ${equipo.cbiomedica_id || 'N/A'})`);
  console.log(`   Clasificación Riesgo: ${equipo.clasificacion_riesgo || '❌ NO RELACIONADO'} (ID: ${equipo.criesgo_id || 'N/A'})`);
  
  // Mostrar fechas
  console.log('\n📅 FECHAS:');
  console.log(`   Fabricación: ${equipo.fecha_fabricacion || '❌ VACÍO'}`);
  console.log(`   Instalación: ${equipo.fecha_instalacion || '❌ VACÍO'}`);
  console.log(`   Adquisición: ${equipo.fecha_ad || '❌ VACÍO'}`);
  
  // Mostrar configuración técnica
  console.log('\n⚙️ CONFIGURACIÓN TÉCNICA:');
  console.log(`   Vida Útil: ${equipo.vida_util || '❌ VACÍO'}`);
  console.log(`   Costo: ${equipo.costo || '❌ VACÍO'}`);
  console.log(`   Calibración: ${equipo.calibracion || '❌ VACÍO'}`);
  console.log(`   Movilidad: ${equipo.movilidad || '❌ VACÍO'}`);
  
  // Análisis de completitud
  console.log('\n📊 ANÁLISIS DE COMPLETITUD:');
  console.log(`   Campos requeridos completos: ${analisis.requeridos_completos}`);
  console.log(`   Campos requeridos vacíos: ${analisis.requeridos_vacios}`);
  console.log(`   Campos opcionales completos: ${analisis.opcionales_completos}`);
  console.log(`   Campos opcionales vacíos: ${analisis.opcionales_vacios}`);
  
  if (analisis.campos_vacios.length > 0) {
    console.log('\n❌ CAMPOS VACÍOS:');
    analisis.campos_vacios.forEach(campo => {
      console.log(`   - ${campo}`);
    });
  }
  
  if (analisis.campos_completos.length > 0) {
    console.log('\n✅ CAMPOS COMPLETOS:');
    analisis.campos_completos.forEach(campo => {
      console.log(`   - ${campo}`);
    });
  }
  
  return data;
}

/**
 * Probar el endpoint complete-info
 */
async function testCompleteInfoEndpoint(equipmentId) {
  console.log('\n🔧 PROBANDO ENDPOINT COMPLETE-INFO...');
  console.log('-'.repeat(50));
  
  const url = `${API_BASE_URL}/v1/equipos/${equipmentId}/complete-info`;
  const result = await makeRequest(url);
  
  if (result.success) {
    console.log('✅ Endpoint complete-info funciona correctamente');
    console.log(`📊 Campos en respuesta: ${Object.keys(result.data.data).length}`);
    
    // Verificar campos críticos
    const data = result.data.data;
    const camposCriticos = [
      'id', 'name', 'code', 'serial', 'marca', 'modelo',
      'servicio_id', 'propietario_id', 'estadoequipo_id',
      'cbiomedica_id', 'criesgo_id'
    ];
    
    console.log('\n🔍 VERIFICACIÓN DE CAMPOS CRÍTICOS:');
    camposCriticos.forEach(campo => {
      const valor = data[campo];
      const status = (valor !== null && valor !== undefined && valor !== '') ? '✅' : '❌';
      console.log(`   ${status} ${campo}: ${valor || 'VACÍO'}`);
    });
    
    return data;
  } else {
    console.log('❌ Error en endpoint complete-info');
    console.log(`📊 Status: ${result.status}`);
    console.log(`🔍 Error: ${result.error || result.data?.message}`);
    return null;
  }
}

/**
 * Verificar opciones de dropdown
 */
async function testDropdownOptions() {
  console.log('\n📋 VERIFICANDO OPCIONES DE DROPDOWN...');
  console.log('-'.repeat(50));
  
  const url = `${API_BASE_URL}/v1/equipos/filter-options`;
  const result = await makeRequest(url);
  
  if (result.success) {
    console.log('✅ Endpoint filter-options funciona correctamente');
    
    const options = result.data.data;
    const dropdowns = [
      'servicios', 'areas', 'propietarios', 'estados',
      'clasificaciones', 'riesgos', 'fuentes', 'tecnologias', 'frecuencias'
    ];
    
    console.log('\n📊 OPCIONES DISPONIBLES:');
    dropdowns.forEach(dropdown => {
      const count = options[dropdown]?.length || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`   ${status} ${dropdown}: ${count} opciones`);
    });
    
    return options;
  } else {
    console.log('❌ Error en endpoint filter-options');
    console.log(`📊 Status: ${result.status}`);
    console.log(`🔍 Error: ${result.error || result.data?.message}`);
    return null;
  }
}

/**
 * Función principal de verificación
 */
async function runDatabaseVerification() {
  console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DE BASE DE DATOS\n');
  
  try {
    // 1. Probar endpoint de verificación
    const verificationData = await testVerificationEndpoint();
    if (!verificationData) {
      console.log('\n❌ No se puede continuar sin el endpoint de verificación');
      return;
    }
    
    const equipmentId = verificationData.data.equipo_id;
    
    // 2. Verificar datos del equipo
    const equipmentData = await verifyEquipmentData(equipmentId);
    if (!equipmentData) {
      console.log('\n❌ No se pudieron verificar los datos del equipo');
      return;
    }
    
    // 3. Probar endpoint complete-info
    const completeInfoData = await testCompleteInfoEndpoint(equipmentId);
    if (!completeInfoData) {
      console.log('\n❌ El endpoint complete-info no funciona correctamente');
    }
    
    // 4. Verificar opciones de dropdown
    const dropdownOptions = await testDropdownOptions();
    if (!dropdownOptions) {
      console.log('\n❌ Las opciones de dropdown no están disponibles');
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VERIFICACIÓN:');
    
    const stats = equipmentData.estadisticas;
    console.log(`✅ Equipo verificado: ID ${equipmentId}`);
    console.log(`📈 Completitud de datos: ${stats.porcentaje_completitud}%`);
    console.log(`🎯 Estado general: ${stats.estado_general}`);
    console.log(`🔒 Campos requeridos: ${stats.campos_requeridos_ok ? 'COMPLETOS' : 'INCOMPLETOS'}`);
    
    if (stats.porcentaje_completitud >= 70 && stats.campos_requeridos_ok) {
      console.log('\n🎉 ¡Los datos están correctamente registrados en la base de datos!');
      console.log('✅ El modal de edición debería funcionar correctamente');
    } else {
      console.log('\n⚠️  Se encontraron problemas en los datos:');
      if (!stats.campos_requeridos_ok) {
        console.log('❌ Faltan campos requeridos');
      }
      if (stats.porcentaje_completitud < 70) {
        console.log('❌ Baja completitud de datos');
      }
    }
    
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Si los datos están completos, probar el modal de edición');
    console.log('2. Si faltan datos, completar la información en la base de datos');
    console.log('3. Verificar que las relaciones (servicios, propietarios, etc.) existan');
    console.log('4. Probar la funcionalidad de edición y guardado');
    
  } catch (error) {
    console.log('\n❌ Error durante la verificación:', error.message);
  }
}

// Ejecutar verificación si se ejecuta directamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runDatabaseVerification();
} else {
  // Browser environment
  window.runDatabaseVerification = runDatabaseVerification;
  console.log('💡 Ejecuta runDatabaseVerification() para iniciar la verificación');
}

// Exportar funciones para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runDatabaseVerification,
    verifyEquipmentData,
    testCompleteInfoEndpoint,
    testDropdownOptions
  };
}

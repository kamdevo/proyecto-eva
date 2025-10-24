/**
 * ========================================================================
 * 🧪 SCRIPT DE PRUEBA COMPLETO - CRUD EQUIPOS DE BAJA
 * ========================================================================
 * Script para probar todos los endpoints del CRUD de bajas de equipos
 * desde el terminal usando Node.js
 */

const API_BASE_URL = 'http://localhost:8001/api';

// Función para hacer peticiones HTTP
async function makeRequest(method, endpoint, data = null, isFormData = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method: method,
    headers: {
      'Accept': 'application/json',
    }
  };

  if (data) {
    if (isFormData) {
      // Para FormData no establecer Content-Type, el navegador lo hará automáticamente
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  try {
    console.log(`\n🔄 ${method} ${url}`);
    if (data && !isFormData) {
      console.log('📤 Datos enviados:', JSON.stringify(data, null, 2));
    }
    
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('📥 Respuesta:', JSON.stringify(responseData, null, 2));
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para crear FormData de prueba
function createTestFormData() {
  const formData = new FormData();
  formData.append('fecha_baja', '2024-10-15');
  formData.append('descripcion', 'Baja de prueba desde script');
  formData.append('motivo', 'Obsolescencia');
  formData.append('observaciones', 'Prueba automatizada del CRUD');
  return formData;
}

// Función para crear FormData para dar de baja equipo
function createEquipmentDecommissionFormData() {
  const formData = new FormData();
  formData.append('fecha_baja', '2024-10-15');
  formData.append('descripcion', 'Dar de baja equipo desde script');
  formData.append('motivo', 'Daño irreparable');
  formData.append('observaciones', 'Prueba del endpoint de dar de baja equipo');
  return formData;
}

async function testBajasCRUD() {
  console.log('🚀 INICIANDO PRUEBAS DEL CRUD DE BAJAS DE EQUIPOS\n');
  console.log('=' .repeat(60));

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // ========================================================================
  // 1. PROBAR OBTENER LISTA DE BAJAS (GET /v1/bajas)
  // ========================================================================
  console.log('\n📋 1. PROBANDO: Obtener lista de bajas');
  testResults.total++;
  
  const listResult = await makeRequest('GET', '/v1/bajas?page=1&per_page=10');
  if (listResult.success) {
    console.log('✅ Lista de bajas obtenida correctamente');
    testResults.passed++;
  } else {
    console.log('❌ Error al obtener lista de bajas');
    testResults.failed++;
  }

  // ========================================================================
  // 2. PROBAR CREAR NUEVA BAJA (POST /v1/bajas)
  // ========================================================================
  console.log('\n📝 2. PROBANDO: Crear nueva baja');
  testResults.total++;
  
  const createFormData = createTestFormData();
  const createResult = await makeRequest('POST', '/v1/bajas', createFormData, true);
  let createdBajaId = null;
  
  if (createResult.success && createResult.data.success) {
    console.log('✅ Baja creada correctamente');
    createdBajaId = createResult.data.data?.id;
    testResults.passed++;
  } else {
    console.log('❌ Error al crear baja');
    testResults.failed++;
  }

  // ========================================================================
  // 3. PROBAR OBTENER BAJA ESPECÍFICA (GET /v1/bajas/{id})
  // ========================================================================
  if (createdBajaId) {
    console.log('\n👁️ 3. PROBANDO: Obtener baja específica');
    testResults.total++;
    
    const getResult = await makeRequest('GET', `/v1/bajas/${createdBajaId}`);
    if (getResult.success) {
      console.log('✅ Baja específica obtenida correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al obtener baja específica');
      testResults.failed++;
    }
  }

  // ========================================================================
  // 4. PROBAR ACTUALIZAR BAJA (PUT /v1/bajas/{id})
  // ========================================================================
  if (createdBajaId) {
    console.log('\n✏️ 4. PROBANDO: Actualizar baja');
    testResults.total++;
    
    const updateFormData = new FormData();
    updateFormData.append('fecha_baja', '2024-10-16');
    updateFormData.append('descripcion', 'Baja actualizada desde script');
    updateFormData.append('motivo', 'Fin de vida útil');
    updateFormData.append('observaciones', 'Prueba de actualización');
    updateFormData.append('_method', 'PUT');
    
    const updateResult = await makeRequest('POST', `/v1/bajas/${createdBajaId}`, updateFormData, true);
    if (updateResult.success) {
      console.log('✅ Baja actualizada correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al actualizar baja');
      testResults.failed++;
    }
  }

  // ========================================================================
  // 5. PROBAR OBTENER EQUIPOS DISPONIBLES (GET /v1/equipos/available-for-baja)
  // ========================================================================
  console.log('\n🔧 5. PROBANDO: Obtener equipos disponibles para baja');
  testResults.total++;
  
  const availableResult = await makeRequest('GET', '/v1/equipos/available-for-baja?page=1&per_page=5');
  let testEquipoId = null;
  
  if (availableResult.success && availableResult.data.success) {
    console.log('✅ Equipos disponibles obtenidos correctamente');
    const equipos = availableResult.data.data?.data || [];
    if (equipos.length > 0) {
      testEquipoId = equipos[0].id;
      console.log(`📌 Usando equipo ID ${testEquipoId} para pruebas`);
    }
    testResults.passed++;
  } else {
    console.log('❌ Error al obtener equipos disponibles');
    testResults.failed++;
  }

  // ========================================================================
  // 6. PROBAR DAR DE BAJA EQUIPO (POST /v1/equipos/{id}/dar-baja)
  // ========================================================================
  if (testEquipoId) {
    console.log('\n🔻 6. PROBANDO: Dar de baja equipo específico');
    testResults.total++;
    
    const decommissionFormData = createEquipmentDecommissionFormData();
    const decommissionResult = await makeRequest('POST', `/v1/equipos/${testEquipoId}/dar-baja`, decommissionFormData, true);
    
    if (decommissionResult.success) {
      console.log('✅ Equipo dado de baja correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al dar de baja equipo');
      testResults.failed++;
    }
  }

  // ========================================================================
  // 7. PROBAR ASOCIAR EQUIPOS A BAJA (POST /v1/bajas/{id}/equipos)
  // ========================================================================
  if (createdBajaId && testEquipoId) {
    console.log('\n🔗 7. PROBANDO: Asociar equipos a baja');
    testResults.total++;
    
    const associateData = {
      equipo_ids: [testEquipoId]
    };
    
    const associateResult = await makeRequest('POST', `/v1/bajas/${createdBajaId}/equipos`, associateData);
    if (associateResult.success) {
      console.log('✅ Equipos asociados correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al asociar equipos');
      testResults.failed++;
    }
  }

  // ========================================================================
  // 8. PROBAR OBTENER EQUIPOS ASOCIADOS (GET /v1/bajas/{id}/equipos)
  // ========================================================================
  if (createdBajaId) {
    console.log('\n📋 8. PROBANDO: Obtener equipos asociados a baja');
    testResults.total++;
    
    const associatedResult = await makeRequest('GET', `/v1/bajas/${createdBajaId}/equipos`);
    if (associatedResult.success) {
      console.log('✅ Equipos asociados obtenidos correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al obtener equipos asociados');
      testResults.failed++;
    }
  }

  // ========================================================================
  // 9. PROBAR REMOVER ASOCIACIÓN (DELETE /v1/bajas/{id}/equipos/{equipoId})
  // ========================================================================
  if (createdBajaId && testEquipoId) {
    console.log('\n🔓 9. PROBANDO: Remover asociación de equipo');
    testResults.total++;
    
    const removeResult = await makeRequest('DELETE', `/v1/bajas/${createdBajaId}/equipos/${testEquipoId}`);
    if (removeResult.success) {
      console.log('✅ Asociación removida correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al remover asociación');
      testResults.failed++;
    }
  }

  // ========================================================================
  // 10. PROBAR ELIMINAR BAJA (DELETE /v1/bajas/{id})
  // ========================================================================
  if (createdBajaId) {
    console.log('\n🗑️ 10. PROBANDO: Eliminar baja');
    testResults.total++;
    
    const deleteResult = await makeRequest('DELETE', `/v1/bajas/${createdBajaId}`);
    if (deleteResult.success) {
      console.log('✅ Baja eliminada correctamente');
      testResults.passed++;
    } else {
      console.log('❌ Error al eliminar baja');
      testResults.failed++;
    }
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS DEL CRUD DE BAJAS:');
  console.log('=' .repeat(60));
  console.log(`✅ Pruebas exitosas: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ Pruebas fallidas: ${testResults.failed}/${testResults.total}`);
  console.log(`📈 Porcentaje de éxito: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
    console.log('✅ El CRUD de bajas está funcionando correctamente');
  } else {
    console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
    console.log('🔧 Revisa los endpoints que presentaron errores');
  }
  
  console.log('\n📝 ENDPOINTS PROBADOS:');
  console.log('   • GET /v1/bajas - Lista de bajas');
  console.log('   • POST /v1/bajas - Crear baja');
  console.log('   • GET /v1/bajas/{id} - Obtener baja específica');
  console.log('   • PUT /v1/bajas/{id} - Actualizar baja');
  console.log('   • DELETE /v1/bajas/{id} - Eliminar baja');
  console.log('   • GET /v1/equipos/available-for-baja - Equipos disponibles');
  console.log('   • POST /v1/equipos/{id}/dar-baja - Dar de baja equipo');
  console.log('   • POST /v1/bajas/{id}/equipos - Asociar equipos');
  console.log('   • GET /v1/bajas/{id}/equipos - Equipos asociados');
  console.log('   • DELETE /v1/bajas/{id}/equipos/{equipoId} - Remover asociación');
}

// Ejecutar las pruebas
testBajasCRUD().catch(console.error);

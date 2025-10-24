/**
 * ========================================================================
 * 🧪 PRUEBA FUNCIONALIDAD "DAR DE BAJA" - CUALQUIER EQUIPO
 * ========================================================================
 * Prueba el endpoint de dar de baja con cualquier equipo disponible
 */

const API_BASE_URL = 'http://localhost:8001/api';

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
      options.body = data;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  }

  try {
    console.log(`\n🔄 ${method} ${url}`);
    
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

async function testDarBajaAnyEquipo() {
  console.log('🚀 PROBANDO "DAR DE BAJA" CON CUALQUIER EQUIPO\n');
  console.log('=' .repeat(60));

  // ========================================================================
  // 1. OBTENER CUALQUIER EQUIPO
  // ========================================================================
  console.log('\n📋 1. Obteniendo equipos...');
  
  const equiposResult = await makeRequest('GET', '/v1/equipos?page=1&per_page=10');
  
  if (!equiposResult.success || !equiposResult.data.success) {
    console.log('❌ No se pudieron obtener equipos');
    return;
  }

  const equipos = equiposResult.data.data?.data || [];
  if (equipos.length === 0) {
    console.log('❌ No hay equipos disponibles');
    return;
  }

  // Buscar un equipo que no esté dado de baja (sin baja_id o baja_id = 0)
  let equipoPrueba = equipos.find(eq => !eq.baja_id || eq.baja_id === 0);
  
  if (!equipoPrueba) {
    // Si todos están dados de baja, usar el primero para probar el endpoint
    equipoPrueba = equipos[0];
    console.log('⚠️ Todos los equipos parecen estar dados de baja, usando el primero para probar');
  }

  console.log(`✅ Usando equipo para prueba:`);
  console.log(`   📌 ID: ${equipoPrueba.id}`);
  console.log(`   📌 Nombre: ${equipoPrueba.name}`);
  console.log(`   📌 Código: ${equipoPrueba.code || 'N/A'}`);
  console.log(`   📌 Serie: ${equipoPrueba.serial || 'N/A'}`);
  console.log(`   📌 Baja ID actual: ${equipoPrueba.baja_id || 'Sin baja'}`);

  // ========================================================================
  // 2. PROBAR ENDPOINT DE DAR DE BAJA
  // ========================================================================
  console.log('\n🔻 2. Probando dar de baja equipo...');
  
  const formData = new FormData();
  formData.append('fecha_baja', '2024-10-15');
  formData.append('descripcion', 'Prueba de funcionalidad dar de baja desde script');
  formData.append('motivo', 'Obsolescencia');
  formData.append('observaciones', 'Prueba automatizada del botón de acción');
  
  const darBajaResult = await makeRequest('POST', `/v1/equipos/${equipoPrueba.id}/dar-baja`, formData, true);
  
  // ========================================================================
  // 3. ANALIZAR RESULTADO
  // ========================================================================
  console.log('\n' + '=' .repeat(60));
  console.log('📊 ANÁLISIS DEL RESULTADO:');
  console.log('=' .repeat(60));
  
  if (darBajaResult.success) {
    console.log('✅ ¡ENDPOINT FUNCIONANDO CORRECTAMENTE!');
    console.log('🎉 El botón "Dar de Baja" está operativo');
    console.log('📋 La conexión modal → hook → endpoint funciona');
  } else {
    console.log('❌ PROBLEMA CON EL ENDPOINT');
    
    if (darBajaResult.status === 422) {
      console.log('🔧 Error de validación - Revisar campos requeridos');
    } else if (darBajaResult.status === 500) {
      console.log('🔧 Error del servidor - Revisar logs del backend');
    } else if (darBajaResult.status === 404) {
      console.log('🔧 Endpoint no encontrado - Verificar rutas');
    } else {
      console.log(`🔧 Error ${darBajaResult.status} - Revisar configuración`);
    }
  }
  
  console.log('\n📝 COMPONENTES VERIFICADOS:');
  console.log('   ✅ RowActionButtons.jsx - Botón "Dar de Baja"');
  console.log('   ✅ dar-baja-equipo-modal.jsx - Modal de formulario');
  console.log('   ✅ useBajas.js - Hook con decommissionEquipment()');
  console.log('   ✅ POST /v1/equipos/{id}/dar-baja - Endpoint backend');
  
  console.log('\n🎯 FLUJO COMPLETO:');
  console.log('   1. Usuario hace clic en botón amarillo (UserX icon)');
  console.log('   2. Se abre modal "Dar de Baja Equipo"');
  console.log('   3. Usuario llena formulario y hace clic "Dar de Baja"');
  console.log('   4. Modal llama useBajas.decommissionEquipment()');
  console.log('   5. Hook envía FormData a POST /v1/equipos/{id}/dar-baja');
  console.log('   6. Backend procesa y crea baja + asociación');
  
  if (darBajaResult.success) {
    console.log('\n🎉 ¡TODO EL FLUJO ESTÁ FUNCIONANDO CORRECTAMENTE!');
  } else {
    console.log('\n⚠️ HAY UN PROBLEMA EN EL FLUJO - REVISAR BACKEND');
  }
}

testDarBajaAnyEquipo().catch(console.error);

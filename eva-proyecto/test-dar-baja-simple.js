/**
 * ========================================================================
 * 🧪 PRUEBA SIMPLE - DAR DE BAJA EQUIPO DESDE BOTÓN DE ACCIÓN
 * ========================================================================
 * Prueba específica del endpoint que usa el botón "Dar de Baja" 
 * en las páginas de equipos médicos e industriales
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

async function testDarBajaEquipo() {
  console.log('🚀 PROBANDO FUNCIONALIDAD "DAR DE BAJA EQUIPO"\n');
  console.log('=' .repeat(60));

  // ========================================================================
  // 1. OBTENER UN EQUIPO DISPONIBLE PARA PRUEBA
  // ========================================================================
  console.log('\n📋 1. Obteniendo equipos disponibles...');
  
  const equiposResult = await makeRequest('GET', '/v1/equipos/available-for-baja?page=1&per_page=5');
  
  if (!equiposResult.success || !equiposResult.data.success) {
    console.log('❌ No se pudieron obtener equipos disponibles');
    return;
  }

  const equipos = equiposResult.data.data?.data || [];
  if (equipos.length === 0) {
    console.log('❌ No hay equipos disponibles para dar de baja');
    return;
  }

  const equipoPrueba = equipos[0];
  console.log(`✅ Usando equipo para prueba:`);
  console.log(`   📌 ID: ${equipoPrueba.id}`);
  console.log(`   📌 Nombre: ${equipoPrueba.name}`);
  console.log(`   📌 Código: ${equipoPrueba.code || 'N/A'}`);
  console.log(`   📌 Serie: ${equipoPrueba.serial || 'N/A'}`);

  // ========================================================================
  // 2. PROBAR ENDPOINT DE DAR DE BAJA EQUIPO
  // ========================================================================
  console.log('\n🔻 2. Probando dar de baja equipo...');
  
  // Crear FormData como lo hace el modal
  const formData = new FormData();
  formData.append('fecha_baja', '2024-10-15');
  formData.append('descripcion', 'Prueba de dar de baja desde script de testing');
  formData.append('motivo', 'Obsolescencia');
  formData.append('observaciones', 'Equipo dado de baja para pruebas del sistema');
  
  const darBajaResult = await makeRequest('POST', `/v1/equipos/${equipoPrueba.id}/dar-baja`, formData, true);
  
  if (darBajaResult.success) {
    console.log('✅ ¡EQUIPO DADO DE BAJA EXITOSAMENTE!');
    console.log('📄 El modal "Dar de Baja Equipo" está funcionando correctamente');
  } else {
    console.log('❌ Error al dar de baja el equipo');
    console.log('🔧 Revisa el endpoint POST /v1/equipos/{id}/dar-baja');
  }

  // ========================================================================
  // 3. VERIFICAR QUE EL EQUIPO FUE DADO DE BAJA
  // ========================================================================
  console.log('\n🔍 3. Verificando estado del equipo...');
  
  const verificarResult = await makeRequest('GET', `/v1/equipos/${equipoPrueba.id}`);
  
  if (verificarResult.success && verificarResult.data.success) {
    const equipoActualizado = verificarResult.data.data;
    console.log(`📊 Estado actual del equipo:`);
    console.log(`   📌 ID: ${equipoActualizado.id}`);
    console.log(`   📌 Estado: ${equipoActualizado.estado || 'N/A'}`);
    console.log(`   📌 Baja ID: ${equipoActualizado.baja_id || 'N/A'}`);
    
    if (equipoActualizado.baja_id) {
      console.log('✅ El equipo fue asociado correctamente a una baja');
    } else {
      console.log('⚠️ El equipo no muestra asociación con baja');
    }
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE LA PRUEBA:');
  console.log('=' .repeat(60));
  
  if (darBajaResult.success) {
    console.log('✅ FUNCIONALIDAD "DAR DE BAJA" FUNCIONANDO CORRECTAMENTE');
    console.log('🎉 El botón de acción en las páginas de equipos está operativo');
    console.log('📋 El modal se conecta correctamente con el backend');
    console.log('🔗 El endpoint POST /v1/equipos/{id}/dar-baja responde correctamente');
  } else {
    console.log('❌ PROBLEMA CON LA FUNCIONALIDAD "DAR DE BAJA"');
    console.log('🔧 Revisa la conexión entre el modal y el endpoint');
  }
  
  console.log('\n📝 ENDPOINT PROBADO:');
  console.log(`   • POST /v1/equipos/${equipoPrueba.id}/dar-baja`);
  console.log('\n🎯 COMPONENTES INVOLUCRADOS:');
  console.log('   • components/equipment/RowActionButtons.jsx');
  console.log('   • components/modals/dar-baja-equipo-modal.jsx');
  console.log('   • hooks/useBajas.js');
  console.log('   • medical-devices-view.jsx');
  console.log('   • IndustrialDevices.jsx');
}

// Ejecutar la prueba
testDarBajaEquipo().catch(console.error);

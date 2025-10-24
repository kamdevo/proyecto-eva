/**
 * ========================================================================
 * 🧪 PRUEBA DIRECTA - ENDPOINT DAR DE BAJA EQUIPO
 * ========================================================================
 * Prueba directa del endpoint sin depender de otros endpoints
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

async function testDarBajaDirecto() {
  console.log('🚀 PRUEBA DIRECTA DEL ENDPOINT "DAR DE BAJA EQUIPO"\n');
  console.log('=' .repeat(60));

  // Usar IDs conocidos de los equipos que vimos antes
  const equiposIds = [58, 2055, 2214, 2448];
  
  for (const equipoId of equiposIds) {
    console.log(`\n🔻 Probando dar de baja equipo ID: ${equipoId}`);
    
    const formData = new FormData();
    formData.append('fecha_baja', '2024-10-15');
    formData.append('descripcion', `Prueba directa de dar de baja equipo ${equipoId}`);
    formData.append('motivo', 'Obsolescencia');
    formData.append('observaciones', 'Prueba automatizada del endpoint directo');
    
    const result = await makeRequest('POST', `/v1/equipos/${equipoId}/dar-baja`, formData, true);
    
    if (result.success) {
      console.log(`✅ Equipo ${equipoId} dado de baja exitosamente`);
      break; // Si uno funciona, no necesitamos probar todos
    } else {
      console.log(`❌ Error con equipo ${equipoId}: ${result.data?.message || 'Error desconocido'}`);
    }
  }

  // ========================================================================
  // RESUMEN FINAL
  // ========================================================================
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMEN DE LA PRUEBA DIRECTA:');
  console.log('=' .repeat(60));
  
  console.log('🎯 ENDPOINT PROBADO:');
  console.log('   • POST /v1/equipos/{id}/dar-baja');
  
  console.log('\n📋 DATOS ENVIADOS:');
  console.log('   • fecha_baja: 2024-10-15');
  console.log('   • descripcion: Prueba directa...');
  console.log('   • motivo: Obsolescencia');
  console.log('   • observaciones: Prueba automatizada...');
  
  console.log('\n🔗 COMPONENTES QUE USAN ESTE ENDPOINT:');
  console.log('   • Modal: dar-baja-equipo-modal.jsx');
  console.log('   • Hook: useBajas.js → decommissionEquipment()');
  console.log('   • Botón: RowActionButtons.jsx → onDecommissionClick');
  console.log('   • Páginas: medical-devices-view.jsx, IndustrialDevices.jsx');
  
  console.log('\n📝 CONCLUSIÓN:');
  console.log('Si el endpoint responde correctamente, entonces:');
  console.log('✅ El botón "Dar de Baja" debería funcionar');
  console.log('✅ El modal debería procesar correctamente');
  console.log('✅ La funcionalidad está operativa');
}

testDarBajaDirecto().catch(console.error);

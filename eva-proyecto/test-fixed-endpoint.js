// PRUEBA DEL ENDPOINT CORREGIDO
console.log("=== PROBANDO ENDPOINT EXPORT CORREGIDO ===");

// 1. Primero probar el endpoint de test
console.log("🧪 1. PROBANDO ENDPOINT DE TEST...");
fetch('http://192.168.2.146:8001/api/v1/planes-mantenimientos/export-test?anio=2024', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('eva_auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => {
  console.log('✅ ENDPOINT TEST RESULT:', d);
  
  if (d.success) {
    console.log('🎉 Endpoint test OK - total registros:', d.total);
    console.log('📋 Columnas mantenimiento:', d.columns_available);
    console.log('📊 Datos muestra:', d.data);
    
    // 2. Si el test funciona, probar el endpoint principal
    console.log("\n🚀 2. PROBANDO ENDPOINT PRINCIPAL...");
    
    return fetch('http://192.168.2.146:8001/api/v1/planes-mantenimientos/export?anio=2024&formato=excel', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('eva_auth_token'),
        'Accept': 'application/json'
      }
    });
  } else {
    throw new Error('Test endpoint failed: ' + d.message);
  }
})
.then(response => {
  console.log('📊 ENDPOINT PRINCIPAL - Status:', response.status);
  console.log('📊 ENDPOINT PRINCIPAL - Headers:', Object.fromEntries(response.headers.entries()));
  
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return response.json().then(data => {
        console.log('✅ RESPUESTA JSON:', data);
      });
    } else {
      // Es un archivo
      return response.blob().then(blob => {
        console.log('🎉 ¡ARCHIVO GENERADO EXITOSAMENTE!');
        console.log('📁 Tamaño:', blob.size, 'bytes');
        console.log('📁 Tipo:', blob.type);
        
        // Crear enlace de descarga para probar
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'PreventivosEB.xls';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        console.log('📥 Archivo descargado como PreventivosEB.xls');
      });
    }
  } else {
    return response.text().then(error => {
      console.error('❌ ERROR EN ENDPOINT PRINCIPAL:', error);
    });
  }
})
.catch(e => {
  console.error('❌ ERROR GENERAL:', e);
});

console.log("💡 Ejecutando pruebas... revisa los logs de arriba.");

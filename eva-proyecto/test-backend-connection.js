/**
 * Script de prueba de conectividad para verificar que el backend esté funcionando
 */

const API_BASE_URL = "http://localhost:8000/api";

async function testBackendConnection() {
  console.log("🔌 Verificando conectividad del backend...\n");

  try {
    // 1. Probar endpoint de prueba básico
    console.log("1️⃣ Probando endpoint de prueba: /test/equipos-connection");
    const testResponse = await fetch(`${API_BASE_URL}/test/equipos-connection`);

    if (!testResponse.ok) {
      throw new Error(
        `HTTP ${testResponse.status}: ${testResponse.statusText}`
      );
    }

    const testData = await testResponse.json();
    console.log("✅ Respuesta del endpoint de prueba:");
    console.log("   - Estado:", testData.backend_status);
    console.log("   - Mensaje:", testData.message);
    console.log("   - Timestamp:", testData.timestamp);
    console.log("");

    // 2. Probar endpoint de equipos médicos
    console.log("2️⃣ Probando endpoint: /equipos/medical-devices-complete");
    const medicalDevicesResponse = await fetch(
      `${API_BASE_URL}/equipos/medical-devices-complete?page=1&per_page=5`
    );

    if (!medicalDevicesResponse.ok) {
      const errorText = await medicalDevicesResponse.text();
      throw new Error(
        `HTTP ${medicalDevicesResponse.status}: ${medicalDevicesResponse.statusText}\nRespuesta: ${errorText}`
      );
    }

    const medicalDevicesData = await medicalDevicesResponse.json();
    console.log("✅ Respuesta de equipos médicos:");
    console.log("   - Success:", medicalDevicesData.success);
    console.log(
      "   - Total equipos:",
      medicalDevicesData.total || medicalDevicesData.data?.length || "N/A"
    );
    console.log(
      "   - Página actual:",
      medicalDevicesData.current_page || "N/A"
    );
    console.log("");

    // 3. Probar endpoint de opciones de filtros
    console.log("3️⃣ Probando endpoint: /equipos/filter-options");
    const filterOptionsResponse = await fetch(
      `${API_BASE_URL}/equipos/filter-options`
    );

    if (!filterOptionsResponse.ok) {
      const errorText = await filterOptionsResponse.text();
      throw new Error(
        `HTTP ${filterOptionsResponse.status}: ${filterOptionsResponse.statusText}\nRespuesta: ${errorText}`
      );
    }

    const filterOptionsData = await filterOptionsResponse.json();
    console.log("✅ Respuesta de opciones de filtros:");
    console.log("   - Success:", filterOptionsData.success);
    console.log(
      "   - Servicios disponibles:",
      filterOptionsData.servicios?.length || "N/A"
    );
    console.log(
      "   - Áreas disponibles:",
      filterOptionsData.areas?.length || "N/A"
    );
    console.log("");

    console.log("🎉 ¡Todas las pruebas de backend pasaron exitosamente!");
    console.log(
      "✅ El backend está funcionando correctamente en:",
      API_BASE_URL
    );
  } catch (error) {
    console.error("❌ Error de conectividad del backend:", error.message);
    console.log("\n🔧 Verificaciones recomendadas:");
    console.log(
      "   1. Asegúrate de que el servidor Laravel esté ejecutándose:"
    );
    console.log("      cd eva-backend && php artisan serve");
    console.log(
      "   2. Verifica que el servidor esté en: http://localhost:8000"
    );
    console.log("   3. Confirma que la base de datos esté conectada");
    console.log("   4. Revisa los logs del servidor: storage/logs/laravel.log");
    console.log("   5. Verifica la configuración de CORS en config/cors.php");
  }
}

// Función adicional para verificar CORS
async function testCORSConfiguration() {
  console.log("\n🌐 Verificando configuración CORS...");

  try {
    const response = await fetch(`${API_BASE_URL}/test/equipos-connection`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("✅ CORS OPTIONS request successful");
    console.log("   - Status:", response.status);
  } catch (error) {
    console.warn("⚠️  CORS verification failed:", error.message);
    console.log("   - Esto podría indicar problemas de configuración CORS");
  }
}

// Ejecutar pruebas
testBackendConnection().then(() => {
  testCORSConfiguration();
});

console.log("\n📋 Información de configuración:");
console.log("Frontend URL esperado: http://localhost:5173");
console.log("Backend URL configurado:", API_BASE_URL);
console.log("Rutas de prueba disponibles:");
console.log("  - GET /api/test/equipos-connection");
console.log("  - GET /api/equipos/medical-devices-complete");
console.log("  - GET /api/equipos/filter-options");
console.log("  - GET /api/equipos/estadisticas/medical-devices");

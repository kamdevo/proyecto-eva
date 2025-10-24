// SCRIPT PARA PROBAR ENDPOINT CON AUTENTICACIÓN
console.log("=== PRUEBA ENDPOINT EXPORTAR CONSOLIDADO ===");

// 1. Obtener token del localStorage
const token = localStorage.getItem('eva_auth_token');
console.log("🔑 Token encontrado:", !!token);

if (!token) {
    console.error("❌ No hay token. Debes estar logueado.");
} else {
    console.log("✅ Token disponible, realizando prueba...");
    
    // 2. Probar endpoint con fetch
    const testEndpoint = async () => {
        try {
            console.log("📡 Probando endpoint...");
            
            const url = "http://192.168.2.146:8001/api/v1/planes-mantenimientos/export?anio=2024&formato=excel";
            console.log("🔗 URL:", url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("📊 Status:", response.status);
            console.log("📊 Status Text:", response.statusText);
            console.log("📊 Headers:", Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                console.log("✅ ÉXITO - Endpoint funciona correctamente");
                
                // Si es JSON, mostrar contenido
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log("📋 Respuesta JSON:", data);
                } else {
                    console.log("📁 Respuesta es un archivo (blob)");
                    const blob = await response.blob();
                    console.log("📁 Tamaño del archivo:", blob.size, "bytes");
                    console.log("📁 Tipo de archivo:", blob.type);
                }
            } else {
                console.error("❌ ERROR - Status:", response.status);
                
                // Intentar obtener detalles del error
                try {
                    const errorText = await response.text();
                    console.error("❌ Detalles del error:", errorText);
                } catch (e) {
                    console.error("❌ No se pudo obtener detalles del error");
                }
            }
            
        } catch (error) {
            console.error("❌ ERROR EN LA PETICIÓN:", error);
        }
    };
    
    // 3. Ejecutar prueba
    testEndpoint();
}

// 4. También probar sin formato específico
setTimeout(() => {
    console.log("\n=== PROBANDO SIN FORMATO ESPECÍFICO ===");
    
    const testBasic = async () => {
        try {
            const url = "http://192.168.2.146:8001/api/v1/planes-mantenimientos/export?anio=2024";
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            
            console.log("📊 Status (sin formato):", response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log("✅ Respuesta básica OK:", data);
            } else {
                const error = await response.text();
                console.error("❌ Error básico:", error);
            }
        } catch (e) {
            console.error("❌ Error en prueba básica:", e);
        }
    };
    
    if (token) testBasic();
}, 2000);

console.log("💡 Ejecuta este script en la consola del navegador (F12) mientras estés logueado.");

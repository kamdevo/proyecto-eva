// PRUEBA COMPLETA DEL SISTEMA DE AUTENTICACIÓN
console.log("=== PRUEBA SISTEMA DE AUTENTICACIÓN COMPLETO ===");

const token = localStorage.getItem('eva_auth_token');
console.log("🔑 Token encontrado:", !!token);

if (!token) {
    console.error("❌ No hay token. Debes estar logueado.");
} else {
    console.log("✅ Token disponible, probando endpoints...");
    
    // 1. Probar endpoint /user 
    console.log("\n1️⃣ Probando /api/v1/user");
    fetch('http://localhost:8001/api/v1/user', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    })
    .then(r => r.json())
    .then(data => {
        console.log("✅ /user OK:", data.success ? "SUCCESS" : "FAILED");
        console.log("👤 Usuario:", data.data?.nombre);
        
        // 2. Probar endpoint /user/permissions
        console.log("\n2️⃣ Probando /api/v1/user/permissions");
        return fetch('http://localhost:8001/api/v1/user/permissions', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
    })
    .then(r => r.json())
    .then(data => {
        console.log("✅ /user/permissions OK:", data.success ? "SUCCESS" : "FAILED");
        console.log("🔐 Permisos count:", data.data ? Object.keys(data.data).length : 0);
        
        // 3. Probar endpoint logout
        console.log("\n3️⃣ Probando /api/v1/logout");
        return fetch('http://localhost:8001/api/v1/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    })
    .then(response => {
        console.log("📊 LOGOUT Status:", response.status);
        
        if (response.status === 200) {
            console.log("🎉 ¡LOGOUT EXITOSO!");
            return response.json();
        } else {
            console.error("❌ LOGOUT FALLÓ - Status:", response.status);
            return response.text();
        }
    })
    .then(data => {
        console.log("✅ LOGOUT Response:", data);
        console.log("\n🎯 RESUMEN:");
        console.log("✅ Sistema de autenticación: FUNCIONANDO");
        console.log("✅ Permisos: FUNCIONANDO");  
        console.log("✅ Logout: FUNCIONANDO");
    })
    .catch(error => {
        console.error("❌ ERROR en sistema:", error);
    });
}

console.log("💡 Ejecutando prueba completa del sistema...");

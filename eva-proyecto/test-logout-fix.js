// SCRIPT PARA PROBAR ENDPOINT LOGOUT
console.log("=== PROBANDO ENDPOINT LOGOUT ===");

// Obtener token actual
const token = localStorage.getItem('eva_auth_token');
console.log("🔑 Token encontrado:", !!token);

if (!token) {
    console.error("❌ No hay token. Debes estar logueado primero.");
} else {
    console.log("✅ Token disponible, probando logout...");
    
    // Probar logout
    fetch('http://192.168.2.146:8001/api/v1/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("📊 LOGOUT Status:", response.status);
        console.log("📊 LOGOUT Status Text:", response.statusText);
        console.log("📊 LOGOUT Headers:", Object.fromEntries(response.headers.entries()));
        
        if (response.status === 200) {
            console.log("🎉 ¡LOGOUT EXITOSO! Status 200");
            return response.json();
        } else {
            console.error(`❌ LOGOUT FALLÓ - Status: ${response.status}`);
            return response.text().then(text => {
                console.error("❌ Error response:", text);
                throw new Error(`Logout failed with status ${response.status}`);
            });
        }
    })
    .then(data => {
        console.log("✅ LOGOUT Response Data:", data);
        if (data.success) {
            console.log("🎉 LOGOUT COMPLETAMENTE EXITOSO");
            console.log("📝 Mensaje:", data.message);
        }
    })
    .catch(error => {
        console.error("❌ ERROR en logout:", error);
    });
}

console.log("💡 Ejecutando prueba de logout...");

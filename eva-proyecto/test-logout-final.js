// PRUEBA FINAL DEL LOGOUT - CONFLICTO RESUELTO
console.log("=== LOGOUT FINAL TEST ===");

// Probar con localhost (servidor local en 0.0.0.0:8001)
fetch('http://localhost:8001/api/v1/logout', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('eva_auth_token'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log("📊 LOGOUT Status:", response.status);
    console.log("📊 Status Text:", response.statusText);
    
    if (response.status === 200) {
        console.log("🎉 ¡LOGOUT EXITOSO! - Status 200");
        return response.json();
    } else {
        console.error("❌ LOGOUT FALLÓ - Status:", response.status);
        return response.text().then(text => {
            console.error("❌ Error response:", text);
            throw new Error(`Status ${response.status}: ${text}`);
        });
    }
})
.then(data => {
    console.log("✅ LOGOUT Response:", data);
    if (data.success) {
        console.log("🎉 LOGOUT COMPLETAMENTE EXITOSO");
        console.log("📝 Mensaje:", data.message);
    }
})
.catch(error => {
    console.error("❌ LOGOUT ERROR:", error);
    console.error("💡 Verifica que el servidor esté corriendo en localhost:8001");
});

console.log("💡 Probando logout con servidor local...");

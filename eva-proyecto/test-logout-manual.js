
// PRUEBA MANUAL DE LOGOUT EN CONSOLA DEL NAVEGADOR

async function testLogout() {
    console.log("🧪 Testing logout...");
    
    const token = localStorage.getItem("eva_auth_token");
    if (!token) {
        console.error("❌ No hay token para probar logout");
        return;
    }
    
    try {
        const response = await fetch("http://192.168.2.146:8001/api/v1/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });
        
        console.log("📊 Status:", response.status);
        console.log("📊 Headers:", Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log("📋 Response raw:", text);
        
        try {
            const json = JSON.parse(text);
            console.log("✅ Response JSON:", json);
        } catch (e) {
            console.log("⚠️ Response no es JSON");
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// Ejecutar: testLogout()

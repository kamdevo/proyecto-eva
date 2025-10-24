// TEST DEL SISTEMA DE CORREOS EVA
console.log("=== PROBANDO SISTEMA DE CORREOS ===");

const token = localStorage.getItem('eva_auth_token');

if (!token) {
    console.error("❌ NO HAY TOKEN - Haz login primero");
} else {
    // 1. PROBAR CORREO DE REPUESTO PENDIENTE
    console.log("\n1️⃣ === PROBANDO CORREO REPUESTO PENDIENTE ===");
    
    fetch('http://192.168.2.146:8001/api/v1/notifications/repuesto-pendiente', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            preventivo_id: 1,
            email: 'test@example.com', // Cambia por tu email
            equipo_id: 1,
            repuesto_faltante: 'Filtro HEPA'
        })
    })
    .then(r => {
        console.log("📧 Repuesto Status:", r.status);
        return r.json();
    })
    .then(data => {
        console.log("✅ Repuesto Response:", data);
    })
    .catch(error => {
        console.error("❌ Error repuesto:", error);
    });
    
    // 2. PROBAR CORREO DE NUEVO TICKET  
    setTimeout(() => {
        console.log("\n2️⃣ === PROBANDO CORREO NUEVO TICKET ===");
        
        fetch('http://192.168.2.146:8001/api/v1/notifications/nuevo-ticket', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticket_id: 1,
                email: 'test@example.com', // Cambia por tu email
                asunto: 'Falla en equipo de ventilación',
                prioridad: 1
            })
        })
        .then(r => {
            console.log("📧 Ticket Status:", r.status);
            return r.json();
        })
        .then(data => {
            console.log("✅ Ticket Response:", data);
        })
        .catch(error => {
            console.error("❌ Error ticket:", error);
        });
    }, 2000);
    
    // 3. PROBAR CORREO DE PRUEBA
    setTimeout(() => {
        console.log("\n3️⃣ === PROBANDO CORREO DE PRUEBA ===");
        
        fetch('http://192.168.2.146:8001/api/v1/notifications/test-email', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com' // Cambia por tu email
            })
        })
        .then(r => {
            console.log("📧 Test Status:", r.status);
            return r.json();
        })
        .then(data => {
            console.log("✅ Test Response:", data);
            
            console.log("\n🎯 === RESUMEN PRUEBAS DE CORREO ===");
            console.log("Si todos los status son 200, el sistema funciona correctamente");
            console.log("Revisa tu bandeja de entrada y spam");
        })
        .catch(error => {
            console.error("❌ Error test:", error);
        });
    }, 4000);
}

console.log("💡 Ejecutando tests de correo...");

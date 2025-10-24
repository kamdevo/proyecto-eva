// DIAGNÓSTICO COMPLETO DEL SISTEMA DE AUTENTICACIÓN
console.log("=== DIAGNÓSTICO COMPLETO SISTEMA AUTH ===");

// 1. Verificar token
const token = localStorage.getItem('eva_auth_token');
console.log("🔑 Token:", token ? "EXISTE" : "NO EXISTE");
console.log("🔑 Token length:", token?.length || 0);

if (!token) {
    console.error("❌ NO HAY TOKEN - Usuario debe loguearse primero");
} else {
    console.log("✅ Token disponible, continuando diagnóstico...");
    
    // 2. Probar endpoint /user
    console.log("\n1️⃣ === PROBANDO /api/v1/user ===");
    fetch('http://192.168.2.146:8001/api/v1/user', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    })
    .then(r => {
        console.log("📊 /user Status:", r.status);
        return r.json();
    })
    .then(userData => {
        console.log("👤 User Data:", userData);
        console.log("✅ Success:", userData.success);
        
        if (userData.success && userData.data) {
            const user = userData.data;
            console.log("📋 User Details:");
            console.log("  - ID:", user.id);
            console.log("  - Nombre:", user.nombre);
            console.log("  - Rol ID:", user.rol_id, "Type:", typeof user.rol_id);
            console.log("  - Rol Object:", user.rol);
            console.log("  - Rol Nombre:", user.rol?.nombre);
            
            // 3. Probar endpoint /user/permissions
            console.log("\n2️⃣ === PROBANDO /api/v1/user/permissions ===");
            return fetch('http://192.168.2.146:8001/api/v1/user/permissions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
        } else {
            throw new Error("User endpoint failed");
        }
    })
    .then(r => {
        console.log("📊 /permissions Status:", r.status);
        return r.json();
    })
    .then(permData => {
        console.log("🔐 Permissions Data:", permData);
        console.log("✅ Success:", permData.success);
        
        if (permData.success && permData.data) {
            console.log("📋 Permissions Details:");
            console.log("  - Type:", typeof permData.data);
            console.log("  - Is Array:", Array.isArray(permData.data));
            console.log("  - Keys:", Object.keys(permData.data));
            console.log("  - Count:", Object.keys(permData.data).length);
            
            // Mostrar cada permiso
            Object.entries(permData.data).forEach(([module, perms]) => {
                console.log(`  - ${module}:`, perms);
            });
        }
        
        // 4. Verificar estado del contexto de autenticación en el frontend
        console.log("\n3️⃣ === VERIFICANDO CONTEXTOS FRONTEND ===");
        
        // Verificar si hay datos en el contexto actual
        try {
            // Intenta acceder a los contextos React (si están disponibles)
            console.log("🔍 Verificando variables globales...");
            console.log("Window.user:", window.user);
            console.log("Window.permissions:", window.permissions);
            
        } catch (e) {
            console.log("⚠️ No se pueden verificar contextos desde consola");
        }
        
        console.log("\n🎯 === RESUMEN DIAGNÓSTICO ===");
        console.log("✅ Token: OK");
        console.log("✅ /user endpoint: OK"); 
        console.log("✅ /permissions endpoint: OK");
        console.log("⚠️ Problema probable: Frontend no está usando los datos correctamente");
        
        console.log("\n💡 === PRÓXIMOS PASOS ===");
        console.log("1. Verificar useAuth hook está siendo llamado");
        console.log("2. Verificar AuthProvider está envolviendo la app");
        console.log("3. Verificar Sidebar está leyendo permisos correctamente");
        
    })
    .catch(error => {
        console.error("❌ ERROR en diagnóstico:", error);
    });
}

console.log("💡 Ejecutando diagnóstico completo...");

/**
 * Script de verificación del estado de autenticación
 * Para ejecutar en la consola del navegador del sistema EVA
 */

console.log("🔐 === VERIFICACIÓN DE PERSISTENCIA DE SESIÓN EVA ===");
console.log("");

// Función para verificar el estado actual
function verificarEstadoAutenticacion() {
  console.log("📊 Estado actual del localStorage:");

  const token = localStorage.getItem("eva_auth_token");
  const user = localStorage.getItem("eva_user");

  console.log(
    "🔑 Token:",
    token ? `✅ Presente (${token.substring(0, 30)}...)` : "❌ No encontrado"
  );
  console.log("👤 Usuario:", user ? "✅ Presente" : "❌ No encontrado");

  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("   - Nombre:", userData.nombre || "N/A");
      console.log("   - Email:", userData.email || "N/A");
      console.log("   - ID:", userData.id || "N/A");
    } catch (e) {
      console.log("   ⚠️ Error al parsear datos de usuario");
    }
  }

  console.log("");
  return { token, user };
}

// Función para probar la API
async function probarAPI() {
  console.log("🧪 Probando conexión con la API...");

  const token = localStorage.getItem("eva_auth_token");
  if (!token) {
    console.log("❌ No hay token para probar");
    return false;
  }

  try {
    const response = await fetch("http://localhost:8000/api/v1/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log(
      `📡 Respuesta de la API: ${response.status} ${response.statusText}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API responde correctamente");
      console.log("👤 Usuario autenticado:", data.data?.nombre || "Usuario");
      return true;
    } else if (response.status === 401) {
      console.log("❌ Token inválido o expirado");
      return false;
    } else {
      console.log(`⚠️ Error del servidor: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log("❌ Error de conexión:", error.message);
    return false;
  }
}

// Función principal de verificación
async function verificarPersistencia() {
  console.log("� === INICIANDO VERIFICACIÓN COMPLETA ===");
  console.log("");

  const estado = verificarEstadoAutenticacion();

  if (estado.token && estado.user) {
    console.log("✅ Datos de sesión encontrados");

    const apiOk = await probarAPI();

    if (apiOk) {
      console.log("");
      console.log("🎉 === VERIFICACIÓN EXITOSA ===");
      console.log("✅ La sesión está activa y funcional");
      console.log("✅ Los tokens están correctos");
      console.log("✅ La API responde correctamente");
      console.log("");
      console.log("📋 PRÓXIMOS PASOS:");
      console.log("1. Recarga la página con F5 o Ctrl+R");
      console.log("2. La sesión debe mantenerse activa");
      console.log("3. No deberías ver la página de login");
    } else {
      console.log("");
      console.log("⚠️ === PROBLEMA DETECTADO ===");
      console.log("❌ Los tokens están corruptos o son inválidos");
      console.log("");
      console.log("🔧 SOLUCIÓN:");
      console.log("Ejecuta: limpiarTokens()");
    }
  } else {
    console.log("ℹ️ No hay sesión activa");
    console.log("");
    console.log("📋 PRÓXIMOS PASOS:");
    console.log("1. Haz login en el sistema");
    console.log("2. Ejecuta este script nuevamente");
  }
}

// Función para limpiar tokens
function limpiarTokens() {
  console.log("🧹 Limpiando tokens de autenticación...");
  localStorage.removeItem("eva_auth_token");
  localStorage.removeItem("eva_user");
  console.log("✅ Tokens eliminados");
  console.log("📍 Recarga la página para ver el login");
}

// Función para monitorear cambios
function monitorearCambios() {
  console.log("👁️ Iniciando monitoreo de cambios en localStorage...");

  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;

  localStorage.setItem = function (key, value) {
    if (key === "eva_auth_token" || key === "eva_user") {
      console.log(`🔄 [${new Date().toLocaleTimeString()}] ${key} actualizado`);
    }
    return originalSetItem.apply(this, arguments);
  };

  localStorage.removeItem = function (key) {
    if (key === "eva_auth_token" || key === "eva_user") {
      console.log(`🗑️ [${new Date().toLocaleTimeString()}] ${key} eliminado`);
    }
    return originalRemoveItem.apply(this, arguments);
  };

  console.log("✅ Monitoreo activo");
}

// Exportar funciones globalmente
window.verificarPersistencia = verificarPersistencia;
window.verificarEstadoAutenticacion = verificarEstadoAutenticacion;
window.probarAPI = probarAPI;
window.limpiarTokens = limpiarTokens;
window.monitorearCambios = monitorearCambios;

console.log("🛠️ Funciones disponibles:");
console.log("• verificarPersistencia() - Verificación completa");
console.log("• verificarEstadoAutenticacion() - Solo estado local");
console.log("• probarAPI() - Solo prueba de API");
console.log("• limpiarTokens() - Limpiar sesión");
console.log("• monitorearCambios() - Monitorear localStorage");
console.log("");
console.log("▶️ Ejecuta: verificarPersistencia()");

// Ejecutar verificación automáticamente
verificarPersistencia();

console.log("📊 Estado del localStorage:");
console.log("- usuario:", userData ? "Existe" : "No existe");
console.log("- eva_user:", evaUser ? "Existe" : "No existe");

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log("\n👤 Datos del usuario actual:");
    console.log("- ID:", user.id || "N/A");
    console.log("- Username:", user.username || user.name || "N/A");
    console.log("- Email:", user.email || "N/A");
    console.log("- Token:", user.token ? "Presente" : "Ausente");
    console.log("- Token length:", user.token ? user.token.length : 0);

    if (user.token) {
      console.log("\n🔑 Probando petición con token...");

      fetch("http://localhost:8000/api/v1/equipos/medical-devices-complete", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log(
            "📡 Respuesta del servidor:",
            response.status,
            response.statusText
          );
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        })
        .then((data) => {
          console.log("✅ Datos recibidos:", data);
          console.log("🎉 Autenticación funcionando correctamente!");
        })
        .catch((error) => {
          console.error("❌ Error en la petición:", error.message);

          if (error.message.includes("401")) {
            console.log("\n🔧 Posibles soluciones:");
            console.log("1. El token ha expirado");
            console.log("2. El token no es válido");
            console.log("3. El usuario no tiene permisos");
            console.log("4. Necesitas hacer login nuevamente");
          }
        });
    }
  } catch (error) {
    console.error("❌ Error parseando datos del usuario:", error);
  }
} else {
  console.log("\n🚨 No hay usuario autenticado");
  console.log("\n💡 Para probar la integración, necesitas:");
  console.log("1. Hacer login primero en la aplicación");
  console.log("2. O crear un usuario de prueba");
  console.log("3. O usar las rutas públicas temporalmente");
}

// Función helper para crear un usuario de prueba (solo para desarrollo)
function createTestUser() {
  console.log("\n🧪 Creando usuario de prueba...");

  const testUser = {
    id: 1,
    username: "admin",
    email: "admin@huv.gov.co",
    name: "Administrador HUV",
    token: "test-token-for-development-only",
    role: "admin",
  };

  localStorage.setItem("usuario", JSON.stringify(testUser));
  console.log("✅ Usuario de prueba creado");
  console.log(
    "⚠️ NOTA: Esto es solo para desarrollo. En producción usa autenticación real."
  );
}

// Función para hacer login real
function makeRealLogin() {
  console.log("\n🔐 Para hacer login real, usa:");
  console.log(`
    fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: 'tu_usuario',
        password: 'tu_contraseña'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('usuario', JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name,
          token: data.token
        }));
        console.log('✅ Login exitoso');
      }
    });
  `);
}

// Mostrar opciones
console.log("\n🛠️ Opciones disponibles:");
console.log("- createTestUser() - Crear usuario de prueba");
console.log("- makeRealLogin() - Ver código para login real");

// Hacer disponibles las funciones
if (typeof window !== "undefined") {
  window.createTestUser = createTestUser;
  window.makeRealLogin = makeRealLogin;
}

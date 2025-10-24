// SCRIPT PARA MONITOREAR PERMISOS EN TIEMPO REAL
console.log("=== MONITOR DE PERMISOS EN TIEMPO REAL ===");

// Función para verificar el estado actual
function checkPermissionStatus() {
  const user = JSON.parse(localStorage.getItem('eva_user') || '{}');
  const token = localStorage.getItem('eva_auth_token');
  
  console.log("📊 ESTADO ACTUAL:");
  console.log("  👤 Usuario:", user.nombre || 'No encontrado');
  console.log("  🎭 Rol ID:", user.rol_id, typeof user.rol_id);
  console.log("  🔑 Token existe:", !!token);
  console.log("  ⏰ Timestamp:", new Date().toLocaleTimeString());
  
  return { user, token };
}

// Verificación inicial
checkPermissionStatus();

// Monitorear cada 3 segundos
const monitorInterval = setInterval(() => {
  console.log("\n--- Verificación automática ---");
  checkPermissionStatus();
  
  // También revisar si React está cargado y tiene contexto
  if (window.React) {
    console.log("  ⚛️ React está disponible");
    // Intentar acceder al contexto si es posible
  } else {
    console.log("  ❌ React no disponible aún");
  }
}, 3000);

// Función para detener el monitoreo
window.stopPermissionMonitor = () => {
  clearInterval(monitorInterval);
  console.log("🛑 Monitor de permisos detenido");
};

console.log("🚀 Monitor iniciado. Ejecuta 'stopPermissionMonitor()' para detener.");
console.log("👀 Observa los logs cada 3 segundos...");

// Test inmediato de carga de permisos
console.log("\n🧪 PROBANDO CARGA MANUAL DE PERMISOS:");
fetch('http://192.168.2.146:8001/api/v1/user/permissions', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('eva_auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => {
  console.log('✅ Permisos API (manual):', d);
  if (d.success && d.data) {
    console.log('📊 Total permisos disponibles:', d.data.length);
    console.log('🏷️ Módulos encontrados:', d.data.map(p => p.modulo_name).join(', '));
  }
})
.catch(e => {
  console.error('❌ Error cargando permisos (manual):', e);
});

// Función para forzar recarga de permisos
window.forcePermissionReload = () => {
  console.log("🔄 Forzando recarga de permisos...");
  
  // Limpiar y recargar
  localStorage.removeItem('eva_permissions'); // Si existe
  
  // Recargar página
  setTimeout(() => {
    console.log("🔄 Recargando página...");
    location.reload();
  }, 1000);
};

console.log("💡 FUNCIONES DISPONIBLES:");
console.log("  - stopPermissionMonitor() - Detener monitoreo");
console.log("  - forcePermissionReload() - Forzar recarga de permisos");
console.log("  - checkPermissionStatus() - Verificar estado actual");

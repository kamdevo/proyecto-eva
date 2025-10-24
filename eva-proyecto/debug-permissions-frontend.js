// SCRIPT DE DEBUG PARA PERMISOS - EJECUTAR EN CONSOLE
console.log("=== DEBUG DE PERMISOS EN FRONTEND ===");

// 1. Verificar usuario actual
const user = JSON.parse(localStorage.getItem('eva_user') || '{}');
console.log("👤 Usuario desde localStorage:", user);
console.log("🎭 Rol ID:", user.rol_id, "Tipo:", typeof user.rol_id);
console.log("🔢 Rol ID parseado:", parseInt(user.rol_id));

// 2. Verificar si es admin
const isAdminCheck = parseInt(user.rol_id) === 1 || parseInt(user.rol_id) === 2;
console.log("🔍 ¿Es Admin?", isAdminCheck);

// 3. Verificar permisos en memoria (si useAuth está disponible)
if (window.React && window.ReactDOM) {
  console.log("⚠️ Para verificar permisos en vivo, abre la pestaña Components en DevTools");
  console.log("⚠️ Busca el componente AuthProvider y verifica sus hooks");
}

// 4. Simular llamada de verificación de permisos
const testModules = ['equipos', 'usuarios', 'tickets-propios', 'correctivos'];
testModules.forEach(module => {
  const hasBasicAccess = ['equipos', 'tickets-propios', 'correctivos'].includes(module);
  console.log(`📋 Módulo "${module}":`, hasBasicAccess ? 'Debería tener acceso' : 'Sin acceso básico');
});

// 5. Verificar datos críticos
console.log("🔑 Token existe:", !!localStorage.getItem('eva_auth_token'));
console.log("👤 Usuario existe:", !!user.id);
console.log("🎯 Nombre usuario:", user.nombre);
console.log("🏢 Empresa ID:", user.id_empresa);

// 6. Test manual de permisos API
console.log("🧪 Probando carga manual de permisos...");
fetch('http://192.168.2.146:8001/api/v1/user/permissions', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('eva_auth_token'),
    'Accept': 'application/json'
  }
})
.then(r => r.json())
.then(d => {
  console.log('✅ Permisos API Response:', d);
  if (d.success && d.data) {
    console.log('📊 Total permisos cargados:', d.data.length);
    d.data.forEach((perm, index) => {
      console.log(`  ${index + 1}. ${perm.modulo_name}: ${perm.leer ? 'R' : ''}${perm.crear ? 'C' : ''}${perm.editar ? 'U' : ''}${perm.eliminar ? 'D' : ''}`);
    });
  }
})
.catch(e => {
  console.error('❌ Error cargando permisos:', e);
});

console.log("=== FIN DEBUG ===");
console.log("💡 ACCIONES SUGERIDAS:");
console.log("1. Verifica que el rol_id se compare correctamente (tipo number)");
console.log("2. Verifica que los permisos se carguen en el estado de React");
console.log("3. Verifica que hasPermission() use la lógica correcta");
console.log("4. Verifica que el sidebar use los métodos correctos de useAuth");

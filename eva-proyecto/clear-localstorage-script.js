// Script para limpiar localStorage manualmente
// Ejecutar en la consola del navegador

console.log("🔧 Limpiando datos de autenticación...");

// Limpiar tokens específicos
localStorage.removeItem("eva_auth_token");
localStorage.removeItem("eva_user");

console.log("✅ Datos de autenticación eliminados");
console.log("📍 Ahora recarga la página para ver el login");

// Verificar que se eliminaron
const token = localStorage.getItem("eva_auth_token");
const user = localStorage.getItem("eva_user");

if (!token && !user) {
  console.log("✅ Confirmado: localStorage limpio");
} else {
  console.log("❌ Aún hay datos residuales");
}

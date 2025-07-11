/**
 * Script para verificar el estado de autenticación en el frontend
 * y crear un usuario de prueba si es necesario
 */

console.log('🔍 Verificando estado de autenticación...\n');

// Verificar si hay un usuario en localStorage
const userData = localStorage.getItem('usuario');
const evaUser = localStorage.getItem('eva_user');

console.log('📊 Estado del localStorage:');
console.log('- usuario:', userData ? 'Existe' : 'No existe');
console.log('- eva_user:', evaUser ? 'Existe' : 'No existe');

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('\n👤 Datos del usuario actual:');
    console.log('- ID:', user.id || 'N/A');
    console.log('- Username:', user.username || user.name || 'N/A');
    console.log('- Email:', user.email || 'N/A');
    console.log('- Token:', user.token ? 'Presente' : 'Ausente');
    console.log('- Token length:', user.token ? user.token.length : 0);
    
    if (user.token) {
      console.log('\n🔑 Probando petición con token...');
      
      fetch('http://localhost:8000/api/v1/equipos/medical-devices-complete', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('📡 Respuesta del servidor:', response.status, response.statusText);
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .then(data => {
        console.log('✅ Datos recibidos:', data);
        console.log('🎉 Autenticación funcionando correctamente!');
      })
      .catch(error => {
        console.error('❌ Error en la petición:', error.message);
        
        if (error.message.includes('401')) {
          console.log('\n🔧 Posibles soluciones:');
          console.log('1. El token ha expirado');
          console.log('2. El token no es válido');
          console.log('3. El usuario no tiene permisos');
          console.log('4. Necesitas hacer login nuevamente');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error parseando datos del usuario:', error);
  }
} else {
  console.log('\n🚨 No hay usuario autenticado');
  console.log('\n💡 Para probar la integración, necesitas:');
  console.log('1. Hacer login primero en la aplicación');
  console.log('2. O crear un usuario de prueba');
  console.log('3. O usar las rutas públicas temporalmente');
}

// Función helper para crear un usuario de prueba (solo para desarrollo)
function createTestUser() {
  console.log('\n🧪 Creando usuario de prueba...');
  
  const testUser = {
    id: 1,
    username: 'admin',
    email: 'admin@huv.gov.co',
    name: 'Administrador HUV',
    token: 'test-token-for-development-only',
    role: 'admin'
  };
  
  localStorage.setItem('usuario', JSON.stringify(testUser));
  console.log('✅ Usuario de prueba creado');
  console.log('⚠️ NOTA: Esto es solo para desarrollo. En producción usa autenticación real.');
}

// Función para hacer login real
function makeRealLogin() {
  console.log('\n🔐 Para hacer login real, usa:');
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
console.log('\n🛠️ Opciones disponibles:');
console.log('- createTestUser() - Crear usuario de prueba');
console.log('- makeRealLogin() - Ver código para login real');

// Hacer disponibles las funciones
if (typeof window !== 'undefined') {
  window.createTestUser = createTestUser;
  window.makeRealLogin = makeRealLogin;
}

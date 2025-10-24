<?php
echo "=== PRUEBA SISTEMA DE ACTIVACIÓN Y PERMISOS AUTOMÁTICOS ===\n\n";

// Configuración de BD
$host = 'localhost';
$port = '3307';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conexión a BD exitosa\n\n";
    
    // 1. Crear usuario de prueba (DESACTIVADO por defecto)
    echo "🆕 1. CREANDO USUARIO DE PRUEBA:\n";
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (
            nombre, apellido, username, email, password, 
            rol_id, estado, telefono, active
        ) VALUES (
            'Usuario', 'Prueba', 'testuser2024', 'test2024@ejemplo.com', 
            ?, 4, 0, '123456789', 'false'
        )
    ");
    
    // Password hash para 'password123'
    $passwordHash = password_hash('password123', PASSWORD_DEFAULT);
    $stmt->execute([$passwordHash]);
    $usuarioId = $pdo->lastInsertId();
    
    echo "✅ Usuario creado con ID: $usuarioId\n";
    echo "- Username: testuser2024\n";
    echo "- Rol: 4 (Usuario Básico)\n";
    echo "- Estado: 0 (DESACTIVADO por defecto)\n\n";
    
    // 2. Verificar que no tiene permisos inicialmente
    echo "🔍 2. VERIFICANDO PERMISOS INICIALES (debe estar vacío):\n";
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_permisos 
        FROM acciones 
        WHERE usuario_id = ?
    ");
    $stmt->execute([$usuarioId]);
    $permisosIniciales = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Permisos asignados: {$permisosIniciales['total_permisos']}\n";
    if ($permisosIniciales['total_permisos'] == 0) {
        echo "✅ CORRECTO: Usuario nuevo no tiene permisos\n\n";
    } else {
        echo "❌ ERROR: Usuario nuevo tiene permisos cuando no debería\n\n";
    }
    
    // 3. Simular activación del usuario
    echo "🔓 3. SIMULANDO ACTIVACIÓN DEL USUARIO:\n";
    $stmt = $pdo->prepare("UPDATE usuarios SET estado = 1 WHERE id = ?");
    $stmt->execute([$usuarioId]);
    echo "✅ Usuario activado en BD\n";
    
    // Nota: En un caso real, esto se haría a través del endpoint toggleStatus
    echo "📝 NOTA: Para activación real usar: POST /api/v1/usuarios/{$usuarioId}/toggle-status\n\n";
    
    // 4. Verificar estructura de permisos esperada para rol 4
    echo "📋 4. PERMISOS ESPERADOS PARA ROL 4 (Usuario Básico):\n";
    echo "- equipos: leer=1, insertar=0, editar=0, eliminar=0\n";
    echo "- tickets propios: leer=1, insertar=1, editar=1, eliminar=0\n";
    echo "- guias rapidas: leer=1, insertar=0, editar=0, eliminar=0\n";
    echo "- contactos: leer=1, insertar=0, editar=0, eliminar=0\n";
    echo "- servicios: leer=1, insertar=0, editar=0, eliminar=0\n";
    echo "- areas: leer=1, insertar=0, editar=0, eliminar=0\n";
    echo "- otros módulos: todos en 0 (sin acceso)\n\n";
    
    // 5. Mostrar módulos disponibles
    echo "🗂️ 5. MÓDULOS DISPONIBLES EN EL SISTEMA:\n";
    $stmt = $pdo->prepare("SELECT id, name FROM modulos ORDER BY name");
    $stmt->execute();
    $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($modulos as $modulo) {
        echo "- ID {$modulo['id']}: {$modulo['name']}\n";
    }
    
    echo "\n🎯 RESULTADO ESPERADO AL ACTIVAR:\n";
    echo "1. Usuario pasa de estado 0 a 1\n";
    echo "2. Se asignan automáticamente permisos según su rol (4)\n";
    echo "3. Frontend debe mostrar botones limitados según permisos\n";
    echo "4. Solo acceso a: Ver equipos + Crear/Ver tickets propios\n\n";
    
    // Limpiar usuario de prueba
    echo "🧹 LIMPIANDO USUARIO DE PRUEBA:\n";
    $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
    $stmt->execute([$usuarioId]);
    echo "✅ Usuario de prueba eliminado\n\n";
    
    echo "📝 PASOS PARA PROBAR EN FRONTEND:\n";
    echo "1. Crear usuario desde admin (debe crearse DESACTIVADO)\n";
    echo "2. Intentar login con ese usuario (debe fallar)\n";
    echo "3. Activar usuario desde admin\n";
    echo "4. Login con usuario activado (debe funcionar)\n";
    echo "5. Verificar permisos limitados en botones CRUD\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

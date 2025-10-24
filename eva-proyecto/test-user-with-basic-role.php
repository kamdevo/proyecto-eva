<?php
echo "=== CREAR USUARIO BÁSICO PARA PRUEBAS ===\n\n";

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
    
    // Buscar un usuario con rol básico (rol 4) para testing
    echo "🔍 BUSCANDO USUARIOS CON ROL BÁSICO (4):\n";
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nombre,
            u.apellido,
            u.username,
            u.email,
            u.rol_id,
            r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.rol_id = 4 AND u.estado = 1
        LIMIT 5
    ");
    $stmt->execute();
    $usuariosBasicos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($usuariosBasicos) > 0) {
        echo "✅ Usuarios básicos encontrados:\n";
        foreach ($usuariosBasicos as $usuario) {
            echo "- ID: {$usuario['id']} | Username: {$usuario['username']} | Nombre: {$usuario['nombre']} {$usuario['apellido']}\n";
        }
        
        $usuarioTest = $usuariosBasicos[0];
        echo "\n🎯 USUARIO PARA TESTING:\n";
        echo "ID: {$usuarioTest['id']}\n";
        echo "Username: {$usuarioTest['username']}\n";
        echo "Rol: {$usuarioTest['rol_id']} ({$usuarioTest['rol_nombre']})\n";
        
    } else {
        echo "❌ No se encontraron usuarios con rol básico\n";
        echo "📝 Para probar el sistema de permisos necesitas:\n";
        echo "1. Crear un usuario con rol 4 (Usuario Básico)\n";
        echo "2. Loguearte con ese usuario\n";
        echo "3. Verificar que los botones estén limitados\n\n";
        
        // Mostrar cómo crear uno
        echo "💡 SQL para crear usuario de prueba:\n";
        echo "INSERT INTO usuarios (nombre, apellido, username, email, password, rol_id, estado, active) \n";
        echo "VALUES ('Usuario', 'Basico', 'usuariobasico', 'basico@test.com', '\$2y\$10\$hash', 4, 1, 'true');\n\n";
    }
    
    echo "\n📋 DISTRIBUCIÓN DE USUARIOS POR ROL:\n";
    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.nombre,
            COUNT(u.id) as total_usuarios
        FROM roles r
        LEFT JOIN usuarios u ON r.id = u.rol_id AND u.estado = 1
        GROUP BY r.id, r.nombre
        ORDER BY r.id
    ");
    $stmt->execute();
    $distribucion = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($distribucion as $rol) {
        echo "- Rol {$rol['id']} ({$rol['nombre']}): {$rol['total_usuarios']} usuarios\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

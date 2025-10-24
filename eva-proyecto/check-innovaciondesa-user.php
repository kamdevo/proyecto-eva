<?php
echo "=== VERIFICAR DATOS DEL USUARIO INNOVACIONDESA ===\n\n";

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
    
    // Buscar usuario innovaciondesa
    echo "🔍 BUSCANDO USUARIO 'innovaciondesa':\n";
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nombre,
            u.apellido,
            u.email,
            u.username,
            u.rol_id,
            u.estado,
            r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.username LIKE '%innovacion%' OR u.email LIKE '%innovacion%' OR u.nombre LIKE '%innovacion%'
    ");
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($usuarios) > 0) {
        echo "✅ Usuario(s) encontrado(s):\n";
        foreach ($usuarios as $usuario) {
            echo "- ID: {$usuario['id']}\n";
            echo "- Nombre: {$usuario['nombre']} {$usuario['apellido']}\n";
            echo "- Email: {$usuario['email']}\n";
            echo "- Username: {$usuario['username']}\n";
            echo "- Rol ID: {$usuario['rol_id']}\n";
            echo "- Rol Nombre: {$usuario['rol_nombre']}\n";
            echo "- Estado: {$usuario['estado']}\n";
            echo "---\n";
        }
    } else {
        echo "❌ No se encontró usuario 'innovaciondesa'\n";
        
        // Mostrar todos los usuarios para referencia
        echo "\n📋 USUARIOS DISPONIBLES:\n";
        $stmt = $pdo->prepare("
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.username,
                u.rol_id,
                r.nombre as rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            ORDER BY u.id
            LIMIT 10
        ");
        $stmt->execute();
        $todosUsuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($todosUsuarios as $usuario) {
            echo "- ID {$usuario['id']}: {$usuario['username']} ({$usuario['nombre']}) - Rol {$usuario['rol_id']} ({$usuario['rol_nombre']})\n";
        }
    }
    
    echo "\n🎯 INFORMACIÓN DE ROLES:\n";
    $stmt = $pdo->prepare("SELECT * FROM roles ORDER BY id");
    $stmt->execute();
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($roles as $rol) {
        echo "- Rol {$rol['id']}: {$rol['nombre']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

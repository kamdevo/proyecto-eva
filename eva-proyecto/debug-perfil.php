<?php
echo "=== DEBUG PERFIL - VERIFICAR TABLAS Y DATOS ===\n\n";

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
    
    // 1. Verificar usuario ID 1
    echo "🔍 1. VERIFICANDO USUARIO ID 1:\n";
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = 1 LIMIT 1");
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario) {
        echo "✅ Usuario encontrado:\n";
        echo "- ID: {$usuario['id']}\n";
        echo "- Nombre: {$usuario['nombre']}\n";
        echo "- Apellido: " . ($usuario['apellido'] ?: 'N/A') . "\n";
        echo "- Email: {$usuario['email']}\n";
        echo "- Username: {$usuario['username']}\n";
        echo "- Rol ID: {$usuario['rol_id']}\n";
        echo "- Servicio ID: " . ($usuario['servicio_id'] ?: 'N/A') . "\n";
        echo "- Estado: {$usuario['estado']}\n";
    } else {
        echo "❌ Usuario ID 1 no encontrado\n";
        
        // Buscar cualquier usuario
        $stmt = $pdo->prepare("SELECT * FROM usuarios LIMIT 5");
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Usuarios disponibles:\n";
        foreach($usuarios as $u) {
            echo "- ID {$u['id']}: {$u['nombre']} ({$u['email']})\n";
        }
    }
    
    echo "\n🔍 2. VERIFICANDO TABLA ROLES:\n";
    $stmt = $pdo->prepare("SHOW COLUMNS FROM roles");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columnas de 'roles':\n";
    foreach($columns as $col) {
        echo "- {$col['Field']} ({$col['Type']})\n";
    }
    
    // Ver algunos roles
    $stmt = $pdo->prepare("SELECT * FROM roles LIMIT 5");
    $stmt->execute();
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Roles disponibles:\n";
    foreach($roles as $rol) {
        echo "- ID {$rol['id']}: {$rol['nombre']}\n";
    }
    
    echo "\n🔍 3. VERIFICANDO TABLA SERVICIOS:\n";
    $stmt = $pdo->prepare("SHOW COLUMNS FROM servicios");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columnas de 'servicios':\n";
    foreach($columns as $col) {
        echo "- {$col['Field']} ({$col['Type']})\n";
    }
    
    // Ver algunos servicios
    $stmt = $pdo->prepare("SELECT * FROM servicios LIMIT 5");
    $stmt->execute();
    $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Servicios disponibles:\n";
    foreach($servicios as $servicio) {
        echo "- ID {$servicio['id']}: {$servicio['name']}\n";
    }
    
    echo "\n🔍 4. PROBANDO CONSULTA COMPLETA:\n";
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nombre,
            u.apellido,
            u.telefono,
            u.email,
            u.username,
            u.estado,
            u.active,
            r.nombre as rol_nombre,
            r.id as rol_id,
            s.name as centro_nombre,
            s.id as servicio_id
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN servicios s ON u.servicio_id = s.id
        WHERE u.id = 1
    ");
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($resultado) {
        echo "✅ Consulta exitosa:\n";
        foreach($resultado as $key => $value) {
            echo "- $key: " . ($value ?: 'NULL') . "\n";
        }
    } else {
        echo "❌ Consulta falló o no devolvió resultados\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

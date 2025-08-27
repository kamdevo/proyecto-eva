<?php
/**
 * Script para configurar permisos de usuario normal
 * Configura permisos básicos según la documentación de roles
 */

echo "🔧 CONFIGURACIÓN DE PERMISOS PARA USUARIO NORMAL\n";
echo str_repeat("=", 60) . "\n\n";

// Configuración de la base de datos
$host = '127.0.0.1';
$port = '3306';
$dbname = 'eva_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a base de datos exitosa\n\n";
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    exit(1);
}

// 1. Verificar el usuario normal que creamos
echo "🔍 VERIFICANDO USUARIO NORMAL...\n";
$stmt = $pdo->prepare("SELECT id, nombre, apellido, username, rol_id, estado FROM usuarios WHERE username = ?");
$stmt->execute(['usuario_normal']);
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);

if ($usuario) {
    echo "✅ Usuario encontrado:\n";
    echo "   - ID: {$usuario['id']}\n";
    echo "   - Nombre: {$usuario['nombre']} {$usuario['apellido']}\n";
    echo "   - Username: {$usuario['username']}\n";
    echo "   - Rol ID: {$usuario['rol_id']}\n";
    echo "   - Estado: {$usuario['estado']}\n\n";
} else {
    echo "❌ Usuario 'usuario_normal' no encontrado\n";
    exit(1);
}

// 2. Verificar permisos actuales
echo "🔍 VERIFICANDO PERMISOS ACTUALES...\n";
$stmt = $pdo->prepare("
    SELECT a.*, m.name as modulo_nombre 
    FROM acciones a 
    JOIN modulos m ON a.modulo_id = m.id 
    WHERE a.usuario_id = ?
");
$stmt->execute([$usuario['id']]);
$permisos_actuales = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($permisos_actuales)) {
    echo "⚠️ El usuario no tiene permisos configurados\n\n";
} else {
    echo "📋 Permisos actuales:\n";
    foreach ($permisos_actuales as $permiso) {
        echo "   - {$permiso['modulo_nombre']}: L:{$permiso['leer']} I:{$permiso['insertar']} E:{$permiso['editar']} D:{$permiso['eliminar']}\n";
    }
    echo "\n";
}

// 3. Obtener módulos disponibles
echo "🔍 OBTENIENDO MÓDULOS DISPONIBLES...\n";
$stmt = $pdo->query("SELECT id, name, descripcion FROM modulos WHERE estado = 1 ORDER BY name");
$modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "📋 Módulos disponibles:\n";
foreach ($modulos as $modulo) {
    echo "   - ID {$modulo['id']}: {$modulo['name']}\n";
}
echo "\n";

// 4. Configurar permisos básicos según la documentación
echo "🔧 CONFIGURANDO PERMISOS BÁSICOS...\n";

// Según la documentación, Role ID 4 (Basic User) debería tener:
// - Equipment Management: Read Only
// - Maintenance: Read Only  
// - Administrative: No Access
// - Configuration: No Access

$permisos_basicos = [
    // Equipment Management Modules (Read Only)
    'equipos' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
    'equipos industriales' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
    'repuestos' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
    
    // Maintenance Modules (Read Only)
    'tickets propios' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
    'mantenimiento' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
    'calibraciones' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
    
    // Basic reporting access
    'reportes' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
];

$permisos_configurados = 0;

foreach ($permisos_basicos as $modulo_nombre => $permisos) {
    // Buscar el módulo
    $modulo_encontrado = null;
    foreach ($modulos as $modulo) {
        if (stripos($modulo['name'], $modulo_nombre) !== false || 
            stripos($modulo_nombre, $modulo['name']) !== false) {
            $modulo_encontrado = $modulo;
            break;
        }
    }
    
    if ($modulo_encontrado) {
        // Verificar si ya existe el permiso
        $stmt = $pdo->prepare("SELECT id FROM acciones WHERE usuario_id = ? AND modulo_id = ?");
        $stmt->execute([$usuario['id'], $modulo_encontrado['id']]);
        $permiso_existente = $stmt->fetch();
        
        if ($permiso_existente) {
            // Actualizar permiso existente
            $stmt = $pdo->prepare("
                UPDATE acciones 
                SET leer = ?, insertar = ?, editar = ?, eliminar = ? 
                WHERE usuario_id = ? AND modulo_id = ?
            ");
            $stmt->execute([
                $permisos['leer'], $permisos['insertar'], 
                $permisos['editar'], $permisos['eliminar'],
                $usuario['id'], $modulo_encontrado['id']
            ]);
            echo "✅ Actualizado: {$modulo_encontrado['name']}\n";
        } else {
            // Crear nuevo permiso
            $stmt = $pdo->prepare("
                INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $usuario['id'], $modulo_encontrado['id'],
                $permisos['leer'], $permisos['insertar'], 
                $permisos['editar'], $permisos['eliminar']
            ]);
            echo "✅ Creado: {$modulo_encontrado['name']}\n";
        }
        $permisos_configurados++;
    } else {
        echo "⚠️ Módulo no encontrado: $modulo_nombre\n";
    }
}

echo "\n";

// 5. Verificar permisos configurados
echo "🔍 VERIFICANDO PERMISOS CONFIGURADOS...\n";
$stmt = $pdo->prepare("
    SELECT a.*, m.name as modulo_nombre 
    FROM acciones a 
    JOIN modulos m ON a.modulo_id = m.id 
    WHERE a.usuario_id = ?
    ORDER BY m.name
");
$stmt->execute([$usuario['id']]);
$permisos_finales = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!empty($permisos_finales)) {
    echo "📋 Permisos configurados:\n";
    foreach ($permisos_finales as $permiso) {
        $leer = $permiso['leer'] ? '✅' : '❌';
        $insertar = $permiso['insertar'] ? '✅' : '❌';
        $editar = $permiso['editar'] ? '✅' : '❌';
        $eliminar = $permiso['eliminar'] ? '✅' : '❌';
        
        echo "   - {$permiso['modulo_nombre']}:\n";
        echo "     Leer: $leer | Insertar: $insertar | Editar: $editar | Eliminar: $eliminar\n";
    }
} else {
    echo "⚠️ No se encontraron permisos configurados\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 RESUMEN:\n";
echo "✅ Usuario verificado: {$usuario['username']}\n";
echo "✅ Permisos configurados: $permisos_configurados módulos\n";
echo "✅ Tipo de acceso: Solo lectura (Read Only)\n";
echo "✅ Nivel de usuario: Básico (Role ID 4)\n";

echo "\n🎯 PRÓXIMOS PASOS:\n";
echo "1. Cerrar sesión en el frontend\n";
echo "2. Iniciar sesión nuevamente con usuario_normal\n";
echo "3. Verificar que ahora aparezcan módulos en la navegación\n";
echo "4. Confirmar que solo tiene acceso de lectura\n";

echo "\n" . str_repeat("=", 60) . "\n";
echo "Configuración completada - " . date('Y-m-d H:i:s') . "\n";
echo str_repeat("=", 60) . "\n";
?>

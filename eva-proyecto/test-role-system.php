<?php
/**
 * Script de prueba para el sistema de roles y permisos
 * Verifica que la implementación esté funcionando correctamente
 */

require_once 'eva-backend/vendor/autoload.php';

// Configuración de base de datos (ajustar según tu configuración)
$host = 'localhost';
$dbname = 'eva_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔗 Conexión a base de datos establecida\n\n";
    
    // Test 1: Verificar estructura de tablas
    echo "📋 TEST 1: Verificando estructura de tablas...\n";
    
    $tables = ['usuarios', 'roles', 'modulos', 'acciones', 'permisos'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Tabla '$table' existe\n";
        } else {
            echo "❌ Tabla '$table' NO existe\n";
        }
    }
    
    // Test 2: Verificar datos básicos
    echo "\n📊 TEST 2: Verificando datos básicos...\n";
    
    // Verificar roles
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM roles");
    $roleCount = $stmt->fetch()['count'];
    echo "📝 Roles en sistema: $roleCount\n";
    
    $stmt = $pdo->query("SELECT id, nombre FROM roles ORDER BY id");
    while ($role = $stmt->fetch()) {
        echo "   - ID {$role['id']}: {$role['nombre']}\n";
    }
    
    // Verificar módulos
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM modulos");
    $moduleCount = $stmt->fetch()['count'];
    echo "\n🔧 Módulos en sistema: $moduleCount\n";
    
    $stmt = $pdo->query("SELECT id, name FROM modulos ORDER BY id LIMIT 10");
    while ($module = $stmt->fetch()) {
        echo "   - ID {$module['id']}: {$module['name']}\n";
    }
    if ($moduleCount > 10) {
        echo "   ... y " . ($moduleCount - 10) . " más\n";
    }
    
    // Test 3: Verificar usuarios con permisos
    echo "\n👥 TEST 3: Verificando usuarios con permisos...\n";
    
    $stmt = $pdo->query("
        SELECT 
            u.id, 
            u.nombre, 
            u.username, 
            r.nombre as rol,
            COUNT(a.id) as permisos_count
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN acciones a ON u.id = a.usuario_id
        WHERE u.estado = 1
        GROUP BY u.id, u.nombre, u.username, r.nombre
        ORDER BY u.id
        LIMIT 5
    ");
    
    while ($user = $stmt->fetch()) {
        echo "👤 Usuario: {$user['nombre']} ({$user['username']})\n";
        echo "   Rol: {$user['rol']}\n";
        echo "   Permisos: {$user['permisos_count']}\n\n";
    }
    
    // Test 4: Verificar permisos específicos
    echo "🔐 TEST 4: Verificando permisos específicos...\n";
    
    $stmt = $pdo->query("
        SELECT 
            u.username,
            m.name as modulo,
            a.leer,
            a.insertar,
            a.editar,
            a.eliminar
        FROM acciones a
        JOIN usuarios u ON a.usuario_id = u.id
        JOIN modulos m ON a.modulo_id = m.id
        WHERE u.estado = 1
        ORDER BY u.username, m.name
        LIMIT 10
    ");
    
    while ($perm = $stmt->fetch()) {
        $perms = [];
        if ($perm['leer']) $perms[] = 'Leer';
        if ($perm['insertar']) $perms[] = 'Insertar';
        if ($perm['editar']) $perms[] = 'Editar';
        if ($perm['eliminar']) $perms[] = 'Eliminar';
        
        $permStr = empty($perms) ? 'Sin permisos' : implode(', ', $perms);
        echo "🔑 {$perm['username']} -> {$perm['modulo']}: $permStr\n";
    }
    
    // Test 5: Verificar integridad referencial
    echo "\n🔍 TEST 5: Verificando integridad referencial...\n";
    
    // Usuarios sin rol
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM usuarios u 
        LEFT JOIN roles r ON u.rol_id = r.id 
        WHERE u.estado = 1 AND r.id IS NULL
    ");
    $orphanUsers = $stmt->fetch()['count'];
    echo ($orphanUsers == 0 ? "✅" : "⚠️") . " Usuarios sin rol válido: $orphanUsers\n";
    
    // Acciones sin usuario válido
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM acciones a 
        LEFT JOIN usuarios u ON a.usuario_id = u.id 
        WHERE u.id IS NULL
    ");
    $orphanActions = $stmt->fetch()['count'];
    echo ($orphanActions == 0 ? "✅" : "⚠️") . " Acciones sin usuario válido: $orphanActions\n";
    
    // Acciones sin módulo válido
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM acciones a 
        LEFT JOIN modulos m ON a.modulo_id = m.id 
        WHERE m.id IS NULL
    ");
    $orphanModules = $stmt->fetch()['count'];
    echo ($orphanModules == 0 ? "✅" : "⚠️") . " Acciones sin módulo válido: $orphanModules\n";
    
    // Test 6: Estadísticas generales
    echo "\n📈 TEST 6: Estadísticas generales...\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM usuarios WHERE estado = 1");
    $activeUsers = $stmt->fetch()['count'];
    echo "👥 Usuarios activos: $activeUsers\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM acciones");
    $totalActions = $stmt->fetch()['count'];
    echo "🔐 Total de permisos configurados: $totalActions\n";
    
    $stmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM acciones 
        WHERE leer = 1 OR insertar = 1 OR editar = 1 OR eliminar = 1
    ");
    $activePermissions = $stmt->fetch()['count'];
    echo "✅ Permisos activos (con al menos una acción permitida): $activePermissions\n";
    
    // Resumen final
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "📋 RESUMEN DE PRUEBAS\n";
    echo str_repeat("=", 50) . "\n";
    
    $issues = 0;
    if ($orphanUsers > 0) {
        echo "⚠️  Hay usuarios sin rol válido\n";
        $issues++;
    }
    if ($orphanActions > 0) {
        echo "⚠️  Hay acciones sin usuario válido\n";
        $issues++;
    }
    if ($orphanModules > 0) {
        echo "⚠️  Hay acciones sin módulo válido\n";
        $issues++;
    }
    
    if ($issues == 0) {
        echo "✅ Sistema de roles funcionando correctamente\n";
        echo "✅ Todas las pruebas pasaron exitosamente\n";
    } else {
        echo "⚠️  Se encontraron $issues problemas de integridad\n";
        echo "🔧 Revisar y corregir los problemas identificados\n";
    }
    
    echo "\n🎯 Sistema listo para producción: " . ($issues == 0 ? "SÍ" : "NO") . "\n";
    
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    echo "🔧 Verificar configuración de base de datos\n";
} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Prueba completada - " . date('Y-m-d H:i:s') . "\n";
echo str_repeat("=", 50) . "\n";
?>

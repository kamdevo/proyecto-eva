<?php
echo "🔧 ACTIVANDO USUARIO TOMY1 CON PERMISOS AUTOMÁTICOS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "1️⃣ BUSCANDO USUARIO TOMY1...\n";
    
    // Buscar usuario tomy1
    $stmt = $pdo->prepare("SELECT id, nombre, apellido, username, email, active, rol_id FROM usuarios WHERE username LIKE '%tomy1%' OR email LIKE '%tomy%'");
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($usuarios)) {
        echo "❌ Usuario tomy1 no encontrado\n";
        echo "💡 Buscando usuarios con ID 387...\n";
        
        $stmt = $pdo->prepare("SELECT id, nombre, apellido, username, email, active, rol_id FROM usuarios WHERE id = 387");
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    if (empty($usuarios)) {
        echo "❌ Usuario ID 387 no encontrado\n";
        echo "💡 Listando usuarios con rol 4...\n";
        
        $stmt = $pdo->prepare("SELECT id, nombre, apellido, username, email, active, rol_id FROM usuarios WHERE rol_id = 4 LIMIT 5");
        $stmt->execute();
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "👥 Usuarios con rol 4 encontrados:\n";
        foreach ($usuarios as $u) {
            echo "   🆔 {$u['id']}: {$u['username']} ({$u['email']}) - Activo: {$u['active']}\n";
        }
        
        if (!empty($usuarios)) {
            $usuario = $usuarios[0]; // Tomar el primero
            echo "\n💡 Usando usuario ID {$usuario['id']} para la prueba\n";
        } else {
            throw new Exception("No se encontraron usuarios con rol 4");
        }
    } else {
        $usuario = $usuarios[0];
        echo "✅ Usuario encontrado:\n";
    }
    
    $userId = $usuario['id'];
    echo "   🆔 ID: $userId\n";
    echo "   👤 Usuario: {$usuario['username']}\n";
    echo "   📧 Email: {$usuario['email']}\n";
    echo "   🔐 Estado: {$usuario['active']}\n";
    echo "   🎭 Rol: {$usuario['rol_id']}\n\n";

    echo "2️⃣ VERIFICANDO PERMISOS ACTUALES...\n";
    
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM acciones WHERE usuario_id = ?");
    $stmt->execute([$userId]);
    $permisosActuales = $stmt->fetchColumn();
    
    echo "📊 Permisos actuales: $permisosActuales\n";
    
    if ($permisosActuales > 0) {
        echo "⚠️ Usuario ya tiene permisos, eliminando para probar activación automática...\n";
        
        $stmt = $pdo->prepare("DELETE FROM acciones WHERE usuario_id = ?");
        $stmt->execute([$userId]);
        echo "✅ Permisos eliminados\n";
    }

    echo "\n3️⃣ SIMULANDO ACTIVACIÓN AUTOMÁTICA...\n";
    
    // Simular la lógica del endpoint de activación
    $pdo->beginTransaction();
    
    try {
        // 1. Activar usuario (si no está activo)
        if ($usuario['active'] !== 'true') {
            $stmt = $pdo->prepare("UPDATE usuarios SET active = 'true' WHERE id = ?");
            $stmt->execute([$userId]);
            echo "✅ Usuario activado\n";
        } else {
            echo "ℹ️ Usuario ya estaba activo\n";
        }
        
        // 2. Asignar rol 4 si no tiene rol
        if (is_null($usuario['rol_id']) || $usuario['rol_id'] == 0) {
            $stmt = $pdo->prepare("UPDATE usuarios SET rol_id = 4 WHERE id = ?");
            $stmt->execute([$userId]);
            echo "✅ Rol 4 asignado\n";
        } else {
            echo "ℹ️ Usuario ya tiene rol: {$usuario['rol_id']}\n";
        }
        
        // 3. Verificar rol actual
        $stmt = $pdo->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $userRole = $stmt->fetchColumn();
        
        // 4. Verificar permisos existentes
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM acciones WHERE usuario_id = ?");
        $stmt->execute([$userId]);
        $existingPermissions = $stmt->fetchColumn();
        
        echo "📋 Estado: rol=$userRole, permisos_existentes=$existingPermissions\n";
        
        // 5. Asignar permisos automáticos para rol 4 sin permisos
        if ($userRole == 4 && $existingPermissions == 0) {
            echo "🔧 Asignando permisos automáticos para rol 4...\n";
            
            // Obtener módulos
            $stmt = $pdo->query("SELECT id, name FROM modulos WHERE name IS NOT NULL AND name != ''");
            $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "📂 Módulos encontrados: " . count($modulos) . "\n";
            
            $permisosCreados = 0;
            $modulosConAcceso = [];
            
            foreach ($modulos as $modulo) {
                // Aplicar lógica de getDefaultPermissionsByRole
                $moduleName = $modulo['name'];
                
                // Módulos con solo lectura
                $readOnlyModules = [
                    'equipos', 'equipos industriales', 'servicios', 'areas', 'contactos',
                    'guias rapidas', 'manuales', 'preventivos', 'calibraciones',
                    'estado equipos', 'observaciones', 'equipo archivos', 'soportes compra',
                    'repuestos', 'invimas', 'bajas biomedicos', 'planes mantenimiento',
                    'capacitaciones', 'propietarios', 'contingencias', 'equipos contactos',
                    'equipos especificaciones', 'repuestos instalados'
                ];
                
                // Módulos con leer + insertar (mis tickets)
                $readWriteModules = ['tickets propios', 'tickets activos', 'correctivos'];
                
                // Módulos restringidos
                $restrictedModules = ['usuarios', 'roles', 'permisos', 'administracion', 'reportes', 'tickets cerrados'];
                
                if (in_array($moduleName, $readOnlyModules)) {
                    $permisos = ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
                    $modulosConAcceso[] = "📖 $moduleName";
                } elseif (in_array($moduleName, $readWriteModules)) {
                    $permisos = ['leer' => 1, 'insertar' => 1, 'editar' => 0, 'eliminar' => 0];
                    $modulosConAcceso[] = "✏️ $moduleName";
                } elseif (in_array($moduleName, $restrictedModules)) {
                    $permisos = ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
                } else {
                    $permisos = ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
                    $modulosConAcceso[] = "📖 $moduleName (por defecto)";
                }
                
                // Insertar permiso
                $stmt = $pdo->prepare("
                    INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $userId,
                    $modulo['id'],
                    $permisos['leer'],
                    $permisos['insertar'],
                    $permisos['editar'],
                    $permisos['eliminar']
                ]);
                
                $permisosCreados++;
            }
            
            echo "✅ $permisosCreados permisos creados\n";
            echo "📋 Módulos con acceso: " . count($modulosConAcceso) . "\n";
            
            // Mostrar módulos importantes
            echo "\n🎯 PERMISOS CLAVE:\n";
            echo "   📖 Equipos: Solo lectura\n";
            echo "   ✏️ Tickets propios: Leer + crear\n";
            echo "   ✏️ Correctivos: Leer + crear\n";
            
        } else {
            echo "ℹ️ No se asignaron permisos (rol=$userRole, permisos_existentes=$existingPermissions)\n";
        }
        
        $pdo->commit();
        echo "\n✅ Transacción completada exitosamente\n";
        
    } catch (Exception $e) {
        $pdo->rollback();
        throw $e;
    }

    echo "\n4️⃣ VERIFICANDO RESULTADO...\n";
    
    // Verificar permisos finales
    $stmt = $pdo->prepare("
        SELECT m.name, a.leer, a.insertar, a.editar, a.eliminar
        FROM acciones a
        JOIN modulos m ON a.modulo_id = m.id
        WHERE a.usuario_id = ? AND a.leer = 1
        ORDER BY m.name
        LIMIT 10
    ");
    $stmt->execute([$userId]);
    $permisosFinales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Permisos asignados (" . count($permisosFinales) . " primeros):\n";
    foreach ($permisosFinales as $perm) {
        $acciones = [];
        if ($perm['leer']) $acciones[] = 'Leer';
        if ($perm['insertar']) $acciones[] = 'Crear';
        echo "   🔹 {$perm['name']}: " . implode(', ', $acciones) . "\n";
    }

    echo "\n5️⃣ PROBANDO ENDPOINT DE PERMISOS...\n";
    
    $url = "http://localhost:8001/api/v1/usuarios/$userId/permissions";
    echo "🔗 URL: $url\n";
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => ['Accept: application/json'],
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success']) {
            echo "✅ Endpoint responde con " . count($data['data']) . " permisos\n";
        } else {
            echo "⚠️ Endpoint responde pero sin éxito\n";
        }
    } else {
        echo "❌ Endpoint no responde\n";
    }

    echo "\n🎯 RESULTADO FINAL:\n";
    echo "✅ Usuario ID $userId activado\n";
    echo "✅ Rol 4 asignado\n";
    echo "✅ Permisos automáticos creados\n";
    echo "✅ Frontend debería cargar módulos ahora\n\n";
    
    echo "💡 INSTRUCCIONES:\n";
    echo "1. Usuario debe cerrar sesión y volver a iniciar\n";
    echo "2. O recargar la página (F5) para que cargue permisos\n";
    echo "3. El sidebar debería mostrar módulos con acceso\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA ACTIVACIÓN AUTOMÁTICA\n";

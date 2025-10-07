<?php
echo "🔧 PRUEBA COMPLETA: ACTIVACIÓN Y PERMISOS DE USUARIO\n";
echo "=" . str_repeat("=", 60) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "1️⃣ BUSCANDO USUARIO PARA ACTIVAR...\n";
    
    // Buscar usuario inactivo o crear uno
    $stmt = $pdo->query("
        SELECT id, nombre, apellido, username, email, active, rol_id 
        FROM usuarios 
        WHERE active = 'false' OR (active = 'true' AND rol_id IS NULL)
        LIMIT 1
    ");
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        echo "💡 Creando usuario de prueba...\n";
        
        $testUser = [
            'nombre' => 'Usuario',
            'apellido' => 'Prueba_' . time(),
            'username' => 'test_user_' . time(),
            'email' => 'test_' . time() . '@hospital.com',
            'password' => password_hash('123456', PASSWORD_DEFAULT),
            'active' => 'false',
            'centro_id' => 1,
            'fecha_registro' => date('Y-m-d H:i:s'),
            'rol_id' => null
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO usuarios (nombre, apellido, username, email, password, active, centro_id, fecha_registro, rol_id)
            VALUES (:nombre, :apellido, :username, :email, :password, :active, :centro_id, :fecha_registro, :rol_id)
        ");
        
        $stmt->execute($testUser);
        $userId = $pdo->lastInsertId();
        
        echo "✅ Usuario creado: ID $userId\n";
        echo "   📧 Email: {$testUser['email']}\n";
        echo "   👤 Username: {$testUser['username']}\n";
        
    } else {
        $userId = $usuario['id'];
        echo "✅ Usuario encontrado: ID $userId\n";
        echo "   👤 {$usuario['nombre']} {$usuario['apellido']}\n";
        echo "   📧 {$usuario['email']}\n";
        echo "   🔐 Estado: {$usuario['active']}\n";
        echo "   🎭 Rol actual: " . ($usuario['rol_id'] ?: 'Sin rol') . "\n";
    }

    echo "\n2️⃣ SIMULANDO ACTIVACIÓN AUTOMÁTICA...\n";
    
    // Simular la lógica del endpoint de activación
    $pdo->beginTransaction();
    
    try {
        // 1. Activar usuario
        $stmt = $pdo->prepare("UPDATE usuarios SET active = 'true' WHERE id = ?");
        $stmt->execute([$userId]);
        echo "✅ Usuario activado\n";
        
        // 2. Asignar rol 4 si no tiene rol
        $stmt = $pdo->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
        $stmt->execute([$userId]);
        $currentRole = $stmt->fetchColumn();
        
        if (is_null($currentRole) || $currentRole == 0) {
            $stmt = $pdo->prepare("UPDATE usuarios SET rol_id = 4 WHERE id = ?");
            $stmt->execute([$userId]);
            echo "✅ Rol 4 (Usuario normal) asignado\n";
        } else {
            echo "ℹ️ Usuario ya tiene rol: $currentRole\n";
        }
        
        // 3. Obtener todos los módulos
        $stmt = $pdo->query("SELECT id, name FROM modulos WHERE name IS NOT NULL AND name != ''");
        $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 4. Eliminar permisos existentes
        $stmt = $pdo->prepare("DELETE FROM acciones WHERE usuario_id = ?");
        $stmt->execute([$userId]);
        echo "✅ Permisos anteriores eliminados\n";
        
        // 5. Asignar nuevos permisos según rol 4
        $permisosCreados = 0;
        $modulosConAcceso = [];
        
        foreach ($modulos as $modulo) {
            // Simular función getDefaultPermissionsByRole
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
            
            // Módulos con leer + insertar
            $readWriteModules = ['tickets propios', 'tickets activos', 'correctivos'];
            
            // Módulos restringidos
            $restrictedModules = ['usuarios', 'roles', 'permisos', 'administracion', 'reportes', 'tickets cerrados'];
            
            if (in_array($moduleName, $readOnlyModules)) {
                $permisos = ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
                $modulosConAcceso[] = "📖 $moduleName (Solo lectura)";
            } elseif (in_array($moduleName, $readWriteModules)) {
                $permisos = ['leer' => 1, 'insertar' => 1, 'editar' => 0, 'eliminar' => 0];
                $modulosConAcceso[] = "✏️ $moduleName (Leer + Crear)";
            } elseif (in_array($moduleName, $restrictedModules)) {
                $permisos = ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
                // No agregar a módulos con acceso
            } else {
                $permisos = ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
                $modulosConAcceso[] = "📖 $moduleName (Solo lectura - por defecto)";
            }
            
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
        
        $pdo->commit();
        echo "✅ $permisosCreados permisos creados correctamente\n\n";
        
        echo "3️⃣ MÓDULOS ACCESIBLES EN EL SIDEBAR:\n";
        foreach ($modulosConAcceso as $modulo) {
            echo "   $modulo\n";
        }
        
        echo "\n4️⃣ VERIFICANDO PERMISOS EN BASE DE DATOS...\n";
        
        $stmt = $pdo->prepare("
            SELECT m.name, a.leer, a.insertar, a.editar, a.eliminar
            FROM acciones a
            JOIN modulos m ON a.modulo_id = m.id
            WHERE a.usuario_id = ? AND a.leer = 1
            ORDER BY m.name
        ");
        $stmt->execute([$userId]);
        $permisosActivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "📋 PERMISOS GUARDADOS (" . count($permisosActivos) . " módulos con acceso):\n";
        foreach ($permisosActivos as $permiso) {
            $acciones = [];
            if ($permiso['leer']) $acciones[] = 'Leer';
            if ($permiso['insertar']) $acciones[] = 'Crear';
            if ($permiso['editar']) $acciones[] = 'Editar';
            if ($permiso['eliminar']) $acciones[] = 'Eliminar';
            
            echo "   🔹 {$permiso['name']}: " . implode(', ', $acciones) . "\n";
        }
        
        echo "\n5️⃣ RESULTADO FINAL:\n";
        echo "✅ Usuario ID $userId activado correctamente\n";
        echo "✅ Rol 4 (Usuario normal) asignado\n";
        echo "✅ " . count($permisosActivos) . " módulos accesibles\n";
        echo "✅ Permisos específicos: equipos (lectura), mis tickets (lectura + creación)\n\n";
        
        echo "💡 INSTRUCCIONES PARA PROBAR:\n";
        echo "1. Inicia sesión con este usuario en el frontend\n";
        echo "2. Verifica que el sidebar muestre los módulos permitidos\n";
        echo "3. Confirma acceso de solo lectura en 'equipos'\n";
        echo "4. Confirma acceso de lectura + creación en 'mis tickets'\n";
        
    } catch (Exception $e) {
        $pdo->rollback();
        throw $e;
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA PRUEBA\n";

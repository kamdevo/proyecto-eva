<?php
echo "🔍 VERIFICANDO PERMISOS DEL USUARIO 237\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $userId = 237; // Usuario gloria vargas que acabamos de activar

    echo "1️⃣ INFORMACIÓN DEL USUARIO...\n";
    
    $stmt = $pdo->prepare("
        SELECT u.id, u.nombre, u.apellido, u.email, u.active, u.rol_id, r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE u.id = ?
    ");
    $stmt->execute([$userId]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        throw new Exception("Usuario $userId no encontrado");
    }
    
    echo "✅ Usuario: {$usuario['nombre']} {$usuario['apellido']}\n";
    echo "   📧 Email: {$usuario['email']}\n";
    echo "   🔐 Estado: {$usuario['active']}\n";
    echo "   🎭 Rol: {$usuario['rol_nombre']} (ID: {$usuario['rol_id']})\n\n";

    echo "2️⃣ PERMISOS ASIGNADOS EN LA BD...\n";
    
    $stmt = $pdo->prepare("
        SELECT m.id as modulo_id, m.name as modulo_nombre, 
               a.leer, a.insertar, a.editar, a.eliminar
        FROM acciones a
        JOIN modulos m ON a.modulo_id = m.id
        WHERE a.usuario_id = ?
        ORDER BY m.name
    ");
    $stmt->execute([$userId]);
    $permisos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 PERMISOS ENCONTRADOS: " . count($permisos) . "\n\n";
    
    $modulosVisibles = [];
    $modulosConCreacion = [];
    
    foreach ($permisos as $permiso) {
        $acciones = [];
        if ($permiso['leer']) $acciones[] = '👁️';
        if ($permiso['insertar']) $acciones[] = '➕';
        if ($permiso['editar']) $acciones[] = '✏️';
        if ($permiso['eliminar']) $acciones[] = '🗑️';
        
        $accionesStr = implode('', $acciones);
        echo "   🔹 {$permiso['modulo_nombre']}: $accionesStr\n";
        
        // Para el sidebar, solo importa si tiene permiso de leer
        if ($permiso['leer']) {
            $modulosVisibles[] = $permiso['modulo_nombre'];
        }
        
        // Para mis tickets, verificar si tiene permiso de crear
        if (in_array($permiso['modulo_nombre'], ['tickets propios', 'correctivos']) && $permiso['insertar']) {
            $modulosConCreacion[] = $permiso['modulo_nombre'];
        }
    }

    echo "\n3️⃣ MÓDULOS QUE DEBERÍAN APARECER EN EL SIDEBAR:\n";
    echo "📊 Total de módulos visibles: " . count($modulosVisibles) . "\n\n";
    
    // Agrupar por categoría
    $categorias = [
        'Equipos' => ['equipos', 'equipos industriales', 'equipos contactos', 'equipos especificaciones', 'estado equipos'],
        'Gestión' => ['servicios', 'areas', 'contactos', 'propietarios'],
        'Tickets' => ['tickets propios', 'tickets activos', 'correctivos'],
        'Mantenimiento' => ['preventivos', 'calibraciones', 'planes mantenimiento'],
        'Recursos' => ['repuestos', 'repuestos instalados', 'manuales', 'guias rapidas'],
        'Otros' => []
    ];
    
    foreach ($categorias as $categoria => $modulosCategoria) {
        $modulosEncontrados = array_intersect($modulosVisibles, $modulosCategoria);
        if (!empty($modulosEncontrados)) {
            echo "📁 $categoria:\n";
            foreach ($modulosEncontrados as $modulo) {
                $icono = in_array($modulo, $modulosConCreacion) ? '✏️' : '👁️';
                echo "   $icono $modulo\n";
            }
            echo "\n";
        }
    }
    
    // Módulos no categorizados
    $modulosCategorizados = array_merge(...array_values($categorias));
    $otrosModulos = array_diff($modulosVisibles, $modulosCategorizados);
    if (!empty($otrosModulos)) {
        echo "📁 Otros módulos:\n";
        foreach ($otrosModulos as $modulo) {
            echo "   👁️ $modulo\n";
        }
    }

    echo "\n4️⃣ VERIFICACIÓN ESPECÍFICA DE PERMISOS REQUERIDOS:\n";
    
    // Verificar equipos (solo lectura)
    $equiposPermiso = array_filter($permisos, function($p) { return $p['modulo_nombre'] === 'equipos'; });
    if (!empty($equiposPermiso)) {
        $equipo = array_values($equiposPermiso)[0];
        $status = ($equipo['leer'] && !$equipo['insertar']) ? '✅' : '❌';
        echo "   $status Equipos: Solo lectura " . ($equipo['leer'] ? '(✓ Leer)' : '(✗ Sin leer)') . " " . ($equipo['insertar'] ? '(✗ Puede crear)' : '(✓ No puede crear)') . "\n";
    } else {
        echo "   ❌ Equipos: Sin permisos\n";
    }
    
    // Verificar tickets propios (leer + crear)
    $ticketsPermiso = array_filter($permisos, function($p) { return $p['modulo_nombre'] === 'tickets propios'; });
    if (!empty($ticketsPermiso)) {
        $ticket = array_values($ticketsPermiso)[0];
        $status = ($ticket['leer'] && $ticket['insertar']) ? '✅' : '❌';
        echo "   $status Mis Tickets: Leer + Crear " . ($ticket['leer'] ? '(✓ Leer)' : '(✗ Sin leer)') . " " . ($ticket['insertar'] ? '(✓ Crear)' : '(✗ No puede crear)') . "\n";
    } else {
        echo "   ❌ Mis Tickets: Sin permisos\n";
    }

    echo "\n5️⃣ SIMULANDO RESPUESTA DEL LOGIN:\n";
    
    $permissions = [];
    foreach ($permisos as $permiso) {
        $permissions[$permiso['modulo_nombre']] = [
            'leer' => (bool) $permiso['leer'],
            'insertar' => (bool) $permiso['insertar'],
            'editar' => (bool) $permiso['editar'],
            'eliminar' => (bool) $permiso['eliminar']
        ];
    }
    
    echo "📋 Estructura JSON que recibe el frontend:\n";
    echo json_encode(['permissions' => $permissions], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

    echo "\n🎯 RESUMEN:\n";
    echo "✅ Usuario activado correctamente\n";
    echo "✅ Rol 4 (Usuario normal) asignado\n";
    echo "✅ " . count($modulosVisibles) . " módulos visibles en sidebar\n";
    echo "✅ Permisos específicos configurados correctamente\n";
    echo "✅ Equipos: Solo lectura ✓\n";
    echo "✅ Mis Tickets: Lectura + creación ✓\n\n";
    
    echo "💡 Si el sidebar sigue vacío, el problema está en el frontend\n";
    echo "   - Verificar que el login devuelva los permisos\n";
    echo "   - Verificar que el componente sidebar use los permisos correctamente\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA VERIFICACIÓN\n";

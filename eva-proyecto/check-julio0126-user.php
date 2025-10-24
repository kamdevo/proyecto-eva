<?php
echo "=== VERIFICAR USUARIO JULIO0126 - ROL Y PERMISOS ===\n\n";

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
    
    // 1. Buscar usuario julio0126
    echo "🔍 1. INFORMACIÓN DEL USUARIO 'julio0126':\n";
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nombre,
            u.apellido,
            u.email,
            u.username,
            u.rol_id,
            u.estado,
            u.active,
            u.servicio_id,
            u.zona_id,
            r.nombre as rol_nombre,
            s.name as servicio_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        LEFT JOIN servicios s ON u.servicio_id = s.id
        WHERE u.username = 'julio0126'
    ");
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario) {
        echo "✅ Usuario encontrado:\n";
        echo "- ID: {$usuario['id']}\n";
        echo "- Nombre: {$usuario['nombre']} {$usuario['apellido']}\n";
        echo "- Email: {$usuario['email']}\n";
        echo "- Username: {$usuario['username']}\n";
        echo "- Rol ID: {$usuario['rol_id']}\n";
        echo "- Rol Nombre: {$usuario['rol_nombre']}\n";
        echo "- Estado: " . ($usuario['estado'] ? 'ACTIVO' : 'INACTIVO') . "\n";
        echo "- Active: {$usuario['active']}\n";
        echo "- Servicio: {$usuario['servicio_nombre']}\n\n";
        
        $usuarioId = $usuario['id'];
        $rolId = $usuario['rol_id'];
        
        // 2. Verificar permisos específicos del usuario
        echo "📋 2. PERMISOS ESPECÍFICOS EN TABLA 'acciones':\n";
        $stmt = $pdo->prepare("
            SELECT 
                a.*,
                m.name as modulo_nombre
            FROM acciones a
            JOIN modulos m ON a.modulo_id = m.id
            WHERE a.usuario_id = ?
            ORDER BY m.name
        ");
        $stmt->execute([$usuarioId]);
        $permisos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($permisos) > 0) {
            echo "✅ Permisos encontrados (" . count($permisos) . " módulos):\n";
            foreach ($permisos as $permiso) {
                echo "- {$permiso['modulo_nombre']}:\n";
                echo "  * Leer: " . ($permiso['leer'] ? '✅' : '❌') . "\n";
                echo "  * Insertar: " . ($permiso['insertar'] ? '✅' : '❌') . "\n";
                echo "  * Editar: " . ($permiso['editar'] ? '✅' : '❌') . "\n";
                echo "  * Eliminar: " . ($permiso['eliminar'] ? '✅' : '❌') . "\n";
                echo "\n";
            }
        } else {
            echo "⚠️ NO hay permisos específicos en tabla 'acciones'\n";
            echo "📝 Esto significa que usará permisos por defecto según su rol\n\n";
        }
        
        // 3. Mostrar permisos por defecto según el rol
        echo "🎯 3. PERMISOS POR DEFECTO SEGÚN ROL {$rolId} ({$usuario['rol_nombre']}):\n";
        
        if ($rolId == 1) {
            echo "🔓 SUPER ADMINISTRADOR - TODOS los permisos habilitados\n";
            echo "- Acceso total a TODOS los módulos\n";
            echo "- Leer, Insertar, Editar, Eliminar = TODO ✅\n\n";
        } elseif ($rolId == 2) {
            echo "👑 ADMINISTRADOR - Permisos amplios (sin eliminar)\n";
            echo "- equipos: leer=✅, insertar=✅, editar=✅, eliminar=❌\n";
            echo "- usuarios: leer=✅, insertar=✅, editar=✅, eliminar=❌\n";
            echo "- tickets: leer=✅, insertar=✅, editar=✅, eliminar=✅\n";
            echo "- reportes: leer=✅, insertar=❌, editar=❌, eliminar=❌\n\n";
        } elseif ($rolId == 3) {
            echo "🔧 USUARIO AVANZADO - Permisos limitados\n";
            echo "- equipos: leer=✅, insertar=✅, editar=✅, eliminar=❌\n";
            echo "- mantenimientos: leer=✅, insertar=✅, editar=✅, eliminar=❌\n";
            echo "- tickets propios: leer=✅, insertar=✅, editar=✅, eliminar=❌\n";
            echo "- usuarios: SIN ACCESO ❌\n\n";
        } elseif ($rolId == 4) {
            echo "👤 USUARIO BÁSICO - Permisos muy limitados\n";
            echo "- equipos: leer=✅, insertar=❌, editar=❌, eliminar=❌\n";
            echo "- tickets propios: leer=✅, insertar=✅, editar=✅, eliminar=❌\n";
            echo "- guias rapidas: leer=✅, insertar=❌, editar=❌, eliminar=❌\n";
            echo "- contactos: leer=✅, insertar=❌, editar=❌, eliminar=❌\n";
            echo "- otros módulos: SIN ACCESO ❌\n\n";
        } else {
            echo "❓ ROL DESCONOCIDO - Sin permisos por defecto\n\n";
        }
        
        // 4. Resumen final
        echo "📊 4. RESUMEN FINAL PARA USUARIO julio0126:\n";
        echo "- Rol: {$usuario['rol_nombre']} (ID: {$rolId})\n";
        echo "- Estado: " . ($usuario['estado'] ? 'ACTIVO ✅' : 'INACTIVO ❌') . "\n";
        echo "- Permisos específicos: " . (count($permisos) > 0 ? 'SÍ ✅' : 'NO ❌ (usa por defecto)') . "\n";
        
        if ($usuario['estado']) {
            echo "- Puede acceder al sistema: ✅\n";
            echo "- Botones CRUD: Según permisos " . ($rolId == 1 ? 'TODOS' : 'LIMITADOS') . "\n";
        } else {
            echo "- Puede acceder al sistema: ❌ (DESACTIVADO)\n";
        }
        
    } else {
        echo "❌ Usuario 'julio0126' NO encontrado en la base de datos\n\n";
        
        // Buscar usuarios similares
        echo "🔍 Usuarios con nombres similares:\n";
        $stmt = $pdo->prepare("
            SELECT username, nombre, apellido, rol_id 
            FROM usuarios 
            WHERE username LIKE '%julio%' OR nombre LIKE '%julio%' OR apellido LIKE '%julio%'
        ");
        $stmt->execute();
        $usuariosSimilares = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($usuariosSimilares) > 0) {
            foreach ($usuariosSimilares as $u) {
                echo "- {$u['username']} ({$u['nombre']} {$u['apellido']}) - Rol {$u['rol_id']}\n";
            }
        } else {
            echo "- No se encontraron usuarios similares\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

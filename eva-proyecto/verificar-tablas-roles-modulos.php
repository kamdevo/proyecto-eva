<?php
echo "🔍 VERIFICANDO TABLAS ROLES Y MÓDULOS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "1️⃣ VERIFICANDO TABLA 'roles'...\n";
    
    // Verificar si la tabla roles existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'roles'");
    $rolesExiste = $stmt->rowCount() > 0;
    
    if ($rolesExiste) {
        echo "✅ Tabla 'roles' existe\n";
        
        // Ver estructura
        $stmt = $pdo->query("DESCRIBE roles");
        $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📋 Columnas de 'roles':\n";
        foreach ($columnas as $col) {
            echo "   • {$col['Field']} ({$col['Type']})\n";
        }
        
        // Ver contenido
        $stmt = $pdo->query("SELECT * FROM roles");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📊 Contenido de 'roles' (" . count($roles) . " registros):\n";
        foreach ($roles as $rol) {
            echo "   • ID: {$rol['id']}, Nombre: {$rol['nombre']}\n";
        }
    } else {
        echo "❌ Tabla 'roles' NO existe\n";
        echo "💡 Necesito crear la tabla 'roles'\n";
    }

    echo "\n2️⃣ VERIFICANDO TABLA 'modulos'...\n";
    
    // Verificar si la tabla modulos existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'modulos'");
    $modulosExiste = $stmt->rowCount() > 0;
    
    if ($modulosExiste) {
        echo "✅ Tabla 'modulos' existe\n";
        
        // Ver estructura
        $stmt = $pdo->query("DESCRIBE modulos");
        $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📋 Columnas de 'modulos':\n";
        foreach ($columnas as $col) {
            echo "   • {$col['Field']} ({$col['Type']})\n";
        }
        
        // Ver contenido
        $stmt = $pdo->query("SELECT * FROM modulos LIMIT 10");
        $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📊 Contenido de 'modulos' (primeros 10):\n";
        foreach ($modulos as $modulo) {
            echo "   • ID: {$modulo['id']}, Nombre: {$modulo['name']}\n";
        }
    } else {
        echo "❌ Tabla 'modulos' NO existe\n";
        echo "💡 Necesito crear la tabla 'modulos'\n";
    }

    echo "\n3️⃣ VERIFICANDO TABLA 'acciones' (permisos)...\n";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'acciones'");
    $accionesExiste = $stmt->rowCount() > 0;
    
    if ($accionesExiste) {
        echo "✅ Tabla 'acciones' existe\n";
        
        // Ver estructura
        $stmt = $pdo->query("DESCRIBE acciones");
        $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "📋 Columnas de 'acciones':\n";
        foreach ($columnas as $col) {
            echo "   • {$col['Field']} ({$col['Type']})\n";
        }
        
        // Contar permisos
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM acciones");
        $total = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "📊 Total de permisos: {$total['total']}\n";
    } else {
        echo "❌ Tabla 'acciones' NO existe\n";
    }

    echo "\n4️⃣ VERIFICANDO USUARIOS SIN ROL...\n";
    
    $stmt = $pdo->query("
        SELECT COUNT(*) as total 
        FROM usuarios 
        WHERE (rol_id IS NULL OR rol_id = 0) 
        AND active = 'true'
    ");
    $sinRol = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($sinRol['total'] > 0) {
        echo "⚠️ Hay {$sinRol['total']} usuarios activos SIN ROL asignado\n";
        
        // Listar usuarios sin rol
        $stmt = $pdo->query("
            SELECT id, nombre, apellido, username, email 
            FROM usuarios 
            WHERE (rol_id IS NULL OR rol_id = 0) 
            AND active = 'true'
            LIMIT 5
        ");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "👤 Usuarios sin rol:\n";
        foreach ($usuarios as $user) {
            echo "   • ID: {$user['id']}, {$user['nombre']} {$user['apellido']} ({$user['username']})\n";
        }
    } else {
        echo "✅ Todos los usuarios activos tienen rol asignado\n";
    }

    echo "\n🎯 RESUMEN:\n";
    echo "   • Tabla roles: " . ($rolesExiste ? "✅ Existe" : "❌ Falta") . "\n";
    echo "   • Tabla modulos: " . ($modulosExiste ? "✅ Existe" : "❌ Falta") . "\n";
    echo "   • Tabla acciones: " . ($accionesExiste ? "✅ Existe" : "❌ Falta") . "\n";
    echo "   • Usuarios sin rol: " . ($sinRol['total'] > 0 ? "⚠️ {$sinRol['total']}" : "✅ Ninguno") . "\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA VERIFICACIÓN\n";

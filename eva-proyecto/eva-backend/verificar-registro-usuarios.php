<?php
echo "=== VERIFICACIÓN REGISTRO DE USUARIOS ===\n\n";

// Configuración de base de datos
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a base de datos exitosa\n\n";
    
    // 1. Verificar estructura completa de tabla usuarios
    echo "1. Verificando estructura completa de tabla 'usuarios':\n";
    $stmt = $pdo->query("DESCRIBE usuarios");
    echo "   📋 Estructura completa:\n";
    while ($row = $stmt->fetch()) {
        $null = $row['Null'] == 'NO' ? '[Required]' : '[Optional]';
        echo "      - {$row['Field']} ({$row['Type']}) $null - Default: " . ($row['Default'] ?? 'NULL') . "\n";
    }
    echo "\n";
    
    // 2. Verificar foreign keys existentes
    echo "2. Verificando foreign keys en tabla 'usuarios':\n";
    $stmt = $pdo->query("
        SELECT 
            COLUMN_NAME,
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'gestionthuv' 
        AND TABLE_NAME = 'usuarios' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $foreignKeys = $stmt->fetchAll();
    if (count($foreignKeys) > 0) {
        echo "   ✅ Foreign keys encontradas:\n";
        foreach ($foreignKeys as $fk) {
            echo "      - {$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']} ({$fk['CONSTRAINT_NAME']})\n";
        }
    } else {
        echo "   ⚠️  No se encontraron foreign keys definidas\n";
    }
    echo "\n";
    
    // 3. Verificar que centros.id exista para validar la relación
    echo "3. Verificando relación usuarios.centro_id -> centros.id:\n";
    
    // Verificar tipos de datos compatibles
    $stmt = $pdo->query("SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'gestionthuv' AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'centro_id'");
    $usuariosCentroType = $stmt->fetch()['DATA_TYPE'] ?? 'NO FOUND';
    
    $stmt = $pdo->query("SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'gestionthuv' AND TABLE_NAME = 'centros' AND COLUMN_NAME = 'id'");
    $centrosIdType = $stmt->fetch()['DATA_TYPE'] ?? 'NO FOUND';
    
    echo "   📊 Tipos de datos:\n";
    echo "      - usuarios.centro_id: $usuariosCentroType\n";
    echo "      - centros.id: $centrosIdType\n";
    
    if ($usuariosCentroType == $centrosIdType) {
        echo "   ✅ Tipos de datos compatibles\n";
    } else {
        echo "   ⚠️  Tipos de datos incompatibles - puede causar problemas en la relación\n";
    }
    echo "\n";
    
    // 4. Probar inserción de prueba (sin ejecutar realmente)
    echo "4. Verificando campos requeridos para registro de usuario:\n";
    $requiredFields = [];
    $stmt = $pdo->query("DESCRIBE usuarios");
    while ($row = $stmt->fetch()) {
        if ($row['Null'] == 'NO' && $row['Default'] === null && $row['Extra'] != 'auto_increment') {
            $requiredFields[] = $row['Field'];
        }
    }
    
    echo "   📋 Campos obligatorios (sin valor por defecto):\n";
    foreach ($requiredFields as $field) {
        echo "      - $field\n";
    }
    echo "\n";
    
    // 5. Verificar que hay centros activos disponibles
    echo "5. Verificando centros disponibles para registro:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM centros WHERE status = 1");
    $centrosActivos = $stmt->fetch()['total'];
    echo "   📊 Centros activos disponibles: $centrosActivos\n";
    
    if ($centrosActivos > 0) {
        echo "   ✅ Hay centros disponibles para asignar a usuarios\n";
        
        // Mostrar algunos centros para ejemplo
        echo "   📋 Ejemplos de centros disponibles:\n";
        $stmt = $pdo->query("SELECT id, code, name FROM centros WHERE status = 1 ORDER BY name LIMIT 5");
        while ($row = $stmt->fetch()) {
            echo "      - ID: {$row['id']}, Código: {$row['code']}, Nombre: {$row['name']}\n";
        }
    } else {
        echo "   ❌ No hay centros activos disponibles\n";
    }
    echo "\n";
    
    // 6. Verificar estructura de otros campos relacionados
    echo "6. Verificando otras tablas relacionadas:\n";
    
    // Verificar tabla roles
    $stmt = $pdo->query("SHOW TABLES LIKE 'roles'");
    if ($stmt->rowCount() > 0) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM roles WHERE status = 1");
        $rolesActivos = $stmt->fetch()['total'];
        echo "   ✅ Tabla 'roles' encontrada - $rolesActivos roles activos\n";
    } else {
        echo "   ⚠️  Tabla 'roles' no encontrada\n";
    }
    
    // Verificar tabla empresas
    $stmt = $pdo->query("SHOW TABLES LIKE 'empresas'");
    if ($stmt->rowCount() > 0) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM empresas WHERE estado = 1");
        $empresasActivas = $stmt->fetch()['total'];
        echo "   ✅ Tabla 'empresas' encontrada - $empresasActivas empresas activas\n";
    } else {
        echo "   ⚠️  Tabla 'empresas' no encontrada\n";
    }
    
    // Verificar tabla sedes
    $stmt = $pdo->query("SHOW TABLES LIKE 'sedes'");
    if ($stmt->rowCount() > 0) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM sedes WHERE estado = 1");
        $sedesActivas = $stmt->fetch()['total'];
        echo "   ✅ Tabla 'sedes' encontrada - $sedesActivas sedes activas\n";
    } else {
        echo "   ⚠️  Tabla 'sedes' no encontrada\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error de base de datos: " . $e->getMessage() . "\n\n";
} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n\n";
}

echo "\n=== FIN DE VERIFICACIÓN ===\n";
?>

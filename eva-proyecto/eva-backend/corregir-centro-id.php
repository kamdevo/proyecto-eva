<?php
echo "=== CORRECCIÓN ESTRUCTURA USUARIOS ===\n\n";

// Configuración de base de datos
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a base de datos exitosa\n\n";
    
    // 1. Verificar datos actuales en usuarios.centro_id
    echo "1. Verificando datos actuales en usuarios.centro_id:\n";
    $stmt = $pdo->query("SELECT centro_id, COUNT(*) as count FROM usuarios WHERE centro_id IS NOT NULL GROUP BY centro_id ORDER BY count DESC LIMIT 10");
    $centroIds = $stmt->fetchAll();
    
    if (count($centroIds) > 0) {
        echo "   📊 Valores actuales en centro_id:\n";
        foreach ($centroIds as $row) {
            echo "      - '{$row['centro_id']}' ({$row['count']} usuarios)\n";
        }
        echo "\n";
        
        // Verificar si son valores numéricos convertibles
        $validIds = 0;
        $invalidIds = 0;
        
        foreach ($centroIds as $row) {
            if (is_numeric($row['centro_id']) && intval($row['centro_id']) > 0) {
                $validIds++;
            } else {
                $invalidIds++;
            }
        }
        
        echo "   📈 Análisis de compatibilidad:\n";
        echo "      - IDs válidos (numéricos): $validIds\n";
        echo "      - IDs inválidos (no numéricos): $invalidIds\n\n";
        
        if ($invalidIds == 0) {
            echo "   ✅ Todos los centro_id son numéricos - seguro proceder con conversión\n\n";
            
            // 2. Crear backup de la tabla
            echo "2. Creando backup de la tabla usuarios:\n";
            $backupTable = 'usuarios_backup_' . date('Ymd_His');
            $pdo->exec("CREATE TABLE $backupTable LIKE usuarios");
            $pdo->exec("INSERT INTO $backupTable SELECT * FROM usuarios");
            echo "   ✅ Backup creado: $backupTable\n\n";
            
            // 3. Modificar la columna centro_id a INT
            echo "3. Modificando columna centro_id a INT:\n";
            $pdo->exec("ALTER TABLE usuarios MODIFY COLUMN centro_id INT(11) DEFAULT NULL");
            echo "   ✅ Columna centro_id modificada a INT(11)\n\n";
            
            // 4. Verificar la modificación
            echo "4. Verificando modificación:\n";
            $stmt = $pdo->query("DESCRIBE usuarios");
            while ($row = $stmt->fetch()) {
                if ($row['Field'] == 'centro_id') {
                    echo "   📋 centro_id: {$row['Type']} - {$row['Null']} - Default: " . ($row['Default'] ?? 'NULL') . "\n";
                    break;
                }
            }
            echo "\n";
            
            // 5. Probar la relación con centros
            echo "5. Probando relación con tabla centros:\n";
            $stmt = $pdo->query("
                SELECT 
                    COUNT(u.id) as usuarios_con_centro_valido 
                FROM usuarios u 
                INNER JOIN centros c ON u.centro_id = c.id 
                WHERE u.centro_id IS NOT NULL
            ");
            $usuariosConCentroValido = $stmt->fetch()['usuarios_con_centro_valido'];
            
            $stmt = $pdo->query("SELECT COUNT(*) as total_usuarios FROM usuarios WHERE centro_id IS NOT NULL");
            $totalUsuarios = $stmt->fetch()['total_usuarios'];
            
            echo "   📊 Usuarios con centro válido: $usuariosConCentroValido de $totalUsuarios\n";
            
            if ($usuariosConCentroValido == $totalUsuarios) {
                echo "   ✅ Todos los usuarios tienen centros válidos\n\n";
            } else {
                echo "   ⚠️  Algunos usuarios tienen centros inválidos\n\n";
            }
            
        } else {
            echo "   ⚠️  Hay centro_id no numéricos - revisar manualmente antes de convertir\n\n";
            
            // Mostrar los valores problemáticos
            echo "   📋 Valores problemáticos:\n";
            foreach ($centroIds as $row) {
                if (!is_numeric($row['centro_id']) || intval($row['centro_id']) <= 0) {
                    echo "      - '{$row['centro_id']}' ({$row['count']} usuarios)\n";
                }
            }
            echo "\n";
        }
        
    } else {
        echo "   📊 No hay usuarios con centro_id asignado\n";
        echo "   ✅ Seguro proceder con conversión\n\n";
        
        // Modificar directamente ya que no hay datos
        echo "2. Modificando columna centro_id a INT (sin datos):\n";
        $pdo->exec("ALTER TABLE usuarios MODIFY COLUMN centro_id INT(11) DEFAULT NULL");
        echo "   ✅ Columna centro_id modificada a INT(11)\n\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error de base de datos: " . $e->getMessage() . "\n\n";
} catch (Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n\n";
}

echo "=== FIN DE CORRECCIÓN ===\n";
?>

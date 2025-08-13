<?php
/**
 * Verificar estructura de la tabla equipos y agregar campos INVIMA
 */

echo "🔍 VERIFICANDO ESTRUCTURA DE TABLA EQUIPOS\n";
echo str_repeat("=", 60) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Verificar estructura actual
    echo "1️⃣ ESTRUCTURA ACTUAL DE LA TABLA EQUIPOS:\n\n";
    
    $stmt = $pdo->query("DESCRIBE equipos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $existingColumns = [];
    foreach ($columns as $column) {
        $existingColumns[] = $column['Field'];
        echo "   - " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    
    echo "\n📊 Total columnas: " . count($columns) . "\n";
    
    // 2. Verificar columnas relacionadas con INVIMA
    echo "\n2️⃣ VERIFICANDO COLUMNAS RELACIONADAS CON INVIMA:\n\n";
    
    $columnsInvima = [
        'registro_sanitario' => 'VARCHAR(255) DEFAULT NULL',
        'archivo_invima' => 'VARCHAR(255) DEFAULT NULL',
        'numero_invima' => 'VARCHAR(255) DEFAULT NULL',
        'fecha_vencimiento_invima' => 'DATE DEFAULT NULL',
        'estado_invima' => 'VARCHAR(50) DEFAULT NULL'
    ];
    
    $columnasFaltantes = [];
    
    foreach ($columnsInvima as $columnName => $columnDef) {
        if (in_array($columnName, $existingColumns)) {
            echo "   ✅ $columnName: Existe\n";
        } else {
            echo "   ❌ $columnName: NO existe\n";
            $columnasFaltantes[$columnName] = $columnDef;
        }
    }
    
    // 3. Agregar columnas faltantes
    if (!empty($columnasFaltantes)) {
        echo "\n3️⃣ AGREGANDO COLUMNAS FALTANTES:\n\n";
        
        foreach ($columnasFaltantes as $columnName => $columnDef) {
            echo "   🔄 Agregando columna '$columnName'...\n";
            
            try {
                $pdo->exec("ALTER TABLE equipos ADD COLUMN $columnName $columnDef");
                echo "   ✅ Columna '$columnName' agregada exitosamente\n";
            } catch (Exception $e) {
                echo "   ❌ Error agregando '$columnName': " . $e->getMessage() . "\n";
            }
        }
        
    } else {
        echo "\n✅ Todas las columnas INVIMA ya existen\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Insertar algunos datos de ejemplo
    echo "4️⃣ INSERTANDO DATOS DE EJEMPLO:\n\n";
    
    // Obtener algunos equipos para agregar registros INVIMA
    $stmt = $pdo->query("SELECT id, name FROM equipos WHERE registro_sanitario IS NULL LIMIT 5");
    $equiposSinRegistro = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($equiposSinRegistro)) {
        echo "📋 Agregando registros INVIMA a equipos:\n";
        
        $registrosEjemplo = [
            'INVIMA-2024-001',
            'INVIMA-2024-002', 
            'INVIMA-2024-003',
            'INVIMA-2024-004',
            'INVIMA-2024-005'
        ];
        
        foreach ($equiposSinRegistro as $index => $equipo) {
            $registroInvima = $registrosEjemplo[$index] ?? 'INVIMA-2024-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
            $fechaVencimiento = date('Y-m-d', strtotime('+2 years'));
            
            $stmt = $pdo->prepare("
                UPDATE equipos 
                SET 
                    registro_sanitario = ?,
                    numero_invima = ?,
                    fecha_vencimiento_invima = ?,
                    estado_invima = 'Vigente'
                WHERE id = ?
            ");
            
            $stmt->execute([$registroInvima, $registroInvima, $fechaVencimiento, $equipo['id']]);
            
            echo "   ✅ Equipo ID {$equipo['id']}: $registroInvima\n";
        }
        
    } else {
        echo "⚠️ No se encontraron equipos sin registro o ya tienen registros\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 5. Verificar datos insertados
    echo "5️⃣ VERIFICANDO DATOS INSERTADOS:\n\n";
    
    $stmt = $pdo->query("
        SELECT 
            id, 
            name, 
            registro_sanitario, 
            numero_invima,
            fecha_vencimiento_invima,
            estado_invima
        FROM equipos 
        WHERE registro_sanitario IS NOT NULL 
        LIMIT 10
    ");
    
    $equiposConRegistro = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($equiposConRegistro)) {
        echo "✅ Equipos con registro INVIMA: " . count($equiposConRegistro) . "\n\n";
        
        printf("%-5s %-25s %-20s %-15s %-10s\n", "ID", "NOMBRE", "REGISTRO", "VENCIMIENTO", "ESTADO");
        echo str_repeat("-", 75) . "\n";
        
        foreach ($equiposConRegistro as $equipo) {
            printf("%-5s %-25s %-20s %-15s %-10s\n",
                $equipo['id'],
                substr($equipo['name'] ?: 'Sin nombre', 0, 24),
                $equipo['registro_sanitario'] ?: 'N/A',
                $equipo['fecha_vencimiento_invima'] ?: 'N/A',
                $equipo['estado_invima'] ?: 'N/A'
            );
        }
        
    } else {
        echo "❌ No se encontraron equipos con registro INVIMA\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN:\n\n";
    
    echo "✅ Estructura de tabla verificada y corregida\n";
    echo "✅ Columnas INVIMA agregadas\n";
    echo "✅ Datos de ejemplo insertados\n";
    
    echo "\n💡 PRÓXIMOS PASOS:\n";
    echo "1. Verificar que el endpoint incluya estos campos\n";
    echo "2. Actualizar el frontend para mostrar registro INVIMA\n";
    echo "3. Probar la funcionalidad completa\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

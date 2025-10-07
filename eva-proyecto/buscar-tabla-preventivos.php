<?php
echo "🔍 BUSCANDO TABLAS DE MANTENIMIENTO/PREVENTIVOS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Listar todas las tablas
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "📊 TABLAS ENCONTRADAS (" . count($tables) . " total):\n";
    
    $preventivo_related = [];
    foreach ($tables as $table) {
        echo "   • $table";
        if (stripos($table, 'preventivo') !== false || 
            stripos($table, 'mantenimiento') !== false ||
            stripos($table, 'repuesto') !== false) {
            echo " ← POSIBLE TABLA DE PREVENTIVOS";
            $preventivo_related[] = $table;
        }
        echo "\n";
    }

    if (count($preventivo_related) > 0) {
        echo "\n🎯 TABLAS RELACIONADAS CON PREVENTIVOS:\n";
        foreach ($preventivo_related as $table) {
            echo "\n📋 Tabla: $table\n";
            
            // Ver estructura
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "   Columnas:\n";
            foreach ($columns as $col) {
                echo "   • {$col['Field']} ({$col['Type']})\n";
            }
            
            // Ver cantidad de registros
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "   📊 Registros: {$count['total']}\n";
            
            // Mostrar ejemplo de datos si hay
            if ($count['total'] > 0) {
                $stmt = $pdo->query("SELECT * FROM $table LIMIT 3");
                $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo "   📄 Muestra de datos:\n";
                foreach ($samples as $i => $sample) {
                    echo "      Registro " . ($i+1) . ":\n";
                    foreach ($sample as $key => $value) {
                        echo "        • $key: " . substr($value, 0, 50) . "\n";
                    }
                }
            }
        }
    } else {
        echo "\n⚠️ No se encontraron tablas específicas de preventivos/mantenimiento\n";
        echo "💡 Buscando en tabla 'ordenes' si hay tickets de tipo preventivo...\n";
        
        // Buscar tipos de ordenes
        $stmt = $pdo->query("SELECT DISTINCT tipo, descripcion FROM ordenes WHERE tipo IS NOT NULL LIMIT 10");
        $tipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($tipos) > 0) {
            echo "📋 Tipos de órdenes encontrados:\n";
            foreach ($tipos as $tipo) {
                echo "   • Tipo: {$tipo['tipo']}, Descripción: " . substr($tipo['descripcion'], 0, 50) . "\n";
            }
        }
        
        // Buscar órdenes con palabras relacionadas con repuestos
        $stmt = $pdo->query("
            SELECT id, descripcion, fecha_inicio 
            FROM ordenes 
            WHERE descripcion LIKE '%repuesto%' 
               OR descripcion LIKE '%falta%' 
               OR descripcion LIKE '%pendiente%'
               OR descripcion LIKE '%preventivo%'
            LIMIT 5
        ");
        $repuestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($repuestos) > 0) {
            echo "\n🔧 Órdenes relacionadas con repuestos/preventivos:\n";
            foreach ($repuestos as $rep) {
                echo "   • ID: {$rep['id']}, Fecha: {$rep['fecha_inicio']}\n";
                echo "     Descripción: " . substr($rep['descripcion'], 0, 100) . "\n";
            }
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA BÚSQUEDA\n";

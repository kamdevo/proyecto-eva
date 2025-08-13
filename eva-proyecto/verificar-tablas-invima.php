<?php
/**
 * Verificar tablas INVIMA y corregir referencias
 */

echo "🔍 VERIFICANDO TABLAS INVIMA\n";
echo str_repeat("=", 50) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Verificar qué tablas existen
    echo "1️⃣ VERIFICANDO TABLAS EXISTENTES:\n\n";
    
    $tablasInvima = ['invimas', 'registros_invima'];
    
    foreach ($tablasInvima as $tabla) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$tabla'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Tabla '$tabla' existe\n";
            
            // Contar registros
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM $tabla");
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            echo "   📊 Total registros: $total\n";
            
            // Mostrar estructura
            $stmt = $pdo->query("DESCRIBE $tabla");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "   📋 Columnas:\n";
            foreach ($columns as $column) {
                echo "      - {$column['Field']} ({$column['Type']})\n";
            }
            
            // Mostrar algunos registros de ejemplo
            if ($total > 0) {
                echo "   📄 Registros de ejemplo:\n";
                $stmt = $pdo->query("SELECT * FROM $tabla LIMIT 3");
                $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($registros as $registro) {
                    echo "      ID: {$registro['id']}\n";
                    
                    // Buscar campo de número de registro
                    $numeroRegistro = $registro['numero_registro'] ?? 
                                    $registro['numero'] ?? 
                                    $registro['registro'] ?? 
                                    'N/A';
                    echo "      Número: $numeroRegistro\n";
                    
                    // Buscar campo de nombre
                    $nombre = $registro['nombre_comercial'] ?? 
                            $registro['nombre_equipo'] ?? 
                            $registro['nombre'] ?? 
                            'N/A';
                    echo "      Nombre: $nombre\n\n";
                }
            }
            
        } else {
            echo "❌ Tabla '$tabla' NO existe\n";
        }
        echo "\n";
    }
    
    echo str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar relación en tabla equipos
    echo "2️⃣ VERIFICANDO RELACIÓN EN TABLA EQUIPOS:\n\n";
    
    $stmt = $pdo->query("DESCRIBE equipos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $camposInvima = [];
    foreach ($columns as $column) {
        if (strpos(strtolower($column['Field']), 'invima') !== false) {
            $camposInvima[] = $column['Field'];
        }
    }
    
    echo "📋 Campos relacionados con INVIMA en equipos:\n";
    foreach ($camposInvima as $campo) {
        echo "   - $campo\n";
    }
    
    // Verificar datos en equipos
    if (in_array('invima_id', $camposInvima)) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM equipos WHERE invima_id IS NOT NULL");
        $equiposConInvimaId = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "\n📊 Equipos con invima_id: $equiposConInvimaId\n";
    }
    
    if (in_array('registro_sanitario', $camposInvima)) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM equipos WHERE registro_sanitario IS NOT NULL AND registro_sanitario != ''");
        $equiposConRegistro = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "📊 Equipos con registro_sanitario: $equiposConRegistro\n";
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "🎯 DIAGNÓSTICO:\n\n";
    
    // Determinar tabla correcta
    $stmt = $pdo->query("SHOW TABLES LIKE 'invimas'");
    $tablaInvimasExiste = $stmt->rowCount() > 0;
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'registros_invima'");
    $tablaRegistrosExiste = $stmt->rowCount() > 0;
    
    if ($tablaInvimasExiste) {
        echo "✅ Tabla correcta: 'invimas'\n";
        echo "💡 Necesito actualizar referencias a 'registros_invima'\n";
    } else if ($tablaRegistrosExiste) {
        echo "✅ Tabla correcta: 'registros_invima'\n";
        echo "💡 Las referencias están correctas\n";
    } else {
        echo "❌ Ninguna tabla INVIMA existe\n";
        echo "💡 Necesito crear la tabla correcta\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

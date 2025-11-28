<?php

echo "🔍 Buscando tabla de frecuencias...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado a BD: $database\n\n";
    
    // Buscar tablas con "frecuencia" en el nombre
    $stmt = $pdo->query("SHOW TABLES LIKE '%frecuencia%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!empty($tables)) {
        echo "📊 Tablas encontradas con 'frecuencia':\n";
        foreach ($tables as $table) {
            echo "  - $table\n";
        }
    } else {
        echo "⚠️ No se encontraron tablas con 'frecuencia'\n";
    }
    
    // Si no hay tabla, verificar valores únicos de frecuencia_id
    echo "\n📊 Valores únicos de frecuencia_id en planes_mantenimientos:\n";
    $stmt = $pdo->query("SELECT DISTINCT frecuencia_id, COUNT(*) as cantidad 
                        FROM planes_mantenimientos 
                        WHERE frecuencia_id IS NOT NULL 
                        GROUP BY frecuencia_id 
                        ORDER BY frecuencia_id");
    $frecuencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo str_repeat("=", 40) . "\n";
    foreach ($frecuencias as $frec) {
        echo "ID: " . $frec['frecuencia_id'] . " - Cantidad: " . $frec['cantidad'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

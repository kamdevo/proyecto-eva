<?php

echo "=== VERIFICACIÓN DE ESTRUCTURA DE TABLA ordenes_compra ===\n\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Conexión a base de datos exitosa.\n\n";
    
    // Show table structure
    echo "=== ESTRUCTURA DE LA TABLA ordenes_compra ===\n";
    $stmt = $pdo->query("DESCRIBE ordenes_compra");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Columnas encontradas:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Key']}\n";
    }
    
    echo "\n=== MUESTRA DE DATOS (primeros 3 registros) ===\n";
    $stmt = $pdo->query("SELECT * FROM ordenes_compra LIMIT 3");
    $sample = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($sample) {
        print_r($sample);
    } else {
        echo "No hay registros en la tabla.\n";
    }
    
    echo "\n=== CONTEO TOTAL DE REGISTROS ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM ordenes_compra");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total de registros: " . $count['total'] . "\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DE LA VERIFICACIÓN ===\n";

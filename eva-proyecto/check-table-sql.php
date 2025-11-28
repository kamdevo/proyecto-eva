<?php

echo "🔍 Verificando estructura de tabla planes_mantenimientos...\n\n";

// Configuración de BD - usar valores directos
$host = 'localhost';
$database = 'gestionthuv';  // Base de datos real
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado a BD: $database\n\n";
    
    // Obtener columnas de la tabla
    $stmt = $pdo->query("DESCRIBE planes_mantenimientos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Columnas de la tabla:\n";
    echo str_repeat("=", 80) . "\n";
    printf("%-30s %-20s %-10s %-10s\n", "Columna", "Tipo", "Null", "Default");
    echo str_repeat("=", 80) . "\n";
    
    foreach ($columns as $col) {
        printf("%-30s %-20s %-10s %-10s\n", 
            $col['Field'], 
            $col['Type'], 
            $col['Null'], 
            $col['Default'] ?: 'NULL'
        );
    }
    
    echo str_repeat("=", 80) . "\n";
    echo "\n✅ Total columnas: " . count($columns) . "\n";
    
    // Obtener un registro de ejemplo
    $stmt = $pdo->query("SELECT * FROM planes_mantenimientos LIMIT 1");
    $example = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($example) {
        echo "\n📄 Registro de ejemplo:\n";
        echo str_repeat("=", 80) . "\n";
        foreach ($example as $key => $value) {
            echo "  $key: " . ($value ?? 'NULL') . "\n";
        }
    } else {
        echo "\n⚠️ La tabla está vacía\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

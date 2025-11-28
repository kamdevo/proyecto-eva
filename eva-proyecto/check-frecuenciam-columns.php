<?php

echo "🔍 Verificando estructura de tabla frecuenciam...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado a BD: $database\n\n";
    
    // Obtener columnas de la tabla
    $stmt = $pdo->query("DESCRIBE frecuenciam");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Columnas de frecuenciam:\n";
    echo str_repeat("=", 80) . "\n";
    printf("%-30s %-20s %-10s\n", "Columna", "Tipo", "Null");
    echo str_repeat("=", 80) . "\n";
    
    foreach ($columns as $col) {
        printf("%-30s %-20s %-10s\n", 
            $col['Field'], 
            $col['Type'], 
            $col['Null']
        );
    }
    
    echo str_repeat("=", 80) . "\n";
    
    // Obtener registros
    echo "\n📄 Registros de frecuenciam:\n";
    echo str_repeat("=", 80) . "\n";
    $stmt = $pdo->query("SELECT * FROM frecuenciam");
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($records as $rec) {
        echo "ID: " . ($rec['id'] ?? 'N/A');
        foreach ($rec as $key => $value) {
            if ($key !== 'id') {
                echo " | $key: " . ($value ?? 'NULL');
            }
        }
        echo "\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

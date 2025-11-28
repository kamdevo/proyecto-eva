<?php

echo "🔍 Verificando columnas de propietarios...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado a BD: $database\n\n";
    
    $stmt = $pdo->query("DESCRIBE propietarios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Columnas de propietarios:\n";
    echo str_repeat("=", 80) . "\n";
    foreach ($columns as $col) {
        echo "  - " . $col['Field'] . " (" . $col['Type'] . ")\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

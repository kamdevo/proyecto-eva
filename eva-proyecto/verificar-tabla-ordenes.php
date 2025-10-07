<?php
echo "🔍 VERIFICANDO ESTRUCTURA DE TABLA ORDENES\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "📋 COLUMNAS DE LA TABLA 'ordenes':\n";
    $stmt = $pdo->query("DESCRIBE ordenes");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $column) {
        echo "  • {$column['Field']} ({$column['Type']}) - {$column['Null']} - {$column['Default']}\n";
    }

    echo "\n📊 REGISTRO DE EJEMPLO:\n";
    $stmt = $pdo->query("SELECT * FROM ordenes LIMIT 1");
    $example = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($example) {
        foreach ($example as $field => $value) {
            echo "  • $field: " . ($value ?? 'NULL') . "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

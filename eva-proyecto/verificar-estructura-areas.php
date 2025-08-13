<?php
/**
 * Verificar estructura de tabla areas
 */

echo "🔍 VERIFICANDO ESTRUCTURA DE TABLA AREAS\n";
echo str_repeat("=", 50) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Verificar estructura de areas
    $stmt = $pdo->query("DESCRIBE areas");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 COLUMNAS DE LA TABLA AREAS:\n";
    foreach ($columns as $column) {
        echo "   - {$column['Field']} ({$column['Type']}) - Default: {$column['Default']}\n";
    }
    
    // Verificar estructura de servicios
    echo "\n📋 COLUMNAS DE LA TABLA SERVICIOS:\n";
    $stmt = $pdo->query("DESCRIBE servicios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "   - {$column['Field']} ({$column['Type']}) - Default: {$column['Default']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

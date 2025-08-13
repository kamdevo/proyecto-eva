<?php
/**
 * Verificar nombre correcto de tabla de estados
 */

echo "🔍 VERIFICANDO TABLA DE ESTADOS\n";
echo str_repeat("=", 40) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Buscar tablas relacionadas con estados
    $stmt = $pdo->query("SHOW TABLES LIKE '%estado%'");
    $tablasEstados = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "📋 Tablas relacionadas con estados:\n";
    foreach ($tablasEstados as $tabla) {
        echo "   - $tabla\n";
        
        // Verificar estructura
        $stmt = $pdo->query("DESCRIBE $tabla");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "     Columnas: ";
        $columnNames = array_column($columns, 'Field');
        echo implode(', ', $columnNames) . "\n";
        
        // Contar registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM $tabla");
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "     Registros: $total\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

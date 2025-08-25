<?php

echo "📋 VERIFICANDO ESTRUCTURA DE TABLAS\n";
echo str_repeat('=', 60) . "\n\n";

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $tables = ['tipos_compra', 'contacto', 'empresas', 'sedes', 'ordenes_compra'];
    
    foreach ($tables as $table) {
        echo "📋 TABLA: $table\n";
        echo str_repeat('-', 40) . "\n";
        
        $stmt = $pdo->query("DESCRIBE $table");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($columns as $column) {
            echo "  - {$column['Field']} ({$column['Type']})\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

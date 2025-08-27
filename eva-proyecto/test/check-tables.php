<?php

echo "📋 VERIFICANDO TABLAS EXISTENTES\n";
echo str_repeat('-', 50) . "\n";

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $tables = ['ordenes_compra', 'tipos_compra', 'contacto', 'empresas', 'sedes'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Tabla '$table' existe\n";
            
            // Contar registros
            $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "   Registros: $count\n";
        } else {
            echo "❌ Tabla '$table' NO existe\n";
        }
    }
    
    echo "\n📋 VERIFICANDO TABLAS ALTERNATIVAS\n";
    echo str_repeat('-', 50) . "\n";
    
    // Buscar tablas similares
    $stmt = $pdo->query("SHOW TABLES");
    $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($allTables as $table) {
        if (strpos($table, 'orden') !== false || 
            strpos($table, 'compra') !== false || 
            strpos($table, 'tipo') !== false ||
            strpos($table, 'empresa') !== false ||
            strpos($table, 'sede') !== false ||
            strpos($table, 'contacto') !== false ||
            strpos($table, 'proveedor') !== false) {
            echo "🔍 Tabla relacionada: $table\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

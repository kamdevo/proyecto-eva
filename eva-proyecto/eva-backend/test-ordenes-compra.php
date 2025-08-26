<?php
// Test script para verificar endpoint de órdenes de compra
echo "=== TEST ÓRDENES DE COMPRA ===\n";

// 1. Verificar tablas de la base de datos
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=gestionthuv', 'root', '');
    
    echo "\n1. Verificando tablas relacionadas con órdenes de compra:\n";
    
    // Buscar tablas que contengan 'orden' o 'compra'
    $stmt = $pdo->query("SHOW TABLES");
    $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $relatedTables = array_filter($allTables, function($table) {
        return stripos($table, 'orden') !== false || stripos($table, 'compra') !== false;
    });
    
    if (empty($relatedTables)) {
        echo "   ❌ NO SE ENCONTRARON tablas relacionadas con órdenes de compra\n";
        echo "   📋 Tablas disponibles: " . implode(', ', array_slice($allTables, 0, 10)) . "...\n";
    } else {
        echo "   ✅ Tablas encontradas: " . implode(', ', $relatedTables) . "\n";
        
        // Verificar estructura de la tabla si existe
        foreach ($relatedTables as $table) {
            echo "\n   📋 Estructura de $table:\n";
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($columns as $column) {
                echo "      - {$column['Field']} ({$column['Type']}) " . ($column['Null'] === 'NO' ? '[Required]' : '') . "\n";
            }
            
            $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            echo "      📊 Registros: $count\n";
        }
    }
    
} catch (Exception $e) {
    echo "   ❌ Error de base de datos: " . $e->getMessage() . "\n";
}

// 2. Verificar endpoint directamente
echo "\n2. Probando endpoint HTTP:\n";

try {
    $url = 'http://127.0.0.1:8001/api/v1/ordenes-compra';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "   ❌ Error cURL: $error\n";
    } else {
        echo "   📡 Código HTTP: $httpCode\n";
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if ($data) {
                echo "   ✅ Respuesta exitosa\n";
                echo "   📦 Datos: " . substr(json_encode($data, JSON_PRETTY_PRINT), 0, 500) . "...\n";
            } else {
                echo "   ⚠️  Respuesta no es JSON válido\n";
                echo "   📝 Respuesta raw: " . substr($response, 0, 500) . "...\n";
            }
        } else {
            echo "   ❌ Error HTTP $httpCode\n";
            echo "   📝 Respuesta: " . substr($response, 0, 500) . "...\n";
        }
    }
    
} catch (Exception $e) {
    echo "   ❌ Error general: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DEL TEST ===\n";
?>

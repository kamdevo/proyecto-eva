<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check proveedores_mantenimiento table structure
    echo "=== PROVEEDORES_MANTENIMIENTO TABLE STRUCTURE ===\n";
    $stmt = $pdo->query('DESCRIBE proveedores_mantenimiento');
    while ($row = $stmt->fetch()) {
        echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Key'] . ' | ' . $row['Default'] . "\n";
    }
    
    // Check mantenimiento table structure for provider reference
    echo "\n=== MANTENIMIENTO TABLE PROVIDER COLUMNS ===\n";
    $stmt = $pdo->query('DESCRIBE mantenimiento');
    while ($row = $stmt->fetch()) {
        if (strpos($row['Field'], 'proveedor') !== false) {
            echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Key'] . ' | ' . $row['Default'] . "\n";
        }
    }
    
    // Check equipos table for provider reference
    echo "\n=== EQUIPOS TABLE PROVIDER COLUMNS ===\n";
    $stmt = $pdo->query('DESCRIBE equipos');
    while ($row = $stmt->fetch()) {
        if (strpos($row['Field'], 'proveedor') !== false) {
            echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Key'] . ' | ' . $row['Default'] . "\n";
        }
    }
    
    // Check planes_mantenimientos table for provider reference
    echo "\n=== PLANES_MANTENIMIENTOS TABLE PROVIDER COLUMNS ===\n";
    $stmt = $pdo->query('DESCRIBE planes_mantenimientos');
    while ($row = $stmt->fetch()) {
        if (strpos($row['Field'], 'proveedor') !== false) {
            echo $row['Field'] . ' | ' . $row['Type'] . ' | ' . $row['Null'] . ' | ' . $row['Key'] . ' | ' . $row['Default'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>

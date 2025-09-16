<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check all columns in equipos for any provider reference
    echo "=== ALL EQUIPOS COLUMNS ===\n";
    $stmt = $pdo->query('DESCRIBE equipos');
    while ($row = $stmt->fetch()) {
        echo $row['Field'] . "\n";
    }
    
    // Check all columns in planes_mantenimientos for any provider reference
    echo "\n=== ALL PLANES_MANTENIMIENTOS COLUMNS ===\n";
    $stmt = $pdo->query('DESCRIBE planes_mantenimientos');
    while ($row = $stmt->fetch()) {
        echo $row['Field'] . "\n";
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
}
?>

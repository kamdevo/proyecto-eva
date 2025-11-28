<?php

echo "🔄 Actualizando vigencia de mantenimiento a 2024...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Actualizar vigencia a 2024
    $stmt = $pdo->prepare("UPDATE vigencias_mantenimiento SET anio = 2024 WHERE id = 2");
    $stmt->execute();
    
    echo "✅ Vigencia actualizada a 2024\n\n";
    
    // Verificar
    $stmt = $pdo->query("SELECT * FROM vigencias_mantenimiento");
    $vigencia = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "📊 Vigencia actual:\n";
    print_r($vigencia);
    
    // Contar equipos con plan en 2024
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM planes_mantenimientos WHERE anio = 2024");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n📋 Total equipos con plan en 2024: " . $count['total'] . "\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

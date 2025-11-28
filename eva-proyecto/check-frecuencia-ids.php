<?php

echo "🔍 Verificando frecuencia_id de registros recién insertados...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado a BD: $database\n\n";
    
    // Obtener primeros registros del año 2024
    $stmt = $pdo->query("
        SELECT pm.id, pm.equipo_id, pm.mes1, pm.responsable, pm.frecuencia_id, f.name as frecuencia_nombre
        FROM planes_mantenimientos pm
        LEFT JOIN frecuenciam f ON pm.frecuencia_id = f.id
        WHERE pm.anio = 2024
        ORDER BY pm.id DESC
        LIMIT 5
    ");
    
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Últimos 5 registros de 2024:\n";
    echo str_repeat("=", 100) . "\n";
    
    foreach ($records as $rec) {
        echo "ID: " . $rec['id'] . "\n";
        echo "  Equipo ID: " . $rec['equipo_id'] . "\n";
        echo "  Mes1: " . ($rec['mes1'] ?? 'NULL') . "\n";
        echo "  Responsable: " . ($rec['responsable'] ?? 'NULL') . "\n";
        echo "  Frecuencia ID: " . ($rec['frecuencia_id'] ?? 'NULL') . "\n";
        echo "  Frecuencia Nombre: " . ($rec['frecuencia_nombre'] ?? 'NULL') . "\n";
        echo str_repeat("-", 100) . "\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

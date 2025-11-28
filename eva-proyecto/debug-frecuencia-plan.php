<?php

echo "🔍 Debugeando problema de frecuencia en planes...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Ver tabla frecuenciam completa
    echo "📊 Tabla frecuenciam:\n";
    echo str_repeat("=", 80) . "\n";
    $stmt = $pdo->query("SELECT * FROM frecuenciam ORDER BY id");
    $frecuencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($frecuencias as $f) {
        echo "ID: {$f['id']} - Name: {$f['name']}\n";
    }
    
    // Ver algunos planes con sus frecuencia_id
    echo "\n\n📋 Planes de mantenimiento (primeros 10):\n";
    echo str_repeat("=", 80) . "\n";
    $stmt = $pdo->query("
        SELECT 
            pm.equipo_id,
            e.name as equipo_nombre,
            pm.responsable,
            pm.frecuencia_id,
            fm.name as frecuencia_nombre
        FROM planes_mantenimientos pm
        LEFT JOIN equipos e ON e.id = pm.equipo_id
        LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
        WHERE pm.anio = 2024
        ORDER BY pm.equipo_id
        LIMIT 10
    ");
    $planes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($planes as $p) {
        echo "Equipo: {$p['equipo_nombre']} (ID: {$p['equipo_id']})\n";
        echo "  Responsable: {$p['responsable']}\n";
        echo "  Frecuencia ID: {$p['frecuencia_id']}\n";
        echo "  Frecuencia Nombre: {$p['frecuencia_nombre']}\n";
        echo str_repeat("-", 80) . "\n";
    }
    
    // Buscar el equipo específico que muestra "GARANTIA"
    echo "\n\n🔎 Buscando equipo con responsable 'INGENIEROS BIOMEDICOS':\n";
    echo str_repeat("=", 80) . "\n";
    $stmt = $pdo->query("
        SELECT 
            pm.equipo_id,
            e.name as equipo_nombre,
            pm.responsable,
            pm.frecuencia_id,
            fm.name as frecuencia_nombre,
            e.frecuencia_id as equipo_frecuencia_id
        FROM planes_mantenimientos pm
        LEFT JOIN equipos e ON e.id = pm.equipo_id
        LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
        WHERE pm.anio = 2024
        AND pm.responsable LIKE '%INGENIEROS BIOMEDICOS%'
        LIMIT 5
    ");
    $planes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($planes)) {
        foreach ($planes as $p) {
            echo "Equipo: {$p['equipo_nombre']} (ID: {$p['equipo_id']})\n";
            echo "  Responsable: {$p['responsable']}\n";
            echo "  Plan Frecuencia ID: {$p['frecuencia_id']}\n";
            echo "  Plan Frecuencia Nombre: {$p['frecuencia_nombre']}\n";
            echo "  Equipo Frecuencia ID (tabla equipos): {$p['equipo_frecuencia_id']}\n";
            echo str_repeat("-", 80) . "\n";
        }
    } else {
        echo "No se encontraron equipos con ese responsable\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

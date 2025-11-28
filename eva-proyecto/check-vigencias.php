<?php

echo "🔍 Verificando tabla vigencias_mantenimiento...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si existe la tabla
    $stmt = $pdo->query("SHOW TABLES LIKE 'vigencias_mantenimiento'");
    $exists = $stmt->rowCount() > 0;
    
    if ($exists) {
        echo "✅ Tabla vigencias_mantenimiento existe\n\n";
        
        // Ver registros
        $stmt = $pdo->query("SELECT * FROM vigencias_mantenimiento");
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($records)) {
            echo "📊 Registros:\n";
            foreach ($records as $rec) {
                print_r($rec);
            }
        } else {
            echo "⚠️ La tabla está vacía\n";
        }
    } else {
        echo "❌ Tabla vigencias_mantenimiento NO existe\n\n";
        echo "💡 Buscando equipos con planes para 2024:\n";
        
        $stmt = $pdo->query("
            SELECT e.id, e.name, e.code, pm.responsable, fm.name as frecuencia, pm.mes1, pm.anio
            FROM equipos e
            INNER JOIN planes_mantenimientos pm ON pm.equipo_id = e.id
            LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
            WHERE pm.anio = 2024
            LIMIT 5
        ");
        $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Primeros 5 equipos con plan en 2024:\n";
        foreach ($equipos as $eq) {
            echo "  ID: {$eq['id']} - {$eq['name']} ({$eq['code']}) - Responsable: {$eq['responsable']} - Frecuencia: {$eq['frecuencia']}\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

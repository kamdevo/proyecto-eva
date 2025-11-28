<?php

echo "🔧 Corrigiendo frecuencias en planes_mantenimientos existentes...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener todos los planes de 2024
    $stmt = $pdo->query("
        SELECT id, equipo_id, mes1, mes2, mes3, frecuencia_id
        FROM planes_mantenimientos
        WHERE anio = 2024
    ");
    $planes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Total de planes a revisar: " . count($planes) . "\n\n";
    
    $updated = 0;
    $skipped = 0;
    
    foreach ($planes as $plan) {
        // Contar meses programados (no nulos y no vacíos)
        $meses = array_filter([$plan['mes1'], $plan['mes2'], $plan['mes3']], function($m) {
            return !empty($m) && $m !== '0';
        });
        $numMeses = count($meses);
        
        // Calcular la frecuencia correcta basada en número de meses
        // Mapeo correcto según tabla frecuenciam:
        // ID 1: N/R, ID 2: 3 MESES, ID 3: 4 MESES, ID 4: 6 MESES, 
        // ID 5: ANUAL, ID 6: GARANTIA, ID 7: COMODATO, ID 8: 2 MESES
        
        $nuevaFrecuenciaId = null;
        
        if ($numMeses == 1) {
            $nuevaFrecuenciaId = 5; // ANUAL
        } elseif ($numMeses == 2) {
            $nuevaFrecuenciaId = 4; // 6 MESES (SEMESTRAL)
        } elseif ($numMeses == 3) {
            $nuevaFrecuenciaId = 3; // 4 MESES (CUATRIMESTRAL)
        } elseif ($numMeses == 4) {
            $nuevaFrecuenciaId = 2; // 3 MESES (TRIMESTRAL)
        } elseif ($numMeses == 6) {
            $nuevaFrecuenciaId = 8; // 2 MESES (BIMESTRAL)
        } elseif ($numMeses >= 12) {
            $nuevaFrecuenciaId = 1; // N/R (MENSUAL)
        } else {
            $nuevaFrecuenciaId = 1; // N/R (PERSONALIZADO)
        }
        
        // Solo actualizar si cambió
        if ($plan['frecuencia_id'] != $nuevaFrecuenciaId) {
            $updateStmt = $pdo->prepare("
                UPDATE planes_mantenimientos 
                SET frecuencia_id = ? 
                WHERE id = ?
            ");
            $updateStmt->execute([$nuevaFrecuenciaId, $plan['id']]);
            
            $updated++;
            
            if ($updated <= 10) {
                echo "✅ Plan ID {$plan['id']} (Equipo {$plan['equipo_id']}): {$numMeses} mes(es) → Frecuencia ID {$plan['frecuencia_id']} → {$nuevaFrecuenciaId}\n";
            }
        } else {
            $skipped++;
        }
    }
    
    echo "\n" . str_repeat("=", 80) . "\n";
    echo "📊 RESUMEN:\n";
    echo "  ✅ Actualizados: {$updated}\n";
    echo "  ⏭️ Sin cambios: {$skipped}\n";
    echo "  📋 Total procesados: " . count($planes) . "\n";
    
    // Mostrar distribución final de frecuencias
    echo "\n📊 Distribución de frecuencias después de la corrección:\n";
    $stmt = $pdo->query("
        SELECT 
            fm.name as frecuencia,
            COUNT(*) as cantidad
        FROM planes_mantenimientos pm
        LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
        WHERE pm.anio = 2024
        GROUP BY fm.name
        ORDER BY cantidad DESC
    ");
    $distribucion = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($distribucion as $d) {
        echo "  - {$d['frecuencia']}: {$d['cantidad']} equipos\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

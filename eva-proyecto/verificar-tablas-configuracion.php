<?php

try {
    // Configuración directa de la base de datos
    $host = 'localhost';
    $dbname = 'gestionthuv';
    $username = 'root';
    $password = '';
    
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VERIFICACIÓN DE TABLAS DE CONFIGURACIÓN ===\n\n";
    
    // 1. Estados excluidos
    echo "1. ESTADOS EXCLUIDOS (estados_excluidos_guias):\n";
    $stmt = $conn->query("SELECT * FROM estados_excluidos_guias");
    $estados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Total: " . count($estados) . "\n";
    foreach ($estados as $estado) {
        print_r($estado);
    }
    echo "\n";
    
    // 2. Riesgos incluidos
    echo "2. RIESGOS INCLUIDOS (riesgos_incluidos_guias):\n";
    $stmt = $conn->query("SELECT * FROM riesgos_incluidos_guias");
    $riesgos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Total: " . count($riesgos) . "\n";
    foreach ($riesgos as $riesgo) {
        print_r($riesgo);
    }
    echo "\n";
    
    // 3. Equipos excluidos
    echo "3. EQUIPOS EXCLUIDOS (equipos_excluidos_guias):\n";
    $stmt = $conn->query("SELECT * FROM equipos_excluidos_guias");
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "   Total: " . count($equipos) . "\n";
    foreach ($equipos as $equipo) {
        print_r($equipo);
    }
    echo "\n";
    
    // 4. Conteo de equipos biomédicos
    echo "4. EQUIPOS BIOMÉDICOS (tipo_id = 1):\n";
    $stmt = $conn->query("SELECT COUNT(*) as total FROM equipos WHERE tipo_id = 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   Total equipos biomédicos: " . $result['total'] . "\n\n";
    
    // 5. Equipos con guia_id asignado
    echo "5. EQUIPOS CON GUÍA ASIGNADA:\n";
    $stmt = $conn->query("SELECT COUNT(*) as total FROM equipos WHERE tipo_id = 1 AND guia_id IS NOT NULL AND guia_id != 0");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "   Total con guía: " . $result['total'] . "\n\n";
    
    echo "=== PRUEBA DE QUERY COMPLETO ===\n\n";
    
    // Si las tablas están vacías, mostrar todos los biomédicos
    if (count($estados) == 0 && count($riesgos) == 0 && count($equipos) == 0) {
        echo "⚠️  TABLAS DE CONFIGURACIÓN VACÍAS\n";
        echo "   Esto significa que los filtros no aplicarán y el conteo será 0\n";
        echo "   Se deben llenar estas tablas primero.\n\n";
    } else {
        // Query con filtros
        $query = "
            SELECT COUNT(*) as total
            FROM equipos
            WHERE tipo_id = 1
        ";
        
        if (count($estados) > 0) {
            $ids = implode(',', array_column($estados, 'estadoequipo_id'));
            $query .= " AND estadoequipo_id NOT IN ($ids)";
        }
        
        if (count($riesgos) > 0) {
            $ids = implode(',', array_column($riesgos, 'criesgo_id'));
            $query .= " AND criesgo_id IN ($ids)";
        }
        
        if (count($equipos) > 0) {
            $names = "'" . implode("','", array_column($equipos, 'name')) . "'";
            $query .= " AND name NOT IN ($names)";
        }
        
        echo "Query ejecutado:\n$query\n\n";
        
        $stmt = $conn->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Resultado: " . $result['total'] . " equipos cumplen criterios\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

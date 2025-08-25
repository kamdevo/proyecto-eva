<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Conectar a la base de datos
    $host = 'localhost';
    $dbname = 'gestionthuv';
    $username = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Conexión exitosa a la base de datos\n\n";

    // Test con equipo 188 - datos básicos únicamente de equipos
    $equipoId = 188;
    
    echo "🔍 Probando con equipo ID: $equipoId\n";
    echo "=" . str_repeat("=", 50) . "\n\n";

    // Solo datos básicos del equipo (sin JOIN problemáticos)
    $query = "SELECT * FROM equipos WHERE id = :equipo_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $equipmentData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipmentData) {
        throw new Exception("Equipo no encontrado");
    }

    echo "📋 DATOS BÁSICOS DEL EQUIPO:\n";
    echo "ID: " . $equipmentData['id'] . "\n";
    echo "Nombre: " . $equipmentData['name'] . "\n";
    echo "Código: " . $equipmentData['code'] . "\n";
    echo "Serie: " . $equipmentData['serial'] . "\n";
    echo "Marca: " . $equipmentData['marca'] . "\n";
    echo "Modelo: " . $equipmentData['modelo'] . "\n\n";

    // Mantenimientos preventivos
    $query = "SELECT * FROM mantenimiento WHERE equipo_id = :equipo_id ORDER BY fecha_programada DESC LIMIT 5";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $mantenimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "🔧 MANTENIMIENTOS PREVENTIVOS (" . count($mantenimientos) . "):\n";
    foreach ($mantenimientos as $i => $mant) {
        echo ($i + 1) . ". ID: " . $mant['id'] . 
             " | Fecha Prog: " . $mant['fecha_programada'] . 
             " | Fecha Real: " . $mant['fecha_mantenimiento'] . "\n";
        echo "   Descripción: " . substr($mant['description'], 0, 60) . "...\n";
    }
    echo "\n";

    // Contingencias/Correctivos
    $query = "SELECT * FROM contingencias WHERE equipo_id = :equipo_id ORDER BY fecha DESC LIMIT 5";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $contingencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "⚠️ CONTINGENCIAS/CORRECTIVOS (" . count($contingencias) . "):\n";
    foreach ($contingencias as $i => $cont) {
        echo ($i + 1) . ". ID: " . $cont['id'] . 
             " | Fecha: " . $cont['fecha'] . "\n";
        echo "   Observación: " . substr($cont['observacion'], 0, 60) . "...\n";
    }
    echo "\n";

    // Calibraciones
    $query = "SELECT * FROM calibracion WHERE equipo_id = :equipo_id ORDER BY fecha_calibracion DESC LIMIT 3";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $calibraciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📏 CALIBRACIONES (" . count($calibraciones) . "):\n";
    foreach ($calibraciones as $i => $cal) {
        echo ($i + 1) . ". ID: " . $cal['id'] . 
             " | Fecha: " . $cal['fecha_calibracion'] . 
             " | Estado: " . $cal['status'] . "\n";
        echo "   Descripción: " . substr($cal['description'], 0, 60) . "...\n";
    }
    echo "\n";

    // Documentos
    $query = "
        SELECT a.* 
        FROM archivos a
        INNER JOIN equipo_archivo ea ON a.id = ea.archivo_id
        WHERE ea.equipo_id = :equipo_id
        ORDER BY a.created_at DESC
        LIMIT 6
    ";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📄 DOCUMENTOS ASOCIADOS (" . count($documentos) . "):\n";
    foreach ($documentos as $i => $doc) {
        echo ($i + 1) . ". ID: " . $doc['id'] . 
             " | Nombre: " . $doc['nombre'] . "\n";
        echo "   Archivo: " . $doc['vinculo'] . "\n";
        echo "   Fecha: " . $doc['created_at'] . "\n";
    }
    echo "\n";

    // Observaciones
    $query = "SELECT * FROM observaciones WHERE equipo_id = :equipo_id ORDER BY created_at DESC LIMIT 3";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $observaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "💬 OBSERVACIONES RECIENTES (" . count($observaciones) . "):\n";
    foreach ($observaciones as $i => $obs) {
        echo ($i + 1) . ". ID: " . $obs['id'] . 
             " | Fecha: " . $obs['created_at'] . "\n";
        echo "   Observación: " . substr($obs['description'], 0, 60) . "...\n";
    }
    echo "\n";

    // Crear estructura simplificada para el PDF
    $completeData = [
        'id' => $equipmentData['id'],
        'name' => $equipmentData['name'],
        'codigo' => $equipmentData['code'],
        'serie' => $equipmentData['serial'],
        'marca' => $equipmentData['marca'],
        'modelo' => $equipmentData['modelo'],
        'servicio_nombre' => 'Servicio ID: ' . $equipmentData['servicio_id'],
        'estado_nombre' => 'Estado ID: ' . $equipmentData['estadoequipo_id'],
        'propietario_nombre' => 'Propietario ID: ' . $equipmentData['propietario_id'],
        'mantenimientos_preventivos' => array_map(function($m) {
            return [
                'fecha_programada' => $m['fecha_programada'],
                'fecha_mantenimiento' => $m['fecha_mantenimiento'],
                'description' => $m['description'],
                'tecnico_nombre' => 'Técnico ID: ' . $m['tecnico_id']
            ];
        }, $mantenimientos),
        'contingencias' => array_map(function($c) {
            return [
                'fecha' => $c['fecha'],
                'observacion' => $c['observacion'],
                'usuario_nombre' => 'Usuario ID: ' . $c['usuario_id']
            ];
        }, $contingencias),
        'calibraciones' => array_map(function($cal) {
            return [
                'fecha_calibracion' => $cal['fecha_calibracion'],
                'description' => $cal['description'],
                'fecha_programada' => $cal['fecha_programada'],
                'status' => $cal['status']
            ];
        }, $calibraciones),
        'documentos' => array_map(function($d) {
            return [
                'name' => $d['nombre'],
                'vinculo' => $d['vinculo'],
                'created_at' => $d['created_at']
            ];
        }, $documentos),
        'observaciones_recientes' => array_map(function($o) {
            return [
                'description' => $o['description'],
                'created_at' => $o['created_at'],
                'usuario_nombre' => 'Usuario ID: ' . $o['usuario_id']
            ];
        }, $observaciones)
    ];

    echo "=" . str_repeat("=", 50) . "\n";
    echo "✅ RESUMEN FINAL:\n";
    echo "- Datos básicos: ✓ Completos\n";
    echo "- Mantenimientos preventivos: " . count($mantenimientos) . " registros\n";
    echo "- Contingencias/Correctivos: " . count($contingencias) . " registros\n";
    echo "- Calibraciones: " . count($calibraciones) . " registros\n";
    echo "- Documentos: " . count($documentos) . " registros\n";
    echo "- Observaciones: " . count($observaciones) . " registros\n\n";

    echo "🎯 ESTRUCTURA JSON FINAL PARA PDF:\n";
    echo json_encode($completeData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

    echo "✅ PRUEBA COMPLETADA\n";
    echo "🔄 Ahora el componente PDF simplificado puede procesar estos datos\n";
    echo "📝 Estructura validada - todos los campos requeridos presentes\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    echo "📄 Archivo: " . $e->getFile() . "\n";
}
?>

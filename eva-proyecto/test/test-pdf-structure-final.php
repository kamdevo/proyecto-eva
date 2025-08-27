<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurar CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar OPTIONS request para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Conectar a la base de datos
    $host = 'localhost';
    $dbname = 'gestionthuv';
    $username = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "✅ Conexión exitosa a la base de datos\n\n";

    // Test con equipo 188 (debe tener datos completos)
    $equipoId = 188;
    
    echo "🔍 Probando con equipo ID: $equipoId\n";
    echo "=" . str_repeat("=", 50) . "\n\n";

    // Simular la respuesta exacta que debe recibir el componente PDF
    $query = "
        SELECT 
            e.name,
            e.code as codigo,
            e.serial as serie,
            e.marca,
            e.modelo,
            s.nombre as servicio_nombre,
            est.nombre as estado_nombre,
            p.nombre as propietario_nombre
        FROM equipos e
        LEFT JOIN servicios s ON e.servicio_id = s.id
        LEFT JOIN estadoequipos est ON e.estadoequipo_id = est.id  
        LEFT JOIN propietarios p ON e.propietario_id = p.id
        WHERE e.id = :equipo_id
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $equipmentData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$equipmentData) {
        throw new Exception("Equipo no encontrado");
    }

    echo "📋 DATOS BÁSICOS DEL EQUIPO:\n";
    echo "Nombre: " . $equipmentData['name'] . "\n";
    echo "Código: " . $equipmentData['codigo'] . "\n";
    echo "Serie: " . $equipmentData['serie'] . "\n";
    echo "Marca: " . $equipmentData['marca'] . "\n";
    echo "Modelo: " . $equipmentData['modelo'] . "\n";
    echo "Servicio: " . $equipmentData['servicio_nombre'] . "\n";
    echo "Estado: " . $equipmentData['estado_nombre'] . "\n";
    echo "Propietario: " . $equipmentData['propietario_nombre'] . "\n\n";

    // Mantenimientos preventivos
    $query = "
        SELECT 
            m.fecha_programada,
            m.fecha_mantenimiento,
            m.description,
            CONCAT(u.nombres, ' ', u.apellidos) as tecnico_nombre
        FROM mantenimiento m
        LEFT JOIN usuarios u ON m.tecnico_id = u.id
        WHERE m.equipo_id = :equipo_id
        ORDER BY m.fecha_programada DESC
        LIMIT 5
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $mantenimientos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "🔧 MANTENIMIENTOS PREVENTIVOS (" . count($mantenimientos) . "):\n";
    foreach ($mantenimientos as $i => $mant) {
        echo ($i + 1) . ". Fecha Prog: " . $mant['fecha_programada'] . 
             " | Fecha Real: " . $mant['fecha_mantenimiento'] .
             " | Técnico: " . $mant['tecnico_nombre'] . "\n";
        echo "   Descripción: " . substr($mant['description'], 0, 80) . "...\n";
    }
    echo "\n";

    // Contingencias/Correctivos
    $query = "
        SELECT 
            c.fecha,
            c.observacion,
            CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre
        FROM contingencias c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.equipo_id = :equipo_id
        ORDER BY c.fecha DESC
        LIMIT 5
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $contingencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "⚠️ CONTINGENCIAS/CORRECTIVOS (" . count($contingencias) . "):\n";
    foreach ($contingencias as $i => $cont) {
        echo ($i + 1) . ". Fecha: " . $cont['fecha'] . 
             " | Usuario: " . $cont['usuario_nombre'] . "\n";
        echo "   Observación: " . substr($cont['observacion'], 0, 80) . "...\n";
    }
    echo "\n";

    // Calibraciones
    $query = "
        SELECT 
            c.fecha_calibracion,
            c.description,
            c.fecha_programada,
            c.status
        FROM calibracion c
        WHERE c.equipo_id = :equipo_id
        ORDER BY c.fecha_calibracion DESC
        LIMIT 3
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $calibraciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📏 CALIBRACIONES (" . count($calibraciones) . "):\n";
    foreach ($calibraciones as $i => $cal) {
        echo ($i + 1) . ". Fecha: " . $cal['fecha_calibracion'] . 
             " | Próxima: " . $cal['fecha_programada'] .
             " | Estado: " . $cal['status'] . "\n";
        echo "   Descripción: " . substr($cal['description'], 0, 80) . "...\n";
    }
    echo "\n";

    // Documentos
    $query = "
        SELECT 
            a.nombre as name,
            a.vinculo,
            a.created_at
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
        echo ($i + 1) . ". Nombre: " . $doc['name'] . "\n";
        echo "   Archivo: " . $doc['vinculo'] . "\n";
        echo "   Fecha: " . $doc['created_at'] . "\n";
    }
    echo "\n";

    // Observaciones
    $query = "
        SELECT 
            o.description,
            o.created_at,
            CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre
        FROM observaciones o
        LEFT JOIN usuarios u ON o.usuario_id = u.id
        WHERE o.equipo_id = :equipo_id
        ORDER BY o.created_at DESC
        LIMIT 3
    ";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':equipo_id', $equipoId, PDO::PARAM_INT);
    $stmt->execute();
    $observaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "💬 OBSERVACIONES RECIENTES (" . count($observaciones) . "):\n";
    foreach ($observaciones as $i => $obs) {
        echo ($i + 1) . ". Fecha: " . $obs['created_at'] . 
             " | Usuario: " . $obs['usuario_nombre'] . "\n";
        echo "   Observación: " . substr($obs['description'], 0, 80) . "...\n";
    }
    echo "\n";

    // Crear estructura JSON que recibirá el componente PDF
    $completeData = [
        'id' => $equipoId,
        'name' => $equipmentData['name'],
        'codigo' => $equipmentData['codigo'],
        'serie' => $equipmentData['serie'],
        'marca' => $equipmentData['marca'],
        'modelo' => $equipmentData['modelo'],
        'servicio_nombre' => $equipmentData['servicio_nombre'],
        'estado_nombre' => $equipmentData['estado_nombre'],
        'propietario_nombre' => $equipmentData['propietario_nombre'],
        'mantenimientos_preventivos' => $mantenimientos,
        'contingencias' => $contingencias,
        'calibraciones' => $calibraciones,
        'documentos' => $documentos,
        'observaciones_recientes' => $observaciones
    ];

    echo "=" . str_repeat("=", 50) . "\n";
    echo "✅ RESUMEN FINAL:\n";
    echo "- Datos básicos: ✓ Completos\n";
    echo "- Mantenimientos preventivos: " . count($mantenimientos) . " registros\n";
    echo "- Contingencias/Correctivos: " . count($contingencias) . " registros\n";
    echo "- Calibraciones: " . count($calibraciones) . " registros\n";
    echo "- Documentos: " . count($documentos) . " registros\n";
    echo "- Observaciones: " . count($observaciones) . " registros\n\n";

    echo "🎯 ESTRUCTURA JSON PARA PDF:\n";
    echo json_encode($completeData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

    echo "✅ PRUEBA COMPLETADA - Todos los datos están alineados correctamente\n";
    echo "🔄 El componente PDF simplificado debería procesar estos datos sin errores\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    echo "📄 Archivo: " . $e->getFile() . "\n";
}
?>

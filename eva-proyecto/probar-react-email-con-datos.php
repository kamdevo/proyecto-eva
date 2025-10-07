<?php
echo "🧪 PRUEBA REACT EMAIL CON DATOS REALES\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    // Conectar a BD para obtener datos reales
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "1️⃣ OBTENIENDO TICKET REAL DE LA BD...\n";
    
    // Obtener ticket con datos completos (el que creamos antes)
    $ticketId = 13464;
    
    $stmt = $pdo->prepare("
        SELECT 
            o.id,
            o.descripcion,
            o.asunto,
            o.fecha_inicio,
            o.prioridad,
            u.nombre as reportante_nombre,
            eq.name as equipo_nombre,
            eq.code as equipo_codigo,
            eq.marca as equipo_marca,
            eq.modelo as equipo_modelo,
            eq.serial as equipo_serie,
            s.name as servicio_nombre,
            a.name as area_nombre
        FROM ordenes o
        LEFT JOIN usuarios u ON o.reportante_id = u.id
        LEFT JOIN equipos eq ON o.equipo_id = eq.id
        LEFT JOIN servicios s ON eq.servicio_id = s.id
        LEFT JOIN areas a ON eq.area_id = a.id
        WHERE o.id = ?
    ");
    
    $stmt->execute([$ticketId]);
    $ticketReal = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$ticketReal) {
        throw new Exception("Ticket no encontrado");
    }

    echo "✅ Ticket encontrado:\n";
    echo "   📋 ID: {$ticketReal['id']}\n";
    echo "   📝 Descripción: {$ticketReal['descripcion']}\n";
    echo "   👤 Reportante: {$ticketReal['reportante_nombre']}\n";
    echo "   ⚕️ Equipo: {$ticketReal['equipo_nombre']}\n\n";

    echo "2️⃣ PREPARANDO DATOS PARA REACT EMAIL...\n";
    
    // Estructura de datos exacta que espera ReactEmailService
    $datosEmail = [
        'ticket' => [
            'id' => (int)$ticketReal['id'],
            'descripcion' => $ticketReal['descripcion'],
            'fecha_inicio' => $ticketReal['fecha_inicio'],
            'prioridad' => $ticketReal['prioridad'] === 'alta' ? 3 : ($ticketReal['prioridad'] === 'media' ? 2 : 1),
            'servicio_nombre' => $ticketReal['servicio_nombre'],
            'area_nombre' => $ticketReal['area_nombre'],
            'equipo_id' => (int)$ticketReal['id'],
            'equipo_nombre' => $ticketReal['equipo_nombre'],
            'equipo_marca' => $ticketReal['equipo_marca'],
            'equipo_modelo' => $ticketReal['equipo_modelo'],
            'equipo_codigo' => $ticketReal['equipo_codigo'],
            'equipo_serie' => $ticketReal['equipo_serie'],
            'reportante_nombre' => $ticketReal['reportante_nombre']
        ]
    ];

    echo "📊 Datos estructurados:\n";
    echo json_encode($datosEmail, JSON_PRETTY_PRINT) . "\n\n";

    echo "3️⃣ EJECUTANDO REACT EMAIL CON DATOS REALES...\n";
    
    // Crear archivo temporal con datos
    $emailsPath = 'C:/Users/Soporte/Desktop/Proyectos HUV/proyecto-eva/eva-proyecto/emails';
    $dataFile = $emailsPath . '/data_test.json';
    file_put_contents($dataFile, json_encode($datosEmail, JSON_PRETTY_PRINT));
    
    echo "💾 Datos guardados en: $dataFile\n";

    // Ejecutar comando React Email
    $command = "cd \"$emailsPath\" && node render-email.js nuevo-ticket data_test.json";
    echo "🚀 Ejecutando: $command\n\n";

    // Capturar salida
    ob_start();
    $return_var = null;
    $output = [];
    exec($command . ' 2>&1', $output, $return_var);
    $resultado = implode("\n", $output);
    ob_end_clean();

    // Limpiar archivo temporal
    if (file_exists($dataFile)) {
        unlink($dataFile);
    }

    if ($return_var === 0) {
        echo "✅ REACT EMAIL EJECUTADO EXITOSAMENTE!\n";
        echo "📄 HTML generado: " . strlen($resultado) . " caracteres\n";
        echo "🎨 Incluye diseño Hospital Universitario del Valle: " . 
             (strpos($resultado, '#70bbd9') !== false ? 'SÍ' : 'NO') . "\n";
        echo "📋 Incluye datos reales del ticket: " . 
             (strpos($resultado, $ticketReal['descripcion']) !== false ? 'SÍ' : 'NO') . "\n";
        echo "👤 Incluye nombre del reportante: " . 
             (strpos($resultado, $ticketReal['reportante_nombre']) !== false ? 'SÍ' : 'NO') . "\n\n";

        // Mostrar una muestra del HTML (primeros 500 caracteres)
        echo "📝 MUESTRA DEL HTML GENERADO:\n";
        echo substr($resultado, 0, 500) . "...\n\n";

    } else {
        echo "❌ ERROR AL EJECUTAR REACT EMAIL:\n";
        echo $resultado . "\n\n";
    }

    echo "4️⃣ PROBANDO ENVÍO REAL CON EL ENDPOINT...\n";
    
    // Probar el endpoint completo
    $url = 'http://localhost:8001/api/v1/notifications/nuevo-ticket';
    $postData = json_encode(['ticket_id' => $ticketId]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            'content' => $postData,
            'timeout' => 30
        ]
    ]);

    echo "🔗 Probando endpoint: $url\n";
    echo "📦 Con ticket ID: $ticketId\n\n";

    $response = file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        echo "✅ RESPUESTA DEL ENDPOINT:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
        
        if (isset($data['success']) && $data['success']) {
            echo "🎉 CORREO CON DATOS REALES ENVIADO EXITOSAMENTE!\n";
            echo "📨 Enviado a: {$data['enviados']} técnicos\n";
        }
    } else {
        echo "❌ Error en el endpoint\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏥 FIN DE LA PRUEBA\n";

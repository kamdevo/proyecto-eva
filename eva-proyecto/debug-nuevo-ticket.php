<?php
echo "🔍 DEBUG ENDPOINT NUEVO-TICKET\n";
echo "=" . str_repeat("=", 40) . "\n\n";

try {
    // Conectar directamente a BD para simular la consulta
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $ticketId = 13464;
    
    echo "🎯 Probando consulta SQL para ticket ID: $ticketId\n\n";

    // Simular la consulta exacta del endpoint
    $stmt = $pdo->prepare("
        SELECT 
            ordenes.*,
            equipos.name as equipo_nombre,
            equipos.code as equipo_codigo,
            equipos.marca as equipo_marca,
            equipos.modelo as equipo_modelo,
            equipos.serial as equipo_serie,
            servicios.name as servicio_nombre,
            areas.name as area_nombre,
            sedes.name as sede_nombre,
            usuarios.nombre as reportante_nombre
        FROM ordenes
        LEFT JOIN equipos ON ordenes.equipo_id = equipos.id
        LEFT JOIN servicios ON equipos.servicio_id = servicios.id
        LEFT JOIN areas ON equipos.area_id = areas.id
        LEFT JOIN sedes ON servicios.sede_id = sedes.id
        LEFT JOIN usuarios ON ordenes.reportante_id = usuarios.id
        WHERE ordenes.id = ?
    ");
    
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_OBJ);

    if ($ticket) {
        echo "✅ Ticket encontrado:\n";
        echo "   📋 ID: {$ticket->id}\n";
        echo "   📝 Descripción: {$ticket->descripcion}\n";
        echo "   👤 Reportante: {$ticket->reportante_nombre}\n";
        echo "   ⚕️ Equipo: {$ticket->equipo_nombre}\n";
        echo "   🏢 Servicio: {$ticket->servicio_nombre}\n";
        echo "   📋 Área: {$ticket->area_nombre}\n";
        echo "   📍 Sede: {$ticket->sede_nombre}\n\n";
    } else {
        echo "❌ Ticket no encontrado\n\n";
        exit;
    }

    // Verificar técnicos con email
    echo "🔍 Buscando técnicos con email...\n";
    $stmt = $pdo->prepare("
        SELECT id, nombre, email, rol_id 
        FROM usuarios 
        WHERE rol_id IN (2, 3) 
        AND email IS NOT NULL 
        AND email != ''
        LIMIT 5
    ");
    $stmt->execute();
    $tecnicos = $stmt->fetchAll(PDO::FETCH_OBJ);

    echo "👥 Técnicos encontrados: " . count($tecnicos) . "\n";
    foreach ($tecnicos as $tecnico) {
        echo "   • {$tecnico->nombre} ({$tecnico->email}) - Rol: {$tecnico->rol_id}\n";
    }
    echo "\n";

    // Ahora probar el endpoint con datos válidos
    echo "📧 PROBANDO ENDPOINT CON DATOS VÁLIDOS...\n";
    
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
            'timeout' => 60
        ]
    ]);

    echo "🔗 URL: $url\n";
    echo "📦 Data: $postData\n\n";

    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false) {
        echo "✅ RESPUESTA DEL SERVIDOR:\n";
        echo $response . "\n\n";
    } else {
        echo "❌ ERROR EN EL SERVIDOR:\n";
        if (isset($http_response_header)) {
            foreach ($http_response_header as $header) {
                echo "   $header\n";
            }
        }
        
        // Intentar obtener más detalles del error
        $error = error_get_last();
        if ($error) {
            echo "\n💬 Último error PHP:\n";
            echo "   Mensaje: {$error['message']}\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

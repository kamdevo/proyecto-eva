<?php
echo "📧 PRUEBA DE ENDPOINT SIMPLE - NUEVO TICKET\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $ticketId = 13464;
    
    $url = 'http://localhost:8001/api/v1/notifications/nuevo-ticket-simple';
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

    echo "🔗 URL: $url\n";
    echo "📦 Data: $postData\n\n";

    $response = file_get_contents($url, false, $context);
    
    if ($response !== false) {
        echo "✅ RESPUESTA DEL SERVIDOR:\n";
        $data = json_decode($response, true);
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
        
        if (isset($data['success']) && $data['success']) {
            echo "🎉 CORREO SIMPLE ENVIADO EXITOSAMENTE!\n";
        } else {
            echo "⚠️ Error en el envío: " . $data['message'] . "\n";
        }
    } else {
        echo "❌ ERROR EN LA PETICIÓN\n";
        if (isset($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (strpos($header, 'HTTP/') === 0) {
                    echo "   Status: $header\n";
                }
            }
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

<?php
/**
 * Script para probar envío de correo automático al crear ticket
 */

echo "📧 PRUEBA DE ENVÍO DE CORREO - NUEVO TICKET\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    // Datos del ticket recién creado (ID 13464)
    $ticketId = 13464;
    
    echo "📬 Probando endpoint de notificación de nuevo ticket...\n";
    echo "🎯 Ticket ID: $ticketId\n\n";

    // Preparar datos para el endpoint
    $postData = json_encode([
        'ticket_id' => $ticketId,
        'test' => true
    ]);

    // Configurar contexto para POST request
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

    // URL del endpoint según las memorias
    $url = 'http://localhost:8001/api/v1/notifications/nuevo-ticket';
    
    echo "🔗 Llamando endpoint: $url\n";
    echo "📦 Datos enviados: $postData\n\n";

    // Hacer la petición
    $response = file_get_contents($url, false, $context);

    if ($response !== false) {
        $responseData = json_decode($response, true);
        
        echo "✅ Respuesta del servidor:\n";
        echo "📄 Status: " . (isset($http_response_header[0]) ? $http_response_header[0] : 'Unknown') . "\n";
        echo "📧 Respuesta: " . json_encode($responseData, JSON_PRETTY_PRINT) . "\n\n";

        if (isset($responseData['success']) && $responseData['success']) {
            echo "🎉 CORREO ENVIADO EXITOSAMENTE!\n";
            echo "📨 Email enviado para ticket #$ticketId\n";
        } else {
            echo "⚠️ Respuesta del servidor indica fallo\n";
            echo "💬 Mensaje: " . ($responseData['message'] ?? 'Sin mensaje') . "\n";
        }
    } else {
        echo "❌ Error al conectar con el endpoint\n";
        echo "🔍 Verificar que el servidor esté corriendo en puerto 8001\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📧 FIN DE LA PRUEBA DE CORREO\n";

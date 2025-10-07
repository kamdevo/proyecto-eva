<?php
echo "📧 PRUEBA DE ENDPOINT TEST-EMAIL\n";
echo "=" . str_repeat("=", 40) . "\n\n";

try {
    $url = 'http://localhost:8001/api/v1/notifications/test-email';
    
    $postData = json_encode([
        'email' => 'camilomoralesyk@gmail.com'
    ]);

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

    echo "🔗 Probando: $url\n";
    echo "📦 Datos: $postData\n\n";

    $response = file_get_contents($url, false, $context);
    
    if ($response !== false) {
        echo "✅ Respuesta recibida:\n";
        echo $response . "\n";
    } else {
        echo "❌ Error en la petición\n";
        if (isset($http_response_header)) {
            echo "Headers: " . implode("\n", $http_response_header) . "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

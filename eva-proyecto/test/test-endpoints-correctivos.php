<?php
/**
 * Test simple para verificar endpoints de correctivos
 */

echo "🔍 VERIFICANDO ENDPOINTS DE CORRECTIVOS\n";
echo "=======================================\n\n";

$baseUrl = 'http://localhost:8001/api/v1/correctivos-generales';

// Lista de endpoints a verificar
$endpoints = [
    'GET /correctivos-generales' => $baseUrl,
    'GET /correctivos-generales/export-excel' => $baseUrl . '/export-excel',
    'GET /correctivos-generales/export-csv' => $baseUrl . '/export-csv',
    'POST /correctivos-generales/export-custom' => $baseUrl . '/export-custom',
    'POST /correctivos-generales/export' => $baseUrl . '/export',
];

function testEndpoint($url, $method = 'GET') {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['test' => true]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => $httpCode < 400 && empty($error),
        'http_code' => $httpCode,
        'error' => $error,
        'response' => $response
    ];
}

foreach ($endpoints as $name => $url) {
    echo "🔗 Probando: {$name}\n";
    
    $method = strpos($name, 'POST') === 0 ? 'POST' : 'GET';
    $result = testEndpoint($url, $method);
    
    if ($result['success']) {
        echo "   ✅ HTTP {$result['http_code']} - Endpoint disponible\n";
    } else {
        echo "   ❌ HTTP {$result['http_code']} - Error: {$result['error']}\n";
        if ($result['response']) {
            $responseData = json_decode($result['response'], true);
            if ($responseData && isset($responseData['message'])) {
                echo "   📝 Mensaje: {$responseData['message']}\n";
            }
        }
    }
    echo "\n";
}

echo "🎯 ANÁLISIS DE RESULTADOS\n";
echo "=========================\n";
echo "Si algún endpoint muestra HTTP 404, significa que la ruta no está registrada.\n";
echo "Si muestra HTTP 500, hay un error en el código del controlador.\n";
echo "Si muestra HTTP 200/422, el endpoint está funcionando correctamente.\n\n";
?>

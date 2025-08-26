<?php

echo "=== PRUEBA DE EXPORTACIÓN DE ÓRDENES DE COMPRA ===\n\n";

// Test the export endpoint directly
$url = 'http://127.0.0.1:8001/api/v1/ordenes-compra/export/excel';

echo "Probando endpoint: $url\n\n";

// Initialize cURL
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_NOBODY, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "Código HTTP: $httpCode\n";

if ($error) {
    echo "Error cURL: $error\n";
} else {
    // Split headers and body
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    
    // Re-execute to get proper header size
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    
    $response = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    echo "Headers:\n";
    echo $headers . "\n";
    
    echo "Body (primeros 500 caracteres):\n";
    echo substr($body, 0, 500) . "\n";
    
    if ($httpCode == 500) {
        echo "\n=== ANÁLISIS DEL ERROR 500 ===\n";
        // Try to parse JSON error if it's JSON
        $jsonData = json_decode($body, true);
        if ($jsonData) {
            echo "Error JSON detectado:\n";
            print_r($jsonData);
        } else {
            echo "Respuesta no es JSON, mostrando texto completo:\n";
            echo $body . "\n";
        }
    }
}

echo "\n=== FIN DE LA PRUEBA ===\n";

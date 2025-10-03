<?php

/**
 * Script de prueba para endpoint de descarga de plantilla
 */

$url = 'http://localhost:8001/api/v1/planes-mantenimientos/download-template';

echo "🔍 Probando endpoint: $url\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "📊 Código HTTP: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
}

if ($httpCode === 200) {
    echo "✅ Respuesta exitosa\n";
    echo "📦 Tamaño de respuesta: " . strlen($response) . " bytes\n";
    
    // Guardar archivo
    $filename = 'test_plantilla_' . date('Y-m-d_His') . '.xlsx';
    file_put_contents($filename, $response);
    echo "💾 Archivo guardado: $filename\n";
} else {
    echo "❌ Error en la respuesta\n";
    echo "📄 Respuesta:\n";
    echo substr($response, 0, 500) . "\n";
}

echo "\n✅ Prueba completada\n";

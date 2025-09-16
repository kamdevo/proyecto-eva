<?php

// Test del endpoint de descarga de plantilla

echo "=== PROBANDO DESCARGA DE PLANTILLA ===\n";
$url = 'http://127.0.0.1:8001/api/v1/planes-mantenimientos/download-template';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($httpCode === 200) {
    echo "Plantilla descargada exitosamente\n";
    echo "Response length: " . strlen($response) . " bytes\n";
} else {
    echo "Response: " . substr($response, 0, 500) . "\n";
}

echo "\n=== PROBANDO EXPORTACIÓN ===\n";
$url = 'http://127.0.0.1:8001/api/v1/planes-mantenimientos/export?anio=2025&formato=json';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: " . substr($response, 0, 500) . "\n";

?>

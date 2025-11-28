<?php

/**
 * Script de prueba para endpoint de subir Excel
 */

$url = 'http://192.168.2.146:8001/api/v1/planes-mantenimientos/upload-excel';
$filePath = __DIR__ . '/plantillas/INVENTARIO-11.xlsx';

if (!file_exists($filePath)) {
    die("❌ Error: Archivo no encontrado: $filePath\n");
}

echo "📤 Probando endpoint de subir Excel...\n";
echo "URL: $url\n";
echo "Archivo: $filePath\n";
echo "Tamaño: " . filesize($filePath) . " bytes\n\n";

$ch = curl_init();

$postData = [
    'archivo' => new CURLFile($filePath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'INVENTARIO-11.xlsx'),
    'anio' => 2024,
    'reemplazar' => true
];

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

echo "🔄 Enviando request...\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

echo "📊 Resultado:\n";
echo "HTTP Code: $httpCode\n";

if ($curlError) {
    echo "❌ CURL Error: $curlError\n";
}

if ($response) {
    echo "\nRespuesta del servidor:\n";
    $json = json_decode($response, true);
    if ($json) {
        print_r($json);
    } else {
        echo $response . "\n";
    }
}

if ($httpCode == 200) {
    echo "\n✅ ¡SUCCESS! Endpoint funcionando correctamente\n";
} else {
    echo "\n❌ ERROR $httpCode: Revisar logs del backend\n";
}

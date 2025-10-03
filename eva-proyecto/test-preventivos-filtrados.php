<?php

/**
 * Script de prueba para endpoint de exportación de preventivos FILTRADOS
 */

$url = 'http://localhost:8001/api/v1/planes-mantenimientos/export-custom';

echo "🔍 Probando endpoint: $url\n\n";

// Datos de prueba - IDs de preventivos a exportar
$data = [
    'data' => [
        ['id' => 1],
        ['id' => 2],
        ['id' => 3],
        ['id' => 4],
        ['id' => 5]
    ],
    'format' => 'excel',
    'filename' => 'preventivos_FILTRADOS_test'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
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
    $filename = 'test_preventivos_filtrados_' . date('Y-m-d_His') . '.xlsx';
    file_put_contents($filename, $response);
    echo "💾 Archivo guardado: $filename\n";
} else {
    echo "❌ Error en la respuesta\n";
    echo "📄 Respuesta:\n";
    echo substr($response, 0, 500) . "\n";
}

echo "\n✅ Prueba completada\n";

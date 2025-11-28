<?php

echo "🧪 Probando upload HTTP al endpoint...\n\n";

$url = 'http://192.168.2.146:8001/api/v1/planes-mantenimientos/upload-excel';
$filePath = __DIR__ . '/plantillas/INVENTARIO-11.xlsx';

if (!file_exists($filePath)) {
    die("❌ Archivo no encontrado: $filePath\n");
}

// Crear multipart/form-data request
$cfile = new CURLFile($filePath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'INVENTARIO-11.xlsx');

$postData = [
    'archivo' => $cfile,
    'anio' => 2024,
    'reemplazar' => true
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

echo "📤 Enviando solicitud a: $url\n";
echo "📁 Archivo: $filePath\n";
echo "📅 Año: 2024\n";
echo "🔄 Reemplazar: true\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "❌ Error CURL: " . curl_error($ch) . "\n";
} else {
    echo "📊 HTTP Code: $httpCode\n\n";
    
    if ($httpCode === 200) {
        echo "✅ SUCCESS!\n";
        echo "Respuesta:\n";
        echo json_encode(json_decode($response), JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "❌ ERROR $httpCode\n";
        echo "Respuesta:\n";
        echo $response . "\n";
    }
}

curl_close($ch);

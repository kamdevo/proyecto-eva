<?php

echo "=== PROBANDO EXPORTACIÓN EXCEL ===\n";
$url = 'http://127.0.0.1:8001/api/v1/planes-mantenimientos/export?anio=2025&formato=excel';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Content-Type: $contentType\n";

if ($httpCode === 200) {
    echo "Excel generado exitosamente\n";
    echo "Response length: " . strlen($response) . " bytes\n";
    
    // Guardar archivo para verificación
    file_put_contents('test_export.xlsx', $response);
    echo "Archivo guardado como test_export.xlsx\n";
} else {
    echo "Response: " . substr($response, 0, 500) . "\n";
}

?>

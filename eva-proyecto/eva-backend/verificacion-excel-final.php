<?php

echo "=== VERIFICACIÓN FINAL DE EXPORTACIÓN EXCEL ===\n\n";

// URL del endpoint
$url = 'http://127.0.0.1:8001/api/v1/ordenes-compra/export/excel';

// Realizar solicitud
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.ms-excel',
    'User-Agent: Final Test Script'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$responseHeaders = curl_getinfo($ch, CURLINFO_HEADER_OUT);

if (curl_errno($ch)) {
    echo "❌ Error cURL: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

echo "📊 Resultados de la verificación:\n";
echo "   • Código HTTP: $httpCode\n";
echo "   • Content-Type: $contentType\n";
echo "   • Tamaño: " . number_format(strlen($response)) . " bytes\n\n";

// Verificaciones específicas
$checks = [
    'HTTP 200' => $httpCode === 200,
    'Content-Type Excel' => strpos($contentType, 'application/vnd.ms-excel') !== false,
    'Contiene HTML' => strpos($response, '<!DOCTYPE html>') !== false,
    'Contiene tabla' => strpos($response, '<table>') !== false,
    'Headers correctos' => strpos($response, '<th>ID</th>') !== false,
    'Datos de órdenes' => strpos($response, '<td>') !== false,
    'Estructura completa' => strpos($response, '</table>') !== false
];

echo "🔍 Verificaciones de calidad:\n";
foreach ($checks as $check => $passed) {
    $status = $passed ? "✅" : "❌";
    echo "   $status $check\n";
}

if (all_checks_passed($checks)) {
    echo "\n🎉 ¡TODAS LAS VERIFICACIONES PASARON!\n";
    echo "   La exportación Excel está funcionando correctamente.\n";
    
    // Guardar archivo de muestra
    $fileName = 'verificacion_final_' . date('Y-m-d_H-i-s') . '.xls';
    file_put_contents($fileName, $response);
    echo "   💾 Archivo de muestra: $fileName\n";
    
    // Estadísticas adicionales
    $rowCount = substr_count($response, '<tr>') - 1;
    echo "   📈 Registros exportados: $rowCount\n";
    
} else {
    echo "\n⚠️  Algunas verificaciones fallaron.\n";
    echo "   Revise la configuración del servidor.\n";
}

function all_checks_passed($checks) {
    foreach ($checks as $passed) {
        if (!$passed) return false;
    }
    return true;
}

echo "\n=== FIN DE LA VERIFICACIÓN ===\n";

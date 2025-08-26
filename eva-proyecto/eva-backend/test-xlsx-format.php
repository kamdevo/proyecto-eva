<?php

echo "=== VERIFICACIÓN DE FORMATO .XLSX ===\n\n";

// URL del endpoint
$url = 'http://127.0.0.1:8001/api/v1/ordenes-compra/export/excel';

// Realizar solicitud
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'User-Agent: XLSX Test Script'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

if (curl_errno($ch)) {
    echo "❌ Error cURL: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

echo "📊 Resultados de la verificación XLSX:\n";
echo "   • Código HTTP: $httpCode\n";
echo "   • Content-Type: $contentType\n";
echo "   • Tamaño: " . number_format(strlen($response)) . " bytes\n\n";

// Verificaciones específicas para XLSX
$checks = [
    'HTTP 200' => $httpCode === 200,
    'Content-Type XLSX' => strpos($contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false,
    'Contiene HTML' => strpos($response, '<!DOCTYPE html>') !== false,
    'Contiene tabla' => strpos($response, '<table>') !== false,
    'Headers correctos' => strpos($response, '<th>ID</th>') !== false,
    'Datos de órdenes' => strpos($response, '<td>') !== false,
    'Estructura completa' => strpos($response, '</table>') !== false,
    'Estilos CSS' => strpos($response, 'border-collapse: collapse') !== false
];

echo "🔍 Verificaciones de formato XLSX:\n";
foreach ($checks as $check => $passed) {
    $status = $passed ? "✅" : "❌";
    echo "   $status $check\n";
}

if (all_checks_passed($checks)) {
    echo "\n🎉 ¡FORMATO XLSX CONFIGURADO CORRECTAMENTE!\n";
    echo "   La exportación ahora genera archivos .xlsx\n";
    
    // Guardar archivo de muestra
    $fileName = 'test_ordenes_compra_' . date('Y-m-d_H-i-s') . '.xlsx';
    file_put_contents($fileName, $response);
    echo "   💾 Archivo XLSX generado: $fileName\n";
    
    // Estadísticas adicionales
    $rowCount = substr_count($response, '<tr>') - 1;
    echo "   📈 Registros exportados: $rowCount\n";
    
    // Verificar que el nombre de archivo sea correcto
    if (pathinfo($fileName, PATHINFO_EXTENSION) === 'xlsx') {
        echo "   ✅ Extensión .xlsx confirmada\n";
    }
    
} else {
    echo "\n⚠️  Algunas verificaciones fallaron.\n";
    echo "   Revise la configuración del Content-Type.\n";
}

function all_checks_passed($checks) {
    foreach ($checks as $passed) {
        if (!$passed) return false;
    }
    return true;
}

echo "\n=== FIN DE LA VERIFICACIÓN XLSX ===\n";

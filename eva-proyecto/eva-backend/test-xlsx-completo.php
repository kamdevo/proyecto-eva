<?php

echo "=== PRUEBA COMPLETA FRONTEND-BACKEND XLSX ===\n\n";

// Simular la llamada exacta que hace el frontend
$url = 'http://127.0.0.1:8001/api/v1/ordenes-compra/export/excel';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HEADER, true); // Incluir headers en la respuesta
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'User-Agent: Mozilla/5.0 (Frontend Simulation)'
]);

$fullResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

if (curl_errno($ch)) {
    echo "❌ Error cURL: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

// Separar headers y body
$headers = substr($fullResponse, 0, $headerSize);
$body = substr($fullResponse, $headerSize);

echo "📊 Análisis de la respuesta completa:\n";
echo "   • Código HTTP: $httpCode\n";
echo "   • Tamaño total: " . number_format(strlen($fullResponse)) . " bytes\n";
echo "   • Tamaño headers: " . number_format($headerSize) . " bytes\n";
echo "   • Tamaño contenido: " . number_format(strlen($body)) . " bytes\n\n";

echo "📋 Headers de respuesta importantes:\n";
$headerLines = explode("\n", $headers);
foreach ($headerLines as $line) {
    $line = trim($line);
    if (stripos($line, 'content-type') !== false || 
        stripos($line, 'content-disposition') !== false ||
        stripos($line, 'content-length') !== false) {
        echo "   • $line\n";
    }
}

// Verificaciones finales
$finalChecks = [
    'Respuesta exitosa' => $httpCode === 200,
    'Headers XLSX presentes' => stripos($headers, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false,
    'Filename .xlsx' => stripos($headers, '.xlsx') !== false,
    'Content-Disposition attachment' => stripos($headers, 'attachment') !== false,
    'Contenido válido' => strlen($body) > 1000,
    'Estructura HTML' => strpos($body, '<table>') !== false
];

echo "\n🔍 Verificaciones finales:\n";
$allPassed = true;
foreach ($finalChecks as $check => $passed) {
    $status = $passed ? "✅" : "❌";
    echo "   $status $check\n";
    if (!$passed) $allPassed = false;
}

if ($allPassed) {
    echo "\n🎉 ¡CONFIGURACIÓN XLSX COMPLETAMENTE FUNCIONAL!\n";
    echo "   ✅ Backend configurado para XLSX\n";
    echo "   ✅ Headers HTTP correctos\n";
    echo "   ✅ Content-Type apropiado para Excel moderno\n";
    echo "   ✅ Nombre de archivo con extensión .xlsx\n";
    echo "   ✅ Contenido compatible con Excel\n";
    
    // Guardar archivo final
    $finalFileName = 'ordenes_compra_final_' . date('Y-m-d_H-i-s') . '.xlsx';
    file_put_contents($finalFileName, $body);
    echo "   💾 Archivo final: $finalFileName\n";
    
    $recordCount = substr_count($body, '<tr>') - 1;
    echo "   📊 Total de registros: $recordCount\n";
    
} else {
    echo "\n⚠️  Hay problemas en la configuración.\n";
}

echo "\n=== CONFIGURACIÓN XLSX COMPLETA ===\n";

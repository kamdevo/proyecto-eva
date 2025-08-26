<?php

echo "=== PRUEBA DE EXPORTACIÓN DE ÓRDENES DE COMPRA (EXCEL) ===\n\n";

// URL del endpoint
$url = 'http://127.0.0.1:8001/api/v1/ordenes-compra/export/excel';

// Inicializar cURL
$ch = curl_init();

// Configurar cURL
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/vnd.ms-excel',
    'User-Agent: Test Script'
]);

// Ejecutar la solicitud
echo "Realizando solicitud a: $url\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

if (curl_errno($ch)) {
    echo "❌ Error cURL: " . curl_error($ch) . "\n";
    curl_close($ch);
    exit(1);
}

curl_close($ch);

echo "📊 Código HTTP: $httpCode\n";
echo "📄 Content-Type: $contentType\n";
echo "📏 Tamaño de respuesta: " . strlen($response) . " bytes\n\n";

if ($httpCode === 200) {
    echo "✅ Exportación exitosa!\n";
    
    // Guardar el archivo para verificar
    $fileName = 'test_export_ordenes_' . date('Y-m-d_H-i-s') . '.xls';
    file_put_contents($fileName, $response);
    echo "💾 Archivo guardado como: $fileName\n";
    
    // Verificar si el contenido parece ser HTML/Excel
    if (strpos($response, '<table>') !== false) {
        echo "✅ El archivo contiene tabla HTML válida\n";
    }
    
    if (strpos($response, '<th>ID</th>') !== false) {
        echo "✅ Headers de tabla encontrados\n";
    }
    
    // Contar filas de datos aproximadamente
    $rowCount = substr_count($response, '<tr>') - 1; // -1 para excluir header
    echo "📈 Filas de datos aproximadas: $rowCount\n";
    
} else {
    echo "❌ Error en la exportación\n";
    echo "Respuesta: " . substr($response, 0, 500) . "\n";
}

echo "\n=== FIN DE LA PRUEBA ===\n";

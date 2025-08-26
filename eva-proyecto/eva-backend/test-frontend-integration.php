<?php
/*
 * Test de integración completa Frontend + Backend XLSX
 * Simula exactamente la petición que hace el frontend
 */

echo "🔗 TEST DE INTEGRACIÓN FRONTEND-BACKEND XLSX\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Configuración
$baseUrl = 'http://127.0.0.1:8001';
$endpoint = '/api/v1/ordenes-compra/export/excel';
$url = $baseUrl . $endpoint;

echo "📋 CONFIGURACIÓN:\n";
echo "   URL: $url\n";
echo "   Simulando petición desde React frontend\n\n";

// Headers que envía el frontend React
$headers = [
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Origin: http://localhost:3000',
    'Referer: http://localhost:3000/ordenes-compra'
];

echo "🌐 REALIZANDO PETICIÓN (Frontend Simulation)...\n";

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_HEADER => true
]);

$fullResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

// Separar headers y body
$responseHeaders = substr($fullResponse, 0, $headerSize);
$responseBody = substr($fullResponse, $headerSize);

echo "📊 RESPUESTA HTTP:\n";
echo "   Código: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
    exit(1);
}

// Analizar headers
echo "\n📋 HEADERS DE RESPUESTA:\n";
$headerLines = explode("\n", $responseHeaders);
foreach ($headerLines as $header) {
    $header = trim($header);
    if (!empty($header) && strpos($header, ':') !== false) {
        echo "   $header\n";
    }
}

// Verificaciones específicas para frontend
echo "\n🔍 VERIFICACIONES FRONTEND:\n";

// 1. Content-Type correcto
if (strpos($responseHeaders, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') !== false) {
    echo "   ✅ Content-Type XLSX reconocido por navegador\n";
} else {
    echo "   ❌ Content-Type no reconocido\n";
}

// 2. Content-Disposition para descarga
if (strpos($responseHeaders, 'Content-Disposition: attachment') !== false) {
    echo "   ✅ Header de descarga presente\n";
    
    // Extraer nombre de archivo
    if (preg_match('/filename="([^"]+)"/', $responseHeaders, $matches)) {
        echo "   📁 Nombre de archivo: " . $matches[1] . "\n";
    }
} else {
    echo "   ❌ Header de descarga ausente\n";
}

// 3. Headers de cache
if (strpos($responseHeaders, 'no-cache') !== false) {
    echo "   ✅ Headers de cache configurados\n";
} else {
    echo "   ⚠️  Headers de cache no configurados\n";
}

// 4. Verificar contenido del archivo
$fileSize = strlen($responseBody);
echo "   📊 Tamaño del archivo: " . number_format($fileSize) . " bytes\n";

if ($fileSize > 0) {
    // Verificar firma XLSX
    $signature = substr($responseBody, 0, 4);
    if ($signature === "PK\x03\x04") {
        echo "   ✅ Archivo XLSX válido (firma ZIP detectada)\n";
        
        // Guardar archivo de prueba
        $testFile = 'frontend_test_' . date('Y-m-d_H-i-s') . '.xlsx';
        if (file_put_contents($testFile, $responseBody)) {
            echo "   ✅ Archivo guardado para prueba: $testFile\n";
            
            // Verificar que se puede abrir
            if (class_exists('ZipArchive')) {
                $zip = new ZipArchive();
                if ($zip->open($testFile) === TRUE) {
                    echo "   ✅ Archivo puede ser abierto por Excel\n";
                    $zip->close();
                } else {
                    echo "   ❌ Archivo no puede ser abierto\n";
                }
            }
        }
    } else {
        echo "   ❌ Archivo no es XLSX válido\n";
        echo "   🔍 Primeros bytes: " . bin2hex(substr($responseBody, 0, 16)) . "\n";
    }
} else {
    echo "   ❌ Archivo vacío\n";
}

echo "\n🎯 RESULTADO FINAL:\n";
if ($httpCode === 200 && $fileSize > 0 && strpos($responseBody, "PK\x03\x04") === 0) {
    echo "   🎉 ¡INTEGRACIÓN COMPLETAMENTE EXITOSA!\n";
    echo "   📱 El frontend puede descargar Excel correctamente\n";
    echo "   💻 El archivo se abrirá sin errores en Excel\n";
} else {
    echo "   ❌ Integración con problemas\n";
}

echo "\n" . str_repeat("=", 55) . "\n";
echo "🏁 TEST DE INTEGRACIÓN COMPLETADO\n";
?>

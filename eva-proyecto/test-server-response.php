<?php
/**
 * Script para probar respuesta del servidor Laravel
 */

echo "🌐 PROBANDO RESPUESTA DEL SERVIDOR\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

// 1. Probar endpoint básico
echo "1️⃣ PROBANDO ENDPOINT BÁSICO:\n";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'timeout' => 10,
        'ignore_errors' => true
    ]
]);

$response = file_get_contents($baseUrl, false, $context);

if ($response !== false) {
    echo "✅ Servidor responde en $baseUrl\n";
    echo "📄 Respuesta (primeros 200 chars): " . substr($response, 0, 200) . "...\n";
} else {
    echo "❌ Servidor no responde en $baseUrl\n";
    
    if (isset($http_response_header)) {
        echo "Headers:\n";
        foreach ($http_response_header as $header) {
            echo "   $header\n";
        }
    }
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// 2. Probar endpoint CSRF
echo "2️⃣ PROBANDO ENDPOINT CSRF:\n";

$csrfUrl = $baseUrl . '/sanctum/csrf-cookie';
$response = file_get_contents($csrfUrl, false, $context);

if ($response !== false) {
    echo "✅ Endpoint CSRF responde\n";
} else {
    echo "❌ Endpoint CSRF falla\n";
    
    if (isset($http_response_header)) {
        echo "Status: " . $http_response_header[0] . "\n";
        
        // Si es 500, hay un error interno
        if (strpos($http_response_header[0], '500') !== false) {
            echo "🔍 Error 500 detectado - problema interno del servidor\n";
        }
    }
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// 3. Probar endpoint de API simple
echo "3️⃣ PROBANDO ENDPOINT DE API:\n";

$apiUrl = $baseUrl . '/api/v1/health';
$response = file_get_contents($apiUrl, false, $context);

if ($response !== false) {
    echo "✅ API responde\n";
    echo "📄 Respuesta: $response\n";
} else {
    echo "❌ API no responde\n";
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// 4. Probar con cURL para más detalles
echo "4️⃣ PROBANDO CON CURL:\n";

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $csrfUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($error) {
        echo "❌ Error cURL: $error\n";
    } else {
        echo "✅ cURL exitoso\n";
        
        if ($httpCode == 500) {
            echo "🔍 Error 500 - Revisando logs...\n";
            
            // Intentar leer logs de Laravel
            $logFile = 'storage/logs/laravel.log';
            if (file_exists($logFile)) {
                $logs = file_get_contents($logFile);
                $recentLogs = substr($logs, -2000); // Últimos 2000 caracteres
                echo "📋 Logs recientes:\n";
                echo $recentLogs . "\n";
            } else {
                echo "⚠️ No se encontró archivo de logs\n";
            }
        }
        
        echo "📄 Headers de respuesta:\n";
        $headers = explode("\n", $response);
        foreach (array_slice($headers, 0, 10) as $header) {
            if (trim($header)) {
                echo "   " . trim($header) . "\n";
            }
        }
    }
} else {
    echo "❌ cURL no disponible\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 DIAGNÓSTICO:\n\n";

if ($httpCode == 200) {
    echo "✅ Servidor funcionando correctamente\n";
} else if ($httpCode == 500) {
    echo "❌ Error interno del servidor (500)\n";
    echo "💡 Posibles causas:\n";
    echo "   - Error en configuración de Sanctum\n";
    echo "   - Problema con sesiones\n";
    echo "   - Error en middleware\n";
    echo "   - Problema con base de datos\n";
} else {
    echo "⚠️ Código de respuesta inesperado: $httpCode\n";
}

echo "\n🔧 ACCIONES RECOMENDADAS:\n";
echo "1. Limpiar cache: php artisan config:clear\n";
echo "2. Limpiar cache: php artisan cache:clear\n";
echo "3. Revisar logs: storage/logs/laravel.log\n";
echo "4. Reiniciar servidor: php artisan serve\n";

?>

<?php

echo "🧪 PROBANDO ENDPOINT DE MANUALES\n";
echo "=================================\n\n";

// Probar el endpoint GET /api/v1/manuales
$url = 'http://192.168.2.146:8001/api/v1/manuales?page=1&per_page=10';

echo "📡 Probando: $url\n\n";

// Configurar contexto para la petición HTTP
$context = stream_context_create([
    'http' => [
        'timeout' => 30,
        'method' => 'GET',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ]
    ]
]);

try {
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ ERROR: No se pudo obtener respuesta del servidor\n";
        
        // Verificar headers de respuesta
        if (isset($http_response_header)) {
            echo "\n📋 Headers de respuesta:\n";
            foreach ($http_response_header as $header) {
                echo "   $header\n";
            }
        }
    } else {
        echo "✅ RESPUESTA OBTENIDA:\n";
        echo "Tamaño: " . strlen($response) . " bytes\n\n";
        
        // Intentar decodificar JSON
        $data = json_decode($response, true);
        
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "📊 DATOS JSON VÁLIDOS:\n";
            echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            echo "Message: " . ($data['message'] ?? 'N/A') . "\n";
            
            if (isset($data['data'])) {
                if (isset($data['data']['total'])) {
                    echo "Total registros: " . $data['data']['total'] . "\n";
                }
                if (isset($data['data']['data'])) {
                    echo "Registros en página: " . count($data['data']['data']) . "\n";
                    
                    // Mostrar primeros 3 registros
                    echo "\n📋 PRIMEROS MANUALES:\n";
                    foreach (array_slice($data['data']['data'], 0, 3) as $manual) {
                        echo "  ID: " . $manual['id'] . "\n";
                        echo "  Descripción: " . substr($manual['descripcion'], 0, 50) . "...\n";
                        echo "  URL: " . substr($manual['url'], 0, 50) . "...\n";
                        echo "  Status: " . $manual['status'] . "\n";
                        echo "  ---\n";
                    }
                }
            }
        } else {
            echo "❌ ERROR: Respuesta no es JSON válido\n";
            echo "JSON Error: " . json_last_error_msg() . "\n\n";
            echo "📄 CONTENIDO DE RESPUESTA:\n";
            echo substr($response, 0, 500) . "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ EXCEPCIÓN: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🔍 DIAGNÓSTICO:\n\n";

// Probar si el servidor está corriendo
echo "1. ¿Está el backend corriendo en puerto 8001?\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://192.168.2.146:8001");
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200 || $httpCode == 404) {
    echo "   ✅ Servidor responde en puerto 8001\n";
} else {
    echo "   ❌ Servidor NO responde en puerto 8001 (código: $httpCode)\n";
}

echo "\n2. Probando endpoint específico...\n";
$testUrl = 'http://192.168.2.146:8001/api/v1/equipos'; // Endpoint que sabemos funciona
$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, $testUrl);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 10);
$testResponse = curl_exec($ch2);
$testHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
curl_close($ch2);

echo "   Probando: $testUrl\n";
echo "   Código HTTP: $testHttpCode\n";

if ($testHttpCode == 200) {
    echo "   ✅ El prefijo /api/v1/ funciona correctamente\n";
} else {
    echo "   ❌ Problema con rutas /api/v1/\n";
}

echo "\n🎯 CONCLUSIÓN:\n";
if ($testHttpCode == 200) {
    echo "   El servidor Laravel está funcionando.\n";
    echo "   Verificar que el endpoint de manuales esté en el grupo correcto.\n";
} else {
    echo "   Problema general con el servidor Laravel en puerto 8001.\n";
}

<?php

echo "🧪 PROBANDO ENDPOINTS FUNCIONALES\n";
echo "=================================\n\n";

// Endpoints a probar
$endpoints = [
    'medical-devices' => 'http://192.168.2.146:8001/api/v1/equipos/medical-devices-complete',
    'industrial-devices' => 'http://192.168.2.146:8001/api/v1/equipos/industrial-devices-complete',
    'filter-options' => 'http://192.168.2.146:8001/api/v1/equipos/filter-options'
];

foreach ($endpoints as $name => $url) {
    echo "📡 Probando $name: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    curl_close($ch);
    
    echo "   Código HTTP: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "   ✅ FUNCIONA\n";
        $data = json_decode($body, true);
        if ($data && isset($data['success'])) {
            echo "   Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            if (isset($data['data']) && is_array($data['data'])) {
                echo "   Registros: " . count($data['data']) . "\n";
            }
        }
    } else {
        echo "   ❌ FALLA\n";
    }
    echo "\n";
}

echo "🎯 CONCLUSIÓN:\n";
echo "Si algún endpoint funciona, los manuales deben ir en el mismo grupo.\n";

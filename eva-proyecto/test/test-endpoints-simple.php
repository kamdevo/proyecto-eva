<?php

echo "🔍 TESTING ENDPOINTS SIMPLE\n";
echo str_repeat('=', 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

$endpoints = [
    'centros' => $baseUrl . '/centros',
    'ordenes-compra' => $baseUrl . '/ordenes-compra',
    'tipos-compra' => $baseUrl . '/tipos-compra',
    'contacto' => $baseUrl . '/contacto',
    'empresas' => $baseUrl . '/empresas',
    'sedes' => $baseUrl . '/sedes'
];

foreach ($endpoints as $name => $url) {
    echo "Testing $name: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        echo "✅ $name working (HTTP $httpCode)\n";
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success']) {
            $count = is_array($data['data']) ? count($data['data']) : 'N/A';
            echo "   Data count: $count\n";
        }
    } else {
        echo "❌ $name failed (HTTP $httpCode)\n";
        if ($response) {
            $data = json_decode($response, true);
            if (isset($data['message'])) {
                echo "   Error: " . $data['message'] . "\n";
            }
        }
    }
    echo "\n";
}

echo "🏁 ENDPOINT TESTING COMPLETE\n";

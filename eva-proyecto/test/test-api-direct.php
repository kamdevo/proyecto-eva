<?php

// Test the purchase orders API endpoint directly
echo "🔍 TESTING PURCHASE ORDERS API ENDPOINT\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Wait a moment for server to start
sleep(2);

$endpoints = [
    'http://127.0.0.1:8001/api/v1/ordencompra?per_page=5',
    'http://127.0.0.1:8001/api/v1/ordencompra/stats',
    'http://127.0.0.1:8001/api/v1/tipocompra'
];

foreach ($endpoints as $url) {
    echo "Testing: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    echo "HTTP Code: $httpCode\n";

    if ($error) {
        echo "❌ CURL Error: $error\n";
    } elseif ($httpCode === 200) {
        echo "✅ SUCCESS!\n";
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            echo "Response success: " . ($data['success'] ? 'true' : 'false') . "\n";
            if (isset($data['data'])) {
                if (is_array($data['data']) && isset($data['data']['data'])) {
                    echo "Items count: " . count($data['data']['data']) . "\n";
                } elseif (is_array($data['data'])) {
                    echo "Items count: " . count($data['data']) . "\n";
                } else {
                    echo "Data type: " . gettype($data['data']) . "\n";
                }
            }
        } else {
            echo "Response preview: " . substr($response, 0, 200) . "...\n";
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        echo "Response: " . substr($response, 0, 200) . "\n";
    }
    
    echo str_repeat("-", 50) . "\n\n";
}

echo "🎯 FRONTEND INTEGRATION TEST:\n";
echo "If all endpoints return 200, the frontend should work!\n";
echo "Frontend URL should be: http://127.0.0.1:8001/api/v1/ordencompra\n";

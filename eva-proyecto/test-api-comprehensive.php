<?php

echo "🔍 COMPREHENSIVE API TESTING\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$tests = [
    'Default pagination' => 'http://127.0.0.1:8001/api/v1/ordencompra',
    'Custom page size' => 'http://127.0.0.1:8001/api/v1/ordencompra?per_page=10',
    'Page 2' => 'http://127.0.0.1:8001/api/v1/ordencompra?page=2&per_page=5',
    'Search test' => 'http://127.0.0.1:8001/api/v1/ordencompra?search=ON',
    'Stats endpoint' => 'http://127.0.0.1:8001/api/v1/ordencompra/stats'
];

foreach ($tests as $testName => $url) {
    echo "Testing: $testName\n";
    echo "URL: $url\n";
    
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

    if ($error) {
        echo "❌ CURL Error: $error\n";
    } elseif ($httpCode === 200) {
        echo "✅ SUCCESS (HTTP $httpCode)\n";
        $data = json_decode($response, true);
        
        if (isset($data['data'])) {
            if (isset($data['data']['data'])) {
                // Paginated response
                echo "   Records: " . count($data['data']['data']) . "\n";
                echo "   Total: " . ($data['data']['total'] ?? 'N/A') . "\n";
                echo "   Current page: " . ($data['data']['current_page'] ?? 'N/A') . "\n";
            } elseif (is_array($data['data'])) {
                // Stats or simple array
                echo "   Data items: " . count($data['data']) . "\n";
            }
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        echo "   Response: " . substr($response, 0, 100) . "...\n";
    }
    
    echo str_repeat("-", 40) . "\n\n";
}

echo "🎯 API TESTING COMPLETE\n";

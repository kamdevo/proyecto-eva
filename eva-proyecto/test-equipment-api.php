<?php

echo "🔍 TESTING EQUIPMENT API FOR CLASSIFICATION\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

// Test different equipment endpoints
$tests = [
    'All equipment' => '/equipment',
    'Equipment with tipo_id=1 (biomedical)' => '/equipment?tipo_id=1',
    'Equipment with tipo_id=2 (industrial?)' => '/equipment?tipo_id=2',
    'Equipment with tipo_id=3' => '/equipment?tipo_id=3',
    'Equipment metadata' => '/equipment/metadata',
    'Equipment stats' => '/equipment/stats'
];

foreach ($tests as $testName => $endpoint) {
    echo "Testing: $testName\n";
    $url = $baseUrl . $endpoint;
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
            if (is_array($data['data']) && isset($data['data']['data'])) {
                // Paginated response
                $records = $data['data']['data'];
                echo "   Records: " . count($records) . "\n";
                echo "   Total: " . ($data['data']['total'] ?? 'N/A') . "\n";
                
                if (count($records) > 0) {
                    $first = $records[0];
                    echo "   Sample record:\n";
                    echo "     ID: " . ($first['id'] ?? 'N/A') . "\n";
                    echo "     Name: " . ($first['name'] ?? 'N/A') . "\n";
                    echo "     Code: " . ($first['code'] ?? 'N/A') . "\n";
                    echo "     Tipo ID: " . ($first['tipo_id'] ?? 'N/A') . "\n";
                }
            } elseif (is_array($data['data'])) {
                // Simple array or metadata
                echo "   Data items: " . count($data['data']) . "\n";
                
                // If it looks like metadata, show some keys
                if (isset($data['data']['tipos_equipos'])) {
                    echo "   Equipment types found:\n";
                    foreach ($data['data']['tipos_equipos'] as $tipo) {
                        echo "     ID: " . ($tipo['id'] ?? 'N/A') . " - " . ($tipo['name'] ?? 'N/A') . "\n";
                    }
                }
            }
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        if ($httpCode === 404) {
            echo "   Endpoint not found\n";
        } elseif ($httpCode === 500) {
            echo "   Server error\n";
        }
    }
    
    echo str_repeat("-", 40) . "\n\n";
}

echo "🎯 Equipment API testing complete\n";

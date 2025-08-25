<?php

echo "🔍 TESTING INDUSTRIAL EQUIPMENT API\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

// Test industrial equipment endpoints
$tests = [
    'Industrial equipment list' => '/equipoindustrial',
    'Industrial equipment with pagination' => '/equipoindustrial?per_page=10',
    'Industrial equipment stats' => '/equipoindustrial/stats',
    'Industrial equipment search' => '/equipoindustrial/search/test'
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
                    echo "     Marca: " . ($first['marca'] ?? 'N/A') . "\n";
                    echo "     Modelo: " . ($first['modelo'] ?? 'N/A') . "\n";
                    
                    // Show all available fields
                    echo "     Available fields: " . implode(', ', array_keys($first)) . "\n";
                }
            } elseif (is_array($data['data'])) {
                // Simple array or stats
                echo "   Data items: " . count($data['data']) . "\n";
                
                // If it's stats, show some info
                if (isset($data['data']['total_equipos'])) {
                    echo "   Stats found:\n";
                    foreach ($data['data'] as $key => $value) {
                        echo "     {$key}: {$value}\n";
                    }
                }
            }
        } else {
            echo "   Response: " . substr(json_encode($data), 0, 200) . "...\n";
        }
    } elseif ($httpCode === 401) {
        echo "❌ HTTP Error: $httpCode (Authentication required)\n";
    } elseif ($httpCode === 404) {
        echo "❌ HTTP Error: $httpCode (Endpoint not found)\n";
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        echo "   Response: " . substr($response, 0, 200) . "...\n";
    }
    
    echo str_repeat("-", 40) . "\n\n";
}

echo "🎯 Industrial equipment API testing complete\n";

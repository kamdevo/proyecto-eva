<?php

echo "🔍 TESTING NEW INDUSTRIAL EQUIPMENT ENDPOINT\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

// Test the new industrial equipment endpoints
$tests = [
    'Industrial devices complete' => '/equipos/industrial-devices-complete?per_page=5',
    'Industrial devices stats' => '/equipos/estadisticas/industrial-devices',
    'Industrial devices with search' => '/equipos/industrial-devices-complete?search=test&per_page=5',
    'Industrial devices page 2' => '/equipos/industrial-devices-complete?page=2&per_page=5'
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
                echo "   Current page: " . ($data['data']['current_page'] ?? 'N/A') . "\n";
                echo "   Last page: " . ($data['data']['last_page'] ?? 'N/A') . "\n";
                
                if (count($records) > 0) {
                    $first = $records[0];
                    echo "   Sample record:\n";
                    echo "     ID: " . ($first['id'] ?? 'N/A') . "\n";
                    echo "     Name: " . ($first['name'] ?? 'N/A') . "\n";
                    echo "     Code: " . ($first['code'] ?? 'N/A') . "\n";
                    echo "     Marca: " . ($first['marca'] ?? 'N/A') . "\n";
                    echo "     Modelo: " . ($first['modelo'] ?? 'N/A') . "\n";
                    echo "     Servicio: " . ($first['servicios'] ?? 'N/A') . "\n";
                    echo "     Area: " . ($first['area'] ?? 'N/A') . "\n";
                    echo "     Estado: " . ($first['estadoequipo'] ?? 'N/A') . "\n";
                }
            } elseif (is_array($data['data'])) {
                // Stats response
                echo "   Stats data:\n";
                foreach ($data['data'] as $key => $value) {
                    if (is_array($value)) {
                        echo "     {$key}: [array with " . count($value) . " items]\n";
                        if (count($value) > 0 && isset($value[0]['name'])) {
                            echo "       Sample: " . $value[0]['name'] . " (" . $value[0]['total'] . ")\n";
                        }
                    } else {
                        echo "     {$key}: {$value}\n";
                    }
                }
            }
        } else {
            echo "   Response structure: " . implode(', ', array_keys($data)) . "\n";
        }
    } elseif ($httpCode === 404) {
        echo "❌ HTTP Error: $httpCode (Endpoint not found)\n";
    } elseif ($httpCode === 500) {
        echo "❌ HTTP Error: $httpCode (Server error)\n";
        $errorData = json_decode($response, true);
        if (isset($errorData['message'])) {
            echo "   Error: " . $errorData['message'] . "\n";
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        echo "   Response: " . substr($response, 0, 200) . "...\n";
    }
    
    echo str_repeat("-", 40) . "\n\n";
}

echo "🎯 Industrial equipment endpoint testing complete\n";

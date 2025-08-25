<?php

echo "🔍 TESTING PAGINATION FUNCTIONALITY\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1/ordencompra';

$tests = [
    'Page 1, 5 per page' => '?page=1&per_page=5',
    'Page 2, 5 per page' => '?page=2&per_page=5',
    'Page 3, 5 per page' => '?page=3&per_page=5',
    'Page 1, 10 per page' => '?page=1&per_page=10',
    'Page 1, 15 per page' => '?page=1&per_page=15',
    'Page 2, 15 per page' => '?page=2&per_page=15',
    'Last page test' => '?page=50&per_page=5',
    'Beyond last page' => '?page=100&per_page=5'
];

foreach ($tests as $testName => $params) {
    $url = $baseUrl . $params;
    echo "Testing: $testName\n";
    echo "URL: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['data'])) {
            $paginationData = $data['data'];
            echo "✅ SUCCESS\n";
            echo "   Current page: " . ($paginationData['current_page'] ?? 'N/A') . "\n";
            echo "   Per page: " . ($paginationData['per_page'] ?? 'N/A') . "\n";
            echo "   Total: " . ($paginationData['total'] ?? 'N/A') . "\n";
            echo "   Last page: " . ($paginationData['last_page'] ?? 'N/A') . "\n";
            echo "   Records returned: " . count($paginationData['data'] ?? []) . "\n";
            echo "   From: " . ($paginationData['from'] ?? 'N/A') . "\n";
            echo "   To: " . ($paginationData['to'] ?? 'N/A') . "\n";
            
            // Show first record ID for verification
            if (!empty($paginationData['data'])) {
                $firstRecord = $paginationData['data'][0];
                echo "   First record ID: " . ($firstRecord['id'] ?? 'N/A') . "\n";
                echo "   First record order: " . ($firstRecord['orden'] ?? 'N/A') . "\n";
            }
        } else {
            echo "❌ SUCCESS but no data field\n";
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
    }
    
    echo str_repeat("-", 40) . "\n\n";
}

echo "🎯 PAGINATION TESTING COMPLETE\n";

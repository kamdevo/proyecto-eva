<?php

echo "🔍 TESTING EDGE CASES AFTER FIX\n";
echo "=" . str_repeat("=", 40) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1/ordencompra';

$edgeCases = [
    'Page 0' => '?page=0&per_page=15',
    'Page -1' => '?page=-1&per_page=15',
    'Page 999' => '?page=999&per_page=15',
    'Per page 0' => '?page=1&per_page=0',
    'Per page -1' => '?page=1&per_page=-1',
    'Per page 200' => '?page=1&per_page=200',
    'Invalid params' => '?page=abc&per_page=xyz'
];

foreach ($edgeCases as $caseName => $params) {
    $url = $baseUrl . $params;
    echo "Testing: $caseName\n";
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
            echo "   Records returned: " . count($paginationData['data'] ?? []) . "\n";
        } else {
            echo "❌ SUCCESS but no data field\n";
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        if ($httpCode === 422) {
            $errorData = json_decode($response, true);
            if (isset($errorData['errors'])) {
                echo "   Validation errors: " . json_encode($errorData['errors']) . "\n";
            }
        }
    }
    
    echo str_repeat("-", 30) . "\n\n";
}

echo "🎯 Edge case testing complete\n";

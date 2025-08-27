<?php

echo "🔍 DEBUGGING STATUS FILTER ISSUE\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$tests = [
    'No status parameter' => 'http://127.0.0.1:8001/api/v1/ordencompra?per_page=5',
    'Empty status parameter' => 'http://127.0.0.1:8001/api/v1/ordencompra?status=&per_page=5',
    'Status = 0' => 'http://127.0.0.1:8001/api/v1/ordencompra?status=0&per_page=5',
    'Status = 1' => 'http://127.0.0.1:8001/api/v1/ordencompra?status=1&per_page=5',
    'Frontend simulation' => 'http://127.0.0.1:8001/api/v1/ordencompra?search=&status=&per_page=15&page=1'
];

foreach ($tests as $testName => $url) {
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
        if (isset($data['data']['total'])) {
            echo "✅ SUCCESS - Total records: " . $data['data']['total'] . "\n";
            echo "   Records returned: " . count($data['data']['data']) . "\n";
        } else {
            echo "❌ SUCCESS but no total field\n";
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
    }
    
    echo str_repeat("-", 40) . "\n\n";
}

echo "🎯 DEBUGGING COMPLETE\n";

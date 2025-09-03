<?php

echo "=== TESTING HTTP REQUEST TO API ===\n\n";

// Test the actual HTTP endpoint
$url = 'http://127.0.0.1:8001/api/v1/v1/export/calibraciones';

echo "Testing URL: $url\n";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'User-Agent: PHP Test Client'
        ],
        'timeout' => 30
    ]
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    echo "❌ HTTP request failed\n";
    $error = error_get_last();
    echo "Error: " . ($error['message'] ?? 'Unknown error') . "\n";
    
    // Check if server is running
    $testUrl = 'http://127.0.0.1:8001';
    $testResponse = @file_get_contents($testUrl, false, stream_context_create([
        'http' => ['timeout' => 5]
    ]));
    
    if ($testResponse === false) {
        echo "❌ Server not responding at http://127.0.0.1:8001\n";
        echo "Please start the server with: php artisan serve --host=127.0.0.1 --port=8001\n";
    } else {
        echo "✅ Server is running\n";
        echo "Issue is with the specific endpoint\n";
    }
    
} else {
    echo "✅ HTTP request successful\n";
    echo "Response size: " . strlen($response) . " bytes\n";
    
    // Check if it's an Excel file
    $header = substr($response, 0, 4);
    if ($header === "PK\x03\x04") {
        echo "✅ Valid Excel file received\n";
        
        $filename = 'http_test_export_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $response);
        echo "✅ File saved: $filename\n";
        
    } else {
        echo "❌ Response is not an Excel file\n";
        echo "Response preview: " . substr($response, 0, 200) . "\n";
    }
}

// Check HTTP response headers
if (isset($http_response_header)) {
    echo "\n📋 HTTP Response Headers:\n";
    foreach ($http_response_header as $header) {
        echo "  $header\n";
    }
}

echo "\n=== HTTP TEST COMPLETED ===\n";

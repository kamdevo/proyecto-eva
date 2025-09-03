<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING API EXPORT ENDPOINT ===\n\n";

try {
    // Make HTTP request to the API endpoint
    $url = 'http://127.0.0.1:8001/api/v1/v1/export/calibraciones';
    
    echo "1. Calling API endpoint: $url\n";
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Type: application/json'
            ],
            'timeout' => 30
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Failed to get response from API\n";
        $error = error_get_last();
        echo "Error: " . $error['message'] . "\n";
        return;
    }
    
    echo "✅ API response received\n";
    echo "Response size: " . strlen($response) . " bytes\n";
    
    // Save the response to a file
    $filename = 'calibraciones_api_export_' . date('Y-m-d_H-i-s') . '.xlsx';
    file_put_contents($filename, $response);
    
    echo "✅ File saved as: $filename\n";
    echo "File size: " . filesize($filename) . " bytes\n";
    
    // Verify it's a valid Excel file
    $fileHeader = substr($response, 0, 4);
    if ($fileHeader === "PK\x03\x04") {
        echo "✅ Valid Excel file (ZIP signature detected)\n";
    } else {
        echo "❌ Invalid format. Header: " . bin2hex($fileHeader) . "\n";
        echo "Response preview: " . substr($response, 0, 200) . "\n";
    }
    
    // Check HTTP response headers
    if (isset($http_response_header)) {
        echo "\n📋 HTTP Response Headers:\n";
        foreach ($http_response_header as $header) {
            echo "  $header\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== API TEST COMPLETED ===\n";

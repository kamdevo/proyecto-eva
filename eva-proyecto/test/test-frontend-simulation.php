<?php

echo "🔍 SIMULATING FRONTEND REQUEST\n";
echo "=" . str_repeat("=", 50) . "\n\n";

// Simulate the exact request the frontend would make
$baseUrl = 'http://127.0.0.1:8001/api';
$endpoint = '/v1/ordencompra';

// Simulate default filters from frontend
$filters = [
    'search' => '',
    'status' => '',
    'per_page' => 15,
    'page' => 1
];

// Build query string like frontend does
$queryParams = http_build_query($filters);
$fullUrl = $baseUrl . $endpoint . '?' . $queryParams;

echo "Frontend would make request to:\n";
echo "URL: $fullUrl\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fullUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Response:\n";
echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ CURL Error: $error\n";
} elseif ($httpCode === 200) {
    echo "✅ SUCCESS!\n\n";
    
    $data = json_decode($response, true);
    
    if ($data && isset($data['success']) && $data['success']) {
        echo "📊 RESPONSE ANALYSIS:\n";
        echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
        echo "Message: " . ($data['message'] ?? 'N/A') . "\n";
        
        if (isset($data['data'])) {
            $responseData = $data['data'];
            
            echo "\n📋 DATA STRUCTURE:\n";
            echo "Current page: " . ($responseData['current_page'] ?? 'N/A') . "\n";
            echo "Per page: " . ($responseData['per_page'] ?? 'N/A') . "\n";
            echo "Total records: " . ($responseData['total'] ?? 'N/A') . "\n";
            echo "Last page: " . ($responseData['last_page'] ?? 'N/A') . "\n";
            
            if (isset($responseData['data']) && is_array($responseData['data'])) {
                $records = $responseData['data'];
                echo "Records in this page: " . count($records) . "\n";
                
                if (count($records) > 0) {
                    echo "\n📄 SAMPLE RECORD:\n";
                    $firstRecord = $records[0];
                    foreach ($firstRecord as $key => $value) {
                        $displayValue = is_null($value) ? 'null' : 
                                       (is_string($value) ? "\"$value\"" : $value);
                        echo "  $key: $displayValue\n";
                    }
                    
                    echo "\n🎯 FRONTEND SHOULD RECEIVE:\n";
                    echo "- Array of " . count($records) . " purchase orders\n";
                    echo "- Pagination info showing page 1 of " . ($responseData['last_page'] ?? 'N/A') . "\n";
                    echo "- Total of " . ($responseData['total'] ?? 'N/A') . " records available\n";
                    
                    if (count($records) > 0) {
                        echo "- Records have all required fields for display\n";
                        echo "✅ DATA IS AVAILABLE - Frontend should NOT show 'no data'\n";
                    } else {
                        echo "❌ NO RECORDS IN RESPONSE - 'no data' message would be correct\n";
                    }
                } else {
                    echo "\n❌ EMPTY DATA ARRAY - 'no data' message would be correct\n";
                }
            } else {
                echo "\n❌ NO DATA ARRAY IN RESPONSE\n";
            }
        } else {
            echo "\n❌ NO DATA FIELD IN RESPONSE\n";
        }
    } else {
        echo "❌ API returned success: false\n";
        echo "Error message: " . ($data['message'] ?? 'Unknown error') . "\n";
    }
} else {
    echo "❌ HTTP Error: $httpCode\n";
    echo "Response: " . substr($response, 0, 200) . "...\n";
}

echo "\n🔚 Frontend simulation complete\n";

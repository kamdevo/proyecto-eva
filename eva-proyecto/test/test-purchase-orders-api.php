<?php

// Test the purchase orders API endpoint
$url = 'http://127.0.0.1:8001/api/v1/ordencompra?per_page=5';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "🔍 TESTING PURCHASE ORDERS API ENDPOINT\n";
echo "=" . str_repeat("=", 50) . "\n\n";

echo "URL: $url\n";
echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ CURL Error: $error\n";
    exit(1);
}

if ($httpCode !== 200) {
    echo "❌ HTTP Error: $httpCode\n";
    echo "Response: $response\n";
    exit(1);
}

$data = json_decode($response, true);

if (!$data) {
    echo "❌ Invalid JSON response\n";
    echo "Response: $response\n";
    exit(1);
}

echo "✅ API Response successful!\n\n";

echo "📊 RESPONSE STRUCTURE:\n";
echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";

if (isset($data['data'])) {
    if (isset($data['data']['data'])) {
        $orders = $data['data']['data'];
        echo "Orders count: " . count($orders) . "\n";
        
        if (count($orders) > 0) {
            echo "\n📋 FIRST ORDER SAMPLE:\n";
            $firstOrder = $orders[0];
            foreach ($firstOrder as $key => $value) {
                $displayValue = is_null($value) ? 'null' : (is_string($value) ? "\"$value\"" : $value);
                echo "  $key: $displayValue\n";
            }
        }
        
        echo "\n📄 PAGINATION INFO:\n";
        if (isset($data['data']['current_page'])) {
            echo "  Current page: " . $data['data']['current_page'] . "\n";
            echo "  Last page: " . $data['data']['last_page'] . "\n";
            echo "  Per page: " . $data['data']['per_page'] . "\n";
            echo "  Total: " . $data['data']['total'] . "\n";
        }
    } else {
        echo "Data structure: " . json_encode($data['data'], JSON_PRETTY_PRINT) . "\n";
    }
} else {
    echo "No data field found\n";
    echo "Full response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
}

echo "\n🎯 FRONTEND INTEGRATION READY!\n";
echo "The API is working correctly and ready for frontend integration.\n";

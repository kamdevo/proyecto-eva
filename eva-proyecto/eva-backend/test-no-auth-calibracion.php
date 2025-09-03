<?php

echo "=== TESTING CALIBRACION WITHOUT AUTH ===\n\n";

// Test the endpoint without authentication
$url = 'http://127.0.0.1:8001/api/v1/calibracion';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "URL: $url\n";
echo "HTTP Status: $httpCode\n";

if ($httpCode == 200) {
    echo "✅ SUCCESS: Calibracion endpoint accessible without authentication\n";
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "✅ Response structure is correct\n";
        echo "✅ Message: " . ($data['message'] ?? 'N/A') . "\n";
    }
} else {
    echo "❌ FAILED: HTTP $httpCode\n";
    echo "Response: $response\n";
}

echo "\n=== TEST COMPLETED ===\n";

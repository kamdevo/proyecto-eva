<?php

echo "🔍 SIMPLE REGISTRATION TEST\n";
echo "=" . str_repeat("=", 40) . "\n\n";

$url = 'http://127.0.0.1:8001/api/v1/test-register-simple';

$data = [
    'nombre' => 'Test',
    'apellido' => 'User',
    'email' => 'test_' . time() . '@example.com',
    'username' => 'testuser_' . time(),
    'password' => 'Test123!',
    'centro_id' => '1'
];

echo "Testing registration endpoint: $url\n";
echo "Data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "CURL Error: $error\n";
} else {
    echo "Response: $response\n";
    
    if ($httpCode === 200 || $httpCode === 201) {
        echo "✅ Registration successful!\n";
        $responseData = json_decode($response, true);
        if (isset($responseData['user'])) {
            echo "User ID: " . $responseData['user']['id'] . "\n";
            echo "Centro ID: " . $responseData['user']['centro_id'] . "\n";
        }
    } else {
        echo "❌ Registration failed\n";
    }
}

echo "\n🔚 Test complete\n";

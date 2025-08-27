<?php
echo "Testing user activation API...\n";

// Test login
$loginData = json_encode(['username' => 'admin', 'password' => 'admin']);
$loginContext = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $loginData
    ]
]);

$loginResponse = file_get_contents('http://127.0.0.1:8001/api/auth/login', false, $loginContext);
$loginResult = json_decode($loginResponse, true);

if ($loginResult && $loginResult['success']) {
    $token = $loginResult['token'];
    echo "✅ Login successful\n";
    
    // Test user activation endpoint
    $activationContext = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer $token\r\nContent-Type: application/json\r\n",
            'content' => '{}'
        ]
    ]);
    
    $activationResponse = file_get_contents('http://127.0.0.1:8001/api/v1/admin/users/6/toggle-activation', false, $activationContext);
    
    if ($activationResponse !== false) {
        $activationResult = json_decode($activationResponse, true);
        echo "✅ Activation endpoint response received\n";
        echo "Response: " . $activationResponse . "\n";
        
        if ($activationResult && $activationResult['success']) {
            echo "✅ User activation successful: " . $activationResult['data']['action'] . "\n";
        } else {
            echo "❌ Activation failed: " . ($activationResult['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Activation endpoint failed - no response\n";
    }
} else {
    echo "❌ Login failed\n";
}
?>

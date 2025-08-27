<?php
/**
 * Debug token authentication issue
 */

echo "🔍 DEBUGGING TOKEN AUTHENTICATION ISSUE\n";
echo str_repeat("=", 60) . "\n\n";

// Step 1: Get a fresh token
echo "1. 🔐 Getting fresh admin token...\n";

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
    echo "✅ Fresh token obtained: " . substr($token, 0, 30) . "...\n";
    echo "   Full token length: " . strlen($token) . " characters\n\n";
    
    // Step 2: Test the activation endpoint with this fresh token
    echo "2. 🧪 Testing activation endpoint with fresh token...\n";
    
    $activationContext = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer $token\r\nContent-Type: application/json\r\nAccept: application/json\r\n",
            'content' => '{}',
            'ignore_errors' => true
        ]
    ]);
    
    $activationResponse = file_get_contents('http://127.0.0.1:8001/api/v1/admin/users/6/toggle-activation', false, $activationContext);
    
    if ($activationResponse !== false) {
        $activationResult = json_decode($activationResponse, true);
        echo "✅ Activation response received\n";
        echo "Response: " . json_encode($activationResult, JSON_PRETTY_PRINT) . "\n";
        
        if ($activationResult && $activationResult['success']) {
            echo "✅ Activation successful with fresh token!\n";
        } else {
            echo "❌ Activation failed even with fresh token\n";
            echo "Error: " . ($activationResult['message'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ No response from activation endpoint\n";
    }
    
    // Step 3: Test different token formats
    echo "\n3. 🔧 Testing different token formats...\n";
    
    // Test with different Authorization header formats
    $tokenFormats = [
        "Bearer $token",
        "bearer $token", 
        $token,
        "Token $token"
    ];
    
    foreach ($tokenFormats as $index => $authHeader) {
        echo "   Testing format " . ($index + 1) . ": '$authHeader'\n";
        
        $testContext = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Authorization: $authHeader\r\nContent-Type: application/json\r\nAccept: application/json\r\n",
                'content' => '{}',
                'ignore_errors' => true
            ]
        ]);
        
        $testResponse = file_get_contents('http://127.0.0.1:8001/api/v1/admin/users/6/toggle-activation', false, $testContext);
        
        if ($testResponse !== false) {
            $testResult = json_decode($testResponse, true);
            if ($testResult && $testResult['success']) {
                echo "   ✅ Format " . ($index + 1) . " works!\n";
            } else {
                echo "   ❌ Format " . ($index + 1) . " failed: " . ($testResult['message'] ?? 'Unknown') . "\n";
            }
        } else {
            echo "   ❌ Format " . ($index + 1) . " - no response\n";
        }
    }
    
    // Step 4: Check token structure
    echo "\n4. 🔍 Analyzing token structure...\n";
    
    $tokenParts = explode('|', $token);
    echo "   Token parts: " . count($tokenParts) . "\n";
    
    if (count($tokenParts) >= 2) {
        echo "   Token ID: " . $tokenParts[0] . "\n";
        echo "   Token Hash: " . substr($tokenParts[1], 0, 20) . "...\n";
    }
    
    // Step 5: Test with /v1/user endpoint to see if token works there
    echo "\n5. 👤 Testing token with /v1/user endpoint...\n";
    
    $userContext = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer $token\r\nAccept: application/json\r\n",
            'ignore_errors' => true
        ]
    ]);
    
    $userResponse = file_get_contents('http://127.0.0.1:8001/api/v1/user', false, $userContext);
    
    if ($userResponse !== false) {
        echo "   ✅ /v1/user responded\n";
        $userResult = json_decode($userResponse, true);
        if ($userResult) {
            echo "   Response: " . json_encode($userResult, JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "   ❌ /v1/user failed\n";
    }
    
} else {
    echo "❌ Failed to get fresh token\n";
    if ($loginResult) {
        echo "Error: " . ($loginResult['message'] ?? 'Unknown error') . "\n";
    }
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "Token debugging completed\n";
echo str_repeat("=", 60) . "\n";
?>

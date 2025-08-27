<?php
/**
 * Debug authentication and user data
 */

echo "🔍 DEBUGGING AUTHENTICATION\n";
echo str_repeat("=", 50) . "\n\n";

// Test login and get user data
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
    echo "Token: " . substr($token, 0, 20) . "...\n\n";
    
    // Test /v1/user endpoint to see current user data
    echo "🔍 Testing /v1/user endpoint...\n";
    
    $userContext = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer $token\r\nAccept: application/json\r\n"
        ]
    ]);
    
    $userResponse = file_get_contents('http://127.0.0.1:8001/api/v1/user', false, $userContext);
    
    if ($userResponse !== false) {
        $userResult = json_decode($userResponse, true);
        echo "✅ User endpoint response:\n";
        echo json_encode($userResult, JSON_PRETTY_PRINT) . "\n\n";
        
        if ($userResult['success'] && isset($userResult['data'])) {
            $userData = $userResult['data'];
            echo "📊 User Data Analysis:\n";
            echo "   ID: " . ($userData->id ?? 'N/A') . "\n";
            echo "   Name: " . ($userData->nombre ?? 'N/A') . "\n";
            echo "   Username: " . ($userData->username ?? 'N/A') . "\n";
            echo "   Role ID: " . ($userData->rol_id ?? 'N/A') . "\n";
            echo "   Active: " . ($userData->active ?? 'N/A') . "\n";
            echo "   Is Admin: " . ($userData->is_admin ?? 'N/A') . "\n";
            
            // Check if rol_id is 1
            if (isset($userData->rol_id) && $userData->rol_id == 1) {
                echo "✅ User has Super Admin role (rol_id = 1)\n";
            } else {
                echo "❌ User does NOT have Super Admin role\n";
                echo "   Current rol_id: " . ($userData->rol_id ?? 'undefined') . "\n";
            }
        }
    } else {
        echo "❌ Failed to get user data\n";
    }
    
    // Now test the activation endpoint with detailed error info
    echo "\n🧪 Testing activation endpoint with debug info...\n";
    
    $activationContext = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer $token\r\nContent-Type: application/json\r\nAccept: application/json\r\n",
            'content' => '{}',
            'ignore_errors' => true  // This will capture error responses
        ]
    ]);
    
    $activationResponse = file_get_contents('http://127.0.0.1:8001/api/v1/admin/users/6/toggle-activation', false, $activationContext);
    
    if ($activationResponse !== false) {
        $activationResult = json_decode($activationResponse, true);
        echo "📝 Activation endpoint response:\n";
        echo json_encode($activationResult, JSON_PRETTY_PRINT) . "\n";
        
        // Check HTTP response headers
        if (isset($http_response_header)) {
            echo "\n📡 HTTP Response Headers:\n";
            foreach ($http_response_header as $header) {
                echo "   $header\n";
            }
        }
    } else {
        echo "❌ No response from activation endpoint\n";
    }
    
} else {
    echo "❌ Login failed\n";
    if ($loginResult) {
        echo "Error: " . ($loginResult['message'] ?? 'Unknown error') . "\n";
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Authentication debugging completed\n";
echo str_repeat("=", 50) . "\n";
?>

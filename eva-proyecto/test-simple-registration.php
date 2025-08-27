<?php
/**
 * Test simple de registro de usuario
 */

echo "🧪 TESTING USER REGISTRATION\n";
echo str_repeat("=", 40) . "\n\n";

$testUser = [
    'nombre' => 'Test',
    'apellido' => 'User',
    'username' => 'testuser_' . time(),
    'email' => 'testuser_' . time() . '@test.com',
    'password' => 'password123',
    'telefono' => '3001234567',
    'centro_id' => '2002'
];

$postData = json_encode($testUser);
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $postData,
        'timeout' => 10
    ]
]);

echo "📝 Registering user: {$testUser['username']}\n";

try {
    $response = file_get_contents('http://127.0.0.1:8001/api/auth/register', false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        
        echo "✅ Registration Response:\n";
        echo "Status: " . ($data['success'] ? 'SUCCESS' : 'FAILED') . "\n";
        echo "Message: " . $data['message'] . "\n";
        
        if (isset($data['activation_required'])) {
            echo "✅ Activation Required: " . ($data['activation_required'] ? 'YES' : 'NO') . "\n";
        } else {
            echo "⚠️ Activation Required field missing\n";
        }
        
        if (isset($data['data'])) {
            echo "User ID: " . $data['data']->id . "\n";
            echo "User Active Status: " . (isset($data['data']->active) ? $data['data']->active : 'NOT SET') . "\n";
        }
        
    } else {
        echo "❌ Registration failed - no response\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 40) . "\n";

// Test login with inactive user
echo "🔐 TESTING LOGIN WITH INACTIVE USER\n";
echo str_repeat("=", 40) . "\n\n";

$loginData = json_encode([
    'username' => $testUser['username'],
    'password' => $testUser['password']
]);

$loginContext = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $loginData,
        'timeout' => 10
    ]
]);

try {
    $loginResponse = file_get_contents('http://127.0.0.1:8001/api/auth/login', false, $loginContext);
    
    if ($loginResponse !== false) {
        $loginData = json_decode($loginResponse, true);
        
        echo "🔐 Login Response:\n";
        echo "Status: " . ($loginData['success'] ? 'SUCCESS' : 'FAILED') . "\n";
        echo "Message: " . $loginData['message'] . "\n";
        
        if (isset($loginData['activation_required'])) {
            echo "✅ Activation Required: " . ($loginData['activation_required'] ? 'YES' : 'NO') . "\n";
        }
        
        if (!$loginData['success']) {
            echo "✅ Inactive user correctly blocked from login\n";
        } else {
            echo "❌ Inactive user was allowed to login - SECURITY ISSUE\n";
        }
        
    } else {
        echo "❌ Login test failed - no response\n";
    }
} catch (Exception $e) {
    echo "❌ Login test error: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 40) . "\n";
echo "Registration and login test completed\n";
echo str_repeat("=", 40) . "\n";
?>

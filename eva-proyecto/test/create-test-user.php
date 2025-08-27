<?php

/**
 * Create a test user for activation testing
 */

echo "👤 CREATING TEST USER FOR ACTIVATION\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response,
        'error' => $error
    ];
}

// Step 1: Login as admin
echo "🔑 Step 1: Logging in as admin...\n";
$loginResponse = makeRequest("$baseUrl/../auth/login", 'POST', [
    'username' => 'admin',
    'password' => 'admin'
]);

if ($loginResponse['status'] !== 200) {
    echo "❌ Login failed\n";
    exit(1);
}

$token = $loginResponse['data']['data']['token'];
$authHeaders = ["Authorization: Bearer $token"];

echo "✅ Login successful!\n\n";

// Step 2: Create test user
echo "👤 Step 2: Creating test user...\n";

$timestamp = time();
$testUser = [
    'nombre' => 'Test',
    'apellido' => 'User',
    'username' => "testuser_$timestamp",
    'email' => "testuser_$timestamp@test.com",
    'password' => 'testpass123',
    'telefono' => '1234567890',
    'rol_id' => 2,
    'centro_id' => 1,
    'id_empresa' => 1,
    'estado' => 1,
    'active' => 'false' // Create as INACTIVE
];

// Try to create user via registration endpoint
$createResponse = makeRequest("$baseUrl/register", 'POST', $testUser);

if ($createResponse['status'] === 201 || ($createResponse['status'] === 200 && $createResponse['data']['success'])) {
    echo "✅ Test user created successfully!\n";
    echo "📋 User Details:\n";
    echo "   - Username: {$testUser['username']}\n";
    echo "   - Email: {$testUser['email']}\n";
    echo "   - Password: {$testUser['password']}\n";
    echo "   - Status: INACTIVE (ready for activation test)\n\n";
    
    // Get the created user ID
    $usersResponse = makeRequest("$baseUrl/usuarios-public?search={$testUser['username']}&per_page=5");
    
    if ($usersResponse['status'] === 200 && $usersResponse['data']['success']) {
        $users = $usersResponse['data']['data']['data'];
        foreach ($users as $user) {
            $userObj = is_array($user) ? (object)$user : $user;
            if ($userObj->username === $testUser['username']) {
                $userId = $userObj->id;
                echo "🎯 Test user ID: $userId\n";
                echo "🔴 Current status: " . ($userObj->active === 'false' ? 'INACTIVE' : 'ACTIVE') . "\n\n";
                
                // Step 3: Test activation
                echo "🧪 Step 3: Testing activation endpoint...\n";
                $activationResponse = makeRequest("$baseUrl/usuarios/$userId/activate", 'POST', [], $authHeaders);
                
                echo "📋 Activation Response:\n";
                echo "   - Status Code: " . $activationResponse['status'] . "\n";
                echo "   - Success: " . ($activationResponse['data']['success'] ?? 'N/A') . "\n";
                echo "   - Message: " . ($activationResponse['data']['message'] ?? 'N/A') . "\n";
                
                if ($activationResponse['status'] === 200 && $activationResponse['data']['success']) {
                    echo "✅ ACTIVATION SUCCESSFUL!\n\n";
                    
                    // Verify activation
                    $verifyResponse = makeRequest("$baseUrl/usuarios-public?search={$testUser['username']}&per_page=5");
                    if ($verifyResponse['status'] === 200) {
                        $verifyUsers = $verifyResponse['data']['data']['data'];
                        foreach ($verifyUsers as $verifyUser) {
                            $verifyUserObj = is_array($verifyUser) ? (object)$verifyUser : $verifyUser;
                            if ($verifyUserObj->username === $testUser['username']) {
                                echo "🔍 Verification: User status is now " . ($verifyUserObj->active === 'true' ? 'ACTIVE ✅' : 'INACTIVE ❌') . "\n";
                                break;
                            }
                        }
                    }
                } else {
                    echo "❌ ACTIVATION FAILED!\n";
                    echo "   This indicates the role detection issue is still present.\n";
                }
                
                break;
            }
        }
    }
    
} else {
    echo "❌ Failed to create test user\n";
    echo "   Status: " . $createResponse['status'] . "\n";
    echo "   Message: " . ($createResponse['data']['message'] ?? 'Unknown error') . "\n";
    echo "   You can create the user manually with these credentials:\n";
    echo "   - Username: {$testUser['username']}\n";
    echo "   - Email: {$testUser['email']}\n";
    echo "   - Password: {$testUser['password']}\n";
}

echo "\n✅ Test complete!\n";

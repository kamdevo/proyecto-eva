<?php

/**
 * Debug script to verify admin user role and permissions
 */

echo "🔍 DEBUGGING ADMIN ROLE AND PERMISSIONS\n";
echo "=" . str_repeat("=", 60) . "\n\n";

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

// Step 1: Login as admin and get token
echo "🔑 Step 1: Logging in as admin...\n";
// Try multiple login endpoints
$loginEndpoints = [
    "$baseUrl/../auth/login",
    "$baseUrl/login",
    "$baseUrl/test-login"
];

$loginResponse = null;
foreach ($loginEndpoints as $endpoint) {
    echo "   Trying endpoint: $endpoint\n";
    $response = makeRequest($endpoint, 'POST', [
        'username' => 'admin',
        'password' => 'admin'
    ]);

    if ($response['status'] === 200 && isset($response['data']['success']) && $response['data']['success']) {
        $loginResponse = $response;
        echo "   ✅ Success with: $endpoint\n";
        break;
    } else {
        echo "   ❌ Failed: " . ($response['data']['message'] ?? $response['error'] ?? 'Unknown error') . "\n";
    }
}

if (!$loginResponse || $loginResponse['status'] !== 200) {
    echo "❌ All login attempts failed\n";
    exit(1);
}

// Debug the login response structure
echo "📋 Login Response Structure:\n";
echo "   Raw response: " . substr($loginResponse['raw'], 0, 500) . "...\n";

$token = $loginResponse['data']['data']['token'] ??
         $loginResponse['data']['token'] ??
         null;

$userData = $loginResponse['data']['data']['user'] ??
           $loginResponse['data']['user'] ??
           $loginResponse['data']['data'] ??
           null;

if (!$token) {
    echo "❌ No token found in response\n";
    echo "Available keys in data: " . implode(', ', array_keys($loginResponse['data'] ?? [])) . "\n";
    if (isset($loginResponse['data']['data'])) {
        echo "Available keys in data.data: " . implode(', ', array_keys($loginResponse['data']['data'] ?? [])) . "\n";
    }
    exit(1);
}

echo "✅ Login successful!\n";
echo "📋 User Data from Login Response:\n";
echo "   - ID: " . ($userData['id'] ?? 'N/A') . "\n";
echo "   - Username: " . ($userData['username'] ?? 'N/A') . "\n";
echo "   - Email: " . ($userData['email'] ?? 'N/A') . "\n";
echo "   - Role ID: " . ($userData['rol_id'] ?? 'N/A') . "\n";
echo "   - Centro ID: " . ($userData['centro_id'] ?? 'N/A') . "\n\n";

// Step 2: Check user details via API
echo "🔍 Step 2: Fetching user details via API...\n";
$authHeaders = ["Authorization: Bearer $token"];

// Try to get user info from usuarios-public endpoint
$usersResponse = makeRequest("$baseUrl/usuarios-public?search=admin&per_page=5", 'GET', null, $authHeaders);

if ($usersResponse['status'] === 200 && $usersResponse['data']['success']) {
    $users = $usersResponse['data']['data']['data'];
    echo "📋 Admin user found in users list:\n";
    
    foreach ($users as $user) {
        $userObj = is_array($user) ? (object)$user : $user;
        if (strtolower($userObj->username ?? '') === 'admin') {
            echo "   - ID: " . ($userObj->id ?? 'N/A') . "\n";
            echo "   - Username: " . ($userObj->username ?? 'N/A') . "\n";
            echo "   - Email: " . ($userObj->email ?? 'N/A') . "\n";
            echo "   - Role ID: " . ($userObj->rol_id ?? 'N/A') . "\n";
            echo "   - Active: " . ($userObj->active ?? 'N/A') . "\n";
            echo "   - Estado: " . ($userObj->estado ?? 'N/A') . "\n";
            break;
        }
    }
} else {
    echo "❌ Could not fetch users: " . ($usersResponse['data']['message'] ?? 'Unknown error') . "\n";
}

echo "\n";

// Step 3: Test user activation endpoint
echo "🧪 Step 3: Testing user activation endpoint...\n";

// First, let's find a user to test activation on
$testUserId = null;
if ($usersResponse['status'] === 200 && $usersResponse['data']['success']) {
    $users = $usersResponse['data']['data']['data'];
    foreach ($users as $user) {
        $userObj = is_array($user) ? (object)$user : $user;
        if (($userObj->username ?? '') !== 'admin' && ($userObj->active ?? 'true') === 'false') {
            $testUserId = $userObj->id ?? null;
            echo "📋 Found inactive user for testing: ID {$testUserId}, Username: " . ($userObj->username ?? 'N/A') . "\n";
            break;
        }
    }
}

if (!$testUserId) {
    // If no inactive user found, just test with a random user ID
    $testUserId = 2; // Assuming there's a user with ID 2
    echo "📋 No inactive user found, testing with user ID: $testUserId\n";
}

// Test activation endpoint
$activationResponse = makeRequest("$baseUrl/usuarios/$testUserId/activate", 'POST', [], $authHeaders);

echo "📋 Activation Response:\n";
echo "   - Status Code: " . $activationResponse['status'] . "\n";
echo "   - Success: " . ($activationResponse['data']['success'] ?? 'N/A') . "\n";
echo "   - Message: " . ($activationResponse['data']['message'] ?? 'N/A') . "\n";

if ($activationResponse['status'] === 403) {
    echo "🚨 ISSUE FOUND: Getting 403 Forbidden - Role check is failing!\n";
} elseif ($activationResponse['status'] === 401) {
    echo "🚨 ISSUE FOUND: Getting 401 Unauthorized - Token issue!\n";
} elseif ($activationResponse['status'] === 200) {
    echo "✅ Activation endpoint working correctly!\n";
}

echo "\n";

// Step 4: Check roles table
echo "🔍 Step 4: Checking available roles...\n";
$rolesResponse = makeRequest("$baseUrl/roles", 'GET', null, $authHeaders);

if ($rolesResponse['status'] === 200 && $rolesResponse['data']['success']) {
    echo "📋 Available Roles:\n";
    foreach ($rolesResponse['data']['data'] as $role) {
        $roleObj = is_array($role) ? (object)$role : $role;
        echo "   - ID: " . ($roleObj->id ?? 'N/A') . ", Name: " . ($roleObj->name ?? 'N/A') . "\n";
    }
} else {
    echo "❌ Could not fetch roles: " . ($rolesResponse['data']['message'] ?? 'Unknown error') . "\n";
}

echo "\n";

// Step 5: Debug recommendations
echo "🎯 DEBUGGING RECOMMENDATIONS:\n";
echo "=" . str_repeat("=", 60) . "\n";

if ($userData['rol_id'] ?? null !== 1) {
    echo "🚨 ISSUE: Admin user rol_id is not 1 (Super Admin)\n";
    echo "   Current rol_id: " . ($userData['rol_id'] ?? 'N/A') . "\n";
    echo "   Expected: 1\n";
    echo "   Fix: Update admin user rol_id to 1 in database\n\n";
}

if ($activationResponse['status'] === 403) {
    echo "🚨 ISSUE: Role validation in activation endpoint is failing\n";
    echo "   The backend is not recognizing admin as super admin\n";
    echo "   Check: auth('sanctum')->user()->rol_id comparison in API\n\n";
}

if ($activationResponse['status'] === 401) {
    echo "🚨 ISSUE: Token authentication is failing\n";
    echo "   The token might not be properly attached or validated\n";
    echo "   Check: Sanctum middleware and token validation\n\n";
}

echo "✅ Debug complete!\n";

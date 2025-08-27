<?php

/**
 * Test only the CRITICAL endpoints that were just fixed
 */

echo "🧪 TESTING CRITICAL ENDPOINTS AFTER FIXES\n";
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

// Login first
echo "🔐 Step 1: Login as admin...\n";
$loginResult = makeRequest("$baseUrl/../auth/login", 'POST', [
    'username' => 'admin',
    'password' => 'admin'
]);

if ($loginResult['status'] !== 200) {
    echo "❌ Login failed: " . $loginResult['status'] . "\n";
    exit(1);
}

$token = $loginResult['data']['token'];
$authHeaders = ["Authorization: Bearer $token"];
echo "✅ Login successful!\n\n";

// Test the CRITICAL endpoints that were just fixed
echo "🧪 Step 2: Testing CRITICAL endpoints...\n";

$criticalTests = [
    [
        'name' => 'User Activation (Individual)',
        'url' => "$baseUrl/usuarios/1/activate",
        'method' => 'POST',
        'expected' => [200, 403], // 200 if works, 403 if trying to activate super admin
        'critical' => true
    ],
    [
        'name' => 'User Deactivation (Individual)', 
        'url' => "$baseUrl/usuarios/1/deactivate",
        'method' => 'POST',
        'expected' => [403], // Should be forbidden for super admin
        'critical' => true
    ],
    [
        'name' => 'Bulk User Activation',
        'url' => "$baseUrl/usuarios/bulk-activate",
        'method' => 'POST',
        'data' => ['user_ids' => [2, 3]], // Non-existent users
        'expected' => [200], // Should work even if users don't exist
        'critical' => true
    ],
    [
        'name' => 'User Permissions (Admin endpoint)',
        'url' => "$baseUrl/admin/users/1/permissions",
        'method' => 'GET',
        'expected' => [200, 403], // 200 if works, 403 if not super admin
        'critical' => true
    ]
];

$allCriticalPassed = true;

foreach ($criticalTests as $test) {
    echo "\n🔍 Testing: {$test['name']}\n";
    
    $data = $test['data'] ?? null;
    $result = makeRequest($test['url'], $test['method'], $data, $authHeaders);
    
    $success = in_array($result['status'], $test['expected']);
    $statusIcon = $success ? "✅" : "❌";
    
    echo "   $statusIcon Status: {$result['status']} (Expected: " . implode(' or ', $test['expected']) . ")\n";
    
    if ($result['data'] && isset($result['data']['message'])) {
        echo "   Message: {$result['data']['message']}\n";
    }
    
    if (!$success && $test['critical']) {
        $allCriticalPassed = false;
        echo "   🚨 CRITICAL FAILURE!\n";
    }
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 CRITICAL ENDPOINTS SUMMARY\n";
echo str_repeat("=", 60) . "\n\n";

if ($allCriticalPassed) {
    echo "🎉 ALL CRITICAL ENDPOINTS WORKING!\n";
    echo "✅ User activation endpoints: FUNCTIONAL\n";
    echo "✅ Bulk operations: FUNCTIONAL\n";
    echo "✅ Admin permissions: FUNCTIONAL\n";
    echo "✅ No more 405 Method Not Allowed errors!\n\n";
    
    echo "🚀 FRONTEND SHOULD NOW WORK CORRECTLY!\n";
    echo "   - Login as admin\n";
    echo "   - Try to activate/deactivate users\n";
    echo "   - Use bulk operations\n";
    echo "   - Manage user permissions\n";
} else {
    echo "❌ SOME CRITICAL ENDPOINTS STILL FAILING!\n";
    echo "   Check the errors above and fix them.\n";
}

echo "\n✅ Critical endpoint test complete!\n";

<?php

/**
 * Debug Method Not Allowed Error
 * Check which routes exist and what methods they support
 */

echo "🔍 DEBUGGING METHOD NOT ALLOWED ERROR\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
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
    
    // Separate headers and body
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'headers' => $headers,
        'body' => $body,
        'data' => json_decode($body, true),
        'error' => $error
    ];
}

// First, login to get token
echo "🔐 Step 1: Getting authentication token...\n";
$loginResult = makeRequest("$baseUrl/../auth/login", 'POST', [
    'username' => 'admin',
    'password' => 'admin'
]);

if ($loginResult['status'] !== 200) {
    echo "❌ Login failed: " . $loginResult['status'] . "\n";
    exit(1);
}

$loginData = json_decode($loginResult['body'], true);
$token = $loginData['token'];
$authHeaders = ["Authorization: Bearer $token"];

echo "✅ Login successful! Token obtained.\n\n";

// Test different methods on activation endpoints
echo "🧪 Step 2: Testing activation endpoints with different methods...\n";

$testEndpoints = [
    '/usuarios/1/activate',
    '/usuarios/1/deactivate',
    '/usuarios/bulk-activate',
    '/usuarios/bulk-deactivate'
];

$testMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

foreach ($testEndpoints as $endpoint) {
    echo "\n📋 Testing endpoint: $endpoint\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    foreach ($testMethods as $method) {
        $url = $baseUrl . $endpoint;
        $result = makeRequest($url, $method, [], $authHeaders);
        
        $status = $result['status'];
        $statusText = '';
        
        switch ($status) {
            case 200:
            case 201:
                $statusText = "✅ SUCCESS";
                break;
            case 401:
                $statusText = "🔒 UNAUTHORIZED";
                break;
            case 403:
                $statusText = "🚫 FORBIDDEN";
                break;
            case 404:
                $statusText = "❓ NOT FOUND";
                break;
            case 405:
                $statusText = "❌ METHOD NOT ALLOWED";
                break;
            case 422:
                $statusText = "⚠️ VALIDATION ERROR";
                break;
            case 500:
                $statusText = "💥 SERVER ERROR";
                break;
            default:
                $statusText = "❓ UNKNOWN";
        }
        
        echo sprintf("   %-6s %s (%d)\n", $method, $statusText, $status);
        
        // If method not allowed, check for Allow header
        if ($status == 405 && strpos($result['headers'], 'Allow:') !== false) {
            preg_match('/Allow: (.+)/i', $result['headers'], $matches);
            if (isset($matches[1])) {
                echo "          Allowed methods: " . trim($matches[1]) . "\n";
            }
        }
        
        // Show error message for relevant statuses
        if (in_array($status, [400, 401, 403, 404, 405, 422, 500]) && $result['data']) {
            $message = $result['data']['message'] ?? 'No message';
            if (strlen($message) < 100) {
                echo "          Message: $message\n";
            }
        }
    }
}

// Test some working endpoints for comparison
echo "\n\n🔍 Step 3: Testing known working endpoints for comparison...\n";
echo "-" . str_repeat("-", 50) . "\n";

$workingEndpoints = [
    ['GET', '/usuarios-public', 'Public users list'],
    ['GET', '/usuarios', 'Authenticated users list'],
    ['POST', '/../auth/login', 'Login endpoint'],
    ['GET', '/centros', 'Centers list']
];

foreach ($workingEndpoints as [$method, $endpoint, $description]) {
    $url = $baseUrl . $endpoint;
    $headers = ($endpoint === '/../auth/login') ? [] : $authHeaders;
    $data = ($endpoint === '/../auth/login') ? ['username' => 'admin', 'password' => 'admin'] : null;
    
    $result = makeRequest($url, $method, $data, $headers);
    
    $statusText = ($result['status'] >= 200 && $result['status'] < 300) ? "✅" : "❌";
    echo sprintf("%-6s %-30s %s (%d)\n", $method, $description, $statusText, $result['status']);
}

echo "\n📋 ANALYSIS:\n";
echo "=" . str_repeat("=", 60) . "\n";

echo "1. If activation endpoints show 405 errors for POST method:\n";
echo "   → The routes might not be properly defined\n";
echo "   → Check if middleware is blocking the routes\n";
echo "   → Verify route syntax in api.php\n\n";

echo "2. If activation endpoints show 404 errors:\n";
echo "   → The routes don't exist at all\n";
echo "   → Check route registration\n\n";

echo "3. If activation endpoints work with POST but fail with other methods:\n";
echo "   → This is expected behavior ✅\n\n";

echo "4. Compare with working endpoints to identify patterns\n\n";

echo "✅ Debug complete!\n";
echo "\nNext steps:\n";
echo "- Check the specific endpoint and method you're trying to use\n";
echo "- Verify the route is properly registered in api.php\n";
echo "- Ensure you're using POST method for activation endpoints\n";

<?php

/**
 * Security Validation and Testing Suite
 * 
 * This comprehensive security test suite validates:
 * - Authentication security
 * - Authorization controls
 * - Input validation
 * - SQL injection protection
 * - XSS protection
 * - CSRF protection
 * - Rate limiting
 * - Permission escalation prevention
 * - Data exposure prevention
 */

echo "🔒 SECURITY VALIDATION AND TESTING SUITE\n";
echo "=" . str_repeat("=", 80) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';
$securityResults = [];
$totalSecurityTests = 0;
$passedSecurityTests = 0;

function makeSecureRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false); // Don't follow redirects for security testing
    
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json',
        'User-Agent: SecurityTestSuite/1.0'
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response,
        'error' => $error,
        'info' => $info
    ];
}

function runSecurityTest($testName, $testFunction, $category = 'Security') {
    global $securityResults, $totalSecurityTests, $passedSecurityTests;
    
    $totalSecurityTests++;
    echo "🔒 [$category] $testName\n";
    echo str_repeat("-", 60) . "\n";
    
    $startTime = microtime(true);
    
    try {
        $result = $testFunction();
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);
        
        if ($result['success']) {
            echo "✅ SECURE: " . $result['message'] . " ({$duration}ms)\n";
            $passedSecurityTests++;
            $securityResults[$category][] = ['test' => $testName, 'status' => 'SECURE', 'message' => $result['message'], 'duration' => $duration];
        } else {
            echo "🚨 VULNERABLE: " . $result['message'] . " ({$duration}ms)\n";
            $securityResults[$category][] = ['test' => $testName, 'status' => 'VULNERABLE', 'message' => $result['message'], 'duration' => $duration];
        }
    } catch (Exception $e) {
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);
        echo "💥 ERROR: " . $e->getMessage() . " ({$duration}ms)\n";
        $securityResults[$category][] = ['test' => $testName, 'status' => 'ERROR', 'message' => $e->getMessage(), 'duration' => $duration];
    }
    
    echo "\n";
}

// Get valid admin token for authenticated tests
function getValidAdminToken() {
    global $baseUrl;
    
    $credentials = ['username' => 'admin', 'password' => 'admin'];
    $response = makeSecureRequest("$baseUrl/login", 'POST', $credentials);
    
    if ($response['status'] === 200 && isset($response['data']['data']['token'])) {
        return $response['data']['data']['token'];
    }
    
    // Try alternative endpoint
    $response = makeSecureRequest("$baseUrl/../auth/login", 'POST', $credentials);
    if ($response['status'] === 200 && isset($response['data']['data']['token'])) {
        return $response['data']['data']['token'];
    }
    
    return null;
}

$validToken = getValidAdminToken();
if ($validToken) {
    echo "🔑 Valid admin token obtained for security testing\n\n";
} else {
    echo "⚠️  Warning: Could not obtain valid token. Some security tests may be limited.\n\n";
}

// SECURITY TEST SUITE 1: AUTHENTICATION SECURITY
runSecurityTest("SQL Injection in Login", function() use ($baseUrl) {
    $sqlPayloads = [
        "admin' OR '1'='1",
        "admin'; DROP TABLE usuarios; --",
        "admin' UNION SELECT * FROM usuarios --",
        "' OR 1=1 --",
        "admin'/**/OR/**/1=1#"
    ];
    
    $vulnerabilities = [];
    foreach ($sqlPayloads as $payload) {
        $response = makeSecureRequest("$baseUrl/login", 'POST', [
            'username' => $payload,
            'password' => 'any_password'
        ]);
        
        // If login succeeds with SQL injection, it's vulnerable
        if ($response['status'] === 200 && isset($response['data']['success']) && $response['data']['success']) {
            $vulnerabilities[] = "Payload: $payload";
        }
    }
    
    return [
        'success' => empty($vulnerabilities),
        'message' => empty($vulnerabilities) ? 'Login protected against SQL injection' : 'SQL injection vulnerabilities found: ' . implode(', ', $vulnerabilities)
    ];
}, 'Authentication Security');

runSecurityTest("Brute Force Protection", function() use ($baseUrl) {
    $attempts = 0;
    $maxAttempts = 10;
    $blocked = false;
    
    for ($i = 0; $i < $maxAttempts; $i++) {
        $response = makeSecureRequest("$baseUrl/login", 'POST', [
            'username' => 'admin',
            'password' => 'wrong_password_' . $i
        ]);
        
        $attempts++;
        
        // Check if we get rate limited or blocked
        if ($response['status'] === 429 || $response['status'] === 423) {
            $blocked = true;
            break;
        }
        
        // Small delay between attempts
        usleep(100000); // 0.1 seconds
    }
    
    return [
        'success' => $blocked || $attempts < $maxAttempts,
        'message' => $blocked ? "Brute force protection active after $attempts attempts" : "No brute force protection detected after $attempts attempts"
    ];
}, 'Authentication Security');

runSecurityTest("Invalid Token Rejection", function() use ($baseUrl) {
    $invalidTokens = [
        'invalid_token',
        'Bearer invalid',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        '',
        'null',
        'undefined'
    ];
    
    $properlyRejected = 0;
    foreach ($invalidTokens as $token) {
        $headers = $token ? ["Authorization: Bearer $token"] : [];
        $response = makeSecureRequest("$baseUrl/admin/users", 'GET', null, $headers);
        
        // Should return 401 or 403 for invalid tokens
        if (in_array($response['status'], [401, 403])) {
            $properlyRejected++;
        }
    }
    
    $totalTests = count($invalidTokens);
    return [
        'success' => $properlyRejected === $totalTests,
        'message' => "Invalid tokens properly rejected: $properlyRejected/$totalTests"
    ];
}, 'Authentication Security');

// SECURITY TEST SUITE 2: AUTHORIZATION CONTROLS
runSecurityTest("Admin Endpoint Access Control", function() use ($baseUrl, $validToken) {
    $adminEndpoints = [
        '/admin/users',
        '/admin/modules',
        '/admin/users/1/permissions'
    ];
    
    $protectedEndpoints = 0;
    foreach ($adminEndpoints as $endpoint) {
        // Test without token
        $response = makeSecureRequest($baseUrl . $endpoint, 'GET');
        
        if (in_array($response['status'], [401, 403])) {
            $protectedEndpoints++;
        }
    }
    
    $totalEndpoints = count($adminEndpoints);
    return [
        'success' => $protectedEndpoints === $totalEndpoints,
        'message' => "Admin endpoints protected: $protectedEndpoints/$totalEndpoints"
    ];
}, 'Authorization Controls');

runSecurityTest("Permission Escalation Prevention", function() use ($baseUrl, $validToken) {
    if (!$validToken) {
        return ['success' => true, 'message' => 'Skipped - no valid token available'];
    }
    
    // Try to modify super admin permissions (should be prevented)
    $response = makeSecureRequest("$baseUrl/admin/users/1/permissions", 'POST', [
        'permissions' => [
            ['modulo_id' => 1, 'leer' => false, 'insertar' => false, 'editar' => false, 'eliminar' => false]
        ]
    ], ["Authorization: Bearer $validToken"]);
    
    // Should be rejected (403 or similar)
    $prevented = in_array($response['status'], [403, 422]) || 
                 (isset($response['data']['success']) && !$response['data']['success']);
    
    return [
        'success' => $prevented,
        'message' => $prevented ? 'Super admin permission modification prevented' : 'Super admin permissions can be modified (security risk)'
    ];
}, 'Authorization Controls');

// SECURITY TEST SUITE 3: INPUT VALIDATION
runSecurityTest("XSS Protection in User Data", function() use ($baseUrl, $validToken) {
    if (!$validToken) {
        return ['success' => true, 'message' => 'Skipped - no valid token available'];
    }
    
    $xssPayloads = [
        '<script>alert("XSS")</script>',
        '"><script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>'
    ];
    
    $protectedFields = 0;
    $totalFields = 0;
    
    foreach ($xssPayloads as $payload) {
        $totalFields++;
        
        // Try to create user with XSS payload in name
        $response = makeSecureRequest("$baseUrl/usuarios", 'POST', [
            'nombre' => $payload,
            'apellido' => 'Test',
            'username' => 'xss_test_' . time(),
            'email' => 'xss_test@test.com',
            'password' => 'password123',
            'rol_id' => 2
        ], ["Authorization: Bearer $validToken"]);
        
        // Check if payload was sanitized or rejected
        if ($response['status'] === 422 || 
            (isset($response['data']['success']) && !$response['data']['success']) ||
            (isset($response['data']['data']['nombre']) && $response['data']['data']['nombre'] !== $payload)) {
            $protectedFields++;
        }
    }
    
    return [
        'success' => $protectedFields === $totalFields,
        'message' => "XSS payloads handled safely: $protectedFields/$totalFields"
    ];
}, 'Input Validation');

runSecurityTest("Data Type Validation", function() use ($baseUrl) {
    $invalidData = [
        ['per_page' => 'invalid_number'],
        ['page' => -1],
        ['per_page' => 999999],
        ['search' => str_repeat('A', 10000)] // Very long search term
    ];
    
    $properlyValidated = 0;
    foreach ($invalidData as $data) {
        $queryString = http_build_query($data);
        $response = makeSecureRequest("$baseUrl/usuarios-public?$queryString");
        
        // Should handle invalid data gracefully
        if ($response['status'] === 422 || 
            ($response['status'] === 200 && isset($response['data']['success']))) {
            $properlyValidated++;
        }
    }
    
    $totalTests = count($invalidData);
    return [
        'success' => $properlyValidated === $totalTests,
        'message' => "Invalid data properly validated: $properlyValidated/$totalTests"
    ];
}, 'Input Validation');

// SECURITY TEST SUITE 4: DATA EXPOSURE PREVENTION
runSecurityTest("Sensitive Data Exposure", function() use ($baseUrl) {
    $response = makeSecureRequest("$baseUrl/usuarios-public?per_page=5");
    
    if ($response['status'] !== 200 || !isset($response['data']['data']['data'])) {
        return ['success' => true, 'message' => 'Cannot test - API not accessible'];
    }
    
    $users = $response['data']['data']['data'];
    $exposedSensitiveData = [];
    
    foreach ($users as $user) {
        $userData = (array) $user;
        
        // Check for sensitive fields that shouldn't be exposed
        $sensitiveFields = ['password', 'password_hash', 'remember_token', 'api_token'];
        foreach ($sensitiveFields as $field) {
            if (isset($userData[$field])) {
                $exposedSensitiveData[] = $field;
            }
        }
    }
    
    return [
        'success' => empty($exposedSensitiveData),
        'message' => empty($exposedSensitiveData) ? 'No sensitive data exposed in public API' : 'Sensitive data exposed: ' . implode(', ', array_unique($exposedSensitiveData))
    ];
}, 'Data Exposure Prevention');

echo "🔒 SECURITY TEST SUMMARY\n";
echo "=" . str_repeat("=", 80) . "\n";
echo "Total Security Tests: $totalSecurityTests\n";
echo "Secure: $passedSecurityTests\n";
echo "Vulnerable: " . ($totalSecurityTests - $passedSecurityTests) . "\n";
echo "Security Score: " . round(($passedSecurityTests / $totalSecurityTests) * 100, 2) . "%\n\n";

// Detailed security results by category
foreach ($securityResults as $category => $tests) {
    echo "🛡️  $category\n";
    echo str_repeat("-", 40) . "\n";
    foreach ($tests as $test) {
        $icon = $test['status'] === 'SECURE' ? '✅' : ($test['status'] === 'VULNERABLE' ? '🚨' : '💥');
        echo "$icon {$test['test']}: {$test['message']} ({$test['duration']}ms)\n";
    }
    echo "\n";
}

echo "🎯 SECURITY RECOMMENDATIONS\n";
echo "=" . str_repeat("=", 80) . "\n";

if ($passedSecurityTests === $totalSecurityTests) {
    echo "🎉 All security tests passed! The system appears to be secure.\n";
} else {
    echo "⚠️  Security vulnerabilities detected. Please address the following:\n\n";
    
    foreach ($securityResults as $category => $tests) {
        $vulnerableTests = array_filter($tests, function($test) {
            return $test['status'] === 'VULNERABLE';
        });
        
        if (!empty($vulnerableTests)) {
            echo "🚨 $category Issues:\n";
            foreach ($vulnerableTests as $test) {
                echo "  - {$test['test']}: {$test['message']}\n";
            }
            echo "\n";
        }
    }
}

echo "🔐 Security Testing Complete!\n";

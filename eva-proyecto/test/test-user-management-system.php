<?php
/**
 * Test completo del sistema de gestión de usuarios
 * Verifica registro, activación, permisos y funcionalidad completa
 */

echo "🧪 COMPREHENSIVE USER MANAGEMENT SYSTEM TESTS\n";
echo str_repeat("=", 70) . "\n\n";

// Configuration
$apiBaseUrl = 'http://127.0.0.1:8001';
$adminCredentials = ['username' => 'admin', 'password' => 'admin'];

$testResults = [];
$totalTests = 0;
$passedTests = 0;

/**
 * Make HTTP request
 */
function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    $headers = array_merge($defaultHeaders, $headers);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL Error: $error");
    }
    
    return [
        'status' => $httpCode,
        'body' => $response,
        'data' => json_decode($response, true)
    ];
}

/**
 * Run a test
 */
function runTest($testName, $testFunction) {
    global $totalTests, $passedTests, $testResults;
    $totalTests++;
    
    echo "🔍 TEST: $testName\n";
    
    try {
        $result = $testFunction();
        if ($result['success']) {
            echo "✅ PASSED: " . $result['message'] . "\n";
            $passedTests++;
            $testResults[$testName] = 'PASSED';
        } else {
            echo "❌ FAILED: " . $result['message'] . "\n";
            $testResults[$testName] = 'FAILED';
        }
    } catch (Exception $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
        $testResults[$testName] = 'ERROR';
    }
    
    echo "\n";
}

// Get admin token for protected endpoints
$adminToken = null;

// TEST 1: Admin Login and Token Generation
runTest("Admin Login and Token Generation", function() use ($apiBaseUrl, $adminCredentials, &$adminToken) {
    $response = makeRequest("$apiBaseUrl/api/auth/login", 'POST', $adminCredentials);
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $adminToken = $response['data']['token'];
        return ['success' => true, 'message' => 'Admin login successful, token obtained'];
    } else {
        return ['success' => false, 'message' => 'Admin login failed'];
    }
});

// TEST 2: User Registration with Inactive Status
runTest("User Registration with Inactive Status", function() use ($apiBaseUrl) {
    $testUser = [
        'nombre' => 'Test',
        'apellido' => 'User',
        'username' => 'testuser_' . time(),
        'email' => 'testuser_' . time() . '@test.com',
        'password' => 'password123',
        'telefono' => '3001234567',
        'centro_id' => '2002'
    ];
    
    $response = makeRequest("$apiBaseUrl/api/auth/register", 'POST', $testUser);
    
    if ($response['status'] === 201 && $response['data']['success']) {
        $message = $response['data']['message'];
        if (strpos($message, 'pendiente de activación') !== false) {
            return ['success' => true, 'message' => 'User registered as inactive - activation required'];
        } else {
            return ['success' => false, 'message' => 'User registered but activation message missing'];
        }
    } else {
        return ['success' => false, 'message' => 'User registration failed'];
    }
});

// TEST 3: Inactive User Login Attempt
runTest("Inactive User Login Attempt", function() use ($apiBaseUrl) {
    $inactiveUser = [
        'username' => 'testuser_' . (time() - 1),
        'password' => 'password123'
    ];
    
    $response = makeRequest("$apiBaseUrl/api/auth/login", 'POST', $inactiveUser);
    
    if ($response['status'] === 401 && !$response['data']['success']) {
        $message = $response['data']['message'];
        if (strpos($message, 'pendiente de activación') !== false || 
            strpos($message, 'activation_required') !== false) {
            return ['success' => true, 'message' => 'Inactive user correctly blocked from login'];
        } else {
            return ['success' => false, 'message' => 'Wrong error message for inactive user'];
        }
    } else {
        return ['success' => false, 'message' => 'Inactive user was allowed to login'];
    }
});

// TEST 4: Admin User Management Access
runTest("Admin User Management Access", function() use ($apiBaseUrl, $adminToken) {
    if (!$adminToken) {
        return ['success' => false, 'message' => 'No admin token available'];
    }
    
    $headers = ["Authorization: Bearer $adminToken"];
    $response = makeRequest("$apiBaseUrl/api/admin/users", 'GET', null, $headers);
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $users = $response['data']['data'];
        $userCount = count($users);
        return ['success' => true, 'message' => "Admin can access user list ($userCount users)"];
    } else {
        return ['success' => false, 'message' => 'Admin cannot access user management'];
    }
});

// TEST 5: User Activation Toggle
runTest("User Activation Toggle", function() use ($apiBaseUrl, $adminToken) {
    if (!$adminToken) {
        return ['success' => false, 'message' => 'No admin token available'];
    }
    
    // First get a test user ID
    $headers = ["Authorization: Bearer $adminToken"];
    $response = makeRequest("$apiBaseUrl/api/admin/users", 'GET', null, $headers);
    
    if ($response['status'] !== 200 || !$response['data']['success']) {
        return ['success' => false, 'message' => 'Cannot get user list'];
    }
    
    $users = $response['data']['data'];
    $testUser = null;
    
    // Find a non-admin user to test with
    foreach ($users as $user) {
        if ($user->rol_id != 1) {
            $testUser = $user;
            break;
        }
    }
    
    if (!$testUser) {
        return ['success' => false, 'message' => 'No non-admin user found for testing'];
    }
    
    // Try to toggle activation
    $response = makeRequest("$apiBaseUrl/api/admin/users/{$testUser->id}/toggle-activation", 'POST', null, $headers);
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $action = $response['data']['data']['action'];
        return ['success' => true, 'message' => "User activation toggled successfully ($action)"];
    } else {
        return ['success' => false, 'message' => 'User activation toggle failed'];
    }
});

// TEST 6: Permission Management Access
runTest("Permission Management Access", function() use ($apiBaseUrl, $adminToken) {
    if (!$adminToken) {
        return ['success' => false, 'message' => 'No admin token available'];
    }
    
    // Get modules list
    $headers = ["Authorization: Bearer $adminToken"];
    $response = makeRequest("$apiBaseUrl/api/admin/modules", 'GET', null, $headers);
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $modules = $response['data']['data'];
        $moduleCount = count($modules);
        return ['success' => true, 'message' => "Admin can access modules list ($moduleCount modules)"];
    } else {
        return ['success' => false, 'message' => 'Admin cannot access modules for permission management'];
    }
});

// TEST 7: User Permissions Retrieval
runTest("User Permissions Retrieval", function() use ($apiBaseUrl, $adminToken) {
    if (!$adminToken) {
        return ['success' => false, 'message' => 'No admin token available'];
    }
    
    // Get a test user
    $headers = ["Authorization: Bearer $adminToken"];
    $response = makeRequest("$apiBaseUrl/api/admin/users", 'GET', null, $headers);
    
    if ($response['status'] !== 200) {
        return ['success' => false, 'message' => 'Cannot get user list'];
    }
    
    $users = $response['data']['data'];
    $testUser = null;
    
    foreach ($users as $user) {
        if ($user->rol_id != 1) {
            $testUser = $user;
            break;
        }
    }
    
    if (!$testUser) {
        return ['success' => false, 'message' => 'No non-admin user found'];
    }
    
    // Get user permissions
    $response = makeRequest("$apiBaseUrl/api/admin/users/{$testUser->id}/permissions", 'GET', null, $headers);
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $permissions = $response['data']['data']['permissions'];
        $permissionCount = count($permissions);
        return ['success' => true, 'message' => "User permissions retrieved ($permissionCount modules)"];
    } else {
        return ['success' => false, 'message' => 'Cannot retrieve user permissions'];
    }
});

// TEST 8: Security - Non-Admin Access Blocked
runTest("Security - Non-Admin Access Blocked", function() use ($apiBaseUrl) {
    // Try to access admin endpoints without proper authorization
    $response = makeRequest("$apiBaseUrl/api/admin/users", 'GET');
    
    if ($response['status'] === 401 || $response['status'] === 403) {
        return ['success' => true, 'message' => 'Non-authenticated access correctly blocked'];
    } else {
        return ['success' => false, 'message' => 'Security vulnerability - unauthorized access allowed'];
    }
});

// SUMMARY
echo str_repeat("=", 70) . "\n";
echo "📊 USER MANAGEMENT SYSTEM TEST SUMMARY\n";
echo str_repeat("=", 70) . "\n";

$successRate = ($passedTests / $totalTests) * 100;

echo "Total Tests: $totalTests\n";
echo "Passed: $passedTests\n";
echo "Failed: " . ($totalTests - $passedTests) . "\n";
echo "Success Rate: " . number_format($successRate, 1) . "%\n\n";

echo "📋 DETAILED RESULTS:\n";
foreach ($testResults as $test => $result) {
    $icon = $result === 'PASSED' ? '✅' : ($result === 'FAILED' ? '❌' : '⚠️');
    echo "$icon $test: $result\n";
}

echo "\n" . str_repeat("=", 70) . "\n";

if ($successRate >= 90) {
    echo "🎉 USER MANAGEMENT SYSTEM: EXCELLENT\n";
    echo "🚀 All core functionality working perfectly!\n";
} elseif ($successRate >= 75) {
    echo "✅ USER MANAGEMENT SYSTEM: GOOD\n";
    echo "🔧 Minor issues need attention\n";
} else {
    echo "⚠️ USER MANAGEMENT SYSTEM: NEEDS WORK\n";
    echo "🛠️ Significant issues need to be resolved\n";
}

echo "\n📋 SYSTEM STATUS:\n";
echo "• User Registration: " . (isset($testResults['User Registration with Inactive Status']) && $testResults['User Registration with Inactive Status'] === 'PASSED' ? 'WORKING ✅' : 'NEEDS FIX ❌') . "\n";
echo "• User Activation: " . (isset($testResults['User Activation Toggle']) && $testResults['User Activation Toggle'] === 'PASSED' ? 'WORKING ✅' : 'NEEDS FIX ❌') . "\n";
echo "• Permission Management: " . (isset($testResults['Permission Management Access']) && $testResults['Permission Management Access'] === 'PASSED' ? 'WORKING ✅' : 'NEEDS FIX ❌') . "\n";
echo "• Security Controls: " . (isset($testResults['Security - Non-Admin Access Blocked']) && $testResults['Security - Non-Admin Access Blocked'] === 'PASSED' ? 'WORKING ✅' : 'NEEDS FIX ❌') . "\n";
echo "• Admin Access: " . (isset($testResults['Admin User Management Access']) && $testResults['Admin User Management Access'] === 'PASSED' ? 'WORKING ✅' : 'NEEDS FIX ❌') . "\n";

echo "\n🎯 NEXT STEPS:\n";
echo "1. Test frontend integration with Playwright\n";
echo "2. Verify user activation workflow in UI\n";
echo "3. Test permission assignment interface\n";
echo "4. Validate complete user management flow\n";
echo "5. Deploy to production environment\n";

echo "\n" . str_repeat("=", 70) . "\n";
echo "User management system testing completed - " . date('Y-m-d H:i:s') . "\n";
echo str_repeat("=", 70) . "\n";
?>

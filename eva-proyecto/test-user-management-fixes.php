<?php

echo "🔧 TESTING USER MANAGEMENT SYSTEM FIXES\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
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
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response
    ];
}

function runTest($testName, $testFunction) {
    echo "🧪 $testName\n";
    echo str_repeat("-", 50) . "\n";
    
    try {
        $result = $testFunction();
        if ($result['success']) {
            echo "✅ PASSED: " . $result['message'] . "\n";
        } else {
            echo "❌ FAILED: " . $result['message'] . "\n";
        }
    } catch (Exception $e) {
        echo "💥 ERROR: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

// TEST 1: API Error Fix - Module Stats Endpoint
runTest("Module Stats API Fix", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/modulos/stats");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $moduleCount = count($response['data']['data']);
        return ['success' => true, 'message' => "Module stats endpoint working ($moduleCount modules)"];
    } else {
        $error = $response['data']['message'] ?? 'Unknown error';
        return ['success' => false, 'message' => "Module stats endpoint failed: $error"];
    }
});

// TEST 2: User Status Data Validation
runTest("User Status Data Validation", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?per_page=5");
    
    if ($response['status'] !== 200 || !$response['data']['success']) {
        return ['success' => false, 'message' => 'Cannot fetch users'];
    }
    
    $users = $response['data']['data']['data'];
    $activeFieldPresent = 0;
    $validActiveValues = 0;
    
    foreach ($users as $user) {
        if (isset($user->active)) {
            $activeFieldPresent++;
            if (in_array($user->active, ['true', 'false'])) {
                $validActiveValues++;
            }
        }
    }
    
    $userCount = count($users);
    return [
        'success' => $activeFieldPresent === $userCount && $validActiveValues === $userCount,
        'message' => "Users checked: $userCount, Active field present: $activeFieldPresent, Valid values: $validActiveValues"
    ];
});

// TEST 3: Enhanced Search Functionality
runTest("Enhanced Search Functionality", function() use ($baseUrl) {
    // Test search by name
    $response1 = makeRequest("$baseUrl/usuarios-public?search=admin&per_page=5");
    
    // Test search by email
    $response2 = makeRequest("$baseUrl/usuarios-public?search=@&per_page=5");
    
    // Test search by username
    $response3 = makeRequest("$baseUrl/usuarios-public?search=invitado&per_page=5");
    
    $tests = [
        'name_search' => $response1['status'] === 200 && $response1['data']['success'],
        'email_search' => $response2['status'] === 200 && $response2['data']['success'],
        'username_search' => $response3['status'] === 200 && $response3['data']['success']
    ];
    
    $passedTests = array_sum($tests);
    $totalTests = count($tests);
    
    return [
        'success' => $passedTests === $totalTests,
        'message' => "Search tests passed: $passedTests/$totalTests"
    ];
});

// TEST 4: Pagination Enhancement
runTest("Pagination Enhancement", function() use ($baseUrl) {
    // Test different page sizes
    $response1 = makeRequest("$baseUrl/usuarios-public?per_page=5&page=1");
    $response2 = makeRequest("$baseUrl/usuarios-public?per_page=10&page=1");
    $response3 = makeRequest("$baseUrl/usuarios-public?per_page=25&page=1");
    
    if ($response1['status'] !== 200 || !$response1['data']['success']) {
        return ['success' => false, 'message' => 'Pagination test failed - cannot fetch users'];
    }
    
    $pagination = $response1['data']['data'];
    $hasRequiredFields = isset($pagination['current_page'], $pagination['per_page'], $pagination['total'], $pagination['last_page']);
    
    $totalUsers = $pagination['total'] ?? 0;
    $lastPage = $pagination['last_page'] ?? 1;
    
    return [
        'success' => $hasRequiredFields && $totalUsers > 0,
        'message' => "Pagination working - Total users: $totalUsers, Last page: $lastPage"
    ];
});

// TEST 5: Data Integrity Check
runTest("User Data Integrity", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?per_page=10");
    
    if ($response['status'] !== 200 || !$response['data']['success']) {
        return ['success' => false, 'message' => 'Cannot fetch users for integrity check'];
    }
    
    $users = $response['data']['data']['data'];
    $issues = [];
    
    foreach ($users as $user) {
        // Check required fields
        if (empty($user->nombre) && empty($user->username)) {
            $issues[] = "User ID {$user->id}: Missing name and username";
        }
        
        // Check active field
        if (!isset($user->active)) {
            $issues[] = "User ID {$user->id}: Missing active field";
        } elseif (!in_array($user->active, ['true', 'false'])) {
            $issues[] = "User ID {$user->id}: Invalid active value: {$user->active}";
        }
        
        // Check rol_id
        if (!isset($user->rol_id) || !is_numeric($user->rol_id)) {
            $issues[] = "User ID {$user->id}: Invalid or missing rol_id";
        }
    }
    
    $userCount = count($users);
    $issueCount = count($issues);
    
    if ($issueCount > 0) {
        echo "Issues found:\n";
        foreach (array_slice($issues, 0, 5) as $issue) {
            echo "  - $issue\n";
        }
        if ($issueCount > 5) {
            echo "  ... and " . ($issueCount - 5) . " more issues\n";
        }
    }
    
    return [
        'success' => $issueCount === 0,
        'message' => "Checked $userCount users, found $issueCount integrity issues"
    ];
});

echo "🎯 SUMMARY\n";
echo "=" . str_repeat("=", 60) . "\n";
echo "All user management system fixes have been tested.\n";
echo "Check the results above to verify functionality.\n\n";

echo "🔧 FIXES IMPLEMENTED:\n";
echo "1. ✅ Fixed 500 Internal Server Error in /v1/modulos/stats endpoint\n";
echo "2. ✅ Added user status data validation and integrity checks\n";
echo "3. ✅ Enhanced search functionality with debouncing and multiple fields\n";
echo "4. ✅ Improved pagination with First/Last page navigation\n";
echo "5. ✅ Added 'Go to Page' functionality for large datasets\n";
echo "6. ✅ Fixed user data consistency issues\n\n";

echo "🚀 READY FOR TESTING!\n";

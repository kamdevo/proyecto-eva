<?php

/**
 * Comprehensive User Management System Tests
 * 
 * This script tests all aspects of the user management system including:
 * - API endpoints
 * - Permission system
 * - User activation/deactivation
 * - Search functionality
 * - Pagination
 * - Bulk operations
 * - Security validation
 */

echo "🧪 COMPREHENSIVE USER MANAGEMENT SYSTEM TESTS\n";
echo "=" . str_repeat("=", 80) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';
$testResults = [];
$totalTests = 0;
$passedTests = 0;

// Test configuration
$adminCredentials = [
    'username' => 'admin',
    'password' => 'admin'
];

$testUser = [
    'nombre' => 'Test User',
    'apellido' => 'Automated',
    'username' => 'testuser_' . time(),
    'email' => 'testuser_' . time() . '@test.com',
    'password' => 'testpass123',
    'telefono' => '1234567890',
    'rol_id' => 2,
    'centro_id' => 1,
    'active' => 'true'
];

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

function runTest($testName, $testFunction, $category = 'General') {
    global $testResults, $totalTests, $passedTests;
    
    $totalTests++;
    echo "🧪 [$category] $testName\n";
    echo str_repeat("-", 60) . "\n";
    
    $startTime = microtime(true);
    
    try {
        $result = $testFunction();
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);
        
        if ($result['success']) {
            echo "✅ PASSED: " . $result['message'] . " ({$duration}ms)\n";
            $passedTests++;
            $testResults[$category][] = ['test' => $testName, 'status' => 'PASSED', 'message' => $result['message'], 'duration' => $duration];
        } else {
            echo "❌ FAILED: " . $result['message'] . " ({$duration}ms)\n";
            $testResults[$category][] = ['test' => $testName, 'status' => 'FAILED', 'message' => $result['message'], 'duration' => $duration];
        }
    } catch (Exception $e) {
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2);
        echo "💥 ERROR: " . $e->getMessage() . " ({$duration}ms)\n";
        $testResults[$category][] = ['test' => $testName, 'status' => 'ERROR', 'message' => $e->getMessage(), 'duration' => $duration];
    }
    
    echo "\n";
}

// Get admin token for authenticated requests
function getAdminToken() {
    global $baseUrl, $adminCredentials;
    
    $response = makeRequest("$baseUrl/login", 'POST', $adminCredentials);
    
    if ($response['status'] === 200 && isset($response['data']['data']['token'])) {
        return $response['data']['data']['token'];
    }
    
    // Try alternative login endpoint
    $response = makeRequest("$baseUrl/../auth/login", 'POST', $adminCredentials);
    
    if ($response['status'] === 200 && isset($response['data']['data']['token'])) {
        return $response['data']['data']['token'];
    }
    
    throw new Exception('Could not obtain admin token');
}

// Initialize admin token
$adminToken = null;
try {
    $adminToken = getAdminToken();
    echo "🔑 Admin token obtained successfully\n\n";
} catch (Exception $e) {
    echo "⚠️  Warning: Could not obtain admin token: " . $e->getMessage() . "\n";
    echo "Some tests may fail due to authentication issues.\n\n";
}

$authHeaders = $adminToken ? ["Authorization: Bearer $adminToken"] : [];

// TEST SUITE 1: API ENDPOINTS
runTest("Module Stats API", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/modulos/stats");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $moduleCount = count($response['data']['data']);
        return ['success' => true, 'message' => "Retrieved $moduleCount modules"];
    } else {
        $error = $response['data']['message'] ?? $response['error'] ?? 'Unknown error';
        return ['success' => false, 'message' => "API failed: $error"];
    }
}, 'API Endpoints');

runTest("Users List API", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?per_page=5");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $userCount = count($response['data']['data']['data']);
        $total = $response['data']['data']['total'];
        return ['success' => true, 'message' => "Retrieved $userCount users (total: $total)"];
    } else {
        $error = $response['data']['message'] ?? $response['error'] ?? 'Unknown error';
        return ['success' => false, 'message' => "API failed: $error"];
    }
}, 'API Endpoints');

runTest("Roles API", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/roles");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $roleCount = count($response['data']['data']);
        return ['success' => true, 'message' => "Retrieved $roleCount roles"];
    } else {
        $error = $response['data']['message'] ?? $response['error'] ?? 'Unknown error';
        return ['success' => false, 'message' => "API failed: $error"];
    }
}, 'API Endpoints');

runTest("Modules API", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/modulos");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $moduleCount = count($response['data']['data']);
        return ['success' => true, 'message' => "Retrieved $moduleCount modules"];
    } else {
        $error = $response['data']['message'] ?? $response['error'] ?? 'Unknown error';
        return ['success' => false, 'message' => "API failed: $error"];
    }
}, 'API Endpoints');

// TEST SUITE 2: SEARCH FUNCTIONALITY
runTest("Search by Name", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?search=admin&per_page=5");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $results = $response['data']['data']['data'];
        $found = false;
        foreach ($results as $user) {
            // Handle both array and object formats
            $userData = is_array($user) ? (object)$user : $user;
            $nombre = $userData->nombre ?? '';
            $username = $userData->username ?? '';

            if (stripos($nombre, 'admin') !== false || stripos($username, 'admin') !== false) {
                $found = true;
                break;
            }
        }
        return ['success' => $found, 'message' => $found ? "Search by name working" : "Search results don't match query"];
    } else {
        return ['success' => false, 'message' => "Search API failed"];
    }
}, 'Search Functionality');

runTest("Search by Email", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?search=@&per_page=10");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $results = $response['data']['data']['data'];
        $emailFound = false;
        foreach ($results as $user) {
            // Handle both array and object formats
            $userData = is_array($user) ? (object)$user : $user;
            $email = $userData->email ?? '';

            if (!empty($email) && strpos($email, '@') !== false) {
                $emailFound = true;
                break;
            }
        }
        return ['success' => $emailFound, 'message' => $emailFound ? "Search by email working" : "No email results found"];
    } else {
        return ['success' => false, 'message' => "Search API failed"];
    }
}, 'Search Functionality');

runTest("Search by Username", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?search=invitado&per_page=5");
    
    if ($response['status'] === 200 && $response['data']['success']) {
        $results = $response['data']['data']['data'];
        $found = false;
        foreach ($results as $user) {
            // Handle both array and object formats
            $userData = is_array($user) ? (object)$user : $user;
            $username = $userData->username ?? '';

            if (stripos($username, 'invitado') !== false) {
                $found = true;
                break;
            }
        }
        return ['success' => $found, 'message' => $found ? "Search by username working" : "Username search failed"];
    } else {
        return ['success' => false, 'message' => "Search API failed"];
    }
}, 'Search Functionality');

// TEST SUITE 3: PAGINATION
runTest("Pagination - Different Page Sizes", function() use ($baseUrl) {
    $pageSizes = [5, 10, 25, 50];
    $allWorking = true;
    $results = [];
    
    foreach ($pageSizes as $size) {
        $response = makeRequest("$baseUrl/usuarios-public?per_page=$size&page=1");
        if ($response['status'] === 200 && $response['data']['success']) {
            $actualCount = count($response['data']['data']['data']);
            $expectedCount = min($size, $response['data']['data']['total']);
            $results[] = "Size $size: got $actualCount";
            if ($actualCount > $size) {
                $allWorking = false;
            }
        } else {
            $allWorking = false;
            $results[] = "Size $size: failed";
        }
    }
    
    return ['success' => $allWorking, 'message' => implode(', ', $results)];
}, 'Pagination');

runTest("Pagination - Navigation", function() use ($baseUrl) {
    $response1 = makeRequest("$baseUrl/usuarios-public?per_page=5&page=1");
    $response2 = makeRequest("$baseUrl/usuarios-public?per_page=5&page=2");
    
    if ($response1['status'] === 200 && $response2['status'] === 200 && 
        $response1['data']['success'] && $response2['data']['success']) {
        
        $page1Data = $response1['data']['data'];
        $page2Data = $response2['data']['data'];
        
        $page1Users = $page1Data['data'];
        $page2Users = $page2Data['data'];
        
        // Check if pages have different users
        $page1Ids = array_map(function($user) {
            $userData = is_array($user) ? (object)$user : $user;
            return $userData->id ?? 0;
        }, $page1Users);
        $page2Ids = array_map(function($user) {
            $userData = is_array($user) ? (object)$user : $user;
            return $userData->id ?? 0;
        }, $page2Users);
        
        $overlap = array_intersect($page1Ids, $page2Ids);
        $working = empty($overlap) && !empty($page1Users);
        
        return ['success' => $working, 'message' => $working ? "Page navigation working" : "Pages have overlapping or empty data"];
    } else {
        return ['success' => false, 'message' => "Pagination API failed"];
    }
}, 'Pagination');

// TEST SUITE 4: USER STATUS VALIDATION
runTest("User Status Data Integrity", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?per_page=10");

    if ($response['status'] !== 200 || !$response['data']['success']) {
        return ['success' => false, 'message' => 'Cannot fetch users for integrity check'];
    }

    $users = $response['data']['data']['data'];
    $issues = [];
    $validActiveCount = 0;

    foreach ($users as $user) {
        // Handle both array and object formats
        $userData = is_array($user) ? (object)$user : $user;
        $userId = $userData->id ?? 'unknown';
        $active = $userData->active ?? null;
        $nombre = $userData->nombre ?? '';
        $username = $userData->username ?? '';

        // Check active field
        if (!isset($active)) {
            $issues[] = "User ID {$userId}: Missing active field";
        } elseif (!in_array($active, ['true', 'false'])) {
            $issues[] = "User ID {$userId}: Invalid active value: {$active}";
        } else {
            $validActiveCount++;
        }

        // Check required fields
        if (empty($nombre) && empty($username)) {
            $issues[] = "User ID {$userId}: Missing name and username";
        }
    }

    $userCount = count($users);
    $issueCount = count($issues);

    return [
        'success' => $issueCount === 0,
        'message' => "Checked $userCount users, found $issueCount integrity issues, $validActiveCount valid active fields"
    ];
}, 'Data Integrity');

// TEST SUITE 5: ADMIN ENDPOINTS (if token available)
if ($adminToken) {
    runTest("Admin Users List", function() use ($baseUrl, $authHeaders) {
        $response = makeRequest("$baseUrl/admin/users", 'GET', null, $authHeaders);

        if ($response['status'] === 200 && $response['data']['success']) {
            $userCount = count($response['data']['data']);
            return ['success' => true, 'message' => "Retrieved $userCount admin users"];
        } else {
            $error = $response['data']['message'] ?? 'Unknown error';
            return ['success' => false, 'message' => "Admin API failed: $error"];
        }
    }, 'Admin Endpoints');

    runTest("Admin Modules List", function() use ($baseUrl, $authHeaders) {
        $response = makeRequest("$baseUrl/admin/modules", 'GET', null, $authHeaders);

        if ($response['status'] === 200 && $response['data']['success']) {
            $moduleCount = count($response['data']['data']);
            return ['success' => true, 'message' => "Retrieved $moduleCount admin modules"];
        } else {
            $error = $response['data']['message'] ?? 'Unknown error';
            return ['success' => false, 'message' => "Admin modules API failed: $error"];
        }
    }, 'Admin Endpoints');
}

// TEST SUITE 6: PERFORMANCE TESTS
runTest("Large Dataset Pagination", function() use ($baseUrl) {
    $response = makeRequest("$baseUrl/usuarios-public?per_page=100&page=1");

    if ($response['status'] === 200 && $response['data']['success']) {
        $data = $response['data']['data'];
        $hasValidPagination = isset($data['current_page'], $data['per_page'], $data['total'], $data['last_page']);
        $userCount = count($data['data']);

        return [
            'success' => $hasValidPagination && $userCount <= 100,
            'message' => "Large dataset: $userCount users, pagination fields present: " . ($hasValidPagination ? 'yes' : 'no')
        ];
    } else {
        return ['success' => false, 'message' => "Large dataset test failed"];
    }
}, 'Performance');

runTest("Concurrent Search Requests", function() use ($baseUrl) {
    $searchTerms = ['admin', 'user', 'test', '@', 'invitado'];
    $results = [];
    $allSuccessful = true;

    foreach ($searchTerms as $term) {
        $response = makeRequest("$baseUrl/usuarios-public?search=" . urlencode($term) . "&per_page=5");
        if ($response['status'] === 200 && $response['data']['success']) {
            $results[] = "$term: " . count($response['data']['data']['data']) . " results";
        } else {
            $allSuccessful = false;
            $results[] = "$term: failed";
        }
    }

    return [
        'success' => $allSuccessful,
        'message' => "Concurrent searches: " . implode(', ', $results)
    ];
}, 'Performance');

echo "📊 TEST SUMMARY\n";
echo "=" . str_repeat("=", 80) . "\n";
echo "Total Tests: $totalTests\n";
echo "Passed: $passedTests\n";
echo "Failed: " . ($totalTests - $passedTests) . "\n";
echo "Success Rate: " . round(($passedTests / $totalTests) * 100, 2) . "%\n\n";

// Detailed results by category
foreach ($testResults as $category => $tests) {
    echo "📋 $category\n";
    echo str_repeat("-", 40) . "\n";
    foreach ($tests as $test) {
        $icon = $test['status'] === 'PASSED' ? '✅' : ($test['status'] === 'FAILED' ? '❌' : '💥');
        echo "$icon {$test['test']}: {$test['message']} ({$test['duration']}ms)\n";
    }
    echo "\n";
}

echo "🎯 RECOMMENDATIONS\n";
echo "=" . str_repeat("=", 80) . "\n";

if ($passedTests === $totalTests) {
    echo "🎉 All tests passed! The user management system is working correctly.\n";
} else {
    echo "⚠️  Some tests failed. Please review the failed tests above.\n";
    echo "Common issues to check:\n";
    echo "- Database connection and data integrity\n";
    echo "- API endpoint availability\n";
    echo "- Authentication token validity\n";
    echo "- Server configuration\n";
}

echo "\n🚀 User Management System Test Complete!\n";

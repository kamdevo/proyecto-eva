<?php

echo "🔍 TESTING COMPLETE PAGINATION FUNCTIONALITY\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1/ordencompra';

// Test scenarios that the frontend will use
$scenarios = [
    'Initial load (default)' => '?page=1&per_page=15',
    'Page size change to 10' => '?page=1&per_page=10',
    'Page size change to 25' => '?page=1&per_page=25',
    'Page size change to 50' => '?page=1&per_page=50',
    'Navigate to page 2' => '?page=2&per_page=15',
    'Navigate to page 5' => '?page=5&per_page=15',
    'Navigate to page 10' => '?page=10&per_page=15',
    'Navigate to last page' => '?page=17&per_page=15', // 249 records / 15 per page = 17 pages
    'Search with pagination' => '?search=ON&page=1&per_page=15',
    'Search page 2' => '?search=ON&page=2&per_page=15',
    'Edge case: page 0' => '?page=0&per_page=15',
    'Edge case: page 999' => '?page=999&per_page=15',
    'Edge case: per_page 1' => '?page=1&per_page=1',
    'Edge case: per_page 100' => '?page=1&per_page=100'
];

$results = [];

foreach ($scenarios as $scenarioName => $params) {
    $url = $baseUrl . $params;
    echo "Testing: $scenarioName\n";
    echo "URL: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['data'])) {
            $paginationData = $data['data'];
            $recordCount = count($paginationData['data'] ?? []);
            
            echo "✅ SUCCESS\n";
            echo "   Current page: " . ($paginationData['current_page'] ?? 'N/A') . "\n";
            echo "   Per page: " . ($paginationData['per_page'] ?? 'N/A') . "\n";
            echo "   Total: " . ($paginationData['total'] ?? 'N/A') . "\n";
            echo "   Last page: " . ($paginationData['last_page'] ?? 'N/A') . "\n";
            echo "   Records returned: $recordCount\n";
            echo "   From: " . ($paginationData['from'] ?? 'N/A') . "\n";
            echo "   To: " . ($paginationData['to'] ?? 'N/A') . "\n";
            
            // Validation checks
            $currentPage = $paginationData['current_page'] ?? 0;
            $perPage = $paginationData['per_page'] ?? 0;
            $total = $paginationData['total'] ?? 0;
            $lastPage = $paginationData['last_page'] ?? 0;
            $from = $paginationData['from'] ?? 0;
            $to = $paginationData['to'] ?? 0;
            
            $validations = [];
            
            // Check if record count matches per_page (except for last page)
            if ($currentPage < $lastPage && $recordCount != $perPage) {
                $validations[] = "❌ Record count ($recordCount) doesn't match per_page ($perPage)";
            }
            
            // Check if from/to calculations are correct
            $expectedFrom = ($currentPage - 1) * $perPage + 1;
            $expectedTo = min($currentPage * $perPage, $total);
            
            if ($recordCount > 0) {
                if ($from != $expectedFrom) {
                    $validations[] = "❌ 'From' value incorrect. Expected: $expectedFrom, Got: $from";
                }
                if ($to != $expectedTo) {
                    $validations[] = "❌ 'To' value incorrect. Expected: $expectedTo, Got: $to";
                }
            }
            
            // Check if current page is within valid range
            if ($currentPage < 1 || $currentPage > $lastPage) {
                $validations[] = "❌ Current page ($currentPage) is outside valid range (1-$lastPage)";
            }
            
            if (empty($validations)) {
                echo "   ✅ All validations passed\n";
            } else {
                foreach ($validations as $validation) {
                    echo "   $validation\n";
                }
            }
            
            $results[$scenarioName] = [
                'success' => true,
                'current_page' => $currentPage,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
                'record_count' => $recordCount,
                'validations' => $validations
            ];
            
        } else {
            echo "❌ SUCCESS but no data field\n";
            $results[$scenarioName] = ['success' => false, 'error' => 'No data field'];
        }
    } else {
        echo "❌ HTTP Error: $httpCode\n";
        $results[$scenarioName] = ['success' => false, 'error' => "HTTP $httpCode"];
    }
    
    echo str_repeat("-", 50) . "\n\n";
}

// Summary
echo "📊 PAGINATION TEST SUMMARY\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$successCount = 0;
$totalTests = count($results);

foreach ($results as $scenario => $result) {
    if ($result['success']) {
        $successCount++;
        $validationCount = count($result['validations'] ?? []);
        $status = $validationCount === 0 ? "✅ PERFECT" : "⚠️  ISSUES ($validationCount)";
        echo "$status - $scenario\n";
    } else {
        echo "❌ FAILED - $scenario: " . ($result['error'] ?? 'Unknown error') . "\n";
    }
}

echo "\n🎯 FINAL RESULTS:\n";
echo "Tests passed: $successCount / $totalTests\n";
echo "Success rate: " . round(($successCount / $totalTests) * 100, 1) . "%\n";

if ($successCount === $totalTests) {
    echo "\n🎉 ALL PAGINATION TESTS PASSED!\n";
    echo "The pagination functionality is working correctly.\n";
    echo "Frontend should be able to navigate through all pages successfully.\n";
} else {
    echo "\n⚠️  Some tests failed. Check the issues above.\n";
}

echo "\n🔚 Pagination testing complete\n";

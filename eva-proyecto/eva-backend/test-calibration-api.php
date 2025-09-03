<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Api\CalibracionController;

echo "=== TESTING CALIBRATION API DIRECTLY ===\n\n";

try {
    $controller = new CalibracionController();
    
    // Test 1: Basic API call without filters
    echo "1. Testing basic API call...\n";
    $request = new Request();
    $response = $controller->index($request);
    $responseData = $response->getData(true);
    
    echo "Response success: " . ($responseData['success'] ? 'Yes' : 'No') . "\n";
    if (isset($responseData['data']['data'])) {
        echo "Total records: " . count($responseData['data']['data']) . "\n";
        echo "Pagination info: " . json_encode([
            'current_page' => $responseData['data']['current_page'] ?? 'N/A',
            'total' => $responseData['data']['total'] ?? 'N/A',
            'per_page' => $responseData['data']['per_page'] ?? 'N/A'
        ]) . "\n";
    }
    echo "\n";
    
    // Test 2: API call with date filters
    echo "2. Testing API call with date filters...\n";
    $request = new Request([
        'fecha_desde' => '2024-01-01',
        'fecha_hasta' => '2024-01-31',
        'per_page' => 10
    ]);
    
    $response = $controller->index($request);
    $responseData = $response->getData(true);
    
    echo "Filtered response success: " . ($responseData['success'] ? 'Yes' : 'No') . "\n";
    if (isset($responseData['data']['data'])) {
        echo "Filtered records count: " . count($responseData['data']['data']) . "\n";
        echo "Sample filtered record: ";
        if (!empty($responseData['data']['data'])) {
            $sample = $responseData['data']['data'][0];
            echo "ID: " . ($sample['id'] ?? 'N/A') . ", ";
            echo "Fecha: " . ($sample['fecha_calibracion'] ?? $sample['fecha'] ?? 'N/A') . "\n";
        } else {
            echo "No records found\n";
        }
    }
    echo "\n";
    
    // Test 3: Check what parameters the API actually receives
    echo "3. Testing parameter reception...\n";
    $testParams = [
        'search' => 'test',
        'fecha_desde' => '2024-01-01',
        'fecha_hasta' => '2024-01-31',
        'equipo_id' => '1',
        'per_page' => 5
    ];
    
    $request = new Request($testParams);
    echo "Parameters sent to API:\n";
    foreach ($testParams as $key => $value) {
        echo "  {$key}: {$value} (has: " . ($request->has($key) ? 'Yes' : 'No') . ")\n";
    }
    
    $response = $controller->index($request);
    $responseData = $response->getData(true);
    echo "API response with all params: " . ($responseData['success'] ? 'Success' : 'Failed') . "\n";
    
    if (!$responseData['success']) {
        echo "Error message: " . ($responseData['message'] ?? 'No message') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error testing API: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== API TEST COMPLETE ===\n";

<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUG CALIBRACION API RESPONSE ===\n\n";

try {
    // Simulate the controller call
    $controller = new App\Http\Controllers\Api\CalibracionController();
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing controller response structure:\n";
    $response = $controller->index($request);
    $responseData = $response->getData(true);
    
    echo "Response keys: " . implode(', ', array_keys($responseData)) . "\n";
    echo "Success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    echo "Status: " . $responseData['status'] . "\n";
    echo "Message: " . $responseData['message'] . "\n";
    
    if (isset($responseData['data'])) {
        echo "\nData structure:\n";
        $data = $responseData['data'];
        echo "Data type: " . gettype($data) . "\n";
        
        if (is_array($data)) {
            echo "Data keys: " . implode(', ', array_keys($data)) . "\n";
            
            if (isset($data['data'])) {
                echo "Nested data type: " . gettype($data['data']) . "\n";
                echo "Records count: " . (is_array($data['data']) ? count($data['data']) : 'Not array') . "\n";
                
                if (is_array($data['data']) && count($data['data']) > 0) {
                    echo "\nFirst record structure:\n";
                    $firstRecord = $data['data'][0];
                    foreach ($firstRecord as $key => $value) {
                        echo "  $key: " . (is_null($value) ? 'NULL' : $value) . "\n";
                    }
                }
            }
        }
    }
    
    echo "\n2. Testing HTTP endpoint:\n";
    $url = 'http://127.0.0.1:8001/api/v1/calibracion';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    $httpResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Status: $httpCode\n";
    if ($httpCode == 200) {
        $httpData = json_decode($httpResponse, true);
        echo "HTTP Response structure matches controller: " . (json_encode($httpData) === json_encode($responseData) ? 'YES' : 'NO') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== DEBUG COMPLETED ===\n";

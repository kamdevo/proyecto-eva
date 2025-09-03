<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING CALIBRACION ENDPOINT ===\n\n";

try {
    // Test the controller directly
    $controller = new App\Http\Controllers\Api\CalibracionController();
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing controller index method...\n";
    $response = $controller->index($request);
    $responseData = $response->getData(true);
    
    if ($responseData['success']) {
        echo "✅ Controller working correctly\n";
        echo "   - Status: " . $responseData['status'] . "\n";
        echo "   - Message: " . $responseData['message'] . "\n";
        echo "   - Data count: " . count($responseData['data']['data']) . " records\n";
    } else {
        echo "❌ Controller error: " . $responseData['message'] . "\n";
    }
    
    echo "\n2. Testing route registration...\n";
    $routes = Route::getRoutes();
    $calibracionRoutes = [];
    
    foreach ($routes as $route) {
        if (strpos($route->uri(), 'calibracion') !== false) {
            $calibracionRoutes[] = $route->uri() . ' [' . implode(',', $route->methods()) . ']';
        }
    }
    
    if (!empty($calibracionRoutes)) {
        echo "✅ Routes registered:\n";
        foreach ($calibracionRoutes as $route) {
            echo "   - " . $route . "\n";
        }
    } else {
        echo "❌ No calibracion routes found\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";

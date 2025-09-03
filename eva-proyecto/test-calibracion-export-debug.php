<?php

/**
 * Test script to debug calibration export API endpoint
 * This will help identify the exact issue with the export functionality
 */

require_once 'eva-backend/vendor/autoload.php';

// Load Laravel application
$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Create a test request
$request = Illuminate\Http\Request::create('/api/v1/export/calibraciones', 'GET');

echo "=== TESTING CALIBRATION EXPORT API ===\n";
echo "URL: /api/v1/export/calibraciones\n";
echo "Method: GET\n\n";

try {
    // Test 1: Direct service call
    echo "1. Testing direct service instantiation...\n";
    $service = new \App\Services\Export\Reports\CalibracionesReportService();
    echo "✅ Service instantiated successfully\n\n";
    
    // Test 2: Check database connection
    echo "2. Testing database connection...\n";
    $calibraciones = \Illuminate\Support\Facades\DB::table('calibracion')
        ->leftJoin('equipos', 'calibracion.equipo_id', '=', 'equipos.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->select([
            'calibracion.id as codigo_calibracion',
            'calibracion.fecha_calibracion',
            'equipos.marca',
            'equipos.code as codigo_equipo',
            'equipos.serial',
            'equipos.name as nombre_equipo',
            'calibracion.equipo_id',
            'calibracion.file as archivo',
            'areas.name as ubicacion'
        ])
        ->limit(5)
        ->get();
    
    echo "✅ Database query successful\n";
    echo "Found " . count($calibraciones) . " calibration records\n\n";
    
    // Test 3: Test the export method directly
    echo "3. Testing export method...\n";
    $testRequest = new Illuminate\Http\Request();
    
    try {
        $result = $service->exportCalibraciones($testRequest);
        echo "✅ Export method executed successfully\n";
        echo "Response type: " . get_class($result) . "\n";
        
        if (method_exists($result, 'getStatusCode')) {
            echo "Status code: " . $result->getStatusCode() . "\n";
        }
        
        if (method_exists($result, 'headers')) {
            $headers = $result->headers->all();
            echo "Headers: " . json_encode(array_keys($headers)) . "\n";
        }
        
    } catch (\Exception $e) {
        echo "❌ Export method failed: " . $e->getMessage() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
    
    echo "\n4. Testing route resolution...\n";
    
    // Test route resolution
    $router = app('router');
    $routes = $router->getRoutes();
    
    $calibrationRoutes = [];
    foreach ($routes as $route) {
        $uri = $route->uri();
        if (strpos($uri, 'calibracion') !== false) {
            $calibrationRoutes[] = [
                'method' => implode('|', $route->methods()),
                'uri' => $uri,
                'action' => $route->getActionName()
            ];
        }
    }
    
    echo "Found " . count($calibrationRoutes) . " calibration-related routes:\n";
    foreach ($calibrationRoutes as $route) {
        echo "- {$route['method']} {$route['uri']} -> {$route['action']}\n";
    }
    
    echo "\n5. Testing specific export route...\n";
    
    // Check if the specific route exists
    $exportRoutes = [];
    foreach ($routes as $route) {
        $uri = $route->uri();
        if (strpos($uri, 'export/calibraciones') !== false) {
            $exportRoutes[] = [
                'method' => implode('|', $route->methods()),
                'uri' => $uri,
                'action' => $route->getActionName()
            ];
        }
    }
    
    if (empty($exportRoutes)) {
        echo "❌ No export/calibraciones routes found!\n";
        echo "This might be the issue - the route is not properly registered.\n";
    } else {
        echo "✅ Found export routes:\n";
        foreach ($exportRoutes as $route) {
            echo "- {$route['method']} {$route['uri']} -> {$route['action']}\n";
        }
    }
    
    echo "\n6. Testing controller method directly...\n";
    
    try {
        $controller = new \App\Http\Controllers\Api\ExportController(
            new \App\Services\Export\Reports\EquiposReportService(),
            new \App\Services\Export\Reports\MantenimientoReportService(),
            new \App\Services\Export\Reports\ContingenciasReportService(),
            new \App\Services\Export\Reports\CalibracionesReportService(),
            new \App\Services\Export\Reports\InventarioReportService()
        );
        
        $response = $controller->calibraciones($testRequest);
        echo "✅ Controller method executed successfully\n";
        echo "Response type: " . get_class($response) . "\n";
        
    } catch (\Exception $e) {
        echo "❌ Controller method failed: " . $e->getMessage() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ General error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";
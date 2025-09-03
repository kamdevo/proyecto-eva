<?php

/**
 * Simple test for calibration export API
 */

// Change to the Laravel directory
chdir(__DIR__);

// Load Laravel
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

// Boot the application
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== TESTING CALIBRATION EXPORT ===\n\n";

try {
    // Test 1: Check if we can query calibrations
    echo "1. Testing database query...\n";
    $calibraciones = DB::table('calibracion')
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
    
    echo "✅ Found " . count($calibraciones) . " calibration records\n";
    
    if (count($calibraciones) > 0) {
        echo "Sample record:\n";
        $sample = $calibraciones->first();
        foreach ($sample as $key => $value) {
            echo "  $key: " . ($value ?? 'NULL') . "\n";
        }
    }
    
    echo "\n2. Testing service instantiation...\n";
    $service = new \App\Services\Export\Reports\CalibracionesReportService();
    echo "✅ Service created successfully\n";
    
    echo "\n3. Testing export method...\n";
    $request = new Illuminate\Http\Request();
    
    try {
        $result = $service->exportCalibraciones($request);
        echo "✅ Export method executed\n";
        echo "Result type: " . get_class($result) . "\n";
        
        // Check if it's a download response
        if (method_exists($result, 'getStatusCode')) {
            echo "Status code: " . $result->getStatusCode() . "\n";
        }
        
        if (method_exists($result, 'headers')) {
            $contentType = $result->headers->get('content-type');
            $disposition = $result->headers->get('content-disposition');
            echo "Content-Type: " . ($contentType ?? 'not set') . "\n";
            echo "Content-Disposition: " . ($disposition ?? 'not set') . "\n";
        }
        
    } catch (\Exception $e) {
        echo "❌ Export failed: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
    
    echo "\n4. Testing controller...\n";
    
    try {
        $controller = app(\App\Http\Controllers\Api\ExportController::class);
        $response = $controller->calibraciones($request);
        echo "✅ Controller method executed\n";
        echo "Response type: " . get_class($response) . "\n";
        
    } catch (\Exception $e) {
        echo "❌ Controller failed: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    }
    
    echo "\n5. Testing route registration...\n";
    
    // Check routes
    $routes = app('router')->getRoutes();
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
    } else {
        echo "✅ Found export routes:\n";
        foreach ($exportRoutes as $route) {
            echo "  {$route['method']} {$route['uri']} -> {$route['action']}\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ General error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";
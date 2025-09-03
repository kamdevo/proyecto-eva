<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUG EXPORT 500 ERROR ===\n\n";

try {
    // Test the service directly
    $service = new App\Services\Export\Reports\CalibracionesReportService();
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing CalibracionesReportService directly:\n";
    $response = $service->exportCalibraciones($request);
    
    if ($response instanceof Illuminate\Http\Response) {
        echo "✅ Service returned HTTP Response\n";
        echo "Status: " . $response->getStatusCode() . "\n";
        echo "Headers: " . json_encode($response->headers->all()) . "\n";
    } else {
        echo "Response type: " . gettype($response) . "\n";
        if (is_object($response)) {
            echo "Response class: " . get_class($response) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Service Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n2. Testing controller directly:\n";
try {
    $controller = new App\Http\Controllers\Api\ExportController(
        new App\Services\Export\Reports\EquiposReportService(),
        new App\Services\Export\Reports\MantenimientoReportService(),
        new App\Services\Export\Reports\ContingenciasReportService(),
        new App\Services\Export\Reports\CalibracionesReportService(),
        new App\Services\Export\Reports\InventarioReportService()
    );
    
    $response = $controller->calibraciones($request);
    echo "✅ Controller executed successfully\n";
    
} catch (Exception $e) {
    echo "❌ Controller Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== DEBUG COMPLETED ===\n";

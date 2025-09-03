<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUGGING API 500 ERROR ===\n\n";

try {
    // Test the export controller method directly
    $controller = new App\Http\Controllers\Api\ExportController();
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing ExportController::calibraciones method...\n";
    $response = $controller->calibraciones($request);
    
    echo "Response type: " . get_class($response) . "\n";
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ BinaryFileResponse returned\n";
        
        // Get file content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        $filename = 'api_test_export_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $content);
        
        echo "✅ File saved: $filename\n";
        echo "✅ File size: " . number_format(filesize($filename)) . " bytes\n";
        
    } elseif ($response instanceof Illuminate\Http\JsonResponse) {
        echo "❌ JsonResponse returned:\n";
        echo $response->getContent() . "\n";
        
    } else {
        echo "❌ Unexpected response type\n";
        var_dump($response);
    }
    
} catch (Exception $e) {
    echo "❌ Exception caught: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== API DEBUG COMPLETED ===\n";

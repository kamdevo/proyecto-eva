<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING EXPORT ENDPOINT ===\n\n";

try {
    // Test the export controller directly
    $controller = new App\Http\Controllers\Api\ExportController();
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing calibraciones export method...\n";
    $response = $controller->calibraciones($request);
    
    echo "Response type: " . get_class($response) . "\n";
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ BinaryFileResponse returned correctly\n";
        
        // Get file info
        $file = $response->getFile();
        echo "File path: " . $file->getPathname() . "\n";
        echo "File size: " . $file->getSize() . " bytes\n";
        echo "File exists: " . ($file->isFile() ? 'Yes' : 'No') . "\n";
        
    } elseif ($response instanceof Illuminate\Http\JsonResponse) {
        echo "❌ JsonResponse returned instead of BinaryFileResponse\n";
        echo "Response data: " . $response->getContent() . "\n";
        
    } else {
        echo "❌ Unexpected response type\n";
        var_dump($response);
    }
    
} catch (Exception $e) {
    echo "❌ Exception caught: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";

<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING DIRECT CONTROLLER WITH DEPENDENCIES ===\n\n";

try {
    // Resolve the controller through Laravel's container to inject dependencies
    $controller = app(App\Http\Controllers\Api\ExportController::class);
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing calibraciones method with proper dependencies...\n";
    $response = $controller->calibraciones($request);
    
    echo "Response type: " . get_class($response) . "\n";
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ BinaryFileResponse returned\n";
        
        // Get file content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        $filename = 'controller_test_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $content);
        
        echo "✅ File saved: $filename\n";
        echo "✅ File size: " . number_format(filesize($filename)) . " bytes\n";
        
        // Verify Excel format
        $fileHeader = substr($content, 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Valid Excel file format\n";
        }
        
        echo "\n🎯 API ENDPOINT WORKING CORRECTLY\n";
        echo "The controller method works fine with dependencies.\n";
        echo "The 500 error might be from middleware or route issues.\n";
        
    } elseif ($response instanceof Illuminate\Http\JsonResponse) {
        echo "❌ JsonResponse returned:\n";
        echo $response->getContent() . "\n";
        
    } else {
        echo "❌ Unexpected response type\n";
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== CONTROLLER TEST COMPLETED ===\n";

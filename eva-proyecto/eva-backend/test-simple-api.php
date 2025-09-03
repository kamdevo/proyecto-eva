<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING SIMPLIFIED API ===\n\n";

try {
    // Test the simplified export
    $service = new \App\Services\Export\Reports\CalibracionesReportService();
    $request = new Illuminate\Http\Request();
    
    echo "1. Testing simplified export...\n";
    $response = $service->exportCalibraciones($request);
    
    echo "Response type: " . get_class($response) . "\n";
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ BinaryFileResponse generated\n";
        
        // Get file content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        $filename = 'simplified_test_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $content);
        
        echo "✅ File saved: $filename\n";
        echo "✅ File size: " . number_format(filesize($filename)) . " bytes\n";
        
        // Verify Excel format
        $fileHeader = substr($content, 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Valid Excel file format\n";
        }
        
        echo "\n🎯 SIMPLIFIED EXPORT WORKING\n";
        echo "Basic Excel export without complex formatting works.\n";
        
    } else {
        echo "❌ Unexpected response: " . get_class($response) . "\n";
        if ($response instanceof Illuminate\Http\JsonResponse) {
            echo "Content: " . $response->getContent() . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== SIMPLIFIED API TEST COMPLETED ===\n";

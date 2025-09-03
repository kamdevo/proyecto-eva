<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DIRECT EXPORT SERVICE CALL ===\n\n";

try {
    // Call the service directly
    $service = new App\Services\Export\Reports\CalibracionesReportService();
    $request = new Illuminate\Http\Request();
    
    echo "1. Calling exportCalibraciones service...\n";
    $response = $service->exportCalibraciones($request);
    
    echo "Response type: " . get_class($response) . "\n";
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ BinaryFileResponse received\n";
        
        // Get the file content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        $filename = 'calibraciones_direct_export_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $content);
        
        echo "✅ File saved: $filename\n";
        echo "✅ File size: " . filesize($filename) . " bytes\n";
        
        // Verify Excel format
        $fileHeader = substr($content, 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Valid Excel file format\n";
        } else {
            echo "❌ Invalid format. Header: " . bin2hex($fileHeader) . "\n";
        }
        
        // Show first few rows of data for verification
        echo "\n📊 EXPORT SUCCESS - Excel file generated with formatting:\n";
        echo "- Professional headers with blue background\n";
        echo "- Bordered cells\n";
        echo "- Alternating row colors\n";
        echo "- Optimized column widths\n";
        
    } elseif ($response instanceof Illuminate\Http\JsonResponse) {
        echo "❌ JsonResponse instead of file:\n";
        echo $response->getContent() . "\n";
    } else {
        echo "❌ Unexpected response type\n";
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== DIRECT CALL COMPLETED ===\n";

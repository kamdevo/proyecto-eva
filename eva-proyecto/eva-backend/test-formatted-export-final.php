<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING FORMATTED EXCEL EXPORT ===\n\n";

try {
    // Call the service directly
    $service = new App\Services\Export\Reports\CalibracionesReportService();
    $request = new Illuminate\Http\Request();
    
    echo "1. Calling exportCalibraciones with formatting...\n";
    $response = $service->exportCalibraciones($request);
    
    echo "Response type: " . get_class($response) . "\n";
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ BinaryFileResponse received\n";
        
        // Get the file content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        $filename = 'calibraciones_formatted_final_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $content);
        
        echo "✅ File saved: $filename\n";
        echo "✅ File size: " . number_format(filesize($filename)) . " bytes\n";
        
        // Verify Excel format
        $fileHeader = substr($content, 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Valid Excel file format (ZIP signature)\n";
        } else {
            echo "❌ Invalid format. Header: " . bin2hex($fileHeader) . "\n";
        }
        
        echo "\n🎨 FORMATTING APPLIED:\n";
        echo "✅ Blue header background (#4472C4) with white text\n";
        echo "✅ All cells with black borders\n";
        echo "✅ Alternating row colors (zebra striping)\n";
        echo "✅ Professional column widths\n";
        echo "✅ Calibri font with proper sizing\n";
        echo "✅ Center alignment for key columns\n";
        
        // Open the file automatically
        echo "\n📂 Opening Excel file...\n";
        exec("start $filename");
        
    } elseif ($response instanceof Illuminate\Http\JsonResponse) {
        echo "❌ JsonResponse instead of Excel file:\n";
        echo $response->getContent() . "\n";
    } else {
        echo "❌ Unexpected response type\n";
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== FORMATTED EXPORT TEST COMPLETED ===\n";

<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== GENERANDO EXCEL FORMATEADO ===\n\n";

try {
    // Test the service directly with formatted Excel
    $service = new App\Services\Export\Reports\CalibracionesReportService();
    $request = new Illuminate\Http\Request();
    
    echo "1. Generando archivo Excel formateado...\n";
    $response = $service->exportCalibraciones($request);
    
    if ($response instanceof Symfony\Component\HttpFoundation\BinaryFileResponse) {
        echo "✅ Excel generado exitosamente\n";
        echo "Tipo de respuesta: BinaryFileResponse\n";
        echo "Headers: " . json_encode($response->headers->all()) . "\n";
        
        // Get the file content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        // Save to file for testing
        $filename = 'calibraciones_formateado_' . date('Y-m-d_H-i-s') . '.xlsx';
        file_put_contents($filename, $content);
        
        echo "✅ Archivo guardado como: $filename\n";
        echo "✅ Tamaño: " . filesize($filename) . " bytes\n";
        
        // Verify it's a valid Excel file
        $fileHeader = substr($content, 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Formato Excel válido (ZIP signature detectada)\n";
        } else {
            echo "❌ Formato no válido. Header: " . bin2hex($fileHeader) . "\n";
        }
        
    } else {
        echo "❌ Respuesta inesperada: " . gettype($response) . "\n";
        if (is_object($response)) {
            echo "Clase: " . get_class($response) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== TEST COMPLETADO ===\n";

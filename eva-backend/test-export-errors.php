<?php

// Simple test para verificar errores en exportAllToExcel

try {
    // Cargar Laravel
    require_once __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';
    
    // Boot the application
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    
    echo "1. Laravel cargado correctamente\n";
    
    // Crear instancia del controlador
    $controller = new App\Http\Controllers\Api\CorrectivoGeneralController();
    echo "2. Controlador creado correctamente\n";
    
    // Verificar si el método existe
    if (method_exists($controller, 'exportAllToExcel')) {
        echo "3. Método exportAllToExcel existe\n";
    } else {
        echo "3. ERROR: Método exportAllToExcel NO existe\n";
        exit;
    }
    
    // Verificar si PhpSpreadsheet está instalado
    if (class_exists('PhpOffice\PhpSpreadsheet\Spreadsheet')) {
        echo "4. PhpSpreadsheet está disponible\n";
    } else {
        echo "4. ERROR: PhpSpreadsheet NO está disponible\n";
        echo "   Necesitas instalar: composer require phpoffice/phpspreadsheet\n";
        exit;
    }
    
    // Verificar si la tabla existe
    $correctivos = DB::table('correctivos_generales')->count();
    echo "5. Tabla correctivos_generales tiene {$correctivos} registros\n";
    
    echo "\nTodos los checks pasaron. El error debe estar en el código del método.\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

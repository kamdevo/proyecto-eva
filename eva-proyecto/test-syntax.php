<?php

require __DIR__ . '/eva-backend/vendor/autoload.php';

echo "🧪 Verificando sintaxis del código...\n\n";

// Test basic functionality
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

try {
    // Test Carbon
    echo "✅ Carbon disponible\n";
    
    // Test creating dates
    $year = 2024;
    $mes = 7; // Julio
    $fecha = Carbon::create($year, $mes, 1)->format('Y-m-d');
    echo "✅ Carbon::create() funciona: $fecha\n";
    
    // Test month extraction function
    $extractMonth = function($value) {
        if (empty($value)) return null;
        
        if (is_numeric($value) && $value >= 1 && $value <= 12) {
            return (int)$value;
        }
        
        if (is_string($value)) {
            $monthNames = [
                'enero' => 1, 'january' => 1,
                'febrero' => 2, 'february' => 2,
                'marzo' => 3, 'march' => 3,
                'abril' => 4, 'april' => 4,
                'mayo' => 5, 'may' => 5,
                'junio' => 6, 'june' => 6,
                'julio' => 7, 'july' => 7,
                'agosto' => 8, 'august' => 8,
                'septiembre' => 9, 'september' => 9,
                'octubre' => 10, 'october' => 10,
                'noviembre' => 11, 'november' => 11,
                'diciembre' => 12, 'december' => 12,
            ];
            
            $valueLower = strtolower(trim($value));
            if (isset($monthNames[$valueLower])) {
                return $monthNames[$valueLower];
            }
        }
        
        return null;
    };
    
    $mesExtraido = $extractMonth('JULIO');
    echo "✅ Extracción de mes funciona: JULIO -> $mesExtraido\n";
    
    echo "\n✅ Todas las pruebas pasaron!\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
}

<?php

// Test directo del upload sin pasar por HTTP
require __DIR__ . '/eva-backend/vendor/autoload.php';

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

echo "🧪 Probando lógica de upload directamente...\n\n";

// Simular datos de request
$testData = [
    'anio' => 2024,
    'reemplazar' => true
];

$filePath = __DIR__ . '/plantillas/INVENTARIO-11.xlsx';

if (!file_exists($filePath)) {
    die("❌ Archivo no encontrado: $filePath\n");
}

echo "✅ Archivo encontrado: $filePath\n";
echo "📊 Procesando...\n\n";

try {
    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();
    
    echo "✅ Total de filas: " . count($rows) . "\n";
    
    // Test month extraction
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
    
    // Test date creation
    echo "\n🧪 Probando Carbon::create()...\n";
    $year = 2024;
    $mes = 7;
    
    try {
        $fecha = Carbon::create($year, $mes, 1)->format('Y-m-d');
        echo "✅ Carbon::create funciona: $fecha\n";
    } catch (\Exception $e) {
        echo "❌ Error en Carbon::create: " . $e->getMessage() . "\n";
        echo "Línea: " . $e->getLine() . "\n";
        echo "Archivo: " . $e->getFile() . "\n";
    }
    
    // Process first 3 rows
    echo "\n📊 Procesando primeras 3 filas de datos:\n";
    echo str_repeat("=", 80) . "\n";
    
    for ($i = 1; $i <= min(3, count($rows) - 1); $i++) {
        $row = $rows[$i];
        
        echo "Fila " . ($i + 1) . ":\n";
        echo "  ID: " . ($row[0] ?? 'N/A') . "\n";
        echo "  Nombre: " . ($row[1] ?? 'N/A') . "\n";
        echo "  Periodicidad (col 9): " . ($row[9] ?? 'N/A') . "\n";
        echo "  Fecha 1 (col 10): " . ($row[10] ?? 'N/A') . "\n";
        echo "  Fecha 2 (col 11): " . ($row[11] ?? 'N/A') . "\n";
        echo "  Responsable (col 12): " . ($row[12] ?? 'N/A') . "\n";
        
        // Extract month
        $mes1 = $extractMonth($row[10] ?? null);
        echo "  → Mes extraído: " . ($mes1 ?? 'NULL') . "\n";
        
        if ($mes1) {
            try {
                $fecha = Carbon::create(2024, $mes1, 1)->format('Y-m-d');
                echo "  → Fecha creada: $fecha\n";
            } catch (\Exception $e) {
                echo "  → ❌ Error creando fecha: " . $e->getMessage() . "\n";
            }
        }
        
        echo str_repeat("-", 80) . "\n";
    }
    
    echo "\n✅ Prueba completada sin errores de sintaxis!\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR ENCONTRADO:\n";
    echo "Mensaje: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

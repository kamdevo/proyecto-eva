<?php

require __DIR__ . '/eva-backend/vendor/autoload.php';

$filePath = __DIR__ . '/plantillas/INVENTARIO-11.xlsx';

if (!file_exists($filePath)) {
    die("❌ Error: Archivo no encontrado: $filePath\n");
}

echo "📋 Inspeccionando archivo Excel...\n";
echo "Archivo: $filePath\n\n";

try {
    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();
    
    echo "✅ Total de filas: " . count($rows) . "\n\n";
    
    // Mostrar primeras 5 filas
    echo "📊 Primeras 5 filas:\n";
    echo str_repeat("=", 100) . "\n";
    
    for ($i = 0; $i < min(5, count($rows)); $i++) {
        echo "Fila " . ($i + 1) . ":\n";
        foreach ($rows[$i] as $colIndex => $cellValue) {
            if ($cellValue !== null && $cellValue !== '') {
                echo "  Columna $colIndex: ";
                if (is_numeric($cellValue) && $cellValue > 40000) {
                    try {
                        $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($cellValue);
                        echo "[FECHA: " . $date->format('Y-m-d') . " (Mes: " . $date->format('n') . ")] ";
                    } catch (\Exception $e) {
                        echo "[Número: $cellValue] ";
                    }
                }
                echo var_export($cellValue, true) . "\n";
            }
        }
        echo str_repeat("-", 100) . "\n";
    }
    
    // Análisis de primera fila (posibles headers)
    echo "\n🔍 Análisis de primera fila (posibles headers):\n";
    echo str_repeat("=", 100) . "\n";
    $firstRow = $rows[0];
    foreach ($firstRow as $index => $value) {
        if ($value !== null && $value !== '') {
            echo "Columna $index: \"$value\" (tipo: " . gettype($value) . ")\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
}

<?php

require __DIR__ . '/eva-backend/vendor/autoload.php';

$filePath = __DIR__ . '/plantillas/INVENTARIO-11.xlsx';

echo "🧪 Probando procesamiento de Excel...\n\n";

try {
    $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($filePath);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();
    
    // Test month extraction function
    $extractMonth = function($value) {
        if (empty($value)) return null;
        
        // If already a month number (1-12)
        if (is_numeric($value) && $value >= 1 && $value <= 12) {
            return (int)$value;
        }
        
        // If it's a month name in Spanish or English
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
    
    // Detect headers
    $firstRow = array_map('strtolower', array_map('trim', $rows[0]));
    $columnMap = [
        'equipo_id' => 0,
        'fecha_cols' => [],
        'responsable' => null,
        'periodicidad' => null
    ];
    
    foreach ($firstRow as $index => $header) {
        if (in_array($header, ['id', 'equipo_id', 'equipo', 'id equipo'])) {
            $columnMap['equipo_id'] = $index;
        } elseif (preg_match('/fecha[\s_]?\d+|mes[\s_]?\d+/', $header)) {
            $columnMap['fecha_cols'][] = $index;
        } elseif (in_array($header, ['responsable', 'proveedor', 'empresa', 'nombre proveedor', 'nombre_proveedor'])) {
            $columnMap['responsable'] = $index;
        } elseif (in_array($header, ['periodicidad', 'frecuencia'])) {
            $columnMap['periodicidad'] = $index;
        }
    }
    
    echo "📍 Mapeo de columnas:\n";
    echo "  - equipo_id: columna {$columnMap['equipo_id']}\n";
    echo "  - fecha_cols: columnas " . implode(', ', $columnMap['fecha_cols']) . "\n";
    echo "  - responsable: columna {$columnMap['responsable']}\n";
    echo "  - periodicidad: columna {$columnMap['periodicidad']}\n\n";
    
    // Process first 5 equipment rows
    echo "📊 Procesando primeras 5 filas:\n";
    echo str_repeat("=", 100) . "\n";
    
    for ($i = 1; $i <= min(5, count($rows) - 1); $i++) {
        $row = $rows[$i];
        $equipoId = $row[$columnMap['equipo_id']] ?? null;
        
        // Extract dates
        $fechaValues = [];
        foreach ($columnMap['fecha_cols'] as $colIndex) {
            $value = $row[$colIndex] ?? null;
            if (!empty($value)) {
                $fechaValues[] = $value;
            }
        }
        
        // Extract months
        $meses = [];
        foreach ($fechaValues as $fechaValue) {
            $mes = $extractMonth($fechaValue);
            if ($mes !== null) {
                $meses[] = $mes;
            }
        }
        
        // Get periodicidad
        $periodicidad = $columnMap['periodicidad'] !== null ? ($row[$columnMap['periodicidad']] ?? null) : null;
        $responsable = $columnMap['responsable'] !== null ? ($row[$columnMap['responsable']] ?? null) : null;
        
        echo "Fila " . ($i + 1) . ":\n";
        echo "  Equipo ID: $equipoId\n";
        echo "  Fechas originales: " . implode(', ', $fechaValues) . "\n";
        echo "  Meses extraídos: " . implode(', ', $meses) . "\n";
        echo "  Periodicidad Excel: " . ($periodicidad ?? 'N/A') . "\n";
        echo "  Responsable: " . ($responsable ?? 'N/A') . "\n";
        echo str_repeat("-", 100) . "\n";
    }
    
    echo "\n✅ Prueba completada!\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

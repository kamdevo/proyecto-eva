<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== GENERANDO ARCHIVO EXCEL DE CALIBRACIONES ===\n\n";

try {
    // Get calibrations data directly from database
    $calibraciones = DB::table('calibracion')
        ->leftJoin('equipos', 'calibracion.equipo_id', '=', 'equipos.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->select([
            'calibracion.id as codigo_calibracion',
            'calibracion.fecha_calibracion',
            'equipos.marca',
            'equipos.code as codigo_equipo',
            'equipos.serial',
            'equipos.name as nombre_equipo',
            'calibracion.equipo_id',
            'calibracion.file as archivo',
            'areas.name as ubicacion'
        ])
        ->orderBy('calibracion.fecha_calibracion', 'desc')
        ->limit(100) // Limit for testing
        ->get();

    echo "Registros encontrados: " . $calibraciones->count() . "\n\n";

    // Create CSV content (Excel-compatible)
    $csvContent = "Codigo calibracion,Fecha de ejecucion,Marca,Codigo,Serie,Nombre equipo,Id equipo,Archivo,Ubicación\n";
    
    foreach ($calibraciones as $cal) {
        $csvContent .= sprintf(
            '"%s","%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
            $cal->codigo_calibracion ?? '',
            $cal->fecha_calibracion ?? '',
            $cal->marca ?? '',
            $cal->codigo_equipo ?? '',
            $cal->serial ?? '',
            $cal->nombre_equipo ?? '',
            $cal->equipo_id ?? '',
            $cal->archivo ?? '',
            $cal->ubicacion ?? ''
        );
    }

    // Save to file
    $filename = 'calibraciones_export_' . date('Y-m-d_H-i-s') . '.csv';
    file_put_contents($filename, $csvContent);
    
    echo "✅ Archivo generado exitosamente: $filename\n";
    echo "✅ Tamaño del archivo: " . filesize($filename) . " bytes\n";
    
    // Show first few lines
    echo "\n--- PRIMERAS 5 LÍNEAS DEL ARCHIVO ---\n";
    $lines = explode("\n", $csvContent);
    for ($i = 0; $i < min(6, count($lines)); $i++) {
        echo ($i + 1) . ": " . $lines[$i] . "\n";
    }
    
    echo "\n--- MUESTRA DE DATOS ---\n";
    $sample = $calibraciones->take(3);
    foreach ($sample as $i => $cal) {
        echo "Registro " . ($i + 1) . ":\n";
        echo "  - Código calibración: " . ($cal->codigo_calibracion ?? 'N/A') . "\n";
        echo "  - Fecha: " . ($cal->fecha_calibracion ?? 'N/A') . "\n";
        echo "  - Equipo: " . ($cal->nombre_equipo ?? 'N/A') . "\n";
        echo "  - Marca: " . ($cal->marca ?? 'N/A') . "\n";
        echo "  - Serie: " . ($cal->serial ?? 'N/A') . "\n";
        echo "  - Ubicación: " . ($cal->ubicacion ?? 'N/A') . "\n\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "=== GENERACIÓN COMPLETADA ===\n";

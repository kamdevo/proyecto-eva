<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ESTRUCTURA COMPLETA TABLA CALIBRACION ===\n\n";

try {
    echo "1. Estructura de la tabla:\n";
    $columns = DB::select('DESCRIBE calibracion');
    foreach($columns as $col) {
        echo sprintf("  %-20s %-15s %s\n", 
            $col->Field, 
            $col->Type, 
            ($col->Null == 'YES' ? 'NULL' : 'NOT NULL')
        );
    }
    
    echo "\n2. Conteo de registros:\n";
    $count = DB::table('calibracion')->count();
    echo "  Total registros: $count\n";
    
    echo "\n3. Primeros 3 registros:\n";
    $records = DB::table('calibracion')->limit(3)->get();
    foreach($records as $i => $record) {
        echo "  Registro " . ($i + 1) . ":\n";
        foreach($record as $key => $value) {
            echo "    $key: " . (is_null($value) ? 'NULL' : $value) . "\n";
        }
        echo "\n";
    }
    
    echo "4. Verificar relación con equipos:\n";
    $equipoIds = DB::table('calibracion')->distinct()->pluck('equipo_id');
    echo "  Equipos referenciados: " . $equipoIds->count() . "\n";
    echo "  IDs: " . $equipoIds->take(5)->implode(', ') . "\n";
    
    $existingEquipos = DB::table('equipos')->whereIn('id', $equipoIds->take(5))->count();
    echo "  Equipos existentes: $existingEquipos\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== VERIFICACION COMPLETA ===\n";

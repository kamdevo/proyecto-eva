<?php
/**
 * Script para verificar estructura de tabla correctivos_generales
 */

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Verificar columnas de la tabla
    $columns = DB::select("DESCRIBE correctivos_generales");
    
    echo "=== COLUMNAS DE LA TABLA correctivos_generales ===\n";
    foreach ($columns as $column) {
        echo "- {$column->Field} ({$column->Type})\n";
    }
    
    echo "\n=== BUSCANDO COLUMNAS DE FECHA ===\n";
    foreach ($columns as $column) {
        if (stripos($column->Field, 'fecha') !== false || stripos($column->Field, 'created') !== false) {
            echo "✅ Columna de fecha encontrada: {$column->Field}\n";
        }
    }
    
    // Verificar si hay datos
    $count = DB::table('correctivos_generales')->count();
    echo "\n📊 Total de registros: $count\n";
    
    if ($count > 0) {
        $sample = DB::table('correctivos_generales')->first();
        echo "\n=== MUESTRA DE PRIMER REGISTRO ===\n";
        foreach ($sample as $field => $value) {
            echo "- $field: " . substr($value, 0, 50) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

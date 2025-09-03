<?php
/**
 * Script para verificar estructura de tablas de equipos
 */

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    $tables = ['equipos', 'equipos_industriales'];
    
    foreach ($tables as $table) {
        echo "=== TABLA: $table ===\n";
        
        // Verificar si existe la tabla
        $exists = DB::select("SHOW TABLES LIKE '$table'");
        if (empty($exists)) {
            echo "❌ Tabla $table no existe\n\n";
            continue;
        }
        
        // Verificar columnas de la tabla
        $columns = DB::select("DESCRIBE $table");
        
        echo "COLUMNAS:\n";
        foreach ($columns as $column) {
            echo "- {$column->Field} ({$column->Type})\n";
        }
        
        // Verificar si hay datos
        $count = DB::table($table)->count();
        echo "\n📊 Total de registros: $count\n";
        
        if ($count > 0) {
            $sample = DB::table($table)->first();
            echo "\nMUESTRA DE PRIMER REGISTRO:\n";
            foreach ($sample as $field => $value) {
                $displayValue = is_string($value) ? substr($value, 0, 50) : $value;
                echo "- $field: $displayValue\n";
            }
        }
        
        echo "\n" . str_repeat("=", 50) . "\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

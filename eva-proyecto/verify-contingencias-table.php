<?php
/**
 * Script para verificar tabla de contingencias
 */

require __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Cargar configuración de Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICACIÓN DE TABLA CONTINGENCIAS ===\n\n";

// TABLA DE CONTINGENCIAS
echo "TABLA: contingencias\n";
echo str_repeat("-", 80) . "\n";
if (Schema::hasTable('contingencias')) {
    $columns = Schema::getColumnListing('contingencias');
    echo "✅ Tabla existe\n";
    echo "Columnas:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    // Verificar datos de ejemplo
    $count = DB::table('contingencias')->count();
    echo "\nTotal de registros: $count\n";
    
    if ($count > 0) {
        $sample = DB::table('contingencias')->first();
        echo "\nEjemplo de registro:\n";
        print_r($sample);
        
        // Verificar si hay contingencias con equipo_id
        $withEquipo = DB::table('contingencias')
            ->whereNotNull('equipo_id')
            ->count();
        echo "\nContingencias con equipo_id: $withEquipo\n";
        
        // Ejemplo con equipo
        $sampleWithEquipo = DB::table('contingencias')
            ->whereNotNull('equipo_id')
            ->first();
        if ($sampleWithEquipo) {
            echo "\nEjemplo con equipo_id:\n";
            print_r($sampleWithEquipo);
        }
    }
} else {
    echo "❌ Tabla NO existe\n";
}

echo "\n\n=== VERIFICACIÓN COMPLETADA ===\n";

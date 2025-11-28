<?php
/**
 * Script para verificar tabla de empresas
 */

require __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Cargar configuración de Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICACIÓN DE TABLA EMPRESAS ===\n\n";

// TABLA DE EMPRESAS
echo "TABLA: empresas\n";
echo str_repeat("-", 80) . "\n";
if (Schema::hasTable('empresas')) {
    $columns = Schema::getColumnListing('empresas');
    echo "✅ Tabla existe\n";
    echo "Columnas:\n";
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    // Verificar datos de ejemplo
    $count = DB::table('empresas')->count();
    echo "\nTotal de registros: $count\n";
    
    if ($count > 0) {
        echo "\nPrimeros 5 registros:\n";
        $samples = DB::table('empresas')->limit(5)->get();
        foreach ($samples as $sample) {
            echo "\n";
            print_r($sample);
        }
    }
} else {
    echo "❌ Tabla NO existe\n";
}

echo "\n\n=== VERIFICACIÓN COMPLETADA ===\n";

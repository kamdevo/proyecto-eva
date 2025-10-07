<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap de Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== ESTRUCTURA DETALLADA DE TABLAS PARA getUserHistory ===\n\n";

try {
    $tables = ['observaciones', 'equipo_archivo', 'archivos', 'mantenimiento', 'usuarios'];
    
    foreach ($tables as $table) {
        echo "TABLA: {$table}\n";
        if (Schema::hasTable($table)) {
            $columns = DB::select("DESCRIBE {$table}");
            foreach ($columns as $column) {
                echo "   - {$column->Field} ({$column->Type}) " . 
                     ($column->Null === 'NO' ? 'NOT NULL' : 'NULLABLE') . 
                     ($column->Key ? " [{$column->Key}]" : "") . "\n";
            }
        } else {
            echo "   ❌ NO EXISTE\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "=== FIN ===\n";

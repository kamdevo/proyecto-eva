<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "Checking table structures:\n\n";
    
    $tables = ['propietarios', 'servicios', 'areas', 'estadosequipos'];
    
    foreach ($tables as $table) {
        echo "Table: {$table}\n";
        try {
            $columns = DB::select("DESCRIBE {$table}");
            foreach ($columns as $column) {
                echo "  {$column->Field} ({$column->Type})\n";
            }
        } catch (Exception $e) {
            echo "  Error: " . $e->getMessage() . "\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

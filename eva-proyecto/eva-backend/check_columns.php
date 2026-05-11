<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check column names in related tables
$tables = [
    'estadoequipos', 'tecnologiap', 'fuenteal', 'cbiomedica', 
    'criesgo', 'frecuenciam', 'tipos', 'tadquisicion'
];

echo "=== COLUMNAS DE TABLAS RELACIONADAS ===" . PHP_EOL;
foreach ($tables as $table) {
    try {
        $cols = DB::select("SHOW COLUMNS FROM `{$table}`");
        $names = array_map(fn($c) => $c->Field, $cols);
        echo "  {$table}: " . implode(', ', $names) . PHP_EOL;
    } catch (\Exception $e) {
        echo "  {$table}: ERROR - " . $e->getMessage() . PHP_EOL;
    }
}

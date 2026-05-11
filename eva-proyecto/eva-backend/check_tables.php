<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tables = ['tecnologiap', 'tecnologias', 'frecuenciam', 'frecuencia_mantenimientos', 
           'cbiomedica', 'clasificacion_biomedicas', 'estadoequipos', 'estado_equipos',
           'tipos', 'tipo', 'servicios', 'servicio', 'areas', 'area'];

echo "=== TABLAS EXISTENTES ===" . PHP_EOL;
foreach ($tables as $table) {
    try {
        $count = DB::table($table)->count();
        echo "  OK: '{$table}' ({$count} filas)" . PHP_EOL;
    } catch (\Exception $e) {
        echo "  NO: '{$table}'" . PHP_EOL;
    }
}

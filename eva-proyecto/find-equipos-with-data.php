<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Buscar equipos con contingencias
$equiposConContingencias = \Illuminate\Support\Facades\DB::table('contingencias')
    ->select('equipo_id')
    ->distinct()
    ->limit(5)
    ->get();

echo "Equipos con contingencias: ";
foreach($equiposConContingencias as $e) {
    echo $e->equipo_id . " ";
}
echo "\n\n";

// Buscar equipos con calibraciones
$equiposConCalibraciones = \Illuminate\Support\Facades\DB::table('calibracion')
    ->select('equipo_id')
    ->distinct()
    ->limit(5)
    ->get();

echo "Equipos con calibraciones: ";
foreach($equiposConCalibraciones as $e) {
    echo $e->equipo_id . " ";
}
echo "\n";
?>

<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========== ESTRUCTURA TABLA planes_mantenimientos ==========\n\n";

$columns = DB::select('DESCRIBE planes_mantenimientos');
foreach($columns as $col) {
    echo "{$col->Field} | {$col->Type}\n";
}

echo "\n========== EJEMPLO DE DATOS ==========\n\n";

$samples = DB::table('planes_mantenimientos')
    ->select(['id', 'equipo_id', 'responsable', 'anio'])
    ->orderBy('anio', 'desc')
    ->limit(10)
    ->get();

foreach($samples as $s) {
    echo "ID: {$s->id} | Equipo: {$s->equipo_id} | Responsable: {$s->responsable} | Año: {$s->anio}\n";
}

echo "\n========== TEST: Obtener responsable por equipo_id ==========\n\n";

// Ejemplo: tomar algunos equipos de ordenes y buscar su responsable en planes_mantenimientos
$ordenes = DB::table('ordenes')
    ->whereNotNull('equipo_id')
    ->select('equipo_id')
    ->distinct()
    ->limit(5)
    ->get();

foreach($ordenes as $o) {
    $plan = DB::table('planes_mantenimientos')
        ->where('equipo_id', $o->equipo_id)
        ->orderBy('anio', 'desc')
        ->first();
    
    $responsable = $plan ? $plan->responsable : 'Sin plan';
    echo "Equipo ID: {$o->equipo_id} | Responsable (plan más reciente): {$responsable}\n";
}

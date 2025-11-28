<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========== ESTRUCTURA TABLA EMPRESAS ==========\n\n";
$cols = DB::select('DESCRIBE empresas');
foreach($cols as $c) {
    echo $c->Field . ' | ' . $c->Type . "\n";
}

echo "\n========== EJEMPLO DE DATOS EMPRESAS ==========\n\n";
$empresas = DB::table('empresas')->limit(5)->get();
foreach($empresas as $e) {
    echo "ID: {$e->id} | Nombre: " . ($e->nombre ?? $e->name ?? 'N/A') . "\n";
}

echo "\n========== TEST JOIN ordenes -> empresas ==========\n\n";
$test = DB::table('ordenes as o')
    ->leftJoin('empresas as emp', 'o.asignado_id', '=', 'emp.id')
    ->select('o.id', 'o.asignado_id', 'emp.nombre as empresa_nombre', 'emp.name as empresa_name')
    ->whereNotNull('o.asignado_id')
    ->limit(5)
    ->get();

foreach($test as $t) {
    echo "Orden: {$t->id} | Asignado ID: {$t->asignado_id} | Empresa: " . ($t->empresa_nombre ?? $t->empresa_name ?? 'N/A') . "\n";
}

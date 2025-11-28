<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========== VERIFICANDO JOIN CON EMPRESAS ==========\n\n";

$results = DB::table('ordenes as o')
    ->leftJoin('empresas as emp', 'o.asignado_id', '=', 'emp.id')
    ->select([
        'o.id',
        'o.asignado_id',
        DB::raw("COALESCE(emp.name, '') as responsable_nombre")
    ])
    ->whereNotNull('o.asignado_id')
    ->limit(10)
    ->get();

echo "Ordenes con responsable asignado:\n";
echo str_repeat("-", 70) . "\n";

foreach($results as $r) {
    echo "Orden ID: {$r->id} | Asignado ID: {$r->asignado_id} | Responsable: {$r->responsable_nombre}\n";
}

echo "\n========== FIN VERIFICACION ==========\n";

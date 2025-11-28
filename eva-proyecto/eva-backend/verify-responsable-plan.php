<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========== VERIFICANDO RESPONSABLE DESDE planes_mantenimientos ==========\n\n";

$subqueryResponsable = "(SELECT pm.responsable FROM planes_mantenimientos pm WHERE pm.equipo_id = o.equipo_id ORDER BY pm.anio DESC LIMIT 1)";

$results = DB::table('ordenes as o')
    ->leftJoin('equipos as e', 'o.equipo_id', '=', 'e.id')
    ->select([
        'o.id',
        'o.equipo_id',
        'e.name as equipo_name',
        DB::raw("COALESCE({$subqueryResponsable}, '') as responsable_nombre")
    ])
    ->whereNotNull('o.equipo_id')
    ->where('o.equipo_id', '>', 0)
    ->limit(15)
    ->get();

echo "Ordenes con responsable desde plan de mantenimiento:\n";
echo str_repeat("-", 100) . "\n";

foreach($results as $r) {
    echo "Orden ID: {$r->id} | Equipo ID: {$r->equipo_id} | Equipo: " . substr($r->equipo_name ?? 'N/A', 0, 30) . " | Responsable: {$r->responsable_nombre}\n";
}

echo "\n========== FIN VERIFICACION ==========\n";

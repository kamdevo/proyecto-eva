<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$equipo = DB::table('equipos')->where('id', 69)->first();
echo "Nombre actual en BD: {$equipo->name}\n";
echo "Descripción actual: {$equipo->descripcion}\n";
echo "Fecha cambio: {$equipo->fecha_cambio}\n";

<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Últimas calibraciones en calibracion_ind ===\n";
$rows = DB::table('calibracion_ind')->orderBy('id', 'desc')->limit(5)->get();
foreach ($rows as $row) {
    echo "ID: {$row->id} | equipo_id: {$row->equipo_id} | desc: {$row->description} | fecha: {$row->fecha_calibracion} | created: {$row->created_at}\n";
}
echo "\nTotal en calibracion_ind: " . DB::table('calibracion_ind')->count() . "\n";

echo "\n=== Últimas calibraciones en calibracion (biomedica) ===\n";
$rows2 = DB::table('calibracion')->orderBy('id', 'desc')->limit(5)->get();
foreach ($rows2 as $row) {
    echo "ID: {$row->id} | equipo_id: {$row->equipo_id} | desc: {$row->description} | fecha: {$row->fecha_calibracion} | created: {$row->created_at}\n";
}
echo "\nTotal en calibracion: " . DB::table('calibracion')->count() . "\n";

// Verificar si hay calibraciones recientes (últimas 24 horas)
echo "\n=== Calibraciones creadas hoy (ambas tablas) ===\n";
$hoy = date('Y-m-d');
$recientes_ind = DB::table('calibracion_ind')->whereDate('created_at', $hoy)->get();
echo "calibracion_ind hoy: " . $recientes_ind->count() . "\n";
foreach ($recientes_ind as $r) {
    echo "  ID: {$r->id} | equipo_id: {$r->equipo_id} | desc: {$r->description}\n";
}

$recientes = DB::table('calibracion')->whereDate('created_at', $hoy)->get();
echo "calibracion hoy: " . $recientes->count() . "\n";
foreach ($recientes as $r) {
    echo "  ID: {$r->id} | equipo_id: {$r->equipo_id} | desc: {$r->description}\n";
}

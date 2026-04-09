<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Verificar tipo_id de los equipos con calibraciones recientes
$equipoIds = [7838, 5762];
foreach ($equipoIds as $eId) {
    $equipo = DB::table('equipos')->where('id', $eId)->select('id', 'name', 'tipo_id')->first();
    echo "Equipo $eId: tipo_id={$equipo->tipo_id} name={$equipo->name}\n";
    
    $tipoEquipo = DB::table('equipos')->where('id', $eId)->value('tipo_id');
    echo "  tipo_id == 2? " . ($tipoEquipo == 2 ? 'SI (industrial)' : 'NO (biomedico)') . "\n";
    
    $cals = DB::table('calibracion_ind')->where('equipo_id', $eId)->orderBy('fecha_calibracion', 'desc')->get();
    echo "  Calibraciones en calibracion_ind: " . $cals->count() . "\n";
    foreach ($cals as $c) {
        echo "    ID: {$c->id} | desc: {$c->description} | fecha: {$c->fecha_calibracion}\n";
    }
    echo "\n";
}

// Simular la response completa del endpoint
echo "=== Simulando response JSON para equipo 7838 ===\n";
$paginated = DB::table('calibracion_ind')
    ->where('equipo_id', 7838)
    ->orderBy('fecha_calibracion', 'desc')
    ->paginate(15);

$response = [
    'meta' => ['code' => 200, 'status' => 'success', 'message' => 'Lista de calibraciones industriales obtenida'],
    'data' => $paginated
];
echo json_encode($response, JSON_PRETTY_PRINT) . "\n";

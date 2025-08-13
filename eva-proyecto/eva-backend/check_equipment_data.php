<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    echo "Equipment ID 69 data:\n";
    echo "  servicio_id: {$equipo->servicio_id}\n";
    echo "  area_id: {$equipo->area_id}\n";
    echo "  propietario_id: {$equipo->propietario_id}\n";
    echo "  estadoequipo_id: {$equipo->estadoequipo_id}\n";
    echo "  name: {$equipo->name}\n";
    echo "  serial: {$equipo->serial}\n";
    echo "  code: {$equipo->code}\n";
    echo "  marca: {$equipo->marca}\n";
    echo "  modelo: {$equipo->modelo}\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

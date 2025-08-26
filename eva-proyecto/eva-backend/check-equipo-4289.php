<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$equipo = DB::table('equipos')->where('id', 4289)->first();
if ($equipo) {
    echo 'EQUIPO ID 4289:' . PHP_EOL;
    echo 'Nombre: ' . $equipo->name . PHP_EOL;
    echo 'Tipo ID: ' . $equipo->tipo_id . PHP_EOL;
    echo 'Status: ' . $equipo->status . PHP_EOL;
    echo 'Imagen: ' . ($equipo->image ?: 'VACÍO') . PHP_EOL;
} else {
    echo 'Equipo ID 4289 no encontrado.' . PHP_EOL;
}

<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$eq = DB::table('equipos')->where('status', 1)->first();

// Test via HTTP
$response = \Illuminate\Support\Facades\Http::put('http://192.168.56.1:8001/api/v1/equipos/' . $eq->id, [
    'name'           => $eq->name,
    'code'           => $eq->code,
    'servicio_id'    => $eq->servicio_id,
    'area_id'        => $eq->area_id > 0 ? $eq->area_id : 1,
    'garantia'       => '24 meses',
    'calibracion'    => '1',
    'movilidad'      => 'FIJO',
    'propietario_id' => $eq->propietario_id,
    'fuente_id'      => $eq->fuente_id,
    'tecnologia_id'  => $eq->tecnologia_id,
    'frecuencia_id'  => $eq->frecuencia_id,
    'costo'          => '1234567',
    'vida_util'      => '10',
    'v1'             => '110',
    'v2'             => '220',
]);

echo "HTTP Status: " . $response->status() . PHP_EOL;
$body = $response->json();
echo "Success: " . ($body['success'] ?? 'N/A') . PHP_EOL;
if (isset($body['message'])) echo "Message: " . $body['message'] . PHP_EOL;
if (isset($body['errors'])) { echo "Errors: "; print_r($body['errors']); }

// Verify in DB
$updated = DB::table('equipos')->where('id', $eq->id)->first();
echo PHP_EOL . "=== Verificacion DB ===" . PHP_EOL;
echo "garantia: '{$updated->garantia}' (esperado: '24 meses')" . PHP_EOL;
echo "calibracion: '{$updated->calibracion}' (esperado: '1')" . PHP_EOL;
echo "costo: '{$updated->costo}' (esperado: '1234567')" . PHP_EOL;
echo "vida_util: '{$updated->vida_util}' (esperado: '10')" . PHP_EOL;
echo "v1: '{$updated->v1}' (esperado: '110')" . PHP_EOL;
echo "v2: '{$updated->v2}' (esperado: '220')" . PHP_EOL;

// Restore
DB::table('equipos')->where('id', $eq->id)->update([
    'garantia'    => $eq->garantia,
    'calibracion' => $eq->calibracion,
    'costo'       => $eq->costo,
    'vida_util'   => $eq->vida_util,
    'v1'          => $eq->v1,
    'v2'          => $eq->v2,
]);
echo PHP_EOL . "Valores restaurados." . PHP_EOL;

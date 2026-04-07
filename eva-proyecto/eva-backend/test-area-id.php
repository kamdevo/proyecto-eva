<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/v1/equipos-create', 'POST', [
    'name' => 'EQUIPO TEST DELETE',
    'serial' => 'TEST-SERIAL-DELETE-001',
    'area_id' => '5',
    'servicio_id' => '1',
    'tipo_id' => '1'
]);
$response = $kernel->handle($request);
$data = json_decode($response->getContent(), true);
echo "success: " . ($data['success'] ? 'true' : 'false') . PHP_EOL;
echo "message: " . ($data['message'] ?? 'N/A') . PHP_EOL;
if (isset($data['data'])) {
    echo "id: " . $data['data']->id ?? $data['data']['id'] . PHP_EOL;
    $d = (array)$data['data'];
    echo "area_id: " . ($d['area_id'] ?? 'NOT SET') . PHP_EOL;
    echo "servicio_id: " . ($d['servicio_id'] ?? 'NOT SET') . PHP_EOL;
}
if (isset($data['errors'])) {
    print_r($data['errors']);
}

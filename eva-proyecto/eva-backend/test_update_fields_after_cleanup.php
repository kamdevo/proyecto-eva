<?php

// Script para verificar que la actualización de campos a través de API / DB funcione correctamente.
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Equipo;

// Tomamos el último equipo insertado para probar su edición
$equipo = DB::table('equipos')->latest('id')->first();

if (!$equipo) {
    echo "No hay equipos en la base de datos.\n";
    exit;
}

echo "Probando actualización sobre equipo ID {$equipo->id} ({$equipo->code})\n\n";

// Datos simulando el payload que enviaría el Modal de Edición ACTUALIZADO (sin centro de costo y pais origen)
// pero con todos los demás.
$updateData = [
    'name' => 'EQUIPO ACTUALIZADO ' . rand(100, 999),
    'marca' => 'NUEVA MARCA',
    'modelo' => 'NUEVO MODELO',
    'serial' => 'SN-' . rand(1000, 9999),
    'descripcion' => 'Descripción actualizada en test',
    'servicio_id' => 112, // Asumiendo otro servicio
    'fecha_ad' => '2023-01-01',
    'fecha_instalacion' => '2023-01-15',
    'estadoequipo_id' => 2,
    'tadquisicion_id' => 2,
    'localizacion_actual' => 'HOSPITALIZACION',
    'code' => 'TEST-UPD-' . rand(10, 99),
    'accesorios' => 'Accesorios test update',
    'movilidad' => 'PORTATIL',
];

echo "Enviando PUT request (simulado) para actualizar el equipo con datos:\n";
print_r($updateData);

// Como estamos en CLI, vamos a probar el controlador de API que procesa la actualización
// La ruta es /api/v1/equipos/{id}/update-with-image

$request = \Illuminate\Http\Request::create('/api/v1/equipos/' . $equipo->id . '/update-with-image', 'POST', $updateData);
$request->headers->set('Accept', 'application/json');
// Simular que es XMLHttpRequest para que devuelva JSON y saltar posibles middlewares de sesión
$request->headers->set('X-Requested-With', 'XMLHttpRequest');

$response = app()->handle($request);

echo "\n--- RESPUESTA DEL UPDATE ---\n";
echo "HTTP Status: " . $response->getStatusCode() . "\n";
echo "Body:\n";
echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT)."\n";

// Verificar en DB
$equipoActualizado = DB::table('equipos')->where('id', $equipo->id)->first();

echo "\n--- VERIFICACIÓN EN BASE DE DATOS ---\n";

$fieldsToVerify = [
    'name' => ['req' => 'name', 'db' => 'name'],
    'marca' => ['req' => 'marca', 'db' => 'marca'],
    'modelo' => ['req' => 'modelo', 'db' => 'modelo'],
    'serial' => ['req' => 'serial', 'db' => 'serial'],
    'servicio_id' => ['req' => 'servicio_id', 'db' => 'servicio_id'],
    'fecha_ad' => ['req' => 'fecha_ad', 'db' => 'fecha_ad'], // mapeado
    'fecha_instalacion' => ['req' => 'fecha_instalacion', 'db' => 'fecha_instalacion'],
    'estadoequipo_id' => ['req' => 'estadoequipo_id', 'db' => 'estadoequipo_id'],
    'localizacion_actual' => ['req' => 'localizacion_actual', 'db' => 'localizacion_actual'],
];

$allPassed = true;
foreach ($fieldsToVerify as $config) {
    $expected = $updateData[$config['req']] ?? null;
    $actual = $equipoActualizado->{$config['db']};
    
    // Convertir fechas a Y-m-d para comparar si es un objeto carbon o date
    if (strpos($config['db'], 'fecha') !== false && $actual) {
        $actual = date('Y-m-d', strtotime($actual));
    }

    if ($expected == $actual) {
        echo "[√] Campo {$config['db']} coincide: {$actual}\n";
    } else {
        echo "[X] Campo {$config['db']} FALLA! Esp: '{$expected}', Actual: '{$actual}'\n";
        $allPassed = false;
    }
}

if ($allPassed) {
    echo "\n>>> RESULTADO: TODOS LOS CAMPOS SE ACTUALIZARON CORRECTAMENTE! <<<\n";
} else {
    echo "\n>>> RESULTADO: ALGUNOS CAMPOS NO SE ACTUALIZARON! <<<\n";
}

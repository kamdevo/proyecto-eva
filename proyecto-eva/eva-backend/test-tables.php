<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "Verificando tablas relacionadas...\n";

$tables = ['equipos', 'mantenimiento', 'contingencias', 'calibracion', 'archivos', 'observaciones', 'contacto'];

foreach ($tables as $table) {
    try {
        $count = DB::table($table)->count();
        echo "✅ {$table}: {$count} registros\n";
    } catch (Exception $e) {
        echo "❌ {$table}: Error - " . $e->getMessage() . "\n";
    }
}

// Verificar un equipo específico
try {
    $equipo = DB::table('equipos')->first();
    if ($equipo) {
        echo "\n📋 Primer equipo encontrado:\n";
        echo "ID: {$equipo->id}\n";
        echo "Nombre: " . ($equipo->name ?: 'Sin nombre') . "\n";
        echo "Código: " . ($equipo->code ?: 'Sin código') . "\n";
    }
} catch (Exception $e) {
    echo "Error al obtener equipo: " . $e->getMessage() . "\n";
}

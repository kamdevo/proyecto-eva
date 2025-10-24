<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n";
echo "========================================\n";
echo "PRUEBA SIMPLE DE EXPORTACIÓN\n";
echo "========================================\n\n";

try {
    // Query SIMPLE solo con campos básicos
    echo "1️⃣  Probando query básica:\n";
    echo "----------------------------------------\n";
    
    $equipos = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            'equipos.code',
            'equipos.marca',
            'equipos.modelo'
        ])
        ->where('equipos.status', '!=', 0)
        ->orderBy('equipos.name')
        ->limit(5)
        ->get();
    
    echo "✅ Query básica exitosa\n";
    echo "Total: " . $equipos->count() . " equipos\n\n";
    
    // Ahora probamos con JOINs
    echo "2️⃣  Probando con JOINs:\n";
    echo "----------------------------------------\n";
    
    $equiposJoin = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            'servicios.name as servicio',
            'areas.name as area'
        ])
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->where('equipos.status', '!=', 0)
        ->limit(5)
        ->get();
    
    echo "✅ Query con JOINs exitosa\n";
    echo "Total: " . $equiposJoin->count() . " equipos\n\n";
    
    // Probar subqueries
    echo "3️⃣  Probando subqueries:\n";
    echo "----------------------------------------\n";
    
    $equiposSubquery = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            DB::raw("(SELECT MAX(fecha_ejecucion) FROM mantenimientos_ejecutados WHERE equipo_id = equipos.id) as ultimo_mantenimiento")
        ])
        ->where('equipos.status', '!=', 0)
        ->limit(5)
        ->get();
    
    echo "✅ Query con subqueries exitosa\n";
    echo "Total: " . $equiposSubquery->count() . " equipos\n\n";
    
    // Mostrar primer equipo
    if ($equipos->count() > 0) {
        echo "4️⃣  Primer equipo:\n";
        echo "----------------------------------------\n";
        $first = $equipos->first();
        echo "ID: {$first->id}\n";
        echo "Nombre: {$first->name}\n";
        echo "Código: {$first->code}\n";
        echo "Marca: {$first->marca}\n";
        echo "Modelo: {$first->modelo}\n";
    }
    
    echo "\n========================================\n";
    echo "✅ TODAS LAS PRUEBAS EXITOSAS\n";
    echo "========================================\n\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR:\n";
    echo $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

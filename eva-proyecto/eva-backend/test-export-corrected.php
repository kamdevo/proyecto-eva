<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n";
echo "========================================\n";
echo "PRUEBA DE EXPORTACIÓN CORREGIDA\n";
echo "========================================\n\n";

try {
    echo "1️⃣  Probando subqueries de mantenimiento:\n";
    echo "----------------------------------------\n";
    
    $equipos = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            DB::raw("(SELECT MAX(fecha_mantenimiento) FROM mantenimiento WHERE equipo_id = equipos.id) as ultimo_mantenimiento"),
            DB::raw("(SELECT pm.name FROM mantenimiento m LEFT JOIN proveedores_mantenimiento pm ON m.proveedor_mantenimiento_id = pm.id WHERE m.equipo_id = equipos.id ORDER BY m.fecha_mantenimiento DESC LIMIT 1) as proveedor_mantenimiento"),
            DB::raw("(SELECT COUNT(*) FROM mantenimiento WHERE equipo_id = equipos.id) as cuenta_preventivos")
        ])
        ->where('equipos.status', '!=', 0)
        ->limit(5)
        ->get();
    
    echo "✅ Subqueries de mantenimiento exitosas\n";
    echo "Total: " . $equipos->count() . " equipos\n\n";
    
    echo "2️⃣  Probando subqueries de calibración:\n";
    echo "----------------------------------------\n";
    
    $equiposCal = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            DB::raw("(SELECT MAX(fecha_calibracion) FROM calibracion WHERE equipo_id = equipos.id) as ultima_calibracion"),
            DB::raw("(SELECT COUNT(*) FROM calibracion WHERE equipo_id = equipos.id) as cuenta_calibraciones")
        ])
        ->where('equipos.status', '!=', 0)
        ->limit(5)
        ->get();
    
    echo "✅ Subqueries de calibración exitosas\n";
    echo "Total: " . $equiposCal->count() . " equipos\n\n";
    
    echo "3️⃣  Probando query COMPLETA con TODOS los JOINs:\n";
    echo "----------------------------------------\n";
    
    $equiposCompleto = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            'servicios.name as servicio',
            'areas.name as area',
            DB::raw("(SELECT MAX(fecha_mantenimiento) FROM mantenimiento WHERE equipo_id = equipos.id) as ultimo_mantenimiento"),
            DB::raw("(SELECT MAX(fecha_calibracion) FROM calibracion WHERE equipo_id = equipos.id) as ultima_calibracion")
        ])
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->where('equipos.status', '!=', 0)
        ->limit(5)
        ->get();
    
    echo "✅ Query completa exitosa\n";
    echo "Total: " . $equiposCompleto->count() . " equipos\n\n";
    
    // Mostrar un ejemplo
    if ($equiposCompleto->count() > 0) {
        echo "4️⃣  Ejemplo de equipo:\n";
        echo "----------------------------------------\n";
        $first = $equiposCompleto->first();
        echo "ID: {$first->id}\n";
        echo "Nombre: {$first->name}\n";
        echo "Servicio: " . ($first->servicio ?? 'N/A') . "\n";
        echo "Área: " . ($first->area ?? 'N/A') . "\n";
        echo "Último Mantenimiento: " . ($first->ultimo_mantenimiento ?? 'N/A') . "\n";
        echo "Última Calibración: " . ($first->ultima_calibracion ?? 'N/A') . "\n";
    }
    
    echo "\n========================================\n";
    echo "✅ TODAS LAS PRUEBAS EXITOSAS\n";
    echo "========================================\n\n";
    echo "💡 El endpoint de exportación debería funcionar ahora\n\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR:\n";
    echo $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

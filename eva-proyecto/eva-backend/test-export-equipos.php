<?php

/**
 * Script de prueba para exportación de equipos sin filtros
 * Ejecutar: php test-export-equipos.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n";
echo "========================================\n";
echo "PRUEBA DE EXPORTACIÓN DE EQUIPOS\n";
echo "========================================\n\n";

try {
    // 1. Contar equipos activos
    echo "1️⃣  CONTEO DE EQUIPOS ACTIVOS:\n";
    echo "----------------------------------------\n";
    
    $totalEquipos = DB::table('equipos')
        ->where('status', '!=', 0)
        ->count();
    
    echo "✅ Total equipos activos: $totalEquipos\n\n";
    
    // 2. Probar query base sin filtros (como en el controlador)
    echo "2️⃣  QUERY BASE SIN FILTROS:\n";
    echo "----------------------------------------\n";
    
    $query = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            'equipos.code'
        ])
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
        ->where('equipos.status', '!=', 0);
    
    $equipos = $query->orderBy('equipos.name')->limit(5)->get();
    
    echo "✅ Query ejecutada exitosamente\n";
    echo "Total resultados (limitado a 5): " . $equipos->count() . "\n";
    
    if ($equipos->count() > 0) {
        echo "\nPrimeros 5 equipos:\n";
        foreach ($equipos as $equipo) {
            echo "  - ID: {$equipo->id}, Código: {$equipo->code}, Nombre: {$equipo->name}\n";
        }
    }
    echo "\n";
    
    // 3. Verificar tablas relacionadas
    echo "3️⃣  VERIFICAR TABLAS RELACIONADAS:\n";
    echo "----------------------------------------\n";
    
    $tablas = [
        'servicios', 'areas', 'sedes', 'estadoequipos', 'frecuenciam',
        'ordenes_compra', 'fuenteals', 'tecnologiaps', 'cbiomedicas',
        'criesgos', 'tadquisiciones', 'propietarios'
    ];
    
    foreach ($tablas as $tabla) {
        try {
            $count = DB::table($tabla)->count();
            echo "  ✅ $tabla: $count registros\n";
        } catch (\Exception $e) {
            echo "  ❌ $tabla: Error - " . $e->getMessage() . "\n";
        }
    }
    echo "\n";
    
    // 4. Simular exportación completa (sin crear archivo)
    echo "4️⃣  SIMULACIÓN DE EXPORTACIÓN COMPLETA:\n";
    echo "----------------------------------------\n";
    
    $queryCompleto = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            'equipos.descripcion',
            'equipos.marca',
            'equipos.modelo',
            'equipos.serial',
            'equipos.code',
            'servicios.name as servicio',
            'areas.name as area',
            'sedes.name as sede'
        ])
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
        ->where('equipos.status', '!=', 0)
        ->orderBy('equipos.name')
        ->get();
    
    echo "✅ Query completa ejecutada\n";
    echo "Total equipos a exportar: " . $queryCompleto->count() . "\n";
    
    if ($queryCompleto->count() > 0) {
        echo "✅ Listo para exportación a Excel\n";
    } else {
        echo "❌ No hay equipos para exportar\n";
    }
    echo "\n";
    
    echo "========================================\n";
    echo "✅ PRUEBA COMPLETADA\n";
    echo "========================================\n\n";
    
    if ($queryCompleto->count() > 0) {
        echo "💡 El endpoint debería funcionar correctamente\n";
        echo "   Intenta exportar desde el frontend ahora\n\n";
    } else {
        echo "⚠️  No hay equipos activos en la base de datos\n";
        echo "   Verifica la tabla 'equipos' y el campo 'status'\n\n";
    }
    
} catch (\Exception $e) {
    echo "\n❌ ERROR:\n";
    echo $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

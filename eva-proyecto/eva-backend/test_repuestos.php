<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICANDO TABLAS ===\n\n";

// 1. Verificar tabla equipo_repuestos
echo "1. Tabla equipo_repuestos:\n";
if (Schema::hasTable('equipo_repuestos')) {
    $count = DB::table('equipo_repuestos')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
    
    if ($count > 0) {
        $sample = DB::table('equipo_repuestos')->first();
        echo "   Columnas: " . implode(', ', array_keys((array)$sample)) . "\n";
    }
} else {
    echo "   ✗ NO EXISTE\n";
}

// 2. Verificar tabla repuestos
echo "\n2. Tabla repuestos:\n";
if (Schema::hasTable('repuestos')) {
    $count = DB::table('repuestos')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
    
    if ($count > 0) {
        $sample = DB::table('repuestos')->first();
        echo "   Columnas: " . implode(', ', array_keys((array)$sample)) . "\n";
    }
} else {
    echo "   ✗ NO EXISTE\n";
}

// 3. Verificar tabla equipos
echo "\n3. Tabla equipos:\n";
if (Schema::hasTable('equipos')) {
    $count = DB::table('equipos')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
} else {
    echo "   ✗ NO EXISTE\n";
}

// 4. Verificar tabla servicios
echo "\n4. Tabla servicios:\n";
if (Schema::hasTable('servicios')) {
    $count = DB::table('servicios')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
} else {
    echo "   ✗ NO EXISTE\n";
}

// 5. Verificar tabla usuarios
echo "\n5. Tabla usuarios:\n";
if (Schema::hasTable('usuarios')) {
    $count = DB::table('usuarios')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
} else {
    echo "   ✗ NO EXISTE\n";
}

echo "\n=== PROBANDO CONSULTA ===\n\n";

try {
    $query = DB::table('equipo_repuestos')
        ->leftJoin('repuestos', 'equipo_repuestos.repuesto_id', '=', 'repuestos.id')
        ->leftJoin('equipos', 'equipo_repuestos.equipo_id', '=', 'equipos.id')
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->select([
            'equipo_repuestos.id',
            'equipo_repuestos.fecha',
            'repuestos.name as repuesto_nombre',
            'repuestos.code as repuesto_codigo',
            'repuestos.precio as repuesto_precio',
            'equipo_repuestos.cantidad_entregada',
            'equipos.id as equipo_id',
            'equipos.name as equipo_nombre',
            'equipos.code as equipo_codigo',
            'servicios.name as servicio_nombre'
        ])
        ->limit(3)
        ->get();

    echo "✓ Consulta exitosa!\n";
    echo "Total resultados: " . $query->count() . "\n\n";
    
    if ($query->count() > 0) {
        echo "Primer registro:\n";
        $first = $query->first();
        foreach ($first as $key => $value) {
            echo "  {$key}: {$value}\n";
        }
    }
    
} catch (\Exception $e) {
    echo "✗ ERROR en consulta:\n";
    echo "  Mensaje: " . $e->getMessage() . "\n";
    echo "  Línea: " . $e->getLine() . "\n";
}

echo "\n=== FIN DE PRUEBAS ===\n";

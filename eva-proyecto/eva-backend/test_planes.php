<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DIAGNÓSTICO PLANES DE MANTENIMIENTO ===\n\n";

// 1. Verificar tabla
echo "1. Verificando tabla plan_mantenimiento:\n";
if (Schema::hasTable('plan_mantenimiento')) {
    $count = DB::table('plan_mantenimiento')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
    
    if ($count > 0) {
        $sample = DB::table('plan_mantenimiento')->first();
        echo "   Columnas: " . implode(', ', array_keys((array)$sample)) . "\n";
    }
} else {
    echo "   ✗ NO EXISTE\n";
}

// 2. Probar consulta simple
echo "\n2. Probando consulta simple:\n";
try {
    $result = DB::table('plan_mantenimiento')
        ->limit(3)
        ->get();
    
    echo "   ✓ Consulta exitosa - {$result->count()} registros\n";
    
    if ($result->count() > 0) {
        echo "\n   Primer registro:\n";
        $first = $result->first();
        foreach ($first as $key => $value) {
            $displayValue = is_string($value) ? substr($value, 0, 50) : $value;
            echo "     {$key}: {$displayValue}\n";
        }
    }
} catch (\Exception $e) {
    echo "   ✗ ERROR: " . $e->getMessage() . "\n";
    echo "   Línea: " . $e->getLine() . "\n";
}

// 3. Probar consulta con joins (como en el endpoint)
echo "\n3. Probando consulta con joins:\n";
try {
    $result = DB::table('plan_mantenimiento')
        ->leftJoin('equipos', 'plan_mantenimiento.equipo_id', '=', 'equipos.id')
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('usuarios', 'plan_mantenimiento.usuario_id', '=', 'usuarios.id')
        ->select([
            'plan_mantenimiento.*',
            'equipos.name as equipo_nombre',
            'equipos.code as equipo_codigo',
            'servicios.name as servicio_nombre',
            'usuarios.nombre as usuario_nombre'
        ])
        ->limit(2)
        ->get();
    
    echo "   ✓ Consulta con joins exitosa - {$result->count()} registros\n";
} catch (\Exception $e) {
    echo "   ✗ ERROR: " . $e->getMessage() . "\n";
    echo "   Línea: " . $e->getLine() . "\n";
    echo "   Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== FIN DEL DIAGNÓSTICO ===\n";

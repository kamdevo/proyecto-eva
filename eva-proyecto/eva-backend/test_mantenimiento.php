<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DIAGNÓSTICO TABLA MANTENIMIENTO ===\n\n";

// 1. Verificar tabla
echo "1. Verificando tabla mantenimiento:\n";
if (Schema::hasTable('mantenimiento')) {
    $count = DB::table('mantenimiento')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
    
    if ($count > 0) {
        $sample = DB::table('mantenimiento')->first();
        echo "\n   Columnas disponibles:\n";
        foreach ((array)$sample as $key => $value) {
            $displayValue = is_string($value) ? substr($value, 0, 30) : $value;
            echo "     - {$key}: {$displayValue}\n";
        }
    }
} else {
    echo "   ✗ NO EXISTE\n";
    exit;
}

// 2. Probar consulta simple
echo "\n2. Probando consulta simple (3 registros):\n";
try {
    $result = DB::table('mantenimiento')
        ->orderBy('id', 'desc')
        ->limit(3)
        ->get();
    
    echo "   ✓ Consulta exitosa - {$result->count()} registros\n";
} catch (\Exception $e) {
    echo "   ✗ ERROR: " . $e->getMessage() . "\n";
}

// 3. Probar con joins
echo "\n3. Probando consulta con joins:\n";
try {
    $result = DB::table('mantenimiento')
        ->leftJoin('equipos', 'mantenimiento.equipo_id', '=', 'equipos.id')
        ->select([
            'mantenimiento.id',
            'mantenimiento.equipo_id',
            'mantenimiento.descripcion',
            'equipos.name as equipo_nombre'
        ])
        ->limit(2)
        ->get();
    
    echo "   ✓ Consulta con joins exitosa - {$result->count()} registros\n";
    
    if ($result->count() > 0) {
        echo "\n   Primer registro:\n";
        $first = $result->first();
        foreach ($first as $key => $value) {
            echo "     {$key}: {$value}\n";
        }
    }
} catch (\Exception $e) {
    echo "   ✗ ERROR: " . $e->getMessage() . "\n";
    echo "   Línea: " . $e->getLine() . "\n";
}

// 4. Verificar tabla observaciones
echo "\n4. Verificando tabla observaciones:\n";
if (Schema::hasTable('observaciones')) {
    $count = DB::table('observaciones')->count();
    echo "   ✓ Existe - Total registros: {$count}\n";
    
    if ($count > 0) {
        $sample = DB::table('observaciones')->first();
        echo "   Columnas: " . implode(', ', array_keys((array)$sample)) . "\n";
    }
} else {
    echo "   ✗ NO EXISTE\n";
}

echo "\n=== FIN DEL DIAGNÓSTICO ===\n";

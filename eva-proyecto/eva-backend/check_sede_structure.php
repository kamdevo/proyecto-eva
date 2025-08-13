<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 Checking database structure for sede relationships...\n\n";

// Initialize Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check equipos table structure
echo "📋 EQUIPOS table columns:\n";
$equiposColumns = DB::select('DESCRIBE equipos');
$hasSedeId = false;
foreach ($equiposColumns as $column) {
    if (strpos($column->Field, 'sede') !== false) {
        echo "   ✅ {$column->Field}: {$column->Type}\n";
        $hasSedeId = true;
    }
}
if (!$hasSedeId) {
    echo "   ⚠️ No sede_id field found in equipos table\n";
}

// Check servicios table structure  
echo "\n📋 SERVICIOS table columns:\n";
$serviciosColumns = DB::select('DESCRIBE servicios');
$serviciosHasSedeId = false;
foreach ($serviciosColumns as $column) {
    if (strpos($column->Field, 'sede') !== false) {
        echo "   ✅ {$column->Field}: {$column->Type}\n";
        $serviciosHasSedeId = true;
    }
}

// Check sedes table
echo "\n📋 SEDES table data:\n";
$sedes = DB::table('sedes')->get(['id', 'name']);
foreach ($sedes as $sede) {
    echo "   • ID: {$sede->id} - Name: {$sede->name}\n";
}

// Check relationship between servicios and sedes
if ($serviciosHasSedeId) {
    echo "\n📋 SERVICIOS-SEDES relationship:\n";
    $serviciosWithSedes = DB::table('servicios')
        ->join('sedes', 'servicios.sede_id', '=', 'sedes.id')
        ->select('servicios.id as servicio_id', 'servicios.name as servicio_name', 'sedes.id as sede_id', 'sedes.name as sede_name')
        ->limit(5)
        ->get();
        
    foreach ($serviciosWithSedes as $item) {
        echo "   • Servicio {$item->servicio_id} ({$item->servicio_name}) → Sede {$item->sede_id} ({$item->sede_name})\n";
    }
}

// Check if equipment has direct sede_id or through servicio
echo "\n📋 Equipment with sede information:\n";
$equipmentWithSede = DB::table('equipos')
    ->join('servicios', 'equipos.servicio_id', '=', 'servicios.id')
    ->join('sedes', 'servicios.sede_id', '=', 'sedes.id')
    ->select('equipos.id', 'equipos.name as equipo_name', 'servicios.name as servicio_name', 'sedes.id as sede_id', 'sedes.name as sede_name')
    ->limit(3)
    ->get();
    
foreach ($equipmentWithSede as $item) {
    echo "   • Equipment {$item->id} ({$item->equipo_name}) → Servicio ({$item->servicio_name}) → Sede {$item->sede_id} ({$item->sede_name})\n";
}

// Check specific equipment (ID 65) sede information
echo "\n📋 Equipment ID 65 sede information:\n";
$equipment65 = DB::table('equipos')
    ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
    ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
    ->where('equipos.id', 65)
    ->select('equipos.id', 'equipos.name', 'equipos.servicio_id', 'servicios.name as servicio_name', 'servicios.sede_id', 'sedes.name as sede_name')
    ->first();

if ($equipment65) {
    echo "   • Equipment ID: {$equipment65->id}\n";
    echo "   • Equipment Name: {$equipment65->name}\n";
    echo "   • Servicio ID: {$equipment65->servicio_id}\n";
    echo "   • Servicio Name: {$equipment65->servicio_name}\n";
    echo "   • Sede ID: {$equipment65->sede_id}\n";
    echo "   • Sede Name: {$equipment65->sede_name}\n";
} else {
    echo "   ⚠️ Equipment ID 65 not found\n";
}

echo "\n🎯 CONCLUSION:\n";
if ($hasSedeId) {
    echo "   ✅ Equipment table has direct sede_id field\n";
} else if ($serviciosHasSedeId) {
    echo "   ✅ Equipment sede is derived through servicios.sede_id relationship\n";
    echo "   📋 Equipment → Servicio → Sede (indirect relationship)\n";
} else {
    echo "   ❌ No sede relationship found\n";
}

echo "\n📋 Database structure analysis completed.\n";

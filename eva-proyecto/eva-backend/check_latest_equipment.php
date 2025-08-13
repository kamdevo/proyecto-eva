<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Finding most recently registered equipment...\n";
$latestEquipment = DB::table('equipos')->orderBy('id', 'desc')->first();

if ($latestEquipment) {
    echo "✅ Latest equipment ID: {$latestEquipment->id}\n";
    echo "   Name: {$latestEquipment->name}\n";
    echo "   Serial: {$latestEquipment->serial}\n";
    echo "   Code: {$latestEquipment->code}\n";
    echo "   Marca: {$latestEquipment->marca}\n";
    echo "   Modelo: {$latestEquipment->modelo}\n";
    echo "   Servicio ID: {$latestEquipment->servicio_id}\n";
    echo "   Manual: " . ($latestEquipment->manual ?: 'NULL') . "\n";
    echo "   Plano: " . ($latestEquipment->plano ?: 'NULL') . "\n";
    
    // Test complete-info endpoint simulation
    echo "\n🧪 Testing complete-info endpoint for this equipment...\n";
    
    try {
        $sede = DB::table('sedes')
            ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
            ->where('servicios.id', $latestEquipment->servicio_id)
            ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
            ->first();
            
        if ($sede) {
            echo "✅ Sede info: ID {$sede->sede_id} - {$sede->sede_nombre}\n";
        } else {
            echo "⚠️ No sede info found\n";
        }
    } catch (Exception $e) {
        echo "❌ Error getting sede info: " . $e->getMessage() . "\n";
    }
    
} else {
    echo "❌ No equipment found\n";
}

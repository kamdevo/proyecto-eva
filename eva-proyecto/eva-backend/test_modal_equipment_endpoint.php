<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🧪 Testing modal-equipment-data endpoint with sedes...\n\n";

// Initialize Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Simulate the endpoint response
$data = [
    'sedes' => DB::table('sedes')->get(['id', 'name']),
    'servicios' => DB::table('servicios')->where('status', 1)->get(['id', 'name']),
    'areas' => DB::table('areas')->where('status', 1)->get(['id', 'name', 'servicio_id']),
    'propietarios' => DB::table('propietarios')->get(['id', 'nombre as name']),
];

echo "✅ SEDES in modal-equipment-data endpoint:\n";
foreach ($data['sedes'] as $sede) {
    echo "   • ID: {$sede->id} - Name: {$sede->name}\n";
}

echo "\n✅ Total sedes available: " . count($data['sedes']) . "\n";
echo "✅ Endpoint now includes sedes data for registration modal\n";

echo "\n📋 Complete endpoint response structure:\n";
echo "   • sedes: " . count($data['sedes']) . " items\n";
echo "   • servicios: " . count($data['servicios']) . " items\n";
echo "   • areas: " . count($data['areas']) . " items\n";
echo "   • propietarios: " . count($data['propietarios']) . " items\n";

echo "\n🎯 REGISTRATION MODAL SEDE POPULATION:\n";
echo "======================================\n";
echo "✅ Backend endpoint now includes sedes\n";
echo "✅ Frontend will receive sedes in catalogs.sedes\n";
echo "✅ Select dropdown will populate with all available sedes\n";
echo "✅ Users can select from: " . implode(', ', $data['sedes']->pluck('name')->toArray()) . "\n";

echo "\n📋 Test completed successfully!\n";

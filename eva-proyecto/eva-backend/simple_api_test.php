<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "🔍 SIMPLE API TEST FOR EQUIPMENT ID 69\n";
    echo "======================================\n\n";
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipo) {
        echo "❌ Equipment not found\n";
        exit(1);
    }
    
    echo "📋 CRITICAL FIELDS FOR SELECT DROPDOWNS:\n";
    echo "   sede_id: {$equipo->sede_id} (type: " . gettype($equipo->sede_id) . ")\n";
    echo "   servicio_id: {$equipo->servicio_id} (type: " . gettype($equipo->servicio_id) . ")\n";
    echo "   area_id: {$equipo->area_id} (type: " . gettype($equipo->area_id) . ")\n";
    echo "   propietario_id: {$equipo->propietario_id} (type: " . gettype($equipo->propietario_id) . ")\n";
    echo "   estadoequipo_id: {$equipo->estadoequipo_id} (type: " . gettype($equipo->estadoequipo_id) . ")\n\n";
    
    echo "📋 FRONTEND CONVERSION (to string):\n";
    echo "   sede_id: '" . strval($equipo->sede_id) . "'\n";
    echo "   servicio_id: '" . strval($equipo->servicio_id) . "'\n";
    echo "   area_id: '" . strval($equipo->area_id) . "'\n";
    echo "   propietario_id: '" . strval($equipo->propietario_id) . "'\n";
    echo "   estadoequipo_id: '" . strval($equipo->estadoequipo_id) . "'\n\n";
    
    echo "📋 TEXT FIELDS:\n";
    echo "   name: '{$equipo->name}'\n";
    echo "   serial: '{$equipo->serial}'\n";
    echo "   code: '{$equipo->code}'\n";
    echo "   marca: '{$equipo->marca}'\n";
    echo "   modelo: '{$equipo->modelo}'\n\n";
    
    echo "📋 JSON FIELDS:\n";
    echo "   manual: {$equipo->manual}\n";
    echo "   plano: {$equipo->plano}\n\n";
    
    // Get sede info
    $sede = DB::table('sedes')
        ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
        ->where('servicios.id', $equipo->servicio_id)
        ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
        ->first();
    
    if ($sede) {
        echo "📋 SEDE INFO:\n";
        echo "   sede_id from join: {$sede->sede_id}\n";
        echo "   sede_nombre: {$sede->sede_nombre}\n\n";
    }
    
    echo "🎯 EXPECTED FRONTEND BEHAVIOR:\n";
    echo "==============================\n";
    echo "When the edit modal opens, you should see:\n\n";
    
    echo "✅ TEXT INPUTS (should be pre-filled):\n";
    echo "   • Name: '{$equipo->name}'\n";
    echo "   • Serial: '{$equipo->serial}'\n";
    echo "   • Code: '{$equipo->code}'\n";
    echo "   • Marca: '{$equipo->marca}'\n";
    echo "   • Modelo: '{$equipo->modelo}'\n\n";
    
    echo "✅ SELECT DROPDOWNS (should show selected values, NOT placeholders):\n";
    echo "   • Sede: Should show '{$sede->sede_nombre}' (NOT '--SELECCIONE--')\n";
    echo "   • Servicio: Should show service name (NOT 'Seleccione un servicio')\n";
    echo "   • Área: Should show area name (NOT 'Seleccione un área')\n";
    echo "   • Propietario: Should show owner name (NOT 'Seleccione un propietario')\n\n";
    
    // Parse JSON for checkboxes
    $manuales = json_decode($equipo->manual, true);
    $planos = json_decode($equipo->plano, true);
    
    echo "✅ CHECKBOXES (should show correct states):\n";
    echo "   MANUALES:\n";
    foreach ($manuales as $key => $value) {
        $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
        echo "     • " . ucfirst($key) . ": {$status}\n";
    }
    echo "   PLANOS:\n";
    foreach ($planos as $key => $value) {
        $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
        echo "     • " . ucfirst($key) . ": {$status}\n";
    }
    
    echo "\n🚨 IF YOU SEE PLACEHOLDERS IN DROPDOWNS:\n";
    echo "========================================\n";
    echo "1. Open browser console (F12)\n";
    echo "2. Look for console messages with 🔧, 📝, 🎯 emojis\n";
    echo "3. Check if 'Final form data state' shows the correct IDs\n";
    echo "4. Verify there are no JavaScript errors\n";
    echo "5. The issue is likely in the frontend form initialization timing\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Simple API test completed.\n";

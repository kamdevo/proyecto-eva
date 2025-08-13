<?php

/**
 * Test API response format for frontend debugging
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 TESTING API RESPONSE FORMAT FOR FRONTEND\n";
echo "===========================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test equipment ID 69
    $equipmentId = 69;
    echo "Testing Equipment ID: {$equipmentId}\n\n";
    
    // Get equipment data exactly as the API endpoint does
    $equipo = DB::table('equipos')->where('id', $equipmentId)->first();
    
    if (!$equipo) {
        echo "❌ Equipment not found\n";
        exit(1);
    }
    
    // Simulate the complete-info endpoint response
    $equipoData = (array) $equipo;
    
    // Get sede information
    $sede = DB::table('sedes')
        ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
        ->where('servicios.id', $equipo->servicio_id)
        ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
        ->first();
    
    if ($sede) {
        $equipoData['sede_id'] = $sede->sede_id;
        $equipoData['sede_nombre'] = $sede->sede_nombre;
    }
    
    // Get additional related data
    $equipoData['servicio_nombre'] = DB::table('servicios')->where('id', $equipo->servicio_id)->value('name');
    $equipoData['area_nombre'] = DB::table('areas')->where('id', $equipo->area_id)->value('name');
    $equipoData['propietario_nombre'] = DB::table('propietarios')->where('id', $equipo->propietario_id)->value('name');
    $equipoData['estado_nombre'] = DB::table('estadosequipos')->where('id', $equipo->estadoequipo_id)->value('name');
    
    echo "🎯 API RESPONSE DATA ANALYSIS:\n";
    echo "==============================\n\n";
    
    echo "📋 CRITICAL FIELDS FOR SELECT COMPONENTS:\n";
    echo "   sede_id: " . ($equipoData['sede_id'] ?? 'NULL') . " (type: " . gettype($equipoData['sede_id'] ?? null) . ")\n";
    echo "   servicio_id: " . ($equipoData['servicio_id'] ?? 'NULL') . " (type: " . gettype($equipoData['servicio_id'] ?? null) . ")\n";
    echo "   area_id: " . ($equipoData['area_id'] ?? 'NULL') . " (type: " . gettype($equipoData['area_id'] ?? null) . ")\n";
    echo "   propietario_id: " . ($equipoData['propietario_id'] ?? 'NULL') . " (type: " . gettype($equipoData['propietario_id'] ?? null) . ")\n";
    echo "   estadoequipo_id: " . ($equipoData['estadoequipo_id'] ?? 'NULL') . " (type: " . gettype($equipoData['estadoequipo_id'] ?? null) . ")\n";
    echo "   cbiomedica_id: " . ($equipoData['cbiomedica_id'] ?? 'NULL') . " (type: " . gettype($equipoData['cbiomedica_id'] ?? null) . ")\n";
    echo "   criesgo_id: " . ($equipoData['criesgo_id'] ?? 'NULL') . " (type: " . gettype($equipoData['criesgo_id'] ?? null) . ")\n\n";
    
    echo "📋 RELATED NAMES FOR VERIFICATION:\n";
    echo "   sede_nombre: " . ($equipoData['sede_nombre'] ?? 'NULL') . "\n";
    echo "   servicio_nombre: " . ($equipoData['servicio_nombre'] ?? 'NULL') . "\n";
    echo "   area_nombre: " . ($equipoData['area_nombre'] ?? 'NULL') . "\n";
    echo "   propietario_nombre: " . ($equipoData['propietario_nombre'] ?? 'NULL') . "\n";
    echo "   estado_nombre: " . ($equipoData['estado_nombre'] ?? 'NULL') . "\n\n";
    
    echo "📋 TEXT FIELDS:\n";
    echo "   name: " . ($equipoData['name'] ?? 'NULL') . "\n";
    echo "   serial: " . ($equipoData['serial'] ?? 'NULL') . "\n";
    echo "   code: " . ($equipoData['code'] ?? 'NULL') . "\n";
    echo "   marca: " . ($equipoData['marca'] ?? 'NULL') . "\n";
    echo "   modelo: " . ($equipoData['modelo'] ?? 'NULL') . "\n\n";
    
    echo "📋 JSON FIELDS:\n";
    echo "   manual: " . ($equipoData['manual'] ?? 'NULL') . "\n";
    echo "   plano: " . ($equipoData['plano'] ?? 'NULL') . "\n\n";
    
    // Test JSON parsing
    if (!empty($equipoData['manual'])) {
        $manuales = json_decode($equipoData['manual'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ Manual JSON parsed successfully:\n";
            foreach ($manuales as $key => $value) {
                echo "     {$key}: " . ($value ? 'true' : 'false') . "\n";
            }
        } else {
            echo "❌ Manual JSON parsing failed: " . json_last_error_msg() . "\n";
        }
    }
    
    if (!empty($equipoData['plano'])) {
        $planos = json_decode($equipoData['plano'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ Plano JSON parsed successfully:\n";
            foreach ($planos as $key => $value) {
                echo "     {$key}: " . ($value ? 'true' : 'false') . "\n";
            }
        } else {
            echo "❌ Plano JSON parsing failed: " . json_last_error_msg() . "\n";
        }
    }
    
    echo "\n🎯 FRONTEND FORM DATA CONVERSION:\n";
    echo "=================================\n\n";
    
    // Simulate frontend conversion
    echo "📋 CONVERTED VALUES FOR FRONTEND:\n";
    echo "   sede_id: '" . (($equipoData['sede_id'] && $equipoData['sede_id'] !== 0) ? strval($equipoData['sede_id']) : '') . "'\n";
    echo "   servicio_id: '" . (($equipoData['servicio_id'] && $equipoData['servicio_id'] !== 0) ? strval($equipoData['servicio_id']) : '') . "'\n";
    echo "   area_id: '" . (($equipoData['area_id'] && $equipoData['area_id'] !== 0) ? strval($equipoData['area_id']) : '') . "'\n";
    echo "   propietario_id: '" . (($equipoData['propietario_id'] && $equipoData['propietario_id'] !== 0) ? strval($equipoData['propietario_id']) : '') . "'\n";
    echo "   estadoequipo_id: '" . (($equipoData['estadoequipo_id'] && $equipoData['estadoequipo_id'] !== 0) ? strval($equipoData['estadoequipo_id']) : '') . "'\n\n";
    
    echo "🎯 EXPECTED FRONTEND BEHAVIOR:\n";
    echo "==============================\n\n";
    
    echo "✅ SELECT COMPONENTS SHOULD SHOW:\n";
    echo "   • Sede dropdown: '{$equipoData['sede_nombre']}' (NOT 'Seleccione una sede')\n";
    echo "   • Servicio dropdown: '{$equipoData['servicio_nombre']}' (NOT 'Seleccione un servicio')\n";
    echo "   • Área dropdown: '{$equipoData['area_nombre']}' (NOT 'Seleccione un área')\n";
    echo "   • Propietario dropdown: '{$equipoData['propietario_nombre']}' (NOT 'Seleccione un propietario')\n";
    echo "   • Estado dropdown: '{$equipoData['estado_nombre']}' (NOT 'Seleccione un estado')\n\n";
    
    echo "✅ TEXT INPUTS SHOULD SHOW:\n";
    echo "   • Nombre: '{$equipoData['name']}'\n";
    echo "   • Serial: '{$equipoData['serial']}'\n";
    echo "   • Código: '{$equipoData['code']}'\n";
    echo "   • Marca: '{$equipoData['marca']}'\n";
    echo "   • Modelo: '{$equipoData['modelo']}'\n\n";
    
    if (!empty($equipoData['manual'])) {
        $manuales = json_decode($equipoData['manual'], true);
        echo "✅ CHECKBOXES MANUALES SHOULD BE:\n";
        foreach ($manuales as $key => $value) {
            $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
            echo "   • " . ucfirst($key) . ": {$status}\n";
        }
        echo "\n";
    }
    
    if (!empty($equipoData['plano'])) {
        $planos = json_decode($equipoData['plano'], true);
        echo "✅ CHECKBOXES PLANOS SHOULD BE:\n";
        foreach ($planos as $key => $value) {
            $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
            echo "   • " . ucfirst($key) . ": {$status}\n";
        }
        echo "\n";
    }
    
    echo "🚨 IF DROPDOWNS SHOW PLACEHOLDERS:\n";
    echo "==================================\n";
    echo "1. Check browser console for JavaScript errors\n";
    echo "2. Verify formReady state is being set to true\n";
    echo "3. Confirm dropdown options are loaded before form data\n";
    echo "4. Check if Select component values match option values exactly\n";
    echo "5. Verify no race conditions in state updates\n\n";
    
    echo "📋 DEBUGGING STEPS:\n";
    echo "===================\n";
    echo "1. Open browser console (F12)\n";
    echo "2. Look for console.log messages starting with 🔧, 📝, 🎯\n";
    echo "3. Check if 'Final form data state' shows correct IDs\n";
    echo "4. Verify 'Dropdown options status' shows loaded options\n";
    echo "5. Look for any JavaScript errors or warnings\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 API response format test completed.\n";

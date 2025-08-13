<?php

/**
 * Test complete flow for edit modal debugging
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🧪 COMPLETE FLOW TEST FOR EDIT MODAL\n";
echo "====================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Step 1: Testing Equipment ID 69 data...\n";
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipo) {
        echo "❌ Equipment not found\n";
        exit(1);
    }
    
    echo "✅ Equipment found: {$equipo->name}\n";
    echo "   servicio_id: {$equipo->servicio_id} (type: " . gettype($equipo->servicio_id) . ")\n";
    echo "   area_id: {$equipo->area_id} (type: " . gettype($equipo->area_id) . ")\n";
    echo "   propietario_id: {$equipo->propietario_id} (type: " . gettype($equipo->propietario_id) . ")\n";
    echo "   estadoequipo_id: {$equipo->estadoequipo_id} (type: " . gettype($equipo->estadoequipo_id) . ")\n\n";
    
    echo "📋 Step 2: Testing complete-info endpoint simulation...\n";
    
    // Simulate complete-info endpoint
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
        echo "✅ Sede info added: ID {$sede->sede_id} - {$sede->sede_nombre}\n";
    } else {
        echo "⚠️ No sede info found\n";
    }
    
    echo "\n📋 Step 3: Testing frontend form data conversion...\n";
    
    // Simulate frontend form data initialization
    $formData = [
        'name' => $equipoData['name'] ?? '',
        'serial' => $equipoData['serial'] ?? '',
        'code' => $equipoData['code'] ?? '',
        'marca' => $equipoData['marca'] ?? '',
        'modelo' => $equipoData['modelo'] ?? '',
        
        // Critical: Convert IDs to strings as frontend expects
        'sede_id' => ($equipoData['sede_id'] && $equipoData['sede_id'] !== 0) ? strval($equipoData['sede_id']) : '',
        'servicio_id' => ($equipoData['servicio_id'] && $equipoData['servicio_id'] !== 0) ? strval($equipoData['servicio_id']) : '',
        'area_id' => ($equipoData['area_id'] && $equipoData['area_id'] !== 0) ? strval($equipoData['area_id']) : '',
        'propietario_id' => ($equipoData['propietario_id'] && $equipoData['propietario_id'] !== 0) ? strval($equipoData['propietario_id']) : '',
        'estadoequipo_id' => ($equipoData['estadoequipo_id'] && $equipoData['estadoequipo_id'] !== 0) ? strval($equipoData['estadoequipo_id']) : '',
    ];
    
    echo "✅ Form data converted:\n";
    echo "   name: '{$formData['name']}'\n";
    echo "   serial: '{$formData['serial']}'\n";
    echo "   sede_id: '{$formData['sede_id']}' (string)\n";
    echo "   servicio_id: '{$formData['servicio_id']}' (string)\n";
    echo "   area_id: '{$formData['area_id']}' (string)\n";
    echo "   propietario_id: '{$formData['propietario_id']}' (string)\n";
    echo "   estadoequipo_id: '{$formData['estadoequipo_id']}' (string)\n\n";
    
    echo "📋 Step 4: Testing JSON parsing...\n";
    
    // Test manuales
    $manuales = ['operacion' => false, 'mantenimiento' => false, 'partes' => false, 'otros' => false];
    if (!empty($equipoData['manual'])) {
        try {
            $parsed = json_decode($equipoData['manual'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
                $manuales = $parsed;
                echo "✅ Manuales JSON parsed successfully\n";
            }
        } catch (Exception $e) {
            echo "❌ Manuales JSON parsing failed\n";
        }
    }
    
    // Test planos
    $planos = ['electrico' => false, 'electronico' => false, 'neumatico' => false, 'mecanico' => false];
    if (!empty($equipoData['plano'])) {
        try {
            $parsed = json_decode($equipoData['plano'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
                $planos = $parsed;
                echo "✅ Planos JSON parsed successfully\n";
            }
        } catch (Exception $e) {
            echo "❌ Planos JSON parsing failed\n";
        }
    }
    
    echo "\n🎯 EXPECTED FRONTEND BEHAVIOR:\n";
    echo "==============================\n\n";
    
    echo "When you open the edit modal for Equipment ID 69, you should see:\n\n";
    
    echo "✅ TEXT INPUTS (pre-filled):\n";
    echo "   • Nombre: '{$formData['name']}'\n";
    echo "   • Serial: '{$formData['serial']}'\n";
    echo "   • Código: '{$formData['code']}'\n";
    echo "   • Marca: '{$formData['marca']}'\n";
    echo "   • Modelo: '{$formData['modelo']}'\n\n";
    
    echo "✅ SELECT DROPDOWNS (showing selected values, NOT placeholders):\n";
    echo "   • Sede: Should show '{$equipoData['sede_nombre']}'\n";
    echo "   • Servicio: Should show service name (ID: {$formData['servicio_id']})\n";
    echo "   • Área: Should show area name (ID: {$formData['area_id']})\n";
    echo "   • Propietario: Should show owner name (ID: {$formData['propietario_id']})\n";
    echo "   • Estado: Should show status name (ID: {$formData['estadoequipo_id']})\n\n";
    
    echo "✅ CHECKBOXES:\n";
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
    
    echo "\n🔧 DEBUGGING INSTRUCTIONS:\n";
    echo "==========================\n\n";
    
    echo "1. Open the edit modal for Equipment ID 69\n";
    echo "2. Open browser console (F12)\n";
    echo "3. Look for these console messages:\n";
    echo "   • '🔧 Step 2: Loading equipment data...'\n";
    echo "   • '📝 Step 3: Initializing form data...'\n";
    echo "   • '🎯 Setting form as ready for rendering'\n";
    echo "   • '📊 Form data before ready:' (should show correct IDs)\n";
    echo "   • '🔄 Form data updated after ready state:'\n\n";
    
    echo "4. If you see placeholders instead of values:\n";
    echo "   • Check if the console shows correct IDs in 'Form data before ready'\n";
    echo "   • Verify there are no JavaScript errors\n";
    echo "   • Look for timing issues in the console logs\n\n";
    
    echo "5. The form data should show these exact values:\n";
    echo "   • sede_id: '{$formData['sede_id']}'\n";
    echo "   • servicio_id: '{$formData['servicio_id']}'\n";
    echo "   • area_id: '{$formData['area_id']}'\n";
    echo "   • propietario_id: '{$formData['propietario_id']}'\n\n";
    
    echo "🎉 If all values match, the edit modal should work perfectly!\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Complete flow test finished.\n";

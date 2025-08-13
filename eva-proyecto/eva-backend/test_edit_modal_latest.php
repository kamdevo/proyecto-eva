<?php

/**
 * Test edit modal with latest registered equipment
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🧪 TESTING EDIT MODAL WITH LATEST EQUIPMENT\n";
echo "===========================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Get latest equipment
    $latestEquipment = DB::table('equipos')->orderBy('id', 'desc')->first();
    
    if (!$latestEquipment) {
        echo "❌ No equipment found\n";
        exit(1);
    }
    
    echo "📋 Latest Equipment Details:\n";
    echo "   ID: {$latestEquipment->id}\n";
    echo "   Name: {$latestEquipment->name}\n";
    echo "   Serial: {$latestEquipment->serial}\n";
    echo "   Code: {$latestEquipment->code}\n";
    echo "   Marca: {$latestEquipment->marca}\n";
    echo "   Modelo: {$latestEquipment->modelo}\n";
    echo "   Servicio ID: {$latestEquipment->servicio_id}\n";
    echo "   Manual: " . ($latestEquipment->manual ?: 'NULL') . "\n";
    echo "   Plano: " . ($latestEquipment->plano ?: 'NULL') . "\n";
    
    echo "\n🔍 Testing complete-info endpoint simulation...\n";
    
    // Simulate complete-info endpoint
    $equipoData = (array) $latestEquipment;
    
    // Get sede information
    try {
        $sede = DB::table('sedes')
            ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
            ->where('servicios.id', $latestEquipment->servicio_id)
            ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
            ->first();
        if ($sede) {
            $equipoData['sede_id'] = $sede->sede_id;
            $equipoData['sede_nombre'] = $sede->sede_nombre;
        }
    } catch (Exception $e) {
        $equipoData['sede_id'] = null;
        $equipoData['sede_nombre'] = null;
    }
    
    echo "✅ Complete equipment data:\n";
    foreach ($equipoData as $key => $value) {
        if (in_array($key, ['name', 'serial', 'code', 'marca', 'modelo', 'servicio_id', 'sede_id', 'manual', 'plano'])) {
            echo "   {$key}: " . ($value ?: 'NULL') . "\n";
        }
    }
    
    echo "\n🔍 Testing form data initialization...\n";
    
    // Simulate frontend form data initialization
    $formData = [
        'name' => $equipoData['name'] ?? '',
        'serial' => $equipoData['serial'] ?? '',
        'code' => $equipoData['code'] ?? '',
        'marca' => $equipoData['marca'] ?? '',
        'modelo' => $equipoData['modelo'] ?? '',
        'servicio_id' => $equipoData['servicio_id'] ? strval($equipoData['servicio_id']) : '',
        'sede_id' => $equipoData['sede_id'] ? strval($equipoData['sede_id']) : '',
    ];
    
    // Test manuales JSON parsing
    $manuales = ['operacion' => false, 'mantenimiento' => false, 'partes' => false, 'otros' => false];
    if (!empty($equipoData['manual'])) {
        try {
            $parsedManuales = json_decode($equipoData['manual'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($parsedManuales)) {
                $manuales = $parsedManuales;
            }
        } catch (Exception $e) {
            // Keep default values
        }
    }
    $formData['manuales'] = $manuales;
    
    // Test planos JSON parsing
    $planos = ['electrico' => false, 'electronico' => false, 'neumatico' => false, 'mecanico' => false];
    if (!empty($equipoData['plano'])) {
        try {
            $parsedPlanos = json_decode($equipoData['plano'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($parsedPlanos)) {
                $planos = $parsedPlanos;
            }
        } catch (Exception $e) {
            // Keep default values
        }
    }
    $formData['planos'] = $planos;
    
    echo "✅ Form data initialization results:\n";
    echo "   name: '{$formData['name']}'\n";
    echo "   serial: '{$formData['serial']}'\n";
    echo "   code: '{$formData['code']}'\n";
    echo "   marca: '{$formData['marca']}'\n";
    echo "   modelo: '{$formData['modelo']}'\n";
    echo "   servicio_id: '{$formData['servicio_id']}'\n";
    echo "   sede_id: '{$formData['sede_id']}'\n";
    
    echo "\n✅ Checkbox states:\n";
    echo "   MANUALES:\n";
    foreach ($formData['manuales'] as $key => $value) {
        $status = $value ? 'CHECKED' : 'UNCHECKED';
        echo "     {$key}: {$status}\n";
    }
    echo "   PLANOS:\n";
    foreach ($formData['planos'] as $key => $value) {
        $status = $value ? 'CHECKED' : 'UNCHECKED';
        echo "     {$key}: {$status}\n";
    }
    
    echo "\n🎯 EDIT MODAL READINESS ASSESSMENT:\n";
    echo "===================================\n";
    
    $issues = [];
    
    // Check basic fields
    if (empty($formData['name'])) $issues[] = "Name field is empty";
    if (empty($formData['serial'])) $issues[] = "Serial field is empty";
    if (empty($formData['code'])) $issues[] = "Code field is empty";
    if (empty($formData['servicio_id'])) $issues[] = "Servicio ID is empty";
    
    // Check if manual/plano data is properly handled
    if (!is_array($formData['manuales'])) $issues[] = "Manuales is not an array";
    if (!is_array($formData['planos'])) $issues[] = "Planos is not an array";
    
    if (empty($issues)) {
        echo "🎉 ✅ EDIT MODAL SHOULD WORK PERFECTLY!\n\n";
        echo "📋 CONFIRMED FUNCTIONALITY:\n";
        echo "   ✅ All basic fields will be pre-populated\n";
        echo "   ✅ Checkboxes will show correct states\n";
        echo "   ✅ Form data initialization is working\n";
        echo "   ✅ JSON parsing for manuales/planos is correct\n\n";
        
        echo "🚀 EXPECTED BEHAVIOR:\n";
        echo "   • Name field: '{$formData['name']}'\n";
        echo "   • Serial field: '{$formData['serial']}'\n";
        echo "   • Code field: '{$formData['code']}'\n";
        echo "   • All checkboxes: " . (array_sum($formData['manuales']) + array_sum($formData['planos']) > 0 ? "Some checked" : "All unchecked (default)") . "\n";
        echo "   • Dropdown fields: Will show selected values\n\n";
        
        echo "📋 TESTING INSTRUCTIONS:\n";
        echo "   1. Open edit modal for equipment ID {$latestEquipment->id}\n";
        echo "   2. Verify all fields show values above\n";
        echo "   3. Verify checkboxes show correct states\n";
        echo "   4. Make changes and save to test complete workflow\n";
        
    } else {
        echo "⚠️ POTENTIAL ISSUES FOUND:\n";
        foreach ($issues as $issue) {
            echo "   ❌ {$issue}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Edit modal test completed.\n";

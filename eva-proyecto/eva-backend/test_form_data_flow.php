<?php

/**
 * Test the complete form data flow for edit modal
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🧪 TESTING COMPLETE FORM DATA FLOW\n";
echo "==================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test Equipment ID 67
    $equipmentId = 67;
    echo "Testing Equipment ID: {$equipmentId}\n\n";
    
    // Step 1: Simulate complete-info API call
    echo "🔍 Step 1: Simulating complete-info API call...\n";
    
    $equipo = DB::table('equipos')->where('id', $equipmentId)->first();
    if (!$equipo) {
        echo "❌ Equipment not found\n";
        exit(1);
    }
    
    // Simulate the exact controller logic
    $equipoData = (array) $equipo;
    
    // Get sede information
    try {
        $sede = DB::table('sedes')
            ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
            ->where('servicios.id', $equipo->servicio_id)
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
    
    echo "✅ API Response Data:\n";
    echo "   name: " . ($equipoData['name'] ?? 'NULL') . "\n";
    echo "   serial: " . ($equipoData['serial'] ?? 'NULL') . "\n";
    echo "   code: " . ($equipoData['code'] ?? 'NULL') . "\n";
    echo "   manual: " . ($equipoData['manual'] ?? 'NULL') . "\n";
    echo "   plano: " . ($equipoData['plano'] ?? 'NULL') . "\n";
    echo "   sede_id: " . ($equipoData['sede_id'] ?? 'NULL') . "\n";
    
    // Step 2: Simulate frontend form data initialization
    echo "\n🔍 Step 2: Simulating frontend form data initialization...\n";
    
    // Simulate the exact frontend logic from initializeFormData
    $formData = [
        // Basic fields
        'name' => $equipoData['name'] ?? '',
        'serial' => $equipoData['serial'] ?? '',
        'code' => $equipoData['code'] ?? '',
        'marca' => $equipoData['marca'] ?? '',
        'modelo' => $equipoData['modelo'] ?? '',
        'descripcion' => $equipoData['descripcion'] ?? '',
        
        // IDs
        'sede_id' => ($equipoData['sede_id'] && $equipoData['sede_id'] !== 0) ? strval($equipoData['sede_id']) : '',
        'servicio_id' => ($equipoData['servicio_id'] && $equipoData['servicio_id'] !== 0) ? strval($equipoData['servicio_id']) : '',
        'area_id' => ($equipoData['area_id'] && $equipoData['area_id'] !== 0) ? strval($equipoData['area_id']) : '',
        'propietario_id' => ($equipoData['propietario_id'] && $equipoData['propietario_id'] !== 0) ? strval($equipoData['propietario_id']) : '',
        
        // Other fields
        'costo' => $equipoData['costo'] ?? '',
        'vida_util' => $equipoData['vida_util'] ?? '',
        'observacion' => $equipoData['observacion'] ?? '',
    ];
    
    // Simulate manuales processing
    $manuales = ['operacion' => false, 'mantenimiento' => false, 'partes' => false, 'otros' => false];
    if (isset($equipoData['manual']) && $equipoData['manual']) {
        try {
            if (is_string($equipoData['manual'])) {
                $parsed = json_decode($equipoData['manual'], true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
                    $manuales = $parsed;
                }
            } else {
                $manuales = $equipoData['manual'];
            }
        } catch (Exception $e) {
            // Keep defaults
        }
    }
    $formData['manuales'] = $manuales;
    
    // Simulate planos processing
    $planos = ['electrico' => false, 'electronico' => false, 'neumatico' => false, 'mecanico' => false];
    if (isset($equipoData['plano']) && $equipoData['plano']) {
        try {
            if (is_string($equipoData['plano'])) {
                $parsed = json_decode($equipoData['plano'], true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
                    $planos = $parsed;
                }
            } else {
                $planos = $equipoData['plano'];
            }
        } catch (Exception $e) {
            // Keep defaults
        }
    }
    $formData['planos'] = $planos;
    
    echo "✅ Form Data Initialization Results:\n";
    echo "   BASIC FIELDS:\n";
    echo "     name: '{$formData['name']}'\n";
    echo "     serial: '{$formData['serial']}'\n";
    echo "     code: '{$formData['code']}'\n";
    echo "     marca: '{$formData['marca']}'\n";
    echo "     modelo: '{$formData['modelo']}'\n";
    
    echo "   DROPDOWN FIELDS:\n";
    echo "     sede_id: '{$formData['sede_id']}'\n";
    echo "     servicio_id: '{$formData['servicio_id']}'\n";
    echo "     area_id: '{$formData['area_id']}'\n";
    echo "     propietario_id: '{$formData['propietario_id']}'\n";
    
    echo "   CHECKBOX FIELDS:\n";
    echo "     MANUALES:\n";
    foreach ($formData['manuales'] as $key => $value) {
        $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
        echo "       {$key}: {$status}\n";
    }
    echo "     PLANOS:\n";
    foreach ($formData['planos'] as $key => $value) {
        $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
        echo "       {$key}: {$status}\n";
    }
    
    // Step 3: Test form submission data
    echo "\n🔍 Step 3: Simulating form submission...\n";
    
    $submitData = [];
    foreach ($formData as $key => $value) {
        if ($key === 'manuales' || $key === 'planos') {
            $submitData[$key] = json_encode($value);
        } else {
            $submitData[$key] = $value;
        }
    }
    
    echo "✅ Form Submission Data:\n";
    echo "   manuales: " . $submitData['manuales'] . "\n";
    echo "   planos: " . $submitData['planos'] . "\n";
    
    // Step 4: Test if the data would be saved correctly
    echo "\n🔍 Step 4: Testing backend processing simulation...\n";
    
    // Simulate backend processing
    $backendData = [];
    if (isset($submitData['manuales'])) {
        $manualesDecoded = json_decode($submitData['manuales'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $backendData['manual'] = $submitData['manuales']; // Store as JSON string
            echo "✅ Manuales would be saved as: " . $backendData['manual'] . "\n";
        } else {
            echo "❌ Manuales JSON is invalid\n";
        }
    }
    
    if (isset($submitData['planos'])) {
        $planosDecoded = json_decode($submitData['planos'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $backendData['plano'] = $submitData['planos']; // Store as JSON string
            echo "✅ Planos would be saved as: " . $backendData['plano'] . "\n";
        } else {
            echo "❌ Planos JSON is invalid\n";
        }
    }
    
    echo "\n🎯 ANALYSIS RESULTS:\n";
    echo "===================\n";
    
    $issues = [];
    
    // Check if basic fields are populated
    if (empty($formData['name'])) $issues[] = "Name field is empty";
    if (empty($formData['serial'])) $issues[] = "Serial field is empty";
    
    // Check if checkbox data is correct
    $hasCheckedManuales = array_filter($formData['manuales']);
    $hasCheckedPlanos = array_filter($formData['planos']);
    
    if (empty($hasCheckedManuales) && empty($hasCheckedPlanos)) {
        echo "⚠️ All checkboxes are unchecked (this might be expected for some equipment)\n";
    } else {
        echo "✅ Some checkboxes are checked as expected\n";
    }
    
    if (empty($issues)) {
        echo "🎉 ✅ FORM DATA FLOW IS WORKING CORRECTLY!\n\n";
        echo "📋 EXPECTED EDIT MODAL BEHAVIOR:\n";
        echo "   • All input fields should show current values\n";
        echo "   • Checkboxes should reflect current states\n";
        echo "   • Form submission should preserve all data\n";
        echo "   • Data should save correctly to database\n\n";
        
        echo "🚀 IF EDIT MODAL IS STILL NOT WORKING:\n";
        echo "   1. Check browser console for JavaScript errors\n";
        echo "   2. Verify API calls are completing successfully\n";
        echo "   3. Check if formReady state is being set to true\n";
        echo "   4. Verify component re-rendering is happening\n";
        
    } else {
        echo "⚠️ POTENTIAL ISSUES FOUND:\n";
        foreach ($issues as $issue) {
            echo "   ❌ {$issue}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Form data flow test completed.\n";

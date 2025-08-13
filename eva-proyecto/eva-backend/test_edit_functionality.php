<?php

/**
 * Test script to verify edit functionality works 100% perfectly
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Api\EquipmentController;

echo "🧪 COMPREHENSIVE EDIT FUNCTIONALITY VERIFICATION\n";
echo "==================================================\n\n";

try {
    // Initialize Laravel application
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $controller = new EquipmentController();
    
    // Step 1: Get existing equipment data
    echo "📋 Step 1: Loading existing equipment data...\n";
    $getResponse = $controller->getCompleteInfo(64);
    $getData = json_decode($getResponse->getContent(), true);
    
    if ($getData['success']) {
        $equipment = $getData['data'];
        echo "✅ Equipment loaded successfully:\n";
        echo "   - ID: {$equipment['id']}\n";
        echo "   - Name: {$equipment['name']}\n";
        echo "   - Code: {$equipment['code']}\n";
        echo "   - Manual: '{$equipment['manual']}'\n";
        echo "   - Plano: '{$equipment['plano']}'\n\n";
        
        // Verify JSON parsing
        $currentManuales = json_decode($equipment['manual'], true);
        $currentPlanos = json_decode($equipment['plano'], true);
        
        echo "✅ Current MANUALES data:\n";
        echo "   * Operación: " . ($currentManuales['operacion'] ? 'true' : 'false') . "\n";
        echo "   * Mantenimiento: " . ($currentManuales['mantenimiento'] ? 'true' : 'false') . "\n";
        echo "   * Partes: " . ($currentManuales['partes'] ? 'true' : 'false') . "\n";
        echo "   * Otros: " . ($currentManuales['otros'] ? 'true' : 'false') . "\n\n";
        
        echo "✅ Current PLANOS data:\n";
        echo "   * Eléctrico: " . ($currentPlanos['electrico'] ? 'true' : 'false') . "\n";
        echo "   * Electrónico: " . ($currentPlanos['electronico'] ? 'true' : 'false') . "\n";
        echo "   * Neumático: " . ($currentPlanos['neumatico'] ? 'true' : 'false') . "\n";
        echo "   * Mecánico: " . ($currentPlanos['mecanico'] ? 'true' : 'false') . "\n\n";
        
        // Step 2: Prepare update data with MODIFIED values
        echo "📝 Step 2: Preparing UPDATE data with modified values...\n";
        
        $updateData = [
            'name' => 'EDITED - Test Equipment Registration',
            'code' => $equipment['code'] . '-EDITED',
            'servicio_id' => $equipment['servicio_id'],
            'area_id' => $equipment['area_id'],
            'marca' => 'EDITED Brand',
            'modelo' => 'EDITED Model',
            'serial' => $equipment['serial'],
            'descripcion' => 'EDITED - Testing complete edit functionality',
            
            // MODIFIED manuales data (flip some boolean values)
            'manuales' => json_encode([
                'operacion' => false,      // was true
                'mantenimiento' => false,  // was true  
                'partes' => true,          // was false
                'otros' => true            // was true (no change)
            ]),
            
            // MODIFIED planos data (flip some boolean values)
            'planos' => json_encode([
                'electrico' => true,       // was false
                'electronico' => false,    // was true
                'neumatico' => false,      // was true
                'mecanico' => true         // was false
            ]),
            
            'propietario_id' => $equipment['propietario_id'],
            'estadoequipo_id' => $equipment['estadoequipo_id'],
            'cbiomedica_id' => $equipment['cbiomedica_id'],
            'criesgo_id' => $equipment['criesgo_id']
        ];
        
        echo "📋 UPDATE data prepared:\n";
        echo "   - Name: EDITED - Test Equipment Registration\n";
        echo "   - Brand: EDITED Brand\n";
        echo "   - Model: EDITED Model\n";
        echo "   - NEW Manuales: operacion=false, mantenimiento=false, partes=true, otros=true\n";
        echo "   - NEW Planos: electrico=true, electronico=false, neumatico=false, mecanico=true\n\n";
        
        // Step 3: Execute update
        echo "🔄 Step 3: Executing UPDATE request...\n";
        
        $request = new \Illuminate\Http\Request();
        $request->replace($updateData);
        
        $updateResponse = $controller->update($request, 64);
        $updateResult = json_decode($updateResponse->getContent(), true);
        
        if ($updateResult['success']) {
            echo "✅ UPDATE request successful!\n\n";
            
            // Step 4: Verify changes were saved
            echo "🔍 Step 4: Verifying changes were saved correctly...\n";
            
            $verifyResponse = $controller->getCompleteInfo(64);
            $verifyData = json_decode($verifyResponse->getContent(), true);
            
            if ($verifyData['success']) {
                $updatedEquipment = $verifyData['data'];
                
                echo "📋 VERIFICATION RESULTS:\n";
                echo "   - Name: '{$updatedEquipment['name']}'\n";
                echo "   - Brand: '{$updatedEquipment['marca']}'\n";
                echo "   - Model: '{$updatedEquipment['modelo']}'\n";
                echo "   - Updated Manual: '{$updatedEquipment['manual']}'\n";
                echo "   - Updated Plano: '{$updatedEquipment['plano']}'\n\n";
                
                // Verify all changes
                $allChangesCorrect = true;
                
                // Check basic field changes
                if ($updatedEquipment['name'] === 'EDITED - Test Equipment Registration') {
                    echo "✅ Name updated correctly\n";
                } else {
                    echo "❌ Name NOT updated correctly\n";
                    $allChangesCorrect = false;
                }
                
                if ($updatedEquipment['marca'] === 'EDITED Brand') {
                    echo "✅ Brand updated correctly\n";
                } else {
                    echo "❌ Brand NOT updated correctly\n";
                    $allChangesCorrect = false;
                }
                
                if ($updatedEquipment['modelo'] === 'EDITED Model') {
                    echo "✅ Model updated correctly\n";
                } else {
                    echo "❌ Model NOT updated correctly\n";
                    $allChangesCorrect = false;
                }
                
                // Check manuales JSON changes
                if (!empty($updatedEquipment['manual'])) {
                    $newManuales = json_decode($updatedEquipment['manual'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        echo "✅ UPDATED MANUALES parsed successfully:\n";
                        echo "   * Operación: " . ($newManuales['operacion'] ? 'true' : 'false') . " (expected: false)\n";
                        echo "   * Mantenimiento: " . ($newManuales['mantenimiento'] ? 'true' : 'false') . " (expected: false)\n";
                        echo "   * Partes: " . ($newManuales['partes'] ? 'true' : 'false') . " (expected: true)\n";
                        echo "   * Otros: " . ($newManuales['otros'] ? 'true' : 'false') . " (expected: true)\n";
                        
                        if ($newManuales['operacion'] === false && 
                            $newManuales['mantenimiento'] === false && 
                            $newManuales['partes'] === true && 
                            $newManuales['otros'] === true) {
                            echo "✅ All manuales values updated correctly!\n";
                        } else {
                            echo "❌ Some manuales values NOT updated correctly\n";
                            $allChangesCorrect = false;
                        }
                    } else {
                        echo "❌ Error parsing updated manuales JSON\n";
                        $allChangesCorrect = false;
                    }
                } else {
                    echo "❌ Updated manuales field is empty\n";
                    $allChangesCorrect = false;
                }
                
                // Check planos JSON changes
                if (!empty($updatedEquipment['plano'])) {
                    $newPlanos = json_decode($updatedEquipment['plano'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        echo "✅ UPDATED PLANOS parsed successfully:\n";
                        echo "   * Eléctrico: " . ($newPlanos['electrico'] ? 'true' : 'false') . " (expected: true)\n";
                        echo "   * Electrónico: " . ($newPlanos['electronico'] ? 'true' : 'false') . " (expected: false)\n";
                        echo "   * Neumático: " . ($newPlanos['neumatico'] ? 'true' : 'false') . " (expected: false)\n";
                        echo "   * Mecánico: " . ($newPlanos['mecanico'] ? 'true' : 'false') . " (expected: true)\n";
                        
                        if ($newPlanos['electrico'] === true && 
                            $newPlanos['electronico'] === false && 
                            $newPlanos['neumatico'] === false && 
                            $newPlanos['mecanico'] === true) {
                            echo "✅ All planos values updated correctly!\n";
                        } else {
                            echo "❌ Some planos values NOT updated correctly\n";
                            $allChangesCorrect = false;
                        }
                    } else {
                        echo "❌ Error parsing updated planos JSON\n";
                        $allChangesCorrect = false;
                    }
                } else {
                    echo "❌ Updated planos field is empty\n";
                    $allChangesCorrect = false;
                }
                
                echo "\n🎯 FINAL EDIT FUNCTIONALITY VERIFICATION:\n";
                echo "==========================================\n";
                
                if ($allChangesCorrect) {
                    echo "🎉 ✅ EDIT FUNCTIONALITY WORKS 100% PERFECTLY!\n";
                    echo "✅ Equipment data loading: PERFECT\n";
                    echo "✅ Basic field updates: PERFECT\n";
                    echo "✅ Manuales JSON updates: PERFECT\n";
                    echo "✅ Planos JSON updates: PERFECT\n";
                    echo "✅ Data persistence: PERFECT\n";
                    echo "✅ JSON parsing after update: PERFECT\n\n";
                    echo "🚀 COMPLETE EDIT WORKFLOW VERIFIED:\n";
                    echo "   1. ✅ Load existing equipment data\n";
                    echo "   2. ✅ Parse JSON checkbox data correctly\n";
                    echo "   3. ✅ Accept modified data via PUT request\n";
                    echo "   4. ✅ Process and save all changes\n";
                    echo "   5. ✅ Persist JSON data correctly\n";
                    echo "   6. ✅ Return updated data accurately\n\n";
                    echo "📋 EDIT MODAL FUNCTIONALITY: 100% OPERATIONAL\n";
                } else {
                    echo "❌ EDIT FUNCTIONALITY HAS ISSUES\n";
                    echo "Some changes were not saved correctly\n";
                }
                
            } else {
                echo "❌ Error verifying updated data: {$verifyData['message']}\n";
            }
            
        } else {
            echo "❌ UPDATE request failed: {$updateResult['message']}\n";
            if (isset($updateResult['errors'])) {
                echo "Validation errors:\n";
                foreach ($updateResult['errors'] as $field => $errors) {
                    echo "   - {$field}: ";
                    if (is_array($errors)) {
                        foreach ($errors as $error) {
                            echo $error . " ";
                        }
                    } else {
                        echo $errors;
                    }
                    echo "\n";
                }
            }

            // Debug: Show what data was sent
            echo "\nDEBUG - Data sent to update:\n";
            foreach ($updateData as $key => $value) {
                echo "   - {$key}: " . (is_string($value) ? $value : gettype($value)) . "\n";
            }
        }
        
    } else {
        echo "❌ Error loading equipment: {$getData['message']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR DURING TEST: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Edit functionality test completed.\n";

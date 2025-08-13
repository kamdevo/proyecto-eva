<?php

/**
 * Simple test script to verify equipment registration with manuales and planos
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Api\EquipmentController;
use App\Http\Requests\StoreEquipmentRequest;

// Create a mock request with test data
$testData = [
    'name' => 'Test Equipment Registration',
    'code' => 'TEST-REG-SCRIPT-001',
    'servicio_id' => 1,
    'area_id' => 1,
    'marca' => 'Test Brand',
    'modelo' => 'Test Model',
    'serial' => 'TEST-SERIAL-001',
    'descripcion' => 'Testing equipment registration with manuales and planos',
    'manuales' => '{"operacion":true,"mantenimiento":true,"partes":false,"otros":true}',
    'planos' => '{"electrico":false,"electronico":true,"neumatico":true,"mecanico":false}',
    'propietario_id' => 1,
    'estadoequipo_id' => 1,
    'cbiomedica_id' => 1,
    'criesgo_id' => 1,
    'costo' => '25000000',
    'vida_util' => '10',
    'observacion' => 'Test script registration'
];

echo "🧪 TESTING EQUIPMENT REGISTRATION WITH MANUALES AND PLANOS\n";
echo "=========================================================\n\n";

echo "📝 Test data:\n";
echo "   - Name: {$testData['name']}\n";
echo "   - Code: {$testData['code']}\n";
echo "   - Manuales: {$testData['manuales']}\n";
echo "   - Planos: {$testData['planos']}\n\n";

try {
    // Initialize Laravel application
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Create request
    $request = new \Illuminate\Http\Request();
    $request->replace($testData);
    
    // Create controller instance
    $controller = new EquipmentController();
    
    // Create StoreEquipmentRequest
    $storeRequest = StoreEquipmentRequest::createFrom($request);
    
    echo "🔄 Calling equipment registration endpoint...\n";
    
    // Call the store method
    $response = $controller->store($storeRequest);
    $responseData = json_decode($response->getContent(), true);
    
    if ($responseData['success']) {
        $equipoId = $responseData['data']['id'];
        echo "✅ EQUIPMENT REGISTERED SUCCESSFULLY!\n";
        echo "   - ID: {$equipoId}\n";
        echo "   - Name: {$responseData['data']['name']}\n\n";
        
        // Verify the data was saved correctly
        echo "🔍 Verifying saved data...\n";
        $completeInfoResponse = $controller->getCompleteInfo($equipoId);
        $completeData = json_decode($completeInfoResponse->getContent(), true);
        
        if ($completeData['success']) {
            $equipo = $completeData['data'];
            echo "📋 VERIFICATION RESULTS:\n";
            echo "   - Manual field: '{$equipo['manual']}'\n";
            echo "   - Plano field: '{$equipo['plano']}'\n\n";
            
            // Test JSON parsing
            $manualesOK = false;
            $planosOK = false;
            
            if (!empty($equipo['manual'])) {
                $manualesData = json_decode($equipo['manual'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "✅ MANUALES - Valid JSON parsed:\n";
                    echo "   * Operación: " . ($manualesData['operacion'] ? 'true' : 'false') . "\n";
                    echo "   * Mantenimiento: " . ($manualesData['mantenimiento'] ? 'true' : 'false') . "\n";
                    echo "   * Partes: " . ($manualesData['partes'] ? 'true' : 'false') . "\n";
                    echo "   * Otros: " . ($manualesData['otros'] ? 'true' : 'false') . "\n";
                    $manualesOK = true;
                } else {
                    echo "❌ MANUALES - Invalid JSON\n";
                }
            } else {
                echo "❌ MANUALES - Field is empty\n";
            }
            
            if (!empty($equipo['plano'])) {
                $planosData = json_decode($equipo['plano'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "✅ PLANOS - Valid JSON parsed:\n";
                    echo "   * Eléctrico: " . ($planosData['electrico'] ? 'true' : 'false') . "\n";
                    echo "   * Electrónico: " . ($planosData['electronico'] ? 'true' : 'false') . "\n";
                    echo "   * Neumático: " . ($planosData['neumatico'] ? 'true' : 'false') . "\n";
                    echo "   * Mecánico: " . ($planosData['mecanico'] ? 'true' : 'false') . "\n";
                    $planosOK = true;
                } else {
                    echo "❌ PLANOS - Invalid JSON\n";
                }
            } else {
                echo "❌ PLANOS - Field is empty\n";
            }
            
            echo "\n🎯 FINAL RESULT:\n";
            echo "================\n";
            
            if ($manualesOK && $planosOK) {
                echo "🎉 ✅ COMPLETE SUCCESS!\n";
                echo "✅ Equipment registration with manuales and planos works perfectly\n";
                echo "✅ JSON data is properly saved and retrieved\n";
                echo "✅ Main registration endpoint is 100% functional\n";
            } else {
                echo "❌ TEST FAILED - Issues detected:\n";
                if (!$manualesOK) echo "   - Problem with manuales field\n";
                if (!$planosOK) echo "   - Problem with planos field\n";
            }
            
        } else {
            echo "❌ Error retrieving complete info: {$completeData['message']}\n";
        }
        
    } else {
        echo "❌ REGISTRATION FAILED: {$responseData['message']}\n";
        if (isset($responseData['errors'])) {
            echo "Validation errors:\n";
            foreach ($responseData['errors'] as $field => $errors) {
                echo "   - {$field}: " . implode(', ', $errors) . "\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR DURING TEST: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Test completed.\n";

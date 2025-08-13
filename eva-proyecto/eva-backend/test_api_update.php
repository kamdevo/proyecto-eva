<?php

/**
 * Test the API update endpoint directly
 */

require_once __DIR__ . '/vendor/autoload.php';

echo "🧪 TESTING API UPDATE ENDPOINT\n";
echo "==============================\n\n";

try {
    // Test the API endpoint using cURL (new route without middleware)
    $url = 'http://localhost:8000/api/v1/equipos/69/update-no-auth';
    
    $data = [
        'name' => 'Test Registration Flow - API TEST SUCCESS',
        'code' => 'FLOW-CODE-001-EDIT',
        'serial' => 'FLOW-TEST-001-EDIT',
        'marca' => 'Flow Brand Updated',
        'modelo' => 'Flow Model v2',
        'descripcion' => 'API test description - should work now',
        'servicio_id' => '1',
        'area_id' => '1',
        'propietario_id' => '1',
        'estadoequipo_id' => '1',
        'fuente_id' => '1',
        'tecnologia_id' => '1',
        'frecuencia_id' => '1',
        'cbiomedica_id' => '1',
        'criesgo_id' => '1',
        'tadquisicion_id' => '1',
        'tipo_id' => '1',
        'manuales' => '{"operacion":false,"mantenimiento":true,"partes":false,"otros":true}',
        'planos' => '{"electrico":true,"electronico":false,"neumatico":true,"mecanico":false}'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    echo "📋 Sending PUT request to: {$url}\n";
    echo "📋 Request data:\n";
    echo "   name: {$data['name']}\n";
    echo "   servicio_id: {$data['servicio_id']}\n";
    echo "   area_id: {$data['area_id']}\n";
    echo "   manuales: {$data['manuales']}\n";
    echo "   planos: {$data['planos']}\n\n";
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ cURL Error: {$error}\n";
        exit(1);
    }
    
    echo "📋 Response Details:\n";
    echo "   HTTP Status Code: {$httpCode}\n";
    echo "   Response Body: {$response}\n\n";
    
    if ($httpCode === 200) {
        echo "🎉 ✅ SUCCESS! API UPDATE WORKED!\n";
        echo "The 500 Internal Server Error has been completely fixed!\n\n";
        
        $responseData = json_decode($response, true);
        if ($responseData && isset($responseData['success']) && $responseData['success']) {
            echo "✅ API Response indicates success\n";
            echo "✅ Message: " . ($responseData['message'] ?? 'No message') . "\n";
            
            if (isset($responseData['data'])) {
                echo "✅ Updated equipment data received\n";
                echo "   ID: " . ($responseData['data']['id'] ?? 'N/A') . "\n";
                echo "   Name: " . ($responseData['data']['name'] ?? 'N/A') . "\n";
            }
        }
        
        echo "\n🎯 FRONTEND TESTING:\n";
        echo "===================\n";
        echo "1. Open the edit modal for Equipment ID 69\n";
        echo "2. Make any changes you want\n";
        echo "3. Click 'Actualizar Equipo'\n";
        echo "4. The update should now work without 500 errors!\n";
        
    } elseif ($httpCode === 500) {
        echo "❌ Still getting 500 Internal Server Error\n";
        echo "Response: {$response}\n\n";
        
        echo "🔧 Additional debugging needed:\n";
        echo "1. Check Laravel logs for specific error details\n";
        echo "2. There might be relationship loading issues in the controller\n";
        echo "3. Model relationships might need to be fixed\n";
        
    } else {
        echo "⚠️ Unexpected HTTP status code: {$httpCode}\n";
        echo "Response: {$response}\n";
        
        if ($httpCode === 422) {
            echo "\n📋 This is likely a validation error\n";
            $responseData = json_decode($response, true);
            if ($responseData && isset($responseData['errors'])) {
                echo "Validation errors:\n";
                foreach ($responseData['errors'] as $field => $errors) {
                    echo "   {$field}: " . implode(', ', $errors) . "\n";
                }
            }
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 API update test completed.\n";

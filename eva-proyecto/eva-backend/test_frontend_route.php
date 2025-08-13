<?php

/**
 * Test the exact route that the frontend is using
 */

echo "🧪 TESTING FRONTEND ROUTE\n";
echo "=========================\n\n";

try {
    // Test the exact route the frontend is using
    $url = 'http://localhost:8000/api/v1/equipos/69/update-no-auth';
    
    $data = [
        'name' => 'NUEVO NOMBRE DE PRUEBA FRONTEND',
        'code' => 'FLOW-CODE-001-EDIT',
        'serial' => 'FLOW-TEST-001-EDIT',
        'marca' => 'Flow Brand Updated',
        'modelo' => 'Flow Model v2',
        'descripcion' => 'Descripción actualizada desde frontend test',
        'servicio_id' => '1',
        'area_id' => '1',
        'propietario_id' => '1',
        'estadoequipo_id' => '1',
        'manuales' => '{"operacion":true,"mantenimiento":false,"partes":true,"otros":false}',
        'planos' => '{"electrico":false,"electronico":true,"neumatico":false,"mecanico":true}'
    ];
    
    echo "📋 Probando ruta: {$url}\n";
    echo "📋 Datos a enviar:\n";
    echo "   name: {$data['name']}\n";
    echo "   descripcion: {$data['descripcion']}\n";
    echo "   manuales: {$data['manuales']}\n";
    echo "   planos: {$data['planos']}\n\n";
    
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
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "❌ cURL Error: {$error}\n";
        exit(1);
    }
    
    echo "📋 Respuesta del servidor:\n";
    echo "   HTTP Status: {$httpCode}\n";
    echo "   Response: {$response}\n\n";
    
    if ($httpCode === 200) {
        echo "✅ SUCCESS! La ruta funciona correctamente\n";
        
        $responseData = json_decode($response, true);
        if ($responseData && isset($responseData['success']) && $responseData['success']) {
            echo "✅ Respuesta exitosa del API\n";
            echo "✅ Mensaje: " . ($responseData['message'] ?? 'Sin mensaje') . "\n";
        }
        
        // Verificar en la base de datos
        echo "\n📋 Verificando en base de datos...\n";
        
    } else {
        echo "❌ ERROR: HTTP {$httpCode}\n";
        echo "Response: {$response}\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Test de ruta frontend completado.\n";

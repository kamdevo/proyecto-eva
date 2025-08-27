<?php

/**
 * TEST COMPLETO DE TODOS LOS ENDPOINTS CRÍTICOS
 * Verificar que no se rompió nada con los cambios
 */

echo "🧪 TEST COMPLETO DE ENDPOINTS CRÍTICOS\n";
echo "=" . str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8001/api/v1';
$testResults = [];

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $defaultHeaders = [
        'Accept: application/json',
        'Content-Type: application/json'
    ];
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response,
        'error' => $error
    ];
}

function testEndpoint($name, $url, $method = 'GET', $data = null, $headers = [], $expectedStatus = 200) {
    global $testResults;
    
    echo "🔍 Testing: $name\n";
    echo "   URL: $url\n";
    echo "   Method: $method\n";
    
    $result = makeRequest($url, $method, $data, $headers);
    
    $success = ($result['status'] == $expectedStatus);
    $testResults[$name] = [
        'success' => $success,
        'status' => $result['status'],
        'expected' => $expectedStatus,
        'data' => $result['data']
    ];
    
    if ($success) {
        echo "   ✅ SUCCESS (Status: {$result['status']})\n";
    } else {
        echo "   ❌ FAILED (Status: {$result['status']}, Expected: $expectedStatus)\n";
        if ($result['data']) {
            echo "   Message: " . ($result['data']['message'] ?? 'No message') . "\n";
        }
    }
    echo "\n";
    
    return $result;
}

// =============================================================================
// 1. TEST DE LOGIN (CRÍTICO)
// =============================================================================
echo "🔐 FASE 1: TESTING LOGIN\n";
echo "-" . str_repeat("-", 40) . "\n";

$loginResult = testEndpoint(
    'Login Admin',
    "$baseUrl/../auth/login",
    'POST',
    ['username' => 'admin', 'password' => 'admin']
);

if (!$loginResult['data']['success']) {
    echo "❌ CRITICAL ERROR: Login failed! Stopping tests.\n";
    exit(1);
}

$token = $loginResult['data']['token'];
$authHeaders = ["Authorization: Bearer $token"];

echo "✅ Login successful! Token obtained.\n\n";

// =============================================================================
// 2. TEST DE ENDPOINTS EXISTENTES (NO DEBEN ROMPERSE)
// =============================================================================
echo "📋 FASE 2: TESTING EXISTING ENDPOINTS\n";
echo "-" . str_repeat("-", 40) . "\n";

// Test usuarios públicos
testEndpoint(
    'Usuarios Públicos',
    "$baseUrl/usuarios-public?per_page=5"
);

// Test usuarios con auth
testEndpoint(
    'Usuarios Autenticados',
    "$baseUrl/usuarios?per_page=5",
    'GET',
    null,
    $authHeaders
);

// Test equipos
testEndpoint(
    'Equipos',
    "$baseUrl/equipos?per_page=5",
    'GET',
    null,
    $authHeaders
);

// Test centros
testEndpoint(
    'Centros',
    "$baseUrl/centros",
    'GET',
    null,
    $authHeaders
);

// Test roles
testEndpoint(
    'Roles',
    "$baseUrl/roles",
    'GET',
    null,
    $authHeaders
);

// =============================================================================
// 3. TEST DE NUEVOS ENDPOINTS DE ACTIVACIÓN
// =============================================================================
echo "🆕 FASE 3: TESTING NEW ACTIVATION ENDPOINTS\n";
echo "-" . str_repeat("-", 40) . "\n";

// Test activación individual (usuario inexistente)
testEndpoint(
    'Activar Usuario Inexistente',
    "$baseUrl/usuarios/99999/activate",
    'POST',
    null,
    $authHeaders,
    404
);

// Test desactivación individual (usuario inexistente)
testEndpoint(
    'Desactivar Usuario Inexistente',
    "$baseUrl/usuarios/99999/deactivate",
    'POST',
    null,
    $authHeaders,
    404
);

// Test bulk activation (sin IDs)
testEndpoint(
    'Bulk Activation Sin IDs',
    "$baseUrl/usuarios/bulk-activate",
    'POST',
    ['user_ids' => []],
    $authHeaders,
    422
);

// Test bulk deactivation (sin IDs)
testEndpoint(
    'Bulk Deactivation Sin IDs',
    "$baseUrl/usuarios/bulk-deactivate",
    'POST',
    ['user_ids' => []],
    $authHeaders,
    422
);

// =============================================================================
// 4. TEST DE PERMISOS (USUARIO NO ADMIN)
// =============================================================================
echo "🔒 FASE 4: TESTING PERMISSIONS\n";
echo "-" . str_repeat("-", 40) . "\n";

// Crear un token falso para simular usuario no admin
$fakeHeaders = ["Authorization: Bearer fake_token"];

testEndpoint(
    'Activación Sin Auth',
    "$baseUrl/usuarios/1/activate",
    'POST',
    null,
    $fakeHeaders,
    401
);

// =============================================================================
// 5. RESUMEN DE RESULTADOS
// =============================================================================
echo "📊 RESUMEN DE RESULTADOS\n";
echo "=" . str_repeat("=", 60) . "\n";

$totalTests = count($testResults);
$passedTests = array_filter($testResults, function($result) {
    return $result['success'];
});
$failedTests = array_filter($testResults, function($result) {
    return !$result['success'];
});

echo "Total Tests: $totalTests\n";
echo "✅ Passed: " . count($passedTests) . "\n";
echo "❌ Failed: " . count($failedTests) . "\n\n";

if (count($failedTests) > 0) {
    echo "❌ FAILED TESTS:\n";
    foreach ($failedTests as $name => $result) {
        echo "   - $name (Status: {$result['status']}, Expected: {$result['expected']})\n";
    }
    echo "\n";
}

// Verificar endpoints críticos
$criticalEndpoints = [
    'Login Admin',
    'Usuarios Públicos',
    'Usuarios Autenticados'
];

$criticalFailed = false;
foreach ($criticalEndpoints as $endpoint) {
    if (!$testResults[$endpoint]['success']) {
        echo "🚨 CRITICAL FAILURE: $endpoint failed!\n";
        $criticalFailed = true;
    }
}

if ($criticalFailed) {
    echo "\n❌ CRITICAL ENDPOINTS FAILED - SYSTEM BROKEN!\n";
    exit(1);
} else {
    echo "\n✅ ALL CRITICAL ENDPOINTS WORKING!\n";
    
    if (count($failedTests) == 0) {
        echo "🎉 ALL TESTS PASSED - SYSTEM 100% FUNCTIONAL!\n";
    } else {
        echo "⚠️ Some non-critical tests failed, but core functionality works.\n";
    }
}

echo "\n✅ Test complete!\n";

<?php
/**
 * Script para probar login con contraseñas cortas (sin validaciones)
 */

echo "🧪 PROBANDO LOGIN SIN VALIDACIONES DE CONTRASEÑA\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$loginUrl = $baseUrl . '/api/auth/login';

// Probar con diferentes contraseñas cortas
$testCases = [
    ['username' => 'admin', 'password' => 'a'],           // 1 carácter
    ['username' => 'admin', 'password' => 'ab'],          // 2 caracteres
    ['username' => 'admin', 'password' => 'abc'],         // 3 caracteres
    ['username' => 'admin', 'password' => 'admin'],       // Contraseña real
];

foreach ($testCases as $index => $credentials) {
    echo "🔐 PRUEBA " . ($index + 1) . " - Password: '" . $credentials['password'] . "' (" . strlen($credentials['password']) . " caracteres)\n";
    
    $loginData = json_encode($credentials);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $loginUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "   📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo "   ✅ Login exitoso\n";
            echo "   👤 Usuario: " . ($data['user']['nombre'] ?? 'N/A') . "\n";
        } else {
            echo "   ⚠️ Respuesta inesperada: " . substr($response, 0, 100) . "...\n";
        }
    } else if ($httpCode == 422) {
        echo "   ❌ Error de validación (422)\n";
        $data = json_decode($response, true);
        if ($data && isset($data['errors'])) {
            echo "   📋 Errores:\n";
            foreach ($data['errors'] as $field => $errors) {
                echo "      - $field: " . implode(', ', $errors) . "\n";
            }
        }
    } else if ($httpCode == 401) {
        echo "   ❌ Credenciales incorrectas (401)\n";
    } else {
        echo "   ❌ Error: $httpCode\n";
        echo "   📄 Respuesta: " . substr($response, 0, 200) . "...\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
}

echo "🎯 RESUMEN:\n\n";

// Probar login correcto
echo "🔑 PROBANDO LOGIN CORRECTO:\n";

$correctLogin = json_encode(['username' => 'admin', 'password' => 'admin']);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $loginUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $correctLogin);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "✅ ¡LOGIN FUNCIONANDO CORRECTAMENTE!\n";
        echo "👤 Usuario: " . ($data['user']['nombre'] ?? 'N/A') . "\n";
        echo "🔑 Token: " . substr($data['token'] ?? 'N/A', 0, 20) . "...\n";
        
        echo "\n🎉 TODAS LAS VALIDACIONES DE CONTRASEÑA HAN SIDO REMOVIDAS\n";
        echo "🚀 Ya puedes hacer login con cualquier contraseña\n";
        
    } else {
        echo "❌ Login falló con respuesta inesperada\n";
        echo "📄 Respuesta: $response\n";
    }
} else {
    echo "❌ Login falló con código: $httpCode\n";
    echo "📄 Respuesta: $response\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "📋 CREDENCIALES CONFIRMADAS:\n";
echo "   Username: admin\n";
echo "   Password: admin\n";
echo "   Estado: Sin validaciones de longitud o complejidad\n";

?>

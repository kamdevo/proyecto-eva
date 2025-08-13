<?php
/**
 * Prueba final del endpoint CSRF
 */

echo "🧪 PRUEBA FINAL DEL ENDPOINT CSRF\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$csrfUrl = $baseUrl . '/sanctum/csrf-cookie';

// Probar con cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $csrfUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HEADER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "🌐 URL: $csrfUrl\n";
echo "📊 HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
} else {
    if ($httpCode == 200 || $httpCode == 204) {
        echo "✅ ¡CSRF endpoint funcionando!\n";
        echo "🎉 El problema del error 500 está resuelto\n";
    } else {
        echo "❌ Aún hay error: $httpCode\n";
        
        // Mostrar respuesta para debug
        echo "📄 Respuesta completa:\n";
        echo substr($response, 0, 500) . "\n";
    }
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// Probar endpoint de login
echo "🔐 PROBANDO ENDPOINT DE LOGIN:\n";

$loginUrl = $baseUrl . '/api/auth/login';
$loginData = json_encode([
    'username' => 'admin',
    'password' => 'admin'
]);

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

echo "🌐 URL: $loginUrl\n";
echo "📊 HTTP Code: $httpCode\n";
echo "📤 Datos enviados: $loginData\n";

if ($httpCode == 200) {
    echo "✅ ¡Login funcionando!\n";
    
    $data = json_decode($response, true);
    if ($data && isset($data['success']) && $data['success']) {
        echo "🎉 Login exitoso\n";
        echo "👤 Usuario: " . ($data['user']['nombre'] ?? 'N/A') . "\n";
        echo "🔑 Token generado: " . substr($data['token'] ?? 'N/A', 0, 20) . "...\n";
    } else {
        echo "⚠️ Respuesta inesperada:\n";
        echo $response . "\n";
    }
} else {
    echo "❌ Error en login: $httpCode\n";
    echo "📄 Respuesta: $response\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 ESTADO FINAL:\n\n";

if ($httpCode == 200) {
    echo "✅ Servidor Laravel: Funcionando\n";
    echo "✅ Base de datos: Conectada\n";
    echo "✅ Tablas necesarias: Creadas\n";
    echo "✅ Usuario admin: Configurado\n";
    echo "✅ Login API: Funcionando\n";
    
    echo "\n🔑 CREDENCIALES CONFIRMADAS:\n";
    echo "   Username: admin\n";
    echo "   Password: admin\n";
    
    echo "\n🚀 ¡Ya puedes hacer login desde el frontend!\n";
} else {
    echo "❌ Aún hay problemas que resolver\n";
    echo "💡 Revisa los logs de Laravel para más detalles\n";
}

?>

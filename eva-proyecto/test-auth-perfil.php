<?php
echo "=== PRUEBA AUTENTICACIÓN DEL PERFIL ===\n\n";

// Simular el token del usuario logueado (innovaciondesa)
// Normalmente esto vendría del frontend en los headers
$userToken = 'Bearer 1|abcdefg1234567890'; // Token simulado

echo "🔍 1. PROBANDO SIN TOKEN (debe fallar):\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8001/api/v1/user/profile");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

echo "🔍 2. PROBANDO CON TOKEN SIMULADO (puede fallar si token no válido):\n";
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: ' . $userToken
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

echo "🔍 3. VERIFICANDO SI EL ENDPOINT ESTÁ EN EL GRUPO CORRECTO:\n";
echo "Endpoint correcto: /api/v1/user/profile\n";
echo "Debe estar en routes/auth.php con middleware auth:sanctum\n\n";

// Probar el endpoint anterior (que debería estar deshabilitado)
echo "🔍 4. PROBANDO ENDPOINT ANTERIOR (debe estar deshabilitado):\n";
curl_setopt($ch, CURLOPT_URL, "http://localhost:8001/api/v1/user/profile");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

curl_close($ch);

echo "🎯 DIAGNÓSTICO:\n";
echo "- Si todas dan 401: Middleware funcionando (necesita token válido)\n";
echo "- Si alguna da 200 con admin: Endpoint sin autenticación\n";
echo "- Si con token da datos correctos: Sistema funcionando\n";
echo "- Si con token da admin: Middleware no funcionando\n\n";

echo "📋 SIGUIENTE PASO:\n";
echo "Verificar en el navegador:\n";
echo "1. ¿Está el token en localStorage? (eva_auth_token)\n";
echo "2. ¿Se envía Authorization header en Network tab?\n";
echo "3. ¿Qué usuario muestra el AuthContext?\n";
?>

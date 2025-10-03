<?php

/**
 * Script de prueba para endpoint de correo
 */

$url = 'http://localhost:8001/api/v1/notifications/test-email';

echo "📧 Probando endpoint de correo: $url\n\n";

$data = [
    'email' => 'camilomoralesyk@gmail.com' // Cambiar por tu email real
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_VERBOSE, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "\n📊 Código HTTP: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
}

if ($httpCode === 200) {
    echo "✅ Respuesta exitosa\n";
    echo "📄 Respuesta:\n";
    echo $response . "\n";
} else {
    echo "❌ Error en la respuesta\n";
    echo "📄 Respuesta:\n";
    echo $response . "\n";
}

echo "\n✅ Prueba completada\n";
echo "\n📝 NOTA: Antes de ejecutar este test, asegúrate de:\n";
echo "   1. Configurar las variables MAIL_* en eva-backend/.env\n";
echo "   2. Ejecutar: php artisan config:clear && php artisan config:cache\n";
echo "   3. Cambiar 'test@example.com' por tu email real en este script\n";

<?php
echo "=== PRUEBA ENDPOINT /v1/user (que estaba dando 500) ===\n\n";

// Este endpoint debería requerir autenticación
echo "🔍 PROBANDO /api/v1/user sin token (debe dar 401):\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8001/api/v1/user");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

if ($httpCode === 401) {
    echo "✅ Endpoint requiere autenticación correctamente\n";
} elseif ($httpCode === 500) {
    echo "❌ Sigue dando error 500 - revisar logs del servidor\n";
} else {
    echo "ℹ️  Código inesperado: $httpCode\n";
}

curl_close($ch);

echo "\n🎯 RESULTADO:\n";
echo "- 401: ✅ Endpoint protegido correctamente\n";
echo "- 500: ❌ Error interno - revisar relaciones en AuthController\n";
echo "- Otro: ℹ️ Investigar configuración\n";
?>

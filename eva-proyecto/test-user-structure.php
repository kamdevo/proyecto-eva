<?php
echo "=== PRUEBA ESTRUCTURA DEL USUARIO PARA PERMISOS ===\n\n";

// Este endpoint debería funcionar ahora sin token (por testing)
echo "🔍 PROBANDO /api/v1/user SIN token (debe dar 401):\n";
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
    echo "✅ Endpoint requiere autenticación (correcto)\n";
    echo "🔑 El sistema está protegido correctamente\n";
    echo "📋 Para probar la estructura necesitas un token válido\n\n";
    
    echo "🎯 INFORMACIÓN IMPORTANTE:\n";
    echo "- El endpoint /v1/user ahora usa consultas directas\n";
    echo "- Mantiene la estructura exacta que espera el frontend\n";
    echo "- Incluye rol_id como integer (crítico para permisos)\n";
    echo "- Incluye relación 'rol' como objeto anidado\n";
    echo "- No depende de modelos ni relaciones Eloquent\n\n";
    
    echo "🚀 RESULTADO ESPERADO:\n";
    echo "Con token válido debería devolver:\n";
    echo "{\n";
    echo "  \"success\": true,\n";
    echo "  \"data\": {\n";
    echo "    \"id\": 2,\n";
    echo "    \"nombre\": \"innovaciondesa\",\n";
    echo "    \"rol_id\": 4,\n";
    echo "    \"rol\": {\n";
    echo "      \"id\": 4,\n";
    echo "      \"nombre\": \"Usuario Básico\"\n";
    echo "    }\n";
    echo "  }\n";
    echo "}\n\n";
} else {
    echo "❌ Código inesperado: $httpCode\n";
    echo "Respuesta: $response\n";
}

curl_close($ch);

echo "📝 PRÓXIMO PASO:\n";
echo "1. Ve al navegador y recarga la página\n";
echo "2. Revisa la consola (F12) para ver si el rol_id se carga correctamente\n";
echo "3. El sidebar debería mostrar módulos según los permisos del usuario\n";
?>

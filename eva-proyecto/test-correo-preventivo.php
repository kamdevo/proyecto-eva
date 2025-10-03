<?php

echo "📧 Enviando correo de preventivo con datos reales...\n\n";

// Datos del correo de prueba
$data = [
    'preventivo_id' => 1  // ID de un preventivo real de la BD
];

// URL del endpoint
$url = 'http://localhost:8001/api/v1/notifications/repuesto-pendiente';

// Configurar cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_VERBOSE, true);

// Ejecutar petición
echo "🔄 Enviando petición a: $url\n";
echo "📦 Datos: " . json_encode($data) . "\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Mostrar resultados
echo "📊 Código HTTP: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
} else {
    if ($httpCode == 200) {
        echo "✅ Respuesta exitosa\n";
    } else {
        echo "⚠️ Respuesta con código: $httpCode\n";
    }
    
    echo "📄 Respuesta:\n";
    echo $response . "\n";
}

echo "\n✅ Prueba completada\n";
echo "\n📝 NOTA: Este script envía un correo de preventivo con repuesto pendiente usando datos reales de la BD.\n";
echo "   El correo se enviará a los usuarios del servicio donde está el equipo del preventivo ID 1.\n";

?>

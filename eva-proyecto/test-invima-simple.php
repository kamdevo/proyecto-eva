<?php
/**
 * Prueba simple del endpoint INVIMA
 */

echo "🧪 PRUEBA SIMPLE ENDPOINT INVIMA\n";
echo str_repeat("=", 40) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$registrosUrl = "$baseUrl/api/v1/registros-invima";

echo "🔍 URL: $registrosUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $registrosUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 HTTP Code: $httpCode\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && $data['success']) {
        echo "✅ Registros: " . count($data['data']) . "\n";
        
        // Mostrar algunos ejemplos
        foreach (array_slice($data['data'], 0, 3) as $registro) {
            echo "\n📋 {$registro['numero_registro']}\n";
            $nombre = $registro['nombre_equipo'] ?? '';
            if (strlen($nombre) > 60) {
                echo "   Nombre: " . substr($nombre, 0, 60) . "...\n";
            } else {
                echo "   Nombre: $nombre\n";
            }
            echo "   Fabricante: {$registro['fabricante']}\n";
        }
        
        echo "\n✅ ¡Endpoint funcionando correctamente!\n";
    } else {
        echo "❌ Error: $response\n";
    }
} else {
    echo "❌ HTTP $httpCode: $response\n";
}
?>

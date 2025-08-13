<?php
/**
 * Probar el endpoint corregido
 */

echo "🧪 PROBANDO ENDPOINT CORREGIDO\n";
echo str_repeat("=", 40) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$equipoId = 1;

// Probar endpoint de archivos
$filesUrl = "$baseUrl/api/v1/equipos/$equipoId/files";

echo "🔍 URL: $filesUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $filesUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 HTTP Code: $httpCode\n";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if ($data && $data['success'] && isset($data['data']['imagen'])) {
        $imagePath = $data['data']['imagen']['path'];
        echo "✅ Path devuelto: $imagePath\n";
        
        // Probar URL
        $imageUrl = "$baseUrl/storage/$imagePath";
        echo "🌐 URL construida: $imageUrl\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $imageUrl);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        curl_exec($ch);
        $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "📊 HTTP Code imagen: $imageHttpCode\n";
        
        if ($imageHttpCode == 200) {
            echo "🎉 ¡FUNCIONA PERFECTAMENTE!\n";
            echo "✅ Endpoint corregido exitosamente\n";
            echo "✅ Las imágenes deberían cargar en el frontend\n";
        } else {
            echo "❌ Aún no funciona\n";
        }
    } else {
        echo "❌ Respuesta inesperada: $response\n";
    }
} else {
    echo "❌ Error: $response\n";
}
?>

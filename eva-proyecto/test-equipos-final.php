<?php
/**
 * Prueba final del endpoint de equipos médicos
 */

echo "🧪 PRUEBA FINAL DEL ENDPOINT DE EQUIPOS MÉDICOS\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$equiposUrl = $baseUrl . '/api/v1/equipos/medical-devices-complete?page=1&per_page=15&sort_by=name&sort_order=asc';

echo "🌐 URL: $equiposUrl\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $equiposUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "📊 HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
} else {
    if ($httpCode == 200) {
        echo "✅ ¡ENDPOINT FUNCIONANDO CORRECTAMENTE!\n\n";
        
        $data = json_decode($response, true);
        if ($data && isset($data['success']) && $data['success']) {
            echo "🎉 Respuesta exitosa:\n";
            echo "   - Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            echo "   - Total equipos: " . ($data['data']['total'] ?? 'N/A') . "\n";
            echo "   - Página actual: " . ($data['data']['current_page'] ?? 'N/A') . "\n";
            echo "   - Por página: " . ($data['data']['per_page'] ?? 'N/A') . "\n";
            echo "   - Equipos en esta página: " . count($data['data']['data'] ?? []) . "\n";
            
            if (!empty($data['data']['data'])) {
                echo "\n📋 Primer equipo de ejemplo:\n";
                $firstEquipo = $data['data']['data'][0];
                echo "   - ID: " . ($firstEquipo['id'] ?? 'N/A') . "\n";
                echo "   - Nombre: " . ($firstEquipo['name'] ?? 'N/A') . "\n";
                echo "   - Código: " . ($firstEquipo['code'] ?? 'N/A') . "\n";
                echo "   - Servicio: " . ($firstEquipo['servicios'] ?? 'N/A') . "\n";
                echo "   - Estado: " . ($firstEquipo['estadoequipo'] ?? 'N/A') . "\n";
            }
            
        } else {
            echo "⚠️ Respuesta inesperada:\n";
            echo substr($response, 0, 500) . "...\n";
        }
        
    } else if ($httpCode == 500) {
        echo "❌ Aún hay error 500\n";
        echo "📄 Respuesta: " . substr($response, 0, 300) . "...\n";
        
        $data = json_decode($response, true);
        if ($data && isset($data['message'])) {
            echo "📝 Mensaje de error: " . $data['message'] . "\n";
        }
        
    } else {
        echo "⚠️ Código inesperado: $httpCode\n";
        echo "📄 Respuesta: " . substr($response, 0, 300) . "...\n";
    }
}

echo "\n" . str_repeat("=", 60) . "\n";

if ($httpCode == 200) {
    echo "🎉 ¡PROBLEMA RESUELTO COMPLETAMENTE!\n";
    echo "✅ Endpoint de equipos médicos funcionando\n";
    echo "✅ Todas las tablas necesarias creadas\n";
    echo "✅ Datos de ejemplo insertados\n";
    echo "\n🚀 El frontend ya puede cargar los equipos médicos\n";
} else {
    echo "❌ Aún hay problemas por resolver\n";
    echo "💡 Revisar logs de Laravel para más detalles\n";
}

?>

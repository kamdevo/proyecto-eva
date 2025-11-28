<?php

// Simular la petición al endpoint
$url = 'http://192.168.2.146:8001/api/v1/guiarapida';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "=== PRUEBA DE ENDPOINT /v1/guiarapida ===\n\n";
echo "HTTP Code: $httpCode\n\n";

if ($response) {
    $data = json_decode($response, true);
    
    echo "Estructura de la respuesta:\n";
    echo "- success: " . ($data['success'] ? 'true' : 'false') . "\n";
    echo "- message: " . ($data['message'] ?? 'N/A') . "\n\n";
    
    if (isset($data['data'])) {
        echo "data:\n";
        echo "  - current_page: " . ($data['data']['current_page'] ?? 'N/A') . "\n";
        echo "  - per_page: " . ($data['data']['per_page'] ?? 'N/A') . "\n";
        echo "  - total: " . ($data['data']['total'] ?? 'N/A') . "\n";
        echo "  - last_page: " . ($data['data']['last_page'] ?? 'N/A') . "\n";
        echo "  - data (guías): " . (isset($data['data']['data']) ? count($data['data']['data']) . " guías" : 'N/A') . "\n\n";
    }
    
    if (isset($data['cobertura'])) {
        echo "✅ cobertura ESTÁ en el nivel raíz:\n";
        echo "  - porcentaje: " . ($data['cobertura']['porcentaje'] ?? 'N/A') . "\n";
        echo "  - cumplenCriterios: " . ($data['cobertura']['cumplenCriterios'] ?? 'N/A') . "\n";
        echo "  - cumplenConGuia: " . ($data['cobertura']['cumplenConGuia'] ?? 'N/A') . "\n\n";
    } else {
        echo "❌ cobertura NO está en el nivel raíz\n\n";
    }
    
    if (isset($data['data']['cobertura'])) {
        echo "✅ cobertura ESTÁ dentro de data:\n";
        echo "  - porcentaje: " . ($data['data']['cobertura']['porcentaje'] ?? 'N/A') . "\n";
        echo "  - cumplenCriterios: " . ($data['data']['cobertura']['cumplenCriterios'] ?? 'N/A') . "\n";
        echo "  - cumplenConGuia: " . ($data['data']['cobertura']['cumplenConGuia'] ?? 'N/A') . "\n\n";
    } else {
        echo "❌ cobertura NO está dentro de data\n\n";
    }
    
    echo "JSON completo (primeros 500 caracteres):\n";
    echo substr(json_encode($data, JSON_PRETTY_PRINT), 0, 500) . "...\n";
    
} else {
    echo "Error: No se recibió respuesta del servidor\n";
}
?>

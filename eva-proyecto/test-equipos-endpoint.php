<?php

echo "🔍 Verificando columna Plan de Ejecución en equipos...\n\n";

$url = 'http://192.168.2.146:8001/api/v1/equipos';

$params = [
    'page' => 1,
    'per_page' => 3
];

$urlWithParams = $url . '?' . http_build_query($params);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $urlWithParams);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

echo "📤 Consultando: $urlWithParams\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    echo "❌ Error CURL: " . curl_error($ch) . "\n";
} else {
    echo "📊 HTTP Code: $httpCode\n\n";
    
    if ($httpCode === 200) {
        echo "✅ SUCCESS!\n\n";
        
        $data = json_decode($response, true);
        
        if (isset($data['data'])) {
            $equipos = $data['data']['data'] ?? $data['data'];
            
            echo "📋 Total registros: " . ($data['data']['total'] ?? count($equipos)) . "\n\n";
            
            echo "🔍 Primeros 3 equipos:\n";
            echo str_repeat("=", 120) . "\n";
            
            foreach (array_slice($equipos, 0, 3) as $idx => $equipo) {
                echo "\nEquipo " . ($idx + 1) . ":\n";
                echo "  ID: " . ($equipo['id'] ?? 'N/A') . "\n";
                echo "  Nombre: " . ($equipo['name'] ?? 'N/A') . "\n";
                echo "  Código: " . ($equipo['code'] ?? 'N/A') . "\n";
                echo "  Responsable Mantenimiento: " . ($equipo['responsable_mantenimiento'] ?? 'N/A') . "\n";
                echo "  Frecuencia Mantenimiento: " . ($equipo['frecuencia_mantenimiento'] ?? 'N/A') . "\n";
                echo "  Plan Mantenimiento: " . ($equipo['plan_mantenimiento'] ?? 'N/A') . "\n";
                
                // Debug: Mostrar todas las claves disponibles
                echo "\n  [DEBUG] Claves disponibles: " . implode(', ', array_keys($equipo)) . "\n";
                echo str_repeat("-", 120) . "\n";
            }
        } else {
            echo "⚠️ Estructura de respuesta inesperada\n";
            echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "❌ ERROR $httpCode\n";
        echo "Respuesta:\n";
        echo $response . "\n";
    }
}

curl_close($ch);

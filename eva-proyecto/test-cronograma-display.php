<?php

echo "🧪 Probando endpoint de visualización del cronograma...\n\n";

$url = 'http://192.168.2.146:8001/api/v1/cronograma-mantenimientos';

$params = [
    'anio' => 2024,
    'page' => 1,
    'per_page' => 5
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
        
        if ($data['success']) {
            echo "📋 Total registros: " . $data['data']['total'] . "\n";
            echo "📄 Página actual: " . $data['data']['current_page'] . "\n";
            echo "📊 Por página: " . $data['data']['per_page'] . "\n\n";
            
            echo "🔍 Primeros 3 registros:\n";
            echo str_repeat("=", 100) . "\n";
            
            foreach (array_slice($data['data']['data'], 0, 3) as $idx => $item) {
                echo "\nRegistro " . ($idx + 1) . ":\n";
                echo "  ID Plan: " . ($item['id'] ?? 'N/A') . "\n";
                echo "  ID Equipo: " . ($item['equipo_id'] ?? 'N/A') . "\n";
                echo "  Nombre: " . ($item['equipo_nombre'] ?? 'N/A') . "\n";
                echo "  Código: " . ($item['equipo_codigo'] ?? 'N/A') . "\n";
                echo "  Meses programados: " . ($item['mes1'] ?? 'N/A') . ", " . ($item['mes2'] ?? 'N/A') . ", " . ($item['mes3'] ?? 'N/A') . "\n";
                echo "  Responsable: " . ($item['responsable'] ?? 'N/A') . "\n";
                echo "  Frecuencia ID: " . ($item['frecuencia_id'] ?? 'N/A') . "\n";
                echo "  Frecuencia: " . ($item['frecuencia'] ?? 'N/A') . "\n";
                echo "  Año: " . ($item['anio'] ?? 'N/A') . "\n";
                
                // Debug: Mostrar todas las claves disponibles
                echo "  [DEBUG] Claves disponibles: " . implode(', ', array_keys($item)) . "\n";
                echo str_repeat("-", 100) . "\n";
            }
        } else {
            echo "⚠️ Success=false: " . $data['message'] . "\n";
        }
    } else {
        echo "❌ ERROR $httpCode\n";
        echo "Respuesta:\n";
        echo $response . "\n";
    }
}

curl_close($ch);

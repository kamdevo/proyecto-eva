<?php

echo "🔍 Verificando respuesta completa del endpoint industrial...\n\n";

$url = 'http://192.168.2.146:8001/api/v1/equipos/industrial-devices-complete?page=1&per_page=3';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 HTTP Code: {$httpCode}\n\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if (isset($data['data']['data'])) {
        $equipos = array_slice($data['data']['data'], 0, 3);
        
        echo "✅ Primeros 3 equipos industriales:\n";
        echo str_repeat("=", 100) . "\n\n";
        
        foreach ($equipos as $idx => $eq) {
            echo "Equipo " . ($idx + 1) . ":\n";
            echo "  ID: " . $eq['id'] . "\n";
            echo "  Nombre: " . ($eq['equipo']['name'] ?? 'N/A') . "\n";
            echo "  Código: " . ($eq['equipo']['code'] ?? 'N/A') . "\n";
            echo "  📷 Campo 'image': " . ($eq['equipo']['image'] ?? 'NULL') . "\n";
            echo "  ✓ hasImage: " . ($eq['equipo']['hasImage'] ? 'true' : 'false') . "\n";
            
            // Mostrar estructura completa de 'equipo'
            echo "\n  📋 Estructura de 'equipo':\n";
            echo "  " . str_replace("\n", "\n  ", json_encode($eq['equipo'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) . "\n";
            
            echo str_repeat("-", 100) . "\n\n";
        }
    } else {
        echo "⚠️ No se encontraron equipos en la respuesta\n";
    }
} else {
    echo "❌ Error HTTP {$httpCode}\n";
    echo "Respuesta: " . substr($response, 0, 500) . "\n";
}

<?php

/**
 * Script simple para probar los datos del modal de compartir documentos
 */

echo "=== PRUEBA DATOS MODAL COMPARTIR DOCUMENTOS ===\n\n";

$baseUrl = 'http://127.0.0.1:8001/api';

function makeRequest($url) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => 0];
    }
    
    return [
        'data' => json_decode($response, true),
        'http_code' => $httpCode,
        'raw' => $response
    ];
}

echo "🧪 Probando endpoint: /v1/equipos/medical-devices-complete\n";
echo "=====================================================\n";

$result = makeRequest("$baseUrl/v1/equipos/medical-devices-complete?page=1&per_page=3");

if ($result['http_code'] === 200) {
    $data = $result['data'];
    
    echo "✅ HTTP 200 - Respuesta exitosa\n\n";
    
    if (isset($data['success']) && $data['success']) {
        echo "✅ success: true\n";
        
        if (isset($data['data']) && is_array($data['data'])) {
            echo "✅ data es array con " . count($data['data']) . " elementos\n";
            
            if (count($data['data']) > 0) {
                $firstEquipment = $data['data'][0];
                echo "\n📋 PRIMER EQUIPO:\n";
                echo "   ID: " . ($firstEquipment['id'] ?? 'N/A') . "\n";
                
                if (isset($firstEquipment['equipo'])) {
                    echo "   Nombre: " . ($firstEquipment['equipo']['name'] ?? 'N/A') . "\n";
                    echo "   Código: " . ($firstEquipment['equipo']['code'] ?? 'N/A') . "\n";
                    echo "   Serie: " . ($firstEquipment['equipo']['series'] ?? 'N/A') . "\n";
                    echo "   Marca: " . ($firstEquipment['equipo']['brand'] ?? 'N/A') . "\n";
                    echo "   Modelo: " . ($firstEquipment['equipo']['model'] ?? 'N/A') . "\n";
                }
                
                if (isset($firstEquipment['ubicacion'])) {
                    echo "   Sede: " . ($firstEquipment['ubicacion']['sede'] ?? 'N/A') . "\n";
                    echo "   Servicio: " . ($firstEquipment['ubicacion']['servicio'] ?? 'N/A') . "\n";
                    echo "   Área: " . ($firstEquipment['ubicacion']['area'] ?? 'N/A') . "\n";
                }
                
                if (isset($firstEquipment['propietario'])) {
                    echo "   Propietario: " . ($firstEquipment['propietario']['nombre'] ?? 'N/A') . "\n";
                }
            }
            
            if (isset($data['pagination'])) {
                $pagination = $data['pagination'];
                echo "\n📄 PAGINACIÓN:\n";
                echo "   Página actual: " . ($pagination['current_page'] ?? 'N/A') . "\n";
                echo "   Última página: " . ($pagination['last_page'] ?? 'N/A') . "\n";
                echo "   Total elementos: " . ($pagination['total'] ?? 'N/A') . "\n";
                echo "   Por página: " . ($pagination['per_page'] ?? 'N/A') . "\n";
                echo "   Desde: " . ($pagination['from'] ?? 'N/A') . "\n";
                echo "   Hasta: " . ($pagination['to'] ?? 'N/A') . "\n";
            }
            
        } else {
            echo "❌ data no es array o está vacío\n";
            echo "   Tipo de data: " . gettype($data['data'] ?? null) . "\n";
        }
        
    } else {
        echo "❌ success: false\n";
        if (isset($data['message'])) {
            echo "   Mensaje: " . $data['message'] . "\n";
        }
    }
    
} else {
    echo "❌ HTTP " . $result['http_code'] . "\n";
    if (isset($result['data']['message'])) {
        echo "   Error: " . $result['data']['message'] . "\n";
    }
}

echo "\n";
echo "🎯 CONCLUSIÓN:\n";
echo "==============\n";

if ($result['http_code'] === 200 && isset($result['data']['success']) && $result['data']['success']) {
    $count = count($result['data']['data'] ?? []);
    if ($count > 0) {
        echo "✅ El endpoint funciona correctamente\n";
        echo "✅ Devuelve $count equipos con estructura correcta\n";
        echo "✅ El modal debería mostrar los datos correctamente\n";
    } else {
        echo "⚠️  El endpoint funciona pero no devuelve equipos\n";
        echo "⚠️  Verificar si hay equipos médicos en la base de datos\n";
    }
} else {
    echo "❌ El endpoint tiene problemas\n";
    echo "❌ El modal no podrá cargar datos\n";
}

?>

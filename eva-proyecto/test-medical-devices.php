<?php

echo "🔍 Verificando información de plan de ejecución en equipos médicos...\n\n";

$url = 'http://192.168.2.146:8001/api/v1/equipos/medical-devices-complete';

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
        
        if (isset($data['data']['data'])) {
            $equipos = $data['data']['data'];
            
            echo "📋 Total registros: " . ($data['data']['total'] ?? 'N/A') . "\n\n";
            
            echo "🔍 Primeros 3 equipos con información de plan:\n";
            echo str_repeat("=", 120) . "\n";
            
            foreach (array_slice($equipos, 0, 3) as $idx => $equipo) {
                echo "\nEquipo " . ($idx + 1) . ":\n";
                echo "  ID: " . ($equipo['id'] ?? 'N/A') . "\n";
                echo "  Nombre: " . ($equipo['name'] ?? 'N/A') . "\n";
                echo "  Código: " . ($equipo['code'] ?? 'N/A') . "\n";
                echo "  📅 Incluido en Plan Vigente: " . ($equipo['incluido_en_plan'] ?? 'N/A') . "\n";
                echo "  👤 Responsable Plan: " . ($equipo['responsable_plan'] ?? 'NO ASIGNADO') . "\n";
                echo "  🔄 Frecuencia Plan: " . ($equipo['frecuencia_plan'] ?? 'NO DEFINIDA') . "\n";
                echo "  📆 Meses Programados: Mes1=" . ($equipo['mes_programado1'] ?? 'N/A') . ", Mes2=" . ($equipo['mes_programado2'] ?? 'N/A') . ", Mes3=" . ($equipo['mes_programado3'] ?? 'N/A') . "\n";
                echo "  📅 Año Vigente: " . ($equipo['anio_vigente'] ?? 'N/A') . "\n";
                echo str_repeat("-", 120) . "\n";
            }
        } else {
            echo "⚠️ Estructura de respuesta inesperada\n";
            print_r($data);
        }
    } else {
        echo "❌ ERROR $httpCode\n";
        echo "Respuesta:\n";
        echo $response . "\n";
    }
}

curl_close($ch);

<?php
/**
 * Script para revisar la estructura de datos del endpoint de equipos
 */

echo "=== REVISIÓN DE ESTRUCTURA DE DATOS ===\n\n";

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => 'http://localhost:8000/api/v1/equipos/medical-devices-complete',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

echo "HTTP Code: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if (isset($data['data']) && !empty($data['data'])) {
        $equipos = is_array($data['data']) ? $data['data'] : [$data['data']];
        echo "Equipos encontrados: " . count($equipos) . "\n\n";
        
        if (!empty($equipos)) {
            echo "Estructura del primer equipo:\n";
            $primerEquipo = $equipos[0];
            foreach ($primerEquipo as $key => $value) {
                echo "- $key: " . (is_string($value) ? substr($value, 0, 50) : json_encode($value)) . "\n";
            }
            
            echo "\n--- PRUEBA DE ELIMINACIÓN ---\n";
            
            // Tomar un ID para probar eliminación
            $equipoId = $primerEquipo['id'];
            echo "ID del equipo a eliminar: $equipoId\n";
            
            // Probar eliminación
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => "http://localhost:8000/api/v1/equipos/$equipoId",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_CUSTOMREQUEST => 'DELETE',
                CURLOPT_HTTPHEADER => [
                    'Accept: application/json',
                    'Content-Type: application/json'
                ]
            ]);

            $deleteResponse = curl_exec($curl);
            $deleteHttpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);
            
            echo "HTTP Code de eliminación: $deleteHttpCode\n";
            echo "Respuesta: $deleteResponse\n";
        }
    }
} else {
    echo "Error al obtener equipos: $httpCode\n";
    echo "Respuesta: $response\n";
}

echo "\n=== FIN ===\n";
?>

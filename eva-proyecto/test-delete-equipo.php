<?php
/**
 * Script de prueba para verificar la funcionalidad de eliminar equipos
 */

echo "=== PRUEBA DE ELIMINACIÓN DE EQUIPOS ===\n\n";

// Verificar si existe algún equipo para hacer prueba
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

echo "1. Listando equipos disponibles...\n";
echo "HTTP Code: $httpCode\n";

if ($httpCode === 200) {
    $data = json_decode($response, true);
    if (isset($data['data']['data']) && !empty($data['data']['data'])) {
        $equipos = $data['data']['data'];
        echo "Equipos encontrados: " . count($equipos) . "\n\n";
        
        foreach (array_slice($equipos, 0, 3) as $equipo) {
            echo "- ID: {$equipo['id']} | Nombre: {$equipo['nombre']} | Placa: {$equipo['placa']}\n";
        }
        
        // Tomar el último equipo para prueba de eliminación
        $equipoTest = end($equipos);
        $equipoId = $equipoTest['id'];
        
        echo "\n2. Probando eliminación del equipo ID: $equipoId\n";
        
        // Intentar eliminar
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
        echo "Respuesta: $deleteResponse\n\n";
        
        if ($deleteHttpCode === 200) {
            echo "✅ ÉXITO: Equipo eliminado correctamente\n";
            
            // Verificar que efectivamente se eliminó
            $curl = curl_init();
            curl_setopt_array($curl, [
                CURLOPT_URL => "http://localhost:8000/api/v1/equipos?search=$equipoId",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTPHEADER => [
                    'Accept: application/json',
                    'Content-Type: application/json'
                ]
            ]);

            $verifyResponse = curl_exec($curl);
            $verifyHttpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            curl_close($curl);
            
            echo "3. Verificando eliminación...\n";
            echo "HTTP Code: $verifyHttpCode\n";
            
            if ($verifyHttpCode === 200) {
                $verifyData = json_decode($verifyResponse, true);
                $found = false;
                if (isset($verifyData['data']['data'])) {
                    foreach ($verifyData['data']['data'] as $eq) {
                        if ($eq['id'] == $equipoId) {
                            $found = true;
                            break;
                        }
                    }
                }
                
                if (!$found) {
                    echo "✅ CONFIRMADO: El equipo ya no existe en la base de datos\n";
                } else {
                    echo "❌ ERROR: El equipo aún existe en la base de datos\n";
                }
            }
        } else {
            echo "❌ ERROR: No se pudo eliminar el equipo\n";
            $errorData = json_decode($deleteResponse, true);
            echo "Detalles del error: " . ($errorData['message'] ?? 'Error desconocido') . "\n";
        }
        
    } else {
        echo "No hay equipos disponibles para hacer la prueba\n";
    }
} else {
    echo "❌ ERROR: No se pudieron listar los equipos\n";
    echo "Respuesta: $response\n";
}

echo "\n=== FIN DE LA PRUEBA ===\n";
?>

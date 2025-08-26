<?php

$url = "http://127.0.0.1:8001/api/v1/equipos/industrial-devices-complete";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: " . $httpCode . PHP_EOL;
echo "Response Length: " . strlen($response) . " bytes" . PHP_EOL;

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if ($data && isset($data['data']['data'])) {
        $equipos = $data['data']['data'];
        echo "Total equipos encontrados: " . count($equipos) . PHP_EOL;
        echo "=" . str_repeat("=", 50) . PHP_EOL;
        
        // Mostrar solo los primeros 3 equipos con imagen
        $count = 0;
        foreach ($equipos as $equipo) {
            if (!empty($equipo['image']) && $count < 3) {
                echo "ID: " . $equipo['id'] . PHP_EOL;
                echo "Nombre: " . $equipo['name'] . PHP_EOL;
                echo "Imagen: " . $equipo['image'] . PHP_EOL;
                echo "URL completa: http://127.0.0.1:8001/api/storage/equipos/images/" . $equipo['image'] . PHP_EOL;
                echo str_repeat("-", 40) . PHP_EOL;
                $count++;
            }
        }
        
        if ($count === 0) {
            echo "No se encontraron equipos industriales con imagen en la respuesta." . PHP_EOL;
            
            // Mostrar estructura de un equipo sin imagen para debug
            if (!empty($equipos)) {
                echo "Estructura del primer equipo:" . PHP_EOL;
                print_r(array_slice($equipos[0], 0, 10, true));
            }
        }
    } else {
        echo "Error en la estructura de la respuesta JSON." . PHP_EOL;
        echo "Respuesta completa: " . substr($response, 0, 500) . "..." . PHP_EOL;
    }
} else {
    echo "Error HTTP: " . $httpCode . PHP_EOL;
    echo "Response: " . $response . PHP_EOL;
}

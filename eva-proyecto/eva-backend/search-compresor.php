<?php

$url = "http://127.0.0.1:8001/api/v1/equipos/industrial-devices-complete?per_page=1000&search=compresor";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    if ($data && isset($data['data']['data'])) {
        $equipos = $data['data']['data'];
        echo "Equipos encontrados con búsqueda 'compresor': " . count($equipos) . PHP_EOL;
        echo "=" . str_repeat("=", 60) . PHP_EOL;
        
        foreach ($equipos as $equipo) {
            echo "ID: " . $equipo['id'] . PHP_EOL;
            echo "Nombre: " . $equipo['name'] . PHP_EOL;
            echo "Imagen: " . ($equipo['image'] ?: 'VACÍO') . PHP_EOL;
            
            if ($equipo['id'] == 4289) {
                echo "🎯 ¡ESTE ES EL EQUIPO QUE BUSCAMOS!" . PHP_EOL;
            }
            
            if (!empty($equipo['image'])) {
                echo "✅ URL imagen: http://127.0.0.1:8001/api/storage/equipos/images/" . $equipo['image'] . PHP_EOL;
            }
            
            echo str_repeat("-", 40) . PHP_EOL;
        }
        
    }
}

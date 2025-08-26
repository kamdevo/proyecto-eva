<?php

$url = "http://127.0.0.1:8001/api/v1/equipos/industrial-devices-complete?per_page=100";

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
        echo "Total equipos industriales encontrados: " . count($equipos) . PHP_EOL;
        echo "=" . str_repeat("=", 60) . PHP_EOL;
        
        // Buscar específicamente el equipo con ID 4289
        $foundTarget = false;
        $equiposConImagen = 0;
        
        foreach ($equipos as $equipo) {
            if ($equipo['id'] == 4289) {
                echo "✅ ENCONTRADO - EQUIPO OBJETIVO:" . PHP_EOL;
                echo "ID: " . $equipo['id'] . PHP_EOL;
                echo "Nombre: " . $equipo['name'] . PHP_EOL;
                echo "Imagen: " . ($equipo['image'] ?: 'VACÍO') . PHP_EOL;
                $foundTarget = true;
            }
            
            if (!empty($equipo['image'])) {
                $equiposConImagen++;
                if ($equiposConImagen <= 3) {
                    echo "Equipo con imagen #" . $equiposConImagen . ":" . PHP_EOL;
                    echo "  ID: " . $equipo['id'] . " | " . $equipo['name'] . " | " . $equipo['image'] . PHP_EOL;
                }
            }
        }
        
        if (!$foundTarget) {
            echo "❌ El equipo ID 4289 (COMPRESOR DE AIRE INDUSTRIAL) NO está en los resultados." . PHP_EOL;
            echo "Esto indica que NO tiene tipo_id = 2 o está inactivo (status = 0)." . PHP_EOL;
        }
        
        echo PHP_EOL . "RESUMEN:" . PHP_EOL;
        echo "- Total equipos industriales: " . count($equipos) . PHP_EOL;
        echo "- Equipos con imagen: " . $equiposConImagen . PHP_EOL;
        
        if ($equiposConImagen === 0) {
            echo "❌ PROBLEMA: Ningún equipo industrial tiene imagen asignada." . PHP_EOL;
            echo "Esto explica por qué no se ven las imágenes en el frontend." . PHP_EOL;
        }
        
    }
} else {
    echo "Error HTTP: " . $httpCode . PHP_EOL;
}

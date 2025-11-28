<?php

echo "🔍 Buscando equipos industriales con imágenes...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar equipos industriales con imagen
    $stmt = $pdo->query("
        SELECT id, name, code, image
        FROM equipos
        WHERE tipo_id = 2
        AND image IS NOT NULL
        AND image != ''
        LIMIT 5
    ");
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Equipos industriales con imagen en BD:\n";
    echo str_repeat("=", 80) . "\n";
    
    foreach ($equipos as $eq) {
        echo "ID: {$eq['id']} - {$eq['name']} - image: {$eq['image']}\n";
    }
    
    if (!empty($equipos)) {
        $primerEquipo = $equipos[0];
        echo "\n\n🧪 Probando con equipo ID {$primerEquipo['id']}:\n";
        echo str_repeat("=", 80) . "\n\n";
        
        // Probar el endpoint con ese equipo
        $url = "http://192.168.2.146:8001/api/v1/equipos/industrial-devices-complete?consulta_id={$primerEquipo['id']}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "📤 URL: {$url}\n";
        echo "📊 HTTP Code: {$httpCode}\n\n";
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            
            if (isset($data['data']['data'][0])) {
                $eqAPI = $data['data']['data'][0];
                
                echo "✅ Respuesta del API:\n";
                echo "  ID: {$eqAPI['id']}\n";
                echo "  Nombre: " . ($eqAPI['equipo']['name'] ?? 'N/A') . "\n";
                echo "  📷 image: " . ($eqAPI['equipo']['image'] ?? 'NULL') . "\n";
                echo "  ✓ hasImage: " . ($eqAPI['equipo']['hasImage'] ? 'true' : 'false') . "\n\n";
                
                // Verificar si la URL es accesible
                if (!empty($eqAPI['equipo']['image'])) {
                    $imageUrl = $eqAPI['equipo']['image'];
                    
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $imageUrl);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_NOBODY, true);
                    curl_exec($ch);
                    $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    
                    echo "🔗 Verificando URL de imagen:\n";
                    echo "  URL: {$imageUrl}\n";
                    echo "  HTTP Code: {$imageHttpCode} " . ($imageHttpCode === 200 ? '✅' : '❌') . "\n";
                }
            }
        } else {
            echo "❌ Error HTTP {$httpCode}\n";
            echo substr($response, 0, 500) . "\n";
        }
    } else {
        echo "\n⚠️ No se encontraron equipos industriales con imágenes\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

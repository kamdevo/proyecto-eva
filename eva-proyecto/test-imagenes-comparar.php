<?php

echo "🔍 Comparando respuestas de imágenes: Biomédicos vs Industriales...\n\n";

// Función para hacer petición
function testEndpoint($url, $tipo) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 {$tipo}:\n";
    echo str_repeat("=", 80) . "\n";
    echo "URL: {$url}\n";
    echo "HTTP Code: {$httpCode}\n\n";
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        
        if (isset($data['data']['data'][0])) {
            $equipo = $data['data']['data'][0];
            
            echo "✅ Equipo obtenido:\n";
            echo "  ID: " . ($equipo['id'] ?? 'N/A') . "\n";
            echo "  Nombre: " . ($equipo['equipo']['name'] ?? 'N/A') . "\n";
            echo "  Campo 'image' en equipo: " . ($equipo['equipo']['image'] ?? 'NULL') . "\n";
            echo "  hasImage: " . ($equipo['equipo']['hasImage'] ? 'true' : 'false') . "\n\n";
            
            // Verificar si la URL es accesible
            if (!empty($equipo['equipo']['image'])) {
                $imageUrl = $equipo['equipo']['image'];
                echo "🔗 URL de imagen generada:\n  {$imageUrl}\n\n";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $imageUrl);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_exec($ch);
                $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($imageHttpCode === 200) {
                    echo "✅ Imagen accesible (HTTP {$imageHttpCode})\n";
                } else {
                    echo "❌ Imagen NO accesible (HTTP {$imageHttpCode})\n";
                }
            } else {
                echo "⚠️ No hay imagen\n";
            }
        } else {
            echo "⚠️ No se encontraron equipos\n";
        }
    } else {
        echo "❌ Error HTTP {$httpCode}\n";
        echo substr($response, 0, 500) . "\n";
    }
    
    echo "\n" . str_repeat("-", 80) . "\n\n";
}

// Probar con un equipo biomédico (ID 1)
testEndpoint(
    'http://192.168.2.146:8001/api/v1/equipos/medical-devices-complete?consulta_id=1',
    'EQUIPO BIOMÉDICO (ID 1)'
);

// Buscar un equipo industrial con imagen
$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query("
        SELECT id, name, image 
        FROM equipos 
        WHERE tipo_id = 2 
        AND image IS NOT NULL 
        AND image != ''
        LIMIT 1
    ");
    $equipoIndustrial = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($equipoIndustrial) {
        echo "📋 Equipo industrial encontrado en BD:\n";
        echo "  ID: {$equipoIndustrial['id']}\n";
        echo "  Nombre: {$equipoIndustrial['name']}\n";
        echo "  Image field: {$equipoIndustrial['image']}\n\n";
        
        // Probar con ese equipo industrial
        testEndpoint(
            'http://192.168.2.146:8001/api/v1/equipos/industrial-devices-complete?consulta_id=' . $equipoIndustrial['id'],
            'EQUIPO INDUSTRIAL (ID ' . $equipoIndustrial['id'] . ')'
        );
    } else {
        echo "⚠️ No se encontró ningún equipo industrial con imagen\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error BD: " . $e->getMessage() . "\n";
}

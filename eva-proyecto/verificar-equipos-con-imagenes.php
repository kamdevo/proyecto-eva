<?php
/**
 * Verificar qué equipos tienen imágenes y probar su acceso
 */

echo "🔍 VERIFICANDO EQUIPOS CON IMÁGENES\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Obtener equipos con imágenes
    echo "1️⃣ EQUIPOS CON IMÁGENES EN LA BASE DE DATOS:\n\n";
    
    $stmt = $pdo->query("
        SELECT 
            id, 
            name, 
            code,
            image,
            CASE 
                WHEN image IS NOT NULL AND image != '' THEN 'Sí'
                ELSE 'No'
            END as tiene_imagen
        FROM equipos 
        WHERE image IS NOT NULL AND image != '' 
        ORDER BY id 
        LIMIT 10
    ");
    
    $equiposConImagenes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($equiposConImagenes)) {
        echo "❌ No se encontraron equipos con imágenes\n";
        exit;
    }
    
    echo "📊 Total equipos con imágenes encontrados: " . count($equiposConImagenes) . "\n\n";
    
    printf("%-5s %-30s %-15s %-40s %-10s\n", "ID", "NOMBRE", "CÓDIGO", "IMAGEN", "ESTADO");
    echo str_repeat("-", 100) . "\n";
    
    foreach ($equiposConImagenes as $equipo) {
        printf("%-5s %-30s %-15s %-40s %-10s\n",
            $equipo['id'],
            substr($equipo['name'] ?: 'Sin nombre', 0, 29),
            substr($equipo['code'] ?: 'Sin código', 0, 14),
            substr($equipo['image'], 0, 39),
            $equipo['tiene_imagen']
        );
    }
    
    echo "\n" . str_repeat("-", 60) . "\n\n";
    
    // 2. Probar endpoints específicos
    echo "2️⃣ PROBANDO ENDPOINTS PARA EQUIPOS ESPECÍFICOS:\n\n";
    
    $equiposPrueba = array_slice($equiposConImagenes, 0, 3); // Probar primeros 3
    
    foreach ($equiposPrueba as $equipo) {
        $equipoId = $equipo['id'];
        $equipoNombre = $equipo['name'];
        $imagenNombre = $equipo['image'];
        
        echo "🔍 EQUIPO ID: $equipoId\n";
        echo "   Nombre: $equipoNombre\n";
        echo "   Imagen: $imagenNombre\n";
        
        // Probar endpoint de archivos
        $filesUrl = "$baseUrl/api/v1/equipos/$equipoId/files";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $filesUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "   📊 Endpoint archivos: HTTP $httpCode\n";
        
        if ($httpCode == 200) {
            $data = json_decode($response, true);
            if ($data && $data['success'] && isset($data['data']['imagen'])) {
                $imagePath = $data['data']['imagen']['path'];
                echo "   ✅ Path devuelto: $imagePath\n";
                
                // Probar acceso directo a imagen
                $imageUrl = "$baseUrl/storage/$imagePath";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $imageUrl);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                
                curl_exec($ch);
                $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                curl_close($ch);
                
                echo "   🌐 URL imagen: $imageUrl\n";
                echo "   📊 HTTP imagen: $imageHttpCode ($contentType)\n";
                
                if ($imageHttpCode == 200) {
                    echo "   ✅ IMAGEN ACCESIBLE\n";
                } else {
                    echo "   ❌ IMAGEN NO ACCESIBLE\n";
                }
                
            } else {
                echo "   ❌ No se encontró información de imagen\n";
            }
        } else {
            echo "   ❌ Error en endpoint de archivos\n";
        }
        
        echo "\n";
    }
    
    echo str_repeat("-", 60) . "\n\n";
    
    // 3. Verificar en el endpoint de equipos médicos
    echo "3️⃣ VERIFICANDO EN ENDPOINT DE EQUIPOS MÉDICOS:\n\n";
    
    $medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?page=1&per_page=5";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $medicalDevicesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success'] && isset($data['data']['data'])) {
            $equipos = $data['data']['data'];
            echo "✅ Equipos obtenidos: " . count($equipos) . "\n\n";
            
            echo "📋 PRIMEROS 3 EQUIPOS DEL ENDPOINT:\n";
            foreach (array_slice($equipos, 0, 3) as $index => $device) {
                echo "   " . ($index + 1) . ". ID: " . ($device['id'] ?? 'N/A') . "\n";
                echo "      Nombre: " . ($device['name'] ?? 'N/A') . "\n";
                echo "      Código: " . ($device['code'] ?? 'N/A') . "\n";
                echo "      Imagen: " . ($device['image'] ?? 'N/A') . "\n";
                echo "      Equipo data: " . (isset($device['equipo']) ? 'Sí' : 'No') . "\n";
                
                if (isset($device['equipo'])) {
                    echo "      Equipo.name: " . ($device['equipo']['name'] ?? 'N/A') . "\n";
                    echo "      Equipo.image: " . ($device['equipo']['image'] ?? 'N/A') . "\n";
                }
                echo "\n";
            }
        } else {
            echo "❌ Respuesta inesperada del endpoint\n";
        }
    } else {
        echo "❌ Error en endpoint de equipos médicos\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN PARA BUSCAR EN EL FRONTEND:\n\n";
    
    echo "📋 EQUIPOS RECOMENDADOS PARA BUSCAR:\n";
    foreach (array_slice($equiposConImagenes, 0, 5) as $equipo) {
        echo "   • ID: {$equipo['id']} - {$equipo['name']}\n";
        echo "     Código: " . ($equipo['code'] ?: 'Sin código') . "\n";
        echo "     Imagen: {$equipo['image']}\n\n";
    }
    
    echo "💡 INSTRUCCIONES:\n";
    echo "1. Ve al frontend de equipos médicos\n";
    echo "2. Busca por ID o nombre de los equipos listados arriba\n";
    echo "3. Verifica si las imágenes aparecen\n";
    echo "4. Si no aparecen, abre la consola del navegador (F12)\n";
    echo "5. Busca errores relacionados con imágenes\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

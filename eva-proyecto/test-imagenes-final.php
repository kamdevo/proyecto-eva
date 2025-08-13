<?php
/**
 * Prueba final de las imágenes de equipos
 */

echo "🖼️ PRUEBA FINAL DE IMÁGENES DE EQUIPOS\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Obtener equipos con imágenes
    $stmt = $pdo->query("SELECT id, name, image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 3");
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($equipos)) {
        echo "❌ No se encontraron equipos con imágenes\n";
        exit;
    }
    
    echo "📋 PROBANDO IMÁGENES DE EQUIPOS:\n\n";
    
    foreach ($equipos as $equipo) {
        echo "🔍 Equipo ID: {$equipo['id']}\n";
        echo "   Nombre: {$equipo['name']}\n";
        echo "   Imagen: {$equipo['image']}\n";
        
        // 1. Probar endpoint de archivos
        $filesUrl = "$baseUrl/api/v1/equipos/{$equipo['id']}/files";
        
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
                echo "   ✅ Imagen encontrada: $imagePath\n";
                
                // 2. Probar acceso directo a imagen con nueva ruta
                $imageUrls = [
                    "$baseUrl/api/v1/storage/equipos/images/$imagePath",
                    "$baseUrl/api/v1/storage/$imagePath",
                    "$baseUrl/storage/$imagePath"
                ];
                
                foreach ($imageUrls as $imageUrl) {
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $imageUrl);
                    curl_setopt($ch, CURLOPT_NOBODY, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    
                    curl_exec($ch);
                    $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                    curl_close($ch);
                    
                    echo "   📸 $imageUrl\n";
                    echo "      HTTP: $imageHttpCode, Tipo: $contentType\n";
                    
                    if ($imageHttpCode == 200) {
                        echo "      ✅ IMAGEN ACCESIBLE\n";
                        break;
                    } else {
                        echo "      ❌ No accesible\n";
                    }
                }
                
            } else {
                echo "   ❌ No se encontró información de imagen\n";
            }
        } else {
            echo "   ❌ Error en endpoint de archivos\n";
        }
        
        echo "\n" . str_repeat("-", 30) . "\n\n";
    }
    
    echo str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN FINAL:\n\n";
    
    // Probar una imagen específica
    $testImage = $equipos[0]['image'];
    $testUrl = "$baseUrl/api/v1/storage/equipos/images/$testImage";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $testUrl);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    curl_exec($ch);
    $finalHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($finalHttpCode == 200) {
        echo "✅ ¡IMÁGENES FUNCIONANDO CORRECTAMENTE!\n";
        echo "🎉 Las imágenes de equipos ya se pueden cargar\n";
        echo "🔗 URL de ejemplo: $testUrl\n";
        
        echo "\n💡 CONFIGURACIÓN APLICADA:\n";
        echo "   - Rutas de storage agregadas al API\n";
        echo "   - Hook de imágenes actualizado\n";
        echo "   - CORS configurado correctamente\n";
        
        echo "\n🚀 ¡Refresca el frontend para ver las imágenes!\n";
        
    } else {
        echo "❌ Aún hay problemas con las imágenes\n";
        echo "📊 Código de respuesta: $finalHttpCode\n";
        echo "💡 Revisar configuración del servidor\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

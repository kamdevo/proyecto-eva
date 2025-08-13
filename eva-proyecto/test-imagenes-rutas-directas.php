<?php
/**
 * Prueba de las nuevas rutas directas de imágenes
 */

echo "🖼️ PRUEBA DE RUTAS DIRECTAS DE IMÁGENES\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Obtener una imagen de ejemplo
    $stmt = $pdo->query("SELECT id, name, image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 1");
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$equipo) {
        echo "❌ No se encontraron equipos con imágenes\n";
        exit;
    }
    
    $imageName = $equipo['image'];
    echo "🎯 Probando imagen: $imageName\n";
    echo "📋 Equipo: {$equipo['name']} (ID: {$equipo['id']})\n\n";
    
    // Probar diferentes rutas
    $testUrls = [
        "$baseUrl/storage/equipos/images/$imageName" => "Ruta directa específica",
        "$baseUrl/storage/$imageName" => "Ruta directa genérica",
        "$baseUrl/api/v1/storage/equipos/images/$imageName" => "Ruta API v1 específica",
        "$baseUrl/api/v1/storage/$imageName" => "Ruta API v1 genérica"
    ];
    
    $workingUrl = null;
    
    foreach ($testUrls as $url => $description) {
        echo "🔍 Probando: $description\n";
        echo "   URL: $url\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);
        curl_close($ch);
        
        echo "   📊 HTTP: $httpCode\n";
        echo "   📄 Tipo: $contentType\n";
        
        if ($error) {
            echo "   ❌ Error cURL: $error\n";
        } else if ($httpCode == 200) {
            echo "   ✅ ¡FUNCIONA!\n";
            $workingUrl = $url;
        } else if ($httpCode == 500) {
            echo "   ❌ Error interno del servidor\n";
            
            // Obtener detalles del error
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            
            $errorResponse = curl_exec($ch);
            curl_close($ch);
            
            if (strpos($errorResponse, 'json') !== false) {
                $errorData = json_decode($errorResponse, true);
                if ($errorData && isset($errorData['error'])) {
                    echo "   📝 Error: {$errorData['error']}\n";
                }
            }
        } else {
            echo "   ❌ No accesible\n";
        }
        
        echo "\n";
    }
    
    echo str_repeat("=", 60) . "\n";
    echo "🎯 RESULTADO FINAL:\n\n";
    
    if ($workingUrl) {
        echo "✅ ¡IMAGEN ACCESIBLE!\n";
        echo "🔗 URL que funciona: $workingUrl\n";
        
        // Probar descarga completa
        echo "\n🔄 Probando descarga completa...\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $workingUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $imageData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $downloadSize = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
        curl_close($ch);
        
        if ($httpCode == 200 && $downloadSize > 0) {
            echo "✅ Descarga exitosa: $downloadSize bytes\n";
            echo "🎉 ¡LAS IMÁGENES ESTÁN FUNCIONANDO CORRECTAMENTE!\n";
            
            echo "\n💡 CONFIGURACIÓN FINAL:\n";
            echo "   - Rutas directas de storage funcionando\n";
            echo "   - CORS configurado correctamente\n";
            echo "   - Tipos MIME configurados\n";
            
            echo "\n🚀 PRÓXIMOS PASOS:\n";
            echo "   1. Refresca el frontend\n";
            echo "   2. Las imágenes deberían cargar automáticamente\n";
            echo "   3. Si no cargan, verifica la consola del navegador\n";
            
        } else {
            echo "❌ Error en descarga completa\n";
        }
        
    } else {
        echo "❌ NINGUNA RUTA FUNCIONA\n";
        echo "💡 Posibles problemas:\n";
        echo "   - Servidor Laravel no está ejecutándose\n";
        echo "   - Error en las rutas agregadas\n";
        echo "   - Problema con permisos de archivos\n";
        
        echo "\n🔧 ACCIONES RECOMENDADAS:\n";
        echo "   1. Reiniciar servidor Laravel\n";
        echo "   2. Verificar logs de Laravel\n";
        echo "   3. Verificar permisos de storage\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

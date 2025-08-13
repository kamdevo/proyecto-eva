<?php
/**
 * Probar el endpoint original de archivos
 */

echo "🧪 PROBANDO ENDPOINT ORIGINAL DE ARCHIVOS\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Obtener equipo con imagen
    $stmt = $pdo->query("SELECT id, name, image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 1");
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$equipo) {
        echo "❌ No se encontraron equipos con imágenes\n";
        exit;
    }
    
    $equipoId = $equipo['id'];
    $imageName = $equipo['image'];
    
    echo "📋 Equipo ID: $equipoId\n";
    echo "📋 Nombre: {$equipo['name']}\n";
    echo "📋 Imagen en BD: $imageName\n\n";
    
    // 1. Probar endpoint de archivos
    $filesUrl = "$baseUrl/api/v1/equipos/$equipoId/files";
    
    echo "🔍 PROBANDO ENDPOINT DE ARCHIVOS:\n";
    echo "URL: $filesUrl\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $filesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✅ Endpoint funcionando\n";
        
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "📄 Respuesta exitosa:\n";
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
            
            if (isset($data['data']['imagen'])) {
                $imageData = $data['data']['imagen'];
                $imagePath = $imageData['path'];
                
                echo "🖼️ INFORMACIÓN DE IMAGEN:\n";
                echo "   Path devuelto: $imagePath\n";
                echo "   Tipo: {$imageData['type']}\n";
                echo "   Existe: " . ($imageData['exists'] ? 'Sí' : 'No') . "\n\n";
                
                // 2. Construir URL como lo hace el frontend
                $frontendUrl = "$baseUrl/storage/$imagePath";
                
                echo "🌐 URL CONSTRUIDA POR FRONTEND:\n";
                echo "   $frontendUrl\n";
                
                // 3. Probar acceso a la URL
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $frontendUrl);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                
                curl_exec($ch);
                $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                curl_close($ch);
                
                echo "   📊 HTTP Code: $imageHttpCode\n";
                echo "   📄 Content-Type: $contentType\n";
                
                if ($imageHttpCode == 200) {
                    echo "   ✅ ¡IMAGEN ACCESIBLE!\n";
                    
                    echo "\n🎉 TODO FUNCIONANDO CORRECTAMENTE:\n";
                    echo "   ✅ Endpoint de archivos: OK\n";
                    echo "   ✅ Path devuelto: $imagePath\n";
                    echo "   ✅ URL construida: $frontendUrl\n";
                    echo "   ✅ Imagen accesible: HTTP 200\n";
                    
                    echo "\n💡 El frontend debería cargar las imágenes correctamente\n";
                    echo "🔄 Si no cargan, verifica:\n";
                    echo "   - Que el servidor Laravel esté ejecutándose\n";
                    echo "   - La consola del navegador para errores\n";
                    echo "   - La configuración de VITE_API_URL\n";
                    
                } else {
                    echo "   ❌ Imagen NO accesible\n";
                    
                    // Verificar si el path necesita ajuste
                    if (strpos($imagePath, 'equipos/images/') === false) {
                        echo "\n🔧 POSIBLE PROBLEMA: Path no incluye 'equipos/images/'\n";
                        echo "   Path actual: $imagePath\n";
                        echo "   Path esperado: equipos/images/$imagePath\n";
                        
                        // Probar con path corregido
                        $correctedUrl = "$baseUrl/storage/equipos/images/$imagePath";
                        echo "   Probando URL corregida: $correctedUrl\n";
                        
                        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_URL, $correctedUrl);
                        curl_setopt($ch, CURLOPT_NOBODY, true);
                        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                        
                        curl_exec($ch);
                        $correctedHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                        curl_close($ch);
                        
                        echo "   📊 HTTP Code corregido: $correctedHttpCode\n";
                        
                        if ($correctedHttpCode == 200) {
                            echo "   ✅ ¡FUNCIONA CON PATH CORREGIDO!\n";
                            echo "\n💡 SOLUCIÓN: Actualizar endpoint para devolver path completo\n";
                        }
                    }
                }
                
            } else {
                echo "❌ No se encontró información de imagen en la respuesta\n";
            }
            
        } else {
            echo "❌ Respuesta de error:\n";
            echo $response . "\n";
        }
        
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
        echo "Respuesta: $response\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

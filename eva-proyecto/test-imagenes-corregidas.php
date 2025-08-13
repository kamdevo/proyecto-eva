<?php
/**
 * Probar las URLs de imágenes corregidas
 */

echo "🧪 PROBANDO URLs DE IMÁGENES CORREGIDAS\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

// Probar endpoint de equipos médicos
$medicalDevicesUrl = "$baseUrl/api/v1/equipos/medical-devices-complete?page=1&per_page=3";

echo "🔍 PROBANDO ENDPOINT DE EQUIPOS MÉDICOS:\n";
echo "URL: $medicalDevicesUrl\n\n";

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
        
        echo "📋 VERIFICANDO URLs DE IMÁGENES:\n\n";
        
        foreach ($equipos as $index => $device) {
            $equipoId = $device['id'] ?? 'N/A';
            $equipoNombre = $device['equipo']['name'] ?? 'N/A';
            $imageUrl = $device['equipo']['image'] ?? null;
            
            echo "🔍 EQUIPO " . ($index + 1) . ":\n";
            echo "   ID: $equipoId\n";
            echo "   Nombre: $equipoNombre\n";
            
            if ($imageUrl) {
                echo "   ✅ URL imagen: $imageUrl\n";
                
                // Probar acceso a la imagen
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $imageUrl);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                
                curl_exec($ch);
                $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
                curl_close($ch);
                
                echo "   📊 HTTP imagen: $imageHttpCode\n";
                echo "   📄 Tipo: $contentType\n";
                
                if ($imageHttpCode == 200) {
                    echo "   🎉 ¡IMAGEN ACCESIBLE!\n";
                } else {
                    echo "   ❌ Imagen NO accesible\n";
                }
                
            } else {
                echo "   ⚠️ Sin imagen\n";
            }
            
            echo "\n";
        }
        
        // Contar equipos con imágenes accesibles
        $imagenesAccesibles = 0;
        $totalConImagenes = 0;
        
        foreach ($equipos as $device) {
            $imageUrl = $device['equipo']['image'] ?? null;
            if ($imageUrl) {
                $totalConImagenes++;
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $imageUrl);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 3);
                
                curl_exec($ch);
                $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($imageHttpCode == 200) {
                    $imagenesAccesibles++;
                }
            }
        }
        
        echo str_repeat("=", 50) . "\n";
        echo "🎯 RESUMEN FINAL:\n\n";
        
        echo "📊 Estadísticas:\n";
        echo "   - Total equipos: " . count($equipos) . "\n";
        echo "   - Con imágenes: $totalConImagenes\n";
        echo "   - Imágenes accesibles: $imagenesAccesibles\n";
        
        if ($imagenesAccesibles == $totalConImagenes && $totalConImagenes > 0) {
            echo "\n🎉 ¡TODAS LAS IMÁGENES SON ACCESIBLES!\n";
            echo "✅ Las URLs se construyen correctamente\n";
            echo "✅ El enlace simbólico funciona\n";
            echo "✅ Las imágenes deberían cargar en el frontend\n";
            
            echo "\n🚀 PRÓXIMOS PASOS:\n";
            echo "1. Refresca el frontend\n";
            echo "2. Las imágenes deberían aparecer automáticamente\n";
            echo "3. Busca específicamente estos equipos:\n";
            
            foreach (array_slice($equipos, 0, 3) as $device) {
                if ($device['equipo']['image'] ?? null) {
                    echo "   • " . ($device['equipo']['name'] ?? 'Sin nombre') . " (ID: " . ($device['id'] ?? 'N/A') . ")\n";
                }
            }
            
        } else {
            echo "\n❌ Aún hay problemas con algunas imágenes\n";
            echo "💡 Verifica la consola del navegador para más detalles\n";
        }
        
    } else {
        echo "❌ Respuesta inesperada del endpoint\n";
        echo "Respuesta: " . substr($response, 0, 200) . "...\n";
    }
} else {
    echo "❌ Error en endpoint: HTTP $httpCode\n";
    echo "Respuesta: $response\n";
}
?>

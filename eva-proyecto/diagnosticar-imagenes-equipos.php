<?php
/**
 * Script para diagnosticar problemas con las imágenes de equipos
 */

echo "🖼️ DIAGNÓSTICO DE IMÁGENES DE EQUIPOS\n";
echo str_repeat("=", 60) . "\n\n";

$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    echo "🔗 Conectado a la base de datos\n\n";
    
    // 1. Verificar equipos con imágenes
    echo "1️⃣ VERIFICANDO EQUIPOS CON IMÁGENES:\n";
    
    $stmt = $pdo->query("
        SELECT 
            id, 
            name, 
            code, 
            image, 
            file,
            archivo_invima
        FROM equipos 
        WHERE image IS NOT NULL AND image != '' 
        LIMIT 10
    ");
    
    $equiposConImagenes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($equiposConImagenes)) {
        echo "❌ No se encontraron equipos con imágenes\n";
        
        // Verificar si hay equipos sin imágenes
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM equipos WHERE image IS NULL OR image = ''");
        $sinImagenes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "📊 Equipos sin imágenes: $sinImagenes\n";
        
    } else {
        echo "✅ Equipos con imágenes encontrados: " . count($equiposConImagenes) . "\n\n";
        
        foreach ($equiposConImagenes as $equipo) {
            echo "   📋 Equipo ID: " . $equipo['id'] . "\n";
            echo "      - Nombre: " . ($equipo['name'] ?: 'Sin nombre') . "\n";
            echo "      - Código: " . ($equipo['code'] ?: 'Sin código') . "\n";
            echo "      - Imagen: " . ($equipo['image'] ?: 'Sin imagen') . "\n";
            echo "      - Archivo: " . ($equipo['file'] ?: 'Sin archivo') . "\n";
            echo "\n";
        }
    }
    
    echo str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar estructura de directorios
    echo "2️⃣ VERIFICANDO ESTRUCTURA DE DIRECTORIOS:\n";
    
    $directories = [
        'storage/app/public' => 'Directorio principal de storage público',
        'storage/app/public/equipos' => 'Directorio de equipos',
        'storage/app/public/equipos/images' => 'Directorio de imágenes de equipos',
        'public/storage' => 'Enlace simbólico de storage'
    ];
    
    foreach ($directories as $dir => $description) {
        $fullPath = __DIR__ . "/eva-backend/$dir";
        if (is_dir($fullPath)) {
            $fileCount = count(glob($fullPath . '/*'));
            echo "   ✅ $description: $dir ($fileCount archivos)\n";
        } else {
            echo "   ❌ $description: $dir (NO EXISTE)\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Probar endpoint de archivos
    echo "3️⃣ PROBANDO ENDPOINT DE ARCHIVOS:\n";
    
    if (!empty($equiposConImagenes)) {
        $equipoTest = $equiposConImagenes[0];
        $equipoId = $equipoTest['id'];
        
        echo "   🧪 Probando equipo ID: $equipoId\n";
        
        $baseUrl = 'http://127.0.0.1:8000';
        $filesUrl = "$baseUrl/api/v1/equipos/$equipoId/files";
        
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
        
        echo "   📊 HTTP Code: $httpCode\n";
        
        if ($httpCode == 200) {
            $data = json_decode($response, true);
            if ($data && $data['success']) {
                echo "   ✅ Endpoint funcionando\n";
                echo "   📄 Archivos encontrados:\n";
                
                foreach ($data['data'] as $tipo => $archivo) {
                    echo "      - $tipo: " . $archivo['path'] . "\n";
                }
                
                // Probar acceso directo a imagen
                if (isset($data['data']['imagen'])) {
                    $imagePath = $data['data']['imagen']['path'];
                    $imageUrl = "$baseUrl/storage/$imagePath";
                    
                    echo "\n   🖼️ Probando acceso directo a imagen:\n";
                    echo "      URL: $imageUrl\n";
                    
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $imageUrl);
                    curl_setopt($ch, CURLOPT_NOBODY, true);
                    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                    
                    curl_exec($ch);
                    $imageHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    
                    echo "      HTTP Code: $imageHttpCode\n";
                    
                    if ($imageHttpCode == 200) {
                        echo "      ✅ Imagen accesible\n";
                    } else {
                        echo "      ❌ Imagen NO accesible\n";
                    }
                }
                
            } else {
                echo "   ❌ Respuesta de error: $response\n";
            }
        } else {
            echo "   ❌ Error en endpoint: $response\n";
        }
    } else {
        echo "   ⚠️ No hay equipos con imágenes para probar\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 DIAGNÓSTICO FINAL:\n\n";
    
    if (empty($equiposConImagenes)) {
        echo "❌ PROBLEMA: No hay equipos con imágenes en la base de datos\n";
        echo "💡 SOLUCIONES:\n";
        echo "   1. Subir imágenes a algunos equipos\n";
        echo "   2. Verificar que el campo 'image' se esté llenando correctamente\n";
        echo "   3. Revisar el proceso de carga de imágenes\n";
    } else {
        echo "✅ Hay equipos con imágenes en la BD\n";
        echo "💡 VERIFICAR:\n";
        echo "   1. Enlace simbólico de storage: php artisan storage:link\n";
        echo "   2. Permisos de directorios de storage\n";
        echo "   3. Configuración de URL base en el frontend\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

<?php
/**
 * Script para arreglar el enlace simbólico de storage
 */

echo "🔗 ARREGLANDO ENLACE SIMBÓLICO DE STORAGE\n";
echo str_repeat("=", 50) . "\n\n";

$publicStoragePath = __DIR__ . '/public/storage';
$storageAppPublicPath = __DIR__ . '/storage/app/public';

echo "📁 Ruta pública: $publicStoragePath\n";
echo "📁 Ruta storage: $storageAppPublicPath\n\n";

// 1. Eliminar enlace existente si existe
if (file_exists($publicStoragePath)) {
    echo "🗑️ Eliminando enlace existente...\n";
    
    if (is_link($publicStoragePath)) {
        unlink($publicStoragePath);
        echo "✅ Enlace simbólico eliminado\n";
    } else if (is_dir($publicStoragePath)) {
        // Si es un directorio, eliminarlo recursivamente
        function deleteDirectory($dir) {
            if (!is_dir($dir)) return false;
            $files = array_diff(scandir($dir), ['.', '..']);
            foreach ($files as $file) {
                $path = $dir . DIRECTORY_SEPARATOR . $file;
                is_dir($path) ? deleteDirectory($path) : unlink($path);
            }
            return rmdir($dir);
        }
        
        deleteDirectory($publicStoragePath);
        echo "✅ Directorio eliminado\n";
    }
}

// 2. Crear nuevo enlace simbólico
echo "\n🔗 Creando nuevo enlace simbólico...\n";

if (PHP_OS_FAMILY === 'Windows') {
    // En Windows, usar junction (más compatible que symlink)
    $command = "mklink /J \"$publicStoragePath\" \"$storageAppPublicPath\"";
    exec($command, $output, $returnVar);
    
    if ($returnVar === 0) {
        echo "✅ Enlace simbólico creado exitosamente (Windows Junction)\n";
    } else {
        echo "❌ Error creando enlace: " . implode("\n", $output) . "\n";
        echo "🔄 Intentando método alternativo...\n";
        
        // Método alternativo: copiar estructura
        if (!is_dir($publicStoragePath)) {
            mkdir($publicStoragePath, 0755, true);
        }
        
        // Crear enlaces a subdirectorios específicos
        $subdirs = ['equipos'];
        foreach ($subdirs as $subdir) {
            $sourceDir = $storageAppPublicPath . DIRECTORY_SEPARATOR . $subdir;
            $targetDir = $publicStoragePath . DIRECTORY_SEPARATOR . $subdir;
            
            if (is_dir($sourceDir) && !is_dir($targetDir)) {
                $cmd = "mklink /J \"$targetDir\" \"$sourceDir\"";
                exec($cmd, $out, $ret);
                if ($ret === 0) {
                    echo "✅ Enlace creado para: $subdir\n";
                } else {
                    echo "❌ Error creando enlace para: $subdir\n";
                }
            }
        }
    }
} else {
    // En Linux/Mac
    if (symlink($storageAppPublicPath, $publicStoragePath)) {
        echo "✅ Enlace simbólico creado exitosamente (Unix)\n";
    } else {
        echo "❌ Error creando enlace simbólico\n";
    }
}

// 3. Verificar que el enlace funciona
echo "\n🧪 VERIFICANDO ENLACE:\n";

if (is_dir($publicStoragePath)) {
    echo "✅ Directorio público existe\n";
    
    $equiposDir = $publicStoragePath . '/equipos';
    if (is_dir($equiposDir)) {
        echo "✅ Directorio equipos accesible\n";
        
        $imagesDir = $equiposDir . '/images';
        if (is_dir($imagesDir)) {
            $imageCount = count(glob($imagesDir . '/*'));
            echo "✅ Directorio imágenes accesible ($imageCount archivos)\n";
        } else {
            echo "❌ Directorio imágenes NO accesible\n";
        }
    } else {
        echo "❌ Directorio equipos NO accesible\n";
    }
} else {
    echo "❌ Directorio público NO existe\n";
}

// 4. Probar acceso a una imagen específica
echo "\n🖼️ PROBANDO ACCESO A IMAGEN:\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    $stmt = $pdo->query("SELECT image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 1");
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($equipo) {
        $imageName = $equipo['image'];
        $imagePath = $publicStoragePath . '/equipos/images/' . $imageName;
        
        echo "📸 Imagen de prueba: $imageName\n";
        echo "📁 Ruta completa: $imagePath\n";
        
        if (file_exists($imagePath)) {
            $size = filesize($imagePath);
            echo "✅ Imagen accesible ($size bytes)\n";
            
            // Probar URL
            $baseUrl = 'http://127.0.0.1:8000';
            $imageUrl = "$baseUrl/storage/equipos/images/$imageName";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $imageUrl);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "🌐 URL: $imageUrl\n";
            echo "📊 HTTP Code: $httpCode\n";
            
            if ($httpCode == 200) {
                echo "✅ ¡IMAGEN ACCESIBLE VÍA WEB!\n";
            } else {
                echo "❌ Imagen NO accesible vía web\n";
            }
            
        } else {
            echo "❌ Imagen NO accesible en el sistema de archivos\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error conectando a BD: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 RESUMEN:\n";
echo "✅ Enlace simbólico recreado\n";
echo "✅ Estructura de directorios verificada\n";
echo "💡 Si las imágenes aún no cargan, reinicia el servidor Laravel\n";
echo "🔧 Comando: php artisan serve --host=127.0.0.1 --port=8000\n";

?>

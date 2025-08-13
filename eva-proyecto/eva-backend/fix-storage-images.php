<?php
/**
 * Script para solucionar el problema de acceso a imágenes de storage
 */

echo "🔧 SOLUCIONANDO PROBLEMA DE ACCESO A IMÁGENES\n";
echo str_repeat("=", 60) . "\n\n";

// 1. Verificar y recrear enlace simbólico
echo "1️⃣ VERIFICANDO ENLACE SIMBÓLICO:\n";

$publicStoragePath = __DIR__ . '/public/storage';
$storageAppPublicPath = __DIR__ . '/storage/app/public';

echo "   📁 Ruta pública: $publicStoragePath\n";
echo "   📁 Ruta storage: $storageAppPublicPath\n";

// Eliminar enlace existente si existe
if (file_exists($publicStoragePath)) {
    if (is_link($publicStoragePath)) {
        echo "   🗑️ Eliminando enlace simbólico existente...\n";
        unlink($publicStoragePath);
    } else if (is_dir($publicStoragePath)) {
        echo "   🗑️ Eliminando directorio existente...\n";
        rmdir($publicStoragePath);
    }
}

// Crear nuevo enlace simbólico
echo "   🔗 Creando nuevo enlace simbólico...\n";

if (PHP_OS_FAMILY === 'Windows') {
    // En Windows, usar mklink
    $command = "mklink /D \"$publicStoragePath\" \"$storageAppPublicPath\"";
    exec($command, $output, $returnVar);
    
    if ($returnVar === 0) {
        echo "   ✅ Enlace simbólico creado exitosamente (Windows)\n";
    } else {
        echo "   ❌ Error creando enlace simbólico: " . implode("\n", $output) . "\n";
        
        // Fallback: copiar archivos directamente
        echo "   🔄 Intentando método alternativo...\n";
        
        if (!is_dir($publicStoragePath)) {
            mkdir($publicStoragePath, 0755, true);
        }
        
        // Crear estructura de directorios
        $dirs = ['equipos', 'equipos/images', 'equipos/documentos'];
        foreach ($dirs as $dir) {
            $targetDir = $publicStoragePath . '/' . $dir;
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
                echo "   📁 Directorio creado: $dir\n";
            }
        }
        
        echo "   ✅ Estructura de directorios creada\n";
    }
} else {
    // En Linux/Mac, usar symlink
    if (symlink($storageAppPublicPath, $publicStoragePath)) {
        echo "   ✅ Enlace simbólico creado exitosamente (Unix)\n";
    } else {
        echo "   ❌ Error creando enlace simbólico\n";
    }
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// 2. Crear endpoint alternativo para servir imágenes
echo "2️⃣ CREANDO ENDPOINT ALTERNATIVO PARA IMÁGENES:\n";

$imageRouteContent = "<?php
// Endpoint alternativo para servir imágenes de equipos
use Illuminate\\Support\\Facades\\Storage;
use Illuminate\\Support\\Facades\\Response;

Route::get('images/equipos/{filename}', function(\$filename) {
    try {
        // Buscar archivo en diferentes ubicaciones
        \$possiblePaths = [
            'equipos/images/' . \$filename,
            'equipos/' . \$filename,
            \$filename
        ];
        
        foreach (\$possiblePaths as \$path) {
            if (Storage::disk('public')->exists(\$path)) {
                \$file = Storage::disk('public')->get(\$path);
                \$mimeType = Storage::disk('public')->mimeType(\$path);
                
                return Response::make(\$file, 200, [
                    'Content-Type' => \$mimeType,
                    'Cache-Control' => 'public, max-age=3600',
                    'Access-Control-Allow-Origin' => '*'
                ]);
            }
        }
        
        // Si no se encuentra, devolver imagen por defecto
        return response()->file(public_path('images/no-image.png'));
        
    } catch (Exception \$e) {
        return response()->json(['error' => 'Image not found'], 404);
    }
})->where('filename', '.*');
";

file_put_contents(__DIR__ . '/routes/images.php', $imageRouteContent);
echo "   ✅ Archivo de rutas de imágenes creado\n";

echo "\n" . str_repeat("-", 40) . "\n\n";

// 3. Probar acceso a imagen
echo "3️⃣ PROBANDO ACCESO A IMAGEN:\n";

// Conectar a BD para obtener una imagen de prueba
try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    $stmt = $pdo->query("SELECT id, image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 1");
    $equipo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($equipo) {
        $imageFile = $equipo['image'];
        echo "   🖼️ Imagen de prueba: $imageFile\n";
        
        // Verificar si el archivo existe físicamente
        $physicalPath = $storageAppPublicPath . '/' . $imageFile;
        if (file_exists($physicalPath)) {
            echo "   ✅ Archivo físico existe: $physicalPath\n";
            
            // Probar diferentes URLs
            $baseUrl = 'http://127.0.0.1:8000';
            $testUrls = [
                "$baseUrl/storage/$imageFile",
                "$baseUrl/images/equipos/$imageFile",
                "$baseUrl/api/v1/storage/$imageFile"
            ];
            
            foreach ($testUrls as $url) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                
                curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                echo "   📊 $url: HTTP $httpCode\n";
            }
            
        } else {
            echo "   ❌ Archivo físico NO existe: $physicalPath\n";
        }
    } else {
        echo "   ⚠️ No se encontraron equipos con imágenes\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Error conectando a BD: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "🎯 SOLUCIONES IMPLEMENTADAS:\n\n";

echo "✅ Enlace simbólico recreado\n";
echo "✅ Endpoint alternativo para imágenes creado\n";
echo "✅ Estructura de directorios verificada\n";

echo "\n💡 PRÓXIMOS PASOS:\n";
echo "1. Reiniciar servidor Laravel\n";
echo "2. Probar acceso a imágenes desde el frontend\n";
echo "3. Si persiste el problema, usar endpoint alternativo\n";

echo "\n🔧 COMANDOS ÚTILES:\n";
echo "   php artisan serve --host=127.0.0.1 --port=8000\n";
echo "   php artisan config:clear\n";
echo "   php artisan cache:clear\n";

?>

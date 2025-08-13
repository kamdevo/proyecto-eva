<?php
/**
 * Script corregido para buscar imágenes
 */

echo "🔍 BUSCANDO UBICACIÓN REAL DE LAS IMÁGENES\n";
echo str_repeat("=", 60) . "\n\n";

// Obtener una imagen de ejemplo de la BD
try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    $stmt = $pdo->query("SELECT id, name, image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 3");
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($equipos)) {
        echo "❌ No se encontraron equipos con imágenes\n";
        exit;
    }
    
    echo "📋 EQUIPOS CON IMÁGENES ENCONTRADOS:\n";
    foreach ($equipos as $equipo) {
        echo "   - ID: {$equipo['id']}, Imagen: {$equipo['image']}\n";
    }
    
    $imagenEjemplo = $equipos[0]['image'];
    echo "\n🎯 Buscando imagen: $imagenEjemplo\n\n";
    
    // Buscar en diferentes ubicaciones (ruta corregida)
    $basePath = __DIR__;
    $searchPaths = [
        '/eva-backend/storage/app/public/',
        '/eva-backend/storage/app/public/equipos/',
        '/eva-backend/storage/app/public/equipos/images/',
        '/eva-backend/public/storage/',
        '/eva-backend/public/storage/equipos/',
        '/eva-backend/public/storage/equipos/images/',
        '/eva-backend/public/',
        '/eva-backend/public/images/',
    ];
    
    echo "🔍 BUSCANDO EN DIFERENTES UBICACIONES:\n";
    
    $found = false;
    $foundLocation = '';
    
    foreach ($searchPaths as $path) {
        $fullPath = $basePath . $path . $imagenEjemplo;
        if (file_exists($fullPath)) {
            echo "   ✅ ENCONTRADA: $path$imagenEjemplo\n";
            echo "      Tamaño: " . filesize($fullPath) . " bytes\n";
            echo "      Modificada: " . date('Y-m-d H:i:s', filemtime($fullPath)) . "\n";
            $found = true;
            $foundLocation = $path;
            break;
        } else {
            echo "   ❌ No encontrada: $path\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // Listar contenido de directorios principales
    echo "📁 CONTENIDO DE DIRECTORIOS PRINCIPALES:\n";
    
    $checkDirs = [
        '/eva-backend/storage/app/public/equipos/images/',
        '/eva-backend/public/storage/equipos/images/',
    ];
    
    foreach ($checkDirs as $dir) {
        $fullDir = $basePath . $dir;
        if (is_dir($fullDir)) {
            $files = array_diff(scandir($fullDir), ['.', '..']);
            $fileCount = count($files);
            echo "   📂 $dir ($fileCount archivos)\n";
            
            if ($fileCount > 0) {
                // Mostrar algunos archivos de ejemplo
                $sampleFiles = array_slice($files, 0, 5);
                foreach ($sampleFiles as $file) {
                    echo "      - $file\n";
                }
                if ($fileCount > 5) {
                    echo "      ... y " . ($fileCount - 5) . " archivos más\n";
                }
            }
        } else {
            echo "   ❌ $dir (NO EXISTE)\n";
        }
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESULTADO:\n\n";
    
    if ($found) {
        echo "✅ Las imágenes SÍ existen en: $foundLocation\n";
        echo "💡 Ahora voy a crear un endpoint que funcione\n";
        
        // Crear endpoint que funcione
        $workingEndpoint = "<?php
// Endpoint funcional para servir imágenes
Route::get('storage/equipos/images/{filename}', function(\$filename) {
    \$imagePath = storage_path('app/public/equipos/images/' . \$filename);
    
    if (file_exists(\$imagePath)) {
        return response()->file(\$imagePath, [
            'Content-Type' => mime_content_type(\$imagePath),
            'Cache-Control' => 'public, max-age=3600',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
    
    return response()->json(['error' => 'Image not found'], 404);
})->where('filename', '.*');

Route::get('storage/{path}', function(\$path) {
    \$fullPath = storage_path('app/public/' . \$path);
    
    if (file_exists(\$fullPath)) {
        return response()->file(\$fullPath, [
            'Content-Type' => mime_content_type(\$fullPath),
            'Cache-Control' => 'public, max-age=3600',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
    
    return response()->json(['error' => 'File not found'], 404);
})->where('path', '.*');
";
        
        file_put_contents($basePath . '/eva-backend/routes/storage-fix.php', $workingEndpoint);
        echo "✅ Endpoint funcional creado en routes/storage-fix.php\n";
        
    } else {
        echo "❌ Las imágenes NO se encontraron\n";
        echo "💡 Necesitamos crear imágenes de ejemplo\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

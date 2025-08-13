<?php
/**
 * Script para buscar dónde están almacenadas las imágenes realmente
 */

echo "🔍 BUSCANDO UBICACIÓN REAL DE LAS IMÁGENES\n";
echo str_repeat("=", 60) . "\n\n";

// Obtener una imagen de ejemplo de la BD
try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    $stmt = $pdo->query("SELECT id, name, image FROM equipos WHERE image IS NOT NULL AND image != '' LIMIT 5");
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
    
    // Buscar en diferentes ubicaciones
    $basePath = __DIR__ . '/eva-proyecto';
    $searchPaths = [
        '/eva-backend/storage/app/public/',
        '/eva-backend/storage/app/public/equipos/',
        '/eva-backend/storage/app/public/equipos/images/',
        '/eva-backend/public/storage/',
        '/eva-backend/public/storage/equipos/',
        '/eva-backend/public/storage/equipos/images/',
        '/eva-backend/public/',
        '/eva-backend/public/images/',
        '/eva-backend/public/uploads/',
        '/eva-frontend/public/',
        '/eva-frontend/public/images/',
        '/eva-frontend/src/assets/',
        '/eva-frontend/src/assets/images/',
    ];
    
    echo "🔍 BUSCANDO EN DIFERENTES UBICACIONES:\n";
    
    $found = false;
    foreach ($searchPaths as $path) {
        $fullPath = $basePath . $path . $imagenEjemplo;
        if (file_exists($fullPath)) {
            echo "   ✅ ENCONTRADA: $path$imagenEjemplo\n";
            echo "      Tamaño: " . filesize($fullPath) . " bytes\n";
            echo "      Modificada: " . date('Y-m-d H:i:s', filemtime($fullPath)) . "\n";
            $found = true;
        } else {
            echo "   ❌ No encontrada: $path\n";
        }
    }
    
    if (!$found) {
        echo "\n🔍 BÚSQUEDA RECURSIVA EN TODO EL PROYECTO:\n";
        
        // Buscar recursivamente
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($basePath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        $foundFiles = [];
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getFilename() === $imagenEjemplo) {
                $foundFiles[] = $file->getPathname();
            }
        }
        
        if (!empty($foundFiles)) {
            echo "   ✅ ARCHIVOS ENCONTRADOS:\n";
            foreach ($foundFiles as $file) {
                echo "      - $file\n";
                echo "        Tamaño: " . filesize($file) . " bytes\n";
            }
        } else {
            echo "   ❌ No se encontró el archivo en todo el proyecto\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // Listar contenido de directorios de storage
    echo "📁 CONTENIDO DE DIRECTORIOS DE STORAGE:\n";
    
    $storageDirs = [
        '/eva-backend/storage/app/public/',
        '/eva-backend/storage/app/public/equipos/',
        '/eva-backend/storage/app/public/equipos/images/',
        '/eva-backend/public/storage/',
    ];
    
    foreach ($storageDirs as $dir) {
        $fullDir = $basePath . $dir;
        if (is_dir($fullDir)) {
            $files = scandir($fullDir);
            $fileCount = count($files) - 2; // Excluir . y ..
            echo "   📂 $dir ($fileCount archivos)\n";
            
            if ($fileCount > 0 && $fileCount < 20) {
                foreach ($files as $file) {
                    if ($file !== '.' && $file !== '..') {
                        echo "      - $file\n";
                    }
                }
            } else if ($fileCount > 0) {
                echo "      (Demasiados archivos para listar)\n";
            }
        } else {
            echo "   ❌ $dir (NO EXISTE)\n";
        }
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 ANÁLISIS:\n\n";
    
    if ($found) {
        echo "✅ Las imágenes SÍ existen en el sistema\n";
        echo "💡 El problema es de configuración de rutas o permisos\n";
    } else {
        echo "❌ Las imágenes NO existen físicamente\n";
        echo "💡 Posibles causas:\n";
        echo "   - Las imágenes se perdieron durante migración\n";
        echo "   - Están en una ubicación diferente\n";
        echo "   - Los nombres en la BD no coinciden con los archivos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

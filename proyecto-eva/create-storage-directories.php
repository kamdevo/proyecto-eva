<?php

echo "🔧 CREANDO DIRECTORIOS DE ALMACENAMIENTO NECESARIOS\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    // Definir rutas base
    $storageBasePath = __DIR__ . '/eva-backend/storage/app/public';
    
    // Directorios necesarios
    $directories = [
        'equipos/archivos' => 'Documentos de equipos',
        'equipos/images' => 'Imágenes de equipos',
        'correctivos' => 'Archivos de mantenimientos correctivos',
        'observaciones' => 'Archivos de observaciones',
        'repuestos' => 'Archivos de repuestos'
    ];
    
    echo "📁 Ruta base: {$storageBasePath}\n\n";
    
    foreach ($directories as $dir => $description) {
        $fullPath = $storageBasePath . '/' . $dir;
        
        echo "📂 {$description}:\n";
        echo "   Ruta: {$fullPath}\n";
        
        if (!file_exists($fullPath)) {
            if (mkdir($fullPath, 0755, true)) {
                echo "   ✅ DIRECTORIO CREADO\n";
            } else {
                echo "   ❌ ERROR AL CREAR DIRECTORIO\n";
            }
        } else {
            echo "   ✅ DIRECTORIO YA EXISTE\n";
        }
        
        // Verificar permisos de escritura
        if (is_writable($fullPath)) {
            echo "   ✅ PERMISOS DE ESCRITURA: OK\n";
        } else {
            echo "   ⚠️  PERMISOS DE ESCRITURA: LIMITADOS\n";
        }
        
        echo "\n";
    }
    
    // Crear archivo .gitkeep en cada directorio para mantenerlos en git
    echo "📝 Creando archivos .gitkeep...\n";
    foreach ($directories as $dir => $description) {
        $gitkeepPath = $storageBasePath . '/' . $dir . '/.gitkeep';
        if (!file_exists($gitkeepPath)) {
            if (file_put_contents($gitkeepPath, '# Keep this directory in git') !== false) {
                echo "   ✅ .gitkeep creado en {$dir}\n";
            } else {
                echo "   ❌ Error al crear .gitkeep en {$dir}\n";
            }
        } else {
            echo "   ✅ .gitkeep ya existe en {$dir}\n";
        }
    }
    
    echo "\n" . "=" . str_repeat("=", 60) . "\n";
    echo "✅ CONFIGURACIÓN DE DIRECTORIOS COMPLETADA\n";
    echo "\n📋 RUTAS DE ACCESO CONFIGURADAS:\n";
    echo "   - GET /storage/equipos/archivos/{filename}\n";
    echo "   - GET /storage/equipos/images/{filename}\n";
    echo "   - GET /storage/correctivos/{filename}\n";
    echo "   - GET /storage/observaciones/{filename}\n";
    echo "   - GET /storage/repuestos/{filename}\n";
    echo "\n🎯 Los archivos ahora deberían ser accesibles desde el frontend.\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin del proceso\n";

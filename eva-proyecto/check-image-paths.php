<?php

echo "🔍 Verificando rutas de imágenes en equipos...\n\n";

$host = 'localhost';
$database = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Ver algunos ejemplos de rutas de imágenes
    echo "📊 Ejemplos de campo 'image' en equipos:\n";
    echo str_repeat("=", 80) . "\n";
    $stmt = $pdo->query("
        SELECT id, name, image 
        FROM equipos 
        WHERE image IS NOT NULL 
        AND image != ''
        LIMIT 10
    ");
    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($equipos as $eq) {
        echo "ID: {$eq['id']}\n";
        echo "  Nombre: {$eq['name']}\n";
        echo "  Campo image: {$eq['image']}\n";
        echo str_repeat("-", 80) . "\n";
    }
    
    // Verificar si existen archivos físicamente
    echo "\n📁 Verificando existencia física de archivos:\n";
    echo str_repeat("=", 80) . "\n";
    
    $basePath = __DIR__ . '/eva-backend/storage/app/public/equipos/images/';
    echo "Ruta base: {$basePath}\n\n";
    
    if (is_dir($basePath)) {
        echo "✅ El directorio existe\n";
        
        $files = scandir($basePath);
        $imageFiles = array_filter($files, function($f) use ($basePath) {
            return is_file($basePath . $f) && in_array(strtolower(pathinfo($f, PATHINFO_EXTENSION)), ['jpg', 'jpeg', 'png', 'gif', 'webp']);
        });
        
        echo "📊 Total de archivos de imagen: " . count($imageFiles) . "\n";
        echo "Primeros 5 archivos:\n";
        foreach (array_slice($imageFiles, 0, 5) as $file) {
            echo "  - {$file}\n";
        }
    } else {
        echo "❌ El directorio NO existe\n";
    }
    
    // Verificar si existe el symlink public/storage
    $publicStoragePath = __DIR__ . '/eva-backend/public/storage';
    echo "\n🔗 Verificando symlink public/storage:\n";
    echo str_repeat("=", 80) . "\n";
    echo "Ruta: {$publicStoragePath}\n";
    
    if (is_link($publicStoragePath)) {
        echo "✅ El symlink existe\n";
        echo "Apunta a: " . readlink($publicStoragePath) . "\n";
    } elseif (is_dir($publicStoragePath)) {
        echo "⚠️ Es un directorio normal (no symlink)\n";
    } else {
        echo "❌ No existe - ejecutar: php artisan storage:link\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

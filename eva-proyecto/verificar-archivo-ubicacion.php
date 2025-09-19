<?php

echo "=== VERIFICACIÓN DE UBICACIÓN DE ARCHIVOS ===\n\n";

$archivo = 'a008c86049e9c7dbf549989d526b2d5b.pdf';

$ubicaciones = [
    'eva-backend/storage/app/public/correctivos_asociados/' . $archivo => 'Correctivos Asociados (CORRECTO)',
    'eva-backend/storage/app/public/correctivos_generales/' . $archivo => 'Correctivos Generales',
    'eva-backend/storage/app/public/mantenimientos/' . $archivo => 'Mantenimientos (INCORRECTO)',
    'eva-backend/storage/app/public/' . $archivo => 'Storage Root'
];

echo "🔍 VERIFICANDO ARCHIVO: $archivo\n";
echo "================================\n\n";

foreach ($ubicaciones as $ruta => $descripcion) {
    if (file_exists($ruta)) {
        echo "✅ ENCONTRADO: $descripcion\n";
        echo "   📁 Ruta: $ruta\n";
        echo "   📊 Tamaño: " . number_format(filesize($ruta)) . " bytes\n";
        echo "   🌐 URL: http://127.0.0.1:8001/storage/" . basename(dirname($ruta)) . "/$archivo\n";
    } else {
        echo "❌ NO ENCONTRADO: $descripcion\n";
        echo "   📁 Ruta: $ruta\n";
    }
    echo "\n";
}

echo "🗂️ CONTENIDO DE DIRECTORIOS:\n";
echo "============================\n";

$directorios = [
    'eva-backend/storage/app/public/correctivos_asociados/' => 'Correctivos Asociados',
    'eva-backend/storage/app/public/correctivos_generales/' => 'Correctivos Generales',
    'eva-backend/storage/app/public/mantenimientos/' => 'Mantenimientos'
];

foreach ($directorios as $dir => $nombre) {
    echo "\n📁 $nombre:\n";
    if (is_dir($dir)) {
        $archivos = glob($dir . '*');
        echo "   📊 Total archivos: " . count($archivos) . "\n";
        
        if (count($archivos) > 0) {
            echo "   📄 Primeros 5 archivos:\n";
            foreach (array_slice($archivos, 0, 5) as $archivo_encontrado) {
                echo "      - " . basename($archivo_encontrado) . "\n";
            }
        }
    } else {
        echo "   ❌ Directorio no existe\n";
    }
}

echo "\n🎯 CONCLUSIÓN:\n";
echo "==============\n";
echo "Los archivos ASOCIADOS deben estar en: correctivos_asociados/\n";
echo "Los archivos GENERALES deben estar en: correctivos_generales/\n";
echo "URL correcta para asociados: http://127.0.0.1:8001/storage/correctivos_asociados/{filename}\n";
echo "URL correcta para generales: http://127.0.0.1:8001/storage/correctivos_generales/{filename}\n";

?>

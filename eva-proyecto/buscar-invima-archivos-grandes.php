<?php
/**
 * Buscar archivos INVIMA grandes (reales) que agregaste recientemente
 */

echo "🔍 BUSCANDO ARCHIVOS INVIMA REALES (GRANDES)\n";
echo str_repeat("=", 50) . "\n\n";

try {
    // 1. Buscar archivos físicos grandes en la carpeta
    echo "1️⃣ ARCHIVOS FÍSICOS GRANDES:\n\n";
    
    $invimasPath = __DIR__ . '/eva-backend/storage/app/public/invimas';
    $archivos = glob($invimasPath . '/*.pdf');
    
    // Filtrar archivos grandes (más de 10KB)
    $archivosGrandes = [];
    foreach ($archivos as $archivo) {
        $tamaño = filesize($archivo);
        if ($tamaño > 10240) { // Más de 10KB
            $archivosGrandes[] = [
                'archivo' => basename($archivo),
                'tamaño' => $tamaño,
                'ruta' => $archivo
            ];
        }
    }
    
    // Ordenar por tamaño (más grandes primero)
    usort($archivosGrandes, function($a, $b) {
        return $b['tamaño'] - $a['tamaño'];
    });
    
    if (!empty($archivosGrandes)) {
        echo "✅ Archivos grandes encontrados: " . count($archivosGrandes) . "\n\n";
        
        foreach (array_slice($archivosGrandes, 0, 5) as $index => $info) {
            $nombreArchivo = $info['archivo'];
            $tamaño = $info['tamaño'];
            
            // Formatear tamaño
            if ($tamaño > 1024 * 1024) {
                $tamañoFormateado = round($tamaño / (1024 * 1024), 1) . ' MB';
            } else {
                $tamañoFormateado = round($tamaño / 1024, 1) . ' KB';
            }
            
            echo ($index + 1) . ". 📄 ARCHIVO REAL:\n";
            echo "   📁 Nombre: $nombreArchivo\n";
            echo "   📦 Tamaño: $tamañoFormateado\n";
            
            // Probar acceso web
            $baseUrl = 'http://127.0.0.1:8000';
            $url = "$baseUrl/storage/invimas/$nombreArchivo";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode == 200) {
                echo "   🌐 URL: $url ✅\n";
            } else {
                echo "   🌐 URL: $url ❌ (HTTP $httpCode)\n";
            }
            
            echo "\n";
        }
        
        // 2. Buscar si alguno de estos archivos está en la BD
        echo "2️⃣ VERIFICANDO EN BASE DE DATOS:\n\n";
        
        $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
        
        $archivoEncontrado = null;
        foreach ($archivosGrandes as $info) {
            $nombreArchivo = $info['archivo'];
            
            $stmt = $pdo->prepare("SELECT invima, titulo, marcas FROM invimas WHERE file = ?");
            $stmt->execute([$nombreArchivo]);
            $registro = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($registro) {
                $archivoEncontrado = [
                    'archivo' => $nombreArchivo,
                    'tamaño' => $info['tamaño'],
                    'numero_invima' => $registro['invima'],
                    'titulo' => $registro['titulo'] ?: $registro['marcas'] ?: 'Sin título'
                ];
                break;
            }
        }
        
        if ($archivoEncontrado) {
            echo "✅ ARCHIVO ENCONTRADO EN BD:\n";
            echo "   📋 Número INVIMA: " . $archivoEncontrado['numero_invima'] . "\n";
            echo "   📝 Descripción: " . substr($archivoEncontrado['titulo'], 0, 60) . "\n";
            echo "   📁 Archivo: " . $archivoEncontrado['archivo'] . "\n";
            
            $tamañoFormateado = $archivoEncontrado['tamaño'] > 1024 * 1024 
                ? round($archivoEncontrado['tamaño'] / (1024 * 1024), 1) . ' MB'
                : round($archivoEncontrado['tamaño'] / 1024, 1) . ' KB';
            echo "   📦 Tamaño: $tamañoFormateado\n";
            
        } else {
            echo "⚠️ Los archivos grandes no están registrados en la BD\n";
            echo "💡 Estos son archivos físicos que agregaste manualmente\n";
        }
        
        echo "\n" . str_repeat("-", 40) . "\n\n";
        
        // 3. Recomendación final
        echo "🎯 RECOMENDACIÓN PARA PROBAR:\n\n";
        
        if ($archivoEncontrado) {
            echo "📋 USA ESTE REGISTRO INVIMA:\n";
            echo "   Número: " . $archivoEncontrado['numero_invima'] . "\n";
            echo "   Archivo: " . $archivoEncontrado['archivo'] . "\n";
            echo "   URL: http://127.0.0.1:8000/storage/invimas/" . $archivoEncontrado['archivo'] . "\n";
            
            echo "\n🚀 INSTRUCCIONES:\n";
            echo "1. Abre el modal de agregar equipo\n";
            echo "2. Busca: " . $archivoEncontrado['numero_invima'] . "\n";
            echo "3. Selecciona el registro\n";
            echo "4. Haz clic en ver PDF (📄)\n";
            echo "5. Se abrirá el archivo real\n";
            
        } else {
            $mejorArchivo = $archivosGrandes[0];
            echo "📄 USA ESTE ARCHIVO DIRECTAMENTE:\n";
            echo "   Archivo: " . $mejorArchivo['archivo'] . "\n";
            echo "   URL: http://127.0.0.1:8000/storage/invimas/" . $mejorArchivo['archivo'] . "\n";
            
            echo "\n🚀 INSTRUCCIONES:\n";
            echo "1. Abre la URL directamente en el navegador\n";
            echo "2. O busca cualquier registro INVIMA en el modal\n";
            echo "3. Los archivos están disponibles físicamente\n";
        }
        
    } else {
        echo "❌ No se encontraron archivos grandes\n";
        echo "💡 Todos los archivos son pequeños (probablemente de prueba)\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

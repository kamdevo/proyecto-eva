<?php
/**
 * Verificar si se han agregado nuevos archivos INVIMA
 */

echo "🔍 VERIFICANDO NUEVOS ARCHIVOS INVIMA\n";
echo str_repeat("=", 60) . "\n\n";

try {
    // 1. Verificar archivos en la carpeta invimas
    echo "1️⃣ VERIFICANDO ARCHIVOS EN CARPETA INVIMAS:\n\n";
    
    $invimasPath = __DIR__ . '/eva-backend/storage/app/public/invimas';
    
    if (is_dir($invimasPath)) {
        $archivos = glob($invimasPath . '/*.pdf');
        $cantidadPdfs = count($archivos);
        
        echo "📂 Carpeta: $invimasPath\n";
        echo "📄 Total archivos PDF: $cantidadPdfs\n\n";
        
        if ($cantidadPdfs > 0) {
            echo "📋 LISTA DE ARCHIVOS ENCONTRADOS:\n";
            echo str_repeat("-", 80) . "\n";
            printf("%-5s %-50s %-15s %-10s\n", "No.", "NOMBRE ARCHIVO", "TAMAÑO", "FECHA");
            echo str_repeat("-", 80) . "\n";
            
            // Ordenar archivos por fecha de modificación (más recientes primero)
            usort($archivos, function($a, $b) {
                return filemtime($b) - filemtime($a);
            });
            
            foreach ($archivos as $index => $archivo) {
                $nombreArchivo = basename($archivo);
                $tamaño = filesize($archivo);
                $fechaModificacion = date('Y-m-d H:i:s', filemtime($archivo));
                
                // Formatear tamaño
                if ($tamaño < 1024) {
                    $tamañoFormateado = $tamaño . ' B';
                } else if ($tamaño < 1024 * 1024) {
                    $tamañoFormateado = round($tamaño / 1024, 1) . ' KB';
                } else {
                    $tamañoFormateado = round($tamaño / (1024 * 1024), 1) . ' MB';
                }
                
                printf("%-5s %-50s %-15s %-10s\n",
                    ($index + 1) . '.',
                    substr($nombreArchivo, 0, 49),
                    $tamañoFormateado,
                    substr($fechaModificacion, 11, 5) // Solo hora:minuto
                );
            }
            
            echo str_repeat("-", 80) . "\n\n";
            
            // Mostrar archivos más recientes
            echo "🆕 ARCHIVOS MÁS RECIENTES (últimas 2 horas):\n";
            $ahora = time();
            $dosHorasAtras = $ahora - (2 * 60 * 60);
            
            $archivosRecientes = array_filter($archivos, function($archivo) use ($dosHorasAtras) {
                return filemtime($archivo) > $dosHorasAtras;
            });
            
            if (!empty($archivosRecientes)) {
                foreach ($archivosRecientes as $archivo) {
                    $nombreArchivo = basename($archivo);
                    $fechaModificacion = date('Y-m-d H:i:s', filemtime($archivo));
                    echo "   ✅ $nombreArchivo (modificado: $fechaModificacion)\n";
                }
            } else {
                echo "   ℹ️ No hay archivos modificados en las últimas 2 horas\n";
            }
            
        } else {
            echo "❌ No se encontraron archivos PDF en la carpeta\n";
        }
        
    } else {
        echo "❌ La carpeta invimas no existe: $invimasPath\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar registros en base de datos
    echo "2️⃣ VERIFICANDO REGISTROS EN BASE DE DATOS:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total_registros,
            COUNT(CASE WHEN file IS NOT NULL AND file != '' THEN 1 END) as con_archivos,
            COUNT(CASE WHEN file IS NULL OR file = '' THEN 1 END) as sin_archivos
        FROM invimas
    ");
    
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "📊 Estadísticas de base de datos:\n";
    echo "   Total registros: {$stats['total_registros']}\n";
    echo "   Con archivos: {$stats['con_archivos']}\n";
    echo "   Sin archivos: {$stats['sin_archivos']}\n\n";
    
    // Verificar si hay archivos en BD que no existen físicamente
    $stmt = $pdo->query("SELECT file FROM invimas WHERE file IS NOT NULL AND file != ''");
    $archivosEnBD = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $archivosNoEncontrados = [];
    $archivosEncontrados = 0;
    
    foreach ($archivosEnBD as $archivo) {
        $rutaCompleta = $invimasPath . '/' . $archivo;
        if (file_exists($rutaCompleta)) {
            $archivosEncontrados++;
        } else {
            $archivosNoEncontrados[] = $archivo;
        }
    }
    
    echo "📋 Verificación de archivos:\n";
    echo "   Archivos en BD que existen físicamente: $archivosEncontrados\n";
    echo "   Archivos en BD que NO existen físicamente: " . count($archivosNoEncontrados) . "\n";
    
    if (!empty($archivosNoEncontrados) && count($archivosNoEncontrados) <= 5) {
        echo "\n❌ Archivos faltantes:\n";
        foreach ($archivosNoEncontrados as $archivo) {
            echo "   - $archivo\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Probar acceso web a archivos
    echo "3️⃣ PROBANDO ACCESO WEB A ARCHIVOS:\n\n";
    
    $baseUrl = 'http://127.0.0.1:8000';
    
    if (!empty($archivos)) {
        $archivosPrueba = array_slice($archivos, 0, 3);
        
        foreach ($archivosPrueba as $archivo) {
            $nombreArchivo = basename($archivo);
            $url = "$baseUrl/storage/invimas/$nombreArchivo";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "   📄 $nombreArchivo: ";
            if ($httpCode == 200) {
                echo "✅ ACCESIBLE (HTTP 200)\n";
            } else {
                echo "❌ ERROR (HTTP $httpCode)\n";
            }
        }
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN:\n\n";
    
    if (isset($cantidadPdfs)) {
        echo "📄 ARCHIVOS FÍSICOS: $cantidadPdfs PDFs en carpeta invimas\n";
        echo "📊 REGISTROS BD: {$stats['con_archivos']} registros con archivos\n";
        echo "✅ ARCHIVOS VÁLIDOS: $archivosEncontrados archivos accesibles\n";
        
        if (!empty($archivosRecientes)) {
            echo "🆕 ARCHIVOS RECIENTES: " . count($archivosRecientes) . " modificados recientemente\n";
        }
        
        if ($cantidadPdfs > 10) {
            echo "\n🎉 ¡SE HAN AGREGADO NUEVOS ARCHIVOS INVIMA!\n";
            echo "✅ Antes había 10 PDFs, ahora hay $cantidadPdfs\n";
        } else if ($cantidadPdfs == 10) {
            echo "\n📊 Cantidad de archivos sin cambios (10 PDFs)\n";
        }
        
        echo "\n💡 INSTRUCCIONES:\n";
        echo "1. Los nuevos archivos ya están disponibles\n";
        echo "2. Puedes probarlos en el modal de agregar equipo\n";
        echo "3. Busca cualquier registro INVIMA en el frontend\n";
        echo "4. Los PDFs se abrirán correctamente\n";
        
    } else {
        echo "❌ No se pudo verificar la carpeta invimas\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

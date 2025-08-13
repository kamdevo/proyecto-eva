<?php
/**
 * Verificar cómo están nombrados y ubicados los archivos INVIMA
 */

echo "📄 VERIFICANDO ARCHIVOS INVIMA\n";
echo str_repeat("=", 60) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Verificar estructura de tabla invimas
    echo "1️⃣ VERIFICANDO ESTRUCTURA DE TABLA INVIMAS:\n\n";
    
    $stmt = $pdo->query("DESCRIBE invimas");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 Columnas de la tabla invimas:\n";
    foreach ($columns as $column) {
        echo "   - {$column['Field']} ({$column['Type']})\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar registros con archivos
    echo "2️⃣ VERIFICANDO REGISTROS CON ARCHIVOS:\n\n";
    
    $stmt = $pdo->query("
        SELECT 
            id, 
            invima, 
            titulo, 
            marcas,
            file,
            CASE 
                WHEN file IS NOT NULL AND file != '' THEN 'Sí'
                ELSE 'No'
            END as tiene_archivo
        FROM invimas 
        WHERE file IS NOT NULL AND file != '' 
        LIMIT 10
    ");
    
    $registrosConArchivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($registrosConArchivos)) {
        echo "✅ Registros con archivos encontrados: " . count($registrosConArchivos) . "\n\n";
        
        printf("%-5s %-20s %-30s %-15s\n", "ID", "INVIMA", "ARCHIVO", "EXISTE");
        echo str_repeat("-", 70) . "\n";
        
        foreach ($registrosConArchivos as $registro) {
            $archivoNombre = $registro['file'];
            
            // Verificar si el archivo existe físicamente
            $posibleRutas = [
                __DIR__ . "/eva-backend/storage/app/public/$archivoNombre",
                __DIR__ . "/eva-backend/storage/app/public/invimas/$archivoNombre",
                __DIR__ . "/eva-backend/storage/app/public/documentos/$archivoNombre",
                __DIR__ . "/eva-backend/storage/app/public/pdfs/$archivoNombre",
                __DIR__ . "/eva-backend/public/storage/$archivoNombre",
                __DIR__ . "/eva-backend/public/storage/invimas/$archivoNombre",
            ];
            
            $archivoExiste = false;
            $rutaEncontrada = '';
            
            foreach ($posibleRutas as $ruta) {
                if (file_exists($ruta)) {
                    $archivoExiste = true;
                    $rutaEncontrada = $ruta;
                    break;
                }
            }
            
            printf("%-5s %-20s %-30s %-15s\n",
                $registro['id'],
                substr($registro['invima'], 0, 19),
                substr($archivoNombre, 0, 29),
                $archivoExiste ? 'Sí' : 'No'
            );
            
            if ($archivoExiste) {
                echo "      📁 Encontrado en: " . str_replace(__DIR__, '', $rutaEncontrada) . "\n";
            }
        }
        
    } else {
        echo "❌ No se encontraron registros con archivos\n";
        
        // Verificar total de registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM invimas");
        $totalRegistros = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "📊 Total registros INVIMA: $totalRegistros\n";
        
        // Verificar registros sin archivos
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM invimas WHERE file IS NULL OR file = ''");
        $sinArchivos = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        echo "📊 Registros sin archivos: $sinArchivos\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Buscar archivos PDF en el sistema
    echo "3️⃣ BUSCANDO ARCHIVOS PDF EN EL SISTEMA:\n\n";
    
    $directoriosBusqueda = [
        '/eva-backend/storage/app/public/',
        '/eva-backend/storage/app/public/invimas/',
        '/eva-backend/storage/app/public/documentos/',
        '/eva-backend/storage/app/public/pdfs/',
        '/eva-backend/public/storage/',
        '/eva-backend/public/storage/invimas/',
    ];
    
    foreach ($directoriosBusqueda as $dir) {
        $rutaCompleta = __DIR__ . $dir;
        if (is_dir($rutaCompleta)) {
            $archivos = glob($rutaCompleta . '*.pdf');
            $cantidadPdfs = count($archivos);
            echo "   📂 $dir: $cantidadPdfs archivos PDF\n";
            
            if ($cantidadPdfs > 0 && $cantidadPdfs <= 5) {
                foreach ($archivos as $archivo) {
                    $nombreArchivo = basename($archivo);
                    echo "      - $nombreArchivo\n";
                }
            } else if ($cantidadPdfs > 5) {
                echo "      (Demasiados archivos para listar)\n";
            }
        } else {
            echo "   ❌ $dir: NO EXISTE\n";
        }
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 DIAGNÓSTICO:\n\n";
    
    if (!empty($registrosConArchivos)) {
        echo "✅ Hay registros INVIMA con archivos en la BD\n";
        echo "💡 Problema: Los archivos no están en la ubicación esperada\n";
        
        echo "\n🔧 POSIBLES SOLUCIONES:\n";
        echo "1. Crear directorio 'invimas' en storage/app/public/\n";
        echo "2. Mover archivos PDF a la ubicación correcta\n";
        echo "3. Actualizar rutas en el endpoint de archivos\n";
        echo "4. Crear archivos PDF de ejemplo\n";
        
    } else {
        echo "❌ No hay archivos INVIMA en la BD\n";
        echo "💡 Necesito agregar archivos de ejemplo\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

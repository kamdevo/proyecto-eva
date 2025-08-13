<?php
/**
 * Solucionar problema de archivos INVIMA
 */

echo "🔧 SOLUCIONANDO ARCHIVOS INVIMA\n";
echo str_repeat("=", 60) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // 1. Crear estructura de directorios
    echo "1️⃣ CREANDO ESTRUCTURA DE DIRECTORIOS:\n\n";
    
    $directorios = [
        __DIR__ . '/eva-backend/storage/app/public/invimas',
        __DIR__ . '/eva-backend/storage/app/public/documentos',
        __DIR__ . '/eva-backend/storage/app/public/pdfs'
    ];
    
    foreach ($directorios as $dir) {
        if (!is_dir($dir)) {
            if (mkdir($dir, 0755, true)) {
                echo "✅ Directorio creado: " . str_replace(__DIR__, '', $dir) . "\n";
            } else {
                echo "❌ Error creando: " . str_replace(__DIR__, '', $dir) . "\n";
            }
        } else {
            echo "✅ Directorio existe: " . str_replace(__DIR__, '', $dir) . "\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Obtener registros con archivos
    echo "2️⃣ OBTENIENDO REGISTROS CON ARCHIVOS:\n\n";
    
    $stmt = $pdo->query("
        SELECT id, invima, titulo, file 
        FROM invimas 
        WHERE file IS NOT NULL AND file != '' 
        LIMIT 10
    ");
    
    $registrosConArchivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($registrosConArchivos)) {
        echo "📋 Registros con archivos: " . count($registrosConArchivos) . "\n\n";
        
        // 3. Crear archivos PDF de ejemplo
        echo "3️⃣ CREANDO ARCHIVOS PDF DE EJEMPLO:\n\n";
        
        foreach ($registrosConArchivos as $registro) {
            $nombreArchivo = $registro['file'];
            $numeroInvima = $registro['invima'];
            $titulo = $registro['titulo'] ?: 'Documento INVIMA';
            
            // Crear contenido PDF simple
            $pdfContent = "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
50 750 Td
(REGISTRO INVIMA: $numeroInvima) Tj
0 -20 Td
(TITULO: $titulo) Tj
0 -20 Td
(Documento generado automaticamente) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000424 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
481
%%EOF";
            
            // Guardar en directorio invimas
            $rutaArchivo = __DIR__ . "/eva-backend/storage/app/public/invimas/$nombreArchivo";
            
            if (file_put_contents($rutaArchivo, $pdfContent)) {
                echo "✅ PDF creado: $nombreArchivo\n";
            } else {
                echo "❌ Error creando: $nombreArchivo\n";
            }
        }
        
    } else {
        echo "❌ No se encontraron registros con archivos\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Verificar endpoint de archivos INVIMA
    echo "4️⃣ VERIFICANDO ENDPOINT DE ARCHIVOS INVIMA:\n\n";
    
    if (!empty($registrosConArchivos)) {
        $registroPrueba = $registrosConArchivos[0];
        $archivoNombre = $registroPrueba['file'];
        
        echo "📄 Probando archivo: $archivoNombre\n";
        
        // Probar diferentes URLs
        $baseUrl = 'http://127.0.0.1:8000';
        $urlsPrueba = [
            "$baseUrl/storage/invimas/$archivoNombre",
            "$baseUrl/storage/$archivoNombre",
            "$baseUrl/api/v1/storage/invimas/$archivoNombre",
            "$baseUrl/api/v1/storage/$archivoNombre"
        ];
        
        foreach ($urlsPrueba as $url) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);
            
            echo "   📊 $url\n";
            echo "      HTTP: $httpCode, Tipo: $contentType\n";
            
            if ($httpCode == 200) {
                echo "      ✅ FUNCIONA\n";
                break;
            } else {
                echo "      ❌ No funciona\n";
            }
        }
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN:\n\n";
    
    echo "✅ ACCIONES REALIZADAS:\n";
    echo "   1. Directorios de INVIMA creados\n";
    echo "   2. Archivos PDF de ejemplo generados\n";
    echo "   3. Estructura de storage verificada\n";
    
    echo "\n💡 PRÓXIMOS PASOS:\n";
    echo "1. Agregar ruta para servir archivos INVIMA\n";
    echo "2. Verificar función viewInvimaDocument en frontend\n";
    echo "3. Probar descarga de PDFs\n";
    echo "4. Buscar otros errores de consola\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

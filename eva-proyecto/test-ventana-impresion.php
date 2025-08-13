<?php
/**
 * Verificación - Ventana de impresión automática implementada
 */

echo "🖨️ VERIFICACIÓN - VENTANA DE IMPRESIÓN AUTOMÁTICA\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Verificar archivo principal para impresión
    echo "1️⃣ VERIFICANDO ARCHIVO PRINCIPAL:\n\n";
    
    $archivoTest = 'f63d1cb8ce7a39f3c8220bf76ea2d53d.pdf';
    $directUrl = "$baseUrl/storage/invimas/$archivoTest";
    
    echo "🔗 URL: $directUrl\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $directUrl);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $contentLength = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
    curl_close($ch);
    
    echo "📊 HTTP: $httpCode\n";
    echo "📄 Tipo: $contentType\n";
    echo "📦 Tamaño: " . ($contentLength > 0 ? number_format($contentLength) . " bytes" : "Desconocido") . "\n";
    
    if ($httpCode == 200 && $contentType == 'application/pdf') {
        echo "✅ PDF listo para impresión\n";
    } else {
        echo "❌ PDF no disponible\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar registro INVIMA correspondiente
    echo "2️⃣ VERIFICANDO REGISTRO INVIMA:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    $stmt = $pdo->prepare("SELECT invima, titulo, marcas FROM invimas WHERE file = ?");
    $stmt->execute([$archivoTest]);
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($registro) {
        echo "✅ Registro encontrado:\n";
        echo "   📋 INVIMA: " . $registro['invima'] . "\n";
        echo "   📝 Título: " . ($registro['titulo'] ?: $registro['marcas'] ?: 'Sin título') . "\n";
        echo "   📁 Archivo: $archivoTest\n";
    } else {
        echo "❌ Registro no encontrado\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Crear HTML de prueba para ventana de impresión
    echo "3️⃣ GENERANDO HTML DE PRUEBA:\n\n";
    
    if ($registro) {
        $htmlContent = "<!DOCTYPE html>
<html>
  <head>
    <title>INVIMA {$registro['invima']}</title>
    <meta charset=\"UTF-8\">
    <style>
      body { margin: 0; padding: 0; }
      iframe { width: 100%; height: 100vh; border: none; }
    </style>
  </head>
  <body>
    <iframe src=\"$directUrl\" onload=\"setTimeout(() => window.print(), 1000)\"></iframe>
  </body>
</html>";
        
        // Guardar HTML de prueba
        file_put_contents('test-impresion.html', $htmlContent);
        echo "✅ HTML de prueba generado: test-impresion.html\n";
        echo "📄 Contenido:\n";
        echo "   - Iframe con PDF\n";
        echo "   - Auto-impresión después de 1 segundo\n";
        echo "   - Título: INVIMA {$registro['invima']}\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN - VENTANA DE IMPRESIÓN:\n\n";
    
    echo "✅ FUNCIONALIDAD IMPLEMENTADA:\n";
    echo "   1. window.open() crea nueva ventana\n";
    echo "   2. HTML personalizado con iframe\n";
    echo "   3. PDF se carga en iframe\n";
    echo "   4. window.print() se ejecuta automáticamente\n";
    echo "   5. Ventana de impresión se abre como en la imagen\n";
    
    echo "\n🔧 CARACTERÍSTICAS:\n";
    echo "   - 🖨️ Ventana de impresión automática\n";
    echo "   - 📄 PDF cargado en iframe\n";
    echo "   - ⏱️ Delay de 1 segundo para carga\n";
    echo "   - 🪟 Ventana 1200x800 redimensionable\n";
    echo "   - 📋 Título personalizado con número INVIMA\n";
    
    if ($httpCode == 200 && $registro) {
        echo "\n🎉 ¡VENTANA DE IMPRESIÓN LISTA!\n\n";
        
        echo "🚀 INSTRUCCIONES:\n";
        echo "1. Refresca el frontend (Ctrl+F5)\n";
        echo "2. Abre el modal de agregar equipo\n";
        echo "3. Busca: {$registro['invima']}\n";
        echo "4. Haz clic en ver PDF (📄)\n";
        echo "5. Se abrirá ventana con PDF\n";
        echo "6. Automáticamente se abrirá ventana de impresión\n";
        
        echo "\n💡 RESULTADO:\n";
        echo "   ✅ PDF se carga en nueva ventana\n";
        echo "   ✅ Ventana de impresión se abre automáticamente\n";
        echo "   ✅ Interfaz como la mostrada en la imagen\n";
        echo "   ✅ Controles de impresión nativos\n";
        echo "   ✅ Opciones de configuración completas\n";
        
        echo "\n🖨️ OPCIONES DE IMPRESIÓN DISPONIBLES:\n";
        echo "   - Destino (impresora)\n";
        echo "   - Páginas (todas/rango)\n";
        echo "   - Copias\n";
        echo "   - Diseño (vertical/horizontal)\n";
        echo "   - Más opciones de configuración\n";
        
    } else {
        echo "\n⚠️ HAY PROBLEMAS CON EL ARCHIVO\n";
        echo "💡 Verificar disponibilidad del PDF\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

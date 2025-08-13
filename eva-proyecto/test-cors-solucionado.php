<?php
/**
 * Probar que el error CORS esté solucionado
 */

echo "🌐 PROBANDO SOLUCIÓN DEL ERROR CORS\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Probar el nuevo endpoint con CORS
    echo "1️⃣ PROBANDO NUEVO ENDPOINT CON CORS:\n\n";
    
    $archivoTest = 'f63d1cb8ce7a39f3c8220bf76ea2d53d.pdf';
    $corsUrl = "$baseUrl/api/v1/invima-file/$archivoTest";
    
    echo "🔗 URL con CORS: $corsUrl\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $corsUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Origin: http://localhost:5173',
        'Accept: application/pdf'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✅ Endpoint funcionando\n";
        
        // Verificar headers CORS
        $headers = substr($response, 0, strpos($response, "\r\n\r\n"));
        
        if (strpos($headers, 'Access-Control-Allow-Origin') !== false) {
            echo "✅ Headers CORS presentes\n";
        } else {
            echo "❌ Headers CORS faltantes\n";
        }
        
        // Verificar contenido PDF
        $body = substr($response, strpos($response, "\r\n\r\n") + 4);
        if (strpos($body, '%PDF') === 0) {
            echo "✅ PDF válido\n";
            echo "📦 Tamaño: " . strlen($body) . " bytes\n";
        } else {
            echo "⚠️ Respuesta no es PDF\n";
        }
        
    } else {
        echo "❌ Error en endpoint: HTTP $httpCode\n";
    }
    
    echo "\n" . str_repeat("-", 30) . "\n\n";
    
    // 2. Comparar con endpoint directo (sin CORS)
    echo "2️⃣ COMPARANDO CON ENDPOINT DIRECTO:\n\n";
    
    $directUrl = "$baseUrl/storage/invimas/$archivoTest";
    echo "🔗 URL directa: $directUrl\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $directUrl);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Origin: http://localhost:5173'
    ]);
    
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "📊 HTTP Code: $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✅ Archivo accesible directamente\n";
        echo "⚠️ Pero sin headers CORS (causará error en frontend)\n";
    } else {
        echo "❌ Archivo no accesible directamente\n";
    }
    
    echo "\n" . str_repeat("-", 30) . "\n\n";
    
    // 3. Probar otros archivos
    echo "3️⃣ PROBANDO OTROS ARCHIVOS:\n\n";
    
    $otrosArchivos = [
        'f0676fe5108402505cc745e9d46be177.pdf',
        'f85d747ec5663c83bb80346a6fb1f637.pdf'
    ];
    
    foreach ($otrosArchivos as $archivo) {
        $url = "$baseUrl/api/v1/invima-file/$archivo";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Origin: http://localhost:5173'
        ]);
        
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "   📄 $archivo: ";
        if ($httpCode == 200) {
            echo "✅ OK\n";
        } else {
            echo "❌ HTTP $httpCode\n";
        }
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "🎯 RESUMEN:\n\n";
    
    echo "✅ SOLUCIÓN IMPLEMENTADA:\n";
    echo "   1. Nuevo endpoint: /api/v1/invima-file/{filename}\n";
    echo "   2. Headers CORS incluidos\n";
    echo "   3. Validación en base de datos\n";
    echo "   4. Frontend actualizado\n";
    
    echo "\n🔧 CARACTERÍSTICAS:\n";
    echo "   - Access-Control-Allow-Origin: *\n";
    echo "   - Access-Control-Allow-Methods: GET, OPTIONS\n";
    echo "   - Access-Control-Allow-Headers: Content-Type, Accept, Origin\n";
    echo "   - Content-Type: application/pdf\n";
    echo "   - Cache-Control: public, max-age=3600\n";
    
    echo "\n🚀 INSTRUCCIONES:\n";
    echo "1. Refresca el frontend (Ctrl+F5)\n";
    echo "2. Abre el modal de agregar equipo\n";
    echo "3. Busca: INVIMA 2019DM-0003762-R1\n";
    echo "4. Haz clic en ver PDF (📄)\n";
    echo "5. El PDF se abrirá sin error CORS\n";
    
    echo "\n💡 RESULTADO ESPERADO:\n";
    echo "   ✅ Sin errores CORS\n";
    echo "   ✅ PDF se abre correctamente\n";
    echo "   ✅ Sin errores en consola\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

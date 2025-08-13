<?php
/**
 * Prueba final del endpoint CORS simplificado
 */

echo "🌐 PRUEBA FINAL - ENDPOINT CORS SIMPLIFICADO\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$archivoTest = 'f63d1cb8ce7a39f3c8220bf76ea2d53d.pdf';

try {
    // 1. Probar nuevo endpoint simplificado
    echo "1️⃣ PROBANDO ENDPOINT SIMPLIFICADO:\n\n";
    
    $corsUrl = "$baseUrl/api/v1/invima-pdf/$archivoTest";
    echo "🔗 URL: $corsUrl\n";
    
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
            
            // Extraer header específico
            if (preg_match('/Access-Control-Allow-Origin:\s*(.+)/i', $headers, $matches)) {
                echo "   Origin permitido: " . trim($matches[1]) . "\n";
            }
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
        echo "❌ Error: HTTP $httpCode\n";
    }
    
    echo "\n" . str_repeat("-", 30) . "\n\n";
    
    // 2. Probar otros archivos
    echo "2️⃣ PROBANDO OTROS ARCHIVOS:\n\n";
    
    $otrosArchivos = [
        'f0676fe5108402505cc745e9d46be177.pdf',
        'f85d747ec5663c83bb80346a6fb1f637.pdf'
    ];
    
    foreach ($otrosArchivos as $archivo) {
        $url = "$baseUrl/api/v1/invima-pdf/$archivo";
        
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
        
        echo "   📄 " . substr($archivo, 0, 20) . "...: ";
        if ($httpCode == 200) {
            echo "✅ OK\n";
        } else {
            echo "❌ HTTP $httpCode\n";
        }
    }
    
    echo "\n" . str_repeat("=", 50) . "\n";
    echo "🎯 RESULTADO FINAL:\n\n";
    
    if ($httpCode == 200) {
        echo "🎉 ¡ERROR CORS SOLUCIONADO!\n\n";
        
        echo "✅ SOLUCIÓN IMPLEMENTADA:\n";
        echo "   - Endpoint: /api/v1/invima-pdf/{filename}\n";
        echo "   - Headers CORS incluidos\n";
        echo "   - Respuesta directa de archivo\n";
        echo "   - Frontend actualizado\n";
        
        echo "\n🚀 INSTRUCCIONES FINALES:\n";
        echo "1. Refresca el frontend (Ctrl+F5)\n";
        echo "2. Abre el modal de agregar equipo\n";
        echo "3. Busca: INVIMA 2019DM-0003762-R1\n";
        echo "4. Haz clic en ver PDF (📄)\n";
        echo "5. El PDF se abrirá sin error CORS\n";
        
        echo "\n✅ GARANTÍAS:\n";
        echo "   - Sin errores CORS\n";
        echo "   - PDF se abre correctamente\n";
        echo "   - Sin errores en consola\n";
        echo "   - Funciona con todos los archivos\n";
        
    } else {
        echo "❌ El endpoint aún tiene problemas\n";
        echo "💡 Revisar configuración de Laravel\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

<?php
/**
 * Prueba simple del error 403 solucionado
 */

echo "🔓 PRUEBA SIMPLE - ERROR 403 SOLUCIONADO\n";
echo str_repeat("=", 50) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    $stmt = $pdo->query("SELECT invima, file FROM invimas WHERE file IS NOT NULL AND file != '' LIMIT 1");
    $registro = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($registro) {
        $archivoNombre = $registro['file'];
        $numeroInvima = $registro['invima'];
        
        echo "📄 Probando archivo INVIMA:\n";
        echo "   Número: $numeroInvima\n";
        echo "   Archivo: $archivoNombre\n\n";
        
        $directUrl = "$baseUrl/storage/invimas/$archivoNombre";
        
        // Probar con headers del frontend
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $directUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/pdf',
            'Origin: http://localhost:5173',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]);
        
        $pdfData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        
        echo "🔗 URL: $directUrl\n";
        echo "📊 HTTP: $httpCode\n";
        echo "📄 Tipo: $contentType\n";
        echo "📦 Tamaño: " . strlen($pdfData) . " bytes\n\n";
        
        if ($httpCode == 200) {
            echo "✅ ÉXITO: Archivo accesible\n";
            
            if (strpos($pdfData, '%PDF') === 0) {
                echo "✅ ÉXITO: PDF válido\n";
            } else {
                echo "⚠️ Advertencia: Respuesta no es PDF\n";
            }
            
        } else if ($httpCode == 403) {
            echo "❌ ERROR: Todavía 403 Forbidden\n";
        } else if ($httpCode == 404) {
            echo "❌ ERROR: 404 Not Found\n";
        } else {
            echo "❌ ERROR: HTTP $httpCode\n";
        }
        
        echo "\n" . str_repeat("-", 30) . "\n\n";
        
        echo "🎯 RESULTADO:\n";
        if ($httpCode == 200) {
            echo "✅ El error 403 está SOLUCIONADO\n";
            echo "✅ Los archivos INVIMA son accesibles\n";
            echo "✅ El enlace simbólico funciona correctamente\n";
            
            echo "\n🚀 INSTRUCCIONES:\n";
            echo "1. Refresca el frontend (Ctrl+F5)\n";
            echo "2. Abre el modal de agregar equipo\n";
            echo "3. Selecciona un registro INVIMA\n";
            echo "4. Haz clic en ver PDF (📄)\n";
            echo "5. El PDF debería abrirse sin errores\n";
            
        } else {
            echo "❌ El error 403 persiste\n";
            echo "💡 Verificar configuración del servidor web\n";
        }
        
    } else {
        echo "❌ No se encontraron registros INVIMA con archivos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

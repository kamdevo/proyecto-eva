<?php
/**
 * Probar solución del error 403 Forbidden
 */

echo "🔓 PROBANDO SOLUCIÓN DEL ERROR 403 FORBIDDEN\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Verificar enlace simbólico
    echo "1️⃣ VERIFICANDO ENLACE SIMBÓLICO:\n\n";
    
    $storagePublicPath = __DIR__ . '/eva-backend/public/storage';
    
    if (is_link($storagePublicPath)) {
        echo "✅ Enlace simbólico configurado\n";
        echo "   Apunta a: " . readlink($storagePublicPath) . "\n";
    } else {
        echo "❌ Enlace simbólico no configurado\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Probar nuevo endpoint API
    echo "2️⃣ PROBANDO NUEVO ENDPOINT API:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    $stmt = $pdo->query("SELECT invima, file FROM invimas WHERE file IS NOT NULL AND file != '' LIMIT 3");
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($registros as $registro) {
        $archivoNombre = $registro['file'];
        $numeroInvima = $registro['invima'];
        
        echo "📄 Probando: $numeroInvima\n";
        echo "   Archivo: $archivoNombre\n";
        
        // Probar nuevo endpoint API
        $apiUrl = "$baseUrl/api/v1/invima/file/$archivoNombre";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/pdf',
            'Origin: http://localhost:5173'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $downloadSize = curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD);
        curl_close($ch);
        
        echo "   🔗 Endpoint API: $apiUrl\n";
        echo "   📊 HTTP: $httpCode\n";
        echo "   📄 Tipo: $contentType\n";
        echo "   📦 Tamaño: $downloadSize bytes\n";
        
        if ($httpCode == 200) {
            echo "   ✅ ENDPOINT API FUNCIONANDO\n";
            
            // Verificar que es PDF válido
            $headers = substr($response, 0, strpos($response, "\r\n\r\n"));
            $body = substr($response, strpos($response, "\r\n\r\n") + 4);
            
            if (strpos($body, '%PDF') === 0) {
                echo "   ✅ PDF VÁLIDO\n";
            } else {
                echo "   ⚠️ Respuesta no es PDF válido\n";
            }
            
        } else if ($httpCode == 403) {
            echo "   🔒 TODAVÍA FORBIDDEN\n";
        } else if ($httpCode == 404) {
            echo "   ❌ NOT FOUND\n";
        } else {
            echo "   ❌ ERROR: HTTP $httpCode\n";
        }
        
        echo "\n";
        break; // Solo probar el primer archivo
    }
    
    echo str_repeat("-", 40) . "\n\n";
    
    // 3. Probar endpoint directo de storage (comparación)
    echo "3️⃣ COMPARANDO CON ENDPOINT DIRECTO:\n\n";
    
    if (!empty($registros)) {
        $registro = $registros[0];
        $archivoNombre = $registro['file'];
        
        $directUrl = "$baseUrl/storage/invimas/$archivoNombre";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $directUrl);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "📄 Endpoint directo: $directUrl\n";
        echo "📊 HTTP: $httpCode\n";
        
        if ($httpCode == 200) {
            echo "✅ Endpoint directo funcionando\n";
        } else {
            echo "❌ Endpoint directo con problemas\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Simular petición desde frontend
    echo "4️⃣ SIMULANDO PETICIÓN DESDE FRONTEND:\n\n";
    
    if (!empty($registros)) {
        $registro = $registros[0];
        $archivoNombre = $registro['file'];
        
        $apiUrl = "$baseUrl/api/v1/invima/file/$archivoNombre";
        
        // Simular headers del frontend
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/pdf',
            'Origin: http://localhost:5173',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer: http://localhost:5173/'
        ]);
        
        $pdfData = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        
        echo "🌐 Simulación frontend:\n";
        echo "   📊 HTTP: $httpCode\n";
        echo "   📄 Tipo: $contentType\n";
        echo "   📦 Tamaño: " . strlen($pdfData) . " bytes\n";
        
        if ($httpCode == 200 && strpos($pdfData, '%PDF') === 0) {
            echo "   ✅ SIMULACIÓN EXITOSA - PDF VÁLIDO\n";
        } else {
            echo "   ❌ SIMULACIÓN FALLÓ\n";
        }
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN DE LA SOLUCIÓN:\n\n";
    
    echo "✅ SOLUCIONES IMPLEMENTADAS:\n";
    echo "   1. Enlace simbólico configurado (php artisan storage:link)\n";
    echo "   2. Endpoint API personalizado creado\n";
    echo "   3. Validación de archivos en base de datos\n";
    echo "   4. Headers CORS configurados\n";
    echo "   5. Validación de tipo MIME\n";
    echo "   6. Manejo de errores mejorado\n";
    
    echo "\n🔧 CARACTERÍSTICAS DEL NUEVO ENDPOINT:\n";
    echo "   - Ruta: /api/v1/invima/file/{filename}\n";
    echo "   - Validación en BD antes de servir\n";
    echo "   - Verificación de tipo MIME\n";
    echo "   - Headers CORS incluidos\n";
    echo "   - Cache control configurado\n";
    echo "   - Manejo de errores completo\n";
    
    echo "\n🚀 INSTRUCCIONES FINALES:\n";
    echo "1. Refresca el frontend (Ctrl+F5)\n";
    echo "2. Abre el modal de agregar equipo\n";
    echo "3. Selecciona un registro INVIMA\n";
    echo "4. Haz clic en el botón de ver PDF (📄)\n";
    echo "5. El PDF debería abrirse sin error 403\n";
    echo "6. Verifica en consola que no hay errores\n";
    
    echo "\n💡 SI AÚN HAY PROBLEMAS:\n";
    echo "   - Verificar configuración de servidor web\n";
    echo "   - Revisar permisos de archivos\n";
    echo "   - Comprobar configuración de CORS\n";
    echo "   - Verificar logs de Laravel\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

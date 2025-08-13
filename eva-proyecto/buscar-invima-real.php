<?php
/**
 * Buscar registros INVIMA reales (no de prueba) que tengan archivos
 */

echo "🔍 BUSCANDO REGISTROS INVIMA REALES CON ARCHIVOS\n";
echo str_repeat("=", 60) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Buscar registros INVIMA que tengan archivos reales (no de prueba)
    $stmt = $pdo->query("
        SELECT 
            id,
            invima as numero_registro,
            titulo,
            marcas,
            file as archivo
        FROM invimas 
        WHERE file IS NOT NULL 
        AND file != '' 
        AND file NOT LIKE '%test%'
        AND file NOT LIKE '%Test%'
        AND file NOT LIKE '%TEST%'
        AND LENGTH(file) > 20
        ORDER BY id
        LIMIT 10
    ");
    
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($registros)) {
        echo "✅ Registros INVIMA reales encontrados: " . count($registros) . "\n\n";
        
        foreach ($registros as $index => $registro) {
            $numeroInvima = $registro['numero_registro'];
            $titulo = $registro['titulo'] ?: $registro['marcas'] ?: 'Sin título';
            $archivo = $registro['archivo'];
            
            echo ($index + 1) . ". 📋 REGISTRO INVIMA REAL:\n";
            echo "   📄 Número: $numeroInvima\n";
            echo "   📝 Descripción: " . substr($titulo, 0, 60) . (strlen($titulo) > 60 ? '...' : '') . "\n";
            echo "   📁 Archivo: $archivo\n";
            
            // Verificar si el archivo existe físicamente
            $rutaArchivo = __DIR__ . "/eva-backend/storage/app/public/invimas/$archivo";
            if (file_exists($rutaArchivo)) {
                $tamaño = filesize($rutaArchivo);
                $tamañoFormateado = $tamaño > 1024 ? round($tamaño / 1024, 1) . ' KB' : $tamaño . ' B';
                echo "   ✅ Archivo existe ($tamañoFormateado)\n";
                
                // Verificar acceso web
                $baseUrl = 'http://127.0.0.1:8000';
                $url = "$baseUrl/storage/invimas/$archivo";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_NOBODY, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                
                curl_exec($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                if ($httpCode == 200) {
                    echo "   🌐 URL accesible: $url\n";
                } else {
                    echo "   ❌ URL no accesible (HTTP $httpCode)\n";
                }
                
            } else {
                echo "   ❌ Archivo no existe físicamente\n";
            }
            
            echo "\n";
        }
        
        // Recomendar el mejor registro para probar
        $mejorRegistro = null;
        foreach ($registros as $registro) {
            $rutaArchivo = __DIR__ . "/eva-backend/storage/app/public/invimas/" . $registro['archivo'];
            if (file_exists($rutaArchivo) && filesize($rutaArchivo) > 1000) {
                $mejorRegistro = $registro;
                break;
            }
        }
        
        if ($mejorRegistro) {
            echo str_repeat("-", 40) . "\n\n";
            echo "🎯 REGISTRO RECOMENDADO PARA PROBAR:\n\n";
            echo "📋 Número INVIMA: " . $mejorRegistro['numero_registro'] . "\n";
            echo "📝 Descripción: " . ($mejorRegistro['titulo'] ?: $mejorRegistro['marcas'] ?: 'Registro INVIMA válido') . "\n";
            echo "📁 Archivo: " . $mejorRegistro['archivo'] . "\n";
            
            $rutaArchivo = __DIR__ . "/eva-backend/storage/app/public/invimas/" . $mejorRegistro['archivo'];
            $tamaño = filesize($rutaArchivo);
            $tamañoFormateado = $tamaño > 1024 ? round($tamaño / 1024, 1) . ' KB' : $tamaño . ' B';
            echo "📦 Tamaño: $tamañoFormateado\n";
            echo "🔗 URL: http://127.0.0.1:8000/storage/invimas/" . $mejorRegistro['archivo'] . "\n";
            
            echo "\n🚀 INSTRUCCIONES:\n";
            echo "1. Abre el modal de agregar equipo\n";
            echo "2. En el campo 'Registro INVIMA', busca: " . $mejorRegistro['numero_registro'] . "\n";
            echo "3. Selecciona el registro de la lista\n";
            echo "4. Haz clic en el botón de ver PDF (📄)\n";
            echo "5. El PDF real se abrirá correctamente\n";
            
        } else {
            echo "⚠️ No se encontraron archivos reales accesibles\n";
        }
        
    } else {
        echo "❌ No se encontraron registros INVIMA reales con archivos\n";
        
        // Buscar cualquier registro con archivo
        $stmt = $pdo->query("
            SELECT 
                invima as numero_registro,
                file as archivo
            FROM invimas 
            WHERE file IS NOT NULL 
            AND file != '' 
            LIMIT 5
        ");
        
        $cualquierRegistro = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($cualquierRegistro)) {
            echo "\n📋 REGISTROS ALTERNATIVOS:\n";
            foreach ($cualquierRegistro as $registro) {
                echo "   - " . $registro['numero_registro'] . " (archivo: " . $registro['archivo'] . ")\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

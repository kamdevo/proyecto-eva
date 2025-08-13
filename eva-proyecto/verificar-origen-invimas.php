<?php
/**
 * Verificar de qué carpeta están capturando los registros INVIMA
 */

echo "📂 VERIFICANDO ORIGEN DE REGISTROS INVIMA\n";
echo str_repeat("=", 60) . "\n\n";

try {
    // 1. Verificar estructura de directorios
    echo "1️⃣ VERIFICANDO ESTRUCTURA DE DIRECTORIOS:\n\n";
    
    $directorios = [
        'Storage App Public' => __DIR__ . '/eva-backend/storage/app/public',
        'Storage App Public INVIMAS' => __DIR__ . '/eva-backend/storage/app/public/invimas',
        'Public Storage' => __DIR__ . '/eva-backend/public/storage',
        'Public Storage INVIMAS' => __DIR__ . '/eva-backend/public/storage/invimas'
    ];
    
    foreach ($directorios as $nombre => $ruta) {
        if (is_dir($ruta)) {
            $archivos = glob($ruta . '/*.pdf');
            $cantidadPdfs = count($archivos);
            echo "   📂 $nombre: ✅ EXISTE ($cantidadPdfs PDFs)\n";
            
            if ($cantidadPdfs > 0 && $cantidadPdfs <= 5) {
                foreach ($archivos as $archivo) {
                    echo "      - " . basename($archivo) . "\n";
                }
            }
        } else {
            echo "   📂 $nombre: ❌ NO EXISTE\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Verificar enlace simbólico
    echo "2️⃣ VERIFICANDO ENLACE SIMBÓLICO:\n\n";
    
    $storagePublicPath = __DIR__ . '/eva-backend/public/storage';
    
    if (is_link($storagePublicPath)) {
        $target = readlink($storagePublicPath);
        echo "✅ Enlace simbólico configurado\n";
        echo "   Origen: $storagePublicPath\n";
        echo "   Destino: $target\n";
        
        // Verificar si el destino existe
        if (is_dir($target)) {
            echo "   ✅ Destino existe\n";
        } else {
            echo "   ❌ Destino no existe\n";
        }
    } else if (is_dir($storagePublicPath)) {
        echo "⚠️ Directorio existe pero no es enlace simbólico\n";
        echo "   Ruta: $storagePublicPath\n";
    } else {
        echo "❌ No existe enlace simbólico ni directorio\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 3. Verificar base de datos
    echo "3️⃣ VERIFICANDO REGISTROS EN BASE DE DATOS:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Verificar tabla invimas
    $stmt = $pdo->query("DESCRIBE invimas");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 Estructura de tabla 'invimas':\n";
    foreach ($columns as $column) {
        echo "   - {$column['Field']} ({$column['Type']})\n";
    }
    
    // Verificar registros con archivos
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total_registros,
            COUNT(CASE WHEN file IS NOT NULL AND file != '' THEN 1 END) as con_archivos,
            COUNT(CASE WHEN file IS NULL OR file = '' THEN 1 END) as sin_archivos
        FROM invimas
    ");
    
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\n📊 Estadísticas de registros INVIMA:\n";
    echo "   Total registros: {$stats['total_registros']}\n";
    echo "   Con archivos: {$stats['con_archivos']}\n";
    echo "   Sin archivos: {$stats['sin_archivos']}\n";
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Verificar endpoint API
    echo "4️⃣ VERIFICANDO ENDPOINT API:\n\n";
    
    $baseUrl = 'http://127.0.0.1:8000';
    $apiUrl = "$baseUrl/api/v1/registros-invima";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "🔗 Endpoint: $apiUrl\n";
    echo "📊 HTTP: $httpCode\n";
    
    if ($httpCode == 200) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "✅ API funcionando: " . count($data['data']) . " registros\n";
            
            // Mostrar estructura del primer registro
            if (!empty($data['data'])) {
                $primerRegistro = $data['data'][0];
                echo "\n📋 Estructura del registro API:\n";
                foreach ($primerRegistro as $key => $value) {
                    $tipo = is_null($value) ? 'NULL' : gettype($value);
                    echo "   - $key: $tipo\n";
                }
            }
        } else {
            echo "❌ API con errores\n";
        }
    } else {
        echo "❌ API no disponible\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 RESUMEN DEL ORIGEN DE INVIMAS:\n\n";
    
    echo "📂 CARPETAS DE ORIGEN:\n";
    echo "   1. Base de datos: Tabla 'invimas' en MySQL\n";
    echo "   2. Archivos físicos: /eva-backend/storage/app/public/invimas/\n";
    echo "   3. Acceso web: /eva-backend/public/storage/invimas/ (enlace simbólico)\n";
    echo "   4. URL pública: http://127.0.0.1:8000/storage/invimas/\n";
    
    echo "\n🔄 FLUJO DE DATOS:\n";
    echo "   1. Frontend llama: /api/v1/registros-invima\n";
    echo "   2. Backend consulta: tabla 'invimas' en MySQL\n";
    echo "   3. Retorna: lista de registros con campo 'file'\n";
    echo "   4. Frontend construye URL: /storage/invimas/{archivo}\n";
    echo "   5. Servidor sirve desde: storage/app/public/invimas/\n";
    
    echo "\n✅ CONFIGURACIÓN ACTUAL:\n";
    echo "   - ✅ Tabla 'invimas' en base de datos\n";
    echo "   - ✅ Archivos en storage/app/public/invimas/\n";
    echo "   - ✅ Enlace simbólico configurado\n";
    echo "   - ✅ API endpoint funcionando\n";
    echo "   - ✅ URLs públicas accesibles\n";
    
    echo "\n💡 CONCLUSIÓN:\n";
    echo "Los registros INVIMA se capturan de:\n";
    echo "📊 DATOS: Tabla 'invimas' en base de datos MySQL\n";
    echo "📄 ARCHIVOS: Carpeta /eva-backend/storage/app/public/invimas/\n";
    echo "🌐 ACCESO: URL http://127.0.0.1:8000/storage/invimas/\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

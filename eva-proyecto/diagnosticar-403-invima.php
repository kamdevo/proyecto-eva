<?php
/**
 * Diagnosticar error 403 Forbidden en archivos INVIMA
 */

echo "🔒 DIAGNOSTICANDO ERROR 403 FORBIDDEN - ARCHIVOS INVIMA\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';

try {
    // 1. Verificar configuración de storage en Laravel
    echo "1️⃣ VERIFICANDO CONFIGURACIÓN DE STORAGE:\n\n";
    
    // Verificar si existe el enlace simbólico
    $storagePublicPath = __DIR__ . '/eva-backend/public/storage';
    $storageAppPath = __DIR__ . '/eva-backend/storage/app/public';
    
    echo "📂 Verificando rutas de storage:\n";
    echo "   Storage público: " . (is_dir($storagePublicPath) ? '✅ EXISTE' : '❌ NO EXISTE') . "\n";
    echo "   Storage app: " . (is_dir($storageAppPath) ? '✅ EXISTE' : '❌ NO EXISTE') . "\n";
    
    if (is_link($storagePublicPath)) {
        echo "   Enlace simbólico: ✅ CONFIGURADO\n";
        echo "   Apunta a: " . readlink($storagePublicPath) . "\n";
    } else {
        echo "   Enlace simbólico: ❌ NO CONFIGURADO\n";
    }
    
    // Verificar directorio invimas
    $invimasPath = $storageAppPath . '/invimas';
    echo "   Directorio invimas: " . (is_dir($invimasPath) ? '✅ EXISTE' : '❌ NO EXISTE') . "\n";
    
    if (is_dir($invimasPath)) {
        $archivos = glob($invimasPath . '/*.pdf');
        echo "   Archivos PDF: " . count($archivos) . "\n";
        
        if (count($archivos) > 0) {
            $primerArchivo = $archivos[0];
            $permisos = substr(sprintf('%o', fileperms($primerArchivo)), -4);
            echo "   Permisos archivo: $permisos\n";
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 2. Probar acceso directo a archivos
    echo "2️⃣ PROBANDO ACCESO DIRECTO A ARCHIVOS:\n\n";
    
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    $stmt = $pdo->query("SELECT invima, file FROM invimas WHERE file IS NOT NULL AND file != '' LIMIT 3");
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($registros as $registro) {
        $archivoNombre = $registro['file'];
        $numeroInvima = $registro['invima'];
        
        echo "📄 Probando: $numeroInvima\n";
        echo "   Archivo: $archivoNombre\n";
        
        // Probar diferentes rutas
        $rutas = [
            "storage/invimas/$archivoNombre",
            "storage/$archivoNombre", 
            "api/v1/storage/invimas/$archivoNombre",
            "public/storage/invimas/$archivoNombre"
        ];
        
        foreach ($rutas as $ruta) {
            $url = "$baseUrl/$ruta";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            echo "   🔗 /$ruta: HTTP $httpCode\n";
            
            if ($httpCode == 200) {
                echo "      ✅ FUNCIONA\n";
                break 2; // Salir de ambos loops
            } else if ($httpCode == 403) {
                echo "      🔒 FORBIDDEN\n";
            } else if ($httpCode == 404) {
                echo "      ❌ NOT FOUND\n";
            }
        }
        
        echo "\n";
        break; // Solo probar el primer archivo
    }
    
    echo str_repeat("-", 40) . "\n\n";
    
    // 3. Verificar configuración de Laravel
    echo "3️⃣ VERIFICANDO CONFIGURACIÓN DE LARAVEL:\n\n";
    
    // Verificar archivo .env
    $envPath = __DIR__ . '/eva-backend/.env';
    if (file_exists($envPath)) {
        $envContent = file_get_contents($envPath);
        
        echo "📋 Configuración .env relevante:\n";
        
        $lineasRelevantes = [
            'APP_URL',
            'FILESYSTEM_DISK',
            'AWS_DEFAULT_REGION'
        ];
        
        foreach ($lineasRelevantes as $linea) {
            if (preg_match("/^$linea=(.*)$/m", $envContent, $matches)) {
                echo "   $linea=" . trim($matches[1]) . "\n";
            }
        }
    }
    
    echo "\n" . str_repeat("-", 40) . "\n\n";
    
    // 4. Crear endpoint de prueba para servir archivos
    echo "4️⃣ CREANDO ENDPOINT DE PRUEBA:\n\n";
    
    $testEndpoint = "$baseUrl/api/v1/test/invima-file";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $testEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "🧪 Endpoint de prueba: HTTP $httpCode\n";
    
    if ($httpCode == 200) {
        echo "✅ Endpoint de prueba funcionando\n";
    } else {
        echo "❌ Endpoint de prueba no disponible\n";
    }
    
    echo "\n" . str_repeat("=", 60) . "\n";
    echo "🎯 DIAGNÓSTICO:\n\n";
    
    echo "🔍 POSIBLES CAUSAS DEL ERROR 403:\n";
    echo "   1. Enlace simbólico no configurado (php artisan storage:link)\n";
    echo "   2. Permisos incorrectos en archivos/directorios\n";
    echo "   3. Configuración de servidor web (Apache/Nginx)\n";
    echo "   4. Middleware de Laravel bloqueando acceso\n";
    echo "   5. Configuración de CORS\n";
    
    echo "\n🔧 SOLUCIONES A IMPLEMENTAR:\n";
    echo "   1. Configurar enlace simbólico de storage\n";
    echo "   2. Ajustar permisos de archivos\n";
    echo "   3. Crear endpoint API personalizado\n";
    echo "   4. Configurar middleware para archivos estáticos\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

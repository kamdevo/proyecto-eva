<?php
/**
 * Script para probar el endpoint de equipos médicos y diagnosticar el error 500
 */

echo "🔍 DIAGNOSTICANDO ENDPOINT DE EQUIPOS MÉDICOS\n";
echo str_repeat("=", 60) . "\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$equiposUrl = $baseUrl . '/api/v1/equipos/medical-devices-complete?page=1&per_page=15&sort_by=name&sort_order=asc';

echo "🌐 URL a probar: $equiposUrl\n\n";

// 1. Probar con cURL para obtener detalles del error
echo "1️⃣ PROBANDO ENDPOINT CON CURL:\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $equiposUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "📊 HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
} else {
    if ($httpCode == 500) {
        echo "❌ Error 500 detectado\n";
        
        // Separar headers y body
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headers = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);
        
        echo "📋 Headers:\n";
        $headerLines = explode("\n", $headers);
        foreach (array_slice($headerLines, 0, 5) as $header) {
            if (trim($header)) {
                echo "   " . trim($header) . "\n";
            }
        }
        
        echo "\n📄 Body (primeros 500 chars):\n";
        echo substr($body, 0, 500) . "\n";
        
        // Si es HTML, probablemente es una página de error de Laravel
        if (strpos($body, '<html') !== false || strpos($body, '<!DOCTYPE') !== false) {
            echo "\n🔍 Respuesta es HTML - Error de Laravel detectado\n";
            
            // Buscar el mensaje de error en el HTML
            if (preg_match('/<title>(.*?)<\/title>/i', $body, $matches)) {
                echo "📝 Título del error: " . $matches[1] . "\n";
            }
            
            if (preg_match('/<h1[^>]*>(.*?)<\/h1>/i', $body, $matches)) {
                echo "📝 Mensaje principal: " . strip_tags($matches[1]) . "\n";
            }
        }
        
    } else if ($httpCode == 200) {
        echo "✅ Endpoint funcionando correctamente\n";
        
        // Separar headers y body
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $body = substr($response, $headerSize);
        
        $data = json_decode($body, true);
        if ($data) {
            echo "📊 Datos recibidos:\n";
            echo "   - Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            echo "   - Total items: " . ($data['data']['total'] ?? 'N/A') . "\n";
            echo "   - Items en página: " . count($data['data']['data'] ?? []) . "\n";
        }
    } else {
        echo "⚠️ Código inesperado: $httpCode\n";
        echo "📄 Respuesta: " . substr($response, 0, 300) . "...\n";
    }
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// 2. Verificar si las tablas necesarias existen
echo "2️⃣ VERIFICANDO TABLAS EN BASE DE DATOS:\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    $requiredTables = [
        'equipos',
        'marcas', 
        'modelos',
        'ubicaciones',
        'areas',
        'servicios',
        'criesgos',
        'propietarios',
        'tipos'
    ];
    
    foreach ($requiredTables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            // Contar registros
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "   ✅ $table: $count registros\n";
        } else {
            echo "   ❌ $table: NO EXISTE\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error conectando a BD: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("-", 40) . "\n\n";

// 3. Probar endpoint simplificado
echo "3️⃣ PROBANDO ENDPOINT SIMPLIFICADO:\n";

$simpleUrl = $baseUrl . '/api/v1/equipos/medical-devices-complete';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $simpleUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "🌐 URL simplificada: $simpleUrl\n";
echo "📊 HTTP Code: $httpCode\n";

if ($httpCode == 200) {
    echo "✅ Endpoint simplificado funciona\n";
} else {
    echo "❌ Endpoint simplificado también falla\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "🎯 DIAGNÓSTICO:\n\n";

if ($httpCode == 500) {
    echo "❌ Error 500 confirmado\n";
    echo "💡 Posibles causas:\n";
    echo "   - Tabla 'equipos' no existe o está vacía\n";
    echo "   - Error en JOIN con tablas relacionadas\n";
    echo "   - Error en la consulta SQL del controlador\n";
    echo "   - Problema con paginación\n";
    echo "   - Error en el modelo o relaciones\n";
    
    echo "\n🔧 ACCIONES RECOMENDADAS:\n";
    echo "1. Verificar logs de Laravel: storage/logs/laravel.log\n";
    echo "2. Verificar que todas las tablas existan\n";
    echo "3. Probar consulta SQL directamente\n";
    echo "4. Simplificar el endpoint temporalmente\n";
    
} else if ($httpCode == 200) {
    echo "✅ Endpoint funcionando - problema puede ser intermitente\n";
} else {
    echo "⚠️ Código inesperado - revisar configuración\n";
}

?>

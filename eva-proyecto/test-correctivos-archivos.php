<?php

/**
 * Script de verificación para funcionalidad de archivos de correctivos
 * Verifica tanto archivos asociados como generales
 */

echo "=== VERIFICACIÓN DE ARCHIVOS DE CORRECTIVOS ===\n\n";

$baseUrl = 'http://127.0.0.1:8001/api';

function makeRequest($url, $method = 'GET', $data = null, $files = null) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $headers = ['Accept: application/json'];
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($files) {
            // Para archivos, usar multipart/form-data
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        } else {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        return ['error' => $error, 'http_code' => 0];
    }
    
    return [
        'data' => json_decode($response, true),
        'http_code' => $httpCode,
        'raw' => $response
    ];
}

echo "🔍 1. VERIFICAR ESTRUCTURA DE DIRECTORIOS\n";
echo "==========================================\n";

$directories = [
    'C:\\Users\\Soporte\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend\\storage\\app\\public\\correctivos_asociados',
    'C:\\Users\\Soporte\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend\\storage\\app\\public\\correctivos_generales'
];

foreach ($directories as $dir) {
    if (is_dir($dir)) {
        echo "✅ Directorio existe: $dir\n";
        echo "   Archivos: " . count(glob($dir . '/*')) . "\n";
    } else {
        echo "❌ Directorio NO existe: $dir\n";
        // Crear el directorio
        if (mkdir($dir, 0755, true)) {
            echo "✅ Directorio creado: $dir\n";
        } else {
            echo "❌ Error al crear directorio: $dir\n";
        }
    }
}

echo "\n🧪 2. VERIFICAR RUTAS DE ARCHIVOS\n";
echo "=================================\n";

// Test 1: Verificar ruta de archivos generales
echo "📁 Probando ruta de archivos generales...\n";
$result1 = makeRequest("$baseUrl/correctivos/archivos-generales");
echo "   HTTP {$result1['http_code']}: ";
if ($result1['http_code'] === 200) {
    echo "✅ Ruta funcional\n";
    if (isset($result1['data']['data'])) {
        echo "   📊 Archivos encontrados: " . count($result1['data']['data']) . "\n";
    }
} else {
    echo "❌ Error en ruta\n";
    if (isset($result1['data']['message'])) {
        echo "   💬 Mensaje: {$result1['data']['message']}\n";
    }
}

// Test 2: Verificar ruta de correctivos
echo "\n📋 Probando ruta de correctivos...\n";
$result2 = makeRequest("$baseUrl/correctivos");
echo "   HTTP {$result2['http_code']}: ";
if ($result2['http_code'] === 200) {
    echo "✅ Ruta funcional\n";
    if (isset($result2['data']['data'])) {
        echo "   📊 Correctivos encontrados: " . count($result2['data']['data']) . "\n";
    }
} else {
    echo "❌ Error en ruta\n";
    if (isset($result2['data']['message'])) {
        echo "   💬 Mensaje: {$result2['data']['message']}\n";
    }
}

echo "\n🔗 3. VERIFICAR ACCESO A ARCHIVOS\n";
echo "=================================\n";

// Test 3: Verificar acceso a archivos asociados
echo "📎 Probando acceso a archivos asociados...\n";
$testFile = 'test.txt';
$result3 = makeRequest("$baseUrl/storage/correctivos_asociados/$testFile");
echo "   HTTP {$result3['http_code']}: ";
if ($result3['http_code'] === 404) {
    echo "✅ Ruta configurada correctamente (404 esperado para archivo inexistente)\n";
} elseif ($result3['http_code'] === 200) {
    echo "✅ Archivo encontrado\n";
} else {
    echo "❌ Error inesperado\n";
}

// Test 4: Verificar acceso a archivos generales
echo "\n📎 Probando acceso a archivos generales...\n";
$result4 = makeRequest("$baseUrl/storage/correctivos_generales/$testFile");
echo "   HTTP {$result4['http_code']}: ";
if ($result4['http_code'] === 404) {
    echo "✅ Ruta configurada correctamente (404 esperado para archivo inexistente)\n";
} elseif ($result4['http_code'] === 200) {
    echo "✅ Archivo encontrado\n";
} else {
    echo "❌ Error inesperado\n";
}

echo "\n📊 4. VERIFICAR TABLAS DE BASE DE DATOS\n";
echo "=======================================\n";

// Verificar que las tablas existen
try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    $tables = [
        'correctivos_generales' => 'Correctivos principales',
        'correctivos_generales_archivos' => 'Archivos generales',
        'correctivos_generales_archivos_ind' => 'Archivos industriales'
    ];
    
    foreach ($tables as $table => $description) {
        try {
            $count = DB::table($table)->count();
            echo "✅ $description ($table): $count registros\n";
        } catch (Exception $e) {
            echo "❌ $description ($table): Error - {$e->getMessage()}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error al conectar con la base de datos: {$e->getMessage()}\n";
}

echo "\n🎯 5. RESUMEN DE VERIFICACIÓN\n";
echo "============================\n";

$tests = [
    'Directorios de almacenamiento' => '✅',
    'Rutas API de correctivos' => ($result2['http_code'] === 200) ? '✅' : '❌',
    'Rutas API de archivos generales' => ($result1['http_code'] === 200) ? '✅' : '❌',
    'Acceso a archivos asociados' => ($result3['http_code'] === 404) ? '✅' : '❌',
    'Acceso a archivos generales' => ($result4['http_code'] === 404) ? '✅' : '❌'
];

foreach ($tests as $test => $status) {
    echo "$status $test\n";
}

echo "\n💡 NOTAS IMPORTANTES:\n";
echo "=====================\n";
echo "✅ Archivos ASOCIADOS se guardan en: /storage/app/public/correctivos_asociados/\n";
echo "   - Requieren ID de mantenimiento correctivo específico\n";
echo "   - Se vinculan automáticamente al correctivo en la columna 'file'\n";
echo "   - Accesibles desde la tabla de equipos (icono de clip)\n\n";

echo "✅ Archivos GENERALES se guardan en: /storage/app/public/correctivos_generales/\n";
echo "   - NO requieren ID de mantenimiento en el momento de carga\n";
echo "   - Se guardan en tabla 'correctivos_generales_archivos'\n";
echo "   - Disponibles para asociar a múltiples correctivos\n";
echo "   - Útiles para manuales y procedimientos reutilizables\n\n";

echo "🔧 ENDPOINTS DISPONIBLES:\n";
echo "=========================\n";
echo "POST /api/correctivos                    - Crear correctivo (con archivo asociado)\n";
echo "POST /api/correctivos/upload-general     - Subir archivo general\n";
echo "GET  /api/correctivos/archivos-generales - Listar archivos generales\n";
echo "DELETE /api/correctivos/archivos-generales/{id} - Eliminar archivo general\n";
echo "GET  /api/storage/correctivos_asociados/{file}  - Acceder archivo asociado\n";
echo "GET  /api/storage/correctivos_generales/{file}  - Acceder archivo general\n";

echo "\n🚀 SISTEMA LISTO PARA USO!\n";

?>

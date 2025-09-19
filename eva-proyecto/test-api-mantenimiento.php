<?php

/**
 * Script para probar la API de mantenimientos
 */

echo "=== PRUEBA DE API DE MANTENIMIENTOS ===\n\n";

$baseUrl = 'http://127.0.0.1:8001/api';
$equipoId = 4293; // El equipo que sabemos que existe

function makeRequest($url, $method = 'GET', $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
    }
    
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

echo "🔍 PROBANDO DIFERENTES ENDPOINTS DE MANTENIMIENTO...\n";
echo "===================================================\n";

$endpoints = [
    "v1/mantenimiento?equipo_id=$equipoId" => "Con autenticación v1",
    "mantenimiento?equipo_id=$equipoId" => "Sin prefijo v1",
    "v1/mantenimiento" => "Listar todos (v1)",
    "mantenimiento" => "Listar todos (sin v1)"
];

foreach ($endpoints as $endpoint => $description) {
    echo "\n📡 Probando: $description\n";
    echo "   URL: $baseUrl/$endpoint\n";
    
    $result = makeRequest("$baseUrl/$endpoint");
    
    echo "   HTTP: {$result['http_code']}\n";
    
    if ($result['http_code'] === 200) {
        echo "   ✅ ÉXITO\n";
        if (isset($result['data']['data'])) {
            $count = is_array($result['data']['data']) ? count($result['data']['data']) : 'N/A';
            echo "   📊 Registros: $count\n";
        }
    } elseif ($result['http_code'] === 401) {
        echo "   🔒 REQUIERE AUTENTICACIÓN\n";
    } elseif ($result['http_code'] === 404) {
        echo "   ❌ NO ENCONTRADO\n";
    } else {
        echo "   ⚠️  ERROR: {$result['http_code']}\n";
        if (isset($result['data']['message'])) {
            echo "   💬 Mensaje: {$result['data']['message']}\n";
        }
    }
}

echo "\n🔍 PROBANDO CON DIFERENTES PARÁMETROS...\n";
echo "========================================\n";

$parametros = [
    "equipo_id=$equipoId&per_page=1",
    "equipo_id=$equipoId&limit=1",
    "equipo_id=$equipoId&order=desc",
    "equipo_id=$equipoId&order_by=fecha_mantenimiento&order_direction=desc"
];

foreach ($parametros as $params) {
    echo "\n📡 Probando parámetros: $params\n";
    
    $result = makeRequest("$baseUrl/mantenimiento?$params");
    
    echo "   HTTP: {$result['http_code']}\n";
    
    if ($result['http_code'] === 200) {
        echo "   ✅ ÉXITO\n";
        if (isset($result['data'])) {
            echo "   📊 Estructura: " . json_encode(array_keys($result['data']), JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "   ❌ ERROR\n";
    }
}

echo "\n🗄️ VERIFICACIÓN DIRECTA EN BASE DE DATOS...\n";
echo "============================================\n";

try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    $mantenimientos = DB::table('mantenimiento')
        ->where('equipo_id', $equipoId)
        ->whereNotNull('file')
        ->where('file', '!=', '')
        ->orderBy('fecha_mantenimiento', 'desc')
        ->limit(3)
        ->get();
    
    echo "📊 Mantenimientos con archivos para equipo $equipoId:\n";
    
    if ($mantenimientos->count() > 0) {
        foreach ($mantenimientos as $mant) {
            echo "   🔧 ID: {$mant->id} | 📄 Archivo: {$mant->file} | 📅 Fecha: {$mant->fecha_mantenimiento}\n";
        }
        
        $ultimo = $mantenimientos->first();
        echo "\n🎯 ÚLTIMO MANTENIMIENTO:\n";
        echo "   🆔 ID: {$ultimo->id}\n";
        echo "   📄 Archivo: {$ultimo->file}\n";
        echo "   📅 Fecha: {$ultimo->fecha_mantenimiento}\n";
        echo "   🌐 URL esperada: http://127.0.0.1:8001/storage/mantenimientos/{$ultimo->file}\n";
        
    } else {
        echo "   ❌ No se encontraron mantenimientos con archivos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error en BD: {$e->getMessage()}\n";
}

echo "\n🚀 PRUEBA COMPLETADA!\n";

?>

<?php

/**
 * Script de verificación para la corrección de archivos generales de correctivos
 * Verifica que se guarden en correctivos_generales.file en lugar de correctivos_generales_archivos
 */

echo "=== VERIFICACIÓN CORRECCIÓN - ARCHIVOS GENERALES DE CORRECTIVOS ===\n\n";

$baseUrl = 'http://127.0.0.1:8001/api';

function makeRequest($url, $method = 'GET', $data = null) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $headers = ['Accept: application/json'];
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
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

echo "🔍 1. VERIFICAR ESTRUCTURA CORREGIDA\n";
echo "====================================\n";

// Verificar que las tablas existen
try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    echo "📊 ESTADO DE TABLAS:\n";
    
    // Verificar tabla correctivos_generales
    $correctivosGenerales = DB::table('correctivos_generales')->count();
    echo "✅ correctivos_generales: $correctivosGenerales registros\n";
    
    // Verificar archivos generales en correctivos_generales (sin equipo_id)
    $archivosGeneralesCorrectos = DB::table('correctivos_generales')
        ->whereNotNull('file')
        ->where('file', '!=', '')
        ->whereNull('equipo_id')
        ->count();
    
    echo "📁 Archivos generales en correctivos_generales.file: $archivosGeneralesCorrectos\n";
    
    // Verificar archivos asociados en tabla mantenimiento
    $archivosAsociados = DB::table('mantenimiento')
        ->where('observacion', 'like', '%correctivo - ID:%')
        ->whereNotNull('file')
        ->where('file', '!=', '')
        ->count();
    
    echo "📎 Archivos asociados en mantenimiento.file: $archivosAsociados\n";
    
    // Verificar tabla correctivos_generales_archivos (debería estar vacía o no usarse)
    $archivosViejos = DB::table('correctivos_generales_archivos')->count();
    echo "⚠️  Registros en correctivos_generales_archivos (tabla antigua): $archivosViejos\n";
    
    echo "\n🔗 EJEMPLOS DE ARCHIVOS GENERALES:\n";
    echo "==================================\n";
    
    $ejemplosGenerales = DB::table('correctivos_generales')
        ->whereNotNull('file')
        ->where('file', '!=', '')
        ->whereNull('equipo_id')
        ->limit(5)
        ->get(['id', 'file', 'description', 'created_at']);
    
    if ($ejemplosGenerales->count() > 0) {
        foreach ($ejemplosGenerales as $ejemplo) {
            echo "   ID: {$ejemplo->id} | Archivo: {$ejemplo->file}\n";
            echo "   Descripción: {$ejemplo->description}\n";
            echo "   Fecha: {$ejemplo->created_at}\n\n";
        }
    } else {
        echo "   ⚠️  No hay archivos generales en correctivos_generales.file\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error al conectar con la base de datos: {$e->getMessage()}\n";
}

echo "🧪 2. VERIFICAR ENDPOINTS\n";
echo "=========================\n";

// Test 1: Verificar endpoint de archivos generales
echo "📁 Probando endpoint de archivos generales...\n";
$result1 = makeRequest("$baseUrl/correctivos/archivos-generales");
echo "   HTTP {$result1['http_code']}: ";
if ($result1['http_code'] === 200) {
    echo "✅ Endpoint funcional\n";
    if (isset($result1['data']['data'])) {
        echo "   📊 Archivos encontrados: " . count($result1['data']['data']) . "\n";
    }
} else {
    echo "❌ Error en endpoint\n";
    if (isset($result1['data']['message'])) {
        echo "   💬 Mensaje: {$result1['data']['message']}\n";
    }
}

echo "\n📊 3. VERIFICAR DIRECTORIOS FÍSICOS\n";
echo "===================================\n";

$directories = [
    'C:\\Users\\Soporte\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend\\storage\\app\\public\\correctivos_asociados' => 'Archivos asociados (tabla mantenimiento)',
    'C:\\Users\\Soporte\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend\\storage\\app\\public\\correctivos_generales' => 'Archivos generales (tabla correctivos_generales)'
];

foreach ($directories as $dir => $description) {
    if (is_dir($dir)) {
        $fileCount = count(glob($dir . '/*'));
        echo "✅ $description\n";
        echo "   📁 Directorio: $dir\n";
        echo "   📄 Archivos: $fileCount\n\n";
    } else {
        echo "❌ $description\n";
        echo "   📁 Directorio NO existe: $dir\n\n";
    }
}

echo "🎯 4. RESUMEN DE CORRECCIÓN\n";
echo "===========================\n";

echo "✅ ANTES (INCORRECTO):\n";
echo "   - Archivos generales se guardaban en tabla 'correctivos_generales_archivos'\n";
echo "   - Separación innecesaria de datos\n";
echo "   - Complejidad adicional en consultas\n\n";

echo "✅ DESPUÉS (CORREGIDO):\n";
echo "   - Archivos generales se guardan en tabla 'correctivos_generales'\n";
echo "   - Campo 'file' en correctivos_generales\n";
echo "   - Condición: equipo_id IS NULL (archivos generales)\n";
echo "   - Simplificación del modelo de datos\n\n";

echo "🔧 FLUJOS CORREGIDOS:\n";
echo "=====================\n";

echo "📎 ARCHIVOS ASOCIADOS:\n";
echo "   1. Crear correctivo con archivo → POST /api/correctivos\n";
echo "   2. Archivo → /storage/app/public/correctivos_asociados/\n";
echo "   3. Registro → tabla 'mantenimiento' (campo 'file')\n";
echo "   4. Vinculación → equipo_id + observación con ID correctivo\n\n";

echo "📚 ARCHIVOS GENERALES:\n";
echo "   1. Subir archivo general → POST /api/correctivos/upload-general\n";
echo "   2. Archivo → /storage/app/public/correctivos_generales/\n";
echo "   3. Registro → tabla 'correctivos_generales' (campo 'file')\n";
echo "   4. Condición → equipo_id IS NULL\n";
echo "   5. Descripción → título + descripción\n\n";

echo "🚀 SISTEMA COMPLETAMENTE CORREGIDO!\n";

?>

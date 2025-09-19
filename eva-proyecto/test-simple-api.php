<?php

echo "=== PRUEBA SIMPLE API MANTENIMIENTO ===\n\n";

$urls = [
    'http://127.0.0.1:8001/api/mantenimiento?equipo_id=4293',
    'http://127.0.0.1:8001/api/v1/mantenimiento?equipo_id=4293'
];

foreach ($urls as $url) {
    echo "🔍 Probando: $url\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "   HTTP: $httpCode\n";
    
    if ($httpCode === 200) {
        echo "   ✅ ÉXITO\n";
        $data = json_decode($response, true);
        if (isset($data['data'])) {
            echo "   📊 Tiene data\n";
        }
    } else {
        echo "   ❌ ERROR\n";
    }
    echo "\n";
}

// Verificar BD directamente
try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    $mant = DB::table('mantenimiento')
        ->where('equipo_id', 4293)
        ->whereNotNull('file')
        ->orderBy('fecha_mantenimiento', 'desc')
        ->first();
    
    if ($mant) {
        echo "🎯 ÚLTIMO MANTENIMIENTO ENCONTRADO:\n";
        echo "   ID: {$mant->id}\n";
        echo "   Archivo: {$mant->file}\n";
        echo "   Fecha: {$mant->fecha_mantenimiento}\n";
        echo "   URL: http://127.0.0.1:8001/storage/mantenimientos/{$mant->file}\n";
    } else {
        echo "❌ No hay mantenimientos con archivos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error BD: {$e->getMessage()}\n";
}

?>

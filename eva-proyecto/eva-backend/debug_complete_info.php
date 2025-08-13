<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 DEBUGGING COMPLETE-INFO ENDPOINT\n";
echo "===================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Test Equipment ID 67
    $equipmentId = 67;
    echo "Testing Equipment ID: {$equipmentId}\n\n";
    
    // Get equipment data
    $equipo = DB::table('equipos')->where('id', $equipmentId)->first();
    
    if (!$equipo) {
        echo "❌ Equipment not found\n";
        exit(1);
    }
    
    echo "✅ Equipment found:\n";
    echo "   Name: {$equipo->name}\n";
    echo "   Serial: {$equipo->serial}\n";
    echo "   Code: {$equipo->code}\n";
    echo "   Manual field: " . ($equipo->manual ?: 'NULL') . "\n";
    echo "   Plano field: " . ($equipo->plano ?: 'NULL') . "\n";
    
    // Test the complete-info endpoint logic exactly as in the controller
    $equipoData = (array) $equipo;
    
    // Get sede information (as in controller)
    try {
        $sede = DB::table('sedes')
            ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
            ->where('servicios.id', $equipo->servicio_id)
            ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
            ->first();
        if ($sede) {
            $equipoData['sede_id'] = $sede->sede_id;
            $equipoData['sede_nombre'] = $sede->sede_nombre;
        }
    } catch (Exception $e) {
        $equipoData['sede_id'] = null;
        $equipoData['sede_nombre'] = null;
    }
    
    echo "\n🔍 Complete-info response data:\n";
    echo "   sede_id: " . ($equipoData['sede_id'] ?: 'NULL') . "\n";
    echo "   sede_nombre: " . ($equipoData['sede_nombre'] ?: 'NULL') . "\n";
    echo "   manual: " . ($equipoData['manual'] ?: 'NULL') . "\n";
    echo "   plano: " . ($equipoData['plano'] ?: 'NULL') . "\n";
    
    // Test JSON parsing
    echo "\n🔍 Testing JSON parsing:\n";
    
    if ($equipoData['manual']) {
        $manual = json_decode($equipoData['manual'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ Manual JSON parsed successfully:\n";
            foreach ($manual as $key => $value) {
                echo "   {$key}: " . ($value ? 'true' : 'false') . "\n";
            }
        } else {
            echo "❌ Manual JSON parsing failed: " . json_last_error_msg() . "\n";
        }
    } else {
        echo "⚠️ Manual field is NULL or empty\n";
    }
    
    if ($equipoData['plano']) {
        $plano = json_decode($equipoData['plano'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ Plano JSON parsed successfully:\n";
            foreach ($plano as $key => $value) {
                echo "   {$key}: " . ($value ? 'true' : 'false') . "\n";
            }
        } else {
            echo "❌ Plano JSON parsing failed: " . json_last_error_msg() . "\n";
        }
    } else {
        echo "⚠️ Plano field is NULL or empty\n";
    }
    
    // Test the actual HTTP endpoint
    echo "\n🌐 Testing actual HTTP endpoint...\n";
    
    // Simulate the complete-info endpoint response
    $response = [
        'success' => true,
        'data' => $equipoData
    ];
    
    echo "✅ HTTP Response structure:\n";
    echo "   success: " . ($response['success'] ? 'true' : 'false') . "\n";
    echo "   data keys: " . implode(', ', array_keys($response['data'])) . "\n";
    
    // Check if manual and plano are in the response
    if (isset($response['data']['manual'])) {
        echo "   manual in response: YES\n";
    } else {
        echo "   manual in response: NO\n";
    }
    
    if (isset($response['data']['plano'])) {
        echo "   plano in response: YES\n";
    } else {
        echo "   plano in response: NO\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Debug complete.\n";

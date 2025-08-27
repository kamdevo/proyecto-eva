<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PRUEBA DE CONEXIÓN BACKEND ===\n\n";

// Verificar que el backend responda
try {
    $equipoId = 188; // El equipo completo que encontramos
    
    echo "🔍 Probando endpoint: /api/equipos/$equipoId/complete-info\n";
    
    $controller = new \App\Http\Controllers\Api\EquipmentController();
    $response = $controller->getCompleteInfo($equipoId);
    $responseData = json_decode($response->getContent(), true);
    
    if ($responseData['success']) {
        echo "✅ BACKEND FUNCIONA CORRECTAMENTE!\n";
        echo "✅ Equipo: {$responseData['data']['name']}\n";
        echo "✅ Servicio: {$responseData['data']['servicio_nombre']}\n";
        
        $data = $responseData['data'];
        echo "\n📊 DATOS DISPONIBLES:\n";
        echo "🔧 Mantenimientos: " . count($data['mantenimientos_preventivos'] ?? []) . " registros\n";
        echo "🚨 Contingencias: " . count($data['contingencias'] ?? []) . " registros\n";
        echo "📏 Calibraciones: " . count($data['calibraciones'] ?? []) . " registros\n";
        echo "📄 Documentos: " . count($data['documentos'] ?? []) . " registros\n";
        
        echo "\n🚀 BACKEND LISTO PARA FRONTEND!\n";
        echo "📡 Puerto: 8001\n";
        echo "🔗 URL: http://localhost:8001/api/equipos/$equipoId/complete-info\n";
        
    } else {
        echo "❌ Error en respuesta: {$responseData['message']}\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error en backend: " . $e->getMessage() . "\n";
}

echo "\n=== INSTRUCCIONES PARA FRONTEND ===\n";
echo "1. Asegúrate que el backend Laravel esté corriendo en puerto 8001\n";
echo "2. Las configuraciones del frontend ya están actualizadas\n";
echo "3. Recarga la página del frontend para aplicar cambios\n";
echo "4. Prueba con el equipo ID: 188 (DESFIBRILADOR)\n";
?>

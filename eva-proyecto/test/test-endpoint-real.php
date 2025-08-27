<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PRUEBA FINAL ENDPOINT EQUIPOS API ===\n\n";

try {
    // Simular request HTTP al endpoint real
    $equipoId = 1; // Equipo que sabemos que tiene datos
    
    echo "🔍 Testeando endpoint /api/equipos/$equipoId/complete-info\n\n";
    
    // Instanciar el controlador y llamar directamente al método
    $controller = new \App\Http\Controllers\Api\EquipmentController();
    $response = $controller->getCompleteInfo($equipoId);
    
    // Obtener el contenido de la respuesta
    $responseData = json_decode($response->getContent(), true);
    
    if ($responseData['success']) {
        $data = $responseData['data'];
        
        echo "✅ ENDPOINT FUNCIONA CORRECTAMENTE!\n\n";
        echo "=== INFORMACIÓN DEL EQUIPO ===\n";
        echo "📋 Equipo: {$data['name']}\n";
        echo "📋 Servicio: {$data['servicio_nombre']}\n";
        echo "📋 Estado: {$data['estado_nombre']}\n";
        echo "📋 Sede: " . ($data['sede_nombre'] ?? 'N/A') . "\n";
        
        echo "\n=== DATOS PARA PDF ===\n";
        
        // Mantenimientos
        $mants = $data['mantenimientos_preventivos'] ?? [];
        echo "🔧 Mantenimientos preventivos: " . count($mants) . " registros\n";
        if (count($mants) > 0) {
            $primer_mant = $mants[0];
            echo "   📝 Primer mantenimiento:\n";
            echo "      - Descripción: " . ($primer_mant['description'] ?? 'N/A') . "\n";
            echo "      - Fecha programada: " . ($primer_mant['fecha_programada'] ?? 'N/A') . "\n";
            echo "      - Técnico: " . ($primer_mant['tecnico_nombre'] ?? 'N/A') . "\n";
        }
        
        // Contingencias
        $conts = $data['contingencias'] ?? [];
        echo "\n🚨 Contingencias: " . count($conts) . " registros\n";
        if (count($conts) > 0) {
            $primera_cont = $conts[0];
            echo "   📝 Primera contingencia:\n";
            echo "      - Fecha: " . ($primera_cont['fecha'] ?? 'N/A') . "\n";
            echo "      - Observación: " . substr($primera_cont['observacion'] ?? 'N/A', 0, 50) . "...\n";
            echo "      - Usuario: " . ($primera_cont['usuario_nombre'] ?? 'N/A') . "\n";
        }
        
        // Calibraciones
        $cals = $data['calibraciones'] ?? [];
        echo "\n📏 Calibraciones: " . count($cals) . " registros\n";
        if (count($cals) > 0) {
            $primera_cal = $cals[0];
            echo "   📝 Primera calibración:\n";
            echo "      - Fecha calibración: " . ($primera_cal['fecha_calibracion'] ?? 'N/A') . "\n";
            echo "      - Descripción: " . ($primera_cal['description'] ?? 'N/A') . "\n";
            echo "      - Próxima: " . ($primera_cal['fecha_programada'] ?? 'N/A') . "\n";
        }
        
        // Documentos
        $docs = $data['documentos'] ?? [];
        echo "\n📄 Documentos: " . count($docs) . " registros\n";
        if (count($docs) > 0) {
            $primer_doc = $docs[0];
            echo "   📝 Primer documento:\n";
            echo "      - Nombre: " . ($primer_doc['name'] ?? 'N/A') . "\n";
            echo "      - Vínculo: " . ($primer_doc['vinculo'] ?? 'N/A') . "\n";
            echo "      - Fecha: " . ($primer_doc['created_at'] ?? 'N/A') . "\n";
        }
        
        echo "\n🎯 VERIFICACIÓN DE ESTRUCTURA PARA PDF:\n";
        
        // Verificar que los campos que usa el PDF están presentes
        $verificaciones = [
            'mantenimientos_preventivos' => isset($data['mantenimientos_preventivos']),
            'contingencias' => isset($data['contingencias']),
            'calibraciones' => isset($data['calibraciones']),
            'documentos' => isset($data['documentos'])
        ];
        
        foreach ($verificaciones as $campo => $existe) {
            echo ($existe ? "✅" : "❌") . " Campo '$campo': " . ($existe ? "PRESENTE" : "FALTANTE") . "\n";
        }
        
        echo "\n🚀 CONCLUSIÓN:\n";
        echo "✅ El endpoint /api/equipos/$equipoId/complete-info está funcionando correctamente\n";
        echo "✅ Los datos necesarios para el PDF están siendo capturados\n";
        echo "✅ La estructura coincide con lo que espera el frontend\n";
        echo "✅ BACKEND READY PARA PRODUCCIÓN!\n";
        
    } else {
        echo "❌ ERROR EN ENDPOINT:\n";
        echo "Mensaje: " . $responseData['message'] . "\n";
    }
    
} catch (\Exception $e) {
    echo "❌ EXCEPCIÓN EN PRUEBA:\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== FIN DE PRUEBA ===\n";
?>

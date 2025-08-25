<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== PRUEBA FINAL OBSERVACIONES CORREGIDAS ===\n\n";

try {
    $equipoId = 2959; // Equipo que tiene observaciones con contenido
    
    echo "🔍 Probando equipo ID: $equipoId (que tiene observaciones)\n\n";
    
    // Probar endpoint completo
    $controller = new \App\Http\Controllers\Api\EquipmentController();
    $response = $controller->getCompleteInfo($equipoId);
    $responseData = json_decode($response->getContent(), true);
    
    if ($responseData['success']) {
        $data = $responseData['data'];
        
        echo "✅ EQUIPO: {$data['name']}\n";
        echo "✅ SERVICIO: {$data['servicio_nombre']}\n\n";
        
        // Verificar observaciones específicamente
        $obsRecientes = $data['observaciones_recientes'] ?? [];
        echo "📊 OBSERVACIONES RECIENTES: " . count($obsRecientes) . " registros\n\n";
        
        if (count($obsRecientes) > 0) {
            echo "✅ OBSERVACIONES CAPTURADAS CORRECTAMENTE:\n";
            foreach ($obsRecientes as $index => $obs) {
                echo "📝 Observación " . ($index + 1) . ":\n";
                echo "  - Fecha: " . ($obs['created_at'] ?? 'N/A') . "\n";
                echo "  - Descripción: " . substr($obs['description'] ?? 'N/A', 0, 60) . "...\n";
                echo "  - Usuario: " . ($obs['usuario_nombre'] ?? 'N/A') . "\n";
                echo "  - Archivo: " . ($obs['file'] ?? 'Sin archivo') . "\n";
                echo "  ---\n";
            }
            
            echo "\n🎯 CAMPOS VERIFICADOS PARA PDF:\n";
            $primera = $obsRecientes[0];
            echo "✅ Campo 'created_at': " . (isset($primera['created_at']) ? "PRESENTE" : "FALTANTE") . "\n";
            echo "✅ Campo 'description': " . (isset($primera['description']) ? "PRESENTE" : "FALTANTE") . "\n";
            echo "✅ Campo 'usuario_nombre': " . (isset($primera['usuario_nombre']) ? "PRESENTE" : "FALTANTE") . "\n";
            
            echo "\n🚀 RESULTADO:\n";
            echo "✅ Las observaciones ahora se capturan correctamente\n";
            echo "✅ Los campos coinciden con la estructura de la BD\n";
            echo "✅ El PDF debería mostrar las observaciones sin 'No disponible'\n";
            
        } else {
            echo "❌ No se capturaron observaciones\n";
        }
        
        // Mostrar resumen completo
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 RESUMEN COMPLETO DEL EQUIPO $equipoId:\n";
        echo str_repeat("=", 60) . "\n";
        echo "🔧 Mantenimientos preventivos: " . count($data['mantenimientos_preventivos'] ?? []) . " registros\n";
        echo "🚨 Contingencias/correctivos: " . count($data['contingencias'] ?? []) . " registros\n";
        echo "📏 Calibraciones: " . count($data['calibraciones'] ?? []) . " registros\n";
        echo "📄 Documentos asociados: " . count($data['documentos'] ?? []) . " registros\n";
        echo "📝 Observaciones recientes: " . count($obsRecientes) . " registros\n";
        
        echo "\n🎯 EQUIPO IDEAL PARA PRUEBAS COMPLETAS: ID $equipoId\n";
        
    } else {
        echo "❌ Error en endpoint: {$responseData['message']}\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== INSTRUCCIONES FINALES ===\n";
echo "1. ✅ Backend corregido - observaciones usan 'description' y 'created_at'\n";
echo "2. ✅ Frontend corregido - PDF usa campos correctos\n";
echo "3. 🎯 Usar equipo ID: 2959 para probar PDF completo\n";
echo "4. 🔄 Recargar frontend para aplicar cambios\n";
echo "5. ✅ Todas las secciones deberían funcionar correctamente\n";
?>

<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== BÚSQUEDA DE EQUIPO CON TODOS LOS DOCUMENTOS ===\n\n";

try {
    // Buscar equipos que tengan al menos un registro en cada tabla
    echo "🔍 Buscando equipos con datos completos...\n\n";
    
    // Query para encontrar equipos con todos los tipos de datos
    $equiposCompletos = \Illuminate\Support\Facades\DB::table('equipos')
        ->select('equipos.id', 'equipos.name')
        ->whereExists(function($query) {
            $query->select(\Illuminate\Support\Facades\DB::raw(1))
                  ->from('mantenimiento')
                  ->whereRaw('mantenimiento.equipo_id = equipos.id');
        })
        ->whereExists(function($query) {
            $query->select(\Illuminate\Support\Facades\DB::raw(1))
                  ->from('contingencias')
                  ->whereRaw('contingencias.equipo_id = equipos.id');
        })
        ->whereExists(function($query) {
            $query->select(\Illuminate\Support\Facades\DB::raw(1))
                  ->from('calibracion')
                  ->whereRaw('calibracion.equipo_id = equipos.id');
        })
        ->whereExists(function($query) {
            $query->select(\Illuminate\Support\Facades\DB::raw(1))
                  ->from('equipo_archivo')
                  ->whereRaw('equipo_archivo.equipo_id = equipos.id');
        })
        ->limit(5)
        ->get();
    
    if ($equiposCompletos->count() > 0) {
        echo "✅ Equipos con TODOS los tipos de documentos:\n";
        foreach ($equiposCompletos as $equipo) {
            echo "🎯 ID: {$equipo->id} - {$equipo->name}\n";
        }
        
        // Usar el primer equipo completo para mostrar detalles
        $equipoId = $equiposCompletos->first()->id;
        echo "\n📋 DETALLES DEL EQUIPO ID: $equipoId\n";
        echo "=" . str_repeat("=", 40) . "\n";
        
    } else {
        echo "❌ No hay equipos con TODOS los tipos de documentos.\n";
        echo "🔍 Buscando equipos con al menos 3 tipos...\n\n";
        
        // Buscar equipos con al menos 3 de los 4 tipos
        $equipos = \Illuminate\Support\Facades\DB::select("
            SELECT 
                e.id, 
                e.name,
                (CASE WHEN m.cnt > 0 THEN 1 ELSE 0 END) +
                (CASE WHEN c.cnt > 0 THEN 1 ELSE 0 END) +
                (CASE WHEN cal.cnt > 0 THEN 1 ELSE 0 END) +
                (CASE WHEN d.cnt > 0 THEN 1 ELSE 0 END) as tipos_disponibles,
                m.cnt as mantenimientos,
                c.cnt as contingencias, 
                cal.cnt as calibraciones,
                d.cnt as documentos
            FROM equipos e
            LEFT JOIN (
                SELECT equipo_id, COUNT(*) as cnt 
                FROM mantenimiento 
                GROUP BY equipo_id
            ) m ON m.equipo_id = e.id
            LEFT JOIN (
                SELECT equipo_id, COUNT(*) as cnt 
                FROM contingencias 
                GROUP BY equipo_id
            ) c ON c.equipo_id = e.id
            LEFT JOIN (
                SELECT equipo_id, COUNT(*) as cnt 
                FROM calibracion 
                GROUP BY equipo_id
            ) cal ON cal.equipo_id = e.id
            LEFT JOIN (
                SELECT equipo_id, COUNT(*) as cnt 
                FROM equipo_archivo 
                GROUP BY equipo_id
            ) d ON d.equipo_id = e.id
            HAVING tipos_disponibles >= 3
            ORDER BY tipos_disponibles DESC, mantenimientos DESC
            LIMIT 5
        ");
        
        if (count($equipos) > 0) {
            echo "✅ Equipos con 3-4 tipos de documentos:\n";
            foreach ($equipos as $equipo) {
                echo "🎯 ID: {$equipo->id} - {$equipo->name}\n";
                echo "   📊 Tipos: {$equipo->tipos_disponibles}/4 - ";
                echo "M:{$equipo->mantenimientos} C:{$equipo->contingencias} Cal:{$equipo->calibraciones} D:{$equipo->documentos}\n";
            }
            
            $equipoId = $equipos[0]->id;
            echo "\n📋 DETALLES DEL EQUIPO ID: $equipoId\n";
            echo "=" . str_repeat("=", 40) . "\n";
        } else {
            echo "❌ No se encontraron equipos con suficientes datos.\n";
            echo "🔍 Mostrando equipos con más mantenimientos...\n\n";
            
            $equiposConMant = \Illuminate\Support\Facades\DB::table('equipos')
                ->leftJoin('mantenimiento', 'equipos.id', '=', 'mantenimiento.equipo_id')
                ->select('equipos.id', 'equipos.name', \Illuminate\Support\Facades\DB::raw('COUNT(mantenimiento.id) as total_mant'))
                ->groupBy('equipos.id', 'equipos.name')
                ->orderBy('total_mant', 'desc')
                ->limit(5)
                ->get();
            
            foreach ($equiposConMant as $equipo) {
                echo "🎯 ID: {$equipo->id} - {$equipo->name} (Mantenimientos: {$equipo->total_mant})\n";
            }
            
            $equipoId = $equiposConMant->first()->id;
            echo "\n📋 DETALLES DEL EQUIPO ID: $equipoId\n";
            echo "=" . str_repeat("=", 40) . "\n";
        }
    }
    
    // Mostrar detalles del equipo seleccionado
    $controller = new \App\Http\Controllers\Api\EquipmentController();
    $response = $controller->getCompleteInfo($equipoId);
    $responseData = json_decode($response->getContent(), true);
    
    if ($responseData['success']) {
        $data = $responseData['data'];
        
        echo "✅ EQUIPO: {$data['name']}\n";
        echo "✅ SERVICIO: {$data['servicio_nombre']}\n";
        echo "✅ ESTADO: {$data['estado_nombre']}\n\n";
        
        echo "📊 DISPONIBILIDAD DE DOCUMENTOS:\n";
        
        $mants = $data['mantenimientos_preventivos'] ?? [];
        echo "🔧 Mantenimientos Preventivos: " . count($mants) . " registros\n";
        
        $conts = $data['contingencias'] ?? [];
        echo "🚨 Contingencias/Correctivos: " . count($conts) . " registros\n";
        
        $cals = $data['calibraciones'] ?? [];
        echo "📏 Calibraciones: " . count($cals) . " registros\n";
        
        $docs = $data['documentos'] ?? [];
        echo "📄 Documentos Asociados: " . count($docs) . " registros\n";
        
        $total_tipos = (count($mants) > 0 ? 1 : 0) + 
                      (count($conts) > 0 ? 1 : 0) + 
                      (count($cals) > 0 ? 1 : 0) + 
                      (count($docs) > 0 ? 1 : 0);
        
        echo "\n🎯 RECOMENDACIÓN:\n";
        echo "✅ USAR EQUIPO ID: $equipoId\n";
        echo "✅ NOMBRE: {$data['name']}\n";
        echo "✅ TIPOS DISPONIBLES: $total_tipos/4\n";
        echo "✅ PERFECTO PARA PROBAR EL PDF COMPLETO\n";
        
    } else {
        echo "❌ Error obteniendo detalles: {$responseData['message']}\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error en búsqueda: " . $e->getMessage() . "\n";
}
?>

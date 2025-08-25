<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICACIÓN OBSERVACIONES RECIENTES ===\n\n";

try {
    $equipoId = 188; // El equipo que estamos usando
    
    echo "🔍 Verificando tabla 'observaciones' para equipo ID: $equipoId\n\n";
    
    // 1. Verificar si existe la tabla observaciones
    try {
        $columns = \Illuminate\Support\Facades\Schema::getColumnListing('observaciones');
        echo "✅ Tabla 'observaciones' existe\n";
        echo "📋 Columnas: " . implode(', ', $columns) . "\n\n";
    } catch (\Exception $e) {
        echo "❌ Tabla 'observaciones' NO existe: " . $e->getMessage() . "\n";
        
        // Buscar tablas similares
        echo "🔍 Buscando tablas similares...\n";
        $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        foreach ($tables as $table) {
            $table_name = array_values((array)$table)[0];
            if (strpos(strtolower($table_name), 'observ') !== false || 
                strpos(strtolower($table_name), 'nota') !== false ||
                strpos(strtolower($table_name), 'comment') !== false) {
                echo "  - $table_name\n";
            }
        }
        echo "\n";
    }
    
    // 2. Verificar datos en tabla observaciones
    try {
        $observaciones = \Illuminate\Support\Facades\DB::table('observaciones')
            ->where('equipo_id', $equipoId)
            ->get();
        
        echo "📊 Observaciones para equipo $equipoId: " . $observaciones->count() . " registros\n";
        
        if ($observaciones->count() > 0) {
            echo "✅ Datos encontrados:\n";
            foreach ($observaciones as $obs) {
                echo "  - ID: {$obs->id}, Fecha: {$obs->created_at}, Observación: " . substr($obs->observacion ?? 'N/A', 0, 50) . "...\n";
            }
        } else {
            echo "❌ No hay observaciones para este equipo\n";
        }
        
    } catch (\Exception $e) {
        echo "❌ Error consultando observaciones: " . $e->getMessage() . "\n";
    }
    
    // 3. Buscar observaciones en cualquier equipo
    echo "\n🔍 Buscando observaciones en CUALQUIER equipo...\n";
    try {
        $total_obs = \Illuminate\Support\Facades\DB::table('observaciones')->count();
        echo "📊 Total observaciones en BD: $total_obs\n";
        
        if ($total_obs > 0) {
            $sample_obs = \Illuminate\Support\Facades\DB::table('observaciones')
                ->limit(3)
                ->get();
            
            echo "📝 Ejemplos de observaciones:\n";
            foreach ($sample_obs as $obs) {
                echo "  - Equipo ID: {$obs->equipo_id}, Observación: " . substr($obs->observacion ?? 'N/A', 0, 50) . "...\n";
            }
            
            // Buscar equipos que SÍ tengan observaciones
            $equipos_con_obs = \Illuminate\Support\Facades\DB::table('observaciones')
                ->select('equipo_id', \Illuminate\Support\Facades\DB::raw('COUNT(*) as total'))
                ->groupBy('equipo_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get();
            
            echo "\n🎯 Equipos con más observaciones:\n";
            foreach ($equipos_con_obs as $equipo) {
                echo "  - Equipo ID: {$equipo->equipo_id} ({$equipo->total} observaciones)\n";
            }
        }
        
    } catch (\Exception $e) {
        echo "❌ Error buscando observaciones: " . $e->getMessage() . "\n";
    }
    
    // 4. Verificar el query del controlador
    echo "\n🔍 Verificando query del controlador...\n";
    try {
        $observaciones = \Illuminate\Support\Facades\DB::table('observaciones')
            ->leftJoin('usuarios', 'observaciones.usuario_id', '=', 'usuarios.id')
            ->where('observaciones.equipo_id', $equipoId)
            ->select(
                'observaciones.*',
                'usuarios.nombre as usuario_nombre',
                'usuarios.apellido as usuario_apellido'
            )
            ->orderBy('observaciones.created_at', 'desc')
            ->limit(3)
            ->get();
        
        echo "📋 Query del controlador ejecutado\n";
        echo "📊 Resultados: " . $observaciones->count() . " registros\n";
        
        if ($observaciones->count() > 0) {
            echo "✅ Datos del query:\n";
            foreach ($observaciones as $obs) {
                echo "  - Observación: " . ($obs->observacion ?? 'NULL') . "\n";
                echo "  - Usuario: " . ($obs->usuario_nombre ?? 'NULL') . "\n";
                echo "  - Fecha: " . ($obs->created_at ?? 'NULL') . "\n";
                echo "  ---\n";
            }
        }
        
    } catch (\Exception $e) {
        echo "❌ Error en query del controlador: " . $e->getMessage() . "\n";
    }
    
    // 5. Probar con equipo que sí tenga observaciones
    if ($total_obs > 0 && isset($equipos_con_obs) && $equipos_con_obs->count() > 0) {
        $equipoConObs = $equipos_con_obs->first()->equipo_id;
        echo "\n🎯 Probando con equipo que SÍ tiene observaciones (ID: $equipoConObs):\n";
        
        $controller = new \App\Http\Controllers\Api\EquipmentController();
        $response = $controller->getCompleteInfo($equipoConObs);
        $responseData = json_decode($response->getContent(), true);
        
        if ($responseData['success']) {
            $obsRecientes = $responseData['data']['observaciones_recientes'] ?? [];
            echo "📊 Observaciones recientes capturadas: " . count($obsRecientes) . "\n";
            
            if (count($obsRecientes) > 0) {
                echo "✅ Ejemplo observación capturada:\n";
                $primera = $obsRecientes[0];
                foreach ($primera as $campo => $valor) {
                    echo "  $campo: " . (is_string($valor) ? substr($valor, 0, 50) : $valor) . "\n";
                }
            }
        }
    }
    
    echo "\n🎯 DIAGNÓSTICO:\n";
    if ($total_obs == 0) {
        echo "❌ No hay observaciones en la BD - tabla vacía\n";
        echo "💡 Solución: Agregar datos de prueba o verificar si se usa otra tabla\n";
    } else {
        echo "✅ Hay observaciones en la BD pero no para el equipo $equipoId\n";
        echo "💡 Usar un equipo que sí tenga observaciones para probar\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error general: " . $e->getMessage() . "\n";
}
?>

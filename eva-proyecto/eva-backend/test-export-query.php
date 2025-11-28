<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========== TEST QUERY COMPLETO DE EXPORTACIÓN ==========\n\n";

try {
    // Test query de correctivos generales
    echo "1. Probando query de correctivos_generales...\n";
    $queryGenerales = DB::table('correctivos_generales as cg')
        ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id')
        ->leftJoin('servicios as s', 'e.servicio_id', '=', 's.id')
        ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
        ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
        ->select([
            'cg.id',
            'cg.created_at',
            DB::raw("cg.created_at as fecha_inicio"),
            DB::raw("NULL as retro_cierre"),
            DB::raw("COALESCE(sede.name, 'N/A') as sede_nombre"),
            DB::raw("'Correctivo General' as tipo"),
            DB::raw("'' as responsable_nombre"),
            'e.name as equipo_name',
            'e.code as equipo_code', 
            'e.marca',
            'e.modelo',
            'e.serial',
            's.name as servicio_nombre',
            DB::raw("COALESCE(ee.name, 'N/A') as estado_actual"),
            'cg.fecha_mantenimiento as fecha_cierre',
            DB::raw("NULL as fecha_fin"),
            DB::raw("COALESCE(cg.description, cg.orden) as descripcion"),
            DB::raw("NULL as tecnico_cierre_text")
        ])
        ->where('e.tipo_id', 1)
        ->limit(5)
        ->get();
    
    echo "   ✅ Query correctivos_generales OK - " . $queryGenerales->count() . " registros\n";
    
    // Test query de tickets/ordenes
    echo "\n2. Probando query de ordenes (tickets)...\n";
    $queryTickets = DB::table('ordenes as o')
        ->leftJoin('equipos as e', 'o.equipo_id', '=', 'e.id')
        ->leftJoin('servicios as s', 'o.servicio_id', '=', 's.id')
        ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
        ->leftJoin('usuarios as u', 'o.asignado_id', '=', 'u.id')
        ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
        ->select([
            'o.id',
            DB::raw("CAST(o.fecha_inicio AS DATETIME) as created_at"),
            'o.fecha_inicio',
            'o.retro_cierre',
            DB::raw("COALESCE(sede.name, 'N/A') as sede_nombre"),
            DB::raw("'Ticket/Orden' as tipo"),
            DB::raw("CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as responsable_nombre"),
            DB::raw("COALESCE(e.name, o.nombre_equipo) as equipo_name"),
            DB::raw("COALESCE(e.code, o.codigo_equipo) as equipo_code"), 
            DB::raw("COALESCE(e.marca, o.marca_equipo) as marca"),
            DB::raw("COALESCE(e.modelo, o.modelo_equipo) as modelo"),
            DB::raw("COALESCE(e.serial, o.serie_equipo) as serial"),
            's.name as servicio_nombre',
            DB::raw("COALESCE(ee.name, 'N/A') as estado_actual"),
            'o.fecha_fin as fecha_cierre',
            'o.fecha_fin',
            'o.descripcion as descripcion',
            'o.tecnico_cierre_text'
        ])
        ->where(function($query) {
            $query->where('e.tipo_id', 1)
                  ->orWhere('o.subproceso_id', 1);
        })
        ->limit(5)
        ->get();
    
    echo "   ✅ Query ordenes OK - " . $queryTickets->count() . " registros\n";
    
    // Test combinación
    echo "\n3. Probando combinación de resultados...\n";
    $correctivos = $queryGenerales->concat($queryTickets);
    echo "   ✅ Combinación OK - Total: " . $correctivos->count() . " registros\n";
    
    // Mostrar ejemplo
    echo "\n4. Ejemplo de registro:\n";
    if ($correctivos->count() > 0) {
        $ejemplo = $correctivos->first();
        echo "   - ID: " . ($ejemplo->id ?? 'N/A') . "\n";
        echo "   - Tipo: " . ($ejemplo->tipo ?? 'N/A') . "\n";
        echo "   - Sede: " . ($ejemplo->sede_nombre ?? 'N/A') . "\n";
        echo "   - Fecha Inicio: " . ($ejemplo->fecha_inicio ?? 'N/A') . "\n";
        echo "   - Retro Cierre: " . ($ejemplo->retro_cierre ?? 'N/A') . "\n";
        echo "   - Tecnico Cierre Text: " . ($ejemplo->tecnico_cierre_text ?? 'N/A') . "\n";
    }
    
    // Test sin límite para ver conteo total
    echo "\n5. Contando registros totales (sin límite)...\n";
    $totalGenerales = DB::table('correctivos_generales as cg')
        ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id')
        ->where('e.tipo_id', 1)
        ->count();
    echo "   - Correctivos generales biomédicos: $totalGenerales\n";
    
    $totalTickets = DB::table('ordenes as o')
        ->leftJoin('equipos as e', 'o.equipo_id', '=', 'e.id')
        ->where(function($query) {
            $query->where('e.tipo_id', 1)
                  ->orWhere('o.subproceso_id', 1);
        })
        ->count();
    echo "   - Tickets/Ordenes biomédicos: $totalTickets\n";
    echo "   - TOTAL: " . ($totalGenerales + $totalTickets) . " registros\n";
    
    echo "\n✅ TODOS LOS TESTS PASARON CORRECTAMENTE\n";
    echo "El problema no está en los queries de base de datos.\n";
    echo "El error puede estar en la generación del Excel (PhpSpreadsheet).\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "\nTrace:\n" . $e->getTraceAsString() . "\n";
}

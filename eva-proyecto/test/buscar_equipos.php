<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "🔍 Buscando equipos con observaciones...\n";

try {
    // Buscar equipos que tengan observaciones
    $equiposConObservaciones = DB::table('equipos')
        ->join('observaciones', 'equipos.id', '=', 'observaciones.equipo_id')
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->select(
            'equipos.id',
            'equipos.name as equipo_nombre',
            'equipos.code as equipo_codigo',
            'equipos.marca',
            'equipos.modelo',
            'servicios.name as servicio_nombre',
            'observaciones.description as observacion',
            'observaciones.created_at as fecha_observacion'
        )
        ->orderBy('observaciones.created_at', 'desc')
        ->limit(5)
        ->get();

    if ($equiposConObservaciones->count() > 0) {
        echo "✅ Encontrados " . $equiposConObservaciones->count() . " equipos con observaciones:\n\n";
        
        foreach ($equiposConObservaciones as $index => $equipo) {
            echo "" . ($index + 1) . ". ID: " . $equipo->id . "\n";
            echo "   Nombre: " . ($equipo->equipo_nombre ?: 'Sin nombre') . "\n";
            echo "   Código: " . ($equipo->equipo_codigo ?: 'Sin código') . "\n";
            echo "   Marca: " . ($equipo->marca ?: 'Sin marca') . "\n";
            echo "   Modelo: " . ($equipo->modelo ?: 'Sin modelo') . "\n";
            echo "   Servicio: " . ($equipo->servicio_nombre ?: 'Sin servicio') . "\n";
            echo "   Observación: " . substr($equipo->observacion ?: 'Sin observación', 0, 100) . "...\n";
            echo "   Fecha: " . $equipo->fecha_observacion . "\n";
            echo "   " . str_repeat('-', 50) . "\n";
        }
        
        echo "\n📋 RECOMENDACIÓN: Usa el ID del primer equipo (" . $equiposConObservaciones->first()->id . ") para probar la hoja de vida.\n";
    } else {
        echo "❌ No se encontraron equipos con observaciones.\n";
        
        // Buscar equipos sin observaciones para mostrar alternativas
        $equiposSinObservaciones = DB::table('equipos')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->select('equipos.id', 'equipos.name', 'equipos.code', 'servicios.name as servicio_nombre')
            ->limit(5)
            ->get();
            
        echo "\n📋 Equipos disponibles (sin observaciones):\n";
        foreach ($equiposSinObservaciones as $equipo) {
            echo "- ID: " . $equipo->id . " | " . ($equipo->name ?: 'Sin nombre') . " | " . ($equipo->code ?: 'Sin código') . "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin de la búsqueda\n";

<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "PRUEBA SIMPLE DEL QUERY\n";
echo "========================================\n\n";

try {
    // 1. Probar query básico sin subqueries complejas
    echo "1️⃣  Query básico:\n";
    $basic = DB::table('equipos')
        ->where('equipos.status', '!=', 0)
        ->count();
    echo "Total equipos con status != 0: $basic\n\n";
    
    // 2. Probar con algunos JOINs
    echo "2️⃣  Query con JOINs:\n";
    $withJoins = DB::table('equipos')
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
        ->where('equipos.status', '!=', 0)
        ->count();
    echo "Total con JOINs: $withJoins\n\n";
    
    // 3. Probar el query completo exacto del controlador
    echo "3️⃣  Query COMPLETO del controlador:\n";
    $query = DB::table('equipos')
        ->select([
            'equipos.id',
            'equipos.name',
            'equipos.code'
        ])
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
        ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
        ->leftJoin('frecuenciam', 'equipos.frecuencia_id', '=', 'frecuenciam.id')
        ->leftJoin('ordenes_compra', 'equipos.orden_compra_id', '=', 'ordenes_compra.id')
        ->leftJoin('tipos_compra', 'ordenes_compra.tipo_compra_id', '=', 'tipos_compra.id')
        ->leftJoin('contacto', 'ordenes_compra.proveedor_id', '=', 'contacto.id')
        ->leftJoin('fuenteal', 'equipos.fuente_id', '=', 'fuenteal.id')
        ->leftJoin('tecnologiap', 'equipos.tecnologia_id', '=', 'tecnologiap.id')
        ->leftJoin('cbiomedica', 'equipos.cbiomedica_id', '=', 'cbiomedica.id')
        ->leftJoin('criesgo', 'equipos.criesgo_id', '=', 'criesgo.id')
        ->leftJoin('tadquisicion', 'equipos.tadquisicion_id', '=', 'tadquisicion.id')
        ->leftJoin('propietarios', 'equipos.propietario_id', '=', 'propietarios.id')
        ->where('equipos.status', '!=', 0);
    
    $count = $query->count();
    echo "Total con TODOS los JOINs: $count\n\n";
    
    if ($count > 0) {
        echo "4️⃣  Ejemplo de equipo:\n";
        $example = $query->first();
        echo "ID: {$example->id}\n";
        echo "Nombre: {$example->name}\n";
        echo "Código: {$example->code}\n\n";
        
        echo "✅ El query funciona correctamente\n";
        echo "💡 El problema puede estar en:\n";
        echo "   - Las subqueries complejas de las 54 columnas\n";
        echo "   - El método GET está esperando datos que no llegan\n";
        echo "   - Filtros que se están aplicando por defecto\n";
    } else {
        echo "❌ El query no devuelve resultados\n";
    }
    
} catch (\Exception $e) {
    echo "\n❌ ERROR:\n";
    echo $e->getMessage() . "\n";
}

echo "\n========================================\n";

<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "========== ESTRUCTURA DE TABLA ORDENES ==========\n\n";

try {
    $columns = DB::select("DESCRIBE ordenes");
    echo "Columnas de la tabla 'ordenes':\n";
    echo str_repeat("-", 60) . "\n";
    foreach ($columns as $col) {
        echo sprintf("%-30s | %-20s | %s\n", $col->Field, $col->Type, $col->Null);
    }
    
    // Buscar campos específicos
    echo "\n\n========== VERIFICACIÓN DE CAMPOS ESPECÍFICOS ==========\n\n";
    
    $camposBuscar = ['tecnico_cierre_text', 'retro_cierre', 'fecha_inicio', 'fecha_fin', 'servicio_id', 'descripcion'];
    
    foreach ($camposBuscar as $campo) {
        $existe = false;
        foreach ($columns as $col) {
            if ($col->Field === $campo) {
                $existe = true;
                echo "✅ Campo '$campo' EXISTE - Tipo: {$col->Type}\n";
                break;
            }
        }
        if (!$existe) {
            echo "❌ Campo '$campo' NO EXISTE\n";
        }
    }
    
    echo "\n\n========== ESTRUCTURA DE TABLA SERVICIOS ==========\n\n";
    $columnsServicios = DB::select("DESCRIBE servicios");
    echo "Columnas de la tabla 'servicios':\n";
    echo str_repeat("-", 60) . "\n";
    foreach ($columnsServicios as $col) {
        echo sprintf("%-30s | %-20s\n", $col->Field, $col->Type);
    }
    
    echo "\n\n========== ESTRUCTURA DE TABLA SEDES ==========\n\n";
    $columnsSedes = DB::select("DESCRIBE sedes");
    echo "Columnas de la tabla 'sedes':\n";
    echo str_repeat("-", 60) . "\n";
    foreach ($columnsSedes as $col) {
        echo sprintf("%-30s | %-20s\n", $col->Field, $col->Type);
    }
    
    echo "\n\n========== TEST DE QUERY SIMPLE ==========\n\n";
    $testQuery = DB::table('ordenes as o')
        ->leftJoin('servicios as s', 'o.servicio_id', '=', 's.id')
        ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
        ->select([
            'o.id',
            'o.fecha_inicio',
            's.name as servicio_nombre',
            'sede.name as sede_nombre'
        ])
        ->limit(3)
        ->get();
    
    echo "Test de query con joins (3 registros):\n";
    foreach ($testQuery as $row) {
        echo "ID: {$row->id} | Fecha: {$row->fecha_inicio} | Servicio: {$row->servicio_nombre} | Sede: {$row->sede_nombre}\n";
    }
    
    echo "\n\n========== TEST CAMPO tecnico_cierre_text ==========\n\n";
    $testTecnico = DB::table('ordenes')
        ->whereNotNull('tecnico_cierre_text')
        ->select('id', 'tecnico_cierre_text')
        ->limit(2)
        ->get();
    
    if ($testTecnico->count() > 0) {
        echo "Ejemplos de tecnico_cierre_text:\n";
        foreach ($testTecnico as $row) {
            $texto = substr($row->tecnico_cierre_text ?? '', 0, 50);
            echo "ID: {$row->id} | Texto: {$texto}...\n";
        }
    } else {
        echo "No hay registros con tecnico_cierre_text\n";
    }
    
    echo "\n\n========== TEST CAMPO retro_cierre ==========\n\n";
    $testRetro = DB::table('ordenes')
        ->whereNotNull('retro_cierre')
        ->select('id', 'retro_cierre')
        ->limit(2)
        ->get();
    
    if ($testRetro->count() > 0) {
        echo "Ejemplos de retro_cierre:\n";
        foreach ($testRetro as $row) {
            $texto = substr($row->retro_cierre ?? '', 0, 50);
            echo "ID: {$row->id} | Texto: {$texto}...\n";
        }
    } else {
        echo "No hay registros con retro_cierre\n";
    }

} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
}

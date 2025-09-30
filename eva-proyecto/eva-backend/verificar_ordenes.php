<?php
/**
 * Script para verificar la estructura y datos de la tabla ordenes
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Configurar la conexión a la base de datos
$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'database' => 'gestionthuv', // Base de datos correcta
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "=== VERIFICACIÓN DE TABLA ORDENES ===\n\n";

try {
    // 1. Verificar estructura de la tabla
    echo "1. ESTRUCTURA DE LA TABLA ORDENES:\n";
    $columns = Capsule::select("DESCRIBE ordenes");
    foreach ($columns as $column) {
        echo "- {$column->Field} ({$column->Type}) - {$column->Null} - {$column->Key} - Default: {$column->Default}\n";
    }
    echo "\n";

    // 2. Contar total de registros
    $total = Capsule::table('ordenes')->count();
    echo "2. TOTAL DE REGISTROS: {$total}\n\n";

    // 3. Verificar valores únicos en la columna prioridad
    echo "3. VALORES ÚNICOS EN COLUMNA PRIORIDAD:\n";
    $prioridades = Capsule::table('ordenes')
        ->select('prioridad')
        ->selectRaw('COUNT(*) as cantidad')
        ->groupBy('prioridad')
        ->get();
    
    foreach ($prioridades as $prioridad) {
        echo "- '{$prioridad->prioridad}' -> {$prioridad->cantidad} registros\n";
    }
    echo "\n";

    // 4. Verificar valores únicos en la columna estado_id
    echo "4. VALORES ÚNICOS EN COLUMNA ESTADO_ID:\n";
    $estados = Capsule::table('ordenes')
        ->select('estado_id')
        ->selectRaw('COUNT(*) as cantidad')
        ->groupBy('estado_id')
        ->get();
    
    foreach ($estados as $estado) {
        echo "- Estado ID '{$estado->estado_id}' -> {$estado->cantidad} registros\n";
    }
    echo "\n";

    // 5. Verificar subprocesos relacionados
    echo "5. SUBPROCESOS RELACIONADOS:\n";
    $subprocesos = Capsule::table('ordenes')
        ->leftJoin('subprocesos', 'ordenes.subproceso_id', '=', 'subprocesos.id')
        ->select('subprocesos.nombre')
        ->selectRaw('COUNT(*) as cantidad')
        ->groupBy('subprocesos.nombre')
        ->get();
    
    foreach ($subprocesos as $subproceso) {
        echo "- '{$subproceso->nombre}' -> {$subproceso->cantidad} registros\n";
    }
    echo "\n";

    // 6. Mostrar algunos registros de ejemplo
    echo "6. REGISTROS DE EJEMPLO (primeros 5):\n";
    $ejemplos = Capsule::table('ordenes')
        ->leftJoin('subprocesos', 'ordenes.subproceso_id', '=', 'subprocesos.id')
        ->leftJoin('usuarios', 'ordenes.reportante_id', '=', 'usuarios.id')
        ->select([
            'ordenes.id',
            'ordenes.descripcion',
            'ordenes.prioridad',
            'ordenes.estado_id',
            'ordenes.fecha_inicio',
            'subprocesos.nombre as origen',
            'usuarios.nombre as reportante'
        ])
        ->limit(5)
        ->get();
    
    foreach ($ejemplos as $ejemplo) {
        echo "ID: {$ejemplo->id}\n";
        echo "  Descripción: " . substr($ejemplo->descripcion, 0, 50) . "...\n";
        echo "  Prioridad: '{$ejemplo->prioridad}'\n";
        echo "  Estado ID: {$ejemplo->estado_id}\n";
        echo "  Fecha: {$ejemplo->fecha_inicio}\n";
        echo "  Origen: {$ejemplo->origen}\n";
        echo "  Reportante: {$ejemplo->reportante}\n";
        echo "  ---\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DE VERIFICACIÓN ===\n";

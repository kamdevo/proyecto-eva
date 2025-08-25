<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "=== VERIFICANDO ESTRUCTURA DE TABLAS ===\n\n";
    
    // 1. Tabla mantenimiento
    echo "📋 TABLA MANTENIMIENTO:\n";
    $mantenimientoColumns = \Illuminate\Support\Facades\Schema::getColumnListing('mantenimiento');
    foreach ($mantenimientoColumns as $col) {
        echo "  - $col\n";
    }
    echo "\n";
    
    // 2. Tabla contingencias  
    echo "📋 TABLA CONTINGENCIAS:\n";
    $contingenciasColumns = \Illuminate\Support\Facades\Schema::getColumnListing('contingencias');
    foreach ($contingenciasColumns as $col) {
        echo "  - $col\n";
    }
    echo "\n";
    
    // 3. Tabla calibracion
    echo "📋 TABLA CALIBRACION:\n";
    $calibracionColumns = \Illuminate\Support\Facades\Schema::getColumnListing('calibracion');
    foreach ($calibracionColumns as $col) {
        echo "  - $col\n";
    }
    echo "\n";
    
    // 4. Tabla archivos
    echo "📋 TABLA ARCHIVOS:\n";
    $archivosColumns = \Illuminate\Support\Facades\Schema::getColumnListing('archivos');
    foreach ($archivosColumns as $col) {
        echo "  - $col\n";
    }
    echo "\n";
    
    // 5. Tabla equipo_archivo (relación)
    echo "📋 TABLA EQUIPO_ARCHIVO:\n";
    $equipoArchivoColumns = \Illuminate\Support\Facades\Schema::getColumnListing('equipo_archivo');
    foreach ($equipoArchivoColumns as $col) {
        echo "  - $col\n";
    }
    echo "\n";
    
    // Ahora hacer consultas corregidas
    echo "=== PROBANDO CONSULTAS CORREGIDAS ===\n\n";
    
    $equipoId = 121;
    
    // 1. Mantenimientos sin join de usuario si no existe la columna
    echo "🔧 MANTENIMIENTOS (sin usuario):\n";
    $mantenimientos = \Illuminate\Support\Facades\DB::table('mantenimiento')
        ->where('equipo_id', $equipoId)
        ->orderBy('fecha_programada', 'desc')
        ->limit(3)
        ->get();
    
    echo "Encontrados: " . $mantenimientos->count() . "\n";
    foreach ($mantenimientos as $i => $mant) {
        echo "  " . ($i + 1) . ". Fecha: {$mant->fecha_programada} - Descripción: " . substr($mant->description ?? 'N/A', 0, 50) . "\n";
    }
    echo "\n";
    
    // 2. Contingencias con join correcto
    echo "🚨 CONTINGENCIAS:\n";
    $contingencias = \Illuminate\Support\Facades\DB::table('contingencias')
        ->leftJoin('usuarios', 'contingencias.usuario_id', '=', 'usuarios.id')
        ->where('contingencias.equipo_id', $equipoId)
        ->select(
            'contingencias.*',
            'usuarios.nombre as usuario_nombre',
            'usuarios.apellido as usuario_apellido'
        )
        ->orderBy('contingencias.fecha', 'desc')
        ->limit(3)
        ->get();
    
    echo "Encontradas: " . $contingencias->count() . "\n";
    foreach ($contingencias as $i => $cont) {
        $fecha = $cont->fecha ?? 'N/A';
        $obs = substr($cont->observacion ?? 'N/A', 0, 50);
        echo "  " . ($i + 1) . ". Fecha: {$fecha} - Observación: {$obs}...\n";
    }
    echo "\n";
    
    // 3. Calibraciones
    echo "📏 CALIBRACIONES:\n";
    $calibraciones = \Illuminate\Support\Facades\DB::table('calibracion')
        ->where('equipo_id', $equipoId)
        ->orderBy('fecha_calibracion', 'desc')
        ->limit(3)
        ->get();
    
    echo "Encontradas: " . $calibraciones->count() . "\n";
    foreach ($calibraciones as $i => $cal) {
        $fecha = $cal->fecha_calibracion ?? 'N/A';
        $desc = substr($cal->description ?? 'N/A', 0, 50);
        echo "  " . ($i + 1) . ". Fecha: {$fecha} - Descripción: {$desc}...\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

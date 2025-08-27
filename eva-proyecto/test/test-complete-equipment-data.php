<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $equipoId = 121; // Equipo con contingencias
    
    echo "=== PROBANDO EQUIPO ID: $equipoId ===\n\n";
    
    // Simular el getCompleteInfo para este equipo
    $equipo = \Illuminate\Support\Facades\DB::table('equipos')
        ->select([
            'equipos.*',
            'servicios.name as servicio_nombre',
            'areas.name as area_nombre',
            'estadoequipos.name as estado_nombre',
            'pro.nombre as propietario_nombre'
        ])
        ->leftJoin('servicios', 'servicios.id', '=', 'equipos.servicio_id')
        ->leftJoin('areas', 'areas.id', '=', 'equipos.area_id')
        ->leftJoin('estadoequipos', 'estadoequipos.id', '=', 'equipos.estadoequipo_id')
        ->leftJoin('propietarios as pro', 'pro.id', '=', 'equipos.propietario_id')
        ->where('equipos.id', $equipoId)
        ->first();
    
    if (!$equipo) {
        echo "❌ Equipo no encontrado\n";
        exit;
    }
    
    echo "✅ Equipo: {$equipo->name}\n";
    echo "📍 Servicio: {$equipo->servicio_nombre}\n";
    echo "🏢 Área: {$equipo->area_nombre}\n\n";
    
    // 1. Mantenimientos Preventivos
    echo "🔧 MANTENIMIENTOS PREVENTIVOS:\n";
    $mantenimientos = \Illuminate\Support\Facades\DB::table('mantenimiento')
        ->leftJoin('usuarios', 'mantenimiento.usuario_id', '=', 'usuarios.id')
        ->where('mantenimiento.equipo_id', $equipoId)
        ->select(
            'mantenimiento.*',
            'usuarios.nombre as tecnico_nombre',
            'usuarios.apellido as tecnico_apellido'
        )
        ->orderBy('mantenimiento.fecha_programada', 'desc')
        ->limit(5)
        ->get();
    
    echo "Encontrados: " . $mantenimientos->count() . "\n";
    foreach ($mantenimientos as $i => $mant) {
        echo "  " . ($i + 1) . ". Fecha: {$mant->fecha_programada} - Descripción: " . substr($mant->description ?? 'N/A', 0, 50) . "\n";
    }
    echo "\n";
    
    // 2. Contingencias (Correctivos)
    echo "🚨 CONTINGENCIAS (CORRECTIVOS):\n";
    $contingencias = \Illuminate\Support\Facades\DB::table('contingencias')
        ->leftJoin('usuarios', 'contingencias.usuario_id', '=', 'usuarios.id')
        ->where('contingencias.equipo_id', $equipoId)
        ->select(
            'contingencias.*',
            'usuarios.nombre as usuario_nombre',
            'usuarios.apellido as usuario_apellido'
        )
        ->orderBy('contingencias.fecha', 'desc')
        ->limit(5)
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
    
    // 4. Documentos
    echo "📄 DOCUMENTOS:\n";
    $documentos = \Illuminate\Support\Facades\DB::table('archivos')
        ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
        ->where('equipo_archivo.equipo_id', $equipoId)
        ->select(
            'archivos.*',
            'equipo_archivo.vinculo',
            'equipo_archivo.otro'
        )
        ->orderBy('archivos.created_at', 'desc')
        ->limit(6)
        ->get();
    
    echo "Encontrados: " . $documentos->count() . "\n";
    foreach ($documentos as $i => $doc) {
        $nombre = $doc->name ?? 'N/A';
        $fecha = $doc->created_at ?? 'N/A';
        echo "  " . ($i + 1) . ". Nombre: {$nombre} - Fecha: {$fecha}\n";
    }
    echo "\n";
    
    // 5. Verificar estructura de datos que se enviaría al PDF
    echo "📋 ESTRUCTURA DE DATOS PARA PDF:\n";
    $equipoData = (array) $equipo;
    $equipoData['mantenimientos_preventivos'] = $mantenimientos;
    $equipoData['contingencias'] = $contingencias;
    $equipoData['calibraciones'] = $calibraciones;
    $equipoData['documentos'] = $documentos;
    
    echo "✅ mantenimientos_preventivos: " . count($equipoData['mantenimientos_preventivos']) . " elementos\n";
    echo "✅ contingencias: " . count($equipoData['contingencias']) . " elementos\n";
    echo "✅ calibraciones: " . count($equipoData['calibraciones']) . " elementos\n";
    echo "✅ documentos: " . count($equipoData['documentos']) . " elementos\n";
    
    // Verificar nombres de campos específicos que usa el PDF
    echo "\n🔍 VERIFICANDO CAMPOS QUE USA EL PDF:\n";
    
    if (!empty($equipoData['contingencias'])) {
        $primeraContingencia = $equipoData['contingencias']->first();
        echo "Campos de contingencia:\n";
        foreach ((array)$primeraContingencia as $key => $value) {
            echo "  - $key\n";
        }
    }
    
    if (!empty($equipoData['mantenimientos_preventivos'])) {
        $primerMantenimiento = $equipoData['mantenimientos_preventivos']->first();
        echo "Campos de mantenimiento:\n";
        foreach ((array)$primerMantenimiento as $key => $value) {
            echo "  - $key\n";
        }
    }
    
    if (!empty($equipoData['calibraciones'])) {
        $primeraCalibracion = $equipoData['calibraciones']->first();
        echo "Campos de calibración:\n";
        foreach ((array)$primeraCalibracion as $key => $value) {
            echo "  - $key\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>

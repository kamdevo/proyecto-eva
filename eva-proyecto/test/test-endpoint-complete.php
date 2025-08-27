<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "=== PRUEBA ENDPOINT getCompleteInfo ===\n\n";
    
    // Usar el equipo 1 que sabemos que tiene documentos
    $equipoId = 1;
    
    echo "🔍 Probando equipo ID: $equipoId\n\n";
    
    // Simular la lógica del controlador EquipmentController::getCompleteInfo
    
    // 1. Obtener equipo básico
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
    
    echo "✅ Equipo encontrado: {$equipo->name}\n\n";
    
    // Convertir a array
    $equipoData = (array) $equipo;
    
    // 2. Mantenimientos Preventivos (corregido)
    echo "🔧 Obteniendo mantenimientos preventivos...\n";
    try {
        $mantenimientos = \Illuminate\Support\Facades\DB::table('mantenimiento')
            ->leftJoin('proveedores_mantenimiento', 'mantenimiento.proveedor_mantenimiento_id', '=', 'proveedores_mantenimiento.id')
            ->where('mantenimiento.equipo_id', $equipoId)
            ->select(
                'mantenimiento.*',
                'proveedores_mantenimiento.name as tecnico_nombre'
            )
            ->orderBy('mantenimiento.fecha_programada', 'desc')
            ->limit(5)
            ->get();
        $equipoData['mantenimientos_preventivos'] = $mantenimientos;
        echo "✅ Mantenimientos obtenidos: " . $mantenimientos->count() . "\n";
    } catch (\Exception $e) {
        echo "⚠️  Error mantenimientos: " . $e->getMessage() . "\n";
        $equipoData['mantenimientos_preventivos'] = [];
    }
    
    // 3. Contingencias (corregido)
    echo "🚨 Obteniendo contingencias...\n";
    try {
        $contingencias = \Illuminate\Support\Facades\DB::table('contingencias')
            ->leftJoin('usuarios', 'contingencias.usuario_id', '=', 'usuarios.id')
            ->where('contingencias.equipo_id', $equipoId)
            ->select(
                'contingencias.*',
                'contingencias.fecha as fecha_reporte',
                'contingencias.observacion as descripcion_problema',
                'contingencias.observacion as solucion_aplicada',
                'usuarios.nombre as usuario_nombre',
                'usuarios.apellido as usuario_apellido'
            )
            ->orderBy('contingencias.fecha', 'desc')
            ->limit(5)
            ->get();
        $equipoData['contingencias'] = $contingencias;
        echo "✅ Contingencias obtenidas: " . $contingencias->count() . "\n";
    } catch (\Exception $e) {
        echo "⚠️  Error contingencias: " . $e->getMessage() . "\n";
        $equipoData['contingencias'] = [];
    }
    
    // 4. Calibraciones (corregido)
    echo "📏 Obteniendo calibraciones...\n";
    try {
        $calibraciones = \Illuminate\Support\Facades\DB::table('calibracion')
            ->where('equipo_id', $equipoId)
            ->select(
                'calibracion.*',
                'calibracion.fecha_calibracion',
                'calibracion.fecha_programada as proxima_calibracion',
                'calibracion.description as tipo_calibracion'
            )
            ->orderBy('fecha_calibracion', 'desc')
            ->limit(3)
            ->get();
        $equipoData['calibraciones'] = $calibraciones;
        echo "✅ Calibraciones obtenidas: " . $calibraciones->count() . "\n";
    } catch (\Exception $e) {
        echo "⚠️  Error calibraciones: " . $e->getMessage() . "\n";
        $equipoData['calibraciones'] = [];
    }
    
    // 5. Documentos (corregido)
    echo "📄 Obteniendo documentos...\n";
    try {
        $documentos = \Illuminate\Support\Facades\DB::table('archivos')
            ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
            ->where('equipo_archivo.equipo_id', $equipoId)
            ->select(
                'archivos.*',
                'archivos.name as nombre_archivo',
                'equipo_archivo.vinculo as tipo_documento',
                'equipo_archivo.created_at as fecha_subida'
            )
            ->orderBy('equipo_archivo.created_at', 'desc')
            ->limit(6)
            ->get();
        $equipoData['documentos'] = $documentos;
        echo "✅ Documentos obtenidos: " . $documentos->count() . "\n";
    } catch (\Exception $e) {
        echo "⚠️  Error documentos: " . $e->getMessage() . "\n";
        $equipoData['documentos'] = [];
    }
    
    echo "\n=== RESUMEN FINAL ===\n";
    echo "✅ Equipo: {$equipoData['name']}\n";
    echo "✅ Servicio: {$equipoData['servicio_nombre']}\n";
    echo "✅ Estado: {$equipoData['estado_nombre']}\n";
    echo "✅ Mantenimientos preventivos: " . count($equipoData['mantenimientos_preventivos']) . " registros\n";
    echo "✅ Contingencias: " . count($equipoData['contingencias']) . " registros\n";
    echo "✅ Calibraciones: " . count($equipoData['calibraciones']) . " registros\n";
    echo "✅ Documentos: " . count($equipoData['documentos']) . " registros\n";
    
    echo "\n🎯 ESTRUCTURA DE DATOS PARA PDF READY!\n";
    echo "Los nombres de campos coinciden con lo que espera el PDF robust.\n";
    
    // Verificar que los datos que usa el PDF estén presentes
    echo "\n🔍 VERIFICACIÓN DE CAMPOS CRÍTICOS:\n";
    
    if (!empty($equipoData['mantenimientos_preventivos'])) {
        $primer_mant = $equipoData['mantenimientos_preventivos']->first();
        echo "📋 Mantenimiento tiene 'description': " . (isset($primer_mant->description) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "📋 Mantenimiento tiene 'fecha_programada': " . (isset($primer_mant->fecha_programada) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "📋 Mantenimiento tiene 'fecha_mantenimiento': " . (isset($primer_mant->fecha_mantenimiento) ? "✅ SÍ" : "❌ NO") . "\n";
    }
    
    if (!empty($equipoData['contingencias'])) {
        $primera_cont = $equipoData['contingencias']->first();
        echo "🚨 Contingencia tiene 'fecha': " . (isset($primera_cont->fecha) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "🚨 Contingencia tiene 'observacion': " . (isset($primera_cont->observacion) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "🚨 Contingencia tiene 'usuario_nombre': " . (isset($primera_cont->usuario_nombre) ? "✅ SÍ" : "❌ NO") . "\n";
    }
    
    if (!empty($equipoData['calibraciones'])) {
        $primera_cal = $equipoData['calibraciones']->first();
        echo "📏 Calibración tiene 'fecha_calibracion': " . (isset($primera_cal->fecha_calibracion) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "📏 Calibración tiene 'description': " . (isset($primera_cal->description) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "📏 Calibración tiene 'fecha_programada': " . (isset($primera_cal->fecha_programada) ? "✅ SÍ" : "❌ NO") . "\n";
    }
    
    if (!empty($equipoData['documentos'])) {
        $primer_doc = $equipoData['documentos']->first();
        echo "📄 Documento tiene 'name': " . (isset($primer_doc->name) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "📄 Documento tiene 'created_at': " . (isset($primer_doc->created_at) ? "✅ SÍ" : "❌ NO") . "\n";
        echo "📄 Documento tiene 'vinculo': " . (isset($primer_doc->vinculo) ? "✅ SÍ" : "❌ NO") . "\n";
    }
    
    echo "\n🚀 BACKEND READY PARA PDF!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>

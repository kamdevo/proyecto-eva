<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "=== PRUEBA DE DATOS PARA HOJA DE VIDA ===\n\n";
    
    // Obtener un equipo de prueba
    $equipoId = 1; // Cambia por un ID que exista
    
    echo "🔍 Buscando equipo ID: $equipoId\n\n";
    
    // 1. Verificar que el equipo existe
    $equipo = \Illuminate\Support\Facades\DB::table('equipos')->where('id', $equipoId)->first();
    
    if (!$equipo) {
        echo "❌ Equipo no encontrado\n";
        exit;
    }
    
    echo "✅ Equipo encontrado: {$equipo->name}\n\n";
    
    // 2. Verificar tabla contingencias (correctivos)
    echo "📋 VERIFICANDO CORRECTIVOS (contingencias)\n";
    echo "Estructura de tabla contingencias:\n";
    $contingenciasColumns = \Illuminate\Support\Facades\Schema::getColumnListing('contingencias');
    echo "Columnas: " . implode(', ', $contingenciasColumns) . "\n\n";
    
    $contingencias = \Illuminate\Support\Facades\DB::table('contingencias')
        ->where('equipo_id', $equipoId)
        ->limit(3)
        ->get();
    
    echo "Contingencias encontradas: " . $contingencias->count() . "\n";
    foreach ($contingencias as $i => $c) {
        echo "Contingencia " . ($i + 1) . ":\n";
        echo "  - ID: {$c->id}\n";
        echo "  - Fecha: {$c->fecha}\n"; 
        echo "  - Observación: " . substr($c->observacion ?? 'N/A', 0, 50) . "...\n";
        echo "  - Usuario ID: {$c->usuario_id}\n\n";
    }
    
    // 3. Verificar tabla mantenimiento (preventivos)
    echo "🔧 VERIFICANDO PREVENTIVOS (mantenimiento)\n";
    echo "Estructura de tabla mantenimiento:\n";
    $mantenimientoColumns = \Illuminate\Support\Facades\Schema::getColumnListing('mantenimiento');
    echo "Columnas: " . implode(', ', $mantenimientoColumns) . "\n\n";
    
    $mantenimientos = \Illuminate\Support\Facades\DB::table('mantenimiento')
        ->where('equipo_id', $equipoId)
        ->limit(3)
        ->get();
    
    echo "Mantenimientos encontrados: " . $mantenimientos->count() . "\n";
    foreach ($mantenimientos as $i => $m) {
        echo "Mantenimiento " . ($i + 1) . ":\n";
        echo "  - ID: {$m->id}\n";
        if (isset($m->fecha_programada)) echo "  - Fecha programada: {$m->fecha_programada}\n";
        if (isset($m->fecha_mantenimiento)) echo "  - Fecha mantenimiento: {$m->fecha_mantenimiento}\n";
        if (isset($m->descripcion)) echo "  - Descripción: " . substr($m->descripcion ?? 'N/A', 0, 50) . "...\n";
        if (isset($m->usuario_id)) echo "  - Usuario ID: {$m->usuario_id}\n";
        echo "\n";
    }
    
    // 4. Verificar tabla calibracion
    echo "📏 VERIFICANDO CALIBRACIONES (calibracion)\n";
    echo "Estructura de tabla calibracion:\n";
    $calibracionColumns = \Illuminate\Support\Facades\Schema::getColumnListing('calibracion');
    echo "Columnas: " . implode(', ', $calibracionColumns) . "\n\n";
    
    $calibraciones = \Illuminate\Support\Facades\DB::table('calibracion')
        ->where('equipo_id', $equipoId)
        ->limit(3)
        ->get();
    
    echo "Calibraciones encontradas: " . $calibraciones->count() . "\n";
    foreach ($calibraciones as $i => $cal) {
        echo "Calibración " . ($i + 1) . ":\n";
        echo "  - ID: {$cal->id}\n";
        if (isset($cal->fecha_calibracion)) echo "  - Fecha calibración: {$cal->fecha_calibracion}\n";
        if (isset($cal->fecha_programada)) echo "  - Fecha programada: {$cal->fecha_programada}\n";
        if (isset($cal->description)) echo "  - Descripción: " . substr($cal->description ?? 'N/A', 0, 50) . "...\n";
        echo "\n";
    }
    
    // 5. Verificar tabla archivos/documentos
    echo "📄 VERIFICANDO DOCUMENTOS (archivos)\n";
    echo "Estructura de tabla archivos:\n";
    $archivosColumns = \Illuminate\Support\Facades\Schema::getColumnListing('archivos');
    echo "Columnas: " . implode(', ', $archivosColumns) . "\n\n";
    
    $documentos = \Illuminate\Support\Facades\DB::table('archivos')
        ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
        ->where('equipo_archivo.equipo_id', $equipoId)
        ->limit(3)
        ->get();
    
    echo "Documentos encontrados: " . $documentos->count() . "\n";
    foreach ($documentos as $i => $doc) {
        echo "Documento " . ($i + 1) . ":\n";
        if (isset($doc->nombre)) echo "  - Nombre: {$doc->nombre}\n";
        if (isset($doc->descripcion)) echo "  - Descripción: " . substr($doc->descripcion ?? 'N/A', 0, 50) . "...\n";
        if (isset($doc->file)) echo "  - Archivo: {$doc->file}\n";
        if (isset($doc->created_at)) echo "  - Fecha: {$doc->created_at}\n";
        echo "\n";
    }
    
    // 6. Probar el endpoint completo
    echo "🚀 PROBANDO ENDPOINT getCompleteInfo\n";
    echo "Simulando llamada al endpoint...\n\n";
    
    // Simular la consulta del endpoint
    $equipoCompleto = \Illuminate\Support\Facades\DB::table('equipos')
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
    
    if ($equipoCompleto) {
        echo "✅ Datos básicos del equipo:\n";
        echo "  - Nombre: {$equipoCompleto->name}\n";
        echo "  - Código: {$equipoCompleto->code}\n";
        echo "  - Servicio: {$equipoCompleto->servicio_nombre}\n";
        echo "  - Área: {$equipoCompleto->area_nombre}\n";
        echo "  - Estado: {$equipoCompleto->estado_nombre}\n";
        echo "  - Propietario: {$equipoCompleto->propietario_nombre}\n\n";
    }
    
    echo "=== RESUMEN DE VERIFICACIÓN ===\n";
    echo "✅ Estructura de tablas verificada\n";
    echo "✅ Datos de equipo básicos: OK\n";
    echo "✅ Contingencias (correctivos): " . $contingencias->count() . " registros\n";
    echo "✅ Mantenimientos (preventivos): " . $mantenimientos->count() . " registros\n";
    echo "✅ Calibraciones: " . $calibraciones->count() . " registros\n";
    echo "✅ Documentos: " . $documentos->count() . " registros\n";
    echo "\nSI VES ESTE MENSAJE, LOS DATOS ESTÁN DISPONIBLES EN LA BD\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>

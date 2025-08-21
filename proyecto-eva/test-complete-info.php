<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "🔍 Probando obtención de datos completos para PDF...\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    // Buscar un equipo que exista
    $equipo = DB::table('equipos')->first();
    
    if (!$equipo) {
        echo "❌ No hay equipos en la base de datos\n";
        exit(1);
    }
    
    $equipoId = $equipo->id;
    echo "📋 Probando con equipo ID: {$equipoId}\n";
    echo "   Nombre: " . ($equipo->name ?: 'Sin nombre') . "\n";
    echo "   Código: " . ($equipo->code ?: 'Sin código') . "\n\n";
    
    // Probar cada consulta individualmente
    echo "🔍 VERIFICANDO DATOS RELACIONADOS:\n";
    echo "-" . str_repeat("-", 40) . "\n";
    
    // 1. Mantenimientos Preventivos
    echo "1. Mantenimientos Preventivos:\n";
    $mantenimientos = DB::table('mantenimiento')
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
    echo "   Encontrados: " . $mantenimientos->count() . " registros\n";
    if ($mantenimientos->count() > 0) {
        foreach ($mantenimientos as $mant) {
            echo "   - Fecha: " . ($mant->fecha_programada ?: 'N/A') . " | Estado: " . ($mant->estado ?: 'N/A') . "\n";
        }
    }
    echo "\n";
    
    // 2. Contingencias
    echo "2. Contingencias/Correctivos:\n";
    $contingencias = DB::table('contingencias')
        ->leftJoin('usuarios', 'contingencias.usuario_id', '=', 'usuarios.id')
        ->where('contingencias.equipo_id', $equipoId)
        ->select(
            'contingencias.*',
            'usuarios.nombre as usuario_nombre',
            'usuarios.apellido as usuario_apellido'
        )
        ->orderBy('contingencias.fecha_reporte', 'desc')
        ->limit(5)
        ->get();
    echo "   Encontrados: " . $contingencias->count() . " registros\n";
    if ($contingencias->count() > 0) {
        foreach ($contingencias as $cont) {
            echo "   - Fecha: " . ($cont->fecha_reporte ?: 'N/A') . " | Estado: " . ($cont->estado ?: 'N/A') . "\n";
        }
    }
    echo "\n";
    
    // 3. Calibraciones
    echo "3. Calibraciones:\n";
    $calibraciones = DB::table('calibracion')
        ->where('equipo_id', $equipoId)
        ->orderBy('fecha_calibracion', 'desc')
        ->limit(3)
        ->get();
    echo "   Encontrados: " . $calibraciones->count() . " registros\n";
    if ($calibraciones->count() > 0) {
        foreach ($calibraciones as $cal) {
            echo "   - Fecha: " . ($cal->fecha_calibracion ?: 'N/A') . " | Resultado: " . ($cal->resultado ?: 'N/A') . "\n";
        }
    }
    echo "\n";
    
    // 4. Documentos
    echo "4. Documentos Asociados:\n";
    $documentos = DB::table('archivos')
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
    echo "   Encontrados: " . $documentos->count() . " registros\n";
    if ($documentos->count() > 0) {
        foreach ($documentos as $doc) {
            echo "   - Archivo: " . ($doc->nombre_archivo ?: $doc->file ?: 'N/A') . " | Tipo: " . ($doc->tipo_documento ?: 'N/A') . "\n";
        }
    }
    echo "\n";
    
    // 5. Contactos Técnicos
    echo "5. Contactos Técnicos:\n";
    $contactos = DB::table('contacto')
        ->leftJoin('equipo_contacto', 'contacto.id', '=', 'equipo_contacto.contacto_id')
        ->where('equipo_contacto.equipo_id', $equipoId)
        ->where('equipo_contacto.status', 1)
        ->select('contacto.*')
        ->orderBy('contacto.nombre')
        ->limit(4)
        ->get();
    echo "   Encontrados: " . $contactos->count() . " registros\n";
    if ($contactos->count() > 0) {
        foreach ($contactos as $contacto) {
            echo "   - Nombre: " . ($contacto->nombre ?: 'N/A') . " | Empresa: " . ($contacto->empresa ?: 'N/A') . "\n";
        }
    }
    echo "\n";
    
    // 6. Observaciones
    echo "6. Observaciones Recientes:\n";
    $observaciones = DB::table('observaciones')
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
    echo "   Encontrados: " . $observaciones->count() . " registros\n";
    if ($observaciones->count() > 0) {
        foreach ($observaciones as $obs) {
            echo "   - Fecha: " . ($obs->created_at ?: 'N/A') . " | Usuario: " . ($obs->usuario_nombre ?: 'N/A') . "\n";
            echo "     Descripción: " . substr($obs->description ?: 'Sin descripción', 0, 50) . "...\n";
        }
    }
    echo "\n";
    
    echo "=" . str_repeat("=", 60) . "\n";
    echo "✅ PRUEBA COMPLETADA\n";
    echo "📋 Equipo ID recomendado para probar PDF: {$equipoId}\n";
    echo "🔗 URL de prueba: /api/v1/equipos/{$equipoId}/complete-info\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

echo "\n🔚 Fin de la prueba\n";

<?php

require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "🔍 VERIFICACIÓN COMPLETA DEL FLUJO DE DATOS PARA PDF HOJA DE VIDA\n";
echo "=" . str_repeat("=", 80) . "\n\n";

try {
    // 1. Buscar un equipo para probar
    echo "1. BÚSQUEDA DE EQUIPO PARA PRUEBA:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    $equipo = DB::table('equipos')->first();
    
    if (!$equipo) {
        echo "❌ NO HAY EQUIPOS EN LA BASE DE DATOS\n";
        exit(1);
    }
    
    $equipoId = $equipo->id;
    echo "✅ Equipo seleccionado:\n";
    echo "   ID: {$equipoId}\n";
    echo "   Nombre: " . ($equipo->name ?: 'Sin nombre') . "\n";
    echo "   Código: " . ($equipo->code ?: 'Sin código') . "\n";
    echo "   Marca: " . ($equipo->marca ?: 'Sin marca') . "\n";
    echo "   Modelo: " . ($equipo->modelo ?: 'Sin modelo') . "\n\n";

    // 2. Simular la llamada al endpoint getCompleteInfo
    echo "2. SIMULACIÓN DE ENDPOINT /v1/equipos/{$equipoId}/complete-info:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    // Información básica del equipo
    $equipoCompleto = DB::table('equipos')
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->leftJoin('sedes', 'equipos.sede_id', '=', 'sedes.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->leftJoin('clasificacion_riesgo', 'equipos.clasificacion_riesgo_id', '=', 'clasificacion_riesgo.id')
        ->leftJoin('tecnologia_predominante', 'equipos.tecnologia_predominante_id', '=', 'tecnologia_predominante.id')
        ->where('equipos.id', $equipoId)
        ->select(
            'equipos.*',
            'servicios.name as servicio_nombre',
            'sedes.name as sede_nombre',
            'areas.name as area_nombre',
            'clasificacion_riesgo.name as clasificacion_riesgo_nombre',
            'tecnologia_predominante.name as tecnologia_predominante_nombre'
        )
        ->first();
    
    if ($equipoCompleto) {
        echo "✅ Información básica del equipo obtenida correctamente\n";
        echo "   Servicio: " . ($equipoCompleto->servicio_nombre ?: 'Sin servicio') . "\n";
        echo "   Sede: " . ($equipoCompleto->sede_nombre ?: 'Sin sede') . "\n";
        echo "   Área: " . ($equipoCompleto->area_nombre ?: 'Sin área') . "\n";
    } else {
        echo "❌ Error al obtener información básica del equipo\n";
    }
    echo "\n";

    // 3. Verificar datos relacionados
    echo "3. VERIFICACIÓN DE DATOS RELACIONADOS:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    $datosRelacionados = [];
    
    // 3.1 Mantenimientos Preventivos
    echo "3.1 Mantenimientos Preventivos:\n";
    try {
        $mantenimientos = DB::table('mantenimiento')
            ->leftJoin('proveedores_mantenimiento', 'mantenimiento.proveedor_mantenimiento_id', '=', 'proveedores_mantenimiento.id')
            ->where('mantenimiento.equipo_id', $equipoId)
            ->select(
                'mantenimiento.*',
                'proveedores_mantenimiento.name as tecnico_nombre'
            )
            ->orderBy('mantenimiento.fecha_programada', 'desc')
            ->limit(5)
            ->get();
        
        echo "    ✅ Encontrados: " . $mantenimientos->count() . " registros\n";
        $datosRelacionados['mantenimientos_preventivos'] = $mantenimientos;
        
        if ($mantenimientos->count() > 0) {
            $ultimo = $mantenimientos->first();
            echo "    📅 Último mantenimiento: " . ($ultimo->fecha_programada ?: 'Sin fecha') . "\n";
            echo "    👤 Proveedor: " . ($ultimo->tecnico_nombre ?: 'Sin proveedor') . "\n";
        }
    } catch (Exception $e) {
        echo "    ❌ Error: " . $e->getMessage() . "\n";
        $datosRelacionados['mantenimientos_preventivos'] = [];
    }
    echo "\n";
    
    // 3.2 Contingencias
    echo "3.2 Contingencias/Correctivos:\n";
    try {
        $contingencias = DB::table('contingencias')
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
        
        echo "    ✅ Encontrados: " . $contingencias->count() . " registros\n";
        $datosRelacionados['contingencias'] = $contingencias;
        
        if ($contingencias->count() > 0) {
            $ultima = $contingencias->first();
            echo "    📅 Última contingencia: " . ($ultima->fecha ?: 'Sin fecha') . "\n";
            echo "    📝 Observación: " . substr($ultima->observacion ?: 'Sin observación', 0, 50) . "...\n";
        }
    } catch (Exception $e) {
        echo "    ❌ Error: " . $e->getMessage() . "\n";
        $datosRelacionados['contingencias'] = [];
    }
    echo "\n";
    
    // 3.3 Calibraciones
    echo "3.3 Calibraciones:\n";
    try {
        $calibraciones = DB::table('calibracion')
            ->where('equipo_id', $equipoId)
            ->select(
                'calibracion.*',
                'calibracion.fecha_calibracion',
                'calibracion.fecha_programada as proxima_calibracion',
                'calibracion.description as tipo_calibracion',
                DB::raw("'Conforme' as resultado")
            )
            ->orderBy('fecha_calibracion', 'desc')
            ->limit(3)
            ->get();
        
        echo "    ✅ Encontrados: " . $calibraciones->count() . " registros\n";
        $datosRelacionados['calibraciones'] = $calibraciones;
        
        if ($calibraciones->count() > 0) {
            $ultima = $calibraciones->first();
            echo "    📅 Última calibración: " . ($ultima->fecha_calibracion ?: 'Sin fecha') . "\n";
            echo "    📝 Descripción: " . ($ultima->description ?: 'Sin descripción') . "\n";
        }
    } catch (Exception $e) {
        echo "    ❌ Error: " . $e->getMessage() . "\n";
        $datosRelacionados['calibraciones'] = [];
    }
    echo "\n";
    
    // 3.4 Documentos
    echo "3.4 Documentos Asociados:\n";
    try {
        $documentos = DB::table('archivos')
            ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
            ->where('equipo_archivo.equipo_id', $equipoId)
            ->select(
                'archivos.*',
                'archivos.name as nombre_archivo',
                'equipo_archivo.vinculo as tipo_documento',
                'equipo_archivo.created_at as fecha_subida',
                'equipo_archivo.vinculo',
                'equipo_archivo.created_at'
            )
            ->orderBy('equipo_archivo.created_at', 'desc')
            ->limit(6)
            ->get();
        
        echo "    ✅ Encontrados: " . $documentos->count() . " registros\n";
        $datosRelacionados['documentos'] = $documentos;
        
        if ($documentos->count() > 0) {
            $ultimo = $documentos->first();
            echo "    📄 Último documento: " . ($ultimo->name ?: 'Sin nombre') . "\n";
            echo "    📅 Fecha subida: " . ($ultimo->created_at ?: 'Sin fecha') . "\n";
        }
    } catch (Exception $e) {
        echo "    ❌ Error: " . $e->getMessage() . "\n";
        $datosRelacionados['documentos'] = [];
    }
    echo "\n";
    
    // 3.5 Contactos Técnicos
    echo "3.5 Contactos Técnicos:\n";
    try {
        $contactos = DB::table('contacto')
            ->leftJoin('equipo_contacto', 'contacto.id', '=', 'equipo_contacto.contacto_id')
            ->where('equipo_contacto.equipo_id', $equipoId)
            ->where('equipo_contacto.status', 1)
            ->select('contacto.*')
            ->orderBy('contacto.nombre')
            ->limit(4)
            ->get();
        
        echo "    ✅ Encontrados: " . $contactos->count() . " registros\n";
        $datosRelacionados['contactos_tecnicos'] = $contactos;
        
        if ($contactos->count() > 0) {
            $primer = $contactos->first();
            echo "    👤 Primer contacto: " . ($primer->nombre ?: $primer->name ?: 'Sin nombre') . "\n";
            echo "    📧 Email: " . ($primer->email ?: 'Sin email') . "\n";
        }
    } catch (Exception $e) {
        echo "    ❌ Error: " . $e->getMessage() . "\n";
        $datosRelacionados['contactos_tecnicos'] = [];
    }
    echo "\n";
    
    // 3.6 Observaciones Recientes
    echo "3.6 Observaciones Recientes:\n";
    try {
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
        
        echo "    ✅ Encontrados: " . $observaciones->count() . " registros\n";
        $datosRelacionados['observaciones_recientes'] = $observaciones;
        
        if ($observaciones->count() > 0) {
            $ultima = $observaciones->first();
            echo "    📅 Última observación: " . ($ultima->created_at ?: 'Sin fecha') . "\n";
            echo "    📝 Descripción: " . substr($ultima->description ?: 'Sin descripción', 0, 50) . "...\n";
        }
    } catch (Exception $e) {
        echo "    ❌ Error: " . $e->getMessage() . "\n";
        $datosRelacionados['observaciones_recientes'] = [];
    }
    echo "\n";

    // 4. Resumen de completitud de datos
    echo "4. RESUMEN DE COMPLETITUD DE DATOS PARA PDF:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    $totalSecciones = 6;
    $seccionesConDatos = 0;
    
    foreach ($datosRelacionados as $seccion => $datos) {
        $tieneDatos = is_array($datos) ? count($datos) > 0 : $datos->count() > 0;
        if ($tieneDatos) {
            $seccionesConDatos++;
        }
        
        $status = $tieneDatos ? "✅" : "⚠️ ";
        $count = is_array($datos) ? count($datos) : $datos->count();
        echo "   {$status} {$seccion}: {$count} registros\n";
    }
    
    $porcentajeCompletitud = round(($seccionesConDatos / $totalSecciones) * 100, 1);
    echo "\n📊 COMPLETITUD GENERAL: {$seccionesConDatos}/{$totalSecciones} secciones ({$porcentajeCompletitud}%)\n";
    
    if ($porcentajeCompletitud >= 50) {
        echo "✅ EL PDF TENDRÁ CONTENIDO SUFICIENTE PARA MOSTRAR\n";
    } else {
        echo "⚠️  EL PDF TENDRÁ CONTENIDO LIMITADO (MUCHAS SECCIONES VACÍAS)\n";
    }

    echo "\n" . "=" . str_repeat("=", 80) . "\n";
    echo "✅ VERIFICACIÓN DEL FLUJO DE DATOS COMPLETADA\n";
    echo "\n🎯 RECOMENDACIONES:\n";
    echo "   1. Usar equipo ID {$equipoId} para probar la hoja de vida\n";
    echo "   2. Endpoint: GET /v1/equipos/{$equipoId}/complete-info\n";
    echo "   3. El PDF debería mostrar datos en " . $seccionesConDatos . " de " . $totalSecciones . " secciones\n";
    echo "   4. Las secciones vacías mostrarán mensaje 'No hay datos disponibles'\n";

} catch (Exception $e) {
    echo "❌ ERROR GENERAL: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

echo "\n🔚 Fin de la verificación\n";

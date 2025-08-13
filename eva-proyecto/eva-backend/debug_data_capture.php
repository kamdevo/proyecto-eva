<?php

/**
 * Debug completo de captura de datos desde la BD
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 DEBUG COMPLETO DE CAPTURA DE DATOS DESDE BD\n";
echo "==============================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Paso 1: Verificando datos RAW del equipo ID 69...\n";
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipo) {
        echo "❌ Equipo no encontrado\n";
        exit(1);
    }
    
    echo "✅ Datos RAW del equipo:\n";
    foreach ((array)$equipo as $key => $value) {
        if (in_array($key, ['id', 'name', 'serial', 'code', 'servicio_id', 'area_id', 'propietario_id', 'estadoequipo_id', 'sede_id'])) {
            echo "   {$key}: " . ($value ?? 'NULL') . " (tipo: " . gettype($value) . ")\n";
        }
    }
    
    echo "\n📋 Paso 2: Verificando si existe sede_id en la tabla equipos...\n";
    
    $columns = DB::select("DESCRIBE equipos");
    $hasSedeId = false;
    foreach ($columns as $column) {
        if ($column->Field === 'sede_id') {
            $hasSedeId = true;
            echo "✅ Columna sede_id existe en equipos\n";
            break;
        }
    }
    
    if (!$hasSedeId) {
        echo "⚠️ Columna sede_id NO existe en tabla equipos\n";
        echo "   Necesitamos obtener sede_id desde servicios\n";
    }
    
    echo "\n📋 Paso 3: Verificando relaciones de datos...\n";
    
    // Verificar servicio
    $servicio = DB::table('servicios')->where('id', $equipo->servicio_id)->first();
    if ($servicio) {
        echo "✅ Servicio encontrado:\n";
        echo "   ID: {$servicio->id}\n";
        echo "   Nombre: {$servicio->name}\n";
        echo "   Sede ID: {$servicio->sede_id}\n";
    } else {
        echo "❌ Servicio NO encontrado para ID: {$equipo->servicio_id}\n";
    }
    
    // Verificar área
    $area = DB::table('areas')->where('id', $equipo->area_id)->first();
    if ($area) {
        echo "✅ Área encontrada:\n";
        echo "   ID: {$area->id}\n";
        echo "   Nombre: {$area->name}\n";
    } else {
        echo "❌ Área NO encontrada para ID: {$equipo->area_id}\n";
    }
    
    // Verificar propietario
    $propietario = DB::table('propietarios')->where('id', $equipo->propietario_id)->first();
    if ($propietario) {
        echo "✅ Propietario encontrado:\n";
        echo "   ID: {$propietario->id}\n";
        echo "   Nombre: {$propietario->nombre}\n";
    } else {
        echo "❌ Propietario NO encontrado para ID: {$equipo->propietario_id}\n";
    }
    
    // Verificar estado
    $estado = DB::table('estadosequipos')->where('id', $equipo->estadoequipo_id)->first();
    if ($estado) {
        echo "✅ Estado encontrado:\n";
        echo "   ID: {$estado->id}\n";
        echo "   Nombre: {$estado->name}\n";
    } else {
        echo "❌ Estado NO encontrado para ID: {$equipo->estadoequipo_id}\n";
        
        // Buscar en tabla alternativa
        $estadoAlt = DB::table('estados_equipos')->where('id', $equipo->estadoequipo_id)->first();
        if ($estadoAlt) {
            echo "✅ Estado encontrado en tabla alternativa:\n";
            echo "   ID: {$estadoAlt->id}\n";
            echo "   Nombre: " . ($estadoAlt->nombre ?? $estadoAlt->name ?? 'Sin nombre') . "\n";
        }
    }
    
    // Verificar sede
    if ($servicio && isset($servicio->sede_id)) {
        $sede = DB::table('sedes')->where('id', $servicio->sede_id)->first();
        if ($sede) {
            echo "✅ Sede encontrada:\n";
            echo "   ID: {$sede->id}\n";
            echo "   Nombre: {$sede->name}\n";
        } else {
            echo "❌ Sede NO encontrada para ID: {$servicio->sede_id}\n";
        }
    }
    
    echo "\n📋 Paso 4: Simulando endpoint complete-info EXACTO...\n";
    
    // Simular EXACTAMENTE lo que hace el endpoint
    $equipoData = (array) $equipo;
    
    // Agregar sede_id como lo hace el endpoint
    try {
        $sedeInfo = DB::table('sedes')
            ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
            ->where('servicios.id', $equipo->servicio_id)
            ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
            ->first();
        
        if ($sedeInfo) {
            $equipoData['sede_id'] = $sedeInfo->sede_id;
            $equipoData['sede_nombre'] = $sedeInfo->sede_nombre;
            echo "✅ Sede info agregada al response:\n";
            echo "   sede_id: {$equipoData['sede_id']}\n";
            echo "   sede_nombre: {$equipoData['sede_nombre']}\n";
        } else {
            $equipoData['sede_id'] = null;
            $equipoData['sede_nombre'] = null;
            echo "❌ No se pudo obtener info de sede\n";
        }
    } catch (Exception $e) {
        echo "❌ Error obteniendo sede: " . $e->getMessage() . "\n";
        $equipoData['sede_id'] = null;
        $equipoData['sede_nombre'] = null;
    }
    
    echo "\n📋 Paso 5: Verificando datos finales para frontend...\n";
    
    echo "✅ Datos que recibe el frontend:\n";
    echo "   name: '" . ($equipoData['name'] ?? 'NULL') . "'\n";
    echo "   serial: '" . ($equipoData['serial'] ?? 'NULL') . "'\n";
    echo "   code: '" . ($equipoData['code'] ?? 'NULL') . "'\n";
    echo "   servicio_id: " . ($equipoData['servicio_id'] ?? 'NULL') . " (tipo: " . gettype($equipoData['servicio_id'] ?? null) . ")\n";
    echo "   area_id: " . ($equipoData['area_id'] ?? 'NULL') . " (tipo: " . gettype($equipoData['area_id'] ?? null) . ")\n";
    echo "   propietario_id: " . ($equipoData['propietario_id'] ?? 'NULL') . " (tipo: " . gettype($equipoData['propietario_id'] ?? null) . ")\n";
    echo "   estadoequipo_id: " . ($equipoData['estadoequipo_id'] ?? 'NULL') . " (tipo: " . gettype($equipoData['estadoequipo_id'] ?? null) . ")\n";
    echo "   sede_id: " . ($equipoData['sede_id'] ?? 'NULL') . " (tipo: " . gettype($equipoData['sede_id'] ?? null) . ")\n";
    
    echo "\n📋 Paso 6: Conversión a strings para frontend...\n";
    
    $frontendData = [
        'servicio_id' => ($equipoData['servicio_id'] && $equipoData['servicio_id'] !== 0) ? strval($equipoData['servicio_id']) : '',
        'area_id' => ($equipoData['area_id'] && $equipoData['area_id'] !== 0) ? strval($equipoData['area_id']) : '',
        'propietario_id' => ($equipoData['propietario_id'] && $equipoData['propietario_id'] !== 0) ? strval($equipoData['propietario_id']) : '',
        'estadoequipo_id' => ($equipoData['estadoequipo_id'] && $equipoData['estadoequipo_id'] !== 0) ? strval($equipoData['estadoequipo_id']) : '',
        'sede_id' => ($equipoData['sede_id'] && $equipoData['sede_id'] !== 0) ? strval($equipoData['sede_id']) : '',
    ];
    
    echo "✅ Datos convertidos para frontend:\n";
    foreach ($frontendData as $key => $value) {
        echo "   {$key}: '{$value}' (vacío: " . (empty($value) ? 'SÍ' : 'NO') . ")\n";
    }
    
    echo "\n🎯 DIAGNÓSTICO:\n";
    echo "===============\n";
    
    $problemas = [];
    
    if (empty($frontendData['servicio_id'])) {
        $problemas[] = "servicio_id está vacío";
    }
    if (empty($frontendData['area_id'])) {
        $problemas[] = "area_id está vacío";
    }
    if (empty($frontendData['propietario_id'])) {
        $problemas[] = "propietario_id está vacío";
    }
    if (empty($frontendData['estadoequipo_id'])) {
        $problemas[] = "estadoequipo_id está vacío";
    }
    if (empty($frontendData['sede_id'])) {
        $problemas[] = "sede_id está vacío";
    }
    
    if (empty($problemas)) {
        echo "🎉 ✅ TODOS LOS DATOS ESTÁN CORRECTOS!\n";
        echo "Los dropdowns deberían mostrar valores seleccionados.\n";
        echo "Si aún muestran placeholders, el problema está en el frontend.\n";
    } else {
        echo "🚨 ❌ PROBLEMAS ENCONTRADOS:\n";
        foreach ($problemas as $problema) {
            echo "   • {$problema}\n";
        }
        echo "\nEsto explica por qué los dropdowns muestran placeholders.\n";
    }
    
    echo "\n📋 Paso 7: Verificando opciones de dropdown disponibles...\n";
    
    $serviciosCount = DB::table('servicios')->count();
    $areasCount = DB::table('areas')->count();
    $propietariosCount = DB::table('propietarios')->count();
    $sedesCount = DB::table('sedes')->count();
    
    echo "✅ Opciones disponibles:\n";
    echo "   Servicios: {$serviciosCount}\n";
    echo "   Áreas: {$areasCount}\n";
    echo "   Propietarios: {$propietariosCount}\n";
    echo "   Sedes: {$sedesCount}\n";
    
    // Verificar si existen las opciones específicas
    if (!empty($frontendData['servicio_id'])) {
        $servicioExists = DB::table('servicios')->where('id', $frontendData['servicio_id'])->exists();
        echo "   Servicio ID {$frontendData['servicio_id']} existe: " . ($servicioExists ? 'SÍ' : 'NO') . "\n";
    }
    
    if (!empty($frontendData['area_id'])) {
        $areaExists = DB::table('areas')->where('id', $frontendData['area_id'])->exists();
        echo "   Área ID {$frontendData['area_id']} existe: " . ($areaExists ? 'SÍ' : 'NO') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Debug completo terminado.\n";

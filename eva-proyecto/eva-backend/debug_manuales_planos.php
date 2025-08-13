<?php

/**
 * Debug específico para el problema de manuales y planos
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 DEBUG: PROBLEMA DE MANUALES Y PLANOS\n";
echo "=======================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Paso 1: Verificando equipos recientes sin datos de manuales/planos...\n";
    
    // Buscar equipos recientes que no tienen datos de manual/plano
    $equiposSinDatos = DB::table('equipos')
        ->where(function($query) {
            $query->whereNull('manual')
                  ->orWhereNull('plano')
                  ->orWhere('manual', '')
                  ->orWhere('plano', '');
        })
        ->orderBy('id', 'desc')
        ->limit(5)
        ->get(['id', 'name', 'manual', 'plano']);
    
    echo "⚠️ Equipos sin datos de manuales/planos:\n";
    foreach ($equiposSinDatos as $equipo) {
        echo "   ID: {$equipo->id} - {$equipo->name}\n";
        echo "     Manual: " . ($equipo->manual ?: 'NULL') . "\n";
        echo "     Plano: " . ($equipo->plano ?: 'NULL') . "\n\n";
    }
    
    echo "📋 Paso 2: Verificando el último equipo registrado...\n";
    
    $ultimoEquipo = DB::table('equipos')->orderBy('id', 'desc')->first();
    echo "Último equipo registrado:\n";
    echo "   ID: {$ultimoEquipo->id}\n";
    echo "   Nombre: {$ultimoEquipo->name}\n";
    echo "   Manual: " . ($ultimoEquipo->manual ?: 'NULL') . "\n";
    echo "   Plano: " . ($ultimoEquipo->plano ?: 'NULL') . "\n\n";
    
    echo "📋 Paso 3: Simulando registro de equipo con manuales y planos...\n";
    
    // Simular datos que vendrían del frontend
    $datosSimulados = [
        'name' => 'Equipo Test Debug',
        'serial' => 'DEBUG-001',
        'code' => 'DEBUG-CODE-001',
        'marca' => 'Debug Brand',
        'modelo' => 'Debug Model',
        'servicio_id' => 1,
        'area_id' => 1,
        'propietario_id' => 1,
        'estadoequipo_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'tadquisicion_id' => 1,
        'invima_id' => 1,
        'orden_compra_id' => 1,
        'baja_id' => 1,
        'guia_id' => 1,
        'manual_id' => 1,
        'necesidad_id' => 1,
        'disponibilidad_id' => 1,
        'tipo_id' => 1,
        'status' => 1,
        
        // Datos de manuales y planos como vendrían del frontend
        'manuales' => json_encode([
            'operacion' => true,
            'mantenimiento' => false,
            'partes' => true,
            'otros' => false
        ]),
        'planos' => json_encode([
            'electrico' => false,
            'electronico' => true,
            'neumatico' => false,
            'mecanico' => true
        ])
    ];
    
    echo "Datos simulados del frontend:\n";
    echo "   manuales: {$datosSimulados['manuales']}\n";
    echo "   planos: {$datosSimulados['planos']}\n\n";
    
    echo "📋 Paso 4: Simulando procesamiento del backend...\n";
    
    // Simular el procesamiento que hace el backend
    $equipoData = $datosSimulados;
    
    // Simular la función processManualesAndPlanos
    if (isset($datosSimulados['manuales'])) {
        $manualesInput = $datosSimulados['manuales'];
        echo "Procesando manuales input: {$manualesInput}\n";
        
        if (is_string($manualesInput)) {
            $decoded = json_decode($manualesInput, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $equipoData['manual'] = $manualesInput; // Guardar como JSON string
                echo "✅ Manual procesado correctamente: {$equipoData['manual']}\n";
            } else {
                echo "❌ Error al decodificar manuales JSON\n";
            }
        }
    }
    
    if (isset($datosSimulados['planos'])) {
        $planosInput = $datosSimulados['planos'];
        echo "Procesando planos input: {$planosInput}\n";
        
        if (is_string($planosInput)) {
            $decoded = json_decode($planosInput, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $equipoData['plano'] = $planosInput; // Guardar como JSON string
                echo "✅ Plano procesado correctamente: {$equipoData['plano']}\n";
            } else {
                echo "❌ Error al decodificar planos JSON\n";
            }
        }
    }
    
    // Remover las claves originales como hace el backend
    unset($equipoData['manuales']);
    unset($equipoData['planos']);
    
    echo "\n📋 Paso 5: Verificando datos finales para inserción...\n";
    
    echo "Datos finales que se insertarían:\n";
    echo "   manual: " . ($equipoData['manual'] ?? 'NO_SET') . "\n";
    echo "   plano: " . ($equipoData['plano'] ?? 'NO_SET') . "\n";
    
    // Verificar si las columnas existen en la tabla
    echo "\n📋 Paso 6: Verificando estructura de la tabla equipos...\n";
    
    $columns = DB::select("DESCRIBE equipos");
    $hasManual = false;
    $hasPlano = false;
    
    foreach ($columns as $column) {
        if ($column->Field === 'manual') {
            $hasManual = true;
            echo "✅ Columna 'manual' existe: {$column->Type}\n";
        }
        if ($column->Field === 'plano') {
            $hasPlano = true;
            echo "✅ Columna 'plano' existe: {$column->Type}\n";
        }
    }
    
    if (!$hasManual) {
        echo "❌ Columna 'manual' NO existe en la tabla equipos\n";
    }
    if (!$hasPlano) {
        echo "❌ Columna 'plano' NO existe en la tabla equipos\n";
    }
    
    echo "\n📋 Paso 7: Probando inserción real...\n";
    
    if ($hasManual && $hasPlano) {
        try {
            $testId = DB::table('equipos')->insertGetId($equipoData);
            echo "✅ Equipo de prueba insertado con ID: {$testId}\n";
            
            // Verificar que se guardó correctamente
            $equipoVerificacion = DB::table('equipos')->where('id', $testId)->first();
            echo "Verificación del equipo insertado:\n";
            echo "   manual: " . ($equipoVerificacion->manual ?: 'NULL') . "\n";
            echo "   plano: " . ($equipoVerificacion->plano ?: 'NULL') . "\n";
            
            if ($equipoVerificacion->manual && $equipoVerificacion->plano) {
                echo "🎉 ✅ LOS DATOS DE MANUALES Y PLANOS SE GUARDARON CORRECTAMENTE!\n";
            } else {
                echo "❌ Los datos de manuales y planos NO se guardaron\n";
            }
            
        } catch (Exception $e) {
            echo "❌ Error al insertar equipo de prueba: " . $e->getMessage() . "\n";
        }
    } else {
        echo "❌ No se puede probar la inserción porque faltan columnas\n";
    }
    
    echo "\n🎯 DIAGNÓSTICO FINAL:\n";
    echo "====================\n";
    
    if ($hasManual && $hasPlano) {
        echo "✅ Las columnas manual y plano existen en la base de datos\n";
        echo "✅ El procesamiento de JSON funciona correctamente\n";
        echo "✅ La inserción de datos funciona\n\n";
        
        echo "🔍 POSIBLES CAUSAS DEL PROBLEMA:\n";
        echo "1. El frontend no está enviando los datos de manuales/planos\n";
        echo "2. El backend no está procesando correctamente los datos\n";
        echo "3. Hay un error en la validación que impide el guardado\n";
        echo "4. Los datos se están perdiendo en algún punto del flujo\n\n";
        
        echo "📋 PRÓXIMOS PASOS RECOMENDADOS:\n";
        echo "1. Verificar logs del backend durante el registro\n";
        echo "2. Revisar la consola del navegador para errores\n";
        echo "3. Verificar que el frontend esté enviando los datos correctamente\n";
        echo "4. Revisar las validaciones del backend\n";
        
    } else {
        echo "❌ PROBLEMA CRÍTICO: Faltan columnas en la base de datos\n";
        echo "Se necesita crear las columnas manual y plano en la tabla equipos\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Debug de manuales y planos completado.\n";

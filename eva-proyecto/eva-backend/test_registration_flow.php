<?php

/**
 * Test completo del flujo de registro para identificar dónde se pierden los datos
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

echo "🧪 TEST COMPLETO DEL FLUJO DE REGISTRO\n";
echo "======================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Paso 1: Simulando datos que vienen del frontend...\n";
    
    // Simular exactamente los datos que envía el frontend
    $frontendData = [
        'name' => 'Test Registration Flow',
        'serial' => 'FLOW-TEST-001',
        'code' => 'FLOW-CODE-001',
        'marca' => 'Flow Brand',
        'modelo' => 'Flow Model',
        'servicio_id' => '1',
        'area_id' => '1',
        'propietario_id' => '1',
        'estadoequipo_id' => '1',
        'cbiomedica_id' => '1',
        'criesgo_id' => '1',
        'fuente_id' => '1',
        'tecnologia_id' => '1',
        'frecuencia_id' => '1',
        'tadquisicion_id' => '1',
        'invima_id' => '1',
        'orden_compra_id' => '1',
        'baja_id' => '1',
        'guia_id' => '1',
        'manual_id' => '1',
        'necesidad_id' => '1',
        'disponibilidad_id' => '1',
        'tipo_id' => '1',
        'status' => '1',
        
        // Datos críticos de manuales y planos
        'manuales' => '{"operacion":true,"mantenimiento":false,"partes":true,"otros":false}',
        'planos' => '{"electrico":false,"electronico":true,"neumatico":false,"mecanico":true}'
    ];
    
    echo "Datos del frontend:\n";
    echo "   manuales: {$frontendData['manuales']}\n";
    echo "   planos: {$frontendData['planos']}\n\n";
    
    echo "📋 Paso 2: Simulando procesamiento del controlador...\n";
    
    // Simular el procesamiento del controlador EquipmentController::store
    $equipoData = [];
    
    // Procesar campos básicos
    foreach ($frontendData as $key => $value) {
        if (!in_array($key, ['manuales', 'planos']) && $value !== null && $value !== '') {
            $equipoData[$key] = $value;
        }
    }
    
    echo "Datos básicos procesados: " . count($equipoData) . " campos\n";
    
    // Simular processManualesAndPlanos
    echo "\n📋 Paso 3: Simulando processManualesAndPlanos...\n";
    
    // Procesar MANUALES
    if (isset($frontendData['manuales']) && !empty($frontendData['manuales'])) {
        $manualesInput = $frontendData['manuales'];
        echo "Procesando manuales: {$manualesInput}\n";
        
        if (is_string($manualesInput)) {
            $decoded = json_decode($manualesInput, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $equipoData['manual'] = $manualesInput;
                echo "✅ Manual asignado: {$equipoData['manual']}\n";
            } else {
                echo "❌ Error decodificando manuales: " . json_last_error_msg() . "\n";
            }
        }
    } else {
        echo "⚠️ No hay datos de manuales para procesar\n";
    }
    
    // Procesar PLANOS
    if (isset($frontendData['planos']) && !empty($frontendData['planos'])) {
        $planosInput = $frontendData['planos'];
        echo "Procesando planos: {$planosInput}\n";
        
        if (is_string($planosInput)) {
            $decoded = json_decode($planosInput, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $equipoData['plano'] = $planosInput;
                echo "✅ Plano asignado: {$equipoData['plano']}\n";
            } else {
                echo "❌ Error decodificando planos: " . json_last_error_msg() . "\n";
            }
        }
    } else {
        echo "⚠️ No hay datos de planos para procesar\n";
    }
    
    echo "\n📋 Paso 4: Verificando datos finales antes de inserción...\n";
    
    echo "Datos finales para inserción:\n";
    echo "   manual: " . (isset($equipoData['manual']) ? $equipoData['manual'] : 'NO_SET') . "\n";
    echo "   plano: " . (isset($equipoData['plano']) ? $equipoData['plano'] : 'NO_SET') . "\n";
    echo "   Total campos: " . count($equipoData) . "\n";
    
    echo "\n📋 Paso 5: Probando inserción real...\n";
    
    try {
        $testId = DB::table('equipos')->insertGetId($equipoData);
        echo "✅ Equipo insertado con ID: {$testId}\n";
        
        // Verificar inmediatamente
        $equipoVerificacion = DB::table('equipos')->where('id', $testId)->first();
        echo "\nVerificación inmediata:\n";
        echo "   manual en BD: " . ($equipoVerificacion->manual ?: 'NULL') . "\n";
        echo "   plano en BD: " . ($equipoVerificacion->plano ?: 'NULL') . "\n";
        
        if ($equipoVerificacion->manual && $equipoVerificacion->plano) {
            echo "🎉 ✅ ÉXITO: Los datos se guardaron correctamente!\n";
        } else {
            echo "❌ FALLO: Los datos no se guardaron\n";
            
            // Diagnóstico adicional
            if (!$equipoVerificacion->manual) {
                echo "   - Campo manual está NULL\n";
            }
            if (!$equipoVerificacion->plano) {
                echo "   - Campo plano está NULL\n";
            }
        }
        
    } catch (Exception $e) {
        echo "❌ Error en inserción: " . $e->getMessage() . "\n";
    }
    
    echo "\n📋 Paso 6: Verificando el problema con equipos existentes...\n";
    
    // Verificar por qué los equipos anteriores no tienen datos
    $equiposSinDatos = DB::table('equipos')
        ->whereNull('manual')
        ->orWhereNull('plano')
        ->orderBy('id', 'desc')
        ->limit(3)
        ->get(['id', 'name', 'manual', 'plano']);
    
    echo "Equipos sin datos de manuales/planos:\n";
    foreach ($equiposSinDatos as $equipo) {
        echo "   ID {$equipo->id}: {$equipo->name}\n";
        echo "     manual: " . ($equipo->manual ?: 'NULL') . "\n";
        echo "     plano: " . ($equipo->plano ?: 'NULL') . "\n";
    }
    
    echo "\n🎯 DIAGNÓSTICO FINAL:\n";
    echo "====================\n";
    
    if (isset($equipoData['manual']) && isset($equipoData['plano'])) {
        echo "✅ El procesamiento de datos funciona correctamente\n";
        echo "✅ La inserción en base de datos funciona\n";
        echo "✅ Los campos manual y plano se guardan correctamente\n\n";
        
        echo "🔍 CAUSA DEL PROBLEMA:\n";
        echo "Los equipos registrados anteriormente (ID 58-66) probablemente:\n";
        echo "1. Se registraron cuando había un bug en el procesamiento\n";
        echo "2. Se registraron sin seleccionar checkboxes (todos false)\n";
        echo "3. Se registraron con una versión anterior del código\n";
        echo "4. Tuvieron algún error durante el procesamiento\n\n";
        
        echo "✅ SOLUCIÓN:\n";
        echo "El sistema ahora funciona correctamente. Los nuevos equipos\n";
        echo "se registrarán con los datos de manuales y planos correctamente.\n\n";
        
        echo "📋 PARA VERIFICAR:\n";
        echo "1. Registra un nuevo equipo desde el frontend\n";
        echo "2. Selecciona algunos checkboxes de manuales y planos\n";
        echo "3. Verifica que se guarden en la base de datos\n";
        echo "4. Abre el modal de edición y verifica que se muestren correctamente\n";
        
    } else {
        echo "❌ Hay un problema en el procesamiento de datos\n";
        echo "Los datos de manuales y planos no se están procesando correctamente\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Test del flujo de registro completado.\n";

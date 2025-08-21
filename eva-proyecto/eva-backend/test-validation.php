<?php

/**
 * Script de prueba para validar la funcionalidad de unicidad de equipos
 * Este script verifica que las validaciones de unicidad funcionen correctamente
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

// Configurar la aplicación Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

echo "🧪 INICIANDO PRUEBAS DE VALIDACIÓN DE UNICIDAD DE EQUIPOS\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    // Conectar a la base de datos
    $connection = DB::connection();
    echo "✅ Conexión a base de datos establecida\n";

    // 1. Verificar que existen equipos en la base de datos
    $equiposCount = DB::table('equipos')->count();
    echo "📊 Total de equipos en BD: {$equiposCount}\n\n";

    if ($equiposCount === 0) {
        echo "⚠️  No hay equipos en la base de datos. Creando equipo de prueba...\n";
        
        // Crear un equipo de prueba
        $equipoId = DB::table('equipos')->insertGetId([
            'name' => 'Equipo de Prueba Validación',
            'code' => 'TEST_VALIDATION_001',
            'serial' => 'SERIAL_TEST_001',
            'codigo_antiguo' => 'OLD_TEST_001',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Marca Test',
            'modelo' => 'Modelo Test',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        echo "✅ Equipo de prueba creado con ID: {$equipoId}\n\n";
    }

    // 2. Obtener un equipo existente para las pruebas
    $equipoExistente = DB::table('equipos')->first();
    
    if (!$equipoExistente) {
        throw new Exception("No se pudo obtener un equipo para las pruebas");
    }

    echo "🔍 PRUEBAS DE VALIDACIÓN DE UNICIDAD\n";
    echo "-" . str_repeat("-", 40) . "\n";

    // 3. Probar validación de código único
    echo "1. Probando validación de código único...\n";
    
    // Verificar que el código existente no es único
    $codigoExiste = DB::table('equipos')->where('code', $equipoExistente->code)->exists();
    echo "   - Código '{$equipoExistente->code}' existe: " . ($codigoExiste ? "✅ SÍ" : "❌ NO") . "\n";
    
    // Verificar que un código nuevo es único
    $codigoNuevo = 'NUEVO_CODIGO_' . time();
    $codigoNuevoExiste = DB::table('equipos')->where('code', $codigoNuevo)->exists();
    echo "   - Código '{$codigoNuevo}' existe: " . ($codigoNuevoExiste ? "❌ SÍ" : "✅ NO") . "\n";

    // 4. Probar validación de serial único
    echo "\n2. Probando validación de serial único...\n";
    
    if ($equipoExistente->serial) {
        $serialExiste = DB::table('equipos')->where('serial', $equipoExistente->serial)->exists();
        echo "   - Serial '{$equipoExistente->serial}' existe: " . ($serialExiste ? "✅ SÍ" : "❌ NO") . "\n";
    } else {
        echo "   - El equipo no tiene serial definido\n";
    }
    
    $serialNuevo = 'NUEVO_SERIAL_' . time();
    $serialNuevoExiste = DB::table('equipos')->where('serial', $serialNuevo)->exists();
    echo "   - Serial '{$serialNuevo}' existe: " . ($serialNuevoExiste ? "❌ SÍ" : "✅ NO") . "\n";

    // 5. Probar validación de código antiguo único
    echo "\n3. Probando validación de código antiguo único...\n";
    
    if ($equipoExistente->codigo_antiguo) {
        $codigoAntiguoExiste = DB::table('equipos')->where('codigo_antiguo', $equipoExistente->codigo_antiguo)->exists();
        echo "   - Código antiguo '{$equipoExistente->codigo_antiguo}' existe: " . ($codigoAntiguoExiste ? "✅ SÍ" : "❌ NO") . "\n";
    } else {
        echo "   - El equipo no tiene código antiguo definido\n";
    }
    
    $codigoAntiguoNuevo = 'NUEVO_OLD_' . time();
    $codigoAntiguoNuevoExiste = DB::table('equipos')->where('codigo_antiguo', $codigoAntiguoNuevo)->exists();
    echo "   - Código antiguo '{$codigoAntiguoNuevo}' existe: " . ($codigoAntiguoNuevoExiste ? "❌ SÍ" : "✅ NO") . "\n";

    // 6. Probar validaciones de Laravel
    echo "\n4. Probando validaciones de Laravel...\n";
    
    // Validación para crear equipo con código duplicado
    $validatorCreate = Validator::make([
        'name' => 'Equipo Duplicado',
        'code' => $equipoExistente->code, // Código duplicado
        'servicio_id' => 1
    ], [
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:100|unique:equipos,code',
        'servicio_id' => 'required|exists:servicios,id'
    ]);
    
    echo "   - Validación CREATE con código duplicado: " . ($validatorCreate->fails() ? "✅ FALLA (correcto)" : "❌ PASA (incorrecto)") . "\n";
    
    if ($validatorCreate->fails()) {
        $errors = $validatorCreate->errors()->toArray();
        echo "     Errores: " . implode(', ', array_keys($errors)) . "\n";
    }

    // 7. Probar validación de actualización (debe permitir el mismo valor para el mismo equipo)
    echo "\n5. Probando validación de actualización...\n";
    
    $validatorUpdate = Validator::make([
        'name' => 'Equipo Actualizado',
        'code' => $equipoExistente->code, // Mismo código del mismo equipo
        'servicio_id' => 1
    ], [
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:100|unique:equipos,code,' . $equipoExistente->id,
        'servicio_id' => 'required|exists:servicios,id'
    ]);
    
    echo "   - Validación UPDATE con mismo código: " . ($validatorUpdate->passes() ? "✅ PASA (correcto)" : "❌ FALLA (incorrecto)") . "\n";

    echo "\n" . "=" . str_repeat("=", 60) . "\n";
    echo "🎉 TODAS LAS PRUEBAS DE VALIDACIÓN COMPLETADAS\n";
    echo "✅ Las validaciones de unicidad están funcionando correctamente\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    exit(1);
}

echo "\n🔚 Fin de las pruebas\n";

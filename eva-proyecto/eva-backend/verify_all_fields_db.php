<?php

/**
 * Verificar todos los campos en la base de datos después de la actualización
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 VERIFICACIÓN COMPLETA DE TODOS LOS CAMPOS EN BD\n";
echo "==================================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipo) {
        echo "❌ Equipo ID 69 no encontrado\n";
        exit(1);
    }
    
    echo "✅ CAMPOS BÁSICOS DE TEXTO:\n";
    echo "===========================\n";
    echo "name: '{$equipo->name}'\n";
    echo "code: '{$equipo->code}'\n";
    echo "serial: '{$equipo->serial}'\n";
    echo "marca: '{$equipo->marca}'\n";
    echo "modelo: '{$equipo->modelo}'\n";
    echo "descripcion: '{$equipo->descripcion}'\n\n";
    
    echo "✅ CAMPOS NUMÉRICOS:\n";
    echo "====================\n";
    echo "costo: {$equipo->costo}\n";
    echo "vida_util: {$equipo->vida_util}\n\n";
    
    echo "✅ CAMPOS DE TEXTO ADICIONALES:\n";
    echo "===============================\n";
    echo "localizacion_actual: '{$equipo->localizacion_actual}'\n";
    echo "verificacion_inventario: '{$equipo->verificacion_inventario}'\n";
    echo "repuesto_pendiente: '{$equipo->repuesto_pendiente}'\n";
    echo "propiedad: '{$equipo->propiedad}'\n";
    echo "periodicidad: '{$equipo->periodicidad}'\n";
    echo "evaluacion_desempenio: '{$equipo->evaluacion_desempenio}'\n\n";
    
    echo "✅ CAMPOS BOOLEANOS:\n";
    echo "====================\n";
    echo "calibracion: {$equipo->calibracion}\n";
    echo "movilidad: {$equipo->movilidad}\n\n";
    
    echo "✅ IDs DE RELACIÓN:\n";
    echo "===================\n";
    echo "servicio_id: {$equipo->servicio_id}\n";
    echo "area_id: {$equipo->area_id}\n";
    echo "propietario_id: {$equipo->propietario_id}\n";
    echo "estadoequipo_id: {$equipo->estadoequipo_id}\n";
    echo "fuente_id: {$equipo->fuente_id}\n";
    echo "tecnologia_id: {$equipo->tecnologia_id}\n";
    echo "frecuencia_id: {$equipo->frecuencia_id}\n";
    echo "cbiomedica_id: {$equipo->cbiomedica_id}\n";
    echo "criesgo_id: {$equipo->criesgo_id}\n";
    echo "tadquisicion_id: {$equipo->tadquisicion_id}\n";
    echo "tipo_id: {$equipo->tipo_id}\n\n";
    
    echo "✅ CAMPOS JSON (CHECKBOXES):\n";
    echo "============================\n";
    echo "manual: {$equipo->manual}\n";
    echo "plano: {$equipo->plano}\n\n";
    
    // Parsear y mostrar checkboxes
    if ($equipo->manual) {
        $manuales = json_decode($equipo->manual, true);
        echo "📋 MANUALES (estados de checkboxes):\n";
        foreach ($manuales as $key => $value) {
            $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
            echo "   {$key}: {$status}\n";
        }
        echo "\n";
    }
    
    if ($equipo->plano) {
        $planos = json_decode($equipo->plano, true);
        echo "📋 PLANOS (estados de checkboxes):\n";
        foreach ($planos as $key => $value) {
            $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
            echo "   {$key}: {$status}\n";
        }
        echo "\n";
    }
    
    echo "✅ INFORMACIÓN DE ACTUALIZACIÓN:\n";
    echo "================================\n";
    echo "fecha_cambio: {$equipo->fecha_cambio}\n";
    echo "status: {$equipo->status}\n\n";
    
    // Verificar si los datos coinciden con la prueba
    $expectedName = 'EQUIPO COMPLETAMENTE ACTUALIZADO - TODOS LOS CAMPOS';
    $expectedCode = 'CODE-UPDATED-2025';
    $expectedSerial = 'SERIAL-UPDATED-2025';
    
    echo "🎯 VERIFICACIÓN DE ACTUALIZACIÓN:\n";
    echo "=================================\n";
    
    if ($equipo->name === $expectedName) {
        echo "✅ Nombre actualizado correctamente\n";
    } else {
        echo "⚠️ Nombre no coincide con la prueba\n";
        echo "   Esperado: '{$expectedName}'\n";
        echo "   Actual: '{$equipo->name}'\n";
    }
    
    if ($equipo->code === $expectedCode) {
        echo "✅ Código actualizado correctamente\n";
    } else {
        echo "⚠️ Código no coincide con la prueba\n";
        echo "   Esperado: '{$expectedCode}'\n";
        echo "   Actual: '{$equipo->code}'\n";
    }
    
    if ($equipo->serial === $expectedSerial) {
        echo "✅ Serial actualizado correctamente\n";
    } else {
        echo "⚠️ Serial no coincide con la prueba\n";
        echo "   Esperado: '{$expectedSerial}'\n";
        echo "   Actual: '{$equipo->serial}'\n";
    }
    
    // Verificar timestamp de actualización
    $lastUpdate = new DateTime($equipo->fecha_cambio);
    $now = new DateTime();
    $diff = $now->diff($lastUpdate);
    
    if ($diff->i < 5) {
        echo "✅ Actualizado recientemente (hace {$diff->i} minutos, {$diff->s} segundos)\n";
    } else {
        echo "⚠️ No se ha actualizado recientemente\n";
    }
    
    echo "\n🎯 RESUMEN PARA FRONTEND:\n";
    echo "========================\n";
    echo "El modal de edición debe mostrar estos valores:\n\n";
    
    echo "📝 CAMPOS DE TEXTO:\n";
    echo "   • Nombre: '{$equipo->name}'\n";
    echo "   • Código: '{$equipo->code}'\n";
    echo "   • Serial: '{$equipo->serial}'\n";
    echo "   • Marca: '{$equipo->marca}'\n";
    echo "   • Modelo: '{$equipo->modelo}'\n";
    echo "   • Descripción: '{$equipo->descripcion}'\n";
    echo "   • Localización: '{$equipo->localizacion_actual}'\n";
    echo "   • Costo: {$equipo->costo}\n";
    echo "   • Vida útil: {$equipo->vida_util}\n\n";
    
    echo "📋 DROPDOWNS (deben mostrar valores seleccionados):\n";
    echo "   • Servicio ID: {$equipo->servicio_id}\n";
    echo "   • Área ID: {$equipo->area_id}\n";
    echo "   • Propietario ID: {$equipo->propietario_id}\n";
    echo "   • Estado ID: {$equipo->estadoequipo_id}\n\n";
    
    if ($equipo->manual) {
        $manuales = json_decode($equipo->manual, true);
        echo "☑️ CHECKBOXES MANUALES:\n";
        foreach ($manuales as $key => $value) {
            $status = $value ? 'MARCADO' : 'DESMARCADO';
            echo "   • " . ucfirst($key) . ": {$status}\n";
        }
        echo "\n";
    }
    
    if ($equipo->plano) {
        $planos = json_decode($equipo->plano, true);
        echo "☑️ CHECKBOXES PLANOS:\n";
        foreach ($planos as $key => $value) {
            $status = $value ? 'MARCADO' : 'DESMARCADO';
            echo "   • " . ucfirst($key) . ": {$status}\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "📋 Verificación completa de campos terminada.\n";

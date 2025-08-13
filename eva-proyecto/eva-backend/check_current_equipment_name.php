<?php

/**
 * Verificar el nombre actual del equipo en la base de datos
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 VERIFICANDO NOMBRE ACTUAL DEL EQUIPO ID 69\n";
echo "=============================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipo) {
        echo "❌ Equipo ID 69 no encontrado\n";
        exit(1);
    }
    
    echo "✅ DATOS ACTUALES DEL EQUIPO ID 69:\n";
    echo "===================================\n";
    echo "ID: {$equipo->id}\n";
    echo "Nombre: '{$equipo->name}'\n";
    echo "Código: '{$equipo->code}'\n";
    echo "Serial: '{$equipo->serial}'\n";
    echo "Descripción: '{$equipo->descripcion}'\n";
    echo "Fecha de cambio: {$equipo->fecha_cambio}\n";
    echo "Status: {$equipo->status}\n\n";
    
    // Verificar si el nombre contiene cambios recientes
    $testNames = [
        'Test Registration Flow - EDITADO',
        'Test Registration Flow - API TEST SUCCESS',
        'Test Registration Flow - FINAL TEST',
        'Test Registration Flow - UPDATED'
    ];
    
    echo "📋 VERIFICACIÓN DE CAMBIOS RECIENTES:\n";
    echo "====================================\n";
    
    $foundMatch = false;
    foreach ($testNames as $testName) {
        if ($equipo->name === $testName) {
            echo "✅ COINCIDENCIA EXACTA: '{$testName}'\n";
            $foundMatch = true;
        } elseif (strpos($equipo->name, $testName) !== false) {
            echo "✅ COINCIDENCIA PARCIAL: Contiene '{$testName}'\n";
            $foundMatch = true;
        }
    }
    
    if (!$foundMatch) {
        echo "⚠️ No se encontraron coincidencias con nombres de prueba conocidos\n";
        echo "   Nombre actual: '{$equipo->name}'\n";
    }
    
    // Verificar la última actualización
    $lastUpdate = new DateTime($equipo->fecha_cambio);
    $now = new DateTime();
    $diff = $now->diff($lastUpdate);
    
    echo "\n📋 INFORMACIÓN DE ACTUALIZACIÓN:\n";
    echo "================================\n";
    echo "Última actualización: {$equipo->fecha_cambio}\n";
    echo "Tiempo transcurrido: {$diff->h} horas, {$diff->i} minutos, {$diff->s} segundos\n";
    
    if ($diff->h == 0 && $diff->i < 10) {
        echo "✅ Actualizado muy recientemente (menos de 10 minutos)\n";
    } else {
        echo "⚠️ No se ha actualizado recientemente\n";
    }
    
    echo "\n📋 VERIFICACIÓN DEL ENDPOINT COMPLETE-INFO:\n";
    echo "==========================================\n";
    
    // Simular lo que devuelve el endpoint complete-info
    $equipoData = (array) $equipo;
    
    // Agregar información de relaciones
    $servicio = DB::table('servicios')->where('id', $equipo->servicio_id)->first();
    if ($servicio) {
        $equipoData['servicio_nombre'] = $servicio->name;
        
        $sede = DB::table('sedes')->where('id', $servicio->sede_id)->first();
        if ($sede) {
            $equipoData['sede_id'] = $sede->id;
            $equipoData['sede_nombre'] = $sede->name;
        }
    }
    
    $area = DB::table('areas')->where('id', $equipo->area_id)->first();
    if ($area) {
        $equipoData['area_nombre'] = $area->name;
    }
    
    $propietario = DB::table('propietarios')->where('id', $equipo->propietario_id)->first();
    if ($propietario) {
        $equipoData['propietario_nombre'] = $propietario->nombre;
    }
    
    $estado = DB::table('estadoequipos')->where('id', $equipo->estadoequipo_id)->first();
    if ($estado) {
        $equipoData['estado_nombre'] = $estado->name;
    }
    
    echo "✅ Datos que devuelve complete-info:\n";
    echo "   ID: {$equipoData['id']}\n";
    echo "   Nombre: '{$equipoData['name']}'\n";
    echo "   Servicio: " . ($equipoData['servicio_nombre'] ?? 'N/A') . "\n";
    echo "   Área: " . ($equipoData['area_nombre'] ?? 'N/A') . "\n";
    echo "   Propietario: " . ($equipoData['propietario_nombre'] ?? 'N/A') . "\n";
    echo "   Estado: " . ($equipoData['estado_nombre'] ?? 'N/A') . "\n";
    
    echo "\n🎯 DIAGNÓSTICO:\n";
    echo "===============\n";
    
    if ($foundMatch && $diff->h == 0 && $diff->i < 10) {
        echo "✅ EL EQUIPO SÍ SE ACTUALIZÓ EN LA BASE DE DATOS\n";
        echo "✅ El nombre actual es: '{$equipo->name}'\n";
        echo "✅ La actualización fue reciente\n\n";
        
        echo "🔧 PROBLEMA IDENTIFICADO:\n";
        echo "El frontend NO está refrescando los datos después de la actualización.\n\n";
        
        echo "🚀 POSIBLES CAUSAS:\n";
        echo "1. El callback onEquipmentUpdated no está funcionando\n";
        echo "2. La lista de equipos no se está recargando\n";
        echo "3. El cache del frontend no se está limpiando\n";
        echo "4. El componente padre no está actualizando el estado\n\n";
        
        echo "🔧 SOLUCIONES A IMPLEMENTAR:\n";
        echo "1. Verificar que onEquipmentUpdated() se ejecute correctamente\n";
        echo "2. Forzar recarga de la lista de equipos\n";
        echo "3. Actualizar el estado local del componente\n";
        echo "4. Agregar logs para verificar el flujo de actualización\n";
        
    } else {
        echo "❌ EL EQUIPO NO SE ACTUALIZÓ CORRECTAMENTE\n";
        echo "⚠️ Nombre actual: '{$equipo->name}'\n";
        echo "⚠️ Última actualización: {$equipo->fecha_cambio}\n\n";
        
        echo "🔧 PROBLEMA IDENTIFICADO:\n";
        echo "La actualización no llegó a la base de datos.\n\n";
        
        echo "🚀 VERIFICAR:\n";
        echo "1. Si el endpoint de actualización se está llamando\n";
        echo "2. Si hay errores en la consola del navegador\n";
        echo "3. Si la respuesta del API es exitosa\n";
        echo "4. Si los datos se están enviando correctamente\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Verificación del nombre del equipo completada.\n";

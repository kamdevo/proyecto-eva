<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 VERIFICANDO EQUIPOS DISPONIBLES EN EL FRONTEND\n";
echo "================================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Verificar equipos con tipo_id = 1 (equipos médicos)
    $equiposMedicos = DB::table('equipos')
        ->where('tipo_id', 1)
        ->where('status', 1)
        ->orderBy('id', 'desc')
        ->limit(15)
        ->get(['id', 'name', 'serial', 'code', 'tipo_id', 'status', 'manual', 'plano']);
    
    echo "Equipos médicos disponibles (últimos 15):\n";
    foreach ($equiposMedicos as $equipo) {
        $hasManual = !empty($equipo->manual) ? '✓' : '○';
        $hasPlano = !empty($equipo->plano) ? '✓' : '○';
        echo "   ID: {$equipo->id} - {$equipo->name}\n";
        echo "     Serial: {$equipo->serial}\n";
        echo "     Manual: {$hasManual} | Plano: {$hasPlano}\n\n";
    }
    
    // Verificar el equipo ID 69 específicamente
    $equipo69 = DB::table('equipos')->where('id', 69)->first();
    if ($equipo69) {
        echo "Equipo ID 69 encontrado:\n";
        echo "   Nombre: {$equipo69->name}\n";
        echo "   Serial: {$equipo69->serial}\n";
        echo "   Tipo ID: {$equipo69->tipo_id}\n";
        echo "   Status: {$equipo69->status}\n";
        
        if ($equipo69->tipo_id != 1) {
            echo "   ⚠️ PROBLEMA: tipo_id es {$equipo69->tipo_id}, debería ser 1 para equipos médicos\n";
            
            // Corregir el tipo_id
            DB::table('equipos')->where('id', 69)->update(['tipo_id' => 1]);
            echo "   ✅ CORREGIDO: tipo_id cambiado a 1\n";
        }
        if ($equipo69->status != 1) {
            echo "   ⚠️ PROBLEMA: status es {$equipo69->status}, debería ser 1 para equipos activos\n";
            
            // Corregir el status
            DB::table('equipos')->where('id', 69)->update(['status' => 1]);
            echo "   ✅ CORREGIDO: status cambiado a 1\n";
        }
    } else {
        echo "❌ Equipo ID 69 no encontrado\n";
    }
    
    // Verificar otros equipos de prueba
    echo "\nVerificando otros equipos de prueba:\n";
    $equiposPrueba = DB::table('equipos')
        ->whereIn('id', [67, 68, 69])
        ->get(['id', 'name', 'serial', 'tipo_id', 'status']);
    
    foreach ($equiposPrueba as $equipo) {
        echo "   ID: {$equipo->id} - {$equipo->name} (Tipo: {$equipo->tipo_id}, Status: {$equipo->status})\n";
        
        // Corregir si es necesario
        if ($equipo->tipo_id != 1 || $equipo->status != 1) {
            DB::table('equipos')->where('id', $equipo->id)->update([
                'tipo_id' => 1,
                'status' => 1
            ]);
            echo "     ✅ Corregido tipo_id y status\n";
        }
    }
    
    echo "\n🎯 EQUIPOS RECOMENDADOS PARA PRUEBA:\n";
    echo "====================================\n";
    
    $equiposConDatos = DB::table('equipos')
        ->where('tipo_id', 1)
        ->where('status', 1)
        ->whereNotNull('manual')
        ->whereNotNull('plano')
        ->where('manual', '!=', '')
        ->where('plano', '!=', '')
        ->orderBy('id', 'desc')
        ->limit(5)
        ->get(['id', 'name', 'serial', 'manual', 'plano']);
    
    foreach ($equiposConDatos as $equipo) {
        echo "✅ ID: {$equipo->id} - {$equipo->name}\n";
        echo "   Serial: {$equipo->serial}\n";
        
        // Mostrar estado de checkboxes
        $manuales = json_decode($equipo->manual, true);
        $planos = json_decode($equipo->plano, true);
        
        if ($manuales) {
            echo "   Manuales: ";
            foreach ($manuales as $key => $value) {
                if ($value) echo "{$key} ✓ ";
            }
            echo "\n";
        }
        
        if ($planos) {
            echo "   Planos: ";
            foreach ($planos as $key => $value) {
                if ($value) echo "{$key} ✓ ";
            }
            echo "\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "📋 Verificación completada.\n";

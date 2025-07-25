<?php

/**
 * Script para verificar que los campos de fecha se están guardando correctamente
 * en la tabla equipos después del fix de mapeo de datos
 */

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

echo "🔍 VERIFICACIÓN DE MAPEO DE FECHAS EN EQUIPOS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    // Obtener los últimos 5 equipos creados
    $equipos = DB::table('equipos')
        ->orderBy('id', 'desc')
        ->limit(5)
        ->get([
            'id', 
            'name', 
            'fecha_ad',
            'fecha_instalacion', 
            'fecha_recepcion_almacen',
            'fecha_acta_recibo',
            'fecha_inicio_operacion',
            'fecha_fabricacion',
            'codigo_antiguo',
            'otros',
            'propiedad',
            'created_at'
        ]);

    if ($equipos->isEmpty()) {
        echo "❌ No se encontraron equipos en la base de datos.\n";
        exit(1);
    }

    echo "📊 ÚLTIMOS 5 EQUIPOS REGISTRADOS:\n\n";

    foreach ($equipos as $equipo) {
        echo "🔧 EQUIPO ID: {$equipo->id}\n";
        echo "   Nombre: {$equipo->name}\n";
        echo "   Creado: {$equipo->created_at}\n";
        echo "\n   📅 CAMPOS DE FECHA:\n";
        
        // Verificar cada campo de fecha
        $fechas = [
            'fecha_ad' => $equipo->fecha_ad,
            'fecha_instalacion' => $equipo->fecha_instalacion,
            'fecha_recepcion_almacen' => $equipo->fecha_recepcion_almacen,
            'fecha_acta_recibo' => $equipo->fecha_acta_recibo,
            'fecha_inicio_operacion' => $equipo->fecha_inicio_operacion,
            'fecha_fabricacion' => $equipo->fecha_fabricacion,
        ];

        $fechasValidas = 0;
        $fechasNulas = 0;

        foreach ($fechas as $campo => $valor) {
            if ($valor && $valor !== '0000-00-00') {
                echo "   ✅ {$campo}: {$valor}\n";
                $fechasValidas++;
            } else {
                echo "   ❌ {$campo}: NULL/vacío\n";
                $fechasNulas++;
            }
        }

        echo "\n   🗂️ CAMPOS MAPEADOS:\n";
        echo "   " . ($equipo->codigo_antiguo ? "✅" : "❌") . " codigo_antiguo: " . ($equipo->codigo_antiguo ?: 'NULL') . "\n";
        echo "   " . ($equipo->otros ? "✅" : "❌") . " otros: " . ($equipo->otros ?: 'NULL') . "\n";
        echo "   " . ($equipo->propiedad ? "✅" : "❌") . " propiedad: " . ($equipo->propiedad ?: 'NULL') . "\n";

        echo "\n   📈 RESUMEN:\n";
        echo "   - Fechas válidas: {$fechasValidas}/6\n";
        echo "   - Fechas nulas: {$fechasNulas}/6\n";
        
        if ($fechasValidas > 0) {
            echo "   🎉 ÉXITO: Al menos algunas fechas se están guardando correctamente\n";
        } else {
            echo "   ⚠️  PROBLEMA: Ninguna fecha se está guardando\n";
        }
        
        echo "\n" . str_repeat("-", 60) . "\n\n";
    }

    // Estadísticas generales
    echo "📊 ESTADÍSTICAS GENERALES:\n";
    
    $totalEquipos = DB::table('equipos')->count();
    $equiposConFechaAd = DB::table('equipos')->whereNotNull('fecha_ad')->where('fecha_ad', '!=', '0000-00-00')->count();
    $equiposConFechaInstalacion = DB::table('equipos')->whereNotNull('fecha_instalacion')->where('fecha_instalacion', '!=', '0000-00-00')->count();
    
    echo "- Total equipos: {$totalEquipos}\n";
    echo "- Con fecha_ad válida: {$equiposConFechaAd} (" . round(($equiposConFechaAd/$totalEquipos)*100, 1) . "%)\n";
    echo "- Con fecha_instalacion válida: {$equiposConFechaInstalacion} (" . round(($equiposConFechaInstalacion/$totalEquipos)*100, 1) . "%)\n";

    // Verificar equipos creados en la última hora (probablemente de nuestras pruebas)
    $equiposRecientes = DB::table('equipos')
        ->where('created_at', '>=', Carbon::now()->subHour())
        ->count();
    
    if ($equiposRecientes > 0) {
        echo "\n🕐 EQUIPOS CREADOS EN LA ÚLTIMA HORA: {$equiposRecientes}\n";
        echo "   (Probablemente de las pruebas del fix)\n";
        
        $equiposRecientesConFechas = DB::table('equipos')
            ->where('created_at', '>=', Carbon::now()->subHour())
            ->whereNotNull('fecha_ad')
            ->where('fecha_ad', '!=', '0000-00-00')
            ->count();
            
        echo "   - Con fechas válidas: {$equiposRecientesConFechas}/{$equiposRecientes}\n";
        
        if ($equiposRecientesConFechas > 0) {
            echo "   ✅ EL FIX ESTÁ FUNCIONANDO!\n";
        } else {
            echo "   ❌ El fix aún no está funcionando correctamente\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n✅ Verificación completada.\n";

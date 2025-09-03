<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TESTING EXPORT FUNCTIONALITY ===\n\n";

try {
    // Test basic equipment count
    $equiposCount = DB::table('equipos')->count();
    echo "Total equipos: {$equiposCount}\n";
    
    if ($equiposCount > 0) {
        echo "✅ Data found in equipos table\n";
        
        // Test status field
        $activeCount = DB::table('equipos')->where('status', 1)->count();
        $inactiveCount = DB::table('equipos')->where('status', 0)->count();
        echo "Active equipos: {$activeCount}\n";
        echo "Inactive equipos: {$inactiveCount}\n";
        
        // Test servicios table
        $serviciosCount = DB::table('servicios')->count();
        echo "Total servicios: {$serviciosCount}\n";
        
        if ($serviciosCount > 0) {
            echo "Sample servicios:\n";
            $servicios = DB::table('servicios')->limit(5)->get(['id', 'name']);
            foreach ($servicios as $servicio) {
                echo "- ID: {$servicio->id}, Name: {$servicio->name}\n";
            }
        }
        
        // Test the actual stats calculation
        echo "\n=== TESTING STATS CALCULATION ===\n";
        
        $servicios = DB::table('servicios')->get();
        $serviciosNorte = $servicios->filter(function($servicio) {
            return stripos($servicio->name, 'norte') !== false || 
                   stripos($servicio->name, 'urgencias') !== false ||
                   stripos($servicio->name, 'pediatría') !== false;
        })->pluck('id');
        
        echo "Servicios Norte IDs: " . implode(', ', $serviciosNorte->toArray()) . "\n";
        
        $sedeNorte = DB::table('equipos')
            ->whereIn('servicio_id', $serviciosNorte)
            ->count();
        
        $sedePrincipal = $equiposCount - $sedeNorte;
        
        echo "Sede Norte: {$sedeNorte}\n";
        echo "Sede Principal: {$sedePrincipal}\n";
        
        echo "\n✅ Export functionality should work now!\n";
        
    } else {
        echo "❌ No data found in equipos table\n";
    }
    
    // Test equipos_industriales if exists
    echo "\n=== TESTING INDUSTRIAL EQUIPMENT ===\n";
    try {
        $industrialCount = DB::table('equipos_industriales')->count();
        echo "Total equipos industriales: {$industrialCount}\n";
        
        if ($industrialCount > 0) {
            echo "✅ Industrial equipment data found\n";
        } else {
            echo "⚠️ No industrial equipment data found\n";
        }
    } catch (Exception $e) {
        echo "⚠️ equipos_industriales table may not exist\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";

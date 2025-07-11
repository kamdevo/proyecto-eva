<?php

use Illuminate\Support\Facades\DB;

try {
    echo "🔧 Insertando equipos médicos de prueba...\n";
    
    $sql = file_get_contents('../insertar-equipos-simple.sql');
    DB::unprepared($sql);
    
    echo "✅ Equipos insertados exitosamente\n";
    
    // Verificar la inserción
    $totalEquipos = DB::table('equipos')->where('tipo_id', 1)->where('status', '!=', 0)->count();
    echo "📊 Total de equipos médicos en la base de datos: $totalEquipos\n";
    
    // Mostrar los equipos insertados
    $equipos = DB::table('equipos')
        ->select('id', 'name', 'code', 'marca', 'modelo')
        ->where('tipo_id', 1)
        ->where('status', '!=', 0)
        ->get();
        
    echo "📋 Equipos en la base de datos:\n";
    foreach ($equipos as $equipo) {
        echo "  - ID: {$equipo->id} | {$equipo->name} | {$equipo->code} | {$equipo->marca} {$equipo->modelo}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

<?php

use Illuminate\Support\Facades\DB;

// Script para insertar equipos médicos de prueba con valores por defecto

try {
    echo "🔧 Insertando equipos médicos de prueba...\n";
    
    // Insertar primer equipo médico de prueba con todos los campos requeridos
    $equipo1Id = DB::table('equipos')->insertGetId([
        'name' => 'Monitor de Signos Vitales Philips',
        'code' => 'MSV-001',
        'serial' => 'PHL-MSV-2024-001',
        'marca' => 'Philips',
        'modelo' => 'IntelliVue MX40',
        'descripcion' => 'Monitor portátil de signos vitales',
        'servicio_id' => 1,
        'area_id' => 1,
        'estadoequipo_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'propietario_id' => 1,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'tadquisicion_id' => 1,
        'invima_id' => 1,
        'baja_id' => 1,
        'tipo_id' => 1, // Equipo médico
        'status' => 1,
        'fecha_ad' => now(),
        'fecha_instalacion' => now()->subDays(30),
        'vida_util' => 10,
        'costo' => 15000.00,
        'garantia' => 24,
        'created_at' => now(),
        'v1' => 110,
        'v2' => 220,
        'v3' => 0,
        'plan' => 1,
        'necesidad_id' => 1,
        'guia_id' => 1,
        'manual_id' => 1,
        'disponibilidad_id' => 1
    ]);
    
    echo "✅ Equipo 1 insertado: Monitor de Signos Vitales Philips (ID: $equipo1Id)\n";
    
    // Insertar segundo equipo médico de prueba
    $equipo2Id = DB::table('equipos')->insertGetId([
        'name' => 'Ventilador Mecánico Hamilton',
        'code' => 'VM-002', 
        'serial' => 'HAM-VM-2024-002',
        'marca' => 'Hamilton Medical',
        'modelo' => 'HAMILTON-C3',
        'descripcion' => 'Ventilador mecánico para soporte respiratorio',
        'servicio_id' => 1,
        'area_id' => 1,
        'estadoequipo_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'propietario_id' => 1,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'tadquisicion_id' => 1,
        'invima_id' => 1,
        'baja_id' => 1,
        'tipo_id' => 1, // Equipo médico
        'status' => 1,
        'fecha_ad' => now(),
        'fecha_instalacion' => now()->subDays(15),
        'vida_util' => 15,
        'costo' => 45000.00,
        'garantia' => 36,
        'created_at' => now(),
        'v1' => 110,
        'v2' => 220,
        'v3' => 0,
        'plan' => 1,
        'necesidad_id' => 1,
        'guia_id' => 1,
        'manual_id' => 1,
        'disponibilidad_id' => 1
    ]);
    
    echo "✅ Equipo 2 insertado: Ventilador Mecánico Hamilton (ID: $equipo2Id)\n";
    
    // Verificar la inserción
    $totalEquipos = DB::table('equipos')->where('tipo_id', 1)->where('status', '!=', 0)->count();
    echo "\n📊 Total de equipos médicos en la base de datos: $totalEquipos\n";
    
    // Mostrar los equipos insertados
    $equipos = DB::table('equipos')
        ->select('id', 'name', 'code', 'marca', 'modelo', 'serial')
        ->where('tipo_id', 1)
        ->where('status', '!=', 0)
        ->get();
        
    echo "\n📋 Equipos en la base de datos:\n";
    foreach ($equipos as $equipo) {
        echo "  - ID: {$equipo->id} | {$equipo->name} | {$equipo->code} | {$equipo->marca} {$equipo->modelo}\n";
    }
    
    echo "\n✅ Equipos de prueba insertados exitosamente\n";
    echo "🌐 Ahora puedes verificar el frontend en: http://localhost:5174\n";
    
} catch (Exception $e) {
    echo "❌ Error al insertar equipos: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

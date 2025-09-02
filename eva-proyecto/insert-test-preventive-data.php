<?php

// Script para insertar datos de prueba en la tabla planes_mantenimientos

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "📝 Insertando datos de prueba en planes_mantenimientos...\n";
    
    // Verificar si ya hay datos
    $existingCount = DB::table('planes_mantenimientos')->count();
    echo "📊 Registros existentes: $existingCount\n";
    
    // Obtener algunos equipos para los datos de prueba
    $equipos = DB::table('equipos')->limit(5)->get();
    
    if ($equipos->count() === 0) {
        echo "❌ No hay equipos disponibles. No se pueden crear datos de prueba.\n";
        exit;
    }
    
    echo "🔧 Equipos encontrados: " . $equipos->count() . "\n";
    
    $testData = [
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento preventivo trimestral - Revisión general del sistema',
            'fecha_programada' => date('Y-m-d', strtotime('+15 days')),
            'responsable' => 'Juan Pérez',
            'estado' => 'programado',
            'observaciones' => 'Incluye limpieza, calibración y verificación de componentes',
            'costo_estimado' => 250.00,
            'repuestos_necesarios' => 'Filtros, lubricantes, sellos',
            'frecuencia_dias' => 90
        ],
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento preventivo mensual - Inspección de seguridad',
            'fecha_programada' => date('Y-m-d', strtotime('+30 days')),
            'responsable' => 'María González',
            'estado' => 'programado',
            'observaciones' => 'Verificación de sistemas de seguridad y alarmas',
            'costo_estimado' => 150.00,
            'repuestos_necesarios' => 'Baterías, sensores',
            'frecuencia_dias' => 30
        ],
        [
            'tipo_mantenimiento' => 'Correctivo',
            'descripcion' => 'Reparación de componente defectuoso detectado en inspección',
            'fecha_programada' => date('Y-m-d', strtotime('+7 days')),
            'responsable' => 'Carlos Rodríguez',
            'estado' => 'en_progreso',
            'observaciones' => 'Componente identificado como crítico, requiere atención inmediata',
            'costo_estimado' => 500.00,
            'repuestos_necesarios' => 'Módulo de control, cables',
            'frecuencia_dias' => null
        ],
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento anual completo - Overhaul general',
            'fecha_programada' => date('Y-m-d', strtotime('+180 days')),
            'responsable' => 'Ana Martínez',
            'estado' => 'programado',
            'observaciones' => 'Mantenimiento mayor programado según especificaciones del fabricante',
            'costo_estimado' => 1200.00,
            'repuestos_necesarios' => 'Kit completo de mantenimiento, aceites especiales',
            'frecuencia_dias' => 365
        ],
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento completado - Verificación post-servicio',
            'fecha_programada' => date('Y-m-d', strtotime('-15 days')),
            'fecha_mantenimiento' => date('Y-m-d', strtotime('-10 days')),
            'responsable' => 'Luis Fernández',
            'estado' => 'completado',
            'observaciones' => 'Mantenimiento ejecutado exitosamente. Equipo funcionando óptimamente.',
            'costo_estimado' => 300.00,
            'repuestos_necesarios' => 'Filtros, correas',
            'frecuencia_dias' => 60
        ]
    ];
    
    $insertedCount = 0;
    
    foreach ($equipos as $index => $equipo) {
        if ($index < count($testData)) {
            $data = $testData[$index];
            $data['equipo_id'] = $equipo->id;
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            DB::table('planes_mantenimientos')->insert($data);
            $insertedCount++;
            
            echo "✅ Insertado plan para equipo: {$equipo->name} ({$equipo->code})\n";
        }
    }
    
    // Si hay más equipos, crear algunos planes adicionales básicos
    if ($equipos->count() > count($testData)) {
        $remainingEquipos = $equipos->slice(count($testData));
        
        foreach ($remainingEquipos as $equipo) {
            DB::table('planes_mantenimientos')->insert([
                'equipo_id' => $equipo->id,
                'tipo_mantenimiento' => 'Preventivo',
                'descripcion' => 'Mantenimiento preventivo estándar para ' . $equipo->name,
                'fecha_programada' => date('Y-m-d', strtotime('+' . rand(20, 60) . ' days')),
                'responsable' => 'Técnico Asignado',
                'estado' => 'programado',
                'observaciones' => 'Mantenimiento de rutina programado',
                'costo_estimado' => rand(100, 400),
                'repuestos_necesarios' => 'Por determinar según inspección',
                'frecuencia_dias' => 90,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            $insertedCount++;
            
            echo "✅ Insertado plan básico para equipo: {$equipo->name}\n";
        }
    }
    
    $totalCount = DB::table('planes_mantenimientos')->count();
    
    echo "\n🎉 Datos de prueba insertados exitosamente!\n";
    echo "📊 Total de registros insertados: $insertedCount\n";
    echo "📊 Total de registros en la tabla: $totalCount\n";
    echo "\n✅ La tabla planes_mantenimientos está lista para usar con el modal.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . " línea " . $e->getLine() . "\n";
}

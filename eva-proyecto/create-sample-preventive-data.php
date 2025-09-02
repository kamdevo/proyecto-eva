<?php

// Script para crear datos de muestra con la estructura correcta

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "🔧 Creando datos de muestra para planes_mantenimientos...\n";
    
    // Obtener algunos equipos
    $equipos = DB::table('equipos')->limit(5)->get();
    
    if ($equipos->count() === 0) {
        echo "❌ No hay equipos disponibles\n";
        exit;
    }
    
    echo "🔧 Equipos encontrados: " . $equipos->count() . "\n";
    
    // Limpiar registros de prueba anteriores (opcional)
    DB::table('planes_mantenimientos')->where('descripcion', 'LIKE', 'Mantenimiento de prueba%')->delete();
    
    $sampleData = [
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento de prueba - Revisión general del sistema',
            'fecha_programada' => date('Y-m-d', strtotime('+15 days')),
            'responsable' => 'Juan Pérez - Técnico',
            'estado' => 'programado',
            'observaciones' => 'Incluye limpieza, calibración y verificación de componentes principales',
            'costo_estimado' => 250.00,
            'repuestos_necesarios' => 'Filtros, lubricantes, sellos de goma',
            'frecuencia_dias' => 90
        ],
        [
            'tipo_mantenimiento' => 'Correctivo',
            'descripcion' => 'Mantenimiento de prueba - Reparación de componente defectuoso',
            'fecha_programada' => date('Y-m-d', strtotime('+7 days')),
            'responsable' => 'María González - Especialista',
            'estado' => 'en_progreso',
            'observaciones' => 'Componente identificado como crítico, requiere atención inmediata',
            'costo_estimado' => 500.00,
            'repuestos_necesarios' => 'Módulo de control, cables especializados',
            'frecuencia_dias' => null
        ],
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento de prueba - Inspección mensual de seguridad',
            'fecha_programada' => date('Y-m-d', strtotime('+30 days')),
            'responsable' => 'Carlos Rodríguez - Inspector',
            'estado' => 'programado',
            'observaciones' => 'Verificación de sistemas de seguridad y alarmas',
            'costo_estimado' => 150.00,
            'repuestos_necesarios' => 'Baterías, sensores de proximidad',
            'frecuencia_dias' => 30
        ],
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento de prueba - Servicio completado exitosamente',
            'fecha_programada' => date('Y-m-d', strtotime('-15 days')),
            'fecha_mantenimiento' => date('Y-m-d', strtotime('-10 days')),
            'responsable' => 'Ana Martínez - Técnico Senior',
            'estado' => 'completado',
            'observaciones' => 'Mantenimiento ejecutado exitosamente. Equipo funcionando óptimamente.',
            'costo_estimado' => 300.00,
            'repuestos_necesarios' => 'Filtros de aire, correas de transmisión',
            'frecuencia_dias' => 60
        ],
        [
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Mantenimiento de prueba - Overhaul programado',
            'fecha_programada' => date('Y-m-d', strtotime('+180 days')),
            'responsable' => 'Luis Fernández - Jefe de Mantenimiento',
            'estado' => 'programado',
            'observaciones' => 'Mantenimiento mayor programado según especificaciones del fabricante',
            'costo_estimado' => 1200.00,
            'repuestos_necesarios' => 'Kit completo de mantenimiento, aceites especiales',
            'frecuencia_dias' => 365
        ]
    ];
    
    $insertedCount = 0;
    
    foreach ($equipos as $index => $equipo) {
        if ($index < count($sampleData)) {
            $data = $sampleData[$index];
            $data['equipo_id'] = $equipo->id;
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            $insertId = DB::table('planes_mantenimientos')->insertGetId($data);
            $insertedCount++;
            
            echo "✅ Insertado plan ID $insertId para equipo: {$equipo->name} ({$equipo->code})\n";
            echo "   - Tipo: {$data['tipo_mantenimiento']}\n";
            echo "   - Estado: {$data['estado']}\n";
            echo "   - Fecha: {$data['fecha_programada']}\n";
        }
    }
    
    echo "\n📊 Total de registros de prueba insertados: $insertedCount\n";
    
    // Verificar que los datos se insertaron correctamente
    echo "\n🔍 Verificando datos insertados...\n";
    
    $testQuery = DB::table('planes_mantenimientos')
        ->select('planes_mantenimientos.*')
        ->leftJoin('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
        ->selectRaw('equipos.name as equipo_name, equipos.code as equipo_code')
        ->where('planes_mantenimientos.descripcion', 'LIKE', 'Mantenimiento de prueba%')
        ->orderBy('planes_mantenimientos.id', 'desc')
        ->limit(3)
        ->get();
    
    if ($testQuery->count() > 0) {
        echo "✅ Datos verificados exitosamente:\n";
        foreach ($testQuery as $record) {
            echo "   - ID: {$record->id}\n";
            echo "     Tipo: {$record->tipo_mantenimiento}\n";
            echo "     Descripción: " . substr($record->descripcion, 0, 50) . "...\n";
            echo "     Estado: {$record->estado}\n";
            echo "     Equipo: {$record->equipo_name}\n";
            echo "\n";
        }
    }
    
    echo "🎉 Datos de prueba creados exitosamente!\n";
    echo "💡 Ahora el modal debería mostrar estos registros de prueba.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

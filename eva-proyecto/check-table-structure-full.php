<?php

// Script para verificar la estructura completa de la tabla

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    echo "🔍 Verificando estructura completa de planes_mantenimientos...\n";
    
    // Obtener información detallada de las columnas
    $columns = DB::select("DESCRIBE planes_mantenimientos");
    
    echo "📋 Estructura de la tabla:\n";
    foreach ($columns as $column) {
        $nullable = $column->Null === 'YES' ? 'NULL' : 'NOT NULL';
        $default = $column->Default !== null ? "DEFAULT '{$column->Default}'" : 'NO DEFAULT';
        echo "   - {$column->Field}: {$column->Type} | {$nullable} | {$default}\n";
    }
    
    // Crear un registro de prueba simple con todos los campos requeridos
    echo "\n📝 Intentando insertar registro con campos obligatorios...\n";
    
    $equipo = DB::table('equipos')->first();
    if (!$equipo) {
        echo "❌ No hay equipos disponibles\n";
        exit;
    }
    
    // Datos básicos que incluyen todos los campos obligatorios
    $basicData = [
        'equipo_id' => $equipo->id,
        'anio' => date('Y'), // Campo obligatorio
        'mes1' => 1, // Campo obligatorio  
        'mes2' => 0,
        'mes3' => 0,
        'responsable' => 'Técnico de Prueba',
        'actividad' => 'Mantenimiento de prueba',
        'usuario_id' => 1, // Asumiendo que existe un usuario con ID 1
        'frecuencia_id' => 1, // Asumiendo que existe una frecuencia con ID 1
        'created_at' => now(),
        'updated_at' => now()
    ];
    
    // Agregar campos nuevos si existen
    $allColumns = Schema::getColumnListing('planes_mantenimientos');
    if (in_array('tipo_mantenimiento', $allColumns)) {
        $basicData['tipo_mantenimiento'] = 'Preventivo';
    }
    if (in_array('descripcion', $allColumns)) {
        $basicData['descripcion'] = 'Mantenimiento de prueba básico';
    }
    if (in_array('fecha_programada', $allColumns)) {
        $basicData['fecha_programada'] = date('Y-m-d', strtotime('+30 days'));
    }
    if (in_array('estado', $allColumns)) {
        $basicData['estado'] = 'programado';
    }
    
    $insertId = DB::table('planes_mantenimientos')->insertGetId($basicData);
    
    echo "✅ Registro insertado con ID: $insertId\n";
    
    // Verificar el registro insertado
    $record = DB::table('planes_mantenimientos')
        ->leftJoin('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
        ->select('planes_mantenimientos.*', 'equipos.name as equipo_name', 'equipos.code as equipo_code')
        ->where('planes_mantenimientos.id', $insertId)
        ->first();
    
    if ($record) {
        echo "✅ Registro verificado:\n";
        echo "   - ID: {$record->id}\n";
        echo "   - Equipo: {$record->equipo_name} ({$record->equipo_code})\n";
        echo "   - Año: {$record->anio}\n";
        echo "   - Responsable: {$record->responsable}\n";
        echo "   - Actividad: {$record->actividad}\n";
        if (isset($record->tipo_mantenimiento)) {
            echo "   - Tipo: {$record->tipo_mantenimiento}\n";
        }
        if (isset($record->descripcion)) {
            echo "   - Descripción: {$record->descripcion}\n";
        }
        if (isset($record->estado)) {
            echo "   - Estado: {$record->estado}\n";
        }
    }
    
    echo "\n🎉 Estructura verificada y registro de prueba creado!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

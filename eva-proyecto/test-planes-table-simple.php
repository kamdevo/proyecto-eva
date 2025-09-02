<?php

// Script simple para probar la tabla planes_mantenimientos

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "🔍 Probando tabla planes_mantenimientos...\n";
    
    // Verificar conexión a la base de datos
    $connection = DB::connection();
    echo "✅ Conexión a BD establecida\n";
    
    // Contar registros actuales
    $count = DB::table('planes_mantenimientos')->count();
    echo "📊 Registros actuales: $count\n";
    
    // Obtener un equipo para prueba
    $equipo = DB::table('equipos')->first();
    
    if (!$equipo) {
        echo "❌ No hay equipos disponibles\n";
        exit;
    }
    
    echo "🔧 Equipo encontrado: {$equipo->name} (ID: {$equipo->id})\n";
    
    // Intentar insertar un registro simple
    echo "📝 Insertando registro de prueba...\n";
    
    $insertId = DB::table('planes_mantenimientos')->insertGetId([
        'equipo_id' => $equipo->id,
        'tipo_mantenimiento' => 'Preventivo',
        'descripcion' => 'Test de mantenimiento',
        'fecha_programada' => '2025-10-01',
        'responsable' => 'Técnico Test',
        'estado' => 'programado',
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    echo "✅ Registro insertado con ID: $insertId\n";
    
    // Verificar que se insertó correctamente
    $newCount = DB::table('planes_mantenimientos')->count();
    echo "📊 Registros después de inserción: $newCount\n";
    
    // Obtener el registro insertado
    $record = DB::table('planes_mantenimientos')->where('id', $insertId)->first();
    
    if ($record) {
        echo "✅ Registro recuperado exitosamente:\n";
        echo "   - ID: {$record->id}\n";
        echo "   - Equipo ID: {$record->equipo_id}\n";
        echo "   - Tipo: {$record->tipo_mantenimiento}\n";
        echo "   - Estado: {$record->estado}\n";
        echo "   - Fecha: {$record->fecha_programada}\n";
    }
    
    echo "\n🎉 Prueba completada exitosamente!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    echo "📁 Archivo: " . basename($e->getFile()) . "\n";
}

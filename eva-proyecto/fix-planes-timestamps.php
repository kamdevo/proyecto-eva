<?php

// Script para agregar timestamps a la tabla planes_mantenimientos

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    echo "🔧 Agregando columnas de timestamps a planes_mantenimientos...\n";
    
    // Verificar si las columnas ya existen
    $columns = Schema::getColumnListing('planes_mantenimientos');
    echo "📋 Columnas actuales: " . implode(', ', $columns) . "\n";
    
    $hasCreatedAt = in_array('created_at', $columns);
    $hasUpdatedAt = in_array('updated_at', $columns);
    
    if (!$hasCreatedAt || !$hasUpdatedAt) {
        echo "➕ Agregando columnas faltantes...\n";
        
        Schema::table('planes_mantenimientos', function ($table) use ($hasCreatedAt, $hasUpdatedAt) {
            if (!$hasCreatedAt) {
                $table->timestamp('created_at')->nullable();
                echo "   ✅ Agregada columna created_at\n";
            }
            if (!$hasUpdatedAt) {
                $table->timestamp('updated_at')->nullable();
                echo "   ✅ Agregada columna updated_at\n";
            }
        });
        
        // Actualizar registros existentes con timestamps
        $count = DB::table('planes_mantenimientos')->whereNull('created_at')->count();
        if ($count > 0) {
            echo "📝 Actualizando $count registros existentes con timestamps...\n";
            DB::table('planes_mantenimientos')
                ->whereNull('created_at')
                ->update([
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
        }
        
        echo "✅ Timestamps agregados exitosamente\n";
    } else {
        echo "✅ Las columnas de timestamps ya existen\n";
    }
    
    // Verificar columnas finales
    $finalColumns = Schema::getColumnListing('planes_mantenimientos');
    echo "📋 Columnas finales: " . implode(', ', $finalColumns) . "\n";
    
    // Insertar un registro de prueba
    echo "📝 Insertando registro de prueba...\n";
    
    $equipo = DB::table('equipos')->first();
    if ($equipo) {
        $insertId = DB::table('planes_mantenimientos')->insertGetId([
            'equipo_id' => $equipo->id,
            'tipo_mantenimiento' => 'Preventivo',
            'descripcion' => 'Test de mantenimiento después de fix',
            'fecha_programada' => '2025-10-01',
            'responsable' => 'Técnico Test',
            'estado' => 'programado',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        echo "✅ Registro de prueba insertado con ID: $insertId\n";
        
        // Verificar el registro
        $record = DB::table('planes_mantenimientos')->where('id', $insertId)->first();
        if ($record) {
            echo "✅ Verificación exitosa:\n";
            echo "   - ID: {$record->id}\n";
            echo "   - Tipo: {$record->tipo_mantenimiento}\n";
            echo "   - Estado: {$record->estado}\n";
            echo "   - Created: {$record->created_at}\n";
        }
    }
    
    echo "\n🎉 Fix completado. La tabla está lista para usar!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

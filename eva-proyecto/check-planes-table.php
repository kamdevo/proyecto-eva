<?php

// Script para verificar y crear la tabla planes_mantenimientos si no existe

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    echo "🔍 Verificando tabla planes_mantenimientos...\n";
    
    // Verificar si la tabla existe
    if (Schema::hasTable('planes_mantenimientos')) {
        echo "✅ La tabla planes_mantenimientos existe.\n";
        
        // Verificar columnas
        $columns = Schema::getColumnListing('planes_mantenimientos');
        echo "📋 Columnas encontradas: " . implode(', ', $columns) . "\n";
        
        // Verificar si tiene las columnas necesarias
        $requiredColumns = [
            'id', 'equipo_id', 'tipo_mantenimiento', 'descripcion', 
            'fecha_programada', 'responsable', 'estado'
        ];
        
        $missingColumns = array_diff($requiredColumns, $columns);
        
        if (empty($missingColumns)) {
            echo "✅ Todas las columnas necesarias están presentes.\n";
            
            // Contar registros
            $count = DB::table('planes_mantenimientos')->count();
            echo "📊 Registros en la tabla: $count\n";
            
            if ($count === 0) {
                echo "⚠️  La tabla está vacía. Insertando datos de prueba...\n";
                
                // Obtener algunos equipos para los datos de prueba
                $equipos = DB::table('equipos')->limit(3)->get();
                
                if ($equipos->count() > 0) {
                    foreach ($equipos as $equipo) {
                        DB::table('planes_mantenimientos')->insert([
                            'equipo_id' => $equipo->id,
                            'tipo_mantenimiento' => 'Preventivo',
                            'descripcion' => 'Mantenimiento preventivo programado para ' . $equipo->name,
                            'fecha_programada' => date('Y-m-d', strtotime('+30 days')),
                            'responsable' => 'Técnico de Mantenimiento',
                            'estado' => 'programado',
                            'observaciones' => 'Mantenimiento de rutina',
                            'costo_estimado' => 150.00,
                            'repuestos_necesarios' => 'Filtros, aceites',
                            'frecuencia_dias' => 90,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                    echo "✅ Datos de prueba insertados exitosamente.\n";
                } else {
                    echo "⚠️  No hay equipos disponibles para crear datos de prueba.\n";
                }
            }
            
        } else {
            echo "❌ Faltan columnas: " . implode(', ', $missingColumns) . "\n";
            echo "🔧 Agregando columnas faltantes...\n";
            
            Schema::table('planes_mantenimientos', function ($table) use ($missingColumns) {
                if (in_array('equipo_id', $missingColumns)) {
                    $table->unsignedBigInteger('equipo_id')->nullable();
                }
                if (in_array('tipo_mantenimiento', $missingColumns)) {
                    $table->string('tipo_mantenimiento')->nullable();
                }
                if (in_array('descripcion', $missingColumns)) {
                    $table->text('descripcion')->nullable();
                }
                if (in_array('fecha_programada', $missingColumns)) {
                    $table->date('fecha_programada')->nullable();
                }
                if (in_array('fecha_mantenimiento', $missingColumns)) {
                    $table->date('fecha_mantenimiento')->nullable();
                }
                if (in_array('responsable', $missingColumns)) {
                    $table->string('responsable')->nullable();
                }
                if (in_array('estado', $missingColumns)) {
                    $table->enum('estado', ['programado', 'en_progreso', 'completado', 'cancelado', 'reprogramado'])->default('programado');
                }
                if (in_array('observaciones', $missingColumns)) {
                    $table->text('observaciones')->nullable();
                }
                if (in_array('costo_estimado', $missingColumns)) {
                    $table->decimal('costo_estimado', 10, 2)->nullable();
                }
                if (in_array('repuestos_necesarios', $missingColumns)) {
                    $table->text('repuestos_necesarios')->nullable();
                }
                if (in_array('frecuencia_dias', $missingColumns)) {
                    $table->integer('frecuencia_dias')->nullable();
                }
            });
            
            echo "✅ Columnas agregadas exitosamente.\n";
        }
        
    } else {
        echo "❌ La tabla planes_mantenimientos NO existe.\n";
        echo "🔧 Creando tabla planes_mantenimientos...\n";
        
        Schema::create('planes_mantenimientos', function ($table) {
            $table->id();
            $table->unsignedBigInteger('equipo_id');
            $table->string('tipo_mantenimiento');
            $table->text('descripcion');
            $table->date('fecha_programada');
            $table->date('fecha_mantenimiento')->nullable();
            $table->string('responsable');
            $table->enum('estado', ['programado', 'en_progreso', 'completado', 'cancelado', 'reprogramado'])->default('programado');
            $table->text('observaciones')->nullable();
            $table->decimal('costo_estimado', 10, 2)->nullable();
            $table->text('repuestos_necesarios')->nullable();
            $table->integer('frecuencia_dias')->nullable();
            $table->timestamps();
        });
        
        echo "✅ Tabla planes_mantenimientos creada exitosamente.\n";
        
        // Insertar datos de prueba
        echo "📝 Insertando datos de prueba...\n";
        
        $equipos = DB::table('equipos')->limit(3)->get();
        
        if ($equipos->count() > 0) {
            foreach ($equipos as $equipo) {
                DB::table('planes_mantenimientos')->insert([
                    'equipo_id' => $equipo->id,
                    'tipo_mantenimiento' => 'Preventivo',
                    'descripcion' => 'Mantenimiento preventivo programado para ' . $equipo->name,
                    'fecha_programada' => date('Y-m-d', strtotime('+30 days')),
                    'responsable' => 'Técnico de Mantenimiento',
                    'estado' => 'programado',
                    'observaciones' => 'Mantenimiento de rutina',
                    'costo_estimado' => 150.00,
                    'repuestos_necesarios' => 'Filtros, aceites',
                    'frecuencia_dias' => 90,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            echo "✅ Datos de prueba insertados exitosamente.\n";
        } else {
            echo "⚠️  No hay equipos disponibles para crear datos de prueba.\n";
        }
    }
    
    echo "\n🎉 Verificación completada. La tabla planes_mantenimientos está lista para usar.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . " línea " . $e->getLine() . "\n";
}

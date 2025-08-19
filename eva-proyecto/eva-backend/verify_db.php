<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Verificar tablas
echo "=== VERIFICACIÓN DE BASE DE DATOS ===\n";

try {
    // Mostrar tablas
    echo "\n📋 TABLAS EXISTENTES:\n";
    $tables = DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $tableName = array_values((array) $table)[0];
        echo "- {$tableName}\n";
    }

    // Verificar tabla correctivos_generales
    echo "\n🔧 ESTRUCTURA DE TABLA correctivos_generales:\n";
    if (Schema::hasTable('correctivos_generales')) {
        $columns = DB::select('DESCRIBE correctivos_generales');
        foreach ($columns as $column) {
            echo "- {$column->Field} ({$column->Type})\n";
        }
        
        // Contar registros
        $count = DB::table('correctivos_generales')->count();
        echo "\nTotal registros: {$count}\n";
    } else {
        echo "❌ La tabla correctivos_generales NO EXISTE\n";
    }

    // Verificar tabla equipos
    echo "\n⚙️ ESTRUCTURA DE TABLA equipos:\n";
    if (Schema::hasTable('equipos')) {
        $columns = DB::select('DESCRIBE equipos');
        foreach ($columns as $column) {
            echo "- {$column->Field} ({$column->Type})\n";
        }
        
        // Contar registros
        $count = DB::table('equipos')->count();
        echo "\nTotal registros: {$count}\n";
    } else {
        echo "❌ La tabla equipos NO EXISTE\n";
    }

    // Verificar relaciones
    echo "\n🔗 VERIFICACIÓN DE RELACIONES:\n";
    if (Schema::hasTable('correctivos_generales') && Schema::hasTable('equipos')) {
        // Verificar foreign keys
        $foreignKeys = DB::select("
            SELECT 
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'gestionthuv' 
            AND TABLE_NAME = 'correctivos_generales' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");
        
        if (!empty($foreignKeys)) {
            foreach ($foreignKeys as $fk) {
                echo "- {$fk->COLUMN_NAME} -> {$fk->REFERENCED_TABLE_NAME}.{$fk->REFERENCED_COLUMN_NAME}\n";
            }
        } else {
            echo "No hay foreign keys definidas\n";
        }
        
        // Verificar datos con equipo_id
        $corretivosSample = DB::table('correctivos_generales')->limit(5)->get();
        echo "\n📊 MUESTRA DE DATOS:\n";
        foreach ($corretivosSample as $correctivo) {
            echo "ID: {$correctivo->id}, Equipo ID: " . ($correctivo->equipo_id ?? 'NULL') . "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

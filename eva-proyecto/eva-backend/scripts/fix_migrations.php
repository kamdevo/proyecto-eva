<?php

/**
 * Script para marcar todas las migraciones como ejecutadas
 * Soluciona el problema de migraciones duplicadas con el schema existente
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

// Configurar Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

class MigrationFixer
{
    public function fixMigrations()
    {
        echo "🔧 Iniciando corrección de migraciones...\n\n";

        try {
            // Obtener todas las migraciones
            $migrationFiles = File::files(database_path('migrations'));
            $batch = 1;

            echo "📋 Marcando " . count($migrationFiles) . " migraciones como ejecutadas...\n";

            foreach ($migrationFiles as $file) {
                $migrationName = pathinfo($file->getFilename(), PATHINFO_FILENAME);
                
                // Verificar si ya existe en la tabla migrations
                $exists = DB::table('migrations')
                    ->where('migration', $migrationName)
                    ->exists();

                if (!$exists) {
                    DB::table('migrations')->insert([
                        'migration' => $migrationName,
                        'batch' => $batch
                    ]);
                    echo "  ✅ {$migrationName}\n";
                } else {
                    echo "  ⏭️ {$migrationName} (ya existe)\n";
                }
            }

            echo "\n🎉 Todas las migraciones han sido marcadas como ejecutadas!\n";
            echo "📊 Batch número: {$batch}\n";

            return true;

        } catch (\Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public function verifyMigrations()
    {
        echo "\n🔍 Verificando estado de migraciones...\n";

        try {
            $migrations = DB::table('migrations')->orderBy('id')->get();
            
            echo "📊 Total de migraciones registradas: " . $migrations->count() . "\n";
            echo "📦 Batches utilizados: " . $migrations->unique('batch')->count() . "\n";

            // Verificar que todas las migraciones están marcadas
            $migrationFiles = File::files(database_path('migrations'));
            $fileNames = collect($migrationFiles)->map(function ($file) {
                return pathinfo($file->getFilename(), PATHINFO_FILENAME);
            });

            $registeredNames = $migrations->pluck('migration');
            $missing = $fileNames->diff($registeredNames);

            if ($missing->isEmpty()) {
                echo "✅ Todas las migraciones están correctamente registradas\n";
            } else {
                echo "⚠️ Migraciones faltantes:\n";
                foreach ($missing as $missingMigration) {
                    echo "  - {$missingMigration}\n";
                }
            }

            return $missing->isEmpty();

        } catch (\Exception $e) {
            echo "❌ Error verificando migraciones: " . $e->getMessage() . "\n";
            return false;
        }
    }

    public function createMigrationsTable()
    {
        echo "📋 Verificando tabla de migraciones...\n";

        try {
            if (!DB::getSchemaBuilder()->hasTable('migrations')) {
                echo "🔨 Creando tabla migrations...\n";
                
                DB::statement("
                    CREATE TABLE migrations (
                        id int unsigned NOT NULL AUTO_INCREMENT,
                        migration varchar(255) NOT NULL,
                        batch int NOT NULL,
                        PRIMARY KEY (id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ");
                
                echo "✅ Tabla migrations creada exitosamente\n";
            } else {
                echo "✅ Tabla migrations ya existe\n";
            }

            return true;

        } catch (\Exception $e) {
            echo "❌ Error creando tabla migrations: " . $e->getMessage() . "\n";
            return false;
        }
    }
}

// Ejecutar corrección
$fixer = new MigrationFixer();

echo "🚀 Iniciando corrección del sistema de migraciones...\n\n";

// Paso 1: Crear tabla migrations si no existe
if (!$fixer->createMigrationsTable()) {
    echo "❌ No se pudo crear la tabla migrations\n";
    exit(1);
}

// Paso 2: Marcar migraciones como ejecutadas
if (!$fixer->fixMigrations()) {
    echo "❌ No se pudieron corregir las migraciones\n";
    exit(1);
}

// Paso 3: Verificar resultado
if (!$fixer->verifyMigrations()) {
    echo "⚠️ Algunas migraciones pueden no estar correctamente registradas\n";
}

echo "\n🎯 Corrección completada!\n";
echo "📝 Ahora puedes ejecutar tests sin problemas de migraciones\n";
echo "🔧 Comando sugerido: php artisan test\n";

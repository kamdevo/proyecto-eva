<?php
/**
 * Script para generar migraciones desde la base de datos existente
 * Este script crea archivos de migración basados en la estructura actual de la BD
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== GENERADOR DE MIGRACIONES DESDE BD EXISTENTE ===\n\n";

// Obtener todas las tablas
$tables = DB::select('SHOW TABLES');
$dbName = DB::connection()->getDatabaseName();

$migrationsDir = __DIR__ . '/database/migrations';
if (!file_exists($migrationsDir)) {
    mkdir($migrationsDir, 0755, true);
}

$timestamp = date('Y_m_d_His');
$counter = 0;

echo "Base de datos: {$dbName}\n";
echo "Total de tablas: " . count($tables) . "\n\n";

foreach ($tables as $table) {
    $tableName = $table->{"Tables_in_{$dbName}"};
    
    // Ignorar tablas de sistema
    if (in_array($tableName, ['migrations', 'password_resets', 'failed_jobs', 'personal_access_tokens'])) {
        echo "⏭️  Ignorando tabla del sistema: {$tableName}\n";
        continue;
    }
    
    echo "📝 Generando migración para: {$tableName}\n";
    
    // Obtener estructura de la tabla
    $columns = DB::select("DESCRIBE {$tableName}");
    
    // Crear contenido de la migración
    $migrationContent = generateMigrationContent($tableName, $columns);
    
    // Nombre del archivo de migración
    $migrationTimestamp = date('Y_m_d_His', strtotime("+{$counter} seconds"));
    $fileName = "{$migrationTimestamp}_create_{$tableName}_table.php";
    $filePath = $migrationsDir . '/' . $fileName;
    
    // Guardar archivo
    file_put_contents($filePath, $migrationContent);
    
    $counter++;
}

echo "\n✅ Migraciones generadas exitosamente en: {$migrationsDir}\n";
echo "Total de migraciones creadas: {$counter}\n\n";

echo "⚠️  IMPORTANTE:\n";
echo "1. Revisa las migraciones generadas antes de ejecutarlas\n";
echo "2. Ajusta tipos de datos y restricciones según sea necesario\n";
echo "3. NO ejecutes 'php artisan migrate' en la BD actual (ya tiene datos)\n";
echo "4. Estas migraciones son para crear la BD en un servidor nuevo\n\n";

function generateMigrationContent($tableName, $columns) {
    $className = str_replace(' ', '', ucwords(str_replace('_', ' ', $tableName)));
    
    $content = "<?php\n\n";
    $content .= "use Illuminate\\Database\\Migrations\\Migration;\n";
    $content .= "use Illuminate\\Database\\Schema\\Blueprint;\n";
    $content .= "use Illuminate\\Support\\Facades\\Schema;\n\n";
    $content .= "return new class extends Migration\n";
    $content .= "{\n";
    $content .= "    public function up()\n";
    $content .= "    {\n";
    $content .= "        Schema::create('{$tableName}', function (Blueprint \$table) {\n";
    
    foreach ($columns as $column) {
        $columnDef = generateColumnDefinition($column);
        if ($columnDef) {
            $content .= "            {$columnDef}\n";
        }
    }
    
    $content .= "        });\n";
    $content .= "    }\n\n";
    $content .= "    public function down()\n";
    $content .= "    {\n";
    $content .= "        Schema::dropIfExists('{$tableName}');\n";
    $content .= "    }\n";
    $content .= "};\n";
    
    return $content;
}

function generateColumnDefinition($column) {
    $name = $column->Field;
    $type = $column->Type;
    $null = $column->Null === 'YES';
    $key = $column->Key;
    $default = $column->Default;
    $extra = $column->Extra;
    
    // Determinar el tipo de columna
    if ($key === 'PRI' && $extra === 'auto_increment') {
        return "\$table->id('{$name}');";
    }
    
    if (strpos($type, 'int') !== false) {
        if (strpos($type, 'tinyint(1)') !== false) {
            $def = "\$table->boolean('{$name}')";
        } elseif (strpos($type, 'bigint') !== false) {
            $def = "\$table->bigInteger('{$name}')";
        } else {
            $def = "\$table->integer('{$name}')";
        }
    } elseif (strpos($type, 'varchar') !== false) {
        preg_match('/varchar\((\d+)\)/', $type, $matches);
        $length = $matches[1] ?? 255;
        $def = "\$table->string('{$name}', {$length})";
    } elseif (strpos($type, 'text') !== false) {
        $def = "\$table->text('{$name}')";
    } elseif (strpos($type, 'longtext') !== false) {
        $def = "\$table->longText('{$name}')";
    } elseif (strpos($type, 'date') !== false && strpos($type, 'datetime') === false) {
        $def = "\$table->date('{$name}')";
    } elseif (strpos($type, 'datetime') !== false || strpos($type, 'timestamp') !== false) {
        $def = "\$table->timestamp('{$name}')";
    } elseif (strpos($type, 'decimal') !== false) {
        preg_match('/decimal\((\d+),(\d+)\)/', $type, $matches);
        $precision = $matches[1] ?? 8;
        $scale = $matches[2] ?? 2;
        $def = "\$table->decimal('{$name}', {$precision}, {$scale})";
    } elseif (strpos($type, 'float') !== false || strpos($type, 'double') !== false) {
        $def = "\$table->float('{$name}')";
    } elseif (strpos($type, 'enum') !== false) {
        preg_match_all("/'([^']+)'/", $type, $matches);
        $values = implode("', '", $matches[1]);
        $def = "\$table->enum('{$name}', ['{$values}'])";
    } else {
        $def = "\$table->string('{$name}')";
    }
    
    // Agregar modificadores
    if ($null) {
        $def .= "->nullable()";
    }
    
    if ($default !== null && $default !== 'NULL') {
        if (is_numeric($default)) {
            $def .= "->default({$default})";
        } else {
            $def .= "->default('{$default}')";
        }
    }
    
    if ($extra === 'on update CURRENT_TIMESTAMP') {
        $def .= "->useCurrent()->useCurrentOnUpdate()";
    } elseif ($extra === 'CURRENT_TIMESTAMP') {
        $def .= "->useCurrent()";
    }
    
    return $def . ";";
}

echo "=== FIN ===\n";

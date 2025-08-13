<?php
// Script simple para verificar la tabla archivos
require_once __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

// Configurar conexión a la base de datos
$capsule = new DB;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'database' => 'gestionthuv',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    echo "🔍 Verificando tabla archivos...\n";
    
    // Verificar si la tabla existe
    $tables = DB::select("SHOW TABLES LIKE 'archivos'");
    if (empty($tables)) {
        echo "❌ ERROR: La tabla 'archivos' no existe\n";
        echo "📝 Creando tabla archivos...\n";
        
        DB::statement("
            CREATE TABLE IF NOT EXISTS archivos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        ");
        
        echo "✅ Tabla archivos creada\n";
    } else {
        echo "✅ La tabla archivos existe\n";
        
        // Verificar estructura
        $columns = DB::select("DESCRIBE archivos");
        echo "📋 Estructura de la tabla:\n";
        foreach ($columns as $column) {
            echo "  - {$column->Field} ({$column->Type})\n";
        }
        
        // Verificar si existe la columna status
        $hasStatus = false;
        foreach ($columns as $column) {
            if ($column->Field === 'status') {
                $hasStatus = true;
                break;
            }
        }
        
        if (!$hasStatus) {
            echo "➕ Agregando columna status...\n";
            DB::statement("ALTER TABLE archivos ADD COLUMN status TINYINT DEFAULT 1");
            echo "✅ Columna status agregada\n";
        }
    }
    
    // Verificar contenido sin filtro de status primero
    $totalArchivos = DB::table('archivos')->count();
    echo "📊 Total de archivos en la tabla: $totalArchivos\n";
    
    if ($totalArchivos == 0) {
        echo "📝 Insertando datos iniciales...\n";
        
        // Insertar tipos de archivos básicos
        $tiposArchivos = [
            ['id' => 1, 'name' => 'Manuales de operación'],
            ['id' => 2, 'name' => 'Manuales de mantenimiento'],
            ['id' => 3, 'name' => 'Manuales de partes'],
            ['id' => 4, 'name' => 'Planos eléctricos'],
            ['id' => 5, 'name' => 'Planos electrónicos'],
            ['id' => 6, 'name' => 'Planos neumáticos'],
            ['id' => 7, 'name' => 'Planos mecánicos'],
            ['id' => 8, 'name' => 'Protocolos de calibración'],
            ['id' => 9, 'name' => 'Capacitaciones'],
            ['id' => 10, 'name' => 'Certificados de calibración'],
            ['id' => 11, 'name' => 'Hojas de seguridad'],
            ['id' => 12, 'name' => 'Guías de instalación'],
            ['id' => 13, 'name' => 'Certificados de conformidad'],
            ['id' => 14, 'name' => 'Reportes de mantenimiento'],
            ['id' => 15, 'name' => 'Documentación técnica'],
            ['id' => 16, 'name' => 'Garantías'],
            ['id' => 17, 'name' => 'Facturas'],
            ['id' => 18, 'name' => 'Órdenes de compra'],
            ['id' => 19, 'name' => 'Otros documentos de ingreso']
        ];
        
        foreach ($tiposArchivos as $tipo) {
            DB::table('archivos')->insert($tipo);
        }
        
        echo "✅ Datos iniciales insertados\n";
    }
    
    // Verificar contenido con filtro de status
    $archivos = DB::table('archivos')->where('status', 1)->get();
    echo "📊 Tipos de archivos activos: " . count($archivos) . "\n";
    
    if (count($archivos) == 0) {
        echo "📊 Mostrando todos los archivos (sin filtro de status):\n";
        $todosArchivos = DB::table('archivos')->get();
        foreach ($todosArchivos as $archivo) {
            echo "  - ID {$archivo->id}: {$archivo->name}\n";
        }
    } else {
        foreach ($archivos as $archivo) {
            echo "  - ID {$archivo->id}: {$archivo->name}\n";
        }
    }
    
    echo "\n✅ Verificación completada exitosamente\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}
?>

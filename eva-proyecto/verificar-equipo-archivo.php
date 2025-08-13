<?php
// Script para verificar la tabla equipo_archivo
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
    echo "🔍 Verificando tabla equipo_archivo...\n";
    
    // Verificar si la tabla existe
    $tables = DB::select("SHOW TABLES LIKE 'equipo_archivo'");
    if (empty($tables)) {
        echo "❌ ERROR: La tabla 'equipo_archivo' no existe\n";
        echo "📝 Creando tabla equipo_archivo...\n";
        
        DB::statement("
            CREATE TABLE IF NOT EXISTS equipo_archivo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                equipo_id INT NOT NULL,
                archivo_id INT NOT NULL,
                vinculo VARCHAR(255) NOT NULL,
                otro VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
                FOREIGN KEY (archivo_id) REFERENCES archivos(id) ON DELETE CASCADE
            )
        ");
        
        echo "✅ Tabla equipo_archivo creada\n";
    } else {
        echo "✅ La tabla equipo_archivo existe\n";
        
        // Verificar estructura
        $columns = DB::select("DESCRIBE equipo_archivo");
        echo "📋 Estructura de la tabla:\n";
        foreach ($columns as $column) {
            echo "  - {$column->Field} ({$column->Type})\n";
        }
    }
    
    // Verificar contenido
    $totalArchivos = DB::table('equipo_archivo')->count();
    echo "📊 Total de documentos en la tabla: $totalArchivos\n";
    
    if ($totalArchivos > 0) {
        echo "📄 Documentos más recientes:\n";
        $recientes = DB::table('equipo_archivo')
            ->join('equipos', 'equipo_archivo.equipo_id', '=', 'equipos.id')
            ->join('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
            ->select('equipo_archivo.*', 'equipos.name as equipo_name', 'archivos.name as archivo_tipo')
            ->orderBy('equipo_archivo.created_at', 'desc')
            ->limit(5)
            ->get();
            
        foreach ($recientes as $doc) {
            echo "  - Equipo: {$doc->equipo_name} | Tipo: {$doc->archivo_tipo} | Archivo: {$doc->vinculo}\n";
        }
    }
    
    echo "\n✅ Verificación completada exitosamente\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}
?>

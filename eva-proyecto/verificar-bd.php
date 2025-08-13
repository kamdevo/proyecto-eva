<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VERIFICAR ESTRUCTURA DE EQUIPOS ===\n";
try {
    $columnas = DB::select("DESCRIBE equipos");
    echo "Columnas de la tabla equipos:\n";
    foreach ($columnas as $col) {
        echo "- {$col->Field} ({$col->Type})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== VERIFICAR TABLA EQUIPO_ARCHIVO ===\n";
try {
    $archivosCount = DB::table('equipo_archivo')->count();
    echo "Total de archivos: $archivosCount\n";
    
    if ($archivosCount > 0) {
        $columnas = DB::select("DESCRIBE equipo_archivo");
        echo "Columnas de equipo_archivo:\n";
        foreach ($columnas as $col) {
            echo "- {$col->Field} ({$col->Type})\n";
        }
        
        echo "\nPrimeros 3 registros de equipo_archivo:\n";
        $archivos = DB::table('equipo_archivo')->limit(3)->get();
        foreach ($archivos as $archivo) {
            echo "ID: {$archivo->id}, Equipo: {$archivo->equipo_id}, Tipo: {$archivo->tipo_documento}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== EQUIPOS CON ARCHIVOS ===\n";
try {
    $equiposConArchivos = DB::select("
        SELECT e.id, e.nombre_equipo, e.marca, e.modelo, e.nserie, COUNT(a.id) as total_archivos
        FROM equipos e 
        INNER JOIN equipo_archivo a ON e.id = a.equipo_id 
        GROUP BY e.id, e.nombre_equipo, e.marca, e.modelo, e.nserie 
        ORDER BY total_archivos DESC
        LIMIT 5
    ");
    
    foreach ($equiposConArchivos as $equipo) {
        echo "ID: {$equipo->id} - {$equipo->nombre_equipo} ({$equipo->marca} {$equipo->modelo})\n";
        echo "Serie: {$equipo->nserie}\n";
        echo "Total archivos: {$equipo->total_archivos}\n";
        
        // Mostrar tipos de documentos
        $tiposDoc = DB::select("
            SELECT tipo_documento, COUNT(*) as cantidad 
            FROM equipo_archivo 
            WHERE equipo_id = ? 
            GROUP BY tipo_documento
        ", [$equipo->id]);
        
        echo "Tipos de documentos:\n";
        foreach ($tiposDoc as $tipo) {
            echo "  - {$tipo->tipo_documento}: {$tipo->cantidad}\n";
        }
        echo "---\n";
    }
    
    if (empty($equiposConArchivos)) {
        echo "No se encontraron equipos con archivos.\n";
    }
} catch (Exception $e) {
    echo "Error en consulta: " . $e->getMessage() . "\n";
}
?>

<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VERIFICAR TABLA ARCHIVOS ===\n";
try {
    $archivosCount = DB::table('archivos')->count();
    echo "Total de archivos: $archivosCount\n";
    
    if ($archivosCount > 0) {
        $columnas = DB::select("DESCRIBE archivos");
        echo "Columnas de la tabla archivos:\n";
        foreach ($columnas as $col) {
            echo "- {$col->Field} ({$col->Type})\n";
        }
        
        echo "\nPrimeros 3 registros de archivos:\n";
        $archivos = DB::table('archivos')->limit(3)->get();
        foreach ($archivos as $archivo) {
            $nombre = isset($archivo->name) ? $archivo->name : 'N/A';
            echo "ID: {$archivo->id}, Nombre: {$nombre}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== EQUIPOS CON ARCHIVOS (USANDO NOMBRES CORRECTOS) ===\n";
try {
    $equiposConArchivos = DB::select("
        SELECT e.id, e.name, e.marca, e.modelo, e.serial, COUNT(ea.id) as total_archivos
        FROM equipos e 
        INNER JOIN equipo_archivo ea ON e.id = ea.equipo_id 
        INNER JOIN archivos a ON ea.archivo_id = a.id
        GROUP BY e.id, e.name, e.marca, e.modelo, e.serial 
        ORDER BY total_archivos DESC
        LIMIT 5
    ");
    
    foreach ($equiposConArchivos as $equipo) {
        echo "ID: {$equipo->id} - {$equipo->name} ({$equipo->marca} {$equipo->modelo})\n";
        echo "Serie: {$equipo->serial}\n";
        echo "Total archivos: {$equipo->total_archivos}\n";
        
        // Mostrar algunos archivos de este equipo
        $archivosEquipo = DB::select("
            SELECT a.name, a.extension, a.size 
            FROM archivos a
            INNER JOIN equipo_archivo ea ON a.id = ea.archivo_id
            WHERE ea.equipo_id = ?
            LIMIT 3
        ", [$equipo->id]);
        
        echo "Archivos:\n";
        foreach ($archivosEquipo as $archivo) {
            echo "  - {$archivo->name}.{$archivo->extension} ({$archivo->size} bytes)\n";
        }
        echo "---\n";
    }
    
    if (empty($equiposConArchivos)) {
        echo "No se encontraron equipos con archivos.\n";
    }
} catch (Exception $e) {
    echo "Error en consulta: " . $e->getMessage() . "\n";
}

echo "\n=== RECOMENDACIÓN PARA PRUEBAS ===\n";
if (!empty($equiposConArchivos)) {
    $equipoRecomendado = $equiposConArchivos[0];
    echo "EQUIPO RECOMENDADO PARA PRUEBAS:\n";
    echo "ID: {$equipoRecomendado->id}\n";
    echo "Nombre: {$equipoRecomendado->name}\n";
    echo "Marca/Modelo: {$equipoRecomendado->marca} {$equipoRecomendado->modelo}\n";
    echo "Total de archivos: {$equipoRecomendado->total_archivos}\n";
    echo "\nPuedes usar este equipo para probar el modal de documentos.\n";
}
?>

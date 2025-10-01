<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Consultar archivos de equipos
$archivos = DB::table('equipo_archivo')
    ->select('id', 'equipo_id', 'vinculo')
    ->limit(10)
    ->get();

echo "Total de archivos encontrados: " . $archivos->count() . "\n\n";

foreach ($archivos as $archivo) {
    echo "ID: {$archivo->id}\n";
    echo "Equipo ID: {$archivo->equipo_id}\n";
    echo "Vínculo: {$archivo->vinculo}\n";
    
    // Verificar si el archivo existe físicamente
    $rutaCompleta = storage_path('app/public/equipos/archivos/' . basename($archivo->vinculo));
    $existe = file_exists($rutaCompleta) ? "✓ SÍ EXISTE" : "✗ NO EXISTE";
    echo "Archivo físico: {$existe}\n";
    echo "Ruta: {$rutaCompleta}\n";
    echo "-------------------\n";
}

// Obtener información del equipo del primer archivo
if ($archivos->count() > 0) {
    $primerArchivo = $archivos->first();
    $equipo = DB::table('equipos')
        ->where('id', $primerArchivo->equipo_id)
        ->first();
    
    if ($equipo) {
        echo "\n=== EQUIPO CON ARCHIVOS ===\n";
        echo "ID: {$equipo->id}\n";
        echo "Nombre: {$equipo->name}\n";
        echo "Código: {$equipo->code}\n";
        echo "Serie: {$equipo->serial}\n";
    }
}

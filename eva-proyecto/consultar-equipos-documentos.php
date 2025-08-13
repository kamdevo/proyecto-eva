<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Equipo;
use App\Models\Documento;

echo "=== EQUIPOS CON DOCUMENTOS ===\n";

$equipos = Equipo::whereHas('documentos')
    ->with(['documentos' => function($query) {
        $query->select('id', 'equipo_id', 'tipo_documento', 'nombre_archivo', 'archivo_url');
    }])
    ->take(5)
    ->get(['id', 'nombre', 'marca', 'modelo', 'serie']);

foreach ($equipos as $equipo) {
    echo "ID: {$equipo->id} - {$equipo->nombre} ({$equipo->marca} {$equipo->modelo})\n";
    echo "Serie: {$equipo->serie}\n";
    echo "Documentos ({$equipo->documentos->count()}):\n";
    foreach ($equipo->documentos as $doc) {
        echo "  - {$doc->tipo_documento}: {$doc->nombre_archivo}\n";
    }
    echo "---\n";
}

if ($equipos->count() == 0) {
    echo "No se encontraron equipos con documentos.\n";
    echo "Verificando equipos disponibles...\n";
    $totalEquipos = Equipo::count();
    echo "Total equipos en BD: $totalEquipos\n";
    
    $totalDocumentos = Documento::count();
    echo "Total documentos en BD: $totalDocumentos\n";
    
    // Mostrar algunos equipos sin documentos
    echo "\nPrimeros 5 equipos disponibles:\n";
    $equiposSinDocs = Equipo::take(5)->get(['id', 'nombre', 'marca', 'modelo']);
    foreach ($equiposSinDocs as $equipo) {
        echo "ID: {$equipo->id} - {$equipo->nombre} ({$equipo->marca} {$equipo->modelo})\n";
    }
}
?>

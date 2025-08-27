<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DIAGNOSTICO DOCUMENTOS EQUIPO 1 ===\n";

$docs = \Illuminate\Support\Facades\DB::table('archivos')
    ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
    ->where('equipo_archivo.equipo_id', 1)
    ->select(
        'archivos.*', 
        'equipo_archivo.vinculo', 
        'equipo_archivo.created_at as fecha_archivo'
    )
    ->get();

echo "Documentos encontrados: " . $docs->count() . "\n";

foreach($docs as $doc) {
    echo "\nDocumento:\n";
    echo "  name: " . $doc->name . "\n";
    echo "  vinculo: " . ($doc->vinculo ?? 'NULL') . "\n";
    echo "  fecha_archivo: " . ($doc->fecha_archivo ?? 'NULL') . "\n";
    echo "  status: " . $doc->status . "\n";
}
?>

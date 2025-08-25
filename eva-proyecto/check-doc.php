<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$doc = \Illuminate\Support\Facades\DB::table('archivos')
    ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
    ->where('equipo_archivo.equipo_id', 1)
    ->select('archivos.*', 'equipo_archivo.vinculo', 'equipo_archivo.created_at')
    ->first();

echo "Documento real:\n";
foreach($doc as $k => $v) {
    echo "  $k: $v\n";
}
?>

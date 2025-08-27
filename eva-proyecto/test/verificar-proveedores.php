<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICAR PROVEEDORES MANTENIMIENTO ===\n";
try {
    $columns = \Illuminate\Support\Facades\Schema::getColumnListing('proveedores_mantenimiento');
    echo "Columnas: " . implode(', ', $columns) . "\n";
    
    $sample = \Illuminate\Support\Facades\DB::table('proveedores_mantenimiento')->first();
    if ($sample) {
        echo "Ejemplo:\n";
        foreach ($sample as $k => $v) {
            echo "  $k: $v\n";
        }
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== VERIFICAR UN EQUIPO CON DOCUMENTOS ===\n";
try {
    $equipo_con_docs = \Illuminate\Support\Facades\DB::table('equipo_archivo')
        ->select('equipo_id')
        ->first();
    
    if ($equipo_con_docs) {
        echo "Equipo con documentos: " . $equipo_con_docs->equipo_id . "\n";
        
        $documentos = \Illuminate\Support\Facades\DB::table('archivos')
            ->leftJoin('equipo_archivo', 'archivos.id', '=', 'equipo_archivo.archivo_id')
            ->where('equipo_archivo.equipo_id', $equipo_con_docs->equipo_id)
            ->select(
                'archivos.*',
                'equipo_archivo.vinculo',
                'equipo_archivo.created_at'
            )
            ->limit(1)
            ->get();
        
        echo "Documentos encontrados: " . $documentos->count() . "\n";
        if ($documentos->count() > 0) {
            $doc = $documentos->first();
            echo "Ejemplo documento:\n";
            foreach ($doc as $k => $v) {
                echo "  $k: $v\n";
            }
        }
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "VERIFICANDO ESTRUCTURA DE LA TABLA EQUIPOS:" . PHP_EOL;
    $columns = DB::select('DESCRIBE equipos');
    
    foreach ($columns as $column) {
        echo "- " . $column->Field . " (" . $column->Type . ")" . PHP_EOL;
    }
    
    echo PHP_EOL . "BUSCANDO EQUIPOS CON IMAGEN:" . PHP_EOL;
    
    // Buscar equipos con imagen usando nombres de columnas correctos
    $equipment = DB::table('equipos')
        ->whereNotNull('image')
        ->where('image', '!=', '')
        ->select('id', 'equipo_name', 'image', 'tipo_equipo')
        ->limit(5)
        ->get();
    
    if ($equipment->count() > 0) {
        echo "EQUIPOS CON IMAGEN ENCONTRADOS:" . PHP_EOL;
        foreach ($equipment as $item) {
            echo "ID: " . $item->id . PHP_EOL;
            echo "Nombre: " . $item->equipo_name . PHP_EOL;
            echo "Tipo: " . $item->tipo_equipo . PHP_EOL;
            echo "Imagen: " . $item->image . PHP_EOL;
            
            $imagePath = storage_path('app/public/equipos/images/' . $item->image);
            echo "Archivo existe: " . (file_exists($imagePath) ? 'SÍ' : 'NO') . PHP_EOL;
            echo "URL: http://127.0.0.1:8001/api/storage/equipos/images/" . $item->image . PHP_EOL;
            echo str_repeat("-", 40) . PHP_EOL;
        }
    } else {
        echo "No se encontraron equipos con imagen." . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}

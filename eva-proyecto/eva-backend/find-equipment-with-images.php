<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "BUSCANDO EQUIPOS CON IMAGEN:" . PHP_EOL;
    echo "=" . str_repeat("=", 40) . PHP_EOL;
    
    $equipment = DB::table('equipos')
        ->whereNotNull('image')
        ->where('image', '!=', '')
        ->select('id', 'name', 'image', 'marca', 'modelo')
        ->limit(5)
        ->get();
    
    if ($equipment->count() > 0) {
        foreach ($equipment as $item) {
            echo "ID: " . $item->id . PHP_EOL;
            echo "Nombre: " . $item->name . PHP_EOL;
            echo "Marca: " . ($item->marca ?? 'N/A') . PHP_EOL;
            echo "Modelo: " . ($item->modelo ?? 'N/A') . PHP_EOL;
            echo "Imagen: " . $item->image . PHP_EOL;
            
            $imagePath = storage_path('app/public/equipos/images/' . $item->image);
            echo "Archivo existe: " . (file_exists($imagePath) ? 'SÍ' : 'NO') . PHP_EOL;
            
            if (file_exists($imagePath)) {
                echo "Tamaño: " . number_format(filesize($imagePath)) . " bytes" . PHP_EOL;
            }
            
            echo "URL de prueba: http://127.0.0.1:8001/api/storage/equipos/images/" . $item->image . PHP_EOL;
            echo str_repeat("-", 50) . PHP_EOL;
        }
    } else {
        echo "No se encontraron equipos con imagen." . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}

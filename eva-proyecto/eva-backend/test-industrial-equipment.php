<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Buscando equipos industriales con imagen..." . PHP_EOL;
    
    $equipment = DB::table('equipos')
        ->whereNotNull('image')
        ->where('image', '!=', '')
        ->where('tipo_equipo', 'Industrial')
        ->select('id', 'nombre', 'image', 'marca', 'modelo')
        ->limit(5)
        ->get();
    
    if ($equipment->count() > 0) {
        echo "EQUIPOS INDUSTRIALES CON IMAGEN ENCONTRADOS:" . PHP_EOL;
        echo "=" . str_repeat("=", 50) . PHP_EOL;
        
        foreach ($equipment as $item) {
            echo "ID: " . $item->id . PHP_EOL;
            echo "Nombre: " . $item->nombre . PHP_EOL;
            echo "Marca: " . ($item->marca ?? 'N/A') . PHP_EOL;
            echo "Modelo: " . ($item->modelo ?? 'N/A') . PHP_EOL;
            echo "Imagen: " . $item->image . PHP_EOL;
            
            $imagePath = storage_path('app/public/equipos/images/' . $item->image);
            echo "Archivo existe: " . (file_exists($imagePath) ? 'SÍ' : 'NO') . PHP_EOL;
            
            if (file_exists($imagePath)) {
                echo "Tamaño: " . number_format(filesize($imagePath)) . ' bytes' . PHP_EOL;
                echo "Tipo MIME: " . mime_content_type($imagePath) . PHP_EOL;
            }
            
            echo "URL de prueba: http://127.0.0.1:8001/api/storage/equipos/images/" . $item->image . PHP_EOL;
            echo str_repeat("-", 50) . PHP_EOL;
        }
    } else {
        echo "No se encontraron equipos industriales con imagen." . PHP_EOL;
        
        // Buscar cualquier equipo con imagen
        echo "Buscando cualquier equipo con imagen..." . PHP_EOL;
        $anyEquipment = DB::table('equipos')
            ->whereNotNull('image')
            ->where('image', '!=', '')
            ->select('id', 'nombre', 'image', 'tipo_equipo')
            ->limit(3)
            ->get();
            
        foreach ($anyEquipment as $item) {
            echo "ID: " . $item->id . " | Tipo: " . $item->tipo_equipo . " | Imagen: " . $item->image . PHP_EOL;
        }
    }
    
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}

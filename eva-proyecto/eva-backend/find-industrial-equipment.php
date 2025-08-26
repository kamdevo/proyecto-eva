<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "VERIFICANDO TIPOS DE EQUIPOS:" . PHP_EOL;
    
    // Primero veamos qué tipos de equipos hay
    $tipos = DB::table('equipos')
        ->select('tipo_id')
        ->distinct()
        ->whereNotNull('tipo_id')
        ->get();
    
    echo "Tipos de equipos encontrados (por tipo_id):" . PHP_EOL;
    foreach ($tipos as $tipo) {
        $count = DB::table('equipos')->where('tipo_id', $tipo->tipo_id)->count();
        echo "- Tipo ID: " . $tipo->tipo_id . " (" . $count . " equipos)" . PHP_EOL;
    }
    
    echo PHP_EOL . "BUSCANDO EQUIPOS INDUSTRIALES CON IMAGEN:" . PHP_EOL;
    echo "=" . str_repeat("=", 50) . PHP_EOL;
    
    // Buscar por diferentes criterios posibles
    $searches = [
        "tipo_id = 2" => "Tipo ID 2 (posible Industrial)",
        "name LIKE '%industrial%'" => "Nombre contiene 'industrial'",
        "descripcion LIKE '%industrial%'" => "Descripción contiene 'industrial'"
    ];
    
    foreach ($searches as $condition => $description) {
        echo PHP_EOL . "Buscando: " . $description . PHP_EOL;
        
        $equipment = DB::table('equipos')
            ->whereRaw($condition)
            ->whereNotNull('image')
            ->where('image', '!=', '')
            ->select('id', 'name', 'image', 'marca', 'modelo', 'tipo_id')
            ->limit(3)
            ->get();
        
        if ($equipment->count() > 0) {
            foreach ($equipment as $item) {
                echo "  ID: " . $item->id . " | " . $item->name . " | Imagen: " . $item->image . PHP_EOL;
                echo "  URL: http://127.0.0.1:8001/api/storage/equipos/images/" . $item->image . PHP_EOL;
            }
        } else {
            echo "  No se encontraron equipos." . PHP_EOL;
        }
    }
    
    // También buscar cualquier equipo que tenga imagen
    echo PHP_EOL . "EQUIPOS CON IMAGEN (cualquier tipo):" . PHP_EOL;
    $anyEquipment = DB::table('equipos')
        ->whereNotNull('image')
        ->where('image', '!=', '')
        ->select('id', 'name', 'image', 'tipo_id')
        ->limit(5)
        ->get();
    
    foreach ($anyEquipment as $item) {
        echo "ID: " . $item->id . " | Tipo: " . $item->tipo_id . " | " . $item->name . " | " . $item->image . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}

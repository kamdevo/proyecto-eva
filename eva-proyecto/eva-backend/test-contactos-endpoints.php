<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "PRUEBA DE ENDPOINTS DE CONTACTOS\n";
echo "========================================\n\n";

try {
    // 1. Probar consulta de contactos con JOIN
    echo "1️⃣  Query de contactos con JOIN:\n";
    $query = DB::table('contacto')
        ->leftJoin('tcontacto', 'contacto.tcontacto_id', '=', 'tcontacto.id')
        ->select([
            'contacto.id',
            'contacto.name',
            'contacto.email',
            'contacto.telefono',
            'contacto.tcontacto_id',
            'contacto.status',
            'tcontacto.description as tipo_nombre'
        ])
        ->where('contacto.status', 1);

    $contactos = $query->orderBy('contacto.name')->get();
    echo "Total contactos: " . $contactos->count() . "\n";
    
    if ($contactos->count() > 0) {
        echo "Ejemplo de contacto:\n";
        $first = $contactos->first();
        echo "  ID: {$first->id}\n";
        echo "  Nombre: {$first->name}\n";
        echo "  Email: {$first->email}\n";
        echo "  Teléfono: {$first->telefono}\n";
        echo "  Tipo: {$first->tipo_nombre}\n";
    }
    
    echo "\n";
    
    // 2. Probar tabla tcontacto
    echo "2️⃣  Tipos de contacto:\n";
    $tipos = DB::table('tcontacto')
        ->where('status', 1)
        ->orderBy('description')
        ->get(['id', 'description as name']);
    
    echo "Total tipos: " . $tipos->count() . "\n";
    foreach ($tipos as $tipo) {
        echo "  - {$tipo->id}: {$tipo->name}\n";
    }
    
    echo "\n";
    
    // 3. Verificar estructura de tabla tcontacto
    echo "3️⃣  Verificando tabla tcontacto:\n";
    $tipoColumns = DB::select('SHOW COLUMNS FROM tcontacto');
    echo "Columnas:\n";
    foreach ($tipoColumns as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    
} catch (\Exception $e) {
    echo "\n❌ ERROR:\n";
    echo $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n========================================\n";

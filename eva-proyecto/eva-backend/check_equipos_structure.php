<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Estructura completa de la tabla equipos:\n";
echo "========================================\n";

$columns = DB::select('DESCRIBE equipos');
foreach ($columns as $column) {
    echo "{$column->Field}: {$column->Type} (Null: {$column->Null}, Default: {$column->Default})\n";
}

<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check for duplicate codes
$duplicates = DB::table('equipos')
    ->select('code', DB::raw('COUNT(*) as total'))
    ->where('status', 1)
    ->groupBy('code')
    ->having('total', '>', 1)
    ->orderBy('total', 'desc')
    ->limit(5)
    ->get();

echo "=== CODIGOS DUPLICADOS ===" . PHP_EOL;
foreach ($duplicates as $d) {
    echo "code='{$d->code}': {$d->total} registros" . PHP_EOL;
}

// Check if there's a unique index on code in the DB
$indexes = DB::select("SHOW INDEX FROM equipos WHERE Column_name = 'code'");
echo PHP_EOL . "=== INDICES EN COLUMNA code ===" . PHP_EOL;
if (empty($indexes)) {
    echo "Sin indices en columna 'code'" . PHP_EOL;
} else {
    foreach ($indexes as $idx) {
        echo "Index: {$idx->Key_name}, Non_unique: {$idx->Non_unique}" . PHP_EOL;
    }
}

<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== COLUMNS in calibracion_ind ===\n";
$cols = DB::getSchemaBuilder()->getColumnListing('calibracion_ind');
echo implode(', ', $cols) . "\n\n";

echo "=== Sample rows ===\n";
$rows = DB::table('calibracion_ind')->whereNotNull('file')->orderByDesc('id')->limit(3)->get();
foreach ($rows as $r) {
    echo json_encode($r, JSON_PRETTY_PRINT) . "\n---\n";
}

echo "\n=== calibracion (biomedica) columns ===\n";
$cols2 = DB::getSchemaBuilder()->getColumnListing('calibracion');
echo implode(', ', $cols2) . "\n";

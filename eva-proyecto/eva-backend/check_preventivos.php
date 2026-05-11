<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check mantenimiento table columns
echo "=== COLUMNS in mantenimiento table ===\n";
$cols = DB::getSchemaBuilder()->getColumnListing('mantenimiento');
echo implode(', ', $cols) . "\n\n";

// Check a sample row
echo "=== Sample preventivo rows ===\n";
$rows = DB::table('mantenimiento')->orderByDesc('id')->limit(3)->get();
foreach ($rows as $r) {
    echo json_encode($r, JSON_PRETTY_PRINT) . "\n---\n";
}

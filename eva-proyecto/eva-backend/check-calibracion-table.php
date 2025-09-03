<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING CALIBRACION TABLE ===\n\n";

try {
    echo "1. Table structure:\n";
    $columns = DB::select('DESCRIBE calibracion');
    foreach($columns as $col) {
        echo "  - {$col->Field} ({$col->Type})\n";
    }
    
    echo "\n2. Sample record:\n";
    $sample = DB::table('calibracion')->first();
    if ($sample) {
        foreach($sample as $key => $value) {
            echo "  - {$key}: " . (is_null($value) ? 'NULL' : $value) . "\n";
        }
    } else {
        echo "  No records found\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== CHECK COMPLETED ===\n";

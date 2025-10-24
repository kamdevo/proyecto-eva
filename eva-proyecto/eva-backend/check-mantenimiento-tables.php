<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select('SHOW TABLES');
$dbName = DB::getDatabaseName();

echo "\nTablas relacionadas con MANTENIMIENTO:\n";
echo "========================================\n";

foreach ($tables as $table) {
    $tableName = $table->{"Tables_in_$dbName"};
    if (stripos($tableName, 'manten') !== false || 
        stripos($tableName, 'preventiv') !== false ||
        stripos($tableName, 'calibr') !== false ||
        stripos($tableName, 'orden') !== false) {
        echo "✅ $tableName\n";
    }
}
echo "\n";

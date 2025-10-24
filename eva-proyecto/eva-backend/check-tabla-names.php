<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select('SHOW TABLES');
$dbName = DB::getDatabaseName();

echo "\nBuscando tablas relacionadas:\n";
echo "========================================\n";

foreach ($tables as $table) {
    $tableName = $table->{"Tables_in_$dbName"};
    if (stripos($tableName, 'fuente') !== false || 
        stripos($tableName, 'tecnologia') !== false ||
        stripos($tableName, 'cbio') !== false ||
        stripos($tableName, 'tadq') !== false ||
        stripos($tableName, 'adquis') !== false) {
        echo "✅ $tableName\n";
    }
}
echo "\n";

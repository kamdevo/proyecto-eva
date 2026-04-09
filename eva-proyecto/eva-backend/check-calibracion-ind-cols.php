<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$cols = DB::select('SHOW COLUMNS FROM calibracion_ind');
foreach ($cols as $c) {
    echo $c->Field . ' | ' . $c->Type . PHP_EOL;
}

echo "\n--- Sample rows ---\n";
$rows = DB::table('calibracion_ind')->limit(3)->get();
foreach ($rows as $row) {
    print_r($row);
}

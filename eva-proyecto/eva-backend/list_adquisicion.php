<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$types = DB::table('tadquisicion')->get(['id', 'name']);
foreach ($types as $type) {
    echo "ID: {$type->id} - Name: {$type->name}\n";
}

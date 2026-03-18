<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

$tableName = 'tipos_mantenimientos';

Schema::table($tableName, function (Blueprint $table) {
    if (!Schema::hasColumn('tipos_mantenimientos', 'descripcion')) {
        $table->text('descripcion')->nullable();
    }
    if (!Schema::hasColumn('tipos_mantenimientos', 'frecuencia')) {
        $table->string('frecuencia')->nullable();
    }
    if (!Schema::hasColumn('tipos_mantenimientos', 'estado')) {
        $table->string('estado')->default('Activo');
    }
    if (!Schema::hasColumn('tipos_mantenimientos', 'ultimaActualizacion')) {
        $table->date('ultimaActualizacion')->nullable();
    }
});

echo "Table updated successfully.\n";

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bajas', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_baja')->nullable();
            $table->text('archivo')->nullable();
            $table->text('descripcion')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bajas');
    }
};

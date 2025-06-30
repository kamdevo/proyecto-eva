<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calibracion_ind', function (Blueprint $table) {
            $table->id();
            $table->string('description', 100)->nullable();
            $table->datetime('created_at')->nullable();
            $table->integer('status')->default(1);
            $table->integer('equipo_id')->nullable();
            $table->string('file', 200)->nullable();
            $table->date('fecha_calibracion')->nullable();
            $table->date('fecha_programada')->nullable();
            
            $table->index('equipo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calibracion_ind');
    }
};

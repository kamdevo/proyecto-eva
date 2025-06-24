<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correctivos_generales_ind', function (Blueprint $table) {
            $table->id();
            $table->datetime('created_at')->nullable();
            $table->integer('status')->default(1);
            $table->integer('equipo_id')->nullable();
            $table->string('file', 200)->nullable();
            $table->string('file_orden', 100)->nullable();
            $table->text('orden')->nullable();
            $table->text('fecha_inicio')->nullable();
            $table->string('code_orden', 100)->nullable();
            $table->text('diagnostico')->nullable();
            $table->string('code_diagnostico', 100)->nullable();
            $table->text('fecha_diagnostico')->nullable();
            $table->text('description')->nullable();
            $table->string('code', 100)->nullable();
            $table->text('fecha_mantenimiento')->nullable();
            $table->string('repuesto_pendiente', 10)->default('no')->nullable();
            $table->string('repuesto_id', 100)->nullable();
            $table->integer('cierre_id')->default(14)->nullable();
            
            $table->index('equipo_id');
            $table->index('cierre_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correctivos_generales_ind');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contingencias', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->nullable();
            $table->text('observacion')->nullable();
            $table->string('file', 100)->nullable();
            $table->datetime('created_at')->useCurrent();
            $table->integer('equipo_id');
            $table->integer('usuario_id');
            $table->integer('estado_id')->default(1);
            $table->date('fecha_cierre')->nullable();
            $table->enum('estado', ['Activa', 'En Proceso', 'Resuelta', 'Cancelada'])->default('Activa');
            $table->integer('usuario_asignado')->unsigned()->nullable();
            $table->timestamp('fecha_asignacion')->nullable();
            $table->timestamp('fecha_resolucion')->nullable();
            $table->integer('tiempo_resolucion')->nullable();
            $table->decimal('costo_estimado', 10, 2)->nullable();
            $table->decimal('costo_real', 10, 2)->nullable();
            $table->string('archivo_evidencia', 191)->nullable();
            $table->enum('impacto', ['Bajo', 'Medio', 'Alto', 'Crítico'])->default('Medio');
            $table->string('categoria', 100)->nullable();
            
            $table->index('equipo_id');
            $table->index('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contingencias');
    }
};

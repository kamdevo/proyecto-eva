<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 255);
            $table->text('descripcion');
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('estado', ['abierto', 'en_proceso', 'resuelto', 'cerrado'])->default('abierto');
            $table->bigInteger('usuario_id')->unsigned();
            $table->bigInteger('asignado_a')->unsigned()->nullable();
            $table->bigInteger('equipo_id')->unsigned()->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('fecha_resolucion')->nullable();
            $table->text('comentarios')->nullable();
            $table->string('archivo_adjunto', 255)->nullable();
            
            $table->index('usuario_id');
            $table->index('asignado_a');
            $table->index('equipo_id');
            $table->index('estado');
            $table->index('prioridad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

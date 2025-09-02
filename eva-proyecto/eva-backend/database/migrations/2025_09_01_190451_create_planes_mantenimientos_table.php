<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('planes_mantenimientos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipo_id');
            $table->string('tipo_mantenimiento');
            $table->text('descripcion');
            $table->date('fecha_programada');
            $table->date('fecha_mantenimiento')->nullable();
            $table->string('responsable');
            $table->enum('estado', ['programado', 'en_progreso', 'completado', 'cancelado', 'reprogramado'])->default('programado');
            $table->text('observaciones')->nullable();
            $table->decimal('costo_estimado', 10, 2)->nullable();
            $table->text('repuestos_necesarios')->nullable();
            $table->integer('frecuencia_dias')->nullable();
            $table->timestamps();
            
            $table->foreign('equipo_id')->references('id')->on('equipos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planes_mantenimientos');
    }
};

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
        if (!Schema::hasTable('capacitaciones')) {
            Schema::create('capacitaciones', function (Blueprint $table) {
                $table->id();
                $table->string('titulo');
                $table->text('descripcion');
                $table->enum('tipo', ['induccion', 'actualizacion', 'especializacion', 'certificacion']);
                $table->enum('modalidad', ['presencial', 'virtual', 'mixta']);
                $table->datetime('fecha_inicio');
                $table->datetime('fecha_fin');
                $table->integer('duracion_horas');
                $table->unsignedBigInteger('instructor_id');
                $table->string('lugar')->nullable();
                $table->integer('capacidad_maxima')->nullable();
                $table->decimal('costo', 10, 2)->nullable();
                $table->boolean('certificacion')->default(false);
                $table->enum('estado', ['programada', 'en_curso', 'completada', 'cancelada'])->default('programada');
                $table->string('material_curso')->nullable();
                $table->string('tema')->nullable();
                $table->text('objetivos')->nullable();
                $table->text('requisitos')->nullable();
                $table->text('observaciones_finales')->nullable();
                $table->timestamps();

                // Claves foráneas
                $table->foreign('instructor_id')->references('id')->on('usuarios')->onDelete('cascade');
                
                $table->index(['fecha_inicio', 'fecha_fin']);
                $table->index(['estado']);
                $table->index(['tipo']);
            });
        }

        // Tabla pivot para participantes
        if (!Schema::hasTable('capacitacion_participantes')) {
            Schema::create('capacitacion_participantes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('capacitacion_id');
                $table->unsignedBigInteger('usuario_id');
                $table->timestamp('fecha_inscripcion');
                $table->boolean('asistio')->default(false);
                $table->decimal('calificacion', 5, 2)->nullable();
                $table->boolean('aprobado')->default(false);
                $table->timestamps();

                $table->foreign('capacitacion_id')->references('id')->on('capacitaciones')->onDelete('cascade');
                $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
                
                $table->unique(['capacitacion_id', 'usuario_id']);
            });
        }

        // Tabla para evaluaciones
        if (!Schema::hasTable('capacitacion_evaluaciones')) {
            Schema::create('capacitacion_evaluaciones', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('capacitacion_id');
                $table->unsignedBigInteger('usuario_id');
                $table->decimal('calificacion', 5, 2);
                $table->boolean('asistio');
                $table->boolean('aprobado');
                $table->text('observaciones')->nullable();
                $table->timestamps();

                $table->foreign('capacitacion_id')->references('id')->on('capacitaciones')->onDelete('cascade');
                $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
                
                $table->unique(['capacitacion_id', 'usuario_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capacitacion_evaluaciones');
        Schema::dropIfExists('capacitacion_participantes');
        Schema::dropIfExists('capacitaciones');
    }
};

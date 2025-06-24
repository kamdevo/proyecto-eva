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
        if (!Schema::hasTable('tickets')) {
            Schema::create('tickets', function (Blueprint $table) {
                $table->id();
                $table->string('numero_ticket', 50)->unique();
                $table->string('titulo');
                $table->text('descripcion');
                $table->enum('categoria', ['soporte_tecnico', 'mantenimiento', 'calibracion', 'capacitacion', 'otro']);
                $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente']);
                $table->enum('estado', ['abierto', 'en_proceso', 'pendiente', 'resuelto', 'cerrado']);
                $table->unsignedBigInteger('equipo_id')->nullable();
                $table->unsignedBigInteger('usuario_creador');
                $table->unsignedBigInteger('usuario_asignado')->nullable();
                $table->timestamp('fecha_creacion');
                $table->date('fecha_limite')->nullable();
                $table->timestamp('fecha_asignacion')->nullable();
                $table->timestamp('fecha_cierre')->nullable();
                $table->text('solucion')->nullable();
                $table->text('comentarios_cierre')->nullable();
                $table->integer('satisfaccion')->nullable()->comment('1-5 estrellas');
                $table->string('archivo_adjunto')->nullable();
                $table->boolean('escalado')->default(false);
                $table->timestamp('fecha_escalacion')->nullable();
                $table->timestamps();

                // Índices y claves foráneas
                $table->foreign('equipo_id')->references('id')->on('equipos')->onDelete('set null');
                $table->foreign('usuario_creador')->references('id')->on('usuarios')->onDelete('cascade');
                $table->foreign('usuario_asignado')->references('id')->on('usuarios')->onDelete('set null');
                
                $table->index(['estado', 'prioridad']);
                $table->index(['fecha_creacion']);
                $table->index(['usuario_asignado', 'estado']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

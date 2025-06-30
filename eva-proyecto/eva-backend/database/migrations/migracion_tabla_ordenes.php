<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordenes', function (Blueprint $table) {
            $table->id();
            $table->string('numero_orden', 100)->unique();
            $table->integer('equipo_id');
            $table->integer('usuario_solicitante_id');
            $table->integer('usuario_asignado_id')->nullable();
            $table->enum('tipo_orden', ['preventivo', 'correctivo', 'calibracion', 'verificacion']);
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('estado', ['pendiente', 'en_proceso', 'completada', 'cancelada'])->default('pendiente');
            $table->text('descripcion_problema')->nullable();
            $table->text('descripcion_trabajo')->nullable();
            $table->date('fecha_solicitud');
            $table->date('fecha_programada')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_finalizacion')->nullable();
            $table->integer('tiempo_estimado')->nullable(); // en minutos
            $table->integer('tiempo_real')->nullable(); // en minutos
            $table->decimal('costo_estimado', 10, 2)->nullable();
            $table->decimal('costo_real', 10, 2)->nullable();
            $table->text('repuestos_utilizados')->nullable();
            $table->text('observaciones')->nullable();
            $table->string('archivo_evidencia', 255)->nullable();
            $table->integer('proveedor_id')->nullable();
            $table->integer('tecnico_id')->nullable();
            $table->text('firma_responsable')->nullable();
            $table->text('firma_usuario')->nullable();
            $table->datetime('created_at')->useCurrent();
            $table->datetime('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->index('equipo_id');
            $table->index('usuario_solicitante_id');
            $table->index('usuario_asignado_id');
            $table->index('tipo_orden');
            $table->index('estado');
            $table->index('prioridad');
            $table->index('fecha_programada');
            $table->index('proveedor_id');
            $table->index('tecnico_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordenes');
    }
};

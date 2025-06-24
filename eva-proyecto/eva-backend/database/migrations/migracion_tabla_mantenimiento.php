<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mantenimiento', function (Blueprint $table) {
            $table->id();
            $table->string('description', 100)->nullable();
            $table->datetime('created_at')->nullable();
            $table->integer('status')->default(1);
            $table->integer('equipo_id')->nullable();
            $table->string('file', 200)->nullable();
            $table->date('fecha_mantenimiento')->nullable();
            $table->date('fecha_programada')->nullable();
            $table->string('repuesto_pendiente', 10)->default('no')->nullable();
            $table->string('repuesto_id', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->integer('proveedor_mantenimiento_id');
            $table->integer('tecnico_id')->unsigned()->nullable();
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->integer('tiempo_estimado')->nullable();
            $table->integer('tiempo_real')->nullable();
            $table->text('repuestos_utilizados')->nullable();
            $table->string('file_reporte', 191)->nullable();
            $table->text('motivo_cancelacion')->nullable();
            $table->timestamp('fecha_cancelacion')->nullable();
            
            $table->index('equipo_id');
            $table->index('proveedor_mantenimiento_id');
            $table->index('tecnico_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mantenimiento');
    }
};

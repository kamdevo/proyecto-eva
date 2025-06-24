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
        Schema::table('mantenimiento', function (Blueprint $table) {
            // Agregar campos faltantes identificados en las pruebas
            if (!Schema::hasColumn('mantenimiento', 'tecnico_id')) {
                $table->unsignedInteger('tecnico_id')->nullable();
                // Foreign key será agregada manualmente si es necesario
            }
            
            if (!Schema::hasColumn('mantenimiento', 'prioridad')) {
                $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            }
            
            if (!Schema::hasColumn('mantenimiento', 'tiempo_estimado')) {
                $table->integer('tiempo_estimado')->nullable()->comment('Tiempo estimado en horas');
            }

            if (!Schema::hasColumn('mantenimiento', 'tiempo_real')) {
                $table->integer('tiempo_real')->nullable()->comment('Tiempo real en horas');
            }

            if (!Schema::hasColumn('mantenimiento', 'repuestos_utilizados')) {
                $table->text('repuestos_utilizados')->nullable();
            }

            if (!Schema::hasColumn('mantenimiento', 'file_reporte')) {
                $table->string('file_reporte')->nullable();
            }

            if (!Schema::hasColumn('mantenimiento', 'motivo_cancelacion')) {
                $table->text('motivo_cancelacion')->nullable();
            }

            if (!Schema::hasColumn('mantenimiento', 'fecha_cancelacion')) {
                $table->timestamp('fecha_cancelacion')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->dropForeign(['tecnico_id']);
            $table->dropColumn([
                'tecnico_id',
                'prioridad',
                'tiempo_estimado',
                'tiempo_real',
                'repuestos_utilizados',
                'file_reporte',
                'motivo_cancelacion',
                'fecha_cancelacion'
            ]);
        });
    }
};

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
        Schema::table('contingencias', function (Blueprint $table) {
            // Agregar campos faltantes para contingencias
            if (!Schema::hasColumn('contingencias', 'estado')) {
                $table->enum('estado', ['Activa', 'En Proceso', 'Resuelta', 'Cancelada'])->default('Activa');
            }

            if (!Schema::hasColumn('contingencias', 'usuario_asignado')) {
                $table->unsignedInteger('usuario_asignado')->nullable();
                // Foreign key será agregada manualmente si es necesario
            }

            if (!Schema::hasColumn('contingencias', 'fecha_asignacion')) {
                $table->timestamp('fecha_asignacion')->nullable();
            }

            if (!Schema::hasColumn('contingencias', 'fecha_resolucion')) {
                $table->timestamp('fecha_resolucion')->nullable();
            }

            if (!Schema::hasColumn('contingencias', 'tiempo_resolucion')) {
                $table->integer('tiempo_resolucion')->nullable()->comment('Tiempo en horas');
            }

            if (!Schema::hasColumn('contingencias', 'costo_estimado')) {
                $table->decimal('costo_estimado', 10, 2)->nullable();
            }

            if (!Schema::hasColumn('contingencias', 'costo_real')) {
                $table->decimal('costo_real', 10, 2)->nullable();
            }

            if (!Schema::hasColumn('contingencias', 'archivo_evidencia')) {
                $table->string('archivo_evidencia')->nullable();
            }

            if (!Schema::hasColumn('contingencias', 'impacto')) {
                $table->enum('impacto', ['Bajo', 'Medio', 'Alto', 'Crítico'])->default('Medio');
            }

            if (!Schema::hasColumn('contingencias', 'categoria')) {
                $table->string('categoria', 100)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contingencias', function (Blueprint $table) {
            $table->dropForeign(['usuario_asignado']);
            $table->dropColumn([
                'estado',
                'usuario_asignado',
                'fecha_asignacion',
                'fecha_resolucion',
                'tiempo_resolucion',
                'costo_estimado',
                'costo_real',
                'archivo_evidencia',
                'impacto',
                'categoria'
            ]);
        });
    }
};

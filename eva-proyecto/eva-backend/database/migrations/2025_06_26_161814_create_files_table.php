<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración para tabla files
 * 
 * Crea la estructura de la tabla files con campos
 * empresariales estándar y optimizaciones de rendimiento.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('nombre')->nullable();
            $table->text('descripcion')->nullable();
            $table->string('codigo')->nullable()->unique();
            $table->boolean('activo')->default(true);
            $table->string('estado')->default('activo');
            $table->string('tipo')->nullable();
            $table->decimal('valor', 10, 2)->nullable();
            $table->date('fecha')->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->onDelete('set null');
            $table->timestamps();
            
            // Índices para optimización
            $table->index(['activo', 'estado']);
            $table->index(['tipo']);
            $table->index(['fecha']);
            $table->index(['usuario_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};

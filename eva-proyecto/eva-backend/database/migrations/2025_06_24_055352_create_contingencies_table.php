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
        Schema::create('contingencies', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título de la contingencia
            $table->text('description'); // Descripción
            $table->enum('severity', ['baja', 'media', 'alta', 'critica'])->default('media');
            $table->enum('status', ['activa', 'resuelta', 'en_proceso'])->default('activa');
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('fecha_reporte')->useCurrent();
            $table->timestamp('fecha_resolucion')->nullable();
            $table->text('acciones_tomadas')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contingencies');
    }
};

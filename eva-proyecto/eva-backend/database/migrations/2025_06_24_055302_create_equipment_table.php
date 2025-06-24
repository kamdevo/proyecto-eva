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
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Código del equipo
            $table->string('name'); // Nombre del equipo
            $table->string('brand')->nullable(); // Marca
            $table->string('model')->nullable(); // Modelo
            $table->string('series')->nullable(); // Serie
            $table->string('status')->default('Operativo'); // Estado
            $table->string('registro_sanitario')->nullable(); // Registro sanitario
            $table->string('image')->nullable(); // Imagen del equipo
            $table->text('description')->nullable(); // Descripción

            // Ubicación
            $table->foreignId('service_id')->nullable()->constrained('services')->onDelete('set null');
            $table->foreignId('area_id')->nullable()->constrained('areas')->onDelete('set null');
            $table->string('zona')->nullable();
            $table->string('sede')->nullable();
            $table->string('localizacion')->nullable();
            $table->string('hospital')->nullable();

            // Plan de mantenimiento
            $table->string('frecuencia_mantenimiento')->nullable();
            $table->date('ultimo_mantenimiento')->nullable();
            $table->date('proximo_mantenimiento')->nullable();

            // Clasificación biomédica
            $table->enum('riesgo', ['ALTO', 'MEDIO ALTO', 'MEDIO', 'BAJO'])->default('MEDIO');

            // Propietario
            $table->foreignId('owner_id')->nullable()->constrained('owners')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};

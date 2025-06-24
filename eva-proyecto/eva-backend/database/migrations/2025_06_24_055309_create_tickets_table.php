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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // Número de ticket
            $table->string('title'); // Título del ticket
            $table->text('description'); // Descripción
            $table->enum('status', ['abierto', 'en_proceso', 'cerrado', 'cancelado'])->default('abierto');
            $table->enum('priority', ['baja', 'media', 'alta', 'critica'])->default('media');
            $table->enum('type', ['correctivo', 'preventivo', 'calibracion', 'consulta'])->default('correctivo');

            // Relaciones
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Usuario que creó el ticket
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // Usuario asignado

            // Fechas
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_cierre')->nullable();
            $table->timestamp('fecha_vencimiento')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

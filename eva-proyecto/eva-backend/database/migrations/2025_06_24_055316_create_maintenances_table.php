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
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->string('maintenance_number')->unique(); // Número de mantenimiento
            $table->enum('type', ['preventivo', 'correctivo', 'calibracion']); // Tipo de mantenimiento
            $table->text('description'); // Descripción del mantenimiento
            $table->enum('status', ['programado', 'en_proceso', 'completado', 'cancelado'])->default('programado');

            // Relaciones
            $table->foreignId('equipment_id')->constrained('equipment')->onDelete('cascade');
            $table->foreignId('technician_id')->constrained('users')->onDelete('cascade'); // Técnico asignado
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->onDelete('set null'); // Ticket relacionado

            // Fechas
            $table->date('fecha_programada'); // Fecha programada
            $table->date('fecha_inicio')->nullable(); // Fecha de inicio real
            $table->date('fecha_fin')->nullable(); // Fecha de finalización

            // Detalles técnicos
            $table->text('observaciones')->nullable(); // Observaciones
            $table->text('repuestos_utilizados')->nullable(); // Repuestos utilizados
            $table->decimal('costo', 10, 2)->nullable(); // Costo del mantenimiento
            $table->integer('tiempo_estimado')->nullable(); // Tiempo estimado en horas
            $table->integer('tiempo_real')->nullable(); // Tiempo real en horas

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};

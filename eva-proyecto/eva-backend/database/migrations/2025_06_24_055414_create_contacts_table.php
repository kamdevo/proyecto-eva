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
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del contacto
            $table->string('email')->nullable(); // Email
            $table->string('phone')->nullable(); // Teléfono
            $table->string('position')->nullable(); // Cargo
            $table->string('company')->nullable(); // Empresa
            $table->text('address')->nullable(); // Dirección
            $table->text('notes')->nullable(); // Notas adicionales
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};

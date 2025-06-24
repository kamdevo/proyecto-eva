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
        Schema::create('user_zone_relations', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_zona'); // Nombre de la zona
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('correo_electronico')->nullable(); // Email específico para esta relación
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índice único para evitar duplicados
            $table->unique(['nombre_zona', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_zone_relations');
    }
};

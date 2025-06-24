<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acciones', function (Blueprint $table) {
            $table->id();
            $table->integer('usuario_id')->nullable();
            $table->integer('modulo_id')->nullable();
            $table->boolean('leer')->default(true)->nullable();
            $table->boolean('insertar')->default(true)->nullable();
            $table->boolean('editar')->default(true)->nullable();
            $table->boolean('eliminar')->default(true)->nullable();
            
            $table->index('usuario_id');
            $table->index('modulo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acciones');
    }
};
